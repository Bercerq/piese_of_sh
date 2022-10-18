import React, { Component } from "react";
import * as _ from "lodash";
import { Modal, Button, Form } from "react-bootstrap";
import { ValidationError } from "../../../../../client/schemas";
import * as Validation from "../../../../../client/Validation";
import { OrganizationEntity } from "../../../../../models/data/Organization";

interface OrganizationModalProps {
  organization: OrganizationEntity;
  show: boolean;
  onClose: () => void;
  onSubmit: (id: number, organization: OrganizationEntity) => void;
}

interface OrganizationModalState {
  id: number;
  name: string;
  nameValidation: ValidationError;
  saving: boolean;
}

export default class OrganizationModal extends Component<OrganizationModalProps, OrganizationModalState> {
  constructor(props, context) {
    super(props, context);
    this.state = this.initialState();
  }

  loadData(props: OrganizationModalProps) {
    if (props.organization) {
      const id = _.get(props, "organization.id", -1);
      const name = _.get(props, "organization.name", "");
      this.setState({ id, name, saving: false });
    } else {
      this.setState({ id: -1, name: "", saving: false });
    }
  }

  initialState() {
    return {
      id: -1,
      name: "",
      nameValidation: {
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
    const nameValidation = Validation.required(name);
    this.setState({ name, nameValidation });
  }

  handleSubmit = () => {
    const name = this.state.name;
    const nameValidation = Validation.required(name);

    if (nameValidation.error) {
      this.setState({ nameValidation });
    } else {
      this.setState({ saving: true }, () => {
        const organization: OrganizationEntity = { name: this.state.name };
        this.props.onSubmit(this.state.id, organization);
      });
    }
  }

  render() {
    return <Modal className="organization-modal" show={this.props.show} onHide={this.handleClose} onEntering={this.handleEntering} backdrop="static">
      <Modal.Header closeButton>
        <Modal.Title>Organization setup</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="row">
          <div className="col-sm-12">
            <Form.Group controlId="organization-name">
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