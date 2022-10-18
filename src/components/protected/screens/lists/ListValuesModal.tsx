import React, { Component } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import { ValidationError } from "../../../../client/schemas";
import * as Validation from "../../../../client/Validation";
import * as _ from "lodash";

interface ListValuesModalProps {
  show: boolean;
  attribute: string;
  attributeDisplayName: string;
  values: string[];
  writeAccess: boolean;
  onClose: () => void;
  onSubmit: (values: string[]) => void;
}

interface ListValuesModalState {
  values: string[];
  valuesText: string;
  saving: boolean;
  valuesValidation: ValidationError;
  valuesSubmitError: string;
}

export default class ListValuesModal extends Component<ListValuesModalProps, ListValuesModalState> {
  constructor(props, context) {
    super(props, context);
    this.state = {
      values: [],
      valuesText: "",
      saving: false,
      valuesSubmitError: "",
      valuesValidation: {
        error: false,
        message: ""
      }
    };
  }

  handleClose = () => {
    const state = {};
    this.setState(state, () => { this.props.onClose() });
  }

  handleSubmit = async () => {
    const inputValues = this.state.values;
    const valuesValidation = Validation.required(inputValues);
    if (valuesValidation.error) {
      this.setState({ valuesValidation });
    } else {
      this.setState({ saving: true }, () => {
        this.props.onSubmit(this.state.values);
      });
    }
  }

  onEntering = () => {
    const valuesText = this.getText(this.props.values);
    this.setState({ values: this.props.values, valuesText, saving: false });
  }

  handleChange = (e) => {
    const valuesText = e.target.value;
    let values = valuesText.trim().split('\n');
    values = _.uniq(values).filter((s) => { return s.trim() !== "" });
    const valuesValidation = Validation.required(values);
    this.setState({ values, valuesText, valuesValidation, valuesSubmitError: "" });
  }

  getText = (values: string[]) => {
    return values.join('\n').trim();
  }

  render() {
    return (
      <Modal show={this.props.show} onHide={this.handleClose} onEntering={this.onEntering} backdrop="static">
        <Modal.Header closeButton>
          <Modal.Title>Edit {this.props.attributeDisplayName} values</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="row">
            <div className="col-sm-12">
              <Form.Group controlId="list-name">
                <Form.Label>Name *</Form.Label>
                <Form.Control as="textarea"
                  autoFocus
                  disabled={!this.props.writeAccess}
                  isInvalid={this.state.valuesValidation.error}
                  type="text"
                  rows={20}
                  value={this.state.valuesText}
                  onChange={this.handleChange}
                />
                {this.state.valuesValidation.error && <Form.Control.Feedback type="invalid">{this.state.valuesValidation.message}</Form.Control.Feedback>}
                <div className="text-danger">{this.state.valuesSubmitError}</div>
              </Form.Group>
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button size="sm" variant="light" onClick={this.handleClose}>CANCEL</Button>
          <Button size="sm" variant="primary" onClick={this.handleSubmit} disabled={!this.props.writeAccess || this.state.saving}>SAVE</Button>
        </Modal.Footer>
      </Modal >
    );
  }
}