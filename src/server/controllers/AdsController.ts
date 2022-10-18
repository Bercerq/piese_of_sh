const fetch = require('node-fetch');
import { RequestHandler } from "express";
import ApiController from "./ApiController";
import Constants from "../../modules/Constants";
import { NOAX } from "../api/NOAX";
import { Ad, LocalBannerData } from "../../models/data/Ads";
import * as config from "../../../config";
import * as _ from "lodash";
import * as path from "path";
import * as fs from "fs-extra";
import FormData from "form-data";
import admZip from "adm-zip";
import rimraf from "rimraf";
const sizeOf = require('image-size');
import { v4 as uuidv4 } from "uuid";
import mkdirp from "mkdirp";
import multer from "multer";
const storage = multer.memoryStorage();
const upload = multer({ storage });

export default class AdsController extends ApiController {

  constructor(protected API: NOAX) {
    super(API);
    this.router.get("/adqueue", this.getAdqueue);
    this.router.get("/adqueue-count", this.getAdqueueCount);
    this.router.post("/file-exists", this.fileExists);
    this.router.post("/banner-session", this.bannerSession);
    this.router.get("/banner-preview", this.bannerPreview);
    this.router.post("/local-banners", upload.array('files'), this.localBanners);
    this.router.post("/local-video", this.localVideo);
    this.router.post("/delete-dirs", this.deleteDirs);
    this.router.get("/preview/:advertiserId/ad/:id", this.getPreview);
    this.router.get("/preview/:advertiserId/ad/:id/campaign/:campaignId", this.getPreview);
    this.router.get("/preview/:advertiserId/ad/:id/campaign/:campaignId/branch/:branchId", this.getPreview);
    this.router.get("/preview/:advertiserId/ad/:id/campaign/:campaignId/branch/:branchId/campaignbanner/:campaignBannerId", 
    this.getPreview);
    this.router.get("/preview/:advertiserId/ad/:id/datafeed/:datafeedId", this.getPreview);
    this.router.get("/preview/:advertiserId/ad/:id/campaign/:campaignId/campaignbanner/:campaignBannerId", this.getPreview);
    this.router.get("/previewRetail/:advertiserId/ad/:id/branch/:branchId", this.getPreview);
    this.router.get("", this.getAll);
    this.router.get("/:id", this.get);
    this.router.put("/:id", this.put);
    this.router.post("/:id", this.delete);
    this.router.post("/", this.create);
    this.router.delete("/delete-inactive", this.deleteInactive);
  }

  getAll: RequestHandler = async (req, res) => {
    try {
      const credentials = this.getCredentials(req);
      const options = _.assign({}, req.query, { limit: Constants.MAX_API_LIMIT });
      const ads = await this.API.getAds(credentials, options);
      res.json(ads);
    } catch (err) {
      console.log(err);
      res.status(500).json(err);
    }
  }

  get: RequestHandler = async (req, res) => {
    try {
      const credentials = this.getCredentials(req);
      const options = { id: parseInt(req.params.id, 10) };
      const ad = await this.API.getAd(credentials, options);
      res.json(ad);
    } catch (err) {
      console.log(err);
      res.status(500).json(err);
    }
  }

  put: RequestHandler = async (req, res) => {
    try {
      const credentials = this.getCredentials(req);
      const id = parseInt(req.params.id, 10);
      const advertiserId = req.body.advertiserId;
      const data = req.body.data as Partial<Ad>;

      await this.API.updateAd(credentials, { id, advertiserId, data });
      res.json({ msg: "ok" });
    } catch (err) {
      res.status(500).json(err);
    }
  }

  delete: RequestHandler = async (req, res) => {
    try {
      const credentials = this.getCredentials(req);
      const id = parseInt(req.params.id, 10);
      const advertiserId = req.body.advertiserId;
      await this.API.deleteAd(credentials, { id, advertiserId });
      res.json({ msg: "ok" });
    } catch (err) {
      res.status(500).json(err);
    }
  }

  deleteInactive: RequestHandler = async (req, res) => {
    try {
      const credentials = this.getCredentials(req);
      const options = _.assign({}, req.query, { limit: Constants.MAX_API_LIMIT });
      const ads = await this.API.getAds(credentials, options);
      const inactiveAds = ads.filter((o) => { return o.active === 0 });
      const deletePromises = inactiveAds.map((o) => {
        return this.API.deleteAd(credentials, { id: o.id, advertiserId: o.advertiserId });
      });
      await Promise.all(deletePromises);
      res.json({ msg: "ok" });
    } catch (err) {
      console.log(err);
      res.status(500).json(err);
    }
  }

  create: RequestHandler = async (req, res) => {
    try {
      const credentials = this.getCredentials(req);
      const ads = req.body.ads || [];
      const advertiserId = parseInt(req.body.advertiserId as string, 10);
      if (ads.length > 0) {
        const data = getAdsFormData(ads);
        const rslt = await this.API.createAds(credentials, { advertiserId, data });
        const erroredAds = getErroredAds(rslt);
        try {
          const filesToDelete = getFilesToDelete(ads);
          await deleteFiles(filesToDelete);
        } catch (err) {
          console.log("Error deleting ads files after save: ", err);
        }
        res.json(erroredAds);
      } else {
        res.json([]);
      }
    } catch (err) {
      console.log(err);
      res.status(500).json(err);
    }
  }

  getPreview: RequestHandler = async (req, res) => {
    try {
      const credentials = this.getCredentials(req);
      let options = { advertiserId: parseInt(req.params.advertiserId, 10), id: parseInt(req.params.id, 10) }
      if (req.params?.campaignId) {
        options = _.assign(options, { campaignId: parseInt(req.params.campaignId, 10) });
      }
      if (req.params?.branchId) {
        options = _.assign(options, { branchId: parseInt(req.params.branchId, 10) });
      }
      if (req.params?.campaignBannerId) {
        options = _.assign(options, { campaignBannerId: parseInt(req.params.campaignBannerId, 10) });
      }
      if (req.params?.datafeedId) {
        options = _.assign(options, { datafeedId: parseInt(req.params.datafeedId, 10) });
      }
      let  dataFeedOptions = {}
      dataFeedOptions = _.assign(dataFeedOptions, req.query);
      options = _.assign(options, {dataFeedOptions: dataFeedOptions});

      const preview = await this.API.getAdPreview(credentials, options);

      await preview;
      console.log(preview);
      res.json(preview)
    } catch (err) {
      console.log(err);
      res.status(500).json(err);
    }

  }

  getAdqueue: RequestHandler = async (req, res) => {
    try {
      const credentials = this.getCredentials(req);
      const adqueue = await this.API.getAdqueue(credentials);
      res.json(adqueue);
    } catch (err) {
      console.log(err);
      res.status(500).json(err);
    }
  }

  getAdqueueCount: RequestHandler = async (req, res) => {
    try {
      const credentials = this.getCredentials(req);
      const adqueue = await this.API.getAdqueue(credentials);
      res.json({ count: adqueue.length });
    } catch (err) {
      console.log(err);
      res.status(500).json(err);
    }
  }

  fileExists: RequestHandler = async (req, res) => {
    const url = req.body.url;
    const response = await fetch(url, { method: 'GET' });
    if (response.ok) {
      res.json({ fileExists: true });
    } else {
      if (response.status === 404) {
        res.json({ fileExists: false });
      } else {
        res.status(500).json("Internal server error");
      }
    }
  }

  //save banner html to session to be served by bannerpreview
  bannerSession: RequestHandler = (req, res) => {
    (req.session as any).bannerHtml = `<!DOCTYPE html><html><body style="margin:0;padding:0">${req.body.tag}</body></html>`;
    res.json({ msg: "OK" });
  }

  //route used to serve the banners to the iframe
  bannerPreview: RequestHandler = (req, res) => {
    const html = (req.session as any).bannerHtml;
    res.send(html);
  }

  deleteDirs: RequestHandler = async (req, res) => {
    const toDelete = req.body.toDelete || [];
    const toDeleteP = toDelete.map((dir) => {
      return new Promise<void>((resolve, reject) => {
        rimraf(dir, function (err) {
          if (err) {
            reject(err);
          } else {
            resolve();
          }
        });
      });
    });

    try {
      await Promise.all(toDeleteP);
      res.json({ msg: "ok" });
    } catch (err) {
      console.log("err", err);
      res.status(500).json("Failed to delete banner files: " + err);
    }
  }

  localBanners: RequestHandler = (req, res) => {
    const files = req.files;
    const keys = req.body.keys;
    const paths = req.body.paths;
    const groupedFiles = groupFiles(files, keys, paths);
    createUploadFolders(groupedFiles, files.length, function (uploadIds) {
      const dirs = uploadIds.map((uploadId) => { return path.join(Constants.LOCAL_BANNERS_DIR, uploadId); });
      let data: LocalBannerData = { banners: [], invalid: [], zip: [], toDelete: dirs };
      if (dirs.length > 0) {
        dirs.forEach((dir) => {
          handleDirEntries(dir, data);
        });
      }
      res.json(data);
    });
  }

  localVideo: RequestHandler = (req, res) => {
    let fstream;
    req.pipe(req.busboy);
    let videoObj: any = {};
    req.busboy.on('field', function (fieldname, val) {
      if (fieldname === 'thirdPartyImpressions' || fieldname === 'thirdPartyClicks' || fieldname === 'thirdPartyTracking') {
        if (val == "") videoObj[fieldname] = [];
        else videoObj[fieldname] = val.split(',');
      } else {
        videoObj[fieldname] = val;
      }
    });

    req.busboy.on('file', async (fieldname, file, filename) => {
      try {
        await mkdirp(Constants.LOCAL_VIDEOS_DIR);
        const fileUUID = uuidv4();
        fstream = fs.createWriteStream(`${Constants.LOCAL_VIDEOS_DIR}${fileUUID}-${filename}`);
        file.pipe(fstream);
        fstream.on('close', () => {
          videoObj.filename = filename;
          videoObj.uuid = fileUUID;
          res.json(videoObj);
        });
      } catch (err) {
        console.log("err", err);
        return res.status(500).json({
          message: 'Error while creating directory to write zip file. Description:' + err
        });
      }
    });
  }
}

function groupFiles(files, keys, paths) {
  const objects = files.map((f, i) => {
    return {
      file: f,
      path: paths[i],
      key: keys[i]
    }
  });
  return _.groupBy(objects, 'key');
}

function createUploadFolders(groupedFiles, filesLength, cb) {
  let counter = filesLength;
  const uploadIds = [];
  _.forEach(groupedFiles, (group, key) => {
    const uploadId = uuidv4();
    uploadIds.push(uploadId);
    _.forEach(group, async function (f) {
      const fileDir = buildPath(uploadId, f.path);
      try {
        await mkdirp(fileDir);
        fs.writeFileSync(path.join(fileDir, f.file.originalname), f.file.buffer, "utf8");
        counter--;
        if (counter === 0) {
          cb(uploadIds);
        }
      } catch (err) {
        console.log(err);
        counter--;
        if (counter === 0) {
          cb(uploadIds);
        }
      }
    });
  });
}

function buildPath(uploadId, filePath) {
  let dirs = [Constants.LOCAL_BANNERS_DIR, uploadId].concat(filePath.split("/"));
  dirs.pop();
  return path.join.apply(null, dirs);
}

function handleZipEntries(dir, file) {
  const entries = fs.readdirSync(dir);
  const htmlFile = getHtmlFile(entries);
  //if an html file is contained directly in a zip, move zip files to a folder with zip name to be handled as the rest of the folders
  if (htmlFile) {
    const fileInfo = path.parse(file);
    const htmlDirPath = path.join(dir, fileInfo.name);
    fs.mkdirpSync(htmlDirPath);
    entries.forEach((entry) => {
      const sourcePath = path.join(dir, entry);
      const destPath = path.join(htmlDirPath, entry);
      fs.moveSync(sourcePath, destPath);
    });
  }
}

function handleDirEntries(dir, data) {
  const entries = fs.readdirSync(dir);
  entries.forEach((entry) => {
    if (validEntry(entry)) {
      const stat = fs.statSync(path.join(dir, entry));
      if (stat.isDirectory()) {
        handleDir(dir, entry, data);
      } else {
        handleFile(dir, entry, data);
      }
    }
  });
}

function validEntry(entry) {
  const toIgnore = ["__MACOSX", ".DS_Store", "thumbs.db"];
  return toIgnore.indexOf(entry) === -1;
}

function handleDir(parent, dir, data) {
  const regx = /(\d+)\s*[xX]\s*(\d+)/g;
  const size = regx.exec(dir);
  if (size) {
    const banner = getHtmlBanner(parent, dir, size);
    if (banner) {
      data.banners.push(banner);
    } else {
      data.invalid.push({
        name: dir,
        type: "dir",
        msg: "html file missing"
      });
    }
  } else {
    const dirPath = path.join(parent, dir);
    const bannerEntries = fs.readdirSync(dirPath);
    const htmlFile = getHtmlFile(bannerEntries);
    if (htmlFile) {
      data.invalid.push({
        name: dir,
        type: "dir",
        msg: "html banner directory name is missing dimensions"
      });
    } else {
      handleDirEntries(dirPath, data);
    }
  }
}

function handleFile(parent, file, data) {
  const accept = [".zip", ".png", ".jpg", ".jpeg", ".gif"];
  const fileInfo = path.parse(file);
  if (accept.indexOf(fileInfo.ext.toLowerCase()) > -1) {
    if (fileInfo.ext === ".zip") {
      const extract = validZipLevel(data.zip, parent);
      if (extract) {
        const zip = new admZip(path.join(parent, file));
        const uploadId = uuidv4();
        const targetPath = path.join(parent, uploadId);
        data.zip.push(uploadId);
        zip.extractAllTo(targetPath);
        handleZipEntries(targetPath, file);
        handleDirEntries(targetPath, data);
      } else {
        data.invalid.push({
          name: file,
          type: "file",
          msg: "maximum zip level exceeded"
        });
      }
    } else {
      const banner = getImageBanner(parent, file);
      if (banner) {
        data.banners.push(banner);
      } else {
        data.invalid.push({
          name: file,
          type: "file",
          msg: "invalid image file"
        });
      }
    }
  } else {
    data.invalid.push({
      name: file,
      type: "file",
      msg: "file should be of types " + accept.join(", ")
    });
  }
}

function getImageBanner(parent, file) {
  const filePath = path.join(parent, file);
  const fileInfo = path.parse(file);
  try {
    const dimensions = sizeOf(filePath);
    let bannerName = fileInfo.name + ' ' + dimensions.width + 'x' + dimensions.height;
    //bannerName = bannerName.replace(/\./g, "");
    return {
      preview: getPreviewUrl(filePath),
      path: filePath,
      name: bannerName,
      width: dimensions.width,
      height: dimensions.height,
      type: 1
    };
  } catch (err) {
    return null;
  }
}

function getHtmlBanner(parent, dir, size) {
  const dirPath = path.join(parent, dir);
  const bannerFiles = fs.readdirSync(dirPath);
  const htmlFile = getHtmlFile(bannerFiles);
  const bannerName = size.input //.replace(/\./g, "");
  if (htmlFile) {
    const htmlFilePath = path.join(dirPath, htmlFile);
    adjustContent(htmlFilePath);
    adjustJsFiles(dirPath, bannerFiles);
    return {
      preview: getPreviewUrl(htmlFilePath),
      path: dirPath,
      name: bannerName,
      width: size[1] || '',
      height: size[2] || '',
      type: 4
    }
  } else {
    return null;
  }
}

function getHtmlFile(bannerEntries) {
  return bannerEntries.find((file) => {
    const fileInfo = path.parse(file);
    return fileInfo.ext === ".html";
  });
}

function adjustJsFiles(dirPath, entries) {
  entries.forEach((entry) => {
    const entryPath = path.join(dirPath, entry);
    const stat = fs.statSync(entryPath);
    if (stat.isDirectory()) {
      const dirEntries = fs.readdirSync(entryPath);
      adjustJsFiles(entryPath, dirEntries);
    } else {
      const fileInfo = path.parse(entryPath);
      if (fileInfo.ext === ".js") {
        adjustContent(entryPath);
      }
    }
  });
}

function adjustContent(filePath) {
  replaceFunctionInContent(filePath, 'window.open(',  'ADSCIENCE_CLICK()')
  replaceFunctionInContent(filePath, 'mraid.open(',  'ADSCIENCE_CLICK()')
}

function replaceFunctionInContent(filePath, functionStartsWith: string, replaceBy: string) {
  try {
    const content = fs.readFileSync(filePath, "utf8").toString();
    const regx = new RegExp(_.escapeRegExp(functionStartsWith), "g");
    let replaceLength = functionStartsWith.length
    let newContent = content;
    let match;
    while ((match = regx.exec(newContent)) !== null) {
      const index = match.index;
      const end = getEndingParenthesisIndex(index + replaceLength, newContent); //starting after window.open( first parenthesis
      if (end !== -1) newContent = replaceBetween(index, end + 1, replaceBy, newContent);
    }
    fs.writeFileSync(filePath, newContent, "utf8");
  } catch (err) {
    console.log("Failed to write file: " + err);
  }

}

function getEndingParenthesisIndex(start, str) {
  let curr = start + 1;
  const strEnd = str.length - 1;
  let numOpen = 1;
  while (numOpen > 0 && curr <= strEnd) {
    if (str.charAt(curr) === '(') numOpen++;
    else if (str.charAt(curr) === ')') numOpen--;
    curr++;
  }
  if ((curr === strEnd + 1) && str.charAt(curr - 1) !== ')') { //invalid if string ends without a closing parenthesis
    return -1;
  } else {
    return curr - 1;
  }
}

function replaceBetween(start, end, replaceValue, str) {
  return str.substring(0, start) + replaceValue + str.substring(end);
}

function getPreviewUrl(fileDirPath) {
  return config.serverUrl + fileDirPath.replace(Constants.LOCAL_BANNERS_DIR, Constants.LOCAL_ADS_PREVIEW);
}

function validZipLevel(zipFolders, zipPath) {
  const relPath = path.relative(Constants.LOCAL_BANNERS_DIR, zipPath);
  const parents = relPath.split(path.sep);
  const intersection = _.intersection(zipFolders, parents);
  return intersection.length < Constants.ZIP_LEVEL;
}

function getAdsFormData(ads: Partial<Ad>[]) {
  let formData = new FormData();
  let data: any = {};
  ads.forEach((o) => {
    if (!o.local) {
      data[o.name] = getAd(o);
    } else {
      if (o.type == 1) { //image banner
        const key = o.id.toString();
        data[key] = getAd(o);
        formData.append(key, fs.createReadStream(o.path));
      } else if (o.type == 4) { // html5 banner
        const key = o.id.toString();
        data[key] = getAd(o);
        const zip = new admZip();
        try {
          zip.addLocalFolder(o.path);
          zip.writeZip(o.path + '.zip');
          formData.append(key, fs.createReadStream(o.path + '.zip'));
        } catch (err) {
          console.log("could not create html5 zip: ", o.id);
        }
      } else if (o.type == 5) {
        const ext = getExtension(o.filename);
        const filePath = `${Constants.LOCAL_VIDEOS_DIR}${o.name}${ext}`;
        fs.renameSync(`${Constants.LOCAL_VIDEOS_DIR}${o.uuid}-${o.filename}`, filePath);
        data[o.name] = getAd(o);
        formData.append(o.name, fs.createReadStream(filePath));
      }
    }
  });
  formData.append("data", JSON.stringify(data));
  return formData;
}

function getFilesToDelete(ads) {
  return ads.filter(function (ad) { return ad.local && ad.type === 5 }).map((o) => {
    const ext = getExtension(o.filename);
    return `${Constants.LOCAL_VIDEOS_DIR}${o.name}${ext}`;
  });
}

function getAd(o) {
  let ad = _.assign({}, o);
  delete ad.id;
  delete ad.path;
  delete ad.uuid;

  return _.mapValues(ad, (value) => { return Number.isInteger(value) ? value.toString() : value; }); //API accepts all integers as strings
}

function getExtension(filename) {
  const i = filename.lastIndexOf('.');
  return (i < 0) ? '' : filename.substr(i);
}

function deleteFiles(paths: string[]) {
  const toDeleteP = paths.map((path) => {
    return fs.remove(path);
  });

  return Promise.all(toDeleteP);
}

function getErroredAds(response) {
  let erroredAds = [];
  _.forEach(response, (value, key) => {
    if (isNaN(value)) {
      erroredAds.push({ key, msg: value });
    }
  });
  return erroredAds;
}