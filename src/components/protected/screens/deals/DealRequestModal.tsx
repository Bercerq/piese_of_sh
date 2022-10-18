import React, { useState, useEffect } from "react";
import momentPropTypes from "react-moment-proptypes";
import moment from "moment";
import { Modal, Button, Form, InputGroup } from "react-bootstrap";
import Select from "react-select";
import Datetime from "react-datetime";
import * as Validation from "../../../../client/Validation";
import * as Helper from "../../../../client/Helper";
import { SelectOption, ScopeType, ValidationError } from "../../../../client/schemas";
import { Rights } from "../../../../models/Common";
import { DealRequest, DealAdType } from "../../../../models/data/Deal";
import FontIcon from "../../../UI/FontIcon";

interface DealRequestModalProps {
  show: boolean;
  sspOptions: SelectOption[];
  rights: Rights;
  scope: ScopeType;
  scopeId: number;
  maxLevel: ScopeType;
  onClose: () => void;
  onSubmit: (dealRequest: DealRequest) => void;
}

const DealRequestModal = (props: DealRequestModalProps) => {
  const levelOptions = Helper.getLevelOptions(props.maxLevel);
  const initialDate = moment().add(1, 'years').endOf('day');
  const [saving, setSaving] = useState<boolean>(false);
  const [name, setName] = useState<string>("");
  const [adType, setAdType] = useState<DealAdType>("display");
  const [ssp, setSsp] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [publisherDescription, setPublisherDescription] = useState<string>("");
  const [expirationDate, setExpirationDate] = useState<momentPropTypes.momentObj>(initialDate);
  const [level, setLevel] = useState<ScopeType>(props.scope);
  const [entityId, setEntityId] = useState<number>(-1);
  const [entityOptions, setEntityOptions] = useState<SelectOption[]>([]);
  const [nameValidation, setNameValidation] = useState<ValidationError>({ error: false, message: "" });

  useEffect(loadSspValue, [props.sspOptions]);

  const handleClose = () => {
    clearState();
    props.onClose();
  };

  const handleEntering = async () => {
    loadScopeFields(props.scope);
  };

  const handleNameChange = (e) => {
    const name = e.target.value;
    const nameValidation = Validation.required(name);
    setName(name);
    setNameValidation(nameValidation);
  }

  const handleAdTypeChange = (e) => {
    if (e.target.checked) {
      setAdType(e.target.value);
    }
  }

  const handleSSPChange = (selected) => {
    setSsp(selected.value);
  };

  const handleLevelChange = async (selected) => {
    const level = selected.value as ScopeType;
    await loadScopeFields(level);
  }

  const handleEntityChange = (selected) => {
    setEntityId(parseInt(selected.value, 10));
  }

  const handleSubmit = () => {
    const nameValidation = Validation.required(name);
    if (nameValidation.error) {
      setNameValidation(nameValidation);
    } else {
      setSaving(true);
      const scope = Helper.getScopeByLevel(level);
      let dealRequest: DealRequest = {
        sspName: ssp,
        adType,
        description: publisherDescription,
        buyerSideDeal: {
          externalId: "",
          name,
          ssp,
          description,
          expirationDate: expirationDate.format("YYYY-MM-DD HH:mm:ss"),
          scope: {
            scope,
            scopeId: null
          }
        }
      };
      if (level !== "root") {
        dealRequest.buyerSideDeal.scope.scopeId = entityId;
      }
      props.onSubmit(dealRequest);
      clearState();
    }
  };

  function clearState() {
    setSaving(false);
    setName("");
    setAdType("display");
    setDescription("");
    setPublisherDescription("");
    setExpirationDate(initialDate);
    setNameValidation({ error: false, message: "" });
    setLevel(props.scope);
    setEntityId(-1);
  }

  function loadSspValue() {
    if (props.sspOptions.length > 0) {
      setSsp(props.sspOptions[0].value as string);
    }
  }

  async function loadScopeFields(level: ScopeType) {
    const entityOptions = await Helper.getEntityOptions("deals", props.scope, props.scopeId, level);
    const entityId = (entityOptions.length > 0 ? entityOptions[0].value : -1) as number;
    setLevel(level);
    setEntityOptions(entityOptions);
    setEntityId(entityId);
  }

  return <Modal className="deal-request-modal" show={props.show} onHide={handleClose} onEntering={handleEntering} backdrop="static">
    <Modal.Header closeButton>
      <Modal.Title>Request deal</Modal.Title>
    </Modal.Header>
    <Modal.Body>
      <div className="row">
        <div className="col-sm-12">
          <Form.Group controlId="deal-request-ssp">
            <Form.Label>Select publisher</Form.Label>
            <Select
              inputId="react-select-request-deal-ssp"
              className="react-select-container"
              classNamePrefix="react-select"
              onChange={handleSSPChange}
              value={props.sspOptions.find((o) => { return o.value === ssp })}
              options={props.sspOptions}
            />
          </Form.Group>
          <Form.Group>
            <Form.Check
              inline
              id="deal-request-adtype-display"
              type="radio"
              label="Display"
              name="deal-request-adtype"
              value="display"
              checked={adType === "display"}
              onChange={handleAdTypeChange}
            />
            <Form.Check
              inline
              id="deal-request-adtype-radio"
              type="radio"
              label="Video"
              name="deal-request-adtype"
              value="video"
              checked={adType === "video"}
              onChange={handleAdTypeChange}
            />
          </Form.Group>
          <Form.Group controlId="deal-request-publisherdescription">
            <Form.Label>Message for publisher</Form.Label>
            <Form.Control as="textarea"
              autoFocus
              type="text"
              rows={3}
              value={publisherDescription}
              onChange={(e: any) => { setPublisherDescription(e.target.value) }}
            />
          </Form.Group>
          <div className="bb mb-15 mt-25 row"></div>
          <Form.Group controlId="deal-request-name">
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
          <Form.Group controlId="deal-request-description">
            <Form.Label>Description</Form.Label>
            <Form.Control as="textarea"
              autoFocus
              type="text"
              rows={3}
              value={description}
              onChange={(e: any) => { setDescription(e.target.value) }}
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
          <Form.Group controlId="deal-request-scope">
            <Form.Label>Level:</Form.Label>
            <Select
              inputId="react-select-deal-scope"
              className="react-select-container"
              classNamePrefix="react-select"
              clearable={false}
              value={levelOptions.find((o) => { return o.value === level })}
              onChange={handleLevelChange}
              options={levelOptions}
            />
          </Form.Group>
          {level !== "root" &&
            <Form.Group controlId="deal-request-entity">
              <Form.Label>{Helper.getLabelByScopeType(level)}</Form.Label>
              <Select
                inputId="react-select-deal-entity"
                className="react-select-container"
                classNamePrefix="react-select"
                value={entityOptions.find((o) => { return o.value === entityId })}
                clearable={false}
                onChange={handleEntityChange}
                options={entityOptions}
              />
            </Form.Group>
          }
        </div>
      </div>
    </Modal.Body>
    <Modal.Footer>
      <Button variant="light" size="sm" onClick={handleClose}>CANCEL</Button>
      <Button variant="primary" size="sm" onClick={handleSubmit} disabled={saving}>SAVE</Button>
    </Modal.Footer>
  </Modal>;
}

export default DealRequestModal;