import React, { useState, useEffect, useRef, Fragment } from "react";
import { ButtonGroup, Button } from "react-bootstrap";
import Select from "react-select";
import * as _ from "lodash";
import Constants from "../../../../../modules/Constants";
import * as Api from "../../../../../client/Api";
import { AttributeGraphSettings, GroupOption, Metric, SelectOption } from "../../../../../client/schemas";
import { AttributeChartType } from "../../../../../models/data/Attribute";
import FontIcon from "../../../../UI/FontIcon";
import { Options } from "../../../../../models/Common";
import { StatisticsOptions } from "../../../../../models/data/Statistics";
import Loader from "../../../../UI/Loader";
import ErrorContainer from "../../../../UI/ErrorContainer";
import AttributeGraph from "./AttributeGraph";

declare var $: any;
declare var html2canvas: any;
declare var download: any;
declare var canvg: any;

interface AttributeGraphAreaProps {
  id: string;
  attributes: GroupOption[];
  metrics: Metric[];
  settings: AttributeGraphSettings;
  options: Options;
}

const AttributeGraphArea = (props: AttributeGraphAreaProps) => {
  const [attributeId, setAttributeId] = useState<number>(props.settings.attributeId);
  const [selectedMetric, setSelectedMetric] = useState<Metric>(props.settings.selectedMetric);
  const [chartType, setChartType] = useState<AttributeChartType>(props.settings.chartType);
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const [showLoader, setShowLoader] = useState<boolean>(false);
  const [showPngGraph, setShowPngGraph] = useState<boolean>(false);
  const [data, setData] = useState<any[]>([]);
  const [error, setError] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>("");

  const controller = useRef<AbortController>(null);

  const attributeValue = getAttributeValue();
  const metricOptions = props.metrics.map((m) => { return { value: m.col, label: m.label || m.col }; });
  const metricValue = metricOptions.find((m) => { return m.value === selectedMetric.col; });
  const chartTypeOptions = getChartTypeOptions(attributeValue);

  useEffect(() => { return unload; }, []);
  useEffect(() => {
    setAttributeId(props.settings.attributeId);
    setSelectedMetric(props.settings.selectedMetric);
  }, [JSON.stringify(props.settings)]);

  useEffect(() => {
    const chartTypeIndex = chartTypeOptions.findIndex((o) => { return o.value === props.settings.chartType });
    if (chartTypeIndex > -1) {
      setChartType(props.settings.chartType);
      setActiveIndex(chartTypeIndex);
    } else {
      setChartType(chartTypeOptions.length > 0 ? chartTypeOptions[0].value as AttributeChartType : "donut");
      setActiveIndex(0);
    }
  }, [JSON.stringify(chartTypeOptions)]);

  useEffect(() => {
    loadData();
  }, [attributeId, JSON.stringify(props.options)]);

  useEffect(() => {
    if (showPngGraph) {
      downloadPng();
    }
  }, [showPngGraph]);

  async function loadData() {
    setShowLoader(true);
    try {
      unload();
      controller.current = new AbortController();
      const options = getOptions();
      const response = await Api.Get({ path: "/api/statistics", qs: options, signal: controller.current.signal });
      const data = _.get(response, "statisticList") || [];
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

  function unload() {
    if (controller.current) {
      controller.current.abort();
    }
  }

  function getOptions() {
    let options: StatisticsOptions = {
      scope: props.options.scope,
      attributeId,
      startDate: props.options.startDate,
      endDate: props.options.endDate,
      limit: Constants.MAX_API_LIMIT,
      videoMetrics: "false",
      simple: "false",
      aggregator: "name"
    };
    if (props.options.scopeId !== undefined) options.scopeId = props.options.scopeId;
    return options;
  }

  function getAttributeValue() {
    const groupOptions = props.attributes.concat();
    const options: SelectOption[] = _.flatMap(groupOptions, (g: GroupOption) => { return g.options });
    const selected = options.find((o) => { return o.value === attributeId });
    return selected;
  }

  function getChartTypeOptions(attributeValue: SelectOption): SelectOption[] {
    return (_.get(attributeValue, "chartTypes") || []).map((type) => { return { value: type, label: type } });
  }

  function getChartTypeIcon(type: AttributeChartType): string {
    switch (type) {
      case "donut": return "pie-chart";
      case "bar": return "bar-chart";
      case "table": return "list";
    }
  }

  function downloadPngClick() {
    setShowPngGraph(true);
  }

  function downloadPng() {
    const graphId = `${props.id}`;
    const attrGraphPng = "#" + graphId + "-png";
    const $attrGraphPng = $(attrGraphPng);

    setTimeout(function () {
      adjustSvgStyles($attrGraphPng);
      html2canvas($attrGraphPng, {
        allowTaint: true,
        onrendered: function (canvas) {
          var imgData = canvas.toDataURL("image/png");
          download(imgData, "chart.png", "image/png");
          setShowPngGraph(false);
        }
      });
    }, 300);
  }

  function adjustSvgStyles($attrGraphPng) {
    var $svgs = $attrGraphPng.find("svg");
    if ($svgs.length > 0) {
      $svgs.find(".domain").css("fill", "none");
      $svgs.find(".c3-chart-arc text").css({ "fill": "#fff", "fontSize": "30px", "opacity": 1 });
      $svgs.find(".c3 .tick text, .c3-legend-item, .c3-legend-item text, .c3-chart-arcs-title").css({ "fontSize": "30px" });
      svg2png($svgs);
    }
  }

  function svg2png($svgs) {
    if ($svgs.length > 0) {
      var svgTag = $svgs[0];
      var c = document.createElement('canvas');
      c.width = svgTag.clientWidth;
      c.height = svgTag.clientHeight;
      svgTag.parentNode.insertBefore(c, svgTag);
      svgTag.parentNode.removeChild(svgTag);
      var div = document.createElement('div');
      div.appendChild(svgTag);
      canvg(c, div.innerHTML, {
        ignoreDimensions: true,
        scaleWidth: c.width,
        scaleHeight: c.height
      });
      var img = document.createElement('img');
      img.src = c.toDataURL('image/png');
      c.parentNode.insertBefore(img, c);
      c.parentNode.removeChild(c);
    }
  }

  const metricChange = (selected) => {
    const selectedMetric = props.metrics.find((m) => { return m.col === selected.value });
    setSelectedMetric(selectedMetric);
  }

  const attributeChange = (selected) => {
    setAttributeId(selected.value);
  }

  return <div className="card h-100">
    <div className="attribute-graph-settings">
      <div>
        <div className="width-200 d-inline-block">
          <Select
            inputId={`react-select-analysis-metric-${props.id}`}
            className="react-select-container"
            classNamePrefix="react-select"
            name="analysis-metric-select"
            value={metricValue}
            clearable={false}
            onChange={metricChange}
            options={metricOptions}
          />
        </div>
        <div style={{ width: "40px" }} className="d-inline-block text-center align-top pt-1">by</div>
        <div className="width-200 d-inline-block">
          <Select
            inputId={`react-select-analysis-attribute-${props.id}`}
            className="react-select-container"
            classNamePrefix="react-select"
            name="analysis-attribute-select"
            value={attributeValue as any}
            clearable={false}
            onChange={attributeChange}
            options={props.attributes}
          />
        </div>
      </div>
      <div>
        <button onClick={downloadPngClick} type="button" disabled={showPngGraph} className="btn btn-primary btn-sm mr-2">
          <FontIcon name="download" /> PNG
        </button>
        <ButtonGroup size="sm">
          {
            chartTypeOptions.map((t, i) => <Button className={activeIndex === i ? "active" : ""} onClick={() => { setChartType(t.value as AttributeChartType); setActiveIndex(i); }} variant="outline-secondary">
              <FontIcon name={getChartTypeIcon(t.value as AttributeChartType)} />
            </Button>)
          }
        </ButtonGroup>
      </div>
    </div>
    <div className="row">
      <div className="col-sm-12 pt-2">
        <Loader visible={showLoader} />
        {!showLoader && !error && <Fragment>
          <AttributeGraph
            id={props.id}
            data={data}
            metric={selectedMetric}
            chartType={chartType}
            attributeLabel={_.get(attributeValue, "label") || ""}
            png={false}
          />
          {showPngGraph &&
            <div className="graph-png-container">
              <AttributeGraph
                id={`${props.id}-png`}
                data={data}
                metric={selectedMetric}
                chartType={chartType}
                attributeLabel={_.get(attributeValue, "label") || ""}
                png={true}
              />
            </div>
          }
        </Fragment>
        }
        {error && <ErrorContainer message={errorMessage} />}
      </div>
    </div>
  </div>
}
export default AttributeGraphArea;