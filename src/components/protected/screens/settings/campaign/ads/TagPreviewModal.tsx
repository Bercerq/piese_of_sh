import React from "react";
import { Modal, Button } from "react-bootstrap";
import * as _ from "lodash";
import * as AdsHelper from "../../../../../../client/AdsHelper";
import { CampaignTag } from "../../../../../../models/data/Campaign";

declare var $: any;

interface TagPreviewModalProps {
  show: boolean;
  tag: CampaignTag;
  onClose: () => void;
}

const TagPreviewModal = (props: TagPreviewModalProps) => {

  const handleEntering = () => {
    const iframeTag = _.get(props, "tag.iframeTag", "");
    $("#tag-iframe-preview").html(iframeTag);

    const $iframe = $("#tag-iframe-preview").find("iframe");
    const width = $iframe.width();
    const height = $iframe.height();

    resizePreview($iframe, width, height);
  }

  function resizePreview($elem, width, height) {
    const containerWidth = $elem.parent().width();
    const scale = AdsHelper.previewScale(width, containerWidth);
    const style = AdsHelper.previewStyle(width, height, scale);
    $elem.attr("style", style);
    $elem.parent().height(height * scale);
  }

  const handleClose = () => {
    $("#tag-iframe-preview").html("");
    props.onClose();
  }

  return <Modal dialogClassName="modal-xxl" show={props.show} onEntering={handleEntering} onHide={handleClose} backdrop="static">
    <Modal.Header closeButton>
      <Modal.Title>Tag preview - id: {_.get(props, "tag.id", "")}</Modal.Title>
    </Modal.Header>
    <Modal.Body>
      <div id="tag-iframe-preview"></div>
    </Modal.Body>
    <Modal.Footer>
      <Button variant="light" size="sm" onClick={handleClose}>CANCEL</Button>
    </Modal.Footer>
  </Modal>;
}
export default TagPreviewModal;