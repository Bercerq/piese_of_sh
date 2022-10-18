import React, { Component } from "react";
import { Button } from "react-bootstrap";
import * as _ from "lodash";
import NotificationSystem from "react-notification-system";
import * as NotificationOptions from "../../../../../client/NotificationOptions";
import * as Api from "../../../../../client/Api";
import { AgencyEntity } from "../../../../../models/data/Agency";
import { Rights, Options, TabProps } from "../../../../../models/Common";
import { AppUser } from "../../../../../models/AppUser";
import FontIcon from "../../../../UI/FontIcon";
import Loader from "../../../../UI/Loader";
import ErrorContainer from "../../../../UI/ErrorContainer";
import Confirm from "../../../../UI/Confirm";
import AgenciesTable from "./AgenciesTable";
import AgencyAddModal from "./AgencyAddModal";
import AgencyEditModal from "./AgencyEditModal";

interface AgenciesTabState {
  agencies: any[];
  showLoader: boolean;
  showAddModal: boolean;
  showEditModal: boolean;
  showDeleteConfirm: boolean;
  editAgency: AgencyEntity;
  writeAccess: boolean;
  deleteId: number;
  deleteAgency: AgencyEntity;
  error: boolean;
  errorMessage: string;
}

export default class AgenciesTab extends Component<TabProps, AgenciesTabState> {
  private _notificationSystem: NotificationSystem.System;
  private setNotificationSystemRef: (any) => void;
  private controller = new AbortController();

  constructor(props, context) {
    super(props, context);
    this._notificationSystem = null;
    this.setNotificationSystemRef = el => { this._notificationSystem = el; };

    this.state = {
      agencies: [],
      showLoader: true,
      showAddModal: false,
      showEditModal: false,
      writeAccess: false,
      showDeleteConfirm: false,
      editAgency: null,
      deleteId: -1,
      deleteAgency: null,
      error: false,
      errorMessage: ""
    };
  }

  async componentDidMount(): Promise<void> {
    try {
      const agencies = await Api.Get({ path: "/api/agencies/statistics", qs: this.props.options, signal: this.controller.signal });
      this.setState({ agencies, showLoader: false });
    } catch (err) {
      if (err.name === "AbortError") {
        this.setState({ showLoader: true, error: false, errorMessage: "" });
      } else {
        this.setState({ error: true, errorMessage: "Error loading agencies.", showLoader: false });
      }
    }
  }

  componentWillReceiveProps(nextProps) {
    if (!_.isEqual(nextProps.options, this.props.options)) {
      this.setState({ showLoader: true, error: false, errorMessage: "" }, async () => {
        try {
          this.controller.abort();
          this.controller = new AbortController();
          const agencies = await Api.Get({ path: "/api/agencies/statistics", qs: nextProps.options, signal: this.controller.signal });
          this.setState({ agencies, showLoader: false });
        } catch (err) {
          if (err.name === "AbortError") {
            this.setState({ showLoader: true, error: false, errorMessage: "" });
          } else {
            this.setState({ error: true, errorMessage: "Error loading agencies.", showLoader: false });
          }
        }
      });
    }
  }

  componentWillUnmount(){
    this.controller.abort();
  }

  editClick = (id, writeAccess) => {
    const agencyRow = this.state.agencies.find((o) => { return o.agency.id === id });
    const editAgency = _.get(agencyRow, "agency");
    this.setState({ editAgency, showEditModal: true, writeAccess });
  }

  deleteClick = (deleteId) => {
    const agencyRow = this.state.agencies.find((o) => { return o.agency.id === deleteId });
    const deleteAgency = _.get(agencyRow, "agency");
    this.setState({ showDeleteConfirm: true, deleteId, deleteAgency });
  }

  deleteAgency = async () => {
    try {
      await Api.Delete({ path: "/api/agencies/" + this.state.deleteId });
      this.setState({ showDeleteConfirm: false, showLoader: true }, async () => {
        const agencies = await Api.Get({ path: "/api/agencies/statistics", qs: this.props.options });
        this.setState({ agencies, showLoader: false });
        const deleteAgencyName = _.get(this.state.deleteAgency, "name", "");
        this._notificationSystem.addNotification(NotificationOptions.success(<span>Agency <strong>{deleteAgencyName}</strong> deleted.</span>, false));
      });
    } catch (err) {
      this.setState({ showDeleteConfirm: false, showLoader: false });
      this._notificationSystem.addNotification(NotificationOptions.error("Error deleting agency."));
    }
  }

  handleSubmit = async (id: number, agency: AgencyEntity) => {
    if (id > 0) {
      await this.updateAgency(id, agency);
    } else {
      await this.addAgency(agency);
    }
  }

  async addAgency(agency: AgencyEntity) {
    try {
      await Api.Post({ path: "/api/agencies", body: agency });
      this.setState({ showAddModal: false, showLoader: true }, async () => {
        const agencies = await Api.Get({ path: "/api/agencies/statistics", qs: this.props.options });
        this.setState({ agencies, showLoader: false, editAgency: null });
        this._notificationSystem.addNotification(NotificationOptions.success(<span>Agency <strong>{agency.name}</strong> created.</span>, false));
      });
    } catch (err) {
      this.setState({ showAddModal: false, editAgency: null });
      this._notificationSystem.addNotification(NotificationOptions.error("Error creating agency."));
    }
  }

  async updateAgency(id: number, agency: AgencyEntity) {
    try {
      await Api.Put({ path: "/api/agencies/" + id, body: agency });
      this.setState({ showEditModal: false, editAgency: null, showLoader: true }, async () => {
        const agencies = await Api.Get({ path: "/api/agencies/statistics", qs: this.props.options });
        this.setState({ agencies, showLoader: false });
        this._notificationSystem.addNotification(NotificationOptions.success(<span>Agency <strong>{agency.name}</strong> saved.</span>, false));
      });
    } catch (err) {
      this.setState({ showEditModal: false, editAgency: null });
      this._notificationSystem.addNotification(NotificationOptions.error("Error updating agency."));
    }
  }

  render() {
    if (!this.state.error) {
      const deleteAgencyName = _.get(this.state.deleteAgency, "name", "");
      return <div className="col-sm-12 pt-3">
        <div className="card mb-2">
          <h3 className="pull-left">Agencies</h3>
          <div className="table-btn-container">
            {this.props.rights.MANAGE_ORGANIZATION && <Button size="sm" variant="primary" onClick={() => { this.setState({ showAddModal: true }) }}><FontIcon name="plus" /> ADD</Button>}
          </div>
          <Loader visible={this.state.showLoader} />
          {!this.state.showLoader &&
            <AgenciesTable
              agencies={this.state.agencies}
              user={this.props.user}
              rights={this.props.rights}
              videoMode={this.props.videoMode}
              editClick={this.editClick}
              deleteClick={this.deleteClick}
            />
          }
        </div>
        <AgencyAddModal
          show={this.state.showAddModal}
          scope={this.props.options.scope}
          scopeId={this.props.options.scopeId}
          onClose={() => { this.setState({ showAddModal: false }) }}
          onSubmit={this.handleSubmit}
        />
        <AgencyEditModal
          show={this.state.showEditModal}
          agency={this.state.editAgency}
          writeAccess={this.state.writeAccess}
          onClose={() => { this.setState({ showEditModal: false, editAgency: null }) }}
          onSubmit={this.handleSubmit}
        />
        <Confirm
          message={`Delete agency ${deleteAgencyName}?`}
          show={this.state.showDeleteConfirm}
          onClose={() => this.setState({ showDeleteConfirm: false })}
          onConfirm={this.deleteAgency}
        />
        <NotificationSystem ref={this.setNotificationSystemRef} />
      </div>;
    } else {
      return <div className="col-sm-12 pt-3">
        <div className="card">
          <h3><ErrorContainer message={this.state.errorMessage} /></h3>
        </div>
      </div>;
    }
  }
}