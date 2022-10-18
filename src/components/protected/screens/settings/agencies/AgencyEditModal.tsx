import React, { Component } from "react";
import * as _ from "lodash";
import { Modal, Button, Form } from "react-bootstrap";
import Select from "react-select";
import { ValidationError, SelectOption } from "../../../../../client/schemas";
import * as Validation from "../../../../../client/Validation";
import * as Utils from "../../../../../client/Utils";
import { AgencyEntity } from "../../../../../models/data/Agency";
import { ValueType } from "react-select/src/types";

interface AgencyEditModalProps {
  agency: AgencyEntity;
  show: boolean;
  writeAccess: boolean;
  onClose: () => void;
  onSubmit: (id: number, agency: AgencyEntity) => void;
}

interface AgencyEditModalState {
  id: number;
  name: string;
  defaultAdvertiserFee: string;
  contactPerson: string;
  email: string;
  street: string;
  number: string;
  zipcode: string;
  city: string;
  country: string;
  advertiserFeeValidation: ValidationError;
  emailValidation: ValidationError;
  saving: boolean;
}

export default class AgencyEditModal extends Component<AgencyEditModalProps, AgencyEditModalState> {
  private countries: SelectOption[] = Utils.countries();

  constructor(props, context) {
    super(props, context);
    this.state = this.initialState();
  }

  loadData(props: AgencyEditModalProps) {
    if (props.agency) {
      const id = _.get(props, "agency.id", -1);
      const name = _.get(props, "agency.name", "");
      const defaultAdvertiserFee = _.get(props, "agency.defaultAdvertiserFee", "").toString();
      const contactPerson = _.get(props, "agency.contactPerson", "");
      const email = _.get(props, "agency.email", "");
      const street = _.get(props, "agency.street", "");
      const number = _.get(props, "agency.number", "");
      const zipcode = _.get(props, "agency.zipcode", "");
      const city = _.get(props, "agency.city", "");
      const country = _.get(props, "agency.country", "");
      this.setState({ id, name, defaultAdvertiserFee, contactPerson, email, street, number, zipcode, city, country, saving: false });
    } else {
      this.setState({ id: -1, name: "", saving: false });
    }
  }

  initialState() {
    return {
      id: -1,
      name: "",
      defaultAdvertiserFee: "",
      contactPerson: "",
      email: "",
      street: "",
      number: "",
      zipcode: "",
      city: "",
      country: "",
      advertiserFeeValidation: {
        error: false,
        message: ""
      },
      emailValidation: {
        error: false,
        message: ""
      },
      saving: false
    };
  }

  handleEntering = () => {
    this.loadData(this.props);
  }

  handleClose = () => {
    const state = this.initialState();
    this.setState(state, () => { this.props.onClose() });
  }

  handleAdvertiserFeeChange = (e) => {
    const defaultAdvertiserFee = e.target.value;
    const advertiserFeeValidation = Validation.native(e.target);
    this.setState({ defaultAdvertiserFee, advertiserFeeValidation });
  }

  handleEmailChange = (e) => {
    const email = e.target.value;
    const emailValidation = Validation.native(e.target);
    this.setState({ email, emailValidation });
  }

  handleCountryChange = (selected) => {
    if (selected) {
      this.setState({ country: (selected as SelectOption).value.toString() });
    } else {
      this.setState({ country: null });
    }
  }

  handleSubmit = () => {
    const advertiserFeeInput: HTMLInputElement = document.getElementById("agency-edit-defaultadvertiserfee") as HTMLInputElement;
    advertiserFeeInput.value = this.state.defaultAdvertiserFee;
    const advertiserFeeValidation = Validation.native(advertiserFeeInput);

    const emailInput: HTMLInputElement = document.getElementById("agency-edit-email") as HTMLInputElement;
    emailInput.value = this.state.email;
    const emailValidation = Validation.native(emailInput);

    if (advertiserFeeValidation.error || emailValidation.error) {
      this.setState({ advertiserFeeValidation, emailValidation });
    } else {
      this.setState({ saving: true }, () => {
        const agency = _.pick(this.state, ["name", "contactPerson", "email", "street", "number", "zipcode", "city", "country"]);
        agency.defaultAdvertiserFee = parseInt(this.state.defaultAdvertiserFee);
        this.props.onSubmit(this.state.id, agency);
      });
    }
  }

  render() {
    return <Modal size="lg" show={this.props.show} onHide={this.handleClose} onEntering={this.handleEntering} backdrop="static">
      <Modal.Header closeButton>
        <Modal.Title>Agency details</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="row no-gutters">
          <div className="col-lg-6 px-1">
            <Form.Group controlId="agency-edit-name">
              <Form.Label>Name *</Form.Label>
              <Form.Control
                readOnly
                type="text"
                value={this.state.name}
              />
            </Form.Group>
          </div>
          <div className="col-lg-6 px-1">
            <Form.Group controlId="agency-edit-defaultadvertiserfee">
              <Form.Label>Default advertiser fee *</Form.Label>
              <Form.Control
                readOnly={!this.props.writeAccess}
                required
                type="number"
                step="0.01"
                min="0"
                value={this.state.defaultAdvertiserFee}
                isInvalid={this.state.advertiserFeeValidation.error}
                onChange={this.handleAdvertiserFeeChange}
              />
              {this.state.advertiserFeeValidation.error && <Form.Control.Feedback type="invalid">{this.state.advertiserFeeValidation.message}</Form.Control.Feedback>}
            </Form.Group>
          </div>
        </div>
        <div className="row no-gutters">
          <div className="col-lg-6 px-1">
            <Form.Group controlId="agency-edit-contact-person">
              <Form.Label>Contact person</Form.Label>
              <Form.Control
                readOnly={!this.props.writeAccess}
                type="text"
                value={this.state.contactPerson}
                onChange={(e) => { this.setState({ contactPerson: e.target.value }) }}
              />
            </Form.Group>
          </div>
          <div className="col-lg-6 px-1">
            <Form.Group controlId="agency-edit-email">
              <Form.Label>Email</Form.Label>
              <Form.Control
                readOnly={!this.props.writeAccess}
                type="email"
                value={this.state.email}
                isInvalid={this.state.emailValidation.error}
                onChange={this.handleEmailChange}
              />
              {this.state.emailValidation.error && <Form.Control.Feedback type="invalid">{this.state.emailValidation.message}</Form.Control.Feedback>}
            </Form.Group>
          </div>
        </div>
        <div className="row no-gutters">
          <div className="col-lg-6 px-1">
            <Form.Group controlId="agency-edit-street">
              <Form.Label>Street</Form.Label>
              <Form.Control
                readOnly={!this.props.writeAccess}
                type="text"
                value={this.state.street}
                onChange={(e) => { this.setState({ street: e.target.value }) }}
              />
            </Form.Group>
          </div>
          <div className="col-lg-6 px-1">
            <Form.Group controlId="agency-edit-number">
              <Form.Label>Number</Form.Label>
              <Form.Control
                readOnly={!this.props.writeAccess}
                type="text"
                value={this.state.number}
                onChange={(e) => { this.setState({ number: e.target.value }) }}
              />
            </Form.Group>
          </div>
        </div>
        <div className="row no-gutters">
          <div className="col-lg-6 px-1">
            <Form.Group controlId="agency-edit-zipcode">
              <Form.Label>Zip code</Form.Label>
              <Form.Control
                readOnly={!this.props.writeAccess}
                type="text"
                value={this.state.zipcode}
                onChange={(e) => { this.setState({ zipcode: e.target.value }) }}
              />
            </Form.Group>
          </div>
          <div className="col-lg-6 px-1">
            <Form.Group controlId="agency-edit-city">
              <Form.Label>City</Form.Label>
              <Form.Control
                readOnly={!this.props.writeAccess}
                type="text"
                value={this.state.city}
                onChange={(e) => { this.setState({ city: e.target.value }) }}
              />
            </Form.Group>
          </div>
        </div>
        <div className="row no-gutters">
          <div className="col-lg-6 px-1">
            <Form.Group controlId="agency-edit-country">
              <Form.Label>Country</Form.Label>
              <Select
                inputId="react-select-agency-edit-country"
                isDisabled={!this.props.writeAccess}
                isClearable={true}
                className="react-select-container"
                classNamePrefix="react-select"
                onChange={this.handleCountryChange}
                value={this.countries.find((o) => { return o.value === this.state.country })}
                options={this.countries}
              />
            </Form.Group>
          </div>
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button size="sm" variant="light" onClick={this.handleClose}>CANCEL</Button>
        <Button size="sm" variant="primary" onClick={this.handleSubmit} disabled={this.state.saving || !this.props.writeAccess}>SAVE</Button>
      </Modal.Footer>
    </Modal>
  }
}