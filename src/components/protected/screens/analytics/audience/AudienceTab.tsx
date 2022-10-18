import React, { useState, useRef, useEffect, Fragment } from "react";
import { Form } from "react-bootstrap";
import * as _ from "lodash";
import { TabProps } from "../../../../../models/Common";
import * as Enums from "../../../../../modules/Enums";
import Constants from "../../../../../modules/Constants";
import * as Api from "../../../../../client/Api";
import Loader from "../../../../UI/Loader";
import { SelectOption } from "../../../../../client/schemas";
import ErrorContainer from "../../../../UI/ErrorContainer";
import { StatisticsOptions } from "../../../../../models/data/Statistics";
import AudienceCharts from "./AudienceCharts";

declare var $: any;

const AudienceTab = (props: TabProps) => {
  const options = getOptions();
  const [showLoader, setShowLoader] = useState<boolean>(false);
  const [selectedMetric, setSelectedMetric] = useState<string>("unique_viewers");
  const [data, setData] = useState<any>({});
  const [error, setError] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const controller = useRef<AbortController>(null);

  useEffect(() => {
    window.addEventListener("scroll", scrollMetrics);
    return () => {
      window.removeEventListener("scroll", scrollMetrics);
      unload();
    };
  }, []);

  useEffect(() => { loadData(); }, [JSON.stringify(options)]);

  function scrollMetrics() {
    const $metricsHeader = $("#metrics-header");
    if ($(window).width() > 1024) {
      const offsetTop = $metricsHeader[0].offsetTop;
      const scrollTop = window.pageYOffset;
      if (scrollTop > offsetTop) {
        $metricsHeader.addClass("sticky-header");
      } else {
        $metricsHeader.removeClass("sticky-header");
      }
    } else {
      $metricsHeader.removeClass("sticky-header");
    }
  }

  async function loadData() {
    setShowLoader(true);
    try {
      unload();
      controller.current = new AbortController();
      const data = await Api.Get({ path: "/api/statistics", qs: options, signal: controller.current.signal });
      setData(data);
      setShowLoader(false);
    } catch (err) {
      console.log(err);
      if (err.name === "AbortError") {
        setError(false);
        setErrorMessage("");
      } else {
        setError(true);
        setErrorMessage("Error loading statistics.");
        setShowLoader(false);
      }
    }
  }

  function getOptions() {
    let options: StatisticsOptions = {
      scope: props.options.scope,
      attributeId: Enums.Attributes.AUDIENCE_SEGMENT,
      startDate: props.options.startDate,
      endDate: props.options.endDate,
      limit: Constants.MAX_API_LIMIT,
      videoMetrics: "false",
      simple: "false",
      aggregator: 'name'
    };
    if (props.options.scopeId !== undefined) options.scopeId = props.options.scopeId;
    return options;
  }

  function unload() {
    if (controller.current) {
      controller.current.abort();
    }
  }

  const metrics: SelectOption[] = [
    { value: "unique_viewers", label: "unique viewers" },
    { value: "impressions", label: "impressions" },
    { value: "viewable", label: "views" }
  ];

  const handleMetricChange = (e) => {
    if (e.target.checked) {
      setSelectedMetric(e.target.value);
    }
  }

  function getMetricsHeader() {
    const selected = metrics.find((m) => { return m.value === selectedMetric });
    if (selected) {
      return selected.label;
    }
    return "";
  }

  const metricsHeader = getMetricsHeader();

  if (!error) {
    return <div className="col-sm-12 pt-3 pb-3">
      <div id="metrics-header" className="row mb-2 no-gutters">
        <div className="col-lg-6">
          <h3><span style={{ textTransform: "capitalize" }}>{metricsHeader}</span></h3>
        </div>
        <div className="col-lg-6">
          <div className="pull-right">
            {
              metrics.map((m, i) => <Form.Check inline
                id={`audience-metric-${m.value}`}
                type="radio"
                value={m.value}
                checked={m.value === selectedMetric}
                onChange={handleMetricChange}
                label={m.label} />)
            }
          </div>
        </div>
      </div>
      <Loader visible={showLoader} />
      {!showLoader && <Fragment>
        <AudienceCharts
          data={data}
          metrics={metrics}
          selectedMetric={selectedMetric}
        />
        <div className="row">
          <div className="col-lg-12">
            <div className="pull-right">
              <div className="audience-poweredby">Powered by </div>
              <div className="audience-logo"><a href="https://digitalaudience.io/" target="_blank"><img src="/images/dalogo.png" alt="Digital Audience" /></a></div>
            </div>
          </div>
        </div>
      </Fragment>
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
export default AudienceTab;