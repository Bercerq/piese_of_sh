import React, { useState, Fragment, useEffect, useRef } from "react";
import { findDOMNode } from "react-dom";
import { Form, Overlay, Tooltip, Button } from "react-bootstrap";
import Select from "react-select";
import * as _ from "lodash";
import { v4 as uuidv4 } from "uuid";
import { CopyToClipboard } from "react-copy-to-clipboard/lib";
import * as AdsHelper from "../../../../client/AdsHelper";
import * as Validation from "../../../../client/Validation";
import * as Api from "../../../../client/Api";
import { ValidationError, SelectOption } from "../../../../client/schemas";
import { AdFormProps } from "./AdForm";
import FontIcon from "../../../UI/FontIcon";
import Checkbox from "../../../UI/Checkbox";
import ThirdPartyTrackingRow, { ThirdPartyTrackingEvent, ThirdPartyTrackingEventType } from "./ThirdPartyTrackingRow";
import { Ad } from "../../../../models/data/Ads";

const VideoForm = (props: AdFormProps) => {
  const id = _.get(props, "ad.id", -1);
  const maxSize = 200;
  const thirdPartyHostOptions = getThirdPartyHostsOptions();
  const initialHostAt3rdParty = thirdPartyHostOptions.length > 0 ? thirdPartyHostOptions[0].value as string : "";
  const [name, setName] = useState<string>("");
  const [file, setFile] = useState<File>(null);
  const [fileInputKey, setFileInputKey] = useState<string>("0");
  const [filesValidation, setFilesValidation] = useState<ValidationError>({ error: false, message: "" });
  const [fileSizeValidation, setFileSizeValidation] = useState<ValidationError>({ error: false, message: "" });
  const [nameValidation, setNameValidation] = useState<ValidationError>({ error: false, message: "" });
  const [approveChecked, setApproveChecked] = useState<boolean>(true);
  const [clickUrl, setClickUrl] = useState<string>("");
  const [clickUrlValidation, setClickUrlValidation] = useState<ValidationError>({ error: false, message: "" });
  const [thirdPartyHostChecked, setThirdPartyHostChecked] = useState<boolean>(props.isSter || false);
  const [hostAt3rdParty, setHostAt3rdParty] = useState<string>(initialHostAt3rdParty);
  const [thirdPartyEventsChecked, setThirdPartyEventsChecked] = useState<boolean>(false);
  const [thirdPartyTrackingEvents, setThirdPartyTrackingEvents] = useState<(ThirdPartyTrackingEvent & { key: string })[]>([]);
  const [thirdPartyTrackingValidation, setThirdPartyTrackingValidation] = useState<boolean[]>([]);
  const [copied, setCopied] = useState<boolean>(false);

  const copyBtn = useRef<HTMLButtonElement>(null);

  useEffect(loadData, [props.ad]);
  useEffect(() => { submitForm() }, [props.submit]);

  function loadData() {
    if (props.ad) {
      const name = _.get(props, "ad.name", "");
      const clickUrl = _.get(props, "ad.clickUrl", "");
      const thirdPartyEventsServerSide = _.get(props, "ad.thirdPartyEventsServerSide", 0);
      const thirdPartyTrackingEvents = assignKeys(AdsHelper.getThirdPartyTrackingEvents(props.ad));
      const thirdPartyTrackingValidation = thirdPartyTrackingEvents.map((o) => { return true; });
      setName(name);
      setClickUrl(clickUrl);
      setThirdPartyEventsChecked(thirdPartyEventsServerSide === 1);
      setThirdPartyTrackingEvents(thirdPartyTrackingEvents);
      setNameValidation({ error: false, message: "" });
      setClickUrlValidation({ error: false, message: "" });
      setThirdPartyTrackingValidation(thirdPartyTrackingValidation);
    }
  }

  function assignKeys(items: ThirdPartyTrackingEvent[]): (ThirdPartyTrackingEvent & { key: string })[] {
    return items.map((o) => { return _.assign({}, o, { key: uuidv4() }); });
  }

  function removeKeys(items: (ThirdPartyTrackingEvent & { key: string })[]): ThirdPartyTrackingEvent[] {
    return items.map((o) => { return _.omit(o, "key") });
  }

  async function submitForm() {
    if (props.submit) {
      if (id > 0) {
        save();
      } else {
        await create();
      }
    }
  }

  async function create() {
    const clickUrlValidation = Validation.url(clickUrl, true);
    setClickUrlValidation(clickUrlValidation);
    const filesValidation = getFilesValidation();
    setFilesValidation(filesValidation);
    if (filesValidation.error || clickUrlValidation.error || hasInvalidUrls()) {
      props.onCreate(true, []);
    } else {
      const approved = approveChecked ? 0 : -2;
      const thirdPartyEventsServerSide = thirdPartyEventsChecked ? 1 : 0;
      const thirdPartyTrackingEventsForSubmit = removeKeys(thirdPartyTrackingEvents);
      const thirdPartyImpressions = AdsHelper.getThirdPartyImpressions(thirdPartyTrackingEventsForSubmit);
      const thirdPartyClicks = AdsHelper.getThirdPartyClicks(thirdPartyTrackingEventsForSubmit);
      const thirdPartyTracking = AdsHelper.getThirdPartyTracking(thirdPartyTrackingEventsForSubmit);
      const fileName = name !== "" ? name : file.name.split('.').slice(0, -1).join('.');
      let ad: Partial<Ad> = {
        name: fileName,
        approved,
        clickUrl,
        thirdPartyEventsServerSide,
        thirdPartyImpressions,
        thirdPartyClicks,
        thirdPartyTracking,
        width: 1,
        height: 1,
        submissionType: 1,
        tag_type: 1, //set default standard type
        tag: '',
        type: 5,
        local: true,
        active: 1,
        file
      };
      if (thirdPartyHostChecked) {
        ad.hostAt3rdParty = hostAt3rdParty;
      }
      const formData = getFormData(ad);
      try {
        const video = await Api.PostForm({ path: "/api/ads/local-video", body: formData });
        props.onCreate(false, [video]);
      } catch (err) {
        setFilesValidation({ error: true, message: "There was an error in temporary video save. Try again!" });
        props.onCreate(true, []);
      }
    }
  }

  function save() {
    if (clickUrlValidation.error || hasInvalidUrls()) {
      props.onSubmit(true, null);
    } else {
      const thirdPartyEventsServerSide = thirdPartyEventsChecked ? 1 : 0;
      const thirdPartyTrackingEventsForSubmit = removeKeys(thirdPartyTrackingEvents);
      const thirdPartyImpressions = AdsHelper.getThirdPartyImpressions(thirdPartyTrackingEventsForSubmit);
      const thirdPartyClicks = AdsHelper.getThirdPartyClicks(thirdPartyTrackingEventsForSubmit);
      const thirdPartyTracking = AdsHelper.getThirdPartyTracking(thirdPartyTrackingEventsForSubmit);

      props.onSubmit(false, { name, clickUrl, thirdPartyEventsServerSide, thirdPartyImpressions, thirdPartyClicks, thirdPartyTracking });
    }
  }

  function getFormData(ad: Partial<Ad>) {
    let formData = new FormData();
    _.forEach(ad, (v, k) => {
      formData.append(k, v);
    });
    return formData;
  }

  function getFilesValidation() {
    if (file) {
      return { error: false, message: "" };
    } else {
      return { error: true, message: "Please upload file." };
    }
  }

  function hasInvalidUrls() {
    return thirdPartyTrackingValidation.indexOf(false) > -1;
  }

  const handleNameChange = (e) => {
    const name = e.target.value;
    const nameValidation = Validation.required(name);
    setName(name);
    setNameValidation(nameValidation);
  }

  const fileChange = async (e) => {
    const files = _.get(e, "target.files");
    if (files.length > 0) {
      const file = files[0];
      const totalMb = file.size / (1024 * 1024);
      if (totalMb < maxSize) {
        setFile(file);
        setFileSizeValidation({ error: false, message: "" });
        setFilesValidation({ error: false, message: "" });
        props.onUploadVideo(true);
      } else {
        setFileSizeValidation({ error: true, message: "Upload limit exceeded,  should be < " + maxSize + " Mb" });
        setFilesValidation({ error: false, message: "" });
      }
    }
  }

  const handleApprovedChange = (checked: boolean) => {
    setApproveChecked(checked);
  }

  const handleClickUrlChange = (e) => {
    const clickUrl = e.target.value;
    const clickUrlValidation = Validation.url(clickUrl, true);
    setClickUrl(clickUrl);
    setClickUrlValidation(clickUrlValidation);
  }

  const handleThirdPartyHostChange = (checked: boolean) => {
    setThirdPartyHostChecked(checked);
  }

  const handleThirdPartyHostSelectChange = (selected) => {
    const hostAt3rdParty = selected.value as string;
    setHostAt3rdParty(hostAt3rdParty);
  }

  const handleThirdPartyEventsChange = (checked: boolean) => {
    setThirdPartyEventsChecked(checked);
  }

  const handleThirdPartyTrackingChange = (i: number, item: ThirdPartyTrackingEvent & { key: string }, isValid: boolean) => {
    let items = _.cloneDeep(thirdPartyTrackingEvents);
    items[i] = item;
    setThirdPartyTrackingEvents(items);
    let itemsValidation = thirdPartyTrackingValidation.concat();
    itemsValidation[i] = isValid;
    setThirdPartyTrackingValidation(itemsValidation);
  }

  const handleThirdPartyTrackingDelete = (i: number) => {
    const items = _.cloneDeep(thirdPartyTrackingEvents);
    const itemsValidation = thirdPartyTrackingValidation.concat();
    if (items.length > 0) {
      items.splice(i, 1);
      setThirdPartyTrackingEvents(items);
      itemsValidation.splice(i, 1);
      setThirdPartyTrackingValidation(itemsValidation);
    }
  }

  const handleThirdPartyTrackingAdd = () => {
    const newThirdPartyTrackingEvents = { type: "impression" as ThirdPartyTrackingEventType, url: "", key: uuidv4() };
    const items = [...thirdPartyTrackingEvents, newThirdPartyTrackingEvents];
    const itemsValidation = [...thirdPartyTrackingValidation, true];
    setThirdPartyTrackingEvents(items);
    setThirdPartyTrackingValidation(itemsValidation);
  }

  const handleCopy = () => {
    setCopied(true);
    setTimeout(() => { setCopied(false) }, 2000);
  }

  function getClassNames() {
    return copied ? "gray-box mb-2 highlight-box" : "gray-box mb-2";
  }

  function getThirdPartyHostsOptions(): SelectOption[] {
    return (props.thirdPartyHosts || []).map((o) => { return { value: o.sspName, label: o.name } });
  }

  const nameLabel = id > 0 ? "Name *" : "Name (file name is used if not filled)";
  const tag = props.ad ? (props.ad.previewTag || props.ad.tag) : "";

  return <Fragment>
    {id < 0 && <Fragment>
      <Form.Group id="video-files">
        <Form.Label>Files *</Form.Label>
        <Form.Control
          key={fileInputKey}
          type="file"
          name="files[]"
          multiple={true}
          accept=".zip, .mp4"
          onChange={fileChange}
        />
      </Form.Group>
      <Form.Group>
        {filesValidation.error && <div className="text-danger">{filesValidation.message}</div>}
      </Form.Group>
      <Form.Group>
        {fileSizeValidation.error && <div className="text-danger">{fileSizeValidation.message}</div>}
      </Form.Group>
    </Fragment>}
    <Form.Group controlId="video-name">
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
    {id < 0 &&
      <Form.Group>
        <Checkbox id="video-approved" checked={approveChecked} onChange={handleApprovedChange}>Request approval immediately</Checkbox>
      </Form.Group>
    }
    <Form.Group controlId="video-clickurl">
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
    {id < 0 && <Form.Group>
      <div className="d-inline-block" style={{ width: "200px" }}>
        <Checkbox id="video-thirdpartyhost" checked={thirdPartyHostChecked} onChange={handleThirdPartyHostChange}>Upload to publisher instead</Checkbox>
      </div>
      <div className="d-inline-block" style={{ width: "150px" }}>
        <Select
          inputId="react-select-video-thirdpartyhost"
          className="react-select-container"
          classNamePrefix="react-select"
          clearable={false}
          value={thirdPartyHostOptions.find((o) => { return o.value === hostAt3rdParty })}
          onChange={handleThirdPartyHostSelectChange}
          options={thirdPartyHostOptions}
        />
      </div>
    </Form.Group>}
    <Form.Group>
      <Checkbox id="video-tracking" checked={thirdPartyEventsChecked} onChange={handleThirdPartyEventsChange}>Third party tracking from server</Checkbox>
    </Form.Group>
    <Form.Group>
      <div>
        {
          thirdPartyTrackingEvents.map((item, i) => <ThirdPartyTrackingRow
            key={item.key}
            index={i}
            item={item}
            onChange={handleThirdPartyTrackingChange}
            onDelete={handleThirdPartyTrackingDelete}
          />)
        }
      </div>
      <Button size="sm" variant="primary" onClick={handleThirdPartyTrackingAdd}><FontIcon name="plus" /> 3RD PARTY TRACKING</Button>
    </Form.Group>
    {id > 0 &&
      <Form.Group controlId="video-tag">
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
export default VideoForm;