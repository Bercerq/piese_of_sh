import React, { Component } from "react";
import { Button } from "react-bootstrap";
import * as _ from "lodash";
import NotificationSystem from "react-notification-system";
import * as NotificationOptions from "../../../../../client/NotificationOptions";
import { OrganizationEntity } from "../../../../../models/data/Organization";
import { Rights, Options, TabProps } from "../../../../../models/Common";
import { AppUser } from "../../../../../models/AppUser";
import FontIcon from "../../../../UI/FontIcon";
import Loader from "../../../../UI/Loader";
import ErrorContainer from "../../../../UI/ErrorContainer";
import OrganizationsTable from "./OrganizationsTable";
import Confirm from "../../../../UI/Confirm";
import OrganizationModal from "./OrganizationModal";
import * as Api from "../../../../../client/Api";

interface OrganizationsTabState {
  organizations: any[];
  showLoader: boolean;
  showEditModal: boolean;
  showDeleteConfirm: boolean;
  editOrganization: OrganizationEntity;
  deleteId: number;
  deleteOrganization: OrganizationEntity;
  error: boolean;
  errorMessage: string;
}

export default class OrganizationsTab extends Component<TabProps, OrganizationsTabState> {
  private _notificationSystem: NotificationSystem.System;
  private setNotificationSystemRef: (any) => void;
  private controller = new AbortController();

  constructor(props, context) {
    super(props, context);
    this._notificationSystem = null;
    this.setNotificationSystemRef = el => { this._notificationSystem = el; };

    this.state = {
      organizations: [],
      showLoader: true,
      showEditModal: false,
      showDeleteConfirm: false,
      editOrganization: null,
      deleteId: -1,
      deleteOrganization: null,
      error: false,
      errorMessage: ""
    };
  }

  async componentDidMount(): Promise<void> {
    try {
      const organizations = await Api.Get({ path: "/api/organizations/statistics", qs: this.props.options, signal: this.controller.signal });
      this.setState({ organizations, showLoader: false });
    } catch (err) {
      if (err.name === "AbortError") {
        this.setState({ showLoader: true, error: false, errorMessage: "" });
      } else {
        this.setState({ error: true, errorMessage: "Error loading organizations.", showLoader: false });
      }
    }
  }

  componentWillReceiveProps(nextProps) {
    if (!_.isEqual(nextProps.options, this.props.options)) {
      this.setState({ showLoader: true, error: false, errorMessage: "" }, async () => {
        try {
          this.controller.abort();
          this.controller = new AbortController();
          const organizations = await Api.Get({ path: "/api/organizations/statistics", qs: nextProps.options });
          this.setState({ organizations, showLoader: false });
        } catch (err) {
          if (err.name === "AbortError") {
            this.setState({ showLoader: true, error: false, errorMessage: "" });
          } else {
            this.setState({ error: true, errorMessage: "Error loading organizations.", showLoader: false });
          }
        }
      });
    }
  }

  editClick = (id) => {
    const organizationRow = this.state.organizations.find((o) => { return o.organization.id === id });
    const editOrganization = _.get(organizationRow, "organization");
    this.setState({ editOrganization, showEditModal: true });
  }

  deleteClick = (deleteId) => {
    const organizationRow = this.state.organizations.find((o) => { return o.organization.id === deleteId });
    const deleteOrganization = _.get(organizationRow, "organization");
    this.setState({ showDeleteConfirm: true, deleteId, deleteOrganization });
  }

  deleteOrganization = async () => {
    try {
      await Api.Delete({ path: "/api/organizations/" + this.state.deleteId });
      this.setState({ showDeleteConfirm: false, showLoader: true }, async () => {
        const organizations = await Api.Get({ path: "/api/organizations/statistics", qs: this.props.options });
        this.setState({ organizations, showLoader: false });
        const deleteOrganizationName = _.get(this.state.deleteOrganization, "name", "");
        this._notificationSystem.addNotification(NotificationOptions.success(<span>Organization <strong>{deleteOrganizationName}</strong> deleted.</span>, false));
      });
    } catch (err) {
      this.setState({ showDeleteConfirm: false, showLoader: false });
      this._notificationSystem.addNotification(NotificationOptions.error("Error deleting organization."));
    }
  }

  handleSubmit = async (id: number, organization: OrganizationEntity) => {
    if (id > 0) {
      await this.updateOrganization(id, organization);
    } else {
      await this.addOrganization(organization);
    }
  }

  async addOrganization(organization: OrganizationEntity) {
    try {
      await Api.Post({ path: "/api/organizations", body: organization });
      this.setState({ showEditModal: false, showLoader: true }, async () => {
        const organizations = await Api.Get({ path: "/api/organizations/statistics", qs: this.props.options });
        this.setState({ organizations, showLoader: false, editOrganization: null });
        this._notificationSystem.addNotification(NotificationOptions.success(<span>Organization <strong>{organization.name}</strong> created.</span>, false));
      });
    } catch (err) {
      this.setState({ showEditModal: false, editOrganization: null });
      this._notificationSystem.addNotification(NotificationOptions.error("Error creating organization."));
    }
  }

  async updateOrganization(id: number, organization: OrganizationEntity) {
    try {
      await Api.Put({ path: "/api/organizations/" + id, body: organization });
      this.setState({ showEditModal: false, editOrganization: null, showLoader: true }, async () => {
        const organizations = await Api.Get({ path: "/api/organizations/statistics", qs: this.props.options });
        this.setState({ organizations, showLoader: false });
        this._notificationSystem.addNotification(NotificationOptions.success(<span>Organization <strong>{organization.name}</strong> saved.</span>, false));
      });
    } catch (err) {
      this.setState({ showEditModal: false, editOrganization: null });
      this._notificationSystem.addNotification(NotificationOptions.error("Error updating organization."));
    }
  }

  render() {
    if (!this.state.error) {
      const deleteOrganizationName = _.get(this.state.deleteOrganization, "name", "");
      return <div className="col-sm-12 pt-3">
        <div className="card mb-2">
          <h3 className="pull-left">Organizations</h3>
          <div className="table-btn-container">
            <Button size="sm" variant="primary" onClick={() => { this.setState({ showEditModal: true }) }}><FontIcon name="plus" /> ADD</Button>
          </div>
          <Loader visible={this.state.showLoader} />
          {!this.state.showLoader &&
            <OrganizationsTable
              rights={this.props.rights}
              user={this.props.user}
              videoMode={this.props.videoMode}
              organizations={this.state.organizations}
              editClick={this.editClick}
              deleteClick={this.deleteClick}
            />
          }
        </div>
        <OrganizationModal
          show={this.state.showEditModal}
          organization={this.state.editOrganization}
          onClose={() => { this.setState({ showEditModal: false, editOrganization: null }) }}
          onSubmit={this.handleSubmit}
        />
        <Confirm
          message={`Delete organization ${deleteOrganizationName}?`}
          show={this.state.showDeleteConfirm}
          onClose={() => this.setState({ showDeleteConfirm: false })}
          onConfirm={this.deleteOrganization}
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