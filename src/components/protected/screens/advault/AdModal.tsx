import React, { useState, useEffect, Fragment } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import * as _ from "lodash";
import BannerPreview from "./BannerPreview";
import VideoPreview from "./VideoPreview";
import * as Api from "../../../../client/Api";
import * as AdsHelper from "../../../../client/AdsHelper";
import { Ad } from "../../../../models/data/Ads";
import AdForm from "./AdForm";
import Loader from "../../../UI/Loader";
import ErrorContainer from "../../../UI/ErrorContainer";

interface AdModalProps {
  id: number;
  show: boolean;
  writeAccess: boolean;
  onClose: () => void;
  onSubmit: (id: number, data: Partial<Ad>) => void;
}

const AdModal = (props: AdModalProps) => {
  const id = _.get(props, "id", -1);

  const [ad, setAd] = useState<Ad>(null);
  const [adType, setAdType] = useState<string>("");
  const [showLoader, setShowLoader] = useState<boolean>(true);
  const [showPreview, setShowPreview] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);
  const [updatedAd, setUpdatedAd] = useState<Partial<Ad>>(null);
  const [previewAd, setPreviewAd] = useState<Ad>(null);
  const [error, setError] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [validationError, setValidationError] = useState<boolean>(false);

  useEffect(save, [validationError, updatedAd]);

  function save() {
    if (!validationError) {
      props.onSubmit(id, updatedAd);
    }
  }

  const handleEntering = async () => {
    setShowLoader(true);
    if (id > 0) {
      try {
        const ad: Ad = await Api.Get({ path: `/api/ads/${id}` });
        setAd(ad);
        const adType = _.get(ad, "adType", "");
        setAdType(adType);
        setPreviewAd(ad);
        setShowPreview(true);
        setShowLoader(false);
        setError(false);
        setErrorMessage("");
      } catch (err) {
        setShowLoader(false);
        setError(true);
        setErrorMessage("Error loading ad.");
        setAd(null);
        setPreviewAd(null);
      }
    }
  }

  const handleClose = () => {
    clearState();
    props.onClose();
  }

  const handleSubmit = () => {
    setSaving(true);
  }

  const adFormSubmit = (error: boolean, ad: Partial<Ad>) => {
    setValidationError(error);
    setUpdatedAd(ad);
    setSaving(false);
  }

  const adPreviewChange = (ad: Ad) => {
    setPreviewAd(ad);
  }

  function clearState() {
    setSaving(false);
    setAdType("");
    setPreviewAd(null);
    setShowPreview(false);
    setAd(null);
    setError(false);
    setErrorMessage("");
    setShowLoader(false);
  }

  const isVideoAd = ad ? AdsHelper.isVideoAd(ad.type) : false;

  return <Modal dialogClassName="modal-xxl" show={props.show} onHide={handleClose} onEntering={handleEntering} backdrop="static">
    <Modal.Header closeButton>
      <Modal.Title>Ad settings - id: {id}</Modal.Title>
    </Modal.Header>
    <Modal.Body>
      <div className="row">
        <Loader visible={showLoader} />
        {!showLoader && !error &&
          <Fragment>
            <div className="col-lg-5">
              <Form.Group controlId="ad-type">
                <Form.Label>Ad Type</Form.Label>
                <Form.Control
                  readOnly
                  type="text"
                  value={adType}
                />
              </Form.Group>
              <AdForm ad={ad} submit={saving} onSubmit={adFormSubmit} onPreviewChange={adPreviewChange} />
            </div>
            {previewAd &&
              <div className="col-lg-7">
                {showPreview && isVideoAd && <VideoPreview id="video-preview-player" ad={previewAd} />}
                {showPreview && !isVideoAd && <BannerPreview id="banner-preview" ad={previewAd} />}
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
      <Button size="sm" variant="light" onClick={handleClose}>CANCEL</Button>
      <Button size="sm" variant="primary" onClick={handleSubmit} disabled={saving}>SAVE</Button>
    </Modal.Footer>
  </Modal>;
}
export default AdModal;