import React, { useState, useEffect } from "react";
import { Modal, Form, Button } from "react-bootstrap";
import Select from "react-select";
import * as _ from "lodash";
import * as Validation from "../../../../../../client/Validation";
import Checkbox from "../../../../../UI/Checkbox";
import { SelectOption, ValidationError } from "../../../../../../client/schemas";
import { CampaignBanner, CampaignTag } from "../../../../../../models/data/Campaign";

interface TagModalProps {
  tag?: CampaignTag;
  campaignId: number;
  ads: CampaignBanner[];
  show: boolean;
  writeAccess: boolean;
  onClose: () => void;
  onSubmit: (tag: CampaignTag) => void;
}

const TagModal = (props: TagModalProps) => {
  const [name, setName] = useState<string>("");
  const [supportedSizes, setSupportedSizes] = useState<string[]>([]);
  const [iframe, setIframe] = useState<boolean>(true);
  const [javascript, setJavascript] = useState<boolean>(true);
  const [tracking, setTracking] = useState<boolean>(true);
  const [defaultCampaignBannerId, setDefaultCampaignBannerId] = useState<number>(null);
  const [nameValidation, setNameValidation] = useState<ValidationError>({ error: false, message: "" });
  const [supportedSizesValidation, setSupportedSizesValidation] = useState<ValidationError>({ error: false, message: "" });
  const [tagTypesValidationError, setTagTypesValidationError] = useState<ValidationError>({ error: false, message: "" });

  useEffect(() => {
    const tagTypesValidationError = getTagTypesValidationError();
    setTagTypesValidationError(tagTypesValidationError);
  }, [iframe, javascript, tracking]);

  const handleEntering = () => {
    if (props.tag) {
      setName(_.get(props, "tag.name"));
      setSupportedSizes(_.get(props, "tag.supportedSizes", []));
      setIframe(_.get(props, "tag.iframe", false));
      setJavascript(_.get(props, "tag.javascript", false));
      setTracking(_.get(props, "tag.tracking", false));
      setDefaultCampaignBannerId(_.get(props, "tag.defaultCampaignBannerId", null));
    } else {
      setName("");
      setSupportedSizes([]);
      setIframe(true);
      setJavascript(true);
      setTracking(true);
      setDefaultCampaignBannerId(null);
      setNameValidation({ error: false, message: "" });
      setSupportedSizesValidation({ error: false, message: "" });
      setTagTypesValidationError({ error: false, message: "" });
    }
  }

  const handleNameChange = (e) => {
    const name = e.target.value;
    const nameValidation = Validation.required(name);
    setName(name);
    setNameValidation(nameValidation);
  }

  const handleSupportedSizesChange = (selected) => {
    const supportedSizes = (selected || []).map((o) => { return o.value as string });
    const supportedSizesValidation = getSupportedSizesValidation(supportedSizes);
    setSupportedSizes(supportedSizes);
    setSupportedSizesValidation(supportedSizesValidation);
  }

  const handleDefaultCampaignBannerIdChange = (selected) => {
    setDefaultCampaignBannerId(selected.value as number);
  }

  const handleSubmit = () => {
    const nameValidation = Validation.required(name);
    const supportedSizesValidation = getSupportedSizesValidation(supportedSizes);
    const tagTypesValidationError = getTagTypesValidationError();

    if (nameValidation.error || supportedSizesValidation.error || tagTypesValidationError.error) {
      setNameValidation(nameValidation);
      setSupportedSizesValidation(supportedSizesValidation);
      setTagTypesValidationError(tagTypesValidationError);
    } else {
      if (props.tag) {
        let updatedTag: Partial<CampaignTag> = {
          name
        };
        if (defaultCampaignBannerId) {
          updatedTag.defaultCampaignBannerId = defaultCampaignBannerId;
        }
        if (props.tag.id < 0 || !props.tag.finalized) {
          updatedTag.supportedSizes = supportedSizes || [];
          updatedTag.iframe = iframe;
          updatedTag.javascript = javascript;
          updatedTag.tracking = tracking;
        }
        props.onSubmit(_.assign({}, props.tag, updatedTag));
      } else {
        const tag: CampaignTag = {
          name,
          supportedSizes,
          iframe,
          javascript,
          tracking,
          finalized: false,
          campaignId: props.campaignId
        }
        props.onSubmit(tag);
      }
    }
  }

  function getSupportedSizesOptions(): SelectOption[] {
    const supportedSizesValues = [
      "300x250", "728x90", "320x240", "320x50", "320x100", "300x600", "160x600", "970x250", "336x280",
      "120x600", "320x320", "320x160", "320x250", "468x60", "970x90", "320x480", "300x50", "800x250",
      "1800x1000", "1800x200", "120x90", "375x375", "970x1000", "300x100", "320x500", "640x480", "600x500"
    ];
    return supportedSizesValues.map((s) => { return { value: s, label: s } });
  }

  function getDefaultAdOptions() {
    var tagAds = getTagAds();
    return tagAds.map((ad) => { return { value: ad.id, label: ad.name } });
  }

  function getTagAds() {
    if (props.tag) {
      return props.ads.filter((ad) => { return ad.tagId === props.tag.id });
    }
    return [];
  }

  function getTagTypesValidationError(): ValidationError {
    if (!iframe && !javascript && !tracking) {
      return { error: true, message: "Please select at least one of the above attributes." };
    } else {
      return { error: false, message: "" };
    }
  }

  function getSupportedSizesValidation(supportedSizes: string[]): ValidationError {
    let supportedSizesValidation = Validation.required(supportedSizes || []);
    if (!supportedSizesValidation.error && props.tag) {
      if (props.tag.id < 0 || !props.tag.finalized) {
        const tagAdSizes = _.uniq(getTagAds().map((ad) => {
          return `${ad.banner.width}x${ad.banner.height}`;
        }));
        const missingSizes = _.difference(tagAdSizes, supportedSizes);
        if (missingSizes.length > 0) {
          supportedSizesValidation = {
            error: true,
            message: `Some connected ads are not supported by the Tag's sizes. Please add (${missingSizes.join(", ")}) or remove the offending ads.`
          }
        }
      }
    }
    return supportedSizesValidation;
  }

  const supportSizesOptions = getSupportedSizesOptions();
  const defaultAdOptions = getDefaultAdOptions();

  const disabled = !props.writeAccess || (_.get(props, "tag.finalized", false) && _.get(props, "tag.id") > 0);

  return <Modal size="lg" show={props.show} onHide={props.onClose} onEntering={handleEntering} backdrop="static">
    <Modal.Header closeButton>
      <Modal.Title>Tag settings</Modal.Title>
    </Modal.Header>
    <Modal.Body>
      <div className="row no-gutters">
        <div className="col-lg-12 px-1">
          <Form.Group controlId="tag-settings-name">
            <Form.Label>Name *</Form.Label>
            <Form.Control
              autoFocus
              disabled={!props.writeAccess}
              type="text"
              value={name}
              isInvalid={nameValidation.error}
              onChange={handleNameChange}
            />
            {nameValidation.error && <Form.Control.Feedback type="invalid">{nameValidation.message}</Form.Control.Feedback>}
          </Form.Group>
        </div>
        <div className="col-lg-12 px-1">
          <Form.Group>
            <Form.Label>Supported sizes *</Form.Label>
            <Select
              inputId="tag-settings-supported-sizes"
              className="react-select-container multiple"
              classNamePrefix="react-select"
              name="tag-settings-supported-sizes-name"
              isDisabled={disabled}
              isMulti
              value={supportedSizes.map((s) => { return { value: s, label: s } })}
              clearable={true}
              closeMenuOnSelect={false}
              onChange={handleSupportedSizesChange}
              options={supportSizesOptions}
            />
            {supportedSizesValidation.error && <Form.Control.Feedback type="invalid" style={{ display: "block" }}>{supportedSizesValidation.message}</Form.Control.Feedback>}
          </Form.Group>
        </div>
        <div className="col-lg-12 px-1">
          <Form.Group>
            <Form.Label>Supported tag types *</Form.Label>
            <Checkbox id="tag-settings-iframe"
              checked={iframe}
              disabled={disabled}
              onChange={setIframe}>Iframe
            </Checkbox>
            <Checkbox id="tag-settings-javascript"
              checked={javascript}
              disabled={disabled}
              onChange={setJavascript}>Javascript
            </Checkbox>
            <Checkbox id="tag-settings-tracking"
              checked={tracking}
              disabled={disabled}
              onChange={setTracking}>Tracking
            </Checkbox>
            {tagTypesValidationError.error && <Form.Control.Feedback type="invalid" style={{ display: "block" }}>{tagTypesValidationError.message}</Form.Control.Feedback>}
          </Form.Group>
        </div>
        {props.tag &&
          <div className="col-lg-12 px-1">
            <Select
              inputId="tag-settings-default-campaignbanner-id"
              className="react-select-container multiple"
              classNamePrefix="react-select"
              name="tag-settings-default-campaignbanner-id-name"
              isDisabled={!props.writeAccess}
              value={defaultAdOptions.find((o) => { return o.value === defaultCampaignBannerId })}
              onChange={handleDefaultCampaignBannerIdChange}
              options={defaultAdOptions}
            />
          </div>
        }
      </div>
    </Modal.Body>
    <Modal.Footer>
      <Button size="sm" variant="light" onClick={props.onClose}>CLOSE</Button>
      <Button size="sm" variant="primary" disabled={!props.writeAccess} onClick={handleSubmit}>SAVE</Button>
    </Modal.Footer>
  </Modal>;
}
export default TagModal;