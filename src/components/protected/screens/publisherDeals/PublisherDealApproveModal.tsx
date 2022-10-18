import React, { useState, useEffect } from "react";
import momentPropTypes from "react-moment-proptypes";
import moment from "moment";
import { Modal, Button, Form, InputGroup } from "react-bootstrap";
import * as _ from "lodash";
import Datetime from "react-datetime";
import * as Validation from "../../../../client/Validation";
import { ValidationError } from "../../../../client/schemas";
import { PublisherDeal } from "../../../../models/data/PublisherDeal";
import FontIcon from "../../../UI/FontIcon";

interface PublisherDealApproveModalProps {
  deal: PublisherDeal;
  defaultFloorPrice: number;
  show: boolean;
  onClose: () => void;
  onSubmit: (id: number, dealApprove: PublisherDeal) => void;
}

const PublisherDealApproveModal = (props: PublisherDealApproveModalProps) => {
  const initialDate = moment().add(1, 'years').endOf('day');
  const [saving, setSaving] = useState<boolean>(false);
  const [name, setName] = useState<string>("");
  const [floorPrice, setFloorPrice] = useState<number>(props.defaultFloorPrice);
  const [expirationDate, setExpirationDate] = useState<momentPropTypes.momentObj>(initialDate);
  const [nameValidation, setNameValidation] = useState<ValidationError>({ error: false, message: "" });

  useEffect(() => { setFloorPrice(props.defaultFloorPrice) }, [props.defaultFloorPrice]);

  const handleClose = () => {
    clearState();
    props.onClose();
  };

  const handleEntering = async () => {
    clearState();
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
      const id = _.get(props, "deal.id");
      props.onSubmit(id, { name, floorPrice, expirationDate: expirationDate.format("YYYY-MM-DD HH:mm:ss") });
    }
  }

  function clearState() {
    setName("");
    setExpirationDate(initialDate);
    setFloorPrice(props.defaultFloorPrice);
    setNameValidation({ error: false, message: "" });
    setSaving(false);
  }

  const messageFromBuyer = _.get(props, "deal.description", "");

  return <Modal show={props.show} onHide={handleClose} onEntering={handleEntering} backdrop="static">
    <Modal.Header closeButton>
      <Modal.Title>Approve deal</Modal.Title>
    </Modal.Header>
    <Modal.Body>
      <div className="row">
        <div className="col-sm-12">
          <Form.Group controlId="dealrequest-name">
            <Form.Label>Message from buyer</Form.Label>
            <Form.Control as="textarea"
              readOnly
              type="text"
              rows={3}
              value={messageFromBuyer}
            />
          </Form.Group>
          <Form.Group controlId="dealrequest-name" >
            <Form.Label>Name *</Form.Label>
            <Form.Control
              autoFocus
              type="text"
              isInvalid={nameValidation.error}
              value={name}
              onChange={handleNameChange}
            />
            {nameValidation.error && <Form.Control.Feedback type="invalid">{nameValidation.message}</Form.Control.Feedback>}
          </Form.Group>
          <Form.Group controlId="dealrequest-floorprice">
            <Form.Label>Deal floor price *</Form.Label>
            <Form.Control
              required
              type="number"
              step="0.01"
              min="0"
              value={floorPrice.toString()}
              onChange={(e: any) => setFloorPrice(parseFloat(e.target.value))}
            />
          </Form.Group>
          <Form.Label>Expires</Form.Label>
          <InputGroup>
            <InputGroup.Prepend>
              <InputGroup.Text><FontIcon name="calendar" /></InputGroup.Text>
            </InputGroup.Prepend>
            <Datetime
              dateFormat="YYYY-MM-DD"
              timeFormat="HH:mm:ss"
              value={expirationDate}
              onChange={(date) => { setExpirationDate(date as string) }}
              isValidDate={(current) => { return moment(current).isAfter(); }}
            />
          </InputGroup>
        </div>
      </div>
    </Modal.Body>
    <Modal.Footer>
      <Button variant="light" size="sm" onClick={handleClose}>CANCEL</Button>
      <Button variant="primary" size="sm" onClick={handleSubmit} disabled={saving}>SAVE</Button>
    </Modal.Footer>
  </Modal>;
}

export default PublisherDealApproveModal;