import React, { useState, useRef } from "react";
import { findDOMNode } from "react-dom";
import { Modal, Button, Form, Tooltip, Overlay } from "react-bootstrap";
import { CopyToClipboard } from "react-copy-to-clipboard/lib";
import * as _ from "lodash";
import * as Utils from "../../../../client/Utils";
import FontIcon from "../../../UI/FontIcon";
import * as Validation from "../../../../client/Validation";
import { ValidationError } from "../../../../client/schemas";

interface AdShareModalProps {
  show: boolean;
  id: number;
  onClose: () => void;
}

const AdShareModal = (props: AdShareModalProps) => {
  const defaultPreviewUrl = "https://www.npostart.nl/matthijs-gaat-door/02-10-2021/BV_101406586";
  const [previewUrl, setPreviewUrl] = useState<string>(defaultPreviewUrl);
  const [copied, setCopied] = useState<boolean>(false);
  const [previewUrlValidation, setPreviewUrlValidation] = useState<ValidationError>({ error: false, message: "" });

  const copyBtn = useRef<HTMLButtonElement>(null);

  const handleClose = () => {
    props.onClose();
  }

  const onEntering = () => {
    setPreviewUrl(defaultPreviewUrl);
    setPreviewUrlValidation({ error: false, message: "" });
  }

  const handlePreviewUrlChange = (e) => {
    const previewUrl = e.target.value;
    const previewUrlValidation = Validation.url(previewUrl, true);
    setPreviewUrl(previewUrl);
    setPreviewUrlValidation(previewUrlValidation);
  }

  const handleCopy = () => {
    setCopied(true);
    setTimeout(() => { setCopied(false) }, 2000);
  }

  function getClassNames() {
    return copied ? "gray-box mb-2 highlight-box" : "gray-box mb-2";
  }

  const tag = Utils.addQueryParam(previewUrl, { ster_preview_id: props.id.toString() });

  return <Modal size="lg" show={props.show} onEntering={onEntering} onHide={handleClose} backdrop="static">
    <Modal.Header closeButton>
      <Modal.Title>Ad share - id: {props.id}</Modal.Title>
    </Modal.Header>
    <Modal.Body>
      {props.id > 0 &&
        <div className="row">
          <div className="col-lg-12">
            <Form.Group controlId="ad-type">
              <Form.Label>Preview url</Form.Label>
              <Form.Control
                autoFocus
                type="text"
                value={previewUrl}
                isInvalid={previewUrlValidation.error}
                onChange={handlePreviewUrlChange}
              />
              {previewUrlValidation.error && <Form.Control.Feedback type="invalid">{previewUrlValidation.message}</Form.Control.Feedback>}
            </Form.Group>
            <Form.Group controlId="ad-type">
              <Form.Label>Share link</Form.Label>
              <div className={getClassNames()}>{tag}</div>
            </Form.Group>
          </div>
        </div>
      }
    </Modal.Body>
    <Modal.Footer>
      <Button variant="light" size="sm" onClick={handleClose}>CANCEL</Button>
      <CopyToClipboard text={tag} onCopy={handleCopy}>
        <button ref={copyBtn} className="btn btn-primary btn-sm"><FontIcon name="files-o" /> GET LINK</button>
      </CopyToClipboard>
      <Overlay target={findDOMNode(copyBtn.current) as any} show={copied} placement="bottom">
        <Tooltip id="copy-share-tag-tooltip">Copied!</Tooltip>
      </Overlay>
    </Modal.Footer>
  </Modal>;
}
export default AdShareModal;