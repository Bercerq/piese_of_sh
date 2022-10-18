import React, { useState, useEffect, Fragment } from "react";
import Select from "react-select";
import { Form, Tooltip, OverlayTrigger } from "react-bootstrap";
import * as _ from "lodash";
import * as Helper from "../../../../client/Helper";
import * as Validation from "../../../../client/Validation";
import { ReportTabFigure, ReportTabFigureType } from "../../../../models/data/Report";
import { GroupOption, SelectOption, ValidationError } from "../../../../client/schemas";
import FontIcon from "../../../UI/FontIcon";

interface ReportTabChartProps {
  index: number;
  tabIndex: number;
  figure: ReportTabFigure;
  writeAccess: boolean;
  metricOptions: SelectOption[];
  dimensionOptions: (GroupOption | SelectOption)[];
  onChange: (index: number, figure: ReportTabFigure, isValid: boolean) => void;
  onDelete: (index: number) => void;
}

const ReportTabChart = (props: ReportTabChartProps) => {
  const width = props.figure.figureWidth || 17;
  const height = props.figure.figureHeight || 17;
  const initialSize = getInitialSize(width, height);
  const [name, setName] = useState<string>(props.figure.title);
  const [type, setType] = useState<ReportTabFigureType>(props.figure.type);
  const [dimension, setDimension] = useState<string>(props.figure.dimensions && props.figure.dimensions.length > 0 ? props.figure.dimensions[0] : "date");
  const [metrics, setMetrics] = useState<string[]>(props.figure.metrics || []);
  const [secondaryMetrics, setSecondaryMetrics] = useState<string[]>(props.figure.secondaryMetrics || []);
  const [limit, setLimit] = useState<number>(props.figure.limit || 50);
  const [figureWidth, setFigureWidth] = useState<number>(width);
  const [figureHeight, setFigureHeight] = useState<number>(height);
  const [size, setSize] = useState<("small" | "large" | "custom")>(initialSize);
  const [limitValidation, setLimitValidation] = useState<ValidationError>({ error: false, message: "" });

  useEffect(() => {
    const isValid = !limitValidation.error;
    props.onChange(props.index, { title: name, type, dimensions: [dimension], metrics, secondaryMetrics, limit, figureWidth, figureHeight }, isValid);
  }, [name, type, dimension, metrics, secondaryMetrics, limit, figureWidth, figureHeight]);

  useEffect(() => {
    setName(props.figure.title);
    setDimension(props.figure.dimensions && props.figure.dimensions.length > 0 ? props.figure.dimensions[0] : "date");
    setMetrics(props.figure.metrics || []);
    setSecondaryMetrics(props.figure.secondaryMetrics || [])
    setLimit(props.figure.limit);
    setFigureWidth(props.figure.figureWidth);
    setFigureHeight(props.figure.figureHeight);
    const size = getInitialSize(props.figure.figureWidth, props.figure.figureHeight);
    setSize(size);
  }, [JSON.stringify(props.figure)]);

  function getChartTypeOptions(): SelectOption[] {
    return [
      { value: "barchart", label: "bar chart" },
      { value: "columnchart", label: "column chart" },
      { value: "linechart", label: "line chart" },
      { value: "piechart", label: "pie chart" }
    ];
  }

  function getSizeOptions(): SelectOption[] {
    return [
      { value: "large", label: "large (17x17)" },
      { value: "small", label: "small (8x17)" },
      { value: "custom", label: "custom" }
    ];
  }

  function getInitialSize(width, height) {
    if (width === 17 && height === 17) {
      return "large";
    } else if (width === 8 && height === 17) {
      return "small";
    } else {
      return "custom";
    }
  }

  function getSelectedDimension() {
    const options: SelectOption[] = _.flatMap(props.dimensionOptions, (g: GroupOption | SelectOption) => { return g.options || g });
    return options.find((o) => { return o.value === dimension });
  }

  function getSelectedMetrics(metrics: string[]) {
    return (metrics || []).map((m) => { return props.metricOptions.find((o) => { return o.value === m }) });
  }

  const handleNameChange = (e) => {
    const name = e.target.value;
    setName(name);
  }

  const handleTypeChange = (selected) => {
    setType(selected.value);
    if (selected.value === "piechart") {
      setSecondaryMetrics([]);
    }
  }

  const handleDimensionChange = (selected) => {
    setDimension(selected.value as string);
  }

  const handleMetricsChange = (selected) => {
    const metrics = (selected || []).map((o) => { return o.value as string });
    setMetrics(metrics);
  }

  const handleSecondaryMetricsChange = (selected) => {
    const secondaryMetrics = selected.map((o) => { return o.value as string });
    setSecondaryMetrics(secondaryMetrics);
  }

  const handleLimitChange = (e) => {
    const limit = parseInt(e.target.value, 10);
    const limitValidation = Validation.native(e.target);
    setLimit(limit);
    setLimitValidation(limitValidation);
  }

  const handleSizeChange = (selected) => {
    setSize(selected.value);
    if (selected.value === "large") {
      setFigureWidth(17);
      setFigureHeight(17);
    } else if (selected.value === "small") {
      setFigureWidth(8);
      setFigureHeight(17);
    } else {
      setFigureWidth(null);
      setFigureHeight(null);
    }
  }

  const handleWidthChange = (e) => {
    const width = parseInt(e.target.value, 10);
    if (isNaN(width)) {
      setFigureWidth(null);
    } else {
      setFigureWidth(width);
    }
  }

  const handleHeightChange = (e) => {
    const height = parseInt(e.target.value, 10);
    if (isNaN(height)) {
      setFigureHeight(null);
    } else {
      setFigureHeight(height);
    }
  }

  const removeClick = (e) => {
    e.preventDefault();
    if (props.writeAccess) {
      props.onDelete(props.index);
    }
  }

  const chartTypeOptions = getChartTypeOptions();
  const selectedDimension = getSelectedDimension();
  const sizeOptions = getSizeOptions();
  const deleteTooltip = <Tooltip id={`tab-chart-delete-tooltip-${props.tabIndex}-${props.index}`}>delete chart</Tooltip>;
  const popperConfig = Helper.getPopperConfig();

  return <div className="row template-figure-row">
    <div className="col-lg-12">
      <OverlayTrigger placement="top" overlay={deleteTooltip} popperConfig={popperConfig}>
        <a href="" className="table-btn-lg pull-right" onClick={removeClick}><FontIcon name="remove" /></a>
      </OverlayTrigger>
    </div>
    <div className="col-lg-12">
      <Form.Group controlId={`tab-chart-name-${props.tabIndex}-${props.index}`}>
        <Form.Label>Chart name *</Form.Label>
        <Form.Control
          readOnly={!props.writeAccess}
          type="text"
          value={name}
          onChange={handleNameChange}
        />
      </Form.Group>
      <Form.Group controlId={`tab-chart-type-${props.tabIndex}-${props.index}`}>
        <Form.Label>Chart type:</Form.Label>
        <Select
          inputId={`tab-chart-select-type-${props.tabIndex}-${props.index}`}
          className="react-select-container"
          classNamePrefix="react-select"
          clearable={false}
          isDisabled={!props.writeAccess}
          value={chartTypeOptions.find((o) => { return o.value === type })}
          onChange={handleTypeChange}
          options={chartTypeOptions}
        />
      </Form.Group>
      <Form.Group controlId={`tab-chart-dimensions-${props.tabIndex}-${props.index}`}>
        <Form.Label>Dimension:</Form.Label>
        <Select
          inputId={`tab-chart-select-dimensions-${props.tabIndex}-${props.index}`}
          className="react-select-container"
          classNamePrefix="react-select"
          isDisabled={!props.writeAccess}
          value={selectedDimension}
          onChange={handleDimensionChange}
          options={props.dimensionOptions}
        />
      </Form.Group>
      {props.writeAccess &&
        <Form.Group controlId={`tab-chart-metrics-${props.tabIndex}-${props.index}`}>
          <Form.Label>Metrics left side:</Form.Label>
          <Select
            inputId={`tab-chart-select-metrics-${props.tabIndex}-${props.index}`}
            className="react-select-container"
            classNamePrefix="react-select"
            isMulti
            closeMenuOnSelect={false}
            value={getSelectedMetrics(metrics)}
            onChange={handleMetricsChange}
            options={props.metricOptions}
          />
        </Form.Group>
      }
      {!props.writeAccess &&
        <Form.Group controlId={`tab-chart-metrics-${props.tabIndex}-${props.index}`}>
          <Form.Label>Metrics:</Form.Label>
          <Select
            inputId={`tab-chart-select-metrics-${props.tabIndex}-${props.index}`}
            className="react-select-container"
            classNamePrefix="react-select"
            isMulti
            isDisabled
            closeMenuOnSelect={false}
            value={metrics.map((m) => { return { value: m, label: m } })}
            options={metrics.map((m) => { return { value: m, label: m } })}
          />
        </Form.Group>
      }
      {type !== "piechart" && props.writeAccess &&
        <Form.Group controlId={`tab-chart-sec-metrics-${props.tabIndex}-${props.index}`}>
          <Form.Label>Metrics right side:</Form.Label>
          <Select
            inputId={`tab-chart-select-sec-metrics-${props.tabIndex}-${props.index}`}
            className="react-select-container"
            classNamePrefix="react-select"
            isMulti
            closeMenuOnSelect={false}
            value={getSelectedMetrics(secondaryMetrics)}
            onChange={handleSecondaryMetricsChange}
            options={props.metricOptions}
          />
        </Form.Group>
      }
      {type !== "piechart" && !props.writeAccess &&
        <Form.Group controlId={`tab-chart-sec-metrics-${props.tabIndex}-${props.index}`}>
          <Form.Label>Metrics right side:</Form.Label>
          <Select
            inputId={`tab-chart-select-sec-metrics-${props.tabIndex}-${props.index}`}
            className="react-select-container"
            classNamePrefix="react-select"
            isMulti
            isDisabled
            closeMenuOnSelect={false}
            value={secondaryMetrics.map((m) => { return { value: m, label: m } })}
            options={secondaryMetrics.map((m) => { return { value: m, label: m } })}
          />
        </Form.Group>
      }
      <Form.Group controlId={`tab-chart-limit-${props.tabIndex}-${props.index}`}>
        <Form.Label>Maximum results</Form.Label>
        <Form.Control
          readOnly={!props.writeAccess}
          required
          type="number"
          min="1"
          isInvalid={limitValidation.error}
          value={_.isNil(limit) ? "" : limit.toString()}
          onChange={handleLimitChange}
        />
        {
          limitValidation.error &&
          <Form.Control.Feedback type="invalid">{limitValidation.message}</Form.Control.Feedback>
        }
      </Form.Group>
      <Form.Group controlId={`tab-chart-size-${props.tabIndex}-${props.index}`}>
        <Form.Label>Size:</Form.Label>
        <Select
          inputId={`tab-chart-select-size-${props.tabIndex}-${props.index}`}
          className="react-select-container"
          classNamePrefix="react-select"
          isDisabled={!props.writeAccess}
          value={sizeOptions.find((o) => { return o.value === size })}
          onChange={handleSizeChange}
          options={sizeOptions}
        />
      </Form.Group>
      {size === "custom" && <Fragment>
        <Form.Group controlId={`tab-chart-width-${props.tabIndex}-${props.index}`}>
          <Form.Label>Width</Form.Label>
          <Form.Control
            readOnly={!props.writeAccess}
            required
            type="number"
            min="1"
            value={_.isNil(figureWidth) ? "" : figureWidth.toString()}
            onChange={handleWidthChange}
          />
        </Form.Group>
        <Form.Group controlId={`tab-chart-height-${props.tabIndex}-${props.index}`}>
          <Form.Label>Height</Form.Label>
          <Form.Control
            readOnly={!props.writeAccess}
            required
            type="number"
            min="1"
            value={_.isNil(figureHeight) ? "" : figureHeight.toString()}
            onChange={handleHeightChange}
          />
        </Form.Group>
      </Fragment>
      }
    </div>
  </div>;
}
export default ReportTabChart;