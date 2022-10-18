import React, { useState } from "react";
import { Modal, Form, InputGroup, Button } from "react-bootstrap";
import Select from "react-select";
import Datetime from "react-datetime";
import momentPropTypes from "react-moment-proptypes";
import moment from "moment";
import * as _ from "lodash";
import * as Api from "../../../../../../client/Api";
import * as AdsHelper from "../../../../../../client/AdsHelper";
import * as Validation from "../../../../../../client/Validation";
import { SelectOption, ValidationError } from "../../../../../../client/schemas";
import { CampaignBanner, CampaignTag } from "../../../../../../models/data/Campaign";
import { Ad } from "../../../../../../models/data/Ads";
import FontIcon from "../../../../../UI/FontIcon";

interface LinkAdsModalProps {
  show: boolean;
  isAdserving: boolean;
  videoCampaign: boolean;
  tags?: CampaignTag[];
  ads: CampaignBanner[];
  advertiserId: number;
  onClose: () => void;
  onSubmit: (linkAdsFields: LinkAdsFields) => void;
}

export interface LinkAdsFields {
  ads: Ad[];
  clickUrl?: string;
  startTime?: number;
  endTime?: number;
  tagId?: number;
}

const LinkAdsModal = (props: LinkAdsModalProps) => {
  const [tagRadioValue, setTagRadioValue] = useState<"create" | "select">("create");
  const [tagId, setTagId] = useState<number>(null);
  const [advertiserAds, setAdvertiserAds] = useState<Ad[]>([]);
  const [selectedAds, setSelectedAds] = useState<SelectOption[]>([]);
  const [clickUrl, setClickUrl] = useState<string>("");
  const [startTime, setStartTime] = useState<number>(null);
  const [endTime, setEndTime] = useState<number>(null);
  const [selectedAdsValidation, setSelectedAdsValidation] = useState<ValidationError>({ error: false, message: "" });
  const [selectTagValidation, setSelectTagValidation] = useState<ValidationError>({ error: false, message: "" });
  const [clickUrlValidation, setClickUrlValidation] = useState<ValidationError>({ error: false, message: "" });

  const handleEntering = async () => {
    if (props.isAdserving && (props.tags || []).length > 0) {
      setTagId(props.tags[0].id);
    }
    setTagRadioValue("create");
    setSelectedAds([]);
    setClickUrl("");
    setStartTime(null);
    setEndTime(null);
    setSelectedAdsValidation({ error: false, message: "" });
    setSelectTagValidation({ error: false, message: "" });
    setClickUrlValidation({ error: false, message: "" });

    const advertiserAds = await Api.Get({ path: `/api/ads`, qs: { advertiserId: props.advertiserId, active: "true" } });
    setAdvertiserAds(advertiserAds);
  }

  function getTagSelectOptions() {
    return (props.tags || []).map((tag) => { return { value: tag.id, label: tag.name } });
  }

  function getSelectAdsOptions(): SelectOption[] {
    const filteredAds = getFilteredAds();
    return filteredAds.map((ad) => {
      const adUsedCount = props.ads.filter((o) => { return o.bannerId === ad.id; }).length;
      return {
        value: ad.id,
        label: ad.name,
        count: adUsedCount
      }
    });
  }

  function getFilteredAds(): Ad[] {
    if (props.videoCampaign) {
      return advertiserAds.filter((ad) => { return AdsHelper.isVideoAd(ad.type) && ad.submissionType === 1; });
    } else if (props.isAdserving) {
      if (tagRadioValue === "select") {
        const selectedTag = props.tags.find((t) => {
          return t.id === tagId;
        });
        const supportedSizes = _.get(selectedTag, "supportedSizes") || [];
        return advertiserAds.filter((ad) => {
          const adSize = `${ad.width}x${ad.height}`;
          return !AdsHelper.isThirdPartyBanner(ad) && supportedSizes.indexOf(adSize) > -1;
        });
      } else {
        return advertiserAds.filter((ad) => {
          return !AdsHelper.isThirdPartyBanner(ad);
        });
      }
    } else {
      return advertiserAds.filter((ad) => { return !AdsHelper.isVideoAd(ad.type) && ad.submissionType === 1; });
    }
  }

  function getSelectTagValidation(): ValidationError {
    if (props.isAdserving && tagRadioValue === "select" && props.tags.length === 0) {
      return { error: true, message: "Please create at least one tag in order to link ads." }
    }
    return { error: false, message: "" };
  }

  const handleSubmit = () => {
    const adValues = (selectedAds || []).map((o) => { return o.value as string; });
    const selectedAdsValidation = Validation.required(adValues);
    const clickUrlValidation = Validation.url(clickUrl, false);
    if (props.isAdserving) {
      const selectTagValidation = getSelectTagValidation();
      if (selectTagValidation.error || selectedAdsValidation.error || clickUrlValidation.error) {
        setSelectedAdsValidation(selectedAdsValidation);
        setSelectTagValidation(selectTagValidation);
        setClickUrlValidation(clickUrlValidation);
      } else {
        const ads = getSelectedAdvertiserAds();
        let linkAdsFields: LinkAdsFields = {
          ads,
          clickUrl,
          startTime,
          endTime
        };

        if (tagRadioValue === "select") {
          linkAdsFields.tagId = tagId;
        }
        props.onSubmit(linkAdsFields);
      }
    } else {
      if (selectedAdsValidation.error || clickUrlValidation.error) {
        setSelectedAdsValidation(selectedAdsValidation);
        setClickUrlValidation(clickUrlValidation);
      } else {
        const ads = getSelectedAdvertiserAds();
        const linkAdsFields = {
          ads,
          clickUrl,
          startTime,
          endTime
        };
        props.onSubmit(linkAdsFields);
      }
    }
  }

  function getSelectedAdvertiserAds() {
    const selectedAdIds = selectedAds.map((o) => { return o.value as number; });
    return advertiserAds.filter((o) => { return selectedAdIds.indexOf(o.id) > -1; });
  }

  const handleTagRadioChange = (e) => {
    if (e.target.checked) {
      setTagRadioValue(e.target.value);
    }
  }

  const handleTagSelectChange = (selected) => {
    setTagId(selected.value as number);
  }

  const handleAdsSelectChange = (selected) => {
    setSelectedAds(selected);
    const adValues = (selected || []).map((o) => { return o.value as string; });
    const selectedAdsValidation = Validation.required(adValues);
    setSelectedAdsValidation(selectedAdsValidation);
  }

  const handleClickUrlChange = (e) => {
    const clickUrl = e.target.value;
    const clickUrlValidation = Validation.url(clickUrl, false);
    setClickUrl(clickUrl);
    setClickUrlValidation(clickUrlValidation);
  }

  const handleStartTimeChange = (date) => {
    setStartTime(moment(date).unix());
  }

  const handleEndTimeChange = (date) => {
    setEndTime(moment(date).unix());
  }

  const formatAdsLabel = (option: SelectOption) => {
    if (option.count as number === 0) {
      return option.label;
    }
    return <span><span className="badge badge-secondary">{option.count}x</span> {option.label}</span>;
  }

  const tagRadioOptions = [
    { value: "create", label: "Create new tags" },
    { value: "select", label: "Select tag" },
  ]

  const tagSelectOptions = props.isAdserving ? getTagSelectOptions() : [];
  const selectAdsOptions = getSelectAdsOptions();

  return <Modal size="lg" show={props.show} onHide={props.onClose} onEntering={handleEntering} backdrop="static">
    <Modal.Header closeButton>
      <Modal.Title>Link ads</Modal.Title>
    </Modal.Header>
    <Modal.Body>
      <div className="row no-gutters">
        {false && props.isAdserving && //disabled option for now - too advanced, always create new tag
          <div className="col-lg-12 px-1">
            <Form.Group>
              {
                tagRadioOptions.map((o, i) => <Form.Check inline
                  id={`link-ads-tag-radio-${o.value}`}
                  type="radio"
                  value={o.value}
                  name="link-ads-tag-radio"
                  checked={o.value === tagRadioValue}
                  onChange={handleTagRadioChange}
                  label={o.label} />)
              }
            </Form.Group>
          </div>
        }
        {props.isAdserving && tagRadioValue === "select" &&
          <div className="col-lg-12 px-1">
            <Form.Group>
              <Select
                inputId={`link-ads-tag-select`}
                className="react-select-container"
                classNamePrefix="react-select"
                clearable={false}
                value={tagSelectOptions.find((o) => { return o.value === tagId })}
                onChange={handleTagSelectChange}
                options={tagSelectOptions}
              />
              {selectTagValidation.error && <Form.Control.Feedback type="invalid" style={{ display: "block" }}>{selectTagValidation.message}</Form.Control.Feedback>}
            </Form.Group>
          </div>
        }
        <div className="col-lg-12 px-1">
          <Form.Group>
            <Select
              inputId={`link-ads-select`}
              className="react-select-container"
              classNamePrefix="react-select"
              clearable={false}
              isMulti
              closeMenuOnSelect={false}
              formatOptionLabel={formatAdsLabel}
              value={selectedAds}
              onChange={handleAdsSelectChange}
              options={selectAdsOptions}
            />
            {selectedAdsValidation.error && <Form.Control.Feedback type="invalid" style={{ display: "block" }}>{selectedAdsValidation.message}</Form.Control.Feedback>}
          </Form.Group>
        </div>
        <div className="col-lg-12 px-1">
          <Form.Group>
            <Form.Label>Landing Page (left blank uses ad landing page)</Form.Label>
            <Form.Control
              id="link-ads-clickurl"
              type="text"
              value={clickUrl}
              isInvalid={clickUrlValidation.error}
              onChange={handleClickUrlChange}
            />
            {clickUrlValidation.error && <Form.Control.Feedback type="invalid">{clickUrlValidation.message}</Form.Control.Feedback>}
          </Form.Group>
        </div>
      </div>
      <div className="row no-gutters">
        <div className="col-lg-6 px-1">
          <Form.Label>Start time (left blank uses campaign start time)</Form.Label>
          <InputGroup>
            <InputGroup.Prepend>
              <InputGroup.Text><FontIcon name="calendar" /></InputGroup.Text>
            </InputGroup.Prepend>
            <Datetime
              dateFormat="YYYY-MM-DD"
              timeFormat="HH:mm"
              onChange={handleStartTimeChange}
              value={startTime ? moment.unix(startTime) : null}
            />
          </InputGroup>
        </div>
        <div className="col-lg-6 px-1">
          <Form.Label>End time (left blank uses campaign end time)</Form.Label>
          <InputGroup>
            <InputGroup.Prepend>
              <InputGroup.Text><FontIcon name="calendar" /></InputGroup.Text>
            </InputGroup.Prepend>
            <Datetime
              dateFormat="YYYY-MM-DD"
              timeFormat="HH:mm"
              onChange={handleEndTimeChange}
              value={endTime ? moment.unix(endTime) : null}
            />
          </InputGroup>
        </div>
      </div>
    </Modal.Body>
    <Modal.Footer>
      <Button size="sm" variant="light" onClick={props.onClose}>CLOSE</Button>
      <Button size="sm" variant="primary" onClick={handleSubmit}>OKAY</Button>
    </Modal.Footer>
  </Modal>;
}
export default LinkAdsModal;