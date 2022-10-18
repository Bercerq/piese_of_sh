import React, { useState, useRef, useEffect, useContext } from "react";
import { useHistory } from "react-router-dom";
import Select from "react-select";
import moment from "moment";
import * as _ from "lodash";
import * as Api from "../../../../../client/Api";
import { SelectOption } from "../../../../../client/schemas";
import { QsContextType, TabProps } from "../../../../../models/Common";
import Loader from "../../../../UI/Loader";
import TechnicalChartsRow from "./TechnicalChartsRow";
import ErrorContainer from "../../../../UI/ErrorContainer";
import QsContext from "../../../context/QsContext";

const TechnicalDashboardTab = (props: TabProps) => {
  let history = useHistory();
  let query = new URLSearchParams(location.search);
  let {
    tgranularity,
    updateTGranularity,
    tperiod,
    updateTPeriod
  } = useContext<QsContextType>(QsContext);

  const [data, setData] = useState<any[]>([]);
  const [showLoader, setShowLoader] = useState<boolean>(true);
  const [error, setError] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>("");

  const controller = useRef<AbortController>(null);
  const handleInterval = useRef(null);

  useEffect(() => {
    return () => {
      if (handleInterval.current) {
        clearInterval(handleInterval.current);
      }
      unload();
    }
  }, []);

  useEffect(() => {
    if (handleInterval.current) {
      clearInterval(handleInterval.current);
    }
    loadData();
    handleInterval.current = setInterval(loadData, 60000);
  }, [JSON.stringify({ scopeId: props.options.scopeId, scope: props.options.scope, tgranularity, tperiod })]);

  async function loadData() {
    setShowLoader(true);
    try {
      unload();
      controller.current = new AbortController();
      const qs = getOptions();
      const response = await Api.Get({ path: `/api/statistics/timeseries/technical`, qs, signal: controller.current.signal });
      const data = transformData(response);
      setData(data);
      setShowLoader(false);
    } catch (err) {
      if (err.name === "AbortError") {
        setError(false);
        setErrorMessage("");
      } else {
        setError(true);
        setErrorMessage("Error loading data");
        setShowLoader(false);
      }
    }
  }

  function unload() {
    if (controller.current) {
      controller.current.abort();
    }
  }

  function getOptions() {
    const { start, end } = getPeriod();
    const qs = {
      attributeId: 13,
      scope: props.options.scope,
      scopeId: props.options.scopeId,
      granularity: tgranularity,
      start,
      end,
      metrics: ["timeout", "request_number", "request_failed", "bid_filtered", "bid_number", "bid_error", "won_bids", "request_quantile_75", "request_quantile_95", "request_quantile_99"]
    };
    return qs;
  }

  function transformData(response: any) {
    let total = response.total;
    total.name = "All";
    const totalData = [total];
    const resultsData = response.resultsPerValue.filter((o) => { return o.name !== null });
    const rawData = totalData.concat(resultsData);
    return rawData.map((row) => {
      return {
        name: row.name,
        results: row.results.map(transformResultsRow)
      }
    });
  }

  function transformResultsRow(o) {
    const timeouts = divideIfNotZero(_.get(o, "metrics.timeout"), _.get(o, "metrics.request_number")) * 100;
    const request_errors = divideIfNotZero(_.get(o, "metrics.request_failed"), _.get(o, "metrics.request_number")) * 100;
    const bids_filtered = divideIfNotZero(_.get(o, "metrics.bid_filtered"), _.get(o, "metrics.bid_number")) * 100;
    const bids_error = divideIfNotZero(_.get(o, "metrics.bid_error"), _.get(o, "metrics.bid_number")) * 100;
    const request_quantile_75 = _.get(o, "metrics.request_quantile_75") * 1000;
    const request_quantile_95 = _.get(o, "metrics.request_quantile_95") * 1000;
    const request_quantile_99 = _.get(o, "metrics.request_quantile_99") * 1000;

    return {
      dateTime: o.dateTime,
      metrics: {
        timeouts,
        request_errors,
        bids_filtered,
        bids_error,
        request_quantile_75,
        request_quantile_95,
        request_quantile_99,
        request_number: _.get(o, "metrics.request_number", 0),
        bid_number: _.get(o, "metrics.bid_number", 0),
        won_bids: _.get(o, "metrics.won_bids", 0)
      }
    };
  }

  function getGranularityOptions(): SelectOption[] {
    return [
      { value: "PT10M", label: "per 10 minutes" },
      { value: "PT1H", label: "per hour" },
    ];
  }

  function getPeriodOptions(): SelectOption[] {
    return [
      { value: "24h", label: "Past 24 hours" },
      { value: "3d", label: "Past 3 days" },
      { value: "1w", label: "Past week" }
    ]
  }

  function getPeriod(): { start: string; end: string } {
    let start = "";
    const end = moment().format("YYYY-MM-DDTHH:mm:ss");
    if (tperiod === "24h") {
      start = moment().subtract(24, 'hours').format("YYYY-MM-DDTHH:mm:ss");
    } else if (tperiod === "3d") {
      start = moment().subtract(3, 'days').format("YYYY-MM-DDTHH:mm:ss");
    } else if (tperiod === "1w") {
      start = moment().subtract(1, 'weeks').format("YYYY-MM-DDTHH:mm:ss");
    }
    return { start, end };
  }

  function divideIfNotZero(numerator, denominator) {
    if (denominator === 0 || isNaN(denominator)) {
      return 0;
    } else if (isNaN(numerator)) {
      return 0;
    } else {
      return numerator / denominator;
    }
  }

  const handleGranularityChange = (selected: SelectOption) => {
    const tgranularity = selected.value as ("PT10M" | "PT1H");
    query.set("tgranularity", tgranularity);
    updateTGranularity(tgranularity);
    history.push(`${location.pathname}?${query.toString()}`);
  }

  const handlePeriodChange = (selected: SelectOption) => {
    const tperiod = selected.value as ("24h" | "3d" | "1w");
    query.set("tperiod", tperiod);
    updateTPeriod(tperiod);
    history.push(`${location.pathname}?${query.toString()}`);
  }

  if (!error) {
    const granularityOptions = getGranularityOptions();
    const periodOptions = getPeriodOptions();
    return <div className="col-sm-12 pt-3 mb-2">
      <div className="row no-gutters mb-2">
        <div className="col-lg-12">
          <div className="width-150 pull-right" style={{ marginRight: "10px" }}>
            <Select
              inputId="react-select-technical-granularity"
              className="react-select-container"
              classNamePrefix="react-select"
              clearable={false}
              isSearchable={false}
              value={granularityOptions.find((o) => { return o.value === tgranularity })}
              onChange={handleGranularityChange}
              options={granularityOptions}
            />
          </div>
          <div className="width-150 pull-right" style={{ marginRight: "10px" }}>
            <Select
              inputId="react-select-period"
              className="react-select-container"
              classNamePrefix="react-select"
              clearable={false}
              isSearchable={false}
              value={periodOptions.find((o) => { return o.value === tperiod })}
              onChange={handlePeriodChange}
              options={periodOptions}
            />
          </div>
        </div>
      </div>
      <Loader visible={showLoader} />
      {!showLoader && data.length > 0 &&
        data.map((row, i) => <div key={`technical-chart-row-${i}`} className="row mb-2">
          <div className="col-lg-12">
            <div className="card">
              <h3>{row.name}</h3>
              <TechnicalChartsRow data={row} />
            </div>
          </div>
        </div>)
      }
    </div>;
  } else {
    return <div className="col-sm-12 pt-3">
      <div className="card mb-2">
        <h3><ErrorContainer message={errorMessage} /></h3>
      </div>
    </div>;
  }
}
export default TechnicalDashboardTab;