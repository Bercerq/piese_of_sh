import React, { useState, useContext, useRef, useEffect, Fragment } from "react";
import { Button, Collapse, DropdownButton, Alert } from "react-bootstrap";
import * as _ from "lodash";
import NotificationSystem from "react-notification-system";
import * as NotificationOptions from "../../../../../client/NotificationOptions";
import * as Api from "../../../../../client/Api";
import * as ExcelHelper from "../../../../../client/ExcelHelper";
import * as Helper from "../../../../../client/Helper";
import * as CampaignHelper from "../../../../../client/CampaignHelper";
import { TabProps } from "../../../../../models/Common";
import ErrorContainer from "../../../../UI/ErrorContainer";
import FontIcon from "../../../../UI/FontIcon";
import Loader from "../../../../UI/Loader";
import { CampaignClone, CampaignEntity } from "../../../../../models/data/Campaign";
import CampaignsTable from "./CampaignsTable";
import { Metric, MetricType, AlignType, DateRange, SelectOption } from "../../../../../client/schemas";
import { Preset, PresetMetric } from "../../../../../models/data/Preset";
import PresetsContext from "../../../context/PresetsContext";
import CampaignsArchiveModal from "./CampaignsArchiveModal";
import Confirm from "../../../../UI/Confirm";
import ReportModal from "../../../shared/reports/ReportModal";
import CheckboxList from "../../../../UI/CheckboxList";
import CampaignsPacingModal from "./CampaignsPacingModal";
import CampaignAddModal from "./CampaignAddModal";
import { ExistingCampaign, NewCampaign } from "../../../../../client/campaignSchemas";

const CampaignsTab = (props: TabProps) => {
  let presets = useContext<Preset[]>(PresetsContext);
  const preset = getPreset();
  const presetId = _.get(preset, "id", -1);
  const defaultMetrics = getMetrics();
  const selectedMetrics = defaultMetrics.map((o) => { return o.col });
  const initialChecked = Helper.getSelectedMetrics(props.user.email, selectedMetrics, presetId);

  const [recentCampaigns, setRecentCampaigns] = useState<any[]>([]);
  const [olderCampaigns, setOlderCampaigns] = useState<any[]>(null);
  const [archivedCampaigns, setArchivedCampaigns] = useState<any[]>(null);
  const [showRecentLoader, setShowRecentLoader] = useState<boolean>(true);
  const [showOlderLoader, setShowOlderLoader] = useState<boolean>(true);
  const [showArchivedLoader, setShowArchivedLoader] = useState<boolean>(true);
  const [showRecentReportModal, setShowRecentReportModal] = useState<boolean>(false);
  const [showOlderReportModal, setShowOlderReportModal] = useState<boolean>(false);
  const [downloadingRecent, setDownloadingRecent] = useState<boolean>(false);
  const [downloadingOlder, setDownloadingOlder] = useState<boolean>(false);
  const [showArchiveModal, setShowArchiveModal] = useState<boolean>(false);
  const [showArchiveConfirm, setShowArchiveConfirm] = useState<boolean>(false);
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [archivedOpen, setArchivedOpen] = useState<boolean>(false);
  const [olderOpen, setOlderOpen] = useState<boolean>(false);
  const [archiveId, setArchiveId] = useState<number>(-1);
  const [archiveCampaignName, setArchiveCampaignName] = useState<string>("");
  const [showRestoreConfirm, setShowRestoreConfirm] = useState<boolean>(false);
  const [restoreCampaignName, setRestoreCampaignName] = useState<string>("");
  const [restoreId, setRestoreId] = useState<number>(-1);
  const [metrics, setMetrics] = useState<Metric[]>(defaultMetrics);
  const [checked, setChecked] = useState<string[]>(initialChecked);
  const [showPacingModal, setShowPacingModal] = useState<boolean>(false);
  const [pacingId, setPacingId] = useState<number>(-1);
  const [pacingType, setPacingType] = useState<"budget_completion" | "impression_completion">("budget_completion");
  const [warning, setWarning] = useState<boolean>(false);
  const [recentError, setRecentError] = useState<boolean>(false);
  const [olderError, setOlderError] = useState<boolean>(false);
  const [archivedError, setArchivedError] = useState<boolean>(false);
  const [recentErrorMessage, setRecentErrorMessage] = useState<string>("");
  const [olderErrorMessage, setOlderErrorMessage] = useState<string>("");
  const [archivedErrorMessage, setArchivedErrorMessage] = useState<string>("");

  const notificationSystem = useRef<NotificationSystem.System>(null);
  const recentController = useRef<AbortController>(null);
  const olderController = useRef<AbortController>(null);
  const archivedController = useRef<AbortController>(null);

  useEffect(() => {
    return () => {
      unload(recentController.current);
      unload(olderController.current);
      unload(archivedController.current);
    }
  }, []);
  useEffect(() => { loadData(); }, [JSON.stringify(props.options)]);
  useEffect(loadMetrics, [props.videoMode, presets]);

  function loadData() {
    loadRecentData();
    if (olderOpen) {
      loadOlderData();
    }
    if (archivedOpen) {
      loadArchivedData();
    }
  }

  async function loadRecentData() {
    setShowRecentLoader(true);
    setWarning(false);
    try {
      recentController.current = new AbortController();
      const qs = _.assign({}, props.options, { type: "recent" });
      const data: { warning: string; statistics: any[] } = await Api.Get({ path: "/api/campaigns/statistics", qs, signal: recentController.current.signal });
      if (data.warning) {
        setWarning(true);
      }
      const campaigns = getCampaigns(data.statistics);
      setRecentCampaigns(campaigns);
      setShowRecentLoader(false);
      setRecentError(false);
      setRecentErrorMessage("");
    } catch (err) {
      console.log(err);
      if (err.name === "AbortError") {
        setRecentError(false);
        setRecentErrorMessage("");
      } else {
        setRecentError(true);
        setRecentErrorMessage("Error loading recent campaigns.");
        setShowRecentLoader(false);
      }
    }
  }

  async function loadOlderData() {
    setShowOlderLoader(true);
    try {
      olderController.current = new AbortController();
      const qs = _.assign({}, props.options, { type: "older" });
      const data: { warning: string; statistics: any[] } = await Api.Get({ path: "/api/campaigns/statistics", qs, signal: olderController.current.signal });
      if (data.warning) {
        setWarning(true);
      }
      const campaigns = getCampaigns(data.statistics);
      setOlderCampaigns(campaigns);
      setShowOlderLoader(false);
      setOlderError(false);
      setOlderErrorMessage("");
    } catch (err) {
      console.log(err);
      if (err.name === "AbortError") {
        setOlderError(false);
        setOlderErrorMessage("");
      } else {
        setOlderError(true);
        setOlderErrorMessage("Error loading older campaigns.");
        setShowOlderLoader(false);
      }
    }
  }

  async function loadArchivedData() {
    setShowArchivedLoader(true);
    try {
      archivedController.current = new AbortController();
      const qs = _.assign({}, props.options, { type: "archived" });
      const data: { warning: string; statistics: any[] } = await Api.Get({ path: "/api/campaigns/statistics", qs, signal: archivedController.current.signal });
      if (data.warning) {
        setWarning(true);
      }
      const campaigns = getCampaigns(data.statistics);
      setArchivedCampaigns(campaigns);
      setShowArchivedLoader(false);
      setArchivedError(false);
      setArchivedErrorMessage("");
    } catch (err) {
      console.log(err);
      if (err.name === "AbortError") {
        setArchivedError(false);
        setArchivedErrorMessage("");
      } else {
        setArchivedError(true);
        setArchivedErrorMessage("Error loading archived campaigns.");
        setShowArchivedLoader(false);
      }
    }
  }

  function unload(controller: AbortController) {
    if (controller) {
      controller.abort();
    }
  }

  function loadMetrics() {
    const defaultMetrics = getMetrics();
    setMetrics(defaultMetrics);
    const selectedMetrics = defaultMetrics.map((o) => { return o.col });
    const initialChecked = Helper.getSelectedMetrics(props.user.email, selectedMetrics, presetId);
    setChecked(initialChecked);
  }

  function getCampaigns(data: any[]): any[] {
    return data.map((o, i) => {
      let constraints: any = {};
      if (o.campaign.constraints) {
        delete o.campaign.constraints.name;
        constraints = o.campaign.constraints;
      }
      const row = _.assign({}, o, constraints, {
        id: o.campaign.id,
        status: o.campaign.status.toLowerCase(),
        adType: getAdType(o.campaign),
        advertiser: o.campaign.advertiser,
        advertiserId: o.campaign.advertiserId,
        isRecent: o.campaign.isRecent,
        budgetPacing: o.campaign.budgetPacing ? _.assign({}, o.campaign.budgetPacing, { percentageDone: o.campaign.percentageDone }) : o.campaign.budgetPacing,
        impressionPacing: o.campaign.impressionPacing ? _.assign({}, o.campaign.impressionPacing, { percentageDone: o.campaign.percentageDone }) : o.campaign.impressionPacing,
        ads: o.campaign.ads || [],
        remarks: o.campaign.remarks,
        startDate: o.campaign.startTime,
        endDate: o.campaign.endTime
      });
      return row;
    });
  }

  function getCampaign(id: number, campaigns: any[]): CampaignEntity {
    const campaignRow = campaigns.find((o) => { return o.id === id });
    return _.get(campaignRow, "campaign");
  }

  function getAdType(campaign: CampaignEntity) {
    let adType = campaign.videoCampaign ? "video" : "banners";
    if (campaign.biddingType === "Adserving") adType += " - ad serving";
    if (CampaignHelper.isRetail(campaign.structure)) adType += " - retail";
    return adType;
  }

  function getMetrics(): Metric[] {
    return _.get(preset, "metrics", []).map(getMetric);
  }

  function getPreset() {
    const groupName = props.videoMode ? "VideoCampaign" : "DisplayCampaign";
    const preset = presets.find((p) => {
      return p.presetName === "Default" && p.groupName === groupName;
    });
    return preset;
  }

  function getMetric(pm: PresetMetric): Metric {
    const col = pm.fieldName;
    const label = pm.displayName;
    let align = ["number", "euro"].indexOf(pm.format) > -1 ? "right" : "left";
    let type: string = pm.format;
    if (type === "euro") type = "money";
    if (type === "percentage") type = "perc";
    if (type === "custom") {
      switch (pm.fieldName) {
        case "displayName":
          type = "campaign";
          break;
        case "advertiser":
          type = "advertiser_link";
          break;
        case "ads":
          type = "ad_list";
          break;
        case "budgetPacing":
          type = "budget_completion";
          align = "right";
          break;
        case "impressionPacing":
          type = "impression_completion";
          align = "right";
          break;
        case "startDate":
          type = "start";
          break;
        case "endDate":
          type = "end";
          break;
      }
    }
    return { col, label, align: align as AlignType, type: type as MetricType };
  }

  const recentArchiveClick = (archiveId: number) => {
    const campaign = getCampaign(archiveId, recentCampaigns);
    const archiveCampaignName = _.get(campaign, "name", "");
    setShowArchiveConfirm(true);
    setArchiveId(archiveId);
    setArchiveCampaignName(archiveCampaignName);
  }

  const olderArchiveClick = (archiveId: number) => {
    const campaign = getCampaign(archiveId, olderCampaigns);
    const archiveCampaignName = _.get(campaign, "name", "");
    setShowArchiveConfirm(true);
    setArchiveId(archiveId);
    setArchiveCampaignName(archiveCampaignName);
  }

  const restoreClick = (restoreId: number) => {
    const campaign = getCampaign(restoreId, archivedCampaigns);
    const restoreCampaignName = _.get(campaign, "name", "");
    setShowRestoreConfirm(true);
    setRestoreId(restoreId);
    setRestoreCampaignName(restoreCampaignName);
  }

  const handleArchivedHeaderClick = async (e) => {
    e.preventDefault();
    setArchivedOpen(!archivedOpen);
    if (!archivedCampaigns) {
      await loadArchivedData();
    }
  }

  const handleOlderHeaderClick = async (e) => {
    e.preventDefault();
    setOlderOpen(!olderOpen);
    if (!olderCampaigns) {
      await loadOlderData();
    }
  }

  const chartClick = (id: number, type: "budget_completion" | "impression_completion") => {
    setShowPacingModal(true);
    setPacingId(id);
    setPacingType(type);
  }

  const archiveCampaign = async () => {
    try {
      await Api.Delete({ path: `/api/campaigns/${archiveId}` });
      setShowArchiveConfirm(false);
      loadData();
      notificationSystem.current.addNotification(NotificationOptions.success(<span>Campaign <strong>{archiveCampaignName}</strong> archived.</span>, false));
    } catch (err) {
      setShowArchiveConfirm(false);
      setShowRecentLoader(false);
      notificationSystem.current.addNotification(NotificationOptions.error("Error archiving campaign."));
    }
  }

  const archiveCampaigns = async (date: string) => {
    try {
      const qs = { scope: props.options.scope, scopeId: props.options.scopeId, endDate: date };
      await Api.Delete({ path: "/api/campaigns", qs });
      loadData();
      setShowArchiveModal(false);
      notificationSystem.current.addNotification(NotificationOptions.success("Campaigns archived.", false));
    } catch (err) {
      setShowRecentLoader(false);
      setShowArchiveModal(false);
      notificationSystem.current.addNotification(NotificationOptions.error("There was an error archiving the campaigns. Try again!"));
    }
  }

  const restoreCampaign = async () => {
    try {
      await Api.Put({ path: `/api/campaigns/${restoreId}/restore` });
      setShowRestoreConfirm(false);
      loadData();
      notificationSystem.current.addNotification(NotificationOptions.success(<span>Campaign <strong>{restoreCampaignName}</strong> restored.</span>, false));
    } catch (err) {
      setShowRestoreConfirm(false);
      setShowRecentLoader(false);
      notificationSystem.current.addNotification(NotificationOptions.error("Error restoring campaign."));
    }
  }

  const handleReportRecentSubmit = async (data: { daterange: DateRange, selectedMetrics: Metric[] }) => {
    setDownloadingRecent(true);
    await downloadReport(data, "recent");
    setDownloadingRecent(false);
    setShowRecentReportModal(false);
  }

  const handleReportOlderSubmit = async (data: { daterange: DateRange, selectedMetrics: Metric[] }) => {
    setDownloadingOlder(true);
    await downloadReport(data, "older");
    setDownloadingOlder(false);
    setShowOlderReportModal(false);
  }

  const onMetricsChange = (checked: string[]) => {
    Helper.storeSelectedMetrics(props.user.email, checked, preset.id);
    setChecked(checked);
  }

  const handleNewSubmit = async (data: NewCampaign) => {
    try {
      const campaign = CampaignHelper.getNewCampaignData(data);
      await Api.Post({ path: "/api/campaigns", body: campaign });
      notificationSystem.current.addNotification(NotificationOptions.success(<span>Campaign <strong>{campaign.name}</strong> created.</span>, false));
    } catch (err) {
      notificationSystem.current.addNotification(NotificationOptions.error("Error creating campaign."));
    }
    setShowAddModal(false);
    loadData();
  }

  const handleExistingSubmit = async (data: ExistingCampaign) => {
    try {
      const existingData = CampaignHelper.getExistingCampaignData(data);
      await Api.Post({ path: `/api/campaigns/${existingData.id}/clone`, body: existingData.campaign });
      notificationSystem.current.addNotification(NotificationOptions.success(<span>Campaign <strong>{existingData.campaign.name}</strong> created.</span>, false));
    } catch (err) {
      notificationSystem.current.addNotification(NotificationOptions.error("Error creating campaign."));
    }
    setShowAddModal(false);
    loadData();
  }

  async function downloadReport(data: { daterange: DateRange, selectedMetrics: Metric[] }, type: "recent" | "older" | "archived") {
    const startDate: string = data.daterange.startDate.format("YYYY-MM-DD");
    const endDate: string = data.daterange.endDate.format("YYYY-MM-DD");
    const options = _.assign({}, props.options, { startDate, endDate });
    const response: any = await Api.Get({ path: "/api/campaigns/statistics", qs: options });
    const campaigns = getCampaigns(response);

    const headerRow = data.selectedMetrics.map((metric) => { return ExcelHelper.getBoldCell(metric.label || metric.col) });
    const rows = [headerRow];

    campaigns[type].forEach((row) => {
      const rowData = [];
      data.selectedMetrics.forEach((metric) => {
        const format = ExcelHelper.format(metric);
        const value = ExcelHelper.cellFormatter(row, metric);
        const cell = ExcelHelper.getCell(value, null, format);
        rowData.push(cell);
      });
      rows.push(rowData);
    });
    ExcelHelper.save(rows, `${type}Campaigns`, `${type}Campaigns_${startDate}_${endDate}`);
  }

  const metricsOptions: SelectOption[] = metrics.map((o) => { return { value: o.col, label: o.label || o.col } });
  const tableMetrics = metrics.filter((o) => { return checked.indexOf(o.col) > -1 });
  return <Fragment>
    <div className="col-sm-12 pt-3">
      {warning &&
        <Alert variant="warning">
          <FontIcon name="warning" /> Retrieving campaign statistics unsuccessful, please try again later.
          </Alert>
      }
      {!recentError &&
        <div className="card mb-2">
          <h3 className="pull-left">Recent campaigns</h3>
          <div className="table-btn-container">
            {props.rights.MANAGE_ADVERTISER &&
              <Button size="sm" variant="primary" className="mr-2" onClick={() => { setShowAddModal(true) }}><FontIcon name="plus" /> ADD</Button>
            }
            {!showRecentLoader &&
              <DropdownButton
                alignRight
                size="sm"
                className="mr-2"
                title={<Fragment><FontIcon name="filter" /> METRICS ({checked.length}/{metrics.length})</Fragment>}
                id="campaign-metrics-dropdown-menu"
              >
                <CheckboxList
                  id={`campaign-metrics-cb-list`}
                  listClassNames="metrics-list"
                  options={metricsOptions}
                  selectAll={true}
                  checked={checked}
                  onChange={onMetricsChange}
                />
              </DropdownButton>
            }
            {props.rights.VIEW_STATISTICS &&
              <Button size="sm" variant="primary" onClick={() => { setShowRecentReportModal(true) }}><FontIcon name="download" /> REPORT</Button>
            }
          </div>
          <Loader visible={showRecentLoader} />
          {!showRecentLoader &&
            <CampaignsTable
              type="recent"
              user={props.user}
              rights={props.rights}
              metrics={tableMetrics}
              records={recentCampaigns}
              archiveClick={recentArchiveClick}
              chartClick={chartClick}
            />}
        </div>
      }
      {recentError && <div className="card">
        <h3><ErrorContainer message={recentErrorMessage} /></h3>
      </div>}
    </div>
    <div className="col-sm-12 pt-3">
      {!olderError &&
        <div className="card h-100 mb-2">
          <div>
            <a className="table-collapse-header" href="" onClick={handleOlderHeaderClick}><FontIcon name={olderOpen ? "chevron-up" : "chevron-down"} />
              <h3>Older campaigns</h3>
            </a>
            <Collapse in={olderOpen}>
              <div>
                <Loader visible={showOlderLoader} />
                {!showOlderLoader && <Fragment>
                  <div className="table-btn-container">
                    {props.rights.MANAGE_ADVERTISER &&
                      <Button size="sm" variant="danger" className="mr-2" onClick={() => { setShowArchiveModal(true) }}><FontIcon name="archive" /> ARCHIVE CAMPAIGNS</Button>
                    }
                    {props.rights.VIEW_STATISTICS &&
                      <Button size="sm" variant="primary" onClick={() => { setShowOlderReportModal(true) }}><FontIcon name="download" /> REPORT</Button>
                    }
                  </div>
                  <CampaignsTable
                    type="older"
                    user={props.user}
                    rights={props.rights}
                    metrics={tableMetrics}
                    records={olderCampaigns}
                    archiveClick={olderArchiveClick}
                    chartClick={chartClick}
                  />
                </Fragment>
                }
              </div>
            </Collapse>
          </div>
        </div>
      }
      {olderError && <div className="card">
        <h3><ErrorContainer message={olderErrorMessage} /></h3>
      </div>}
    </div>
    <div className="col-sm-12 pt-3">
      {!archivedError &&
        <div className="card h-100 mb-2">
          <div>
            <a className="table-collapse-header" href="" onClick={handleArchivedHeaderClick}><FontIcon name={archivedOpen ? "chevron-up" : "chevron-down"} /> <h3>Archived campaigns</h3></a>
            <Collapse in={archivedOpen}>
              <div>
                <Loader visible={showArchivedLoader} />
                {!showArchivedLoader &&
                  <CampaignsTable
                    type="archived"
                    user={props.user}
                    records={archivedCampaigns}
                    metrics={tableMetrics}
                    rights={props.rights}
                    restoreClick={restoreClick}
                    chartClick={chartClick}
                  />}
              </div>
            </Collapse>
          </div>
        </div>
      }
      {archivedError && <div className="card">
        <h3><ErrorContainer message={archivedErrorMessage} /></h3>
      </div>}
    </div>
    <CampaignsArchiveModal
      show={showArchiveModal}
      onClose={() => { setShowArchiveModal(false) }}
      onSubmit={archiveCampaigns}
    />
    <CampaignAddModal
      scope={props.scope}
      scopeId={props.scopeId}
      videoMode={props.videoMode}
      show={showAddModal}
      onClose={() => { setShowAddModal(false) }}
      onNewSubmit={handleNewSubmit}
      onExistingSubmit={handleExistingSubmit}
    />
    <ReportModal
      id="campaigns-recent-report"
      show={showRecentReportModal}
      downloading={downloadingRecent}
      metrics={metrics}
      selectedMetrics={checked}
      onClose={() => { setShowRecentReportModal(false); setDownloadingRecent(false); }}
      onSubmit={handleReportRecentSubmit}
    />
    <ReportModal
      id="campaigns-older-report"
      show={showOlderReportModal}
      downloading={downloadingOlder}
      metrics={metrics}
      selectedMetrics={checked}
      onClose={() => { setShowOlderReportModal(false); setDownloadingOlder(false); }}
      onSubmit={handleReportOlderSubmit}
    />
    <CampaignsPacingModal
      id={pacingId}
      type={pacingType}
      show={showPacingModal}
      onClose={() => { setShowPacingModal(false) }}
    />
    <Confirm
      message={`Archive campaign ${archiveCampaignName}?`}
      show={showArchiveConfirm}
      onClose={() => setShowArchiveConfirm(false)}
      onConfirm={archiveCampaign}
    />
    <Confirm
      message={`Restore campaign ${restoreCampaignName}?`}
      show={showRestoreConfirm}
      onClose={() => setShowRestoreConfirm(false)}
      onConfirm={restoreCampaign}
    />
    <NotificationSystem ref={notificationSystem} />
  </Fragment>;
}
export default CampaignsTab;