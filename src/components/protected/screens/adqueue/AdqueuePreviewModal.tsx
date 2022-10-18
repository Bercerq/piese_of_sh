import React, { useState } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import * as _ from "lodash";
import BannerPreview from "../advault/BannerPreview";
import VideoPreview from "../advault/VideoPreview";
import * as AdsHelper from "../../../../client/AdsHelper";
import { Ad, AdqueueUpdateAction } from "../../../../models/data/Ads";

interface AdqueuePreviewModalProps {
  show: boolean;
  ad: Ad | null;
  onClose: () => void;
  update: (ad: Ad, action: AdqueueUpdateAction, data: Partial<Ad>) => void;
}

const AdqueuePreviewModal = (props: AdqueuePreviewModalProps) => {
  const [showPreview, setShowPreview] = useState<boolean>(false);

  const handleClose = () => {
    setShowPreview(false);
    props.onClose();
  }

  const onEntering = () => {
    setShowPreview(true);
  }

  const handleApprove = () => {
    props.update(props.ad, "approve", { approved: 1 });
  }

  const handleDisapprove = () => {
    props.update(props.ad, "disapprove", { approved: -1 });
  }

  const previewTag = props.ad ? (props.ad.vastURL || props.ad.vastXML || props.ad.previewTag || props.ad.tag) : "";
  const isVideoAd = props.ad ? AdsHelper.isVideoAd(props.ad.type) : false;
  const id = _.get(props, "ad.id", "");
  return <Modal dialogClassName="modal-xxl" show={props.show} onEntering={onEntering} onHide={handleClose} backdrop="static">
    <Modal.Header closeButton>
      <Modal.Title>Ad preview - id: {id}</Modal.Title>
    </Modal.Header>
    <Modal.Body>
      {props.ad &&
        <div className="row">
          <div className="col-lg-6">
            <Form.Group controlId="ad-name">
              <Form.Label>Name</Form.Label>
              <Form.Control
                readOnly
                autoFocus
                type="text"
                value={props.ad.name}
              />
            </Form.Group>
            <Form.Group controlId="ad-url">
              <Form.Label>Landing page</Form.Label>
              <Form.Control
                readOnly
                autoFocus
                type="text"
                value={props.ad.clickUrl}
              />
            </Form.Group>
            <Form.Group controlId="ad-tag">
              <Form.Label>Tag</Form.Label>
              <Form.Control as="textarea"
                autoFocus
                readOnly
                type="text"
                rows={6}
                value={previewTag}
              />
            </Form.Group>
          </div>
          <div className="col-lg-6">
            {showPreview && isVideoAd && <VideoPreview id="video-preview-player" ad={props.ad} />}
            {showPreview && !isVideoAd && <BannerPreview id="banner-preview" ad={props.ad} />}
          </div>
        </div>
      }
    </Modal.Body>
    <Modal.Footer>
      <Button variant="light" size="sm" onClick={handleClose}>CANCEL</Button>
      <Button variant="primary" size="sm" onClick={handleApprove}>APPROVE</Button>
      <Button variant="primary" size="sm" onClick={handleDisapprove}>DISAPPROVE</Button>
    </Modal.Footer>
  </Modal>;
}
export default AdqueuePreviewModal;