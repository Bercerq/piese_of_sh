import React, { Component } from "react";
import { Button } from "react-bootstrap";
import NotificationSystem from "react-notification-system";
import * as NotificationOptions from "../../../../../client/NotificationOptions";
import * as _ from "lodash";
import * as Api from "../../../../../client/Api";
import * as ExcelHelper from "../../../../../client/ExcelHelper";
import Loader from "../../../../UI/Loader";
import ErrorContainer from "../../../../UI/ErrorContainer";
import Confirm from "../../../../UI/Confirm";
import FontIcon from "../../../../UI/FontIcon";
import AdvertisersTable from "./AdvertisersTable";
import AdvertiserAddModal from "./AdvertiserAddModal";
import AdvertiserEditModal from "./AdvertiserEditModal";
import { Rights, Options } from "../../../../../models/Common";
import { AppUser } from "../../../../../models/AppUser";
import { AdvertiserEntity } from "../../../../../models/data/Advertiser";
import ReportModal from "../../../shared/reports/ReportModal";
import { Metric, DateRange } from "../../../../../client/schemas";

interface AdvertisersTabProps {
  options: Options;
  user: AppUser;
  rights: Rights;
  agencyFee?: number;
  videoMode: boolean;
}

interface AdvertisersTabState {
  advertisers: any[];
  showLoader: boolean;
  showAddModal: boolean;
  showEditModal: boolean;
  showReportModal: boolean;
  showDeleteConfirm: boolean;
  downloading: boolean;
  editAdvertiser: AdvertiserEntity;
  writeAccess: boolean;
  deleteId: number;
  deleteAdvertiser: AdvertiserEntity;
  error: boolean;
  errorMessage: string;
}

export default class AdvertisersTab extends Component<AdvertisersTabProps, AdvertisersTabState> {
  private _notificationSystem: NotificationSystem.System;
  private setNotificationSystemRef: (any) => void;
  private controller = new AbortController();

  constructor(props, context) {
    super(props, context);
    this._notificationSystem = null;
    this.setNotificationSystemRef = el => { this._notificationSystem = el; };

    this.state = {
      advertisers: [],
      showLoader: true,
      showAddModal: false,
      showEditModal: false,
      showReportModal: false,
      showDeleteConfirm: false,
      downloading: false,
      editAdvertiser: null,
      writeAccess: false,
      deleteId: -1,
      deleteAdvertiser: null,
      error: false,
      errorMessage: ""
    };
  }

  async componentDidMount(): Promise<void> {
    try {
      const advertisers: any[] = await Api.Get({ path: "/api/advertisers/statistics", qs: this.props.options, signal: this.controller.signal });
      this.setState({ advertisers, showLoader: false });
    } catch (err) {
      if (err.name === "AbortError") {
        this.setState({ showLoader: true, error: false, errorMessage: "" });
      } else {
        this.setState({ error: true, errorMessage: "Error loading advertisers.", showLoader: false });
      }
    }
  }

  componentWillReceiveProps(nextProps) {
    if (!_.isEqual(nextProps.options, this.props.options)) {
      this.setState({ showLoader: true, error: false, errorMessage: "" }, async () => {
        try {
          this.controller.abort();
          this.controller = new AbortController();
          const advertisers: any[] = await Api.Get({ path: "/api/advertisers/statistics", qs: nextProps.options, signal: this.controller.signal });
          this.setState({ advertisers, showLoader: false });
        } catch (err) {
          if (err.name === "AbortError") {
            this.setState({ showLoader: true, error: false, errorMessage: "" });
          } else {
            this.setState({ error: true, errorMessage: "Error loading advertisers.", showLoader: false });
          }
        }
      });
    }
  }

  componentWillUnmount(){
    this.controller.abort();
  }

  getMetrics(): Metric[] {
    if (this.props.rights.VIEW_STATISTICS) {
      if (this.props.videoMode) {
        if (this.props.rights.VIEW_FINANCIALS) {
          return [
            { col: 'displayName', label: 'name', type: 'advertiser', align: 'left' },
            { col: 'impressions', label: 'impressions', align: 'right', type: 'number' },
            { col: 'completions', label: 'completions', align: 'right', type: 'number' },
            { col: 'clicks', label: 'clicks', align: 'right', type: 'number' },
            { col: 'conversions', label: 'conversions', align: 'right', type: 'number' },
            { col: 'revenue', label: 'revenue', type: 'money', align: 'right' },
            { col: 'costs', label: 'costs', type: 'money', align: 'right' },
            { col: 'profit', label: 'profit', type: 'money', align: 'right' }
          ];
        } else {
          return [
            { col: 'displayName', label: 'name', type: 'advertiser', align: 'left' },
            { col: 'impressions', label: 'impressions', align: 'right', type: 'number' },
            { col: 'completions', label: 'completions', align: 'right', type: 'number' },
            { col: 'clicks', label: 'clicks', align: 'right', type: 'number' },
            { col: 'conversions', label: 'conversions', align: 'right', type: 'number' },
            { col: 'costs', label: 'costs', type: 'money', align: 'right' }
          ];
        }

      } else {
        if (this.props.rights.VIEW_FINANCIALS) {
          return [
            { col: 'displayName', label: 'name', type: 'advertiser', align: 'left' },
            { col: 'impressions', label: 'impressions', align: 'right', type: 'number' },
            { col: 'clicks', label: 'clicks', align: 'right', type: 'number' },
            { col: 'conversions', label: 'conversions', align: 'right', type: 'number' },
            { col: 'revenue', label: 'revenue', type: 'money', align: 'right' },
            { col: 'costs', label: 'costs', type: 'money', align: 'right' },
            { col: 'profit', label: 'profit', type: 'money', align: 'right' }
          ];
        } else {
          return [
            { col: 'displayName', label: 'name', type: 'advertiser', align: 'left' },
            { col: 'impressions', label: 'impressions', align: 'right', type: 'number' },
            { col: 'clicks', label: 'clicks', align: 'right', type: 'number' },
            { col: 'conversions', label: 'conversions', align: 'right', type: 'number' },
            { col: 'costs', label: 'costs', type: 'money', align: 'right' }
          ];
        }
      }
    } else {
      return [
        { col: 'displayName', label: 'name', type: 'advertiser', align: 'left' }
      ];
    }
  }

  editClick = (id, writeAccess) => {
    const advertiserRow = this.state.advertisers.find((o) => { return o.advertiser.id === id });
    const editAdvertiser = _.get(advertiserRow, "advertiser");
    this.setState({ editAdvertiser, showEditModal: true, writeAccess });
  }

  deleteClick = (deleteId) => {
    const advertiserRow = this.state.advertisers.find((o) => { return o.advertiser.id === deleteId });
    const deleteAdvertiser = _.get(advertiserRow, "advertiser");
    this.setState({ showDeleteConfirm: true, deleteId, deleteAdvertiser });
  }

  deleteAdvertiser = async () => {
    try {
      await Api.Delete({ path: "/api/advertisers/" + this.state.deleteId });
      this.setState({ showDeleteConfirm: false, showLoader: true }, async () => {
        const advertisers: any[] = await Api.Get({ path: "/api/advertisers/statistics", qs: this.props.options, signal: this.controller.signal });
        this.setState({ advertisers, showLoader: false });
        const deleteAdvertiserName = _.get(this.state.deleteAdvertiser, "name", "");
        this._notificationSystem.addNotification(NotificationOptions.success(<span>Advertiser <strong>{deleteAdvertiserName}</strong> deleted.</span>, false));
      });
    } catch (err) {
      this.setState({ showDeleteConfirm: false, showLoader: false });
      this._notificationSystem.addNotification(NotificationOptions.error("Error deleting advertiser."));
    }
  }

  handleSubmit = async (id: number, advertiser: AdvertiserEntity) => {
    if (id > 0) {
      await this.updateAdvertiser(id, advertiser);
    } else {
      await this.addAdvertiser(advertiser);
    }
  }

  handleReportSubmit = (data: { daterange: DateRange, selectedMetrics: Metric[] }) => {
    this.setState({ downloading: true }, async () => {
      const startDate: string = data.daterange.startDate.format("YYYY-MM-DD");
      const endDate: string = data.daterange.endDate.format("YYYY-MM-DD");
      const options = _.assign({}, this.props.options, { startDate, endDate });
      const advertisers: any[] = await Api.Get({ path: "/api/advertisers/statistics", qs: options });

      const headerRow = data.selectedMetrics.map((metric) => { return ExcelHelper.getBoldCell(metric.label || metric.col) });
      const rows = [headerRow];

      advertisers.forEach((row) => {
        const rowData = [];
        data.selectedMetrics.forEach((metric) => {
          const format = ExcelHelper.format(metric);
          const value = ExcelHelper.cellFormatter(row, metric);
          const cell = ExcelHelper.getCell(value, null, format);
          rowData.push(cell);
        });
        rows.push(rowData);
      });
      ExcelHelper.save(rows, "Advertisers", "Advertisers_" + options.startDate + "_" + options.endDate);
      this.setState({ downloading: false, showReportModal: false });
    });
  }

  async addAdvertiser(advertiser: AdvertiserEntity) {
    try {
      await Api.Post({ path: "/api/advertisers", body: advertiser });
      this.setState({ showAddModal: false, showLoader: true }, async () => {
        const advertisers: any[] = await Api.Get({ path: "/api/advertisers/statistics", qs: this.props.options, signal: this.controller.signal });
        this.setState({ advertisers, showLoader: false, editAdvertiser: null });
        this._notificationSystem.addNotification(NotificationOptions.success(<span>Advertiser <strong>{advertiser.name}</strong> created.</span>, false));
      });
    } catch (err) {
      this.setState({ showAddModal: false, editAdvertiser: null });
      this._notificationSystem.addNotification(NotificationOptions.error("Error creating advertiser."));
    }
  }

  async updateAdvertiser(id: number, advertiser: AdvertiserEntity) {
    try {
      await Api.Put({ path: "/api/advertisers/" + id, body: advertiser });
      this.setState({ showEditModal: false, editAdvertiser: null, showLoader: true }, async () => {
        const advertisers: any[] = await Api.Get({ path: "/api/advertisers/statistics", qs: this.props.options, signal: this.controller.signal });
        this.setState({ advertisers, showLoader: false });
        this._notificationSystem.addNotification(NotificationOptions.success(<span>Advertiser <strong>{advertiser.name}</strong> saved.</span>, false));
      });
    } catch (err) {
      this.setState({ showEditModal: false, editAdvertiser: null });
      this._notificationSystem.addNotification(NotificationOptions.error("Error updating advertiser."));
    }
  }

  render() {
    const metrics = this.getMetrics();
    if (!this.state.error) {
      const deleteAdvertiserName = _.get(this.state.deleteAdvertiser, "name", "");
      return <div className="col-sm-12 pt-3">
        <div className="card mb-2">
          <h3 className="pull-left">Advertisers</h3>
          <div className="table-btn-container">
            {this.props.rights.CREATE_ADVERTISER &&
              <Button size="sm" variant="primary" className="mr-2" onClick={() => { this.setState({ showAddModal: true }) }}><FontIcon name="plus" /> ADD</Button>
            }
            {this.props.rights.VIEW_STATISTICS &&
              <Button size="sm" variant="primary" onClick={() => { this.setState({ showReportModal: true }) }}><FontIcon name="download" /> REPORT</Button>
            }
          </div>
          <Loader visible={this.state.showLoader} />
          {!this.state.showLoader &&
            <AdvertisersTable
              advertisers={this.state.advertisers}
              user={this.props.user}
              rights={this.props.rights}
              metrics={metrics}
              editClick={this.editClick}
              deleteClick={this.deleteClick}
            />
          }
        </div>
        <AdvertiserAddModal
          show={this.state.showAddModal}
          scope={this.props.options.scope}
          scopeId={this.props.options.scopeId}
          rights={this.props.rights}
          agencyFee={this.props.agencyFee}
          onClose={() => { this.setState({ showAddModal: false }) }}
          onSubmit={this.handleSubmit}
        />
        <AdvertiserEditModal
          show={this.state.showEditModal}
          writeAccess={this.state.writeAccess}
          advertiser={this.state.editAdvertiser}
          onClose={() => { this.setState({ showEditModal: false, editAdvertiser: null }) }}
          onSubmit={this.handleSubmit}
        />
        <ReportModal
          id="advertisers-report"
          show={this.state.showReportModal}
          downloading={this.state.downloading}
          metrics={metrics}
          onClose={() => { this.setState({ showReportModal: false, downloading: false }) }}
          onSubmit={this.handleReportSubmit}
        />
        <Confirm
          message={`Delete advertiser ${deleteAdvertiserName}?`}
          show={this.state.showDeleteConfirm}
          onClose={() => this.setState({ showDeleteConfirm: false })}
          onConfirm={this.deleteAdvertiser}
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