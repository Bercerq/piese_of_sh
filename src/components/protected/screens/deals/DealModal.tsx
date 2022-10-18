import React, { Component, Fragment } from "react";
import { Modal, Button, Form, Alert, InputGroup } from "react-bootstrap";
import Select from "react-select";
import * as Validation from "../../../../client/Validation";
import * as _ from "lodash";
import momentPropTypes from "react-moment-proptypes";
import moment from "moment";
import * as Helper from "../../../../client/Helper";
import Datetime from "react-datetime";
import { ValidationError, SelectOption, ScopeType } from "../../../../client/schemas";
import { Rights } from "../../../../models/Common";
import FontIcon from "../../../UI/FontIcon";
import { Deal } from "../../../../models/data/Deal";
import Loader from "../../../UI/Loader";

interface DealModalProps {
  show: boolean;
  deal: Deal | null;
  sspOptions: SelectOption[];
  rights: Rights;
  scope: ScopeType;
  scopeId: number;
  maxLevel: ScopeType;
  onClose: () => void;
  onSubmit: (id: number, deal: Deal) => void;
}

interface DealModalState {
  id: number;
  externalId: string;
  name: string;
  description: string;
  ssp: string;
  expirationDate: momentPropTypes.momentObj | null;
  level?: ScopeType;
  entityId?: number;
  escalationDeal: string;
  entityOptions: SelectOption[];
  writeAccess: boolean;
  saving: boolean;
  showAdvanced: boolean;
  showLoader: boolean;
  externalIdValidation: ValidationError;
  nameValidation: ValidationError;
}

export default class DealModal extends Component<DealModalProps, DealModalState> {
  constructor(props, context) {
    super(props, context);
    this.state = this.initialState();
  }

  async loadData(props: DealModalProps) {
    if (props.deal) {
      const expirationDate = props.deal.expirationDate ? moment(props.deal.expirationDate) : moment().add(1, 'years').endOf('day');
      const escalationDeal = props.deal.escalationDeal;
      const showAdvanced = escalationDeal ? true : false;
      this.setState({
        id: props.deal.id,
        externalId: props.deal.externalId,
        name: props.deal.name,
        description: props.deal.description,
        escalationDeal,
        showAdvanced,
        ssp: props.deal.ssp,
        writeAccess: props.deal.writeAccess,
        saving: false,
        expirationDate
      });
    } else {
      const level = this.props.scope;
      let entityOptions: SelectOption[] = [];
      if (level !== "root") {
        entityOptions = await Helper.getEntityOptions("deals", props.scope, props.scopeId, level);
      }
      const entityId = (entityOptions.length > 0 ? entityOptions[0].value : -1) as number;
      const expirationDate = moment().add(1, 'years').endOf('day');
      const ssp = (props.sspOptions.length > 0 ? props.sspOptions[0].value : "") as string;
      this.setState({
        id: -1,
        externalId: "",
        name: "",
        description: "",
        ssp,
        escalationDeal: "",
        showAdvanced: false,
        level,
        entityId,
        writeAccess: true,
        entityOptions,
        saving: false,
        expirationDate
      });
    }
  }

  initialState() {
    return {
      id: -1,
      externalId: "",
      name: "",
      description: "",
      ssp: "",
      expirationDate: moment().add(1, 'years').endOf('day'),
      entityOptions: [{ value: -1, label: "" }],
      entityId: -1,
      level: this.props.scope,
      escalationDeal: "",
      writeAccess: false,
      showAdvanced: false,
      saving: false,
      showLoader: false,
      externalIdValidation: {
        error: false,
        message: ""
      },
      nameValidation: {
        error: false,
        message: ""
      }
    };
  }

  handleEntering = async () => {
    await this.loadData(this.props);
  }

  handleClose = () => {
    const state = this.initialState();
    this.setState(state, () => { this.props.onClose() });
  }

  handleExternalIdChange = (e) => {
    const externalId = e.target.value;
    const externalIdValidation = Validation.required(externalId);
    this.setState({ externalId, externalIdValidation });
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
        const entityOptions = await Helper.getEntityOptions("deals", this.props.scope, this.props.scopeId, level);
        const entityId = (entityOptions.length > 0 ? parseInt(entityOptions[0].value as string, 10) : -1) as number;
        this.setState({ level, entityOptions, entityId, showLoader: false });
      });
    }
  }

  handleEntityChange = (selected) => {
    this.setState({ entityId: parseInt(selected.value, 10) });
  }

  handleSSPChange = (selected) => {
    const ssp = selected.value;
    this.setState({ ssp });
  };

  handleAdvancedClick = (e) => {
    e.preventDefault();
    this.setState({ showAdvanced: !this.state.showAdvanced });
  }

  handleBackupDealChange = (e) => {
    const escalationDeal = e.target.value;
    this.setState({ escalationDeal });
  }

  handleSubmit = () => {
    const externalId = this.state.externalId;
    const name = this.state.name;
    const nameValidation = Validation.required(name);
    const externalIdValidation = Validation.required(externalId);

    if (nameValidation.error || externalIdValidation.error) {
      this.setState({ nameValidation, externalIdValidation });
    } else {
      this.setState({ saving: true }, () => {
        if (this.state.id > 0) {
          const deal: Deal = {
            externalId,
            name,
            ssp: this.state.ssp,
            description: this.state.description,
            escalationDeal: this.state.escalationDeal,
            expirationDate: this.state.expirationDate.format("YYYY-MM-DD HH:mm:ss")
          }
          this.props.onSubmit(this.state.id, deal);
        } else {
          const scope = Helper.getScopeByLevel(this.state.level);
          let deal: Deal = {
            name,
            externalId,
            ssp: this.state.ssp,
            description: this.state.description,
            escalationDeal: this.state.escalationDeal,
            scope: { scope, scopeId: null },
            expirationDate: this.state.expirationDate.format("YYYY-MM-DD HH:mm:ss")
          };
          if (this.state.level !== "root") {
            deal.scope.scopeId = this.state.entityId;
          }
          this.props.onSubmit(this.state.id, deal);
        }
      });
    }
  }

  render() {
    const levelOptions = Helper.getLevelOptions(this.props.maxLevel);
    const owner = _.get(this.props, "deal.scope.owner");
    const dealScope = _.get(this.props, "deal.scope.scope") || "";
    return (
      <Modal className="deal-modal" show={this.props.show} onHide={this.handleClose} onEntering={this.handleEntering} backdrop="static">
        <Modal.Header closeButton>
          <Modal.Title>{this.state.id > 0 ? "Edit" : "Add"} deal</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="row">
            <div className="col-sm-12">
              <Form.Group controlId="deal-externalid">
                <Form.Label>Id *</Form.Label>
                <Form.Control
                  disabled={!this.state.writeAccess}
                  isInvalid={this.state.externalIdValidation.error}
                  autoFocus
                  type="text"
                  value={this.state.externalId}
                  onChange={this.handleExternalIdChange}
                />
                {this.state.externalIdValidation.error && <Form.Control.Feedback type="invalid">{this.state.externalIdValidation.message}</Form.Control.Feedback>}
              </Form.Group>
              <Form.Group controlId="deal-name">
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
              <Form.Group controlId="deal-ssp">
                <Form.Label>SSP/Exchange</Form.Label>
                <Select
                  inputId="react-select-deal-ssp"
                  isDisabled={!this.state.writeAccess}
                  className="react-select-container"
                  classNamePrefix="react-select"
                  onChange={this.handleSSPChange}
                  value={this.props.sspOptions.find((o) => { return o.value === this.state.ssp })}
                  options={this.props.sspOptions}
                />
              </Form.Group>
              <Form.Group controlId="deal-description">
                <Form.Label>Description</Form.Label>
                <Form.Control as="textarea"
                  autoFocus
                  disabled={!this.state.writeAccess}
                  type="text"
                  rows={3}
                  value={this.state.description}
                  onChange={(e: any) => { this.setState({ description: e.target.value }) }}
                />
              </Form.Group>
              <Form.Label>Expires</Form.Label>
              <InputGroup>
                <InputGroup.Prepend>
                  <InputGroup.Text><FontIcon name="calendar" /></InputGroup.Text>
                </InputGroup.Prepend>
                <Datetime
                  inputProps={{ disabled: !this.state.writeAccess }}
                  dateFormat="YYYY-MM-DD"
                  timeFormat="HH:mm:ss"
                  value={this.state.expirationDate}
                  onChange={(date) => { this.setState({ expirationDate: date }) }}
                  isValidDate={(current) => { return moment(current).isAfter(); }}
                />
              </InputGroup>
              {this.state.id === -1 &&
                <Form.Group controlId="deal-scope">
                  <Form.Label>Level:</Form.Label>
                  <Select
                    inputId="react-select-deal-scope"
                    className="react-select-container"
                    classNamePrefix="react-select"
                    isDisabled={this.state.id !== -1}
                    clearable={false}
                    value={levelOptions.find((o) => { return o.value === this.state.level })}
                    onChange={this.handleLevelChange}
                    options={levelOptions}
                  />
                </Form.Group>
              }
              {this.state.level !== "root" && this.state.id === -1 && <Fragment>
                <Loader visible={this.state.showLoader} loaderClass="loading-input" />
                {!this.state.showLoader &&
                  <Form.Group controlId="deal-entity">
                    <Form.Label>{Helper.getLabelByScopeType(this.state.level)}</Form.Label>
                    <Select
                      inputId="react-select-deal-entity"
                      className="react-select-container"
                      classNamePrefix="react-select"
                      value={this.state.entityOptions.find((o) => { return o.value === this.state.entityId })}
                      clearable={false}
                      onChange={this.handleEntityChange}
                      options={this.state.entityOptions}
                    />
                  </Form.Group>
                }
              </Fragment>
              }
              {this.state.id > 0 && <Fragment>
                <Form.Group controlId="deal-level">
                  <Form.Label>Level:</Form.Label>
                  <Form.Control
                    disabled={true}
                    type="text"
                    value={Helper.getLabelByScope(dealScope)}
                  />
                </Form.Group>
                <Form.Group controlId="deal-owner">
                  <Form.Label>Owner:</Form.Label>
                  <Form.Control
                    disabled={true}
                    type="text"
                    value={owner}
                  />
                </Form.Group>
              </Fragment>
              }
              <p>
                <a style={{ textDecoration: "none" }} href="" onClick={this.handleAdvancedClick}><FontIcon name={this.state.showAdvanced ? "chevron-up" : "chevron-down"} /> Advanced settings</a>
              </p>
              {this.state.showAdvanced && <Fragment>
                <Form.Group controlId="deal-backupdeal">
                  <Form.Label>Escalation deal</Form.Label>
                  <Form.Control
                    disabled={!this.state.writeAccess}
                    type="text"
                    value={this.state.escalationDeal}
                    onChange={this.handleBackupDealChange}
                  />
                </Form.Group>
                <Alert variant="info">
                  <p><FontIcon name="info-circle" /> <strong>Escalation deals</strong> are used whenever a campaign is behind schedule, but it has already reached its max bid price.</p>
                  <p>This may help if the escalation deal has a higher priority, but in most cases a higher max bid price will be more effective.</p>
                </Alert>
              </Fragment>
              }
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="light" size="sm" onClick={this.handleClose}>CANCEL</Button>
          <Button variant="primary" size="sm" onClick={this.handleSubmit} disabled={!this.state.writeAccess || this.state.saving}>SAVE</Button>
        </Modal.Footer>
      </Modal>
    );
  }
}