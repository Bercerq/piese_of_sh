import React, { useState, useEffect, useContext, useRef, Fragment } from "react";
import { useHistory } from "react-router-dom";
import { DropdownButton, Form, Button } from "react-bootstrap";
import Select from "react-select";
import * as _ from "lodash";
import Constants from "../../../../../modules/Constants";
import { QsContextType, TabProps } from "../../../../../models/Common";
import Loader from "../../../../UI/Loader";
import StatisticsTable from "./StatisticsTable";
import NotificationSystem from "react-notification-system";
import * as NotificationOptions from "../../../../../client/NotificationOptions";
import * as Api from "../../../../../client/Api";
import * as Helper from "../../../../../client/Helper";
import * as ExcelHelper from "../../../../../client/ExcelHelper";
import * as StatisticsHelper from "./StatisticsHelper";
import * as FiltersHelper from "../../../shared/filters/FiltersHelper";
import { AttributeCollection } from "../../../../../models/data/Attribute";
import { GroupOption, SelectOption, Metric, AlignType, MetricType, StatisticFilter, DateRange } from "../../../../../client/schemas";
import ErrorContainer from "../../../../UI/ErrorContainer";
import { StatisticsOptions } from "../../../../../models/data/Statistics";
import { Preset, PresetMetric } from "../../../../../models/data/Preset";
import PresetsContext from "../../../context/PresetsContext";
import FontIcon from "../../../../UI/FontIcon";
import CheckboxList from "../../../../UI/CheckboxList";
import StatisticFilterRow from "../../../shared/filters/StatisticFilterRow";
import StatisticsReportModal from "./StatisticsReportModal";
import QsContext from "../../../context/QsContext";

const StatisticsTab = (props: TabProps) => {
  let history = useHistory();
  let presets = useContext<Preset[]>(PresetsContext);
  let query = new URLSearchParams(location.search);
  let {
    attributeId,
    updateAttributeId,
    attributeId2,
    updateAttributeId2,
    filters,
    updateFilters
  } = useContext<QsContextType>(QsContext);
  const preset = getPreset();
  const presetId = _.get(preset, "id", -1);
  const defaultMetrics = getMetrics();
  const selectedMetrics = defaultMetrics.map((o) => { return o.col });
  const initialChecked = Helper.getSelectedMetrics(props.user.email, selectedMetrics, presetId);
  const initialFilters = FiltersHelper.getStatisticFilters(filters);
  const statisticOptions = getStatisticOptions();

  const [showLoader, setShowLoader] = useState<boolean>(false);
  const [attributeCollection, setAttributeCollection] = useState<AttributeCollection>({});
  const [filterAttributeCollection, setFilterAttributeCollection] = useState<AttributeCollection>({});
  const [statistics, setStatistics] = useState<any>(undefined);
  const [metrics, setMetrics] = useState<Metric[]>(defaultMetrics);
  const [checked, setChecked] = useState<string[]>(initialChecked);
  const [statisticFilters, setStatisticFilters] = useState<StatisticFilter[]>(initialFilters);
  const [search, setSearch] = useState<string>("");
  const [showReportModal, setShowReportModal] = useState<boolean>(false);
  const [downloading, setDownloading] = useState<boolean>(false);
  const [error, setError] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>("");

  const controller = useRef<AbortController>(null);
  const notificationSystem = useRef<NotificationSystem.System>(null);

  useEffect(() => { return unload; }, []);
  useEffect(() => { loadData(); }, [JSON.stringify(statisticOptions), attributeId2]);
  useEffect(() => { loadAttributes(); loadFilterAttributes(); }, [props.videoMode]);
  useEffect(loadMetrics, [props.videoMode, presets]);

  async function loadData() {
    setShowLoader(true);
    try {
      unload();
      controller.current = new AbortController();
      const statistics = await Api.Get({ path: "/api/statistics", qs: statisticOptions, signal: controller.current.signal });
      setStatistics(statistics);
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

  function getStatisticOptions() {
    let options: StatisticsOptions = {
      scope: props.options.scope,
      attributeId,
      startDate: props.options.startDate,
      endDate: props.options.endDate,
      limit: Constants.MAX_API_LIMIT,
      filter: filters,
      videoMetrics: (props.videoMode || false).toString() as ("true" | "false" | "any"),
      simple: "false",
      aggregator: 'name'
    };
    if (props.options.scopeId !== undefined) options.scopeId = props.options.scopeId;
    return options;
  }

  function getStatisticReportOptions(data: { daterange: DateRange, selectedMetrics: Metric[], filters: string[], attributeId: number, attributeId2: number }) {
    const startDate: string = data.daterange.startDate.format("YYYY-MM-DD");
    const endDate: string = data.daterange.endDate.format("YYYY-MM-DD");
    let options: StatisticsOptions = {
      scope: props.options.scope,
      attributeId: data.attributeId,
      startDate,
      endDate,
      limit: Constants.MAX_API_LIMIT,
      filter: data.filters,
      videoMetrics: props.videoMode.toString() as ("true" | "false" | "any"),
      simple: "false",
      aggregator: 'name'
    };
    if (props.options.scopeId !== undefined) options.scopeId = props.options.scopeId;
    if (data.attributeId2 !== -1) {
      options.attributeId2 = data.attributeId2;
      options.limit2 = 100;
    }
    return options;
  }

  async function loadAttributes() {
    try {
      const attributeCollection: AttributeCollection = await Api.Get({ path: "/api/attributes/statistics", qs: { scope: props.options.scope, scopeId: props.options.scopeId, video: props.videoMode.toString() } });
      setAttributeCollection(attributeCollection);
    } catch (err) {
      console.log(err);
    }
  }

  async function loadFilterAttributes() {
    try {
      const attributeCollection = await FiltersHelper.getFilterAttributes({ scope: props.options.scope, scopeId: props.options.scopeId, video: props.videoMode.toString() });
      setFilterAttributeCollection(attributeCollection);
    } catch (err) {
      console.log(err);
    }
  }

  function getPreset() {
    const groupName = props.videoMode ? "VideoStatistics" : "DisplayStatistics";
    const preset = presets.find((p) => {
      return p.presetName === "Default" && p.groupName === groupName;
    });
    return preset;
  }

  function getMetrics(): Metric[] {
    return _.get(preset, "metrics", []).map(getMetric);
  }

  function getTableCol1(attributeId: number, attributeId2: number, attributeValue: SelectOption) {
    let col1;
    if (attributeId === 0) {
      col1 = { col: 'displayName', label: 'date', align: 'left', sort: 0 };
      if (attributeId2 !== -1) col1.sort = 1;
    } else {
      col1 = { col: 'displayName', label: _.get(attributeValue, "label", ""), align: 'left', sort: 1 };
      if (attributeId2 !== -1) col1.sort = 2;
    }
    return col1;
  }

  function getTableMetrics(metrics: Metric[], attributeValue: SelectOption): Metric[] {
    const col1 = getTableCol1(attributeId, attributeId2, attributeValue);
    const tableMetrics = metrics.concat();
    tableMetrics.unshift(col1);
    return tableMetrics;
  }

  function getMetric(pm: PresetMetric): Metric {
    const col = pm.fieldName;
    const label = pm.displayName;
    let align = ["number", "euro"].indexOf(pm.format) > -1 ? "right" : "left";
    let type: string = pm.format;
    if (type === "euro") type = "money";
    if (type === "percentage") type = "perc";
    return { col, label, align: align as AlignType, type: type as MetricType };
  }

  function loadMetrics() {
    const defaultMetrics = getMetrics();
    setMetrics(defaultMetrics);
    const selectedMetrics = defaultMetrics.map((o) => { return o.col });
    const initialChecked = Helper.getSelectedMetrics(props.user.email, selectedMetrics, presetId);
    setChecked(initialChecked);
  }

  const metricsChange = (checked: string[]) => {
    Helper.storeSelectedMetrics(props.user.email, checked, preset.id);
    setChecked(checked);
  }

  const searchChange = (e) => {
    setSearch(e.target.value);
  }

  const attributeChange = (selected) => {
    const attributeId = selected.value as number;
    query.set("attributeId", attributeId.toString());
    updateAttributeId(attributeId);
    history.push(`${location.pathname}?${query.toString()}`);
  }

  const attribute2Change = (selected) => {
    const attributeId2 = selected.value as number;
    query.set("attributeId2", attributeId2.toString());
    updateAttributeId2(attributeId2);
    history.push(`${location.pathname}?${query.toString()}`);
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
    if (updated.length === 0) {
      query.delete("filters[]");
      updateFilters([]);
      history.push(`${location.pathname}?${query.toString()}`);
    }
  }

  const statisticFilterChange = (i: number, filter: StatisticFilter) => {
    let updated = statisticFilters.concat();
    updated[i] = filter;
    setStatisticFilters(updated);
  }

  const applyFiltersClick = () => {
    const filters = FiltersHelper.getFilters(statisticFilters);
    updateFilters(filters);
    query.delete("filters[]");
    filters.forEach((filter) => {
      query.append("filters[]", filter);
    });
    history.push(`${location.pathname}?${query.toString()}`);
  }

  const clearFiltersClick = () => {
    updateFilters([]);
    query.delete("filters[]");
    setStatisticFilters([]);
    history.push(`${location.pathname}?${query.toString()}`);
  }

  const handleReportSubmit = async (data: { daterange: DateRange, selectedMetrics: Metric[], filters: string[], attributeId: number, attributeId2: number, includeTotal: boolean }) => {
    setDownloading(true);
    const statisticReportOptions = getStatisticReportOptions(data);
    try {
      const statistics = await Api.Get({ path: "/api/statistics", qs: statisticReportOptions });
      const rows = getStatisticsExcelRows(statistics, data);
      ExcelHelper.save(rows, "Statistics", "Statistics_" + statisticReportOptions.startDate + "_" + statisticReportOptions.endDate);
    } catch (err) {
      notificationSystem.current.addNotification(NotificationOptions.error("Error loading statistics report data."));
    }
    setDownloading(false);
  }

  function getStatisticsExcelRows(statistics: any, data: { daterange: DateRange, selectedMetrics: Metric[], filters: string[], attributeId: number, attributeId2: number, includeTotal: boolean }) {
    const headerRow = data.selectedMetrics.map((metric) => { return ExcelHelper.getBoldCell(metric.label || metric.col) });
    const options: (GroupOption | SelectOption)[] = Helper.attributeIdOptions(attributeCollection);
    const attributeOptions = ([{ value: 0, label: "Per day" }] as (GroupOption | SelectOption)[]).concat(options);
    const attributeValue = StatisticsHelper.getAttributeValue(data.attributeId, attributeOptions);
    const col1 = getExcelAttributeCol(data.attributeId, attributeValue);
    const attributeFormat = _.get(attributeValue, "attributeFormat") || 0;
    let rows = [];
    if (data.attributeId2 < 0) {
      const metrics = [col1].concat(data.selectedMetrics);
      headerRow.unshift(ExcelHelper.getBoldCell(col1.label));
      rows = [headerRow];
      statistics.statisticList.forEach((row) => {
        const rowData = [];
        metrics.forEach((metric) => {
          const cell = getCellData(row, attributeFormat, metric);
          rowData.push(cell);
        });
        rows.push(rowData);
      });
    } else {
      const attribute2Value = StatisticsHelper.getAttributeValue(data.attributeId2, attributeOptions);
      const col2 = getExcelAttributeCol(data.attributeId2, attribute2Value);
      const attribute2Format = _.get(attribute2Value, "attributeFormat") || 0;
      headerRow.unshift(ExcelHelper.getBoldCell(col2.label));
      headerRow.unshift(ExcelHelper.getBoldCell(col1.label));
      rows = [headerRow];
      statistics.statisticList.forEach((row) => {
        const col1Value = ExcelHelper.cellFormatter(row, col1);
        if (data.includeTotal) {
          const totalRow = getAttributeTotalRow(row, col1Value, data.selectedMetrics, attributeFormat);
          rows.push(totalRow);
        }
        if (row.statisticList && row.statisticList.length > 0) {
          row.statisticList.forEach((secondaryRow) => {
            const col2Value = ExcelHelper.cellFormatter(secondaryRow, col2);
            const rowData = [ExcelHelper.getCell(col1Value), ExcelHelper.getCell(col2Value)];
            data.selectedMetrics.forEach((metric) => {
              const cell = getCellData(secondaryRow, attribute2Format, metric);
              rowData.push(cell);
            });
            rows.push(rowData);
          });
        }
      });
    }
    const totalRow = getTotalRow(statistics.summary, data.selectedMetrics, data.attributeId2);
    rows.push(totalRow);
    return rows;
  }

  function getCellData(row, attributeFormat, metric) {
    const isPerc = isPercentage(attributeFormat, metric);
    let type = isPerc ? "perc" : metric.type;
    const typedMetric = _.assign({}, metric, { type });
    const format = ExcelHelper.format(typedMetric);
    const value = ExcelHelper.cellFormatter(row, typedMetric);
    const cell = ExcelHelper.getCell(value, null, format);
    return cell;
  }

  function isPercentage(attributeFormat, metric) {
    return attributeFormat === 1 && ['number', 'money', 'perc'].indexOf(metric.type) > -1;
  }

  function getTotalRow(summary, metrics, attributeId2) {
    const totalRow = [ExcelHelper.getBoldCell("Total")];
    if (attributeId2 > 0) totalRow.push(ExcelHelper.getCell(""));
    metrics.forEach((metric) => {
      const format = ExcelHelper.format(metric);
      const value = ExcelHelper.cellFormatter(summary, metric);
      totalRow.push(ExcelHelper.getBoldCell(value, format));
    });
    return totalRow;
  }

  function getAttributeTotalRow(row, col1value, metrics, attributeFormat) {
    const rowData = [ExcelHelper.getBoldItalicCell(col1value), ExcelHelper.getCell("")];
    metrics.forEach((metric) => {
      const isPerc = isPercentage(attributeFormat, metric);
      let type = isPerc ? "perc" : metric.type;
      const typedMetric = _.assign({}, metric, { type });
      const format = ExcelHelper.format(typedMetric);
      const value = ExcelHelper.cellFormatter(row, typedMetric);
      const cell = ExcelHelper.getBoldItalicCell(value, format);
      rowData.push(cell);
    });
    return rowData;
  }

  function getExcelAttributeCol(attributeId: number, attributeValue: SelectOption) {
    let col1;
    if (attributeId === 0) {
      col1 = { col: 'displayName', label: 'date', align: 'left' };
    } else {
      col1 = { col: 'displayName', label: _.get(attributeValue, "label", ""), align: 'left' };
    }
    return col1;
  }

  if (!error) {
    const options: (GroupOption | SelectOption)[] = Helper.attributeIdOptions(attributeCollection);
    const attributeOptions = ([{ value: 0, label: "Per day" }] as (GroupOption | SelectOption)[]).concat(options);
    const attribute2Options = ([{ value: -1, label: "Secondary dimension" }, { value: 0, label: "Per day" }] as (GroupOption | SelectOption)[]).concat(options);
    const filterOptions: (GroupOption | SelectOption)[] = ([{ value: -1, label: "Select dimension" }] as (GroupOption | SelectOption)[]).concat(Helper.attributeIdOptions(filterAttributeCollection));
    const attributeValue = StatisticsHelper.getAttributeValue(attributeId, attributeOptions);
    const attribute2Value = StatisticsHelper.getAttribute2Value(attributeId2, attribute2Options);
    const metricsOptions: SelectOption[] = metrics.map((o) => { return { value: o.col, label: o.label || o.col } });
    const tableMetrics = getTableMetrics(metrics, attributeValue);
    return <div className="col-sm-12 pt-3">
      <div className="card mb-2">
        <div>
          <h3 className="pull-left">Statistics</h3>
          <div className="pull-left ml-2 mt-1">
            <Button size="sm" variant="primary" onClick={addFilterClick}><FontIcon name="plus" /> ADD FILTER</Button>
          </div>
          {!showLoader &&
            <div className="table-btn-container statistics">
              <div className="width-200 d-inline-block mr-2">
                <Select
                  inputId="react-select-statistics-attribute"
                  className="react-select-container"
                  classNamePrefix="react-select"
                  name="attribute-select"
                  value={attributeValue}
                  clearable={false}
                  onChange={attributeChange}
                  options={attributeOptions}
                />
              </div>
              <div className="width-200 d-inline-block mr-2">
                <Select
                  inputId="react-select-statistics-attribute2"
                  className="react-select-container"
                  classNamePrefix="react-select"
                  name="attribute-select"
                  value={attribute2Value}
                  clearable={false}
                  onChange={attribute2Change}
                  options={attribute2Options}
                />
              </div>
              <DropdownButton
                alignRight
                size="sm"
                className="mr-2"
                title={<Fragment><FontIcon name="filter" /> METRICS ({checked.length}/{metrics.length})</Fragment>}
                id="statistics-metrics-dropdown-menu"
              >
                <CheckboxList
                  id={`statistics-metrics-cb-list`}
                  listClassNames="metrics-list"
                  options={metricsOptions}
                  selectAll={true}
                  checked={checked}
                  onChange={metricsChange}
                />
              </DropdownButton>
              <Button variant="primary" size="sm" className="mr-2" onClick={() => { setShowReportModal(true) }}><FontIcon name="download" /> REPORT</Button>
              <div className="d-inline-block mr-2">
                <div className="search-label-container">
                  <FontIcon name="search" />
                  <label className="search-label">
                    <Form.Control
                      type="text"
                      placeholder="Filter records"
                      value={search}
                      onChange={searchChange}
                    />
                  </label>
                </div>
              </div>
            </div>
          }
        </div>
        <div style={{ maxWidth: "800px" }}>
          {
            statisticFilters.map((statisticFilter, i) => <StatisticFilterRow
              index={i}
              filter={statisticFilter}
              writeAccess={true}
              attributes={filterOptions}
              onChange={statisticFilterChange}
              onDelete={statisticFilterDelete}
            />)
          }
        </div>
        <div>
          {statisticFilters.length > 0 && <button className="mr-2 btn btn-primary btn-xs" onClick={applyFiltersClick}><FontIcon name="search" /> APPLY FILTERS</button>}
          {statisticFilters.length > 0 && <button className="mr-2 btn btn-primary btn-xs" onClick={clearFiltersClick}><FontIcon name="remove" /> CLEAR FILTERS</button>}
        </div>
        <Loader visible={showLoader} />
        {!showLoader &&
          <StatisticsTable
            id="statistics-table"
            options={props.options}
            data={statistics}
            attributeId={attributeId}
            attributeId2={attributeId2}
            attributeFormat={_.get(attributeValue, "attributeFormat") || 0}
            attributeFormat2={_.get(attribute2Value, "attributeFormat") || 0}
            metrics={tableMetrics}
            checked={checked}
            search={search}
            filter={filters}
          />}
        <StatisticsReportModal
          id="statistics-report"
          show={showReportModal}
          downloading={downloading}
          metrics={metrics}
          selectedMetrics={checked}
          attributeId={attributeId}
          attributeId2={attributeId2}
          attributeOptions={attributeOptions}
          attribute2Options={attribute2Options}
          filterOptions={filterOptions}
          filters={FiltersHelper.getFilters(statisticFilters)}
          onClose={() => { setShowReportModal(false); setDownloading(false); }}
          onSubmit={handleReportSubmit}
        />
        <NotificationSystem ref={notificationSystem} />
      </div>
    </div>
  } else {
    return <div className="col-sm-12 pt-3">
      <div className="card mb-2">
        <h3><ErrorContainer message={errorMessage} /></h3>
      </div>
    </div>;
  }

}
export default StatisticsTab;