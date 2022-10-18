import React, { Component, Fragment } from "react";
import { Button, Collapse } from "react-bootstrap";
import NotificationSystem from "react-notification-system";
import * as NotificationOptions from "../../../../../client/NotificationOptions";
import * as _ from "lodash";
import * as Api from "../../../../../client/Api";
import * as ExcelHelper from "../../../../../client/ExcelHelper";
import Loader from "../../../../UI/Loader";
import ErrorContainer from "../../../../UI/ErrorContainer";
import Confirm from "../../../../UI/Confirm";
import FontIcon from "../../../../UI/FontIcon";
import CampaignGroupsTable from "./CampaignGroupsTable";
import CampaignGroupModal from "./CampaignGroupModal";
import CampaignGroupsArchiveModal from "./CampaignGroupsArchiveModal";
import { Rights, Options, TabProps } from "../../../../../models/Common";
import { AppUser } from "../../../../../models/AppUser";
import { CampaignGroupEntity } from "../../../../../models/data/CampaignGroup";
import ReportModal from "../../../shared/reports/ReportModal";
import { Metric, DateRange } from "../../../../../client/schemas";

interface CampaignGroupsTabState {
  campaignGroups: { recent: any[]; older: any[]; archived: any[]; };
  showLoader: boolean;
  showEditModal: boolean;
  showArchiveModal: boolean;
  showRecentReportModal: boolean;
  showOlderReportModal: boolean;
  downloadingRecent: boolean;
  downloadingOlder: boolean;
  archivedOpen: boolean;
  showArchiveConfirm: boolean;
  showRestoreConfirm: boolean;
  editCampaignGroup: CampaignGroupEntity;
  archiveId: number;
  archiveCampaignGroup: CampaignGroupEntity;
  restoreId: number;
  restoreCampaignGroup: CampaignGroupEntity;
  error: boolean;
  errorMessage: string;
}

export default class CampaignGroupsTab extends Component<TabProps, CampaignGroupsTabState> {
  private _notificationSystem: NotificationSystem.System;
  private setNotificationSystemRef: (any) => void;
  private controller = new AbortController();

  constructor(props, context) {
    super(props, context);
    this._notificationSystem = null;
    this.setNotificationSystemRef = el => { this._notificationSystem = el; };

    this.state = {
      campaignGroups: { recent: [], older: [], archived: [] },
      showLoader: true,
      showEditModal: false,
      showArchiveModal: false,
      archivedOpen: false,
      showArchiveConfirm: false,
      showRecentReportModal: false,
      showOlderReportModal: false,
      downloadingRecent: false,
      downloadingOlder: false,
      showRestoreConfirm: false,
      editCampaignGroup: null,
      archiveId: -1,
      archiveCampaignGroup: null,
      restoreId: -1,
      restoreCampaignGroup: null,
      error: false,
      errorMessage: ""
    };
  }

  async componentDidMount(): Promise<void> {
    try {
      const data: any = await Api.Get({ path: "/api/campaigngroups/statistics", qs: this.props.options, signal: this.controller.signal });
      const campaignGroups = this.getCampaignGroups(data);
      this.setState({ campaignGroups, showLoader: false });
    } catch (err) {
      if (err.name === "AbortError") {
        this.setState({ showLoader: true, error: false, errorMessage: "" });
      } else {
        this.setState({ error: true, errorMessage: "Error loading campaign groups.", showLoader: false });
      }
    }
  }

  componentWillReceiveProps(nextProps) {
    if (!_.isEqual(nextProps.options, this.props.options)) {
      this.setState({ showLoader: true, error: false, errorMessage: "" }, async () => {
        try {
          this.controller.abort();
          this.controller = new AbortController();
          const data: any = await Api.Get({ path: "/api/campaigngroups/statistics", qs: nextProps.options, signal: this.controller.signal });
          const campaignGroups = this.getCampaignGroups(data);
          this.setState({ campaignGroups, showLoader: false });
        } catch (err) {
          if (err.name === "AbortError") {
            this.setState({ showLoader: true, error: false, errorMessage: "" });
          } else {
            this.setState({ error: true, errorMessage: "Error loading campaign groups.", showLoader: false });
          }
        }
      });
    }
  }

  componentWillUnmount(){
    this.controller.abort();
  }

  getCampaignGroups(data: any) {
    const campaignGroups = data.map((o, i) => {
      let row = _.assign({}, o, {
        id: o.campaignGroup.id,
        status: o.campaignGroup.status.toLowerCase(),
        isRecent: o.campaignGroup.isRecent,
        budgetPacing: o.campaignGroup.budgetPacing ? _.assign({}, o.campaignGroup.budgetPacing, { percentageDone: o.campaignGroup.percentageDone }) : o.campaignGroup.budgetPacing,
        impressionPacing: o.campaignGroup.impressionPacing ? _.assign({}, o.campaignGroup.impressionPacing, { percentageDone: o.campaignGroup.percentageDone }) : o.campaignGroup.impressionPacing,
        campaigns: o.campaignGroup.campaigns,
        startDate: o.campaignGroup.startDate,
        endDate: o.campaignGroup.endDate
      });
      return row;
    });
    const partition1 = _.partition(campaignGroups, (o) => { return o.status === 'archived'; });
    const partition2 = _.partition(partition1[1], (o) => { return o.isRecent });

    return {
      recent: partition2[0],
      older: partition2[1],
      archived: partition1[0]
    }
  }

  handleArchivedHeaderClick = (e) => {
    e.preventDefault();
    this.setState({ archivedOpen: !this.state.archivedOpen });
  }

  handleSubmit = async (id: number, campaignGroup: CampaignGroupEntity) => {
    if (id > 0) {
      await this.updateCampaignGroup(id, campaignGroup);
    } else {
      await this.addCampaignGroup(campaignGroup);
    }
  }

  async addCampaignGroup(campaignGroup: CampaignGroupEntity) {
    try {
      await Api.Post({ path: "/api/campaigngroups", body: campaignGroup });
      this.setState({ showEditModal: false, showLoader: true }, async () => {
        const data: any = await Api.Get({ path: "/api/campaigngroups/statistics", qs: this.props.options });
        const campaignGroups = this.getCampaignGroups(data);
        this.setState({ campaignGroups, showLoader: false, editCampaignGroup: null });

        this._notificationSystem.addNotification(NotificationOptions.success(<span>Campaign group <strong>{campaignGroup.name}</strong> created.</span>, false));
      });
    } catch (err) {
      this.setState({ showEditModal: false, editCampaignGroup: null });
      this._notificationSystem.addNotification(NotificationOptions.error("Error creating campaign group."));
    }
  }

  async updateCampaignGroup(id: number, campaignGroup: CampaignGroupEntity) {
    try {
      await Api.Put({ path: "/api/campaigngroups/" + id, body: campaignGroup });
      this.setState({ showEditModal: false, editCampaignGroup: null, showLoader: true }, async () => {
        const data: any = await Api.Get({ path: "/api/campaigngroups/statistics", qs: this.props.options });
        const campaignGroups = this.getCampaignGroups(data);
        this.setState({ campaignGroups, showLoader: false });
        this._notificationSystem.addNotification(NotificationOptions.success(<span>Campaign group <strong>{campaignGroup.name}</strong> saved.</span>, false));
      });
    } catch (err) {
      this.setState({ showEditModal: false, editCampaignGroup: null });
      this._notificationSystem.addNotification(NotificationOptions.error("Error updating campaign group."));
    }
  }

  getMetrics(): Metric[] {
    if (this.props.rights.VIEW_STATISTICS) {
      if (this.props.videoMode) {
        if (this.props.rights.VIEW_FINANCIALS) {
          return [
            { col: 'id', label: '#' },
            { col: 'displayName', label: 'name', type: 'campaigngroup', align: 'left' },
            { col: 'status', label: 'status', align: 'left' },
            { col: 'campaigns', label: 'campaigns', type: 'campaign_list', align: 'center' },
            { col: 'impressions', label: 'impressions', align: 'right', type: 'number' },
            { col: 'completions', label: 'completions', align: 'right', type: 'number' },
            { col: 'clicks', label: 'clicks', align: 'right', type: 'number' },
            { col: 'cvr', label: 'cvr', align: 'right', type: 'perc' },
            { col: 'budgetPacing', label: 'budget', type: 'budget_completion', align: 'right' },
            { col: 'impressionPacing', label: 'pacing', type: 'impression_completion', align: 'right' },
            { col: 'costs', label: 'cost', type: 'money', align: 'right' },
            { col: 'profit', label: 'profit', type: 'money', align: 'right' },
            { col: 'startDate', label: 'start', align: 'left' },
            { col: 'endDate', label: 'end', align: 'left' }
          ];
        } else {
          return [
            { col: 'id', label: '#' },
            { col: 'displayName', label: 'name', type: 'campaigngroup', align: 'left' },
            { col: 'status', label: 'status', align: 'left' },
            { col: 'campaigns', label: 'campaigns', type: 'campaign_list', align: 'center' },
            { col: 'impressions', label: 'impressions', align: 'right', type: 'number' },
            { col: 'completions', label: 'completions', align: 'right', type: 'number' },
            { col: 'clicks', label: 'clicks', align: 'right', type: 'number' },
            { col: 'cvr', label: 'cvr', align: 'right', type: 'perc' },
            { col: 'budgetPacing', label: 'budget', type: 'budget_completion', align: 'right' },
            { col: 'impressionPacing', label: 'pacing', type: 'impression_completion', align: 'right' },
            { col: 'costs', label: 'cost', type: 'money', align: 'right' },
            { col: 'startDate', label: 'start', align: 'left' },
            { col: 'endDate', label: 'end', align: 'left' }
          ];
        }
      } else {
        if (this.props.rights.VIEW_FINANCIALS) {
          return [
            { col: 'id', label: '#' },
            { col: 'displayName', label: 'name', type: 'campaigngroup', align: 'left' },
            { col: 'status', label: 'status', align: 'left' },
            { col: 'campaigns', label: 'campaigns', type: 'campaign_list', align: 'center' },
            { col: 'impressions', label: 'impressions', align: 'right', type: 'number' },
            { col: 'clicks', label: 'clicks', align: 'right', type: 'number' },
            { col: 'conversions', label: 'conversions', align: 'right', type: 'number' },
            { col: 'budgetPacing', label: 'budget', type: 'budget_completion', align: 'right' },
            { col: 'impressionPacing', label: 'pacing', type: 'impression_completion', align: 'right' },
            { col: 'costs', label: 'cost', type: 'money', align: 'right' },
            { col: 'profit', label: 'profit', type: 'money', align: 'right' },
            { col: 'startDate', label: 'start', align: 'right' },
            { col: 'endDate', label: 'end', align: 'right' }
          ];
        } else {
          return [
            { col: 'id', label: '#' },
            { col: 'displayName', label: 'name', type: 'campaigngroup', align: 'left' },
            { col: 'status', label: 'status', align: 'left' },
            { col: 'campaigns', label: 'campaigns', type: 'campaign_list', align: 'center' },
            { col: 'impressions', label: 'impressions', align: 'right', type: 'number' },
            { col: 'clicks', label: 'clicks', align: 'right', type: 'number' },
            { col: 'conversions', label: 'conversions', align: 'right', type: 'number' },
            { col: 'budgetPacing', label: 'budget', type: 'budget_completion', align: 'right' },
            { col: 'impressionPacing', label: 'pacing', type: 'impression_completion', align: 'right' },
            { col: 'costs', label: 'cost', type: 'money', align: 'right' },
            { col: 'startDate', label: 'start', align: 'right' },
            { col: 'endDate', label: 'end', align: 'right' }
          ];
        }
      }
    } else {
      return [
        { col: 'id', label: '#' },
        { col: 'displayName', label: 'name', type: 'campaigngroup', align: 'left' },
        { col: 'startDate', label: 'start', align: 'left' },
        { col: 'endDate', label: 'end', align: 'left' }
      ];
    }
  }

  recentEditClick = (editId: number) => {
    const editCampaignGroup = this.getCampaignGroup(editId, this.state.campaignGroups.recent);
    this.setState({ showEditModal: true, editCampaignGroup });
  }

  olderEditClick = (editId: number) => {
    const editCampaignGroup = this.getCampaignGroup(editId, this.state.campaignGroups.older);
    this.setState({ showEditModal: true, editCampaignGroup });
  }

  recentArchiveClick = (archiveId: number) => {
    const archiveCampaignGroup = this.getCampaignGroup(archiveId, this.state.campaignGroups.recent);
    this.setState({ showArchiveConfirm: true, archiveId, archiveCampaignGroup });
  }

  olderArchiveClick = (archiveId: number) => {
    const archiveCampaignGroup = this.getCampaignGroup(archiveId, this.state.campaignGroups.older);
    this.setState({ showArchiveConfirm: true, archiveId, archiveCampaignGroup });
  }

  restoreClick = (restoreId: number) => {
    const restoreCampaignGroup = this.getCampaignGroup(restoreId, this.state.campaignGroups.archived);
    this.setState({ showRestoreConfirm: true, restoreId, restoreCampaignGroup });
  }

  archiveCampaignGroups = async (date: string) => {
    try {
      const qs = { scope: this.props.options.scope, scopeId: this.props.options.scopeId, endDate: date };
      await Api.Delete({ path: "/api/campaigngroups", qs });
      this.setState({ showArchiveModal: false, showLoader: true }, async () => {
        const data: any = await Api.Get({ path: "/api/campaigngroups/statistics", qs: this.props.options });
        const campaignGroups = this.getCampaignGroups(data);
        this.setState({ campaignGroups, showLoader: false });
        this._notificationSystem.addNotification(NotificationOptions.success("Campaign groups archived.", false));
      });
    } catch (err) {
      this.setState({ showArchiveConfirm: false, showLoader: false });
      this._notificationSystem.addNotification(NotificationOptions.error("There was an error archiving the campaign groups. Try again!"));
    }
  }

  archiveCampaignGroup = async () => {
    try {
      await Api.Delete({ path: "/api/campaigngroups/" + this.state.archiveId });
      this.setState({ showArchiveConfirm: false, showLoader: true }, async () => {
        const data: any = await Api.Get({ path: "/api/campaigngroups/statistics", qs: this.props.options });
        const campaignGroups = this.getCampaignGroups(data);
        this.setState({ campaignGroups, showLoader: false });
        const archiveCampaignGroupName = _.get(this.state.archiveCampaignGroup, "name", "");
        this._notificationSystem.addNotification(NotificationOptions.success(<span>Campaign group <strong>{archiveCampaignGroupName}</strong> archived.</span>, false));
      });
    } catch (err) {
      this.setState({ showArchiveConfirm: false, showLoader: false });
      this._notificationSystem.addNotification(NotificationOptions.error("Error archiving campaign group."));
    }
  }

  restoreCampaignGroup = async () => {
    try {
      await Api.Put({ path: `/api/campaigngroups/${this.state.restoreId}/restore` });
      this.setState({ showRestoreConfirm: false, showLoader: true }, async () => {
        const data: any = await Api.Get({ path: "/api/campaigngroups/statistics", qs: this.props.options });
        const campaignGroups = this.getCampaignGroups(data);
        this.setState({ campaignGroups, showLoader: false });
        const restoreCampaignGroupName = _.get(this.state.restoreCampaignGroup, "name", "");
        this._notificationSystem.addNotification(NotificationOptions.success(<span>Campaign group <strong>{restoreCampaignGroupName}</strong> restored.</span>, false));
      });
    } catch (err) {
      this.setState({ showArchiveConfirm: false, showLoader: false });
      this._notificationSystem.addNotification(NotificationOptions.error("Error restoring campaign group."));
    }
  }

  getCampaignGroup(id: number, campaignGroups: any[]): CampaignGroupEntity {
    const campaignGroupRow = campaignGroups.find((o) => { return o.id === id });
    return _.get(campaignGroupRow, "campaignGroup");
  }

  handleReportRecentSubmit = (data: { daterange: DateRange, selectedMetrics: Metric[] }) => {
    this.setState({ downloadingRecent: true }, async () => {
      await this.downloadReport(data, "recent");
      this.setState({ downloadingRecent: false, showRecentReportModal: false });
    });
  }

  handleReportOlderSubmit = (data: { daterange: DateRange, selectedMetrics: Metric[] }) => {
    this.setState({ downloadingOlder: true }, async () => {
      await this.downloadReport(data, "older");
      this.setState({ downloadingOlder: false, showOlderReportModal: false });
    });
  }

  async downloadReport(data: { daterange: DateRange, selectedMetrics: Metric[] }, type: "recent" | "older" | "archived") {
    const startDate: string = data.daterange.startDate.format("YYYY-MM-DD");
    const endDate: string = data.daterange.endDate.format("YYYY-MM-DD");
    const options = _.assign(this.props.options, { startDate, endDate });
    const response: any = await Api.Get({ path: "/api/campaigngroups/statistics", qs: options });
    const campaignGroups = this.getCampaignGroups(response);

    const headerRow = data.selectedMetrics.map((metric) => { return ExcelHelper.getBoldCell(metric.label || metric.col) });
    const rows = [headerRow];

    campaignGroups[type].forEach((row) => {
      const rowData = [];
      data.selectedMetrics.forEach((metric) => {
        const format = ExcelHelper.format(metric);
        const value = ExcelHelper.cellFormatter(row, metric);
        const cell = ExcelHelper.getCell(value, null, format);
        rowData.push(cell);
      });
      rows.push(rowData);
    });
    ExcelHelper.save(rows, `${type}CampaignGroups`, `${type}CampaignGroups_${startDate}_${endDate}`);
  }

  render() {
    const metrics = this.getMetrics();
    if (!this.state.error) {
      const archiveCampaignGroupName = _.get(this.state.archiveCampaignGroup, "name", "");
      const restoreCampaignGroupName = _.get(this.state.restoreCampaignGroup, "name", "");
      return <Fragment>
        <div className="col-sm-12 pt-3">
          <div className="card mb-2">
            <h3 className="pull-left">Recent campaign groups</h3>
            <div className="table-btn-container">
              {this.props.rights.MANAGE_ADVERTISER &&
                <Button size="sm" variant="primary" className="mr-2" onClick={() => { this.setState({ showEditModal: true }) }}><FontIcon name="plus" /> ADD</Button>
              }
              {this.props.rights.VIEW_STATISTICS &&
                <Button size="sm" variant="primary" onClick={() => { this.setState({ showRecentReportModal: true }) }}><FontIcon name="download" /> REPORT</Button>
              }
            </div>
            <Loader visible={this.state.showLoader} />
            {!this.state.showLoader &&
              <CampaignGroupsTable
                type="recent"
                user={this.props.user}
                rights={this.props.rights}
                metrics={metrics}
                records={this.state.campaignGroups.recent}
                editClick={this.recentEditClick}
                archiveClick={this.recentArchiveClick}
              />}
          </div>
        </div>
        <div className="col-sm-12 pt-3">
          <div className="card mb-2">
            <h3 className="pull-left">Older campaign groups</h3>
            <div className="table-btn-container">
              {this.props.rights.MANAGE_ADVERTISER &&
                <Button size="sm" variant="danger" className="mr-2" onClick={() => { this.setState({ showArchiveModal: true }) }}><FontIcon name="archive" /> ARCHIVE CAMPAIGN GROUPS</Button>
              }
              {this.props.rights.VIEW_STATISTICS &&
                <Button size="sm" variant="primary" onClick={() => { this.setState({ showOlderReportModal: true }) }} ><FontIcon name="download" /> REPORT</Button>
              }
            </div>
            <Loader visible={this.state.showLoader} />
            {!this.state.showLoader &&
              <CampaignGroupsTable
                type="older"
                user={this.props.user}
                rights={this.props.rights}
                metrics={metrics}
                records={this.state.campaignGroups.older}
                editClick={this.olderEditClick}
                archiveClick={this.olderArchiveClick}
              />}
          </div>
        </div>
        <div className="col-sm-12 pt-3">
          <div className="card h-100 mb-2">
            <div>
              <a className="table-collapse-header" href="" onClick={this.handleArchivedHeaderClick}><FontIcon name={this.state.archivedOpen ? "chevron-up" : "chevron-down"} /> <h3>Archived campaign groups</h3></a>
              <Collapse in={this.state.archivedOpen}>
                <div>
                  <Loader visible={this.state.showLoader} />
                  {!this.state.showLoader &&
                    <CampaignGroupsTable type="archived"
                      user={this.props.user}
                      records={this.state.campaignGroups.archived}
                      metrics={metrics}
                      rights={this.props.rights}
                      restoreClick={this.restoreClick}
                    />}
                </div>
              </Collapse>
            </div>
          </div>
        </div>
        <CampaignGroupModal
          show={this.state.showEditModal}
          campaignGroup={this.state.editCampaignGroup}
          scope={this.props.options.scope}
          scopeId={this.props.options.scopeId}
          onClose={() => { this.setState({ showEditModal: false, editCampaignGroup: null }) }}
          onSubmit={this.handleSubmit}
        />
        <CampaignGroupsArchiveModal
          show={this.state.showArchiveModal}
          handleClose={() => { this.setState({ showArchiveModal: false }) }}
          handleSubmit={this.archiveCampaignGroups}
        />
        <ReportModal
          id="campaigngroups-recent-report"
          show={this.state.showRecentReportModal}
          downloading={this.state.downloadingRecent}
          metrics={metrics}
          onClose={() => { this.setState({ showRecentReportModal: false, downloadingRecent: false }) }}
          onSubmit={this.handleReportRecentSubmit}
        />
        <ReportModal
          id="campaigngroups-older-report"
          show={this.state.showOlderReportModal}
          downloading={this.state.downloadingOlder}
          metrics={metrics}
          onClose={() => { this.setState({ showOlderReportModal: false, downloadingOlder: false }) }}
          onSubmit={this.handleReportOlderSubmit}
        />
        <Confirm
          message={`Archive campaign group ${archiveCampaignGroupName}?`}
          show={this.state.showArchiveConfirm}
          onClose={() => this.setState({ showArchiveConfirm: false })}
          onConfirm={this.archiveCampaignGroup}
        />
        <Confirm
          message={`Restore campaign group ${restoreCampaignGroupName}?`}
          show={this.state.showRestoreConfirm}
          onClose={() => this.setState({ showRestoreConfirm: false })}
          onConfirm={this.restoreCampaignGroup}
        />
        <NotificationSystem ref={this.setNotificationSystemRef} />
      </Fragment>;
    } else {
      return <div className="col-sm-12 pt-3">
        <div className="card">
          <h3><ErrorContainer message={this.state.errorMessage} /></h3>
        </div>
      </div>;
    }
  }
}