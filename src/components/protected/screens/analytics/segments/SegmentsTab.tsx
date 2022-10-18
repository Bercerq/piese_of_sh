import React, { useState, useEffect, useRef, useContext } from "react";
import { useHistory } from "react-router-dom";
import { Button } from "react-bootstrap";
import * as _ from "lodash";
import * as Api from "../../../../../client/Api";
import * as ExcelHelper from "../../../../../client/ExcelHelper";
import ErrorContainer from "../../../../UI/ErrorContainer";
import Loader from "../../../../UI/Loader";
import { ScopeDataContextType, TabProps } from "../../../../../models/Common";
import SegmentInsightsTable from "./SegmentInsightsTable";
import { Segment } from "../../../../../models/data/Segment";
import FontIcon from "../../../../UI/FontIcon";
import { Campaign, CampaignEntity } from "../../../../../models/data/Campaign";
import ScopeDataContext from "../../../context/ScopeDataContext";
import ReportModal from "../../../shared/reports/ReportModal";
import { DateRange, Metric } from "../../../../../client/schemas";

const SegmentsTab = (props: TabProps) => {
  let history = useHistory();
  let { data } = useContext<ScopeDataContextType>(ScopeDataContext);
  const campaign: CampaignEntity = _.get(data as Campaign, "campaign");
  const metrics = getMetrics();

  const [showLoader, setShowLoader] = useState<boolean>(true);
  const [records, setRecords] = useState<Segment[]>([]);
  const [showReportModal, setShowReportModal] = useState<boolean>(false);
  const [downloading, setDownloading] = useState<boolean>(false);
  const [error, setError] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>("");

  const controller = useRef<AbortController>(null);

  useEffect(() => { return unload; }, []);
  useEffect(() => { loadData(); }, [JSON.stringify(props.options)]);

  async function loadData() {
    setShowLoader(true);
    try {
      unload();
      controller.current = new AbortController();
      const records: Segment[] = await Api.Get({ path: `/api/campaigns/${props.options.scopeId}/segmentstats`, qs: { startDate: props.options.startDate, endDate: props.options.endDate }, signal: controller.current.signal });
      setRecords(records);
      setShowLoader(false);
    } catch (err) {
      console.log(err);
      if (err.name === "AbortError") {
        setError(false);
        setErrorMessage("");
      } else {
        setError(true);
        setErrorMessage("Error loading segment insights.");
        setShowLoader(false);
      }
    }
  }

  function unload() {
    if (controller.current) {
      controller.current.abort();
    }
  }

  async function downloadReport(data: { daterange: DateRange, selectedMetrics: Metric[] }) {
    const startDate: string = data.daterange.startDate.format("YYYY-MM-DD");
    const endDate: string = data.daterange.endDate.format("YYYY-MM-DD");
    const options = { startDate, endDate };
    const records: Segment[] = await Api.Get({ path: `/api/campaigns/${props.options.scopeId}/segmentstats`, qs: options });
    const headerRow = data.selectedMetrics.map((metric) => { return ExcelHelper.getBoldCell(metric.label || metric.col) });
    const rows = [headerRow];

    records.forEach((row) => {
      const rowData = [];
      data.selectedMetrics.forEach((metric) => {
        const format = ExcelHelper.format(metric);
        const value = ExcelHelper.cellFormatter(row, metric);
        const cell = ExcelHelper.getCell(value, null, format);
        rowData.push(cell);
      });
      rows.push(rowData);
    });

    ExcelHelper.save(rows, "Segment statistics", `SegmentStats_${startDate}_${endDate}`);
  }

  function getMetrics(): Metric[] {
    return [{ col: 'segmentName', label: 'name', align: 'left' }, { col: 'segmentType', label: 'type' }, { col: 'countTargetedUnique', label: 'visitors post targeting', type: 'number', align: 'right' }, { col: 'postViewCountUnique', label: 'visited post view', type: 'number', align: 'right' }, { col: 'postClickCountUnique', label: 'visited post click', type: 'number', align: 'right' }];
  }

  const manageSegmentsClick = () => {
    history.push(`/segments/advertiser/${campaign.advertiserId}`);
  }

  const handleReportSubmit = async (data: { daterange: DateRange, selectedMetrics: Metric[] }) => {
    setDownloading(true);
    await downloadReport(data);
    setDownloading(false);
    setShowReportModal(false);
  }

  if (!error) {
    return <div className="col-sm-12 pt-3 mb-2">
      <div className="card">
        <h3 className="pull-left">Segment insights</h3>
        <div className="table-btn-container">
          <Button variant="primary" size="sm" className="mr-2" onClick={() => { setShowReportModal(true) }}><FontIcon name="download" /> REPORT</Button>
          {props.rights.MANAGE_SEGMENTS &&
            <button className="btn btn-linkbutton btn-sm mr-2" onClick={manageSegmentsClick}><FontIcon name="plus" /> MANAGE SEGMENTS</button>}
        </div>
        <Loader visible={showLoader} />
        {!showLoader &&
          <SegmentInsightsTable records={records} metrics={metrics} user={props.user} />
        }
        <ReportModal
          id="segment-insights-report"
          show={showReportModal}
          downloading={downloading}
          metrics={metrics}
          onClose={() => { setShowReportModal(false); setDownloading(false); }}
          onSubmit={handleReportSubmit}
        />
      </div>
    </div>;
  } else {
    return <div className="col-sm-12 pt-3 mb-2">
      <div className="card">
        <h3><ErrorContainer message={errorMessage} /></h3>
      </div>
    </div>;
  }
}
export default SegmentsTab;