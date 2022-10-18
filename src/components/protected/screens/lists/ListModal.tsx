import React, { Component, Fragment } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import Select from "react-select";
import { ValidationError, SelectOption, ScopeType } from "../../../../client/schemas";
import * as Validation from "../../../../client/Validation";
import * as _ from "lodash";
import * as Helper from "../../../../client/Helper";
import { List } from "../../../../models/data/List";
import ListValuesModal from "./ListValuesModal";
import { Rights } from "../../../../models/Common";
import Loader from "../../../UI/Loader";
import AsyncSelectList from "../../../UI/AsyncSelectList";

interface ListModalProps {
  show: boolean;
  list: List | null;
  attribute: string;
  attributeDisplayName: string;
  acceptAnyValue: boolean;
  attributeValues?: string[];
  rights: Rights;
  scope: ScopeType;
  scopeId: number;
  maxLevel: ScopeType;
  onClose: () => void;
  onSubmit: (id: number, list: List) => void;
}

interface ListModalState {
  id: number;
  name: string;
  description: string;
  attributeValues: string[];
  level?: ScopeType;
  entityId?: number;
  entityOptions: SelectOption[];
  writeAccess: boolean;
  saving: boolean;
  showValuesSelect: boolean;
  showValuesModal: boolean;
  showLoader: boolean;
  nameValidation: ValidationError;
  attributeValuesValidation: ValidationError;
}

export default class ListModal extends Component<ListModalProps, ListModalState> {
  constructor(props, context) {
    super(props, context);
    this.state = this.initialState();
  }

  async loadData(props: ListModalProps) {
    if (props.list) {
      this.setState({
        id: props.list.id,
        name: props.list.name,
        description: props.list.description,
        attributeValues: props.list.attributeValues,
        writeAccess: props.list.writeAccess,
        saving: false
      }, () => { this.setState({ showValuesSelect: true }) });
    } else {
      const level = this.props.scope;
      let entityOptions: SelectOption[] = [];
      if (level !== "root") {
        entityOptions = await Helper.getEntityOptions("lists", props.scope, props.scopeId, level);
      }
      const entityId = (entityOptions.length > 0 ? entityOptions[0].value : -1) as number;
      this.setState({
        id: -1,
        name: "",
        description: "",
        attributeValues: props.attributeValues || [],
        level,
        entityId,
        writeAccess: true,
        entityOptions,
        saving: false
      }, () => { this.setState({ showValuesSelect: true }) });
    }
  }

  initialState() {
    return {
      id: -1,
      name: "",
      description: "",
      attributeValues: [],
      entityOptions: [{ value: -1, label: "" }],
      entityId: -1,
      level: this.props.scope,
      writeAccess: false,
      saving: false,
      showValuesSelect: false,
      showValuesModal: false,
      showLoader: false,
      nameValidation: {
        error: false,
        message: ""
      },
      attributeValuesValidation: {
        error: false,
        message: ""
      }
    };
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

  handleLevelChange = async (selected) => {
    const level = selected.value as ScopeType;
    if (selected.value === "root") {
      this.setState({ level });
    } else {
      this.setState({ showLoader: true }, async () => {
        const entityOptions = await Helper.getEntityOptions("lists", this.props.scope, this.props.scopeId, level);
        const entityId = (entityOptions.length > 0 ? parseInt(entityOptions[0].value as string, 10) : -1) as number;
        this.setState({ level, entityOptions, entityId, showLoader: false });
      });
    }
  }

  handleEntityChange = (selected) => {
    this.setState({ entityId: parseInt(selected.value, 10) });
  }

  handleSubmit = () => {
    const name = this.state.name;
    const attributeValues = this.state.attributeValues;
    const nameValidation = Validation.required(name);
    const attribute = this.props.attribute;
    const attributeValuesValidation = Validation.required(attributeValues);

    if (nameValidation.error || attributeValuesValidation.error) {
      this.setState({ nameValidation, attributeValuesValidation });
    } else {
      this.setState({ saving: true, showValuesSelect: false }, () => {
        if (this.state.id > 0) {
          const list: List = {
            name,
            description: this.state.description,
            attributeValues,
            attribute
          }
          this.props.onSubmit(this.state.id, list);
        } else {
          const scope = Helper.getScopeByLevel(this.state.level);
          const list: List = {
            name,
            description: this.state.description,
            scope: { scope, scopeId: null },
            attributeValues,
            attribute
          };
          if (this.state.level !== "root") {
            list.scope.scopeId = this.state.entityId;
          }
          this.props.onSubmit(this.state.id, list);
        }
      });
    }
  }

  attributeValuesChange = (selected) => {
    const values = selected.map((s) => { return s.value; });
    const attributeValuesValidation = Validation.required(values);
    this.setState({ attributeValues: values, attributeValuesValidation });
  }

  handleEntering = async () => {
    await this.loadData(this.props);
  }

  handleListValuesSubmit = (values) => {
    this.setState({ showValuesSelect: false, showValuesModal: false, attributeValues: values }, () => {
      this.setState({ showValuesSelect: true });
    });
  }

  handleCopy = async () => {
    const levelOptions = Helper.getLevelOptions(this.props.scope);
    const level = levelOptions[0].value as ScopeType;
    let entityOptions: SelectOption[] = [];
    if (level !== "root") {
      entityOptions = await Helper.getEntityOptions("lists", this.props.scope, this.props.scopeId, level);
    }
    const entityId = (entityOptions.length > 0 ? entityOptions[0].value : -1) as number;
    this.setState({ showValuesSelect: false }, () => {
      this.setState({ id: -1, name: "", description: "", level, entityId, entityOptions, writeAccess: true, showValuesSelect: true });
    });
  }

  render() {
    const levelOptions = Helper.getLevelOptions(this.props.maxLevel);
    const owner = _.get(this.props, "list.scope.owner");
    const listScope = _.get(this.props, "list.scope.scope") || "";
    return (
      <Modal size="lg" show={this.props.show} onHide={this.handleClose} onEntering={this.handleEntering} backdrop="static">
        <Modal.Header closeButton>
          <Modal.Title>{this.state.id > 0 ? "Edit " + this.props.attributeDisplayName + " list" : "Add " + this.props.attributeDisplayName + " list"}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="row">
            <div className="col-sm-12">
              <Form.Group controlId="list-name">
                <Form.Label>Name *</Form.Label>
                <Form.Control
                  autoFocus
                  disabled={!this.state.writeAccess}
                  isInvalid={this.state.nameValidation.error}
                  type="text"
                  value={this.state.name}
                  onChange={this.handleNameChange}
                />
                {this.state.nameValidation.error && <Form.Control.Feedback type="invalid">{this.state.nameValidation.message}</Form.Control.Feedback>}
              </Form.Group>
              <Form.Group controlId="list-description">
                <Form.Label>Description</Form.Label>
                <Form.Control as="textarea"
                  autoFocus
                  disabled={!this.state.writeAccess}
                  type="text"
                  rows={3}
                  value={this.state.description}
                  onChange={(e: any) => { this.setState({ description: e.target.value as string }) }}
                />
              </Form.Group>
            </div>
          </div>
          <div className="row">
            {this.state.id === -1 &&
              <div className="col-sm-6">
                <Form.Group controlId="list-scope">
                  <Form.Label>Level:</Form.Label>
                  <Select
                    inputId="react-select-list-scope"
                    className="react-select-container"
                    classNamePrefix="react-select"
                    isDisabled={this.state.id !== -1}
                    clearable={false}
                    value={levelOptions.find((o) => { return o.value === this.state.level })}
                    onChange={this.handleLevelChange}
                    options={levelOptions}
                  />
                </Form.Group>
              </div>
            }
            {this.state.level !== "root" && this.state.id === -1 &&
              <div className="col-sm-6">
                <Loader visible={this.state.showLoader} loaderClass="loading-input" />
                {!this.state.showLoader &&
                  <Form.Group controlId="list-entity">
                    <Form.Label>{Helper.getLabelByScopeType(this.state.level)}</Form.Label>
                    <Select
                      inputId="react-select-list-entity"
                      className="react-select-container"
                      classNamePrefix="react-select"
                      value={this.state.entityOptions.find((o) => { return o.value === this.state.entityId })}
                      clearable={false}
                      onChange={this.handleEntityChange}
                      options={this.state.entityOptions}
                    />
                  </Form.Group>}
              </div>
            }
            {this.state.id > 0 && <Fragment>
              <div className="col-sm-6">
                <Form.Group controlId="list-level">
                  <Form.Label>Level:</Form.Label>
                  <Form.Control
                    disabled={true}
                    type="text"
                    value={Helper.getLabelByScope(listScope)}
                  />
                </Form.Group>
              </div>
              <div className="col-sm-6">
                <Form.Group controlId="list-owner">
                  <Form.Label>Owner:</Form.Label>
                  <Form.Control
                    disabled={true}
                    type="text"
                    value={owner}
                  />
                </Form.Group>
              </div>
            </Fragment>
            }
          </div>
          <div className="row">
            <div className="col-sm-12">
              <Form.Group controlId="list-attributevalues">
                <Form.Label>{this.props.attributeDisplayName}:</Form.Label>
                {this.state.showValuesSelect &&
                  <AsyncSelectList
                    id="list-values"
                    writeAccess={this.state.writeAccess}
                    creatable={this.props.acceptAnyValue}
                    values={this.state.attributeValues.map((v) => { return { value: v, label: v } })}
                    url={`/api/targeting/suggestion/advanced/attribute/${this.props.attribute}`}
                    onChange={this.attributeValuesChange}
                  />
                }
                {this.state.attributeValuesValidation.error && <Form.Control.Feedback type="invalid">{this.state.attributeValuesValidation.message}</Form.Control.Feedback>}
                <a href="" onClick={(e) => { e.preventDefault(); this.setState({ showValuesModal: true }) }}>Edit as text</a>
              </Form.Group>
            </div>
          </div>
          <ListValuesModal
            show={this.state.showValuesModal}
            attribute={this.props.attribute}
            attributeDisplayName={this.props.attributeDisplayName}
            writeAccess={this.state.writeAccess}
            values={this.state.attributeValues}
            onClose={() => { this.setState({ showValuesModal: false }) }}
            onSubmit={this.handleListValuesSubmit}
          />
        </Modal.Body>
        <Modal.Footer>
          <Button variant="light" size="sm" onClick={this.handleClose}>CANCEL</Button>
          {this.state.id > 0 && this.props.rights.MANAGE_LISTS && <Button variant="primary" size="sm" onClick={this.handleCopy}>COPY TO NEW LIST</Button>}
          <Button variant="primary" size="sm" onClick={this.handleSubmit} disabled={!this.state.writeAccess || this.state.saving}>SAVE</Button>
        </Modal.Footer>
      </Modal >
    );
  }
}