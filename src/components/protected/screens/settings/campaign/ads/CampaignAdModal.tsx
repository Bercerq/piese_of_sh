import React, { useRef, useState, Fragment, useEffect } from "react";
import { findDOMNode } from "react-dom";
import { Modal, Form, Button, InputGroup, Overlay, Tooltip } from "react-bootstrap";
import Select from "react-select";
import Datetime from "react-datetime";
import { CopyToClipboard } from "react-copy-to-clipboard/lib";
import momentPropTypes from "react-moment-proptypes";
import moment from "moment";
import * as _ from "lodash";
import * as Api from "../../../../../../client/Api";
import * as AdsHelper from "../../../../../../client/AdsHelper";
import * as Validation from "../../../../../../client/Validation";
import { SelectOption, ValidationError } from "../../../../../../client/schemas";
import { CampaignBanner, CampaignTag } from "../../../../../../models/data/Campaign";
import FontIcon from "../../../../../UI/FontIcon";
import { Ad } from "../../../../../../models/data/Ads";
import Loader from "../../../../../UI/Loader";
import ErrorContainer from "../../../../../UI/ErrorContainer";
import VideoPreview from "../../../advault/VideoPreview";
import BannerPreview from "../../../advault/BannerPreview";
import { CreativeFeed } from "../../../../../../models/data/CreativeFeed";

interface CampaignAdModalProps {
  ad: CampaignBanner;
  show: boolean;
  writeAccess: boolean;
  dataFeedAllowed: boolean;
  isAdserving: boolean;
  tags: CampaignTag[];
  dataFeeds: CreativeFeed[];
  isNewOrUpdated: boolean;
  onClose: () => void;
  onSubmit: (ad: CampaignBanner) => void;
}

const CampaignAdModal = (props: CampaignAdModalProps) => {
  const id = _.get(props, "ad.id");
  const [advertiserAd, setAdvertiserAd] = useState<Ad>(null);
  const [name, setName] = useState<string>(_.get(props, "ad.name") || "");
  const [tagId, setTagId] = useState<number>(_.get(props, "ad.tagId"));
  const [clickUrl, setClickUrl] = useState<string>(_.get(props, "ad.clickUrl") || "");
  const [startTime, setStartTime] = useState<number>(_.get(props, "ad.startTime") || null);
  const [endTime, setEndTime] = useState<number>(_.get(props, "ad.endTime") || null);
  const [dataFeedId, setDataFeedId] = useState<number>(_.get(props, "ad.dataFeedId") || null)
  const [nameValidation, setNameValidation] = useState<ValidationError>({ error: false, message: "" });
  const [clickUrlValidation, setClickUrlValidation] = useState<ValidationError>({ error: false, message: "" });
  const [copied, setCopied] = useState<boolean>(false);
  const [showLoader, setShowLoader] = useState<boolean>(true);
  const [showPreview, setShowPreview] = useState<boolean>(false);
  const [error, setError] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>("");

  const copyBtn = useRef<HTMLButtonElement>(null);

  useEffect(() => { setDataFeedId(props.ad?.dataFeedId) }, [JSON.stringify(props.ad?.dataFeedId)]);


  const handleEntering = async () => {
    setShowLoader(true);
    setShowPreview(false);
    const bannerId = _.get(props, "ad.banner.id");
    try {
      const advertiserAd: Ad = await Api.Get({ path: `/api/ads/${bannerId}` });
      setAdvertiserAd(advertiserAd);
      setShowLoader(false);
      setShowPreview(true);
      setError(false);
      setErrorMessage("");
    } catch (err) {
      setShowLoader(false);
      setError(true);
      setErrorMessage("Error loading advertiser ad.");
      setAdvertiserAd(null);
    }

    setName(_.get(props, "ad.name") || "");
    setTagId(_.get(props, "ad.tagId"));
    setClickUrl(_.get(props, "ad.clickUrl") || "");
    setStartTime(_.get(props, "ad.startTime") || null);
    setEndTime(_.get(props, "ad.endTime") || null);
    setDataFeedId(_.get(props, "ad.dataFeedId") || null);
    setNameValidation({ error: false, message: "" });
    setClickUrlValidation({ error: false, message: "" });
  }

  const handleNameChange = (e) => {
    const name = e.target.value;
    const nameValidation = Validation.required(name);
    setName(name);
    setNameValidation(nameValidation);
  }

  const handleTagChange = (selected) => {
    setTagId(selected.value as number);
  }

  const handleDataFeedChange = (selected) => {
    setDataFeedId(selected.value as number);
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

  const handleCopy = () => {
    setCopied(true);
    setTimeout(() => { setCopied(false) }, 2000);
  }

  const handleSubmit = () => {
    const nameValidation = Validation.required(name);
    if (nameValidation.error) {
      setNameValidation(nameValidation);
    } else {
      let updatedAd: Partial<CampaignBanner> = {
        id,
        name,
        clickUrl: clickUrl ? clickUrl : null,
        startTime: startTime ? startTime : null,
        endTime: endTime ? endTime : null,
        dataFeedId: dataFeedId ? dataFeedId : null,
      }
      if (props.isAdserving && id < 0) {
        updatedAd.tagId = tagId;
      }
      //for now
      setDataFeedId(null)
      props.onSubmit(_.assign({}, props.ad, updatedAd));
    }
  }

  function getTagSelectOptions(): SelectOption[] {
    if (props.isAdserving) {
      const adSize = `${_.get(props, "ad.banner.width")}x${_.get(props, "ad.banner.height")}`;
      const tags = props.tags.filter((t) => { return t.supportedSizes.indexOf(adSize) > -1 });
      return tags.map((t) => { return { value: t.id, label: t.name } });
    }
    return [];
  }

  function getDataFeedOptions(): SelectOption[] {
    return [{ value: null, label: "None" }, ...props.dataFeeds.map((t) => { return { value: t.id, label: t.name } })];
  }

  function getClassNames() {
    return copied ? "gray-box mb-2 highlight-box" : "gray-box mb-2";
  }

  const tagSelectOptions = getTagSelectOptions();
  const dataFeedOptions = getDataFeedOptions();
  const previewTag = _.get(advertiserAd, "previewTag") || _.get(advertiserAd, "tag") || "";
  const landingPagePlaceholder = _.get(advertiserAd, "clickUrl") ? `default landing page: ${_.get(advertiserAd, "clickUrl")}` : "";
  const isVideoAd = advertiserAd ? AdsHelper.isVideoAd(advertiserAd.type) : false;

  return <Modal dialogClassName="modal-xxl" show={props.show} onHide={props.onClose}
    onEntering={handleEntering} backdrop="static">
    <Modal.Header closeButton>
      <Modal.Title>Ad settings</Modal.Title>
    </Modal.Header>
    <Modal.Body>
      <div className="row no-gutters">
        <Loader visible={showLoader} />
        {!showLoader && !error && <Fragment>
          <div className="col-lg-5">
            <div className="row no-gutters">
              {props.isAdserving &&
                <div className="col-lg-12 px-1">
                  <Form.Group>
                    <Form.Label>Tag</Form.Label>
                    <Select
                      inputId="ad-settings-tag"
                      className="react-select-container multiple"
                      classNamePrefix="react-select"
                      name="ad-settings-tag-name"
                      isDisabled={id > 0}
                      value={tagSelectOptions.find((o) => { return o.value === tagId })}
                      onChange={handleTagChange}
                      options={tagSelectOptions}
                    />
                  </Form.Group>
                </div>
              }
              <div className="col-lg-12 px-1">
                <Form.Group controlId="ad-settings-name">
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
                  <Form.Label>Landing Page</Form.Label>
                  <Form.Control
                    disabled={!props.writeAccess}
                    id="ad-settings-clickurl"
                    type="text"
                    placeholder={landingPagePlaceholder}
                    value={clickUrl}
                    isInvalid={clickUrlValidation.error}
                    onChange={handleClickUrlChange}
                  />
                  {clickUrlValidation.error && <Form.Control.Feedback type="invalid">{clickUrlValidation.message}</Form.Control.Feedback>}
                </Form.Group>
              </div>
            </div>
            <div className="row no-gutters mb-3">
              <div className="col-lg-6 px-1">
                <Form.Label>Start time (left blank uses campaign start time)</Form.Label>
                <InputGroup>
                  <InputGroup.Prepend>
                    <InputGroup.Text><FontIcon name="calendar" /></InputGroup.Text>
                  </InputGroup.Prepend>
                  <Datetime
                    inputProps={{ disabled: !props.writeAccess }}
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
                    inputProps={{ disabled: !props.writeAccess }}
                    dateFormat="YYYY-MM-DD"
                    timeFormat="HH:mm"
                    onChange={handleEndTimeChange}
                    value={endTime ? moment.unix(endTime) : null}
                  />
                </InputGroup>
              </div>
            </div>
            <div className="row no-gutters">
              {props.dataFeedAllowed &&
                <div className="col-lg-12 px-1">
                  <Form.Group>
                    <Form.Label>Data feed</Form.Label>
                    <Select
                      inputId="ad-settings-data-feed"
                      className="react-select-container"
                      classNamePrefix="react-select"
                      name="ad-settings-data-feed-name"
                      clearable={true}
                      closeMenuOnSelect={true}
                      value={dataFeedOptions.find((o) => { return o.value === dataFeedId })}
                      onChange={handleDataFeedChange}
                      options={dataFeedOptions}
                    />
                  </Form.Group>
                </div>
              }
            </div>
            <div className="row no-gutters">
              <div className="col-lg-12 px-1">
                <Form.Group controlId="ad-settings-previewtag">
                  <Form.Label>Preview code</Form.Label>
                  <div className={getClassNames()}>{previewTag}</div>
                  <CopyToClipboard text={previewTag} onCopy={handleCopy}>
                    <button ref={copyBtn} className="btn btn-primary btn-sm pull-right"><FontIcon name="files-o" /> GET CODE</button>
                  </CopyToClipboard>
                  <Overlay target={findDOMNode(copyBtn.current) as any} show={copied} placement="bottom">
                    <Tooltip id="copy-share-tag-tooltip">Copied!</Tooltip>
                  </Overlay>
                </Form.Group>
              </div>
            </div>
          </div>
          {advertiserAd &&
            <div className="col-lg-7">
              <div className="col-lg-12">
                {props.isNewOrUpdated &&
                  <div className="text-danger">
                    Preview is possibly outdated; please save the campaign
                  </div>
                }
                {showPreview && isVideoAd && <VideoPreview id="ad-settings-video-preview-player" ad={advertiserAd} />}
                {showPreview && !isVideoAd && <BannerPreview id="ad-settings-banner-preview" ad={advertiserAd} />}
              </div>
            </div>
          }
        </Fragment>
        }
        {!showLoader && error &&
          <div className="col-lg-12">
            <ErrorContainer message={errorMessage} />
          </div>
        }
      </div>
    </Modal.Body>
    <Modal.Footer>
      <Button size="sm" variant="light" onClick={props.onClose}>CLOSE</Button>
      <Button size="sm" variant="primary" disabled={!props.writeAccess} onClick={handleSubmit}>OKAY</Button>
    </Modal.Footer>
  </Modal>;
}
export default CampaignAdModal;