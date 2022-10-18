import React, { useState, Fragment, useEffect, useRef } from "react";
import { findDOMNode } from "react-dom";
import { Form, Overlay, Tooltip, Alert } from "react-bootstrap";
import * as _ from "lodash";
import { CopyToClipboard } from "react-copy-to-clipboard/lib";
import * as Validation from "../../../../client/Validation";
import { ValidationError, DropFile } from "../../../../client/schemas";
import { AdFormProps } from "./AdForm";
import FontIcon from "../../../UI/FontIcon";
import Checkbox from "../../../UI/Checkbox";
import DropArea from "../../../UI/DropArea";
import * as Api from "../../../../client/Api";
import { InvalidLocalBanner, LocalBannerData, Ad } from "../../../../models/data/Ads";

const BannerForm = (props: AdFormProps) => {
  const id = _.get(props, "ad.id", -1);
  const maxSize = 250;
  const [name, setName] = useState<string>("");
  const [fileInputKey, setFileInputKey] = useState<string>("0");
  const [dropLoading, setDropLoading] = useState<boolean>(false);
  const [filesUploaded, setFilesUploaded] = useState<boolean>(false);
  const [nameValidation, setNameValidation] = useState<ValidationError>({ error: false, message: "" });
  const [filesValidation, setFilesValidation] = useState<ValidationError>({ error: false, message: "" });
  const [fileSizeValidation, setFileSizeValidation] = useState<ValidationError>({ error: false, message: "" });
  const [bannersData, setBannersData] = useState<LocalBannerData>({ banners: [], invalid: [], zip: [], toDelete: [] });
  const [submissionType, setSubmissionType] = useState<(0 | 1)>(1);
  const [approveChecked, setApproveChecked] = useState<boolean>(true);
  const [clickUrl, setClickUrl] = useState<string>("");
  const [addClickLayer, setAddClickLayer] =  useState<(0 | 1)>(1);
  const [clickUrlValidation, setClickUrlValidation] = useState<ValidationError>({ error: false, message: "" });
  const [copied, setCopied] = useState<boolean>(false);

  const copyBtn = useRef<HTMLButtonElement>(null);

  useEffect(loadData, [props.ad]);
  useEffect(submitForm, [props.submit]);
  useEffect(localBannersUpdate, [props.localBanners]);

  function loadData() {
    if (props.ad) {
      const name = _.get(props, "ad.name", "");
      const clickUrl = _.get(props, "ad.clickUrl", "");
      const addClickLayer = _.get(props, "ad.addClickLayer", 0);
      setAddClickLayer(addClickLayer);
      setName(name);
      setClickUrl(clickUrl);
      setNameValidation({ error: false, message: "" });
      setClickUrlValidation({ error: false, message: "" });
    }
  }

  function submitForm() {
    if (props.submit) {
      if (id > 0) {
        if (nameValidation.error || clickUrlValidation.error) {
          props.onSubmit(true, null);
        } else {
          props.onSubmit(null, { name, clickUrl });
        }
      } else {
        let clickUrlValidation = { error: false, message: "" };
        if (clickUrl !=="file") {
          clickUrlValidation = Validation.url(clickUrl, true);
        }
        const filesValidation = getFilesValidation();
        setClickUrlValidation(clickUrlValidation);
        setFilesValidation(filesValidation);

        if (clickUrlValidation.error || filesValidation.error || fileSizeValidation.error) {
          props.onCreate(true, []);
        } else {
          const ads = getAds();
          props.onCreate(false, ads);
        }
      }
    }
  }

  function getAds() {
    const approved = approveChecked ? 0 : -2;
    const ads: Partial<Ad>[] = props.localBanners.map((banner, i) => {
      const bannerName = name !== "" ? `${name} ${banner.width}x${banner.height}` : banner.name;
      return {
        id: i,
        name: bannerName,
        width: banner.width,
        height: banner.height,
        clickUrl,
        submissionType,
        approved,
        type: banner.type,
        local: true,
        active: 1,
        path: banner.path,
        addClickLayer
      }
    });
    return replaceRepeatingNames(ads);
  }

  function replaceRepeatingNames(ads) {
    let groupedAds = _.groupBy(ads, 'name');
    _.forEach(groupedAds, (groupAds, name) => {
      groupedAds[name] = groupAds.map((ad, i) => {
        if (i === 0) {
          return ad;
        } else {
          ad.name += ' (' + i + ')';
          return ad;
        }
      });
    });
    return _.flatten(_.values(groupedAds));
  }

  function localBannersUpdate() {
    if (filesUploaded) {
      const filesValidation = getFilesValidation();
      setFilesValidation(filesValidation);
    }
  }

  function getFilesValidation() {
    if (props.localBanners.length > 0) {
      return { error: false, message: "" };
    } else {
      return { error: true, message: "Please upload files." };
    }
  }

  const fileChange = async (e) => {
    const files = _.get(e, "target.files");
    const totalMb = getFilesTotalMb(files);
    if (totalMb < maxSize) {
      const formData = getInputFilesFormData(files);
      const bannersData: LocalBannerData = await getLocalBannersData(formData);
      props.onUploadBanners(bannersData);
      setBannersData(bannersData);
      setFileSizeValidation({ error: false, message: "" });
      setFilesUploaded(true);
    } else {
      setFileSizeValidation({ error: true, message: "Upload limit exceeded,  should be < 250 Mb" });
    }
  }

  const onDropUpload = async (files: DropFile[]) => {
    setDropLoading(true);
    const fileInputKey = Math.random().toString(36);
    setFileInputKey(fileInputKey);
    const totalMb = getFilesTotalMb(files.map((item) => { return item.file }));
    if (totalMb < maxSize) {
      const formData = getDropFilesFormData(files);
      const bannersData: LocalBannerData = await getLocalBannersData(formData);
      props.onUploadBanners(bannersData);
      setBannersData(bannersData);
      setFileSizeValidation({ error: false, message: "" });
      setFilesUploaded(true);
    } else {
      setFileSizeValidation({ error: true, message: "Upload limit exceeded,  should be < " + maxSize + " Mb" });
    }
    setDropLoading(false);
  }

  const handleNameChange = (e) => {
    const name = e.target.value;
    const nameValidation = Validation.required(name);
    setName(name);
    setNameValidation(nameValidation);
  }

  const handleSubmissionChange = (e) => {
    if (e.target.checked) {
      const submissionType = e.target.value === "0" ? 0 : 1;
      setSubmissionType(submissionType);
    }
  }

  const handleApprovedChange = (checked: boolean) => {
    setApproveChecked(checked);
  }

  const handleClickUrlChange = (e) => {
    const clickUrl = e.target.value;
    let clickUrlValidation = { error: false, message: "" };
    if (clickUrl !=="file") {
        clickUrlValidation = Validation.url(clickUrl, true);
    }
    setClickUrl(clickUrl);
    setClickUrlValidation(clickUrlValidation);
  }

  const handleCopy = () => {
    setCopied(true);
    setTimeout(() => { setCopied(false) }, 2000);
  }

  function getClassNames() {
    return copied ? "gray-box mb-2 highlight-box" : "gray-box mb-2";
  }

  function getFilesTotalMb(files) {
    var size = 0;
    _.forEach(files, (file) => {
      size += file.size;
    });
    return size / (1024 * 1024);
  }

  function getDropFilesFormData(items) {
    let formData = new FormData();
    items.forEach((item) => {
      formData.append("files", item.file);
      formData.append("keys", item.key);
      formData.append("paths", item.path);
    });
    return formData;
  }

  function getInputFilesFormData(files) {
    let formData = new FormData();
    _.forEach(files, function (file, key) {
      formData.append("files", file);
      formData.append("keys", key);
      formData.append("paths", "/" + file.name);
    });
    return formData;
  }

  function getLocalBannersData(formData): Promise<LocalBannerData> {
    return Api.PostForm({ path: "/api/ads/local-banners", body: formData });
  }

  const nameLabel = id > 0 ? "Name *" : "Name (file name is used if not filled)";
  const tag = props.ad ? (props.ad.previewTag || props.ad.tag) : "";

  function InvalidBannerWarning(banner: InvalidLocalBanner) {
    const type = banner.type === "dir" ? "Directory" : "File";
    return <div><strong>{type} {banner.name}: </strong> {banner.msg}</div>;
  }

  return <Fragment>
    {id < 0 &&
      <Fragment>
        <Form.Group id="banner-files">
          <Form.Label>Files *</Form.Label>
          <Form.Control
            key={fileInputKey}
            type="file"
            name="files[]"
            multiple={true}
            accept=".zip,.png,.jpg,.jpeg,.gif"
            onChange={fileChange}
          />
        </Form.Group>
        <Form.Group id="banner-droparea">
          <DropArea
            singleUpload={false}
            text="Drag and drop files or directories"
            loading={dropLoading}
            onUpload={onDropUpload}
          />
        </Form.Group>
        <Form.Group>
          {filesValidation.error && <div className="text-danger">{filesValidation.message}</div>}
        </Form.Group>
        <Form.Group>
          {fileSizeValidation.error && <div className="text-danger">{fileSizeValidation.message}</div>}
        </Form.Group>
        {bannersData.invalid.length > 0 &&
          <Form.Group>
            <Alert variant="warning">
              <FontIcon name="warning" /> The following banners could not be added:
              <ul className="pl-3">
                {
                  bannersData.invalid.map((banner, i) => <li key={`invalid-banner-${i}`}>{InvalidBannerWarning(banner)}</li>)
                }
              </ul>
            </Alert>
          </Form.Group>
        }
      </Fragment>
    }
    <Form.Group controlId="banner-name">
      <Form.Label>{nameLabel}</Form.Label>
      <Form.Control
        autoFocus
        type="text"
        value={name}
        isInvalid={nameValidation.error}
        onChange={handleNameChange}
      />
      {nameValidation.error && <Form.Control.Feedback type="invalid">{nameValidation.message}</Form.Control.Feedback>}
    </Form.Group>
    <Form.Group>
      <Form.Label>Ad serving type:</Form.Label>
      <div>
        <Form.Check
          id="banner-submission-1"
          disabled={id > 0}
          type="radio"
          name="banner-submission"
          value="1"
          checked={submissionType === 1}
          onChange={handleSubmissionChange} inline
          label="Standard, for campaigns"
        />
        <Form.Check
          id="banner-submission-0"
          disabled={id > 0}
          type="radio"
          name="banner-submission"
          value="0"
          checked={submissionType === 0}
          onChange={handleSubmissionChange} inline
          label="Tags, for externally managed delivery"
        />
      </div>
    </Form.Group>
    <Form.Group controlId="banner-clickurl">
      <Form.Label>Landing page *</Form.Label>
      <Form.Control
        autoFocus
        type="text"
        value={clickUrl}
        isInvalid={clickUrlValidation.error}
        onChange={handleClickUrlChange}
      />
      {clickUrlValidation.error && <Form.Control.Feedback type="invalid">{clickUrlValidation.message}</Form.Control.Feedback>}
     
    </Form.Group>
    {id < 0 &&
      <Form.Group>
        <Checkbox id="banner-approved" checked={approveChecked} onChange={handleApprovedChange}>Request approval immediately</Checkbox>
        <Checkbox id="add-clickLayer" checked={addClickLayer == 1 } onChange={(checked) => setAddClickLayer((checked)? 1 : 0)}>Add click layer, if click handling is not detected </Checkbox>
      </Form.Group>
    }


    {id > 0 &&
      <Form.Group controlId="banner-tag">
        <Form.Label>Preview code</Form.Label>
        <div className={getClassNames()}>{tag}</div>
        <CopyToClipboard text={tag} onCopy={handleCopy}>
          <button ref={copyBtn} className="btn btn-primary btn-sm pull-right"><FontIcon name="files-o" /> GET CODE</button>
        </CopyToClipboard>
        <Overlay target={findDOMNode(copyBtn.current) as any} show={copied} placement="bottom">
          <Tooltip id="copy-share-tag-tooltip">Copied!</Tooltip>
        </Overlay>
      </Form.Group>
    }
  </Fragment>;
}
export default BannerForm;