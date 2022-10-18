import React, { useState } from "react";
import momentPropTypes from "react-moment-proptypes";
import moment from "moment";
import { Modal, Button, Form, InputGroup } from "react-bootstrap";
import * as _ from "lodash";
import Datetime from "react-datetime";
import * as Validation from "../../../../client/Validation";
import { ValidationError } from "../../../../client/schemas";
import { PublisherDeal } from "../../../../models/data/PublisherDeal";
import FontIcon from "../../../UI/FontIcon";

interface PublisherDealModalProps {
  deal: PublisherDeal;
  show: boolean;
  writeAccess: boolean;
  handleClose: () => void;
  handleSubmit: (id: number, publisherId: number, deal: PublisherDeal) => void;
}

const PublisherDealModal = (props: PublisherDealModalProps) => {
  const initialDate = moment().add(1, 'years').endOf('day');
  const [saving, setSaving] = useState<boolean>(false);
  const [name, setName] = useState<string>("");
  const [floorPrice, setFloorPrice] = useState<number>(0);
  const [expirationDate, setExpirationDate] = useState<momentPropTypes.momentObj>(initialDate);
  const [nameValidation, setNameValidation] = useState<ValidationError>({ error: false, message: "" });

  const handleClose = () => {
    clearState();
    props.handleClose();
  };

  const handleEntering = () => {
    const name = _.get(props, "deal.name") || "";
    const expirationDate = _.get(props, "deal.expirationDate");
    setName(name);
    setExpirationDate(expirationDate ? moment(expirationDate) : initialDate);
    setFloorPrice(_.get(props, "deal.floorPrice", 0));
    setSaving(false);
  };

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
      const publisherId = _.get(props, "deal.publisherId");
      const approvalStatus = _.get(props, "deal.approvalStatus");
      props.handleSubmit(id, publisherId, { name, floorPrice, approvalStatus, expirationDate: expirationDate.format("YYYY-MM-DD HH:mm:ss") });
    }
  }

  function clearState() {
    setName("");
    setExpirationDate(initialDate);
    setFloorPrice(0);
    setNameValidation({ error: false, message: "" });
    setSaving(false);
  }

  return <Modal show={props.show} onHide={handleClose} onEntering={handleEntering} backdrop="static">
    <Modal.Header closeButton>
      <Modal.Title>Deal settings</Modal.Title>
    </Modal.Header>
    <Modal.Body>
      <div className="row">
        <div className="col-sm-12">
          <Form.Group controlId="deal-name">
            <Form.Label>Name *</Form.Label>
            <Form.Control
              autoFocus
              readOnly={!props.writeAccess}
              type="text"
              isInvalid={nameValidation.error}
              value={name}
              onChange={handleNameChange}
            />
            {nameValidation.error && <Form.Control.Feedback type="invalid">{nameValidation.message}</Form.Control.Feedback>}
          </Form.Group>
          <Form.Group controlId="deal-floorprice">
            <Form.Label>Deal floor price *</Form.Label>
            <Form.Control
              required
              readOnly={!props.writeAccess}
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
              inputProps={{ disabled: !props.writeAccess }}
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
      <Button variant="primary" size="sm" onClick={handleSubmit} disabled={saving || !props.writeAccess}>SAVE</Button>
    </Modal.Footer>
  </Modal>;
}

export default PublisherDealModal;