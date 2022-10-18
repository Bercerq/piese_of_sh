import React, { Component } from "react";
import * as _ from "lodash";
import { Modal, Button, Form } from "react-bootstrap";
import Select from "react-select";
import * as Api from "../../../../../client/Api";
import { ValidationError, SelectOption } from "../../../../../client/schemas";
import * as Validation from "../../../../../client/Validation";
import { AgencyEntity } from "../../../../../models/data/Agency";
import { Scope } from "../../../../../models/Common";

interface AgencyAddModalProps {
  show: boolean;
  scope: Scope;
  scopeId: number;
  onClose: () => void;
  onSubmit: (id: number, agency: AgencyEntity) => void;
}

interface AgencyAddModalState {
  name: string;
  metaAgencyId: number;
  defaultAdvertiserFee: string;
  nameValidation: ValidationError;
  advertiserFeeValidation: ValidationError;
  organizations: SelectOption[];
  saving: boolean;
}

export default class AgencyAddModal extends Component<AgencyAddModalProps, AgencyAddModalState> {
  constructor(props, context) {
    super(props, context);
    this.state = this.initialState();
  }

  async loadData(props: AgencyAddModalProps) {
    if (props.scope === "all") {
      const rslt = await Api.Get({ path: "/api/organizations" });
      const organizations = (rslt.organizations || []).map((o) => { return { value: o.organization.id, label: o.organization.name } });
      const metaAgencyId = organizations.length > 0 ? organizations[0].value : -1;
      this.setState({ organizations, name: "", metaAgencyId, saving: false });
    } else if (props.scope === "metaAgency") {
      this.setState({ organizations: [], name: "", metaAgencyId: this.props.scopeId, saving: false });
    }
  }

  initialState() {
    return {
      name: "",
      metaAgencyId: -1,
      defaultAdvertiserFee: "",
      organizations: [],
      nameValidation: {
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

  handleAdvertiserFeeChange = (e) => {
    const defaultAdvertiserFee = e.target.value;
    const advertiserFeeValidation = Validation.native(e.target);
    this.setState({ defaultAdvertiserFee, advertiserFeeValidation });
  }

  handleOrganizationChange = (selected) => {
    this.setState({ metaAgencyId: selected.value });
  }

  handleSubmit = () => {
    const name = this.state.name;
    const nameValidation = Validation.required(name);

    const defaultAdvertiserFee = this.state.defaultAdvertiserFee;
    const input: HTMLInputElement = document.getElementById("agency-defaultadvertiserfee") as HTMLInputElement;
    input.value = this.state.defaultAdvertiserFee;
    const advertiserFeeValidation = Validation.native(input);

    if (nameValidation.error || advertiserFeeValidation.error) {
      this.setState({ nameValidation, advertiserFeeValidation });
    } else {
      this.setState({ saving: true }, () => {
        const agency = { name, defaultAdvertiserFee: parseInt(defaultAdvertiserFee), metaAgencyId: this.state.metaAgencyId };
        this.props.onSubmit(-1, agency);
      });
    }
  }

  render() {
    return <Modal className="agency-add-modal" show={this.props.show} onHide={this.handleClose} onEntering={this.handleEntering} backdrop="static">
      <Modal.Header closeButton>
        <Modal.Title>Quick agency setup</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="row">
          <div className="col-sm-12">
            {this.props.scope === "all" &&
              <Form.Group controlId="agency-organization">
                <Form.Label>Organization * </Form.Label>
                <Select
                  inputId="react-select-agency-organization"
                  className="react-select-container"
                  classNamePrefix="react-select"
                  clearable={false}
                  value={this.state.organizations.find((o) => { return o.value === this.state.metaAgencyId })}
                  onChange={this.handleOrganizationChange}
                  options={this.state.organizations}
                />
              </Form.Group>
            }
            <Form.Group controlId="agency-name">
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
            <Form.Group controlId="agency-defaultadvertiserfee">
              <Form.Label>Default advertiser fee *</Form.Label>
              <Form.Control
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
      </Modal.Body>
      <Modal.Footer>
        <Button size="sm" variant="light" onClick={this.handleClose}>CANCEL</Button>
        <Button size="sm" variant="primary" onClick={this.handleSubmit} disabled={this.state.saving}>SAVE</Button>
      </Modal.Footer>
    </Modal>
  }
}