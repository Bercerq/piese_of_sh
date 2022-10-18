import React, { Component } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import Select from "react-select";
import * as _ from "lodash";
import * as Api from "../../../../../client/Api";
import { ValidationError, SelectOption, ScopeType } from "../../../../../client/schemas";
import * as Validation from "../../../../../client/Validation";
import { CampaignGroupEntity } from "../../../../../models/data/CampaignGroup";
import { Scope } from "../../../../../models/Common";

interface CampaignGroupModalProps {
  campaignGroup: CampaignGroupEntity;
  scope?: Scope;
  scopeId?: number;
  show: boolean;
  onClose: () => void;
  onSubmit: (id: number, campaignGroup: CampaignGroupEntity) => void;
}

interface CampaignGroupModalState {
  id: number;
  name: string;
  advertisers: SelectOption[];
  advertiserId: number;
  nameValidation: ValidationError;
  saving: boolean;
}

export default class CampaignGroupModal extends Component<CampaignGroupModalProps, CampaignGroupModalState> {
  constructor(props, context) {
    super(props, context);
    this.state = this.initialState();
  }

  async loadData(props: CampaignGroupModalProps) {
    if (props.campaignGroup) {
      const id = _.get(props, "campaignGroup.id", -1);
      const name = _.get(props, "campaignGroup.name", "");
      this.setState({ id, name, saving: false });
    } else {
      if (props.scope === "advertiser") {
        const advertiserId = props.scopeId;
        this.setState({ id: -1, name: "", advertiserId, saving: false });
      } else {
        const qs = this.getAdvertisersOptions(props);
        const rslt = await Api.Get({ path: "/api/advertisers", qs });
        const advertisers = _.get(rslt, "advertisers", []).map((o) => { return { value: o.advertiser.id, label: o.advertiser.name } });
        const advertiserId = advertisers.length > 0 ? advertisers[0].value : -1;
        this.setState({ id: -1, name: "", advertisers, advertiserId, saving: false });
      }
    }
  }

  getAdvertisersOptions(props: CampaignGroupModalProps) {
    if (props.scope === "metaAgency") {
      return { organizationId: props.scopeId };
    } else if (props.scope === "agency") {
      return { agencyId: props.scopeId }
    }
    return {};
  }

  initialState() {
    return {
      id: -1,
      name: "",
      advertisers: [],
      advertiserId: -1,
      nameValidation: {
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

  handleAdvertiserChange = (selected) => {
    this.setState({ advertiserId: selected.value });
  }

  handleSubmit = () => {
    const name = this.state.name;
    const nameValidation = Validation.required(name);
    const advertiserId = this.state.advertiserId;

    if (nameValidation.error) {
      this.setState({ nameValidation });
    } else {
      this.setState({ saving: true }, () => {
        if (this.state.id > 0) {
          const campaignGroup: CampaignGroupEntity = { name };
          this.props.onSubmit(this.state.id, campaignGroup);
        } else {
          const campaignGroup: CampaignGroupEntity = { advertiserId, name };
          this.props.onSubmit(this.state.id, campaignGroup);
        }
      });
    }
  }

  render() {
    const showAdvertiserSelect = ["all", "metaAgency", "agency"].indexOf(this.props.scope) > -1 && this.state.id === -1;
    return <Modal show={this.props.show} onHide={this.handleClose} onEntering={this.handleEntering} backdrop="static">
      <Modal.Header closeButton>
        <Modal.Title>Campaign group setup</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="row">
          <div className="col-sm-12">
            {showAdvertiserSelect &&
              <Form.Group controlId="campaigngroup-advertiser">
                <Form.Label>Advertiser * </Form.Label>
                <Select
                  inputId="react-select-campaigngroup-advertiser"
                  className="react-select-container"
                  classNamePrefix="react-select"
                  clearable={false}
                  value={this.state.advertisers.find((o) => { return o.value === this.state.advertiserId })}
                  onChange={this.handleAdvertiserChange}
                  options={this.state.advertisers}
                />
              </Form.Group>
            }
            <Form.Group controlId="campaigngroup-name">
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