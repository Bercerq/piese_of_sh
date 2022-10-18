import React, { useState, useEffect, useContext, Fragment } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import Select from "react-select";
import * as StatisticsHelper from "./StatisticsHelper";
import * as FiltersHelper from "../../../shared/filters/FiltersHelper";
import * as Validation from "../../../../../client/Validation";
import FontIcon from "../../../../UI/FontIcon";
import { Metric, DateRange, SelectOption, GroupOption, StatisticFilter, ValidationError } from "../../../../../client/schemas";
import ReportDateRangePicker from "../../../shared/reports/ReportDateRangePicker";
import CheckboxList from "../../../../UI/CheckboxList";
import Checkbox from "../../../../UI/Checkbox";
import StatisticFilterRow from "../../../shared/filters/StatisticFilterRow";
import QsContext from "../../../context/QsContext";
import { QsContextType } from "../../../../../models/Common";

interface StatisticsReportModalProps {
  id: string;
  show: boolean;
  downloading: boolean;
  metrics: Metric[];
  selectedMetrics?: string[];
  attributeId: number;
  attributeId2: number;
  attributeOptions: (GroupOption | SelectOption)[];
  attribute2Options: (GroupOption | SelectOption)[];
  filterOptions: (GroupOption | SelectOption)[];
  filters: string[];
  onClose: () => void;
  onSubmit: (data: { daterange: DateRange, selectedMetrics: Metric[], attributeId: number, attributeId2: number, filters: string[], includeTotal: boolean }) => void;
}

const StatisticsReportModal = (props: StatisticsReportModalProps) => {
  const metricsOptions: SelectOption[] = props.metrics.map((o) => { return { value: o.col, label: o.label || o.col } });
  let daterangeContext = useContext<QsContextType>(QsContext);
  let initialDaterange: DateRange = daterangeContext.daterange;
  const initialChecked = props.selectedMetrics ? props.selectedMetrics : props.metrics.map((o) => { return o.col });
  const initialFilters = FiltersHelper.getStatisticFilters(props.filters);
  const [attributeId, setAttributeId] = useState<number>(props.attributeId);
  const [attributeId2, setAttributeId2] = useState<number>(props.attributeId2);
  const [daterange, setDaterange] = useState<DateRange>(initialDaterange);
  const [checked, setChecked] = useState<string[]>(initialChecked);
  const [statisticFilters, setStatisticFilters] = useState<StatisticFilter[]>(initialFilters);
  const [includeTotal, setIncludeTotal] = useState<boolean>(true);
  const [showIncludeTotal, setShowIncludeTotal] = useState<boolean>(props.attributeId2 !== -1);
  const [downloading, setDownloading] = useState<boolean>(false);
  const [daterangeValidation, setDaterangeValidation] = useState<ValidationError>({ error: false, message: "" });

  useEffect(() => { setDownloading(props.downloading) }, [props.downloading]);

  const handleEntering = () => {
    setDaterange(initialDaterange);
    if (props.selectedMetrics !== undefined) setChecked(props.selectedMetrics);
    setAttributeId(props.attributeId);
    setAttributeId2(props.attributeId2);
    setShowIncludeTotal(props.attributeId2 !== -1);
    const statisticFilters = FiltersHelper.getStatisticFilters(props.filters);
    setStatisticFilters(statisticFilters);
    setDaterangeValidation({ error: false, message: "" });
  }

  const handleSubmit = () => {
    const selectedMetrics = props.metrics.filter((o) => { return checked.indexOf(o.col) > -1 });
    const filters = FiltersHelper.getFilters(statisticFilters);
    const daterangeValidation = Validation.daterange(daterange);
    setDaterangeValidation(daterangeValidation);
    if (!daterangeValidation.error) {
      props.onSubmit({ daterange, selectedMetrics, attributeId, attributeId2, filters, includeTotal });
    }
  }

  const onDateRangeChange = (daterange: DateRange) => {
    const daterangeValidation = Validation.daterange(daterange);
    setDaterange(daterange);
    setDaterangeValidation(daterangeValidation);
  }

  const onMetricsChange = (checked: string[]) => {
    setChecked(checked);
  }

  const attributeChange = (selected) => {
    const attributeId = selected.value as number;
    setAttributeId(attributeId);
  }

  const attribute2Change = (selected) => {
    const attributeId2 = selected.value as number;
    setAttributeId2(attributeId2);
    setShowIncludeTotal(attributeId2 !== -1);
  }

  const addFilterClick = () => {
    const newStatisticFilter: StatisticFilter = { attributeId: -1, condition: "in", values: [] };
    setStatisticFilters([...statisticFilters, newStatisticFilter]);
  }

  const statisticFilterDelete = (i: number) => {
    const updated = statisticFilters.concat();
    if (updated.length > 0) {
      updated.splice(i, 1);
      setStatisticFilters(updated);
    }
  }

  const statisticFilterChange = (i: number, filter: StatisticFilter) => {
    let updated = statisticFilters.concat();
    updated[i] = filter;
    setStatisticFilters(updated);
  }

  const clearFiltersClick = () => {
    setStatisticFilters([]);
  }

  const includeTotalChange = (checked: boolean) => {
    setIncludeTotal(checked);
  }

  const attributeValue = StatisticsHelper.getAttributeValue(attributeId, props.attributeOptions);
  const attribute2Value = StatisticsHelper.getAttribute2Value(attributeId2, props.attribute2Options);

  return <Modal size="lg" show={props.show} onHide={props.onClose} onEntering={handleEntering} backdrop="static">
    <Modal.Header closeButton>
      <Modal.Title>Customize report</Modal.Title>
    </Modal.Header>
    <Modal.Body>
      <Form.Group>
        <Form.Label>Period</Form.Label>
        <div>
          <ReportDateRangePicker id={props.id} daterange={daterange} onChange={onDateRangeChange}></ReportDateRangePicker>
          {daterangeValidation.error && <Form.Control.Feedback type="invalid" style={{ display: "block" }}>{daterangeValidation.message}</Form.Control.Feedback>}
        </div>
      </Form.Group>
      <Form.Group>
        <Select
          inputId="react-select-statistics-report-attribute"
          className="react-select-container"
          classNamePrefix="react-select"
          name="report-attribute-select"
          value={attributeValue}
          clearable={false}
          onChange={attributeChange}
          options={props.attributeOptions}
        />
      </Form.Group>
      <Form.Group>
        <Select
          inputId="react-select-statistics-report-attribute2"
          className="react-select-container"
          classNamePrefix="react-select"
          name="report-attribute-select"
          value={attribute2Value}
          clearable={false}
          onChange={attribute2Change}
          options={props.attribute2Options}
        />
      </Form.Group>
      {showIncludeTotal &&
        <Form.Group>
          <Checkbox id="statistics-report-includetotal" checked={includeTotal} onChange={includeTotalChange}>Include first dimension totals</Checkbox>
        </Form.Group>
      }
      <Form.Group>
        <Form.Label>Metrics</Form.Label>
        <CheckboxList
          id={`${props.id}-cb-list`}
          listClassNames="metrics-list"
          options={metricsOptions}
          selectAll={true}
          checked={checked}
          onChange={onMetricsChange}
        />
      </Form.Group>
      <Form.Group>
        <Form.Label>Filters</Form.Label>
        <div>
          {
            statisticFilters.map((statisticFilter, i) => <StatisticFilterRow
              index={i}
              filter={statisticFilter}
              writeAccess={true}
              attributes={props.filterOptions}
              onChange={statisticFilterChange}
              onDelete={statisticFilterDelete}
            />)
          }
        </div>
        <div>
          <button className="mr-2 btn btn-primary btn-xs" onClick={addFilterClick}><FontIcon name="plus" /> ADD FILTER</button>
          {statisticFilters.length > 0 && <button className="mr-2 btn btn-primary btn-xs" onClick={clearFiltersClick}><FontIcon name="remove" /> CLEAR FILTERS</button>}
        </div>
      </Form.Group>
    </Modal.Body>
    <Modal.Footer>
      <Button variant="light" size="sm" onClick={props.onClose}>CANCEL</Button>
      <Button variant="primary" size="sm" onClick={handleSubmit} disabled={downloading}>
        {!downloading && <Fragment><FontIcon name="download" /> DOWNLOAD</Fragment>}
        {downloading && <Fragment><FontIcon names={["refresh", "spin"]} /> DOWNLOADING</Fragment>}
      </Button>
    </Modal.Footer>
  </Modal>;
}
export default StatisticsReportModal;