import React, { Component } from "react";
import * as _ from "lodash";
import { Modal, Button, Form } from "react-bootstrap";
import Select from "react-select";
import { ValidationError, SelectOption } from "../../../../../client/schemas";
import * as Validation from "../../../../../client/Validation";
import * as Utils from "../../../../../client/Utils";
import { ValueType } from "react-select/src/types";
import { AdvertiserEntity } from "../../../../../models/data/Advertiser";

interface AdvertiserEditModalProps {
  advertiser: AdvertiserEntity;
  show: boolean;
  writeAccess: boolean;
  onClose: () => void;
  onSubmit: (id: number, advertiser: AdvertiserEntity) => void;
}

interface AdvertiserEditModalState {
  id: number;
  name: string;
  advertiserFee: string;
  advertiserDomain: string;
  productCategory: string;
  contactPerson: string;
  email: string;
  street: string;
  number: string;
  zipcode: string;
  city: string;
  country: string;
  nameValidation: ValidationError;
  advertiserFeeValidation: ValidationError;
  emailValidation: ValidationError;
  domainValidation: ValidationError;
  saving: boolean;
}

export default class AdvertiserEditModal extends Component<AdvertiserEditModalProps, AdvertiserEditModalState> {
  private countries: SelectOption[] = Utils.countries();

  constructor(props, context) {
    super(props, context);
    this.state = this.initialState();
  }

  loadData(props: AdvertiserEditModalProps) {
    if (props.advertiser) {
      const id = _.get(props, "advertiser.id", -1);
      const name = _.get(props, "advertiser.name", "");
      const advertiserDomain = _.get(props, "advertiser.advertiserDomain", "");
      const productCategory = _.get(props, "advertiser.productCategory", "");
      const advertiserFee = _.get(props, "advertiser.advertiserFee", "").toString();
      const contactPerson = _.get(props, "advertiser.contactPerson", "");
      const email = _.get(props, "advertiser.email", "");
      const street = _.get(props, "advertiser.street", "");
      const number = _.get(props, "advertiser.number", "");
      const zipcode = _.get(props, "advertiser.zipcode", "");
      const city = _.get(props, "advertiser.city", "");
      const country = _.get(props, "advertiser.country", "");
      this.setState({ id, name, advertiserDomain, productCategory, advertiserFee, contactPerson, email, street, number, zipcode, city, country, saving: false });
    } else {
      this.setState({ id: -1, name: "", saving: false });
    }
  }

  initialState() {
    return {
      id: -1,
      name: "",
      advertiserFee: "",
      advertiserDomain: "",
      productCategory: "",
      contactPerson: "",
      email: "",
      street: "",
      number: "",
      zipcode: "",
      city: "",
      country: "",
      nameValidation: {
        error: false,
        message: ""
      },
      advertiserFeeValidation: {
        error: false,
        message: ""
      },
      emailValidation: {
        error: false,
        message: ""
      },
      domainValidation: {
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

  handleNameChange = (e) => {
    const name = e.target.value;
    const nameValidation = Validation.required(e.target.value);
    this.setState({ name, nameValidation });
  }

  handleDomainChange = (e) => {
    const advertiserDomain = e.target.value;
    const domainValidation = Validation.domain(e.target.value, true);
    this.setState({ advertiserDomain, domainValidation });
  }

  handleAdvertiserFeeChange = (e) => {
    const advertiserFee = e.target.value;
    const advertiserFeeValidation = Validation.native(e.target);
    this.setState({ advertiserFee, advertiserFeeValidation });
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
    const advertiserFeeInput: HTMLInputElement = document.getElementById("advertiser-edit-fee") as HTMLInputElement;
    advertiserFeeInput.value = this.state.advertiserFee;
    const advertiserFeeValidation = Validation.native(advertiserFeeInput);

    const emailInput: HTMLInputElement = document.getElementById("advertiser-edit-email") as HTMLInputElement;
    emailInput.value = this.state.email;
    const emailValidation = Validation.native(emailInput);

    const advertiserDomain = this.state.advertiserDomain;
    const domainValidation = Validation.domain(advertiserDomain, true);

    if (advertiserFeeValidation.error || emailValidation.error || domainValidation.error) {
      this.setState({ advertiserFeeValidation, emailValidation, domainValidation });
    } else {
      this.setState({ saving: true }, () => {
        const advertiser: AdvertiserEntity = _.pick(this.state, ["name", "advertiserDomain", "productCategory", "advertiserFee", "contactPerson", "email", "street", "number", "zipcode", "city", "country"]);
        this.props.onSubmit(this.state.id, advertiser);
      });
    }
  }

  render() {
    return <Modal size="lg" show={this.props.show} onHide={this.handleClose} onEntering={this.handleEntering} backdrop="static">
      <Modal.Header closeButton>
        <Modal.Title>Advertiser details</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="row no-gutters">
          <div className="col-lg-6 px-1">
            <Form.Group controlId="advertiser-edit-name">
              <Form.Label>Name *</Form.Label>
              <Form.Control
                readOnly={!this.props.writeAccess}
                type="text"
                value={this.state.name}
                isInvalid={this.state.nameValidation.error}
                onChange={this.handleNameChange}
              />
              {this.state.nameValidation.error && <Form.Control.Feedback type="invalid">{this.state.nameValidation.message}</Form.Control.Feedback>}
            </Form.Group>
          </div>
          <div className="col-lg-6 px-1">
            <Form.Group controlId="advertiser-edit-domain">
              <Form.Label>Advertiser domain *</Form.Label>
              <Form.Control
                readOnly={!this.props.writeAccess}
                placeholder="e.g. domain.nl (without http://, https://, www.)"
                value={this.state.advertiserDomain}
                isInvalid={this.state.domainValidation.error}
                onChange={this.handleDomainChange}
              />
              {this.state.domainValidation.error && <Form.Control.Feedback type="invalid">{this.state.domainValidation.message}</Form.Control.Feedback>}
            </Form.Group>
          </div>
        </div>
        <div className="row no-gutters">
          <div className="col-lg-6 px-1">
            <Form.Group controlId="advertiser-edit-fee">
              <Form.Label>Agency fee *</Form.Label>
              <Form.Control
                readOnly={!this.props.writeAccess}
                required
                type="number"
                step="0.01"
                min="0"
                value={this.state.advertiserFee}
                isInvalid={this.state.advertiserFeeValidation.error}
                onChange={this.handleAdvertiserFeeChange}
              />
              {this.state.advertiserFeeValidation.error && <Form.Control.Feedback type="invalid">{this.state.advertiserFeeValidation.message}</Form.Control.Feedback>}
            </Form.Group>
          </div>
          <div className="col-lg-6 px-1">
            <Form.Group controlId="advertiser-edit-product-category">
              <Form.Label>Product category</Form.Label>
              <Form.Control
                readOnly={!this.props.writeAccess}
                type="text"
                value={this.state.productCategory}
                onChange={(e) => { this.setState({ productCategory: e.target.value }) }}
              />
            </Form.Group>
          </div>
        </div>
        <div className="row no-gutters">
          <div className="col-lg-6 px-1">
            <Form.Group controlId="advertiser-edit-contact-person">
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
            <Form.Group controlId="advertiser-edit-email">
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
            <Form.Group controlId="advertiser-edit-street">
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
            <Form.Group controlId="advertiser-edit-number">
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
            <Form.Group controlId="advertiser-edit-zipcode">
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
            <Form.Group controlId="advertiser-edit-city">
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
            <Form.Group controlId="advertiser-edit-country">
              <Form.Label>Country</Form.Label>
              <Select
                inputId="react-select-advertiser-edit-country"
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