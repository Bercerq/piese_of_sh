import React, { useState, useEffect, useRef } from "react";
import { Button } from "react-bootstrap";
import * as _ from "lodash";
import ErrorContainer from "../../../../UI/ErrorContainer";
import Loader from "../../../../UI/Loader";
import { Options } from "../../../../../models/Common";
import * as Api from "../../../../../client/Api";
import * as ExcelHelper from "../../../../../client/ExcelHelper";
import { AppUser } from "../../../../../models/AppUser";
import InvoicingTable from "./InvoicingTable";
import FontIcon from "../../../../UI/FontIcon";
import ReportModal from "../../../shared/reports/ReportModal";
import { Metric, DateRange } from "../../../../../client/schemas";

interface InvoicingCardProps {
  options: Options;
  user: AppUser;
}

const InvoicingCard = (props: InvoicingCardProps) => {
  const [showLoader, setShowLoader] = useState<boolean>(true);
  const [records, setRecords] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>(null);
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
      const data: any = await Api.Get({ path: "/api/reporting/financials", qs: props.options, signal: controller.current.signal });
      const records = _.get(data, "statisticList", []).map(transformInvoicingRow);
      const summary: any = transformInvoicingRow(_.get(data, "summary", {}));
      setRecords(records);
      setSummary(summary);
      setShowLoader(false);
    } catch (err) {
      console.log(err);
      if (err.name === "AbortError") {
        setError(false);
        setErrorMessage("");
      } else {
        setError(true);
        setErrorMessage("Error loading invoicing data.");
        setShowLoader(false);
      }
    }
  }

  function unload() {
    if (controller.current) {
      controller.current.abort();
    }
  }

  function transformInvoicingRow(o) {
    let ret = o;
    ret.totalCosts = o.costs + o.uploadCosts;
    return ret;
  }

  function getMetrics(): Metric[] {
    return [
      { col: 'agencyName', label: 'agency name', align: 'left' },
      { col: 'advertiserName', label: 'advertiser name', align: 'left' },
      { col: 'impressions', label: 'impressions', type: 'number', align: 'right' },
      { col: 'media_costs', label: 'media spend', type: 'money', align: 'right' },
      { col: 'adscienceFee', label: 'adscience fee', type: 'money', align: 'right' },
      { col: 'adservingCosts', label: 'adserving cost', type: 'money', align: 'right' },
      { col: 'uploadCosts', label: 'banner upload costs', type: 'money', align: 'right' },
      { col: 'bannerwise_costs', label: 'bannerwise costs', type: 'money', align: 'right' },
      { col: 'dma_costs', label: 'dma', type: 'money', align: 'right' },
      { col: 'dynamic_costs', label: 'audience targeting', type: 'money', align: 'right' },
      { col: 'cpm_fee_costs', label: 'cpm fee', type: 'money', align: 'right' },
      { col: 'other_third_costs', label: 'audience insights', type: 'money', align: 'right' },
      { col: 'totalCosts', label: 'total costs', type: 'money', align: 'right' },
    ];
  }

  const handleReportSubmit = async (data: { daterange: DateRange, selectedMetrics: Metric[] }) => {
    setDownloading(true);
    await downloadReport(data);
    setDownloading(false);
    setShowReportModal(false);
  }

  async function downloadReport(data: { daterange: DateRange, selectedMetrics: Metric[] }) {
    const startDate: string = data.daterange.startDate.format("YYYY-MM-DD");
    const endDate: string = data.daterange.endDate.format("YYYY-MM-DD");
    const options = { startDate, endDate };
    const response: any = await Api.Get({ path: "/api/reporting/financials", qs: options });
    const records = _.get(response, "statisticList", []).map(transformInvoicingRow);
    const summary: any = transformInvoicingRow(_.get(response, "summary", {}));
    records.push(summary);

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

    ExcelHelper.save(rows, "Invoicing", `Invoicing_${startDate}_${endDate}`);
  }

  const metrics = getMetrics();
  if (!error) {
    return <div className="card mb-2">
      <h3 className="pull-left">Invoicing</h3>
      <div className="table-btn-container">
        <Button size="sm" variant="primary" onClick={() => { setShowReportModal(true); }}><FontIcon name="download" /> REPORT</Button>
      </div>
      <Loader visible={showLoader} />
      {!showLoader &&
        <InvoicingTable records={records} summary={summary} metrics={metrics} user={props.user} />
      }
      <ReportModal
        id="invoicing-report"
        show={showReportModal}
        downloading={downloading}
        metrics={metrics}
        onClose={() => { setShowReportModal(false); setDownloading(false); }}
        onSubmit={handleReportSubmit}
      />
    </div>;
  } else {
    return <div className="card mb-2">
      <h3><ErrorContainer message={errorMessage} /></h3>
    </div>;
  }
}
export default InvoicingCard;