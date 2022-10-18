import React, { useState, useEffect } from "react";
import * as _ from "lodash";
import VideoPreview from "../../advault/VideoPreview";
import BannerPreview from "../../advault/BannerPreview";
import * as Api from "../../../../../client/Api";
import * as AdsHelper from "../../../../../client/AdsHelper";
import { Ad, AdPreview } from "../../../../../models/data/Ads";
import Loader from "../../../../UI/Loader";
import ErrorContainer from "../../../../UI/ErrorContainer";
import { RetailBranch } from "../../../../../models/data/RetailBranch";
import { Modal, Form, Button } from "react-bootstrap";
import Select from "react-select";
import { adTypeOptions } from "../../../../../client/CampaignHelper";


interface RetailAdPreviewModalProps {
  show: boolean;
  ads: { value: string, name: string }[];
  branch: RetailBranch;
  onClose: () => void;
}

const RetailAdPreviewModal = (props: RetailAdPreviewModalProps) => {

  const [advertiserAd, setAdvertiserAd] = useState<Ad>(null);
  const [showLoader, setShowLoader] = useState<boolean>(true);
  const [showPreview, setShowPreview] = useState<boolean>(false);
  const [error, setError] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [selectedAd, setSelectedAd] = useState<string>((props.ads.length > 0)? props.ads[0].value : "0");
  const [isVideoAd, setIsVideoAd] = useState<boolean>(advertiserAd ? AdsHelper.isVideoAd(advertiserAd.type) : false);

  useEffect(() => { onEntering() }, [selectedAd]);

  const handleClose = () => {
    setShowPreview(false);
    setAdvertiserAd(null);
    setShowLoader(false);
    setError(false);
    setErrorMessage("");
    props.onClose();
  }

  const onEntering = async () => {
    setShowLoader(true);
    setShowPreview(false);
    try {
      if (selectedAd != "0") {
        const advertiserAd: Ad = await Api.Get({ path: `/api/ads/${selectedAd}` });
        const previewAd: AdPreview = await Api.Get({ path: `/api/ads/previewRetail/${advertiserAd.advertiserId}/ad/${advertiserAd.id}/branch/${props.branch.id}` });
        advertiserAd.previewTag = previewAd.preview;
     
        setAdvertiserAd(advertiserAd);
        setIsVideoAd(AdsHelper.isVideoAd(advertiserAd.type))
      }
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
  }

 
  return <Modal dialogClassName="modal-xxl" show={props.show} onEntering={onEntering} onHide={handleClose} backdrop="static">
    <Modal.Header closeButton>
      <Modal.Title>Ad preview - branch {props?.branch?.name}</Modal.Title>
    </Modal.Header>
    <Modal.Body>

      <div className="row">
        <Loader visible={showLoader} />
        {!showLoader && !error &&
          <div className="col-lg-12">
            {props.ads.length > 0 && <span> Ad:
              <Form.Group>
                <Select
                  inputId={`preview-from-branch`}
                  className="react-select-container"
                  classNamePrefix="react-select"
                  clearable={false}
                  value={props.ads.find((o) => { return o.value === selectedAd })}
                  onChange={a => setSelectedAd(a.value)}
                  options={props.ads}
                /></Form.Group>
            </span>}
            {showPreview && advertiserAd && isVideoAd && <VideoPreview id="video-preview-player" ad={advertiserAd} />}
            {showPreview && advertiserAd && !isVideoAd && <BannerPreview id="banner-preview" ad={advertiserAd} />}
          </div>
        }
        {!showLoader && error &&
          <div className="col-lg-12">
            <ErrorContainer message={errorMessage} />
          </div>
        }
      </div>

    </Modal.Body>
    <Modal.Footer>
      <Button variant="light" size="sm" onClick={handleClose}>CANCEL</Button>
    </Modal.Footer>
  </Modal>;
}
export default RetailAdPreviewModal;