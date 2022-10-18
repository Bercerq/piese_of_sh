import React, { Component } from "react";
import * as _ from "lodash";
import { Modal, Button, Form } from "react-bootstrap";
import Select from "react-select";
import * as Api from "../../../../../client/Api";
import { ValidationError, SelectOption } from "../../../../../client/schemas";
import * as Validation from "../../../../../client/Validation";
import { Scope, Rights } from "../../../../../models/Common";
import { AdvertiserEntity } from "../../../../../models/data/Advertiser";

interface AdvertiserAddModalProps {
  show: boolean;
  scope: Scope;
  scopeId: number;
  rights: Rights;
  agencyFee?: number;
  onClose: () => void;
  onSubmit: (id: number, advertiser: AdvertiserEntity) => void;
}

interface AdvertiserAddModalState {
  name: string;
  agencyId: number;
  advertiserDomain: string;
  advertiserFee: number;
  nameValidation: ValidationError;
  domainValidation: ValidationError;
  advertiserFeeValidation: ValidationError;
  agencies: SelectOption[];
  saving: boolean;
}

export default class AdvertiserAddModal extends Component<AdvertiserAddModalProps, AdvertiserAddModalState> {
  constructor(props, context) {
    super(props, context);
    this.state = this.initialState();
  }

  async loadData(props: AdvertiserAddModalProps) {
    if (props.scope === "all" || props.scope === "metaAgency") {
      const qs = props.scope === "all" ? {} : { organizationId: props.scopeId };
      const rslt = await Api.Get({ path: "/api/agencies", qs });
      const agencies = (rslt.agencies || []).map((o) => { return { value: o.agency.id, label: o.agency.name, fee: _.get(o, 'agency.defaultAdvertiserFee', 0) } });

      let agencyId = -1;
      let advertiserFee = 0;

      if (agencies.length > 0) {
        agencyId = agencies[0].value;
        advertiserFee = agencies[0].fee;
      }

      this.setState({ agencies: agencies, name: "", agencyId, advertiserFee, saving: false });
    } else if (props.scope === "agency") {
      this.setState({ agencies: [], name: "", agencyId: props.scopeId, advertiserFee: props.agencyFee || 0, saving: false });
    }
  }

  initialState() {
    return {
      name: "",
      agencyId: -1,
      advertiserDomain: "",
      advertiserFee: 0,
      agencies: [],
      nameValidation: {
        error: false,
        message: ""
      },
      domainValidation: {
        error: false,
        message: ""
      },
      advertiserFeeValidation: {
        error: false,
        message: ""
      },
      saving: false
    };
  }

  handleEntering = async () => {
    await this.loadData(this.props);
  }

  handleClose = () => {
    const state = this.initialState();
    this.setState(state, () => { this.props.onClose() });
  }

  handleNameChange = (e) => {
    const name = e.target.value;
    const nameValidation = Validation.required(name);
    this.setState({ name, nameValidation });
  }

  handleDomainChange = (e) => {
    const advertiserDomain = e.target.value;
    const domainValidation = Validation.domain(e.target.value, true);
    this.setState({ advertiserDomain, domainValidation });
  }

  handleAgencyChange = (selected) => {
    this.setState({ agencyId: selected.value, advertiserFee: selected.fee });
  }

  handleAdvertiserFeeChange = (e) => {
    const advertiserFee = parseInt(e.target.value, 10);
    const advertiserFeeValidation = Validation.native(e.target);
    this.setState({ advertiserFee, advertiserFeeValidation });
  }

  handleSubmit = () => {
    const name = this.state.name;
    const nameValidation = Validation.required(name);

    const advertiserDomain = this.state.advertiserDomain;
    const domainValidation = Validation.domain(advertiserDomain, true);

    const input: HTMLInputElement = document.getElementById("advertiser-fee") as HTMLInputElement;
    input.value = this.state.advertiserFee.toString();
    const advertiserFeeValidation = Validation.native(input);

    if (nameValidation.error || domainValidation.error || advertiserFeeValidation.error) {
      this.setState({ nameValidation, domainValidation, advertiserFeeValidation });
    } else {
      this.setState({ saving: true }, () => {
        const advertiserFee = this.state.advertiserFee;
        const advertiser: AdvertiserEntity = { name, advertiserDomain, advertiserFee, agencyId: this.state.agencyId };
        this.props.onSubmit(-1, advertiser);
      });
    }
  }

  render() {
    return <Modal className="advertiser-add-modal" show={this.props.show} onHide={this.handleClose} onEntering={this.handleEntering} backdrop="static">
      <Modal.Header closeButton>
        <Modal.Title>Quick advertiser setup</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="row">
          <div className="col-sm-12">
            {(this.props.scope === "all" || this.props.scope === "metaAgency") &&
              <Form.Group controlId="advertiser-agency">
                <Form.Label>Agency * </Form.Label>
                <Select
                  inputId="react-select-advertiser-agency"
                  className="react-select-container"
                  classNamePrefix="react-select"
                  clearable={false}
                  value={this.state.agencies.find((o) => { return o.value === this.state.agencyId })}
                  onChange={this.handleAgencyChange}
                  options={this.state.agencies}
                />
              </Form.Group>
            }
            <Form.Group controlId="advertiser-name">
              <Form.Label>Name *</Form.Label>
              <Form.Control
                autoFocus
                type="text"
                value={this.state.name}
                isInvalid={this.state.nameValidation.error}
                onChange={this.handleNameChange}
              />
              {this.state.nameValidation.error && <Form.Control.Feedback type="invalid">{this.state.nameValidation.message}</Form.Control.Feedback>}
            </Form.Group>
            <Form.Group controlId="advertiser-domain">
              <Form.Label>Advertiser domain *</Form.Label>
              <Form.Control
                placeholder="e.g. domain.nl (without http://, https://, www.)"
                value={this.state.advertiserDomain}
                isInvalid={this.state.domainValidation.error}
                onChange={this.handleDomainChange}
              />
              {this.state.domainValidation.error && <Form.Control.Feedback type="invalid">{this.state.domainValidation.message}</Form.Control.Feedback>}
            </Form.Group>
            <Form.Group controlId="advertiser-fee">
              <Form.Label>Agency fee *</Form.Label>
              <Form.Control
                disabled={!this.props.rights.MANAGE_AGENCY}
                required
                type="number"
                step="0.01"
                min="0"
                isInvalid={this.state.advertiserFeeValidation.error}
                value={this.state.advertiserFee.toString()}
                onChange={this.handleAdvertiserFeeChange}
              />
              {this.state.advertiserFeeValidation.error && <Form.Control.Feedback type="invalid">{this.state.advertiserFeeValidation.message}</Form.Control.Feedback>}
            </Form.Group>
          </div>
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button size="sm" variant="light" onClick={this.handleClose}>CANCEL</Button>
        <Button size="sm" variant="primary" onClick={this.handleSubmit} disabled={this.state.saving}>SAVE</Button>
      </Modal.Footer>
    </Modal>
  }
}