import React, { useState, Fragment, useEffect } from "react";
import { Form, Button } from "react-bootstrap";
import Select from "react-select";
import * as _ from "lodash";
import { v4 as uuidv4 } from "uuid";
import * as AdsHelper from "../../../../client/AdsHelper";
import * as Utils from "../../../../client/Utils";
import * as Validation from "../../../../client/Validation";
import { ValidationError, SelectOption } from "../../../../client/schemas";
import { AdFormProps } from "./AdForm";
import FontIcon from "../../../UI/FontIcon";
import Checkbox from "../../../UI/Checkbox";
import ThirdPartyTrackingRow, { ThirdPartyTrackingEvent, ThirdPartyTrackingEventType } from "./ThirdPartyTrackingRow";
import { Ad } from "../../../../models/data/Ads";

const VASTForm = (props: AdFormProps) => {
  const id = _.get(props, "ad.id", -1);
  const thirdPartyHostOptions = getThirdPartyHostsOptions();
  const initialHostAt3rdParty = thirdPartyHostOptions.length > 0 ? thirdPartyHostOptions[0].value as string : "";
  const [name, setName] = useState<string>("");
  const [approveChecked, setApproveChecked] = useState<boolean>(true);
  const [nameValidation, setNameValidation] = useState<ValidationError>({ error: false, message: "" });
  const [clickUrl, setClickUrl] = useState<string>("");
  const [tag, setTag] = useState<string>("");
  const [tagValidation, setTagValidation] = useState<ValidationError>({ error: false, message: "" });
  const [thirdPartyHostChecked, setThirdPartyHostChecked] = useState<boolean>(props.isSter || false);
  const [hostAt3rdParty, setHostAt3rdParty] = useState<string>(initialHostAt3rdParty);
  const [thirdPartyEventsChecked, setThirdPartyEventsChecked] = useState<boolean>(false);
  const [thirdPartyTrackingEvents, setThirdPartyTrackingEvents] = useState<(ThirdPartyTrackingEvent & { key: string })[]>([]);
  const [thirdPartyTrackingValidation, setThirdPartyTrackingValidation] = useState<boolean[]>([]);

  useEffect(loadData, [props.ad]);
  useEffect(submitForm, [props.submit]);

  function loadData() {
    if (props.ad) {
      const name = _.get(props, "ad.name", "");
      const adType = _.get(props, "ad.type", 0);
      const vastURL = _.get(props, "ad.vastURL", "");
      const vastXML = _.get(props, "ad.vastXML", "");
      const tag = adType === 6 ? vastURL : vastXML;
      const clickUrl = _.get(props, "ad.clickUrl", "");
      const thirdPartyEventsServerSide = _.get(props, "ad.thirdPartyEventsServerSide", 0);
      const thirdPartyTrackingEvents = assignKeys(AdsHelper.getThirdPartyTrackingEvents(props.ad));
      const thirdPartyTrackingValidation = thirdPartyTrackingEvents.map((o) => { return true; });
      setName(name);
      setTag(tag);
      setClickUrl(clickUrl);
      setThirdPartyEventsChecked(thirdPartyEventsServerSide === 1);
      setThirdPartyTrackingEvents(thirdPartyTrackingEvents);
      setNameValidation({ error: false, message: "" });
      setThirdPartyTrackingValidation(thirdPartyTrackingValidation);
    }
  }

  function assignKeys(items: ThirdPartyTrackingEvent[]): (ThirdPartyTrackingEvent & { key: string })[] {
    return items.map((o) => { return _.assign({}, o, { key: uuidv4() }); });
  }

  function removeKeys(items: (ThirdPartyTrackingEvent & { key: string })[]): ThirdPartyTrackingEvent[] {
    return items.map((o) => { return _.omit(o, "key") });
  }

  function submitForm() {
    if (props.submit) {
      if (id > 0) {
        save();
      } else {
        create();
      }
    }
  }

  function save() {
    if (nameValidation.error || hasInvalidUrls()) {
      props.onSubmit(true, null);
    } else {
      const thirdPartyEventsServerSide = thirdPartyEventsChecked ? 1 : 0;
      const thirdPartyTrackingEventsForSubmit = removeKeys(thirdPartyTrackingEvents);

      const thirdPartyImpressions = AdsHelper.getThirdPartyImpressions(thirdPartyTrackingEventsForSubmit);
      const thirdPartyClicks = AdsHelper.getThirdPartyClicks(thirdPartyTrackingEventsForSubmit);
      const thirdPartyTracking = AdsHelper.getThirdPartyTracking(thirdPartyTrackingEventsForSubmit);

      props.onSubmit(false, { name, thirdPartyEventsServerSide, thirdPartyImpressions, thirdPartyClicks, thirdPartyTracking });
    }
  }

  function create() {
    const nameValidation = Validation.required(name);
    const tagValidation = Validation.vastTag(tag);

    setNameValidation(nameValidation);
    setTagValidation(tagValidation);
    if (nameValidation.error || tagValidation.error || hasInvalidUrls()) {
      props.onCreate(true, []);
    } else {
      const thirdPartyEventsServerSide = thirdPartyEventsChecked ? 1 : 0;
      const thirdPartyTrackingEventsForSubmit = removeKeys(thirdPartyTrackingEvents);
      const thirdPartyImpressions = AdsHelper.getThirdPartyImpressions(thirdPartyTrackingEventsForSubmit);
      const thirdPartyClicks = AdsHelper.getThirdPartyClicks(thirdPartyTrackingEventsForSubmit);
      const thirdPartyTracking = AdsHelper.getThirdPartyTracking(thirdPartyTrackingEventsForSubmit);
      const approved = approveChecked ? 0 : -2;
      let ad: Partial<Ad> = {
        name,
        approved,
        tag,
        width: 1,
        height: 1,
        submissionType: 1,
        local: false,
        active: 1,
        thirdPartyEventsServerSide,
        thirdPartyImpressions,
        thirdPartyClicks,
        thirdPartyTracking
      };
      if (thirdPartyHostChecked) {
        ad.hostAt3rdParty = hostAt3rdParty;
      }
      if (Utils.isValidUrl(tag)) {
        ad.type = 6;
        ad.vastURL = tag;
        ad.vastXML = null;
      } else {
        ad.type = 7;
        ad.vastURL = null;
        ad.vastXML = tag;
      }
      props.onCreate(false, [ad]);
    }
  }

  function hasInvalidUrls() {
    return thirdPartyTrackingValidation.indexOf(false) > -1;
  }

  function getThirdPartyHostsOptions(): SelectOption[] {
    return (props.thirdPartyHosts || []).map((o) => { return { value: o.sspName, label: o.name } });
  }

  const handleNameChange = (e) => {
    const name = e.target.value;
    const nameValidation = Validation.required(name);
    setName(name);
    setNameValidation(nameValidation);
  }

  const handleApprovedChange = (checked: boolean) => {
    setApproveChecked(checked);
  }

  const handleTagChange = (e) => {
    const tag = e.target.value;
    const tagValidation = Validation.vastTag(tag);
    setTag(tag);
    setTagValidation(tagValidation);

    let partialAd: Partial<Ad> = { previewTag: null, tag };
    if (Utils.isValidUrl(tag)) {
      partialAd.type = 6;
      partialAd.vastURL = tag;
      partialAd.vastXML = null;
    } else {
      partialAd.type = 7;
      partialAd.vastURL = null;
      partialAd.vastXML = tag;
    }

    if (tag !== "") {
      props.onPreviewChange(_.assign({}, props.ad, partialAd));
    } else {
      props.onPreviewChange(null);
    }
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

  return <Fragment>
    <Form.Group controlId="vast-name">
      <Form.Label>Name *</Form.Label>
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
        <Checkbox id="vast-approved" checked={approveChecked} onChange={handleApprovedChange}>Request approval immediately</Checkbox>
      </Form.Group>
    }
    <Form.Group controlId="vast-tag">
      <Form.Label>Tag *</Form.Label>
      <Form.Control as="textarea"
        autoFocus
        readOnly={id > 0}
        type="text"
        rows={6}
        value={tag}
        isInvalid={tagValidation.error}
        onChange={handleTagChange}
      />
      {tagValidation.error && <Form.Control.Feedback type="invalid">{tagValidation.message}</Form.Control.Feedback>}
    </Form.Group>
    {id < 0 && <Form.Group>
      <div className="d-inline-block" style={{ width: "200px" }}>
        <Checkbox id="vast-thirdpartyhost" checked={thirdPartyHostChecked} onChange={handleThirdPartyHostChange}>Upload to publisher instead</Checkbox>
      </div>
      <div className="d-inline-block" style={{ width: "150px" }}>
        <Select
          inputId="react-select-vast-thirdpartyhost"
          className="react-select-container"
          classNamePrefix="react-select"
          clearable={false}
          value={thirdPartyHostOptions.find((o) => { return o.value === hostAt3rdParty })}
          onChange={handleThirdPartyHostSelectChange}
          options={thirdPartyHostOptions}
        />
      </div>
    </Form.Group>}
    {id > 0 &&
      <Form.Group controlId="vast-clickurl">
        <Form.Label>Landing page *</Form.Label>
        <Form.Control
          readOnly
          autoFocus
          type="text"
          value={clickUrl}
        />
      </Form.Group>
    }
    <Form.Group>
      <Checkbox id="vast-tracking" checked={thirdPartyEventsChecked} onChange={handleThirdPartyEventsChange}>Third party tracking from server</Checkbox>
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
  </Fragment>;
}
export default VASTForm;