import React, { useState } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import * as _ from "lodash";
import { ValidationError } from "../../../../../client/schemas";
import * as Validation from "../../../../../client/Validation";
import { PublisherEntity, PublisherSettings } from "../../../../../models/data/Publisher";

interface PublisherModalProps {
  publisher: PublisherEntity;
  show: boolean;
  writeAccess: boolean;
  onClose: () => void;
  onSubmit?: (id: number, settings: PublisherSettings) => void;
}

const PublisherModal = (props: PublisherModalProps) => {
  const [saving, setSaving] = useState<boolean>(false);
  const [name, setName] = useState<string>(_.get(props, "publisher.settings.name", ""));
  const [nameValidation, setNameValidation] = useState<ValidationError>({ error: false, message: "" });
  const [defaultDealFloorPrice, setDefaultDealFloorPrice] = useState<string>(_.get(props, "publisher.settings.defaultDealFloorPrice", "").toString());

  const handleClose = () => {
    clearState();
    props.onClose();
  };

  const handleEntering = () => {
    const name = _.get(props, "publisher.settings.name", "");
    const defaultDealFloorPrice = _.get(props, "publisher.settings.defaultDealFloorPrice", "").toString();
    setName(name);
    setDefaultDealFloorPrice(defaultDealFloorPrice);
    setSaving(false);
  }

  const handleNameChange = (e) => {
    const name = e.target.value;
    const nameValidation = Validation.required(name);
    setName(name);
    setNameValidation(nameValidation);
  }

  const handleSubmit = () => {
    const nameValidation = Validation.required(name);
    if (nameValidation.error) {
      setNameValidation(nameValidation);
    } else {
      setSaving(true);
      props.onSubmit(props.publisher.id, { name, defaultDealFloorPrice: parseFloat(defaultDealFloorPrice) });
    }
  }

  function clearState() {
    setSaving(false);
    setName("");
    setNameValidation({ error: false, message: "" });
  }

  return <Modal className="publisher-modal" show={props.show} onHide={handleClose} onEntering={handleEntering} backdrop="static">
    <Modal.Header closeButton>
      <Modal.Title>Publisher settings</Modal.Title>
    </Modal.Header>
    <Modal.Body>
      <div className="row">
        <div className="col-sm-12">
          <Form.Group controlId="publisher-name">
            <Form.Label>Name *</Form.Label>
            <Form.Control
              autoFocus
              readOnly={!props.writeAccess}
              isInvalid={nameValidation.error}
              type="text"
              value={name}
              onChange={handleNameChange}
            />
            {nameValidation.error && <Form.Control.Feedback type="invalid">{nameValidation.message}</Form.Control.Feedback>}
          </Form.Group>
          <Form.Group controlId="publisher-defaultfloorprice">
            <Form.Label>Default deal floor price *</Form.Label>
            <Form.Control
              readOnly={!props.writeAccess}
              required
              type="number"
              step="0.01"
              min="0"
              value={defaultDealFloorPrice}
              onChange={(e) => setDefaultDealFloorPrice(e.target.value)}
            />
          </Form.Group>
        </div>
      </div>
    </Modal.Body>
    <Modal.Footer>
      <Button variant="light" size="sm" onClick={handleClose}>CANCEL</Button>
      <Button variant="primary" size="sm" onClick={handleSubmit} disabled={saving || !props.writeAccess}>SAVE</Button>
    </Modal.Footer>
  </Modal>;
}

export default PublisherModal;