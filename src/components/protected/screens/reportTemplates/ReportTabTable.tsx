import React, { useState, useEffect } from "react";
import { Form, Tooltip, OverlayTrigger } from "react-bootstrap";
import Select, { NonceProvider } from "react-select";
import * as _ from "lodash";
import * as Helper from "../../../../client/Helper";
import * as Validation from "../../../../client/Validation";
import { ReportTabFigure } from "../../../../models/data/Report";
import { GroupOption, SelectOption, ValidationError } from "../../../../client/schemas";
import Checkbox from "../../../UI/Checkbox";
import FontIcon from "../../../UI/FontIcon";

interface ReportTabTableProps {
  index: number;
  tabIndex: number;
  figure: ReportTabFigure;
  writeAccess: boolean;
  metricOptions: SelectOption[];
  dimensionOptions: (GroupOption | SelectOption)[];
  onChange: (index: number, figure: ReportTabFigure, isValid: boolean) => void;
  onDelete: (index: number) => void;
}

const ReportTabTable = (props: ReportTabTableProps) => {
  const nonOption = {value: "none", label:"none"};
  const [name, setName] = useState<string>(props.figure.title);
  const [dimension1, setDimension1] = useState<string>(props.figure.dimensions && props.figure.dimensions.length > 0 ? props.figure.dimensions[0] : "date");
  const [dimension2, setDimension2] = useState<string>(props.figure.dimensions && props.figure.dimensions.length > 1 ? props.figure.dimensions[1] : nonOption.value);
  const [dimension3, setDimension3] = useState<string>(props.figure.dimensions && props.figure.dimensions.length > 2 ? props.figure.dimensions[2] : nonOption.value);

  const [metrics, setMetrics] = useState<string[]>(props.figure.metrics || []);
  const [limit, setLimit] = useState<number>(props.figure.limit || 50);
  const [includeTotal, setIncludeTotal] = useState<boolean>(props.figure.includeTotal);
  const [limitValidation, setLimitValidation] = useState<ValidationError>({ error: false, message: "" });


  useEffect(() => {
    const isValid = !limitValidation.error;
    props.onChange(props.index, { title: name, type: props.figure.type, dimensions: [dimension1, dimension2, dimension3].filter(a => a != nonOption.value), metrics, limit, includeTotal }, isValid);
  }, [name, dimension1, dimension2, dimension3, metrics, limit, includeTotal]);

  useEffect(() => {
    setName(props.figure.title);
    setDimension1(props.figure.dimensions && props.figure.dimensions.length > 0 ? props.figure.dimensions[0] : "date");
    setDimension2(props.figure.dimensions && props.figure.dimensions.length > 1 ? props.figure.dimensions[1] : nonOption.value);
    setDimension3(props.figure.dimensions && props.figure.dimensions.length > 2 ? props.figure.dimensions[2] : nonOption.value);
    setMetrics(props.figure.metrics || []);
    setLimit(props.figure.limit);
    setIncludeTotal(props.figure.includeTotal);
  }, [JSON.stringify(props.figure)]);

  function getSelectedDimension(dimension: String) {
    const options: SelectOption[] = _.flatMap([nonOption,...props.dimensionOptions], (g: GroupOption | SelectOption) => { return g.options || g });
    return options.find((o) => { return o.value === dimension });
  }

  function getSelectedMetrics() {
    return (metrics || []).map((m) => { return props.metricOptions.find((o) => { return o.value === m }) });
  }

  const handleNameChange = (e) => {
    const name = e.target.value;
    setName(name);
  }

  const handleDimension1Change = (selected) => {
    setDimension1(selected.value as string);
  }

  const handleDimension2Change = (selected) => {
    setDimension2(selected.value as string);
  }

  const handleDimension3Change = (selected) => {
    setDimension3(selected.value as string);
  }

  const handleMetricsChange = (selected) => {
    const metrics = (selected || []).map((o) => { return o.value as string });
    setMetrics(metrics);
  }

  const handleLimitChange = (e) => {
    const limit = parseInt(e.target.value, 10);
    const limitValidation = Validation.native(e.target);
    setLimit(limit);
    setLimitValidation(limitValidation);
  }

  const removeClick = (e) => {
    e.preventDefault();
    if (props.writeAccess) {
      props.onDelete(props.index);
    }
  }

  const selectedDimension1 = getSelectedDimension(dimension1);
  const selectedDimension2 = getSelectedDimension(dimension2);
  const selectedDimension3 = getSelectedDimension(dimension3);
  const deleteTooltip = <Tooltip id={`tab-table-delete-tooltip-${props.tabIndex}-${props.index}`}>delete table</Tooltip>;
  const popperConfig = Helper.getPopperConfig();

  return <div className="row template-figure-row">
    <div className="col-lg-12">
      <OverlayTrigger placement="top" overlay={deleteTooltip} popperConfig={popperConfig}>
        <a href="" className="table-btn-lg pull-right" onClick={removeClick}><FontIcon name="remove" /></a>
      </OverlayTrigger>
    </div>
    <div className="col-lg-12">
      <Form.Group controlId={`tab-table-name-${props.tabIndex}-${props.index}`}>
        <Form.Label>Table name *</Form.Label>
        <Form.Control
          readOnly={!props.writeAccess}
          type="text"
          value={name}
          onChange={handleNameChange}
        />
      </Form.Group>
      <Form.Group controlId={`tab-table-dimension-1-${props.tabIndex}-${props.index}`}>
        <Form.Label>Dimension:</Form.Label>
        <Select
          inputId={`tab-table-select-dimension-1-${props.tabIndex}-${props.index}`}
          className="react-select-container"
          classNamePrefix="react-select"
          isDisabled={!props.writeAccess}
          value={selectedDimension1}
          onChange={handleDimension1Change}
          options={props.dimensionOptions}
        />
      </Form.Group>
      <Form.Group controlId={`tab-table-dimension-2-${props.tabIndex}-${props.index}`}>
        <Form.Label>Dimension 2:</Form.Label>
        <Select
          inputId={`tab-table-select-dimension-2-${props.tabIndex}-${props.index}`}
          className="react-select-container"
          classNamePrefix="react-select"
          isDisabled={!props.writeAccess}
          value={selectedDimension2}
          onChange={handleDimension2Change}
          options={[ nonOption,...props.dimensionOptions]}
        />
      </Form.Group>
      {(dimension2 != nonOption.value) ?
      <Form.Group controlId={`tab-table-dimension-3-${props.tabIndex}-${props.index}`}>
        <Form.Label>Dimension 3:</Form.Label>
        <Select
          inputId={`tab-table-select-dimension-3-${props.tabIndex}-${props.index}`}
          className="react-select-container"
          classNamePrefix="react-select"
          isDisabled={!props.writeAccess}
          value={selectedDimension3}
          onChange={handleDimension3Change}
          options={[ nonOption,...props.dimensionOptions]}
        />
      </Form.Group> : null
      }
      {props.writeAccess &&
        <Form.Group controlId={`tab-table-metrics-${props.tabIndex}-${props.index}`}>
          <Form.Label>Metrics:</Form.Label>
          <Select
            inputId={`tab-table-select-metrics-${props.tabIndex}-${props.index}`}
            className="react-select-container"
            classNamePrefix="react-select"
            isMulti
            closeMenuOnSelect={false}
            value={getSelectedMetrics()}
            onChange={handleMetricsChange}
            options={props.metricOptions}
          />
        </Form.Group>
      }
      {!props.writeAccess &&
        <Form.Group controlId={`tab-table-metrics-${props.tabIndex}-${props.index}`}>
          <Form.Label>Metrics:</Form.Label>
          <Select
            inputId={`tab-table-select-metrics-${props.tabIndex}-${props.index}`}
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
      <Form.Group controlId={`tab-table-limit-${props.tabIndex}-${props.index}`}>
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
      <Form.Group>
        <Checkbox
          id={`tab-table-includetotal-${props.tabIndex}-${props.index}`}
          checked={includeTotal}
          disabled={!props.writeAccess}
          onChange={(checked) => { setIncludeTotal(checked) }}
        >
          Add total row
            </Checkbox>
      </Form.Group>
    </div>
  </div>;
}
export default ReportTabTable;