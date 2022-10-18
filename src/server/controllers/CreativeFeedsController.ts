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

export default class CreativeFeedController extends ApiController {

  constructor(protected API: NOAX) {
    super(API);
    this.router.get("", this.getAll);
    this.router.get("/:id", this.getOne);
    this.router.put("/:id", this.update);
    this.router.delete("/:id", this.delete)
    this.router.post("", this.create);
  }

  getAll: RequestHandler = async (req, res) => {
    try {
      const credentials = this.getCredentials(req);
      const options = _.assign({}, req.query, { limit: Constants.MAX_API_LIMIT });
      const feeds = await this.API.getCreativeFeeds(credentials, options);
      res.json(feeds);
    } catch (err) {
      console.log(err);
      res.status(500).json(err);
    }
  }


  create: RequestHandler = async (req, res) => {
    try {
      const credentials = this.getCredentials(req);
      const options = _.assign({}, req.query, { data: req.body });
      const feeds = await this.API.createCreativeFeed(credentials, options);
      res.json({ msg: "ok" });
    } catch (err) {
      res.status(500).json(err);
    }
  }

  update: RequestHandler = async (req, res) => {
    try {
      const credentials = this.getCredentials(req);
      const id = parseInt(req.params.id, 10)
      const options = _.assign({}, req.query, { data: req.body });
      const feeds = await this.API.updateCreativeFeed(credentials, id, options);
      res.json({ msg: "ok" });
    } catch (err) {
      res.status(500).json(err);
    }
  }

  delete: RequestHandler = async (req, res) => {
    try {
      const credentials = this.getCredentials(req);
      const id = parseInt(req.params.id, 10)
      const options = _.assign({}, req.query, { data: req.body });
      const feeds = await this.API.deleteCreativeFeed(credentials, id, options);
      res.json({ msg: "ok" });
    } catch (err) {
      res.status(500).json(err);
    }
  }

  getOne: RequestHandler = async (req, res) => {
    try {
      const credentials = this.getCredentials(req);
      const options = _.assign({}, req.query, { limit: Constants.MAX_API_LIMIT });
      const id = parseInt(req.params.id, 10)
      const feed = await this.API.getSpecificCreativeFeed(credentials, id, options);
      res.json(feed);
    } catch (err) {
      console.log(err);
      res.status(500).json(err);
    }
  }
}