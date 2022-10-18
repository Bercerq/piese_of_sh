import React, { useState, Fragment, useEffect, useContext } from "react";
import { Modal, Button, Form, Alert, InputGroup } from "react-bootstrap";
import Select from "react-select";
import CreatableSelect from "react-select/creatable";
import Datetime from "react-datetime";
import momentPropTypes from "react-moment-proptypes";
import * as _ from "lodash";
import validator from "validator";
import moment from "moment";
import * as Validation from "../../../../client/Validation";
import * as Api from "../../../../client/Api";
import * as Helper from "../../../../client/Helper";
import * as FiltersHelper from "../../shared/filters/FiltersHelper";
import { ValidationError, SelectOption, StatisticFilter, GroupOption, ScopeType } from "../../../../client/schemas";
import { Rights, Scope } from "../../../../models/Common";
import { Report, ReportTemplate } from "../../../../models/data/Report";
import { AttributeCollection } from "../../../../models/data/Attribute";
import Loader from "../../../UI/Loader";
import StatisticFilterRow from "../../shared/filters/StatisticFilterRow";
import FontIcon from "../../../UI/FontIcon";
import Checkbox from "../../../UI/Checkbox";
import { AppUser } from "../../../../models/AppUser";
import UserContext from "../../context/UserContext";

interface ReportModalProps {
  show: boolean;
  report: Report | null;
  rights: Rights;
  scope: ScopeType;
  scopeId: number;
  maxLevel: ScopeType;
  writeAccess: boolean;
  handleClose: () => void;
  handleSubmit: (id: number, report: Partial<Report>) => void;
}

const ReportModal = (props: ReportModalProps) => {
  const user: AppUser = useContext<AppUser>(UserContext);
  const id = _.get(props, "report.id", -1);
  const owner = _.get(props, "report.scope.owner", "");
  const reportScope = _.get(props, "report.scope.scope") || "all";
  const reportScopeId = _.get(props, "report.scope.scopeId") || -1;
  const levelOptions = Helper.getLevelOptionsUptoCampaign(props.maxLevel);
  const outputOptions = getOutputOptions();
  const rangeOptions = getRangeOptions();
  const periodOptions = getPeriodOptions();
  const scheduleEveryOptions = getScheduleEveryOptions();

  const [saving, setSaving] = useState<boolean>(false);
  const [showLoader, setShowLoader] = useState<boolean>(false);
  const [name, setName] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [templateId, setTemplateId] = useState<number>(-1);
  const [level, setLevel] = useState<ScopeType>(props.scope);
  const [entityId, setEntityId] = useState<number>(-1);
  const [entityOptions, setEntityOptions] = useState<SelectOption[]>([{ value: -1, label: "" }]);
  const [templateOptions, setTemplateOptions] = useState<SelectOption[]>([{ value: -1, label: "" }]);
  const [output, setOutput] = useState<string>(outputOptions[0].value as "xlsx" | "pdf" | "csv");
  const [range, setRange] = useState<string>(rangeOptions[0].value as string);
  const [unit, setUnit] = useState<"M" | "W" | "D">(periodOptions[0].value as ("M" | "W" | "D"));
  const [unitCount, setUnitCount] = useState<string>("");
  const [rangeStartDate, setRangeStartDate] = useState<momentPropTypes.momentObj | null>(null);
  const [rangeEndDate, setRangeEndDate] = useState<momentPropTypes.momentObj | null>(null);
  const [includeCurrentDay, setIncludeCurrentDay] = useState<boolean>(false);
  const [statisticFilters, setStatisticFilters] = useState<StatisticFilter[]>([]);
  const [filterAttributeCollection, setFilterAttributeCollection] = useState<AttributeCollection>({});
  const [scheduled, setScheduled] = useState<boolean>(false);
  const [scheduleEvery, setScheduleEvery] = useState<string>(scheduleEveryOptions[0].value as string);
  const [startDate, setStartDate] = useState<momentPropTypes.momentObj | null>(null);
  const [endDate, setEndDate] = useState<momentPropTypes.momentObj | null>(null);
  const [emailToOptions, setEmailToOptions] = useState<SelectOption[]>([{value: user.email, label: user.email}]);
  const [nameValidation, setNameValidation] = useState<ValidationError>({ error: false, message: "" });
  const [periodValidation, setPeriodValidation] = useState<ValidationError>({ error: false, message: "" });
  const [rangeValidation, setRangeValidation] = useState<ValidationError>({ error: false, message: "" });
  const [emailValidation, setEmailValidation] = useState<ValidationError>({ error: false, message: "" });
  const [scheduleValidation, setScheduleValidation] = useState<ValidationError>({ error: false, message: "" });

  const handleEntering = async () => {
    setSaving(false);
    setShowLoader(false);
    setNameValidation({ error: false, message: "" });
    setPeriodValidation({ error: false, message: "" });
    setEmailValidation({ error: false, message: "" });
    setScheduleValidation({ error: false, message: "" });
    if (props.report) {
      await loadFilterAttributes(reportScope, reportScopeId);
      setName(props.report.name);
      setDescription(props.report.description);
      setOutput(props.report.output);
      await loadTemplateFields();
      loadDateRangeFields();
      setIncludeCurrentDay(props.report.includeCurrentDay);
      const statisticFilters = FiltersHelper.getStatisticFilters(props.report.filters || []);
      setStatisticFilters(statisticFilters);
      setScheduled(props.report.scheduled);
      setScheduleEvery(props.report.scheduleEvery);
      const scheduleStart = _.get(props, "report.scheduleStart");
      const scheduleEnd = _.get(props, "report.scheduleEnd");
      setStartDate(scheduleStart ? moment(scheduleStart) : null);
      setEndDate(scheduleEnd ? moment(scheduleEnd) : null);
      const emailToOptions = _.get(props, "report.emailTo", []).map((o) => { return { value: o, label: o }; });
      setEmailToOptions(emailToOptions);
    } else {
      setName("");
      setDescription("");
      await loadScopeFields(props.scope);
      await loadTemplateFields();
      setOutput(outputOptions[0].value as "xlsx" | "pdf" | "csv");
      setRange(rangeOptions[0].value as string);
      setUnit(periodOptions[0].value as ("M" | "W" | "D"));
      setUnitCount("");
      setRangeStartDate(null);
      setRangeEndDate(null);
      setIncludeCurrentDay(false);
      setStatisticFilters([]);
      setScheduled(false);
      setScheduleEvery(scheduleEveryOptions[0].value as string);
      let startDate;
      if (moment().hour() < 9) {
        startDate = moment().hour(9).minute(0).second(0);
      } else {
        startDate = moment().add(1, 'day').hour(9).minute(0).second(0);
      }
      setStartDate(startDate);
      setEndDate(startDate);
      setEmailToOptions([{value: user.email, label: user.email}]);
    }
  }

  async function loadFilterAttributes(scope: Scope, scopeId: number) {
    let qs: { scope: Scope, scopeId?: number } = { scope };
    if (scope !== "all") qs.scopeId = scopeId;
    const attributeCollection = await FiltersHelper.getFilterAttributes(qs);
    setFilterAttributeCollection(attributeCollection);
  }

  function getOutputOptions(): SelectOption[] {
    return [
      { value: "xlsx", label: "Excel" },
      { value: "pdf", label: "PDF" },
      { value: "csv", label: "CSV" }
    ];
  }

  function getRangeOptions(): SelectOption[] {
    return [
      { value: "P1D", label: "One day" },
      { value: "P1W", label: "One week" },
      { value: "P2W", label: "Two weeks" },
      { value: "this month", label: "This month" },
      { value: "P1M", label: "One month" },
      { value: "period", label: "Custom period" },
      { value: "range", label: "Custom date range" }
    ];
  }

  function getPeriodOptions(): SelectOption[] {
    return [
      { value: "D", label: "Days" },
      { value: "W", label: "Weeks" },
      { value: "M", label: "Months" },
    ];
  }

  function getScheduleEveryOptions(): SelectOption[] {
    return [
      { value: "P1D", label: "Day" },
      { value: "P1W", label: "Week" },
      { value: "P2W", label: "Two weeks" },
      { value: "P1M", label: "Month" }
    ];
  }

  function getDateRange(): string {
    if (range === "period") {
      return "P" + unitCount + unit;
    } else if (range === "range") {
      return moment(rangeStartDate).format("YYYY-MM-DD") + "/" + (rangeEndDate ? moment(rangeEndDate).format("YYYY-MM-DD") : "");
    } else {
      return range;
    }
  }

  function loadDateRangeFields() {
    const range = _.get(props, "report.dateRange");
    if (range !== undefined) {
      const ranges = rangeOptions.map((o) => { return o.value });
      if (ranges.indexOf(range) > -1) {
        setRange(range);
      } else {
        const parts = range.split('/');
        if (parts.length === 2) {
          setRange("range");
          setRangeStartDate(moment(parts[0]));
          if (parts[1] !== "") {
            setRangeEndDate(moment(parts[1]))
          } else {
            setRangeEndDate(null);
          }
        } else {
          const mDuration = moment.duration(range);
          if (moment.isDuration(mDuration)) {
            setRange("period");
            const days = mDuration.days();
            const weeks = mDuration.weeks();
            const months = mDuration.months();

            if (days > 0) {
              setUnit("D");
              setUnitCount(days.toString());
            } else if (weeks > 0) {
              setUnit("W");
              setUnitCount(weeks.toString());
            } else if (months > 0) {
              setUnit("M");
              setUnitCount(months.toString());
            }
          }
        }
      }
    }
  }

  async function loadTemplateFields() {
    const templates: ReportTemplate[] = await Api.Get({ path: "/api/reportTemplates" });
    const templateOptions = templates.map((o) => { return { value: o.id, label: o.name }; });
    setTemplateOptions(templateOptions);
    if (templates.length > 0) {
      const templateId = _.get(props, "report.templateId", templates[0].id);
      setTemplateId(templateId);
    }
  }

  async function loadScopeFields(level: ScopeType) {
    setShowLoader(true);
    const entityOptions = await Helper.getEntityOptions("reports", props.scope, props.scopeId, level);
    const entityId = (entityOptions.length > 0 ? entityOptions[0].value : -1) as number;
    setLevel(level);
    setEntityOptions(entityOptions);
    setEntityId(entityId);
    await loadFilterAttributes(Helper.getScopeByLevel(level), entityId);
    setShowLoader(false);
  }

  function getScheduleValidation() {
    let scheduleValidation = { error: false, message: "" };
    if (!startDate || !endDate) {
      scheduleValidation = { error: true, message: "Please fill out start/end date" };
    } else {
      if (startDate.isAfter(endDate)) {
        scheduleValidation = { error: true, message: "End date should be same or after start date." };
      }
    }
    return scheduleValidation;
  }

  function save(needsRun: boolean) {
    const nameValidation = Validation.required(name);
    let periodValidation = { error: false, message: "" };
    let rangeValidation = { error: false, message: "" };
    if (range === "period") periodValidation = Validation.required(unitCount);
    if (range === "range" && !rangeStartDate) rangeValidation = { error: true, message: "Start date is required" };
    const scheduleValidation = getScheduleValidation();
    if (nameValidation.error || periodValidation.error || rangeValidation.error || scheduleValidation.error) {
      setNameValidation(nameValidation);
      setPeriodValidation(periodValidation);
      setRangeValidation(rangeValidation);
      setScheduleValidation(scheduleValidation);
    } else {
      setSaving(true);
      const emailTo =  (emailToOptions) ? emailToOptions.map((o) => { return o.value as string; }) : [];
      const dateRange = getDateRange();
      const filters = FiltersHelper.getFilters(statisticFilters);
      if (id > 0) {
        let report: Partial<Report> = {
          templateId,
          name,
          description,
          output,
          dateRange,
          includeCurrentDay,
          filters,
          scheduleEvery,
          emailTo,
          scheduled,
          emailAttachments: true,
          needsRun
        };
        if (startDate) report.scheduleStart = startDate.utc().format();
        if (endDate) report.scheduleEnd = endDate.utc().format();
        props.handleSubmit(id, report);
      } else {
        const scope = Helper.getScopeByLevel(level);
        let report: Partial<Report> = {
          templateId,
          name,
          description,
          scope: {
            scope,
            scopeId: null
          },
          output,
          dateRange,
          includeCurrentDay,
          filters,
          scheduleEvery,
          emailTo,
          scheduled,
          emailAttachments: true,
          needsRun
        };
        if (level !== "root") {
          report.scope.scopeId = entityId;
        }
        if (startDate) report.scheduleStart = startDate.utc().format();
        if (endDate) report.scheduleEnd = endDate.utc().format();
        props.handleSubmit(id, report);
      }
    }
  }

  const handleNameChange = (e) => {
    const name = e.target.value;
    const nameValidation = Validation.required(name);
    setName(name);
    setNameValidation(nameValidation);
  }

  const handleLevelChange = async (selected) => {
    await loadScopeFields(selected.value as ScopeType);
  }

  const handleEntityChange = async (selected) => {
    const entityId = selected.value as number;
    await loadFilterAttributes(Helper.getScopeByLevel(level), entityId);
    setEntityId(entityId);
  }

  const handleUnitCountChange = (e) => {
    const unitCount = e.target.value;
    setUnitCount(unitCount);
    if (range === "period") {
      const periodValidation = Validation.required(unitCount);
      setPeriodValidation(periodValidation);
    } else {
      setPeriodValidation({ error: false, message: "" });
    }
  }

  const handleRangeStartDateChange = (date) => {
    setRangeStartDate(date);
    if (!date) {
      setRangeValidation({ error: true, message: "Start date is required" });
    } else {
      setRangeValidation({ error: false, message: "" });
    }
  }

  const handleRangeEndDateChange = (date) => {
    setRangeEndDate(date);
  }

  const handleStartDateChange = (date) => {
    setStartDate(date);
  }

  const handleEndDateChange = (date) => {
    setEndDate(date);
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
  const addEmailIfNotPresent = () => {
    if (!emailToOptions) {
      setEmailToOptions([{value: user.email, label: user.email} ])
    }
    else if ( !emailToOptions.find(option => option.value == user.email)) {
      setEmailToOptions([...emailToOptions, {value: user.email, label: user.email} ])
    }
  }
  const clearFiltersClick = () => {
    setStatisticFilters([]);
  }

  const handleEmailToChange = (values: any, actionMeta: any) => {
    if (actionMeta.action === "create-option") {
      if (values.length > 0) {
        const latestValue = values[values.length - 1].value;
        const newValues = latestValue.split(/[\s,]+/);
        const [valid, invalid] = _.partition(newValues, (v) => { return validator.isEmail(v); });
        if (valid.length > 0) {
          const newOptions = valid.map((v) => { return { value: v, label: v }; });
          const emailOptions = values.slice(0, values.length - 1).concat(newOptions);
          setEmailToOptions(emailOptions);
        }
        if (invalid.length > 0) {
          setEmailValidation({ error: true, message: `Incorrect email format for "${invalid.join(",")}"` });
        } else {
          setEmailValidation({ error: false, message: "" });
        }
      }
    } else {
      setEmailToOptions(values);
      setEmailValidation({ error: false, message: "" });
    }
  }

  const filterOptions: (GroupOption | SelectOption)[] = ([{ value: -1, label: "Select dimension" }] as (GroupOption | SelectOption)[]).concat(Helper.attributeIdOptions(filterAttributeCollection));

  return <Modal size="lg" show={props.show} onHide={props.handleClose} onEntering={handleEntering} backdrop="static">
    <Modal.Header closeButton>
      <Modal.Title>Report settings</Modal.Title>
    </Modal.Header>
    <Modal.Body>
      <div className="row no-gutters">
        <div className="col-lg-12 px-1">
          <Form.Group controlId="report-name">
            <Form.Label>Name *</Form.Label>
            <Form.Control
              autoFocus
              readOnly={!props.writeAccess}
              isInvalid={nameValidation.error}
              type="text"
              value={name}
              onChange={handleNameChange}
            />
            {
              nameValidation.error &&
              <Form.Control.Feedback type="invalid">{nameValidation.message}</Form.Control.Feedback>
            }
          </Form.Group>
          <Form.Group controlId="report-description">
            <Form.Label>Description</Form.Label>
            <Form.Control as="textarea"
              autoFocus
              disabled={!props.writeAccess}
              type="text"
              rows="3"
              value={description}
              onChange={(e) => { setDescription((e.target as any).value as string); }}
            />
          </Form.Group>
        </div>
      </div>
      <div className="row no-gutters">
        {id === -1 &&
          <div className="col-lg-6 px-1">
            <Form.Group controlId="report-scope">
              <Form.Label>Level:</Form.Label>
              <Select
                inputId="react-select-report-scope"
                className="react-select-container"
                classNamePrefix="react-select"
                clearable={false}
                value={levelOptions.find((o) => { return o.value === level })}
                onChange={handleLevelChange}
                options={levelOptions}
              />
            </Form.Group>
          </div>
        }
        {level !== "root" && id === -1 &&
          <div className="col-lg-6 px-1">
            <Loader visible={showLoader} loaderClass="loading-input" />
            {!showLoader &&
              <Form.Group controlId="report-entity">
                <Form.Label>{Helper.getLabelByScopeType(level)}</Form.Label>
                <Select
                  inputId="react-select-report-entity"
                  className="react-select-container"
                  classNamePrefix="react-select"
                  value={entityOptions.find((o) => { return o.value === entityId })}
                  clearable={false}
                  onChange={handleEntityChange}
                  options={entityOptions}
                />
              </Form.Group>
            }
          </div>
        }
        {id > 0 && <Fragment>
          <div className="col-lg-6 px-1">
            <Form.Group controlId="report-level">
              <Form.Label>Level:</Form.Label>
              <Form.Control
                disabled={true}
                type="text"
                value={Helper.getLabelByScope(reportScope)}
              />
            </Form.Group>
          </div>
          <div className="col-lg-6 px-1">
            <Form.Group controlId="report-owner">
              <Form.Label>Entity:</Form.Label>
              <Form.Control
                disabled={true}
                type="text"
                value={owner}
              />
            </Form.Group>
          </div>
        </Fragment>
        }
      </div>
      <div className="row no-gutters">
        <div className="col-lg-6 px-1">
          <Form.Group controlId="report-template">
            <Form.Label>Template:</Form.Label>
            <Select
              inputId="react-select-report-template"
              className="react-select-container"
              classNamePrefix="react-select"
              clearable={false}
              isDisabled={!props.writeAccess}
              value={templateOptions.find((o) => { return o.value === templateId })}
              onChange={(selected: SelectOption) => { setTemplateId(selected.value as number); }}
              options={templateOptions}
            />
          </Form.Group>
        </div>
        <div className="col-lg-6 px-1">
          <Form.Group controlId="report-output">
            <Form.Label>Output:</Form.Label>
            <Select
              inputId="react-select-report-output"
              className="react-select-container"
              classNamePrefix="react-select"
              clearable={false}
              isDisabled={!props.writeAccess}
              value={outputOptions.find((o) => { return o.value === output })}
              onChange={(selected: SelectOption) => { setOutput(selected.value as string); }}
              options={outputOptions}
            />
          </Form.Group>
        </div>
        {output === "csv" && <div className="col-lg-12 px-1">
          <Alert variant="info">
            <FontIcon name="info-circle" /> <strong>Note: </strong> only the first table of a template is outputted as CSV.
          </Alert>
        </div>
        }
      </div>
      <div className="row no-gutters">
        <div className="col-lg-12 px-1">
          <Form.Group controlId="report-range">
            <Form.Label>Range:</Form.Label>
            <Select
              inputId="react-select-report-range"
              className="react-select-container"
              classNamePrefix="react-select"
              clearable={false}
              isDisabled={!props.writeAccess}
              value={rangeOptions.find((o) => { return o.value === range })}
              onChange={(selected: SelectOption) => { setRange(selected.value as string); }}
              options={rangeOptions}
            />
          </Form.Group>
        </div>
      </div>
      {range === "period" &&
        <div className="row no-gutters">
          <div className="col-lg-6 px-1">
            <Form.Group>
              <Form.Control
                id="range-unit-count"
                readOnly={!props.writeAccess}
                required
                type="number"
                min="0"
                isInvalid={periodValidation.error}
                value={unitCount}
                onChange={handleUnitCountChange}
              />
              {
                periodValidation.error &&
                <Form.Control.Feedback type="invalid">{periodValidation.message}</Form.Control.Feedback>
              }
            </Form.Group>
          </div>
          <div className="col-lg-6 px-1">
            <Select
              inputId="react-select-unit"
              isDisabled={!props.writeAccess}
              className="react-select-container"
              classNamePrefix="react-select"
              onChange={(selected: SelectOption) => { setUnit(selected.value as "M" | "W" | "D"); }}
              value={periodOptions.find((o) => { return o.value === unit })}
              options={periodOptions}
            />
          </div>
        </div>
      }
      {range === "range" &&
        <div className="row no-gutters">
          <div className="col-lg-6 px-1 pb-2">
            <Form.Label>Start date</Form.Label>
            <InputGroup>
              <InputGroup.Prepend>
                <InputGroup.Text><FontIcon name="calendar" /></InputGroup.Text>
              </InputGroup.Prepend>
              <Datetime
                inputProps={{ disabled: !props.writeAccess }}
                dateFormat="YYYY-MM-DD"
                timeFormat={false}
                onChange={handleRangeStartDateChange}
                value={rangeStartDate}
              />
              {
                rangeValidation.error &&
                <Form.Control.Feedback type="invalid">{rangeValidation.message}</Form.Control.Feedback>
              }
            </InputGroup>
          </div>
          <div className="col-lg-6 px-1 pb-2">
            <Form.Label>End date</Form.Label>
            <InputGroup>
              <InputGroup.Prepend>
                <InputGroup.Text><FontIcon name="calendar" /></InputGroup.Text>
              </InputGroup.Prepend>
              <Datetime
                inputProps={{ disabled: !props.writeAccess }}
                dateFormat="YYYY-MM-DD"
                timeFormat={false}
                onChange={handleRangeEndDateChange}
                value={rangeEndDate}
              />
            </InputGroup>
          </div>
        </div>
      }
      <div className="row no-gutters">
        <div className="col-lg-12 px-1">
          <Form.Group>
            <Checkbox
              id="report-include-current"
              disabled={!props.writeAccess}
              checked={includeCurrentDay}
              onChange={(checked) => { setIncludeCurrentDay(checked) }}
            >
              Include current day
            </Checkbox>
          </Form.Group>
          <Form.Group>
            <Form.Label>Filters:</Form.Label>
            <div>
              {
                statisticFilters.map((statisticFilter, i) => <StatisticFilterRow
                  key={`filter-${i}`}
                  index={i}
                  filter={statisticFilter}
                  writeAccess={props.writeAccess}
                  attributes={filterOptions}
                  onChange={statisticFilterChange}
                  onDelete={statisticFilterDelete}
                />)
              }
            </div>
            <button className="mr-2 btn btn-primary btn-xs" disabled={!props.writeAccess} onClick={addFilterClick}><FontIcon name="plus" /> ADD FILTER</button>
            {statisticFilters.length > 0 && <button className="btn btn-primary btn-xs" disabled={!props.writeAccess} onClick={clearFiltersClick}><FontIcon name="remove" /> CLEAR FILTERS</button>}
          </Form.Group>
        </div>
        <div className="col-lg-12 pb-2 px-1">
          <div className="font-weight-bold">Scheduling</div>
        </div>
        <div className="col-lg-12 px-1">
          <Form.Group>
            <Checkbox
              id="report-scheduled"
              disabled={!props.writeAccess}
              checked={scheduled}
              onChange={(checked) => { setScheduled(checked) }}
            >
              Active
            </Checkbox>
          </Form.Group>
          <Form.Group controlId="report-schedule-every">
            <Form.Label>Run every:</Form.Label>
            <Select
              inputId="react-select-report-schedule-every"
              className="react-select-container"
              classNamePrefix="react-select"
              clearable={false}
              isDisabled={!props.writeAccess}
              value={scheduleEveryOptions.find((o) => { return o.value === scheduleEvery })}
              onChange={(selected: SelectOption) => { setScheduleEvery(selected.value as string); }}
              options={scheduleEveryOptions}
            />
          </Form.Group>
        </div>
      </div>
      <div className="row no-gutters">
        <div className="col-lg-6 px-1">
          <Form.Label>Start date</Form.Label>
          <InputGroup>
            <InputGroup.Prepend>
              <InputGroup.Text><FontIcon name="calendar" /></InputGroup.Text>
            </InputGroup.Prepend>
            <Datetime
              inputProps={{ disabled: !props.writeAccess }}
              dateFormat="YYYY-MM-DD"
              timeFormat="HH:mm"
              onChange={handleStartDateChange}
              value={startDate}
            />
            {
              scheduleValidation.error &&
              <Form.Control.Feedback type="invalid">{scheduleValidation.message}</Form.Control.Feedback>
            }
          </InputGroup>
        </div>
        <div className="col-lg-6 px-1">
          <Form.Label>End date</Form.Label>
          <InputGroup>
            <InputGroup.Prepend>
              <InputGroup.Text><FontIcon name="calendar" /></InputGroup.Text>
            </InputGroup.Prepend>
            <Datetime
              inputProps={{ disabled: !props.writeAccess }}
              dateFormat="YYYY-MM-DD"
              timeFormat="HH:mm"
              onChange={handleEndDateChange}
              value={endDate}
            />
          </InputGroup>
        </div>
      </div>
      <div className="row no-gutters">
        <div className="col-lg-12 pb-2 px-1">
          <div className="font-weight-bold">Email</div>
        </div>
        <div className="col-lg-12 px-1">

          <Form.Group controlId="report-emailto">
            <Form.Label>To:</Form.Label>
            <CreatableSelect
              className="react-select-container multiple"
              classNamePrefix="react-select"
              isClearable
              isDisabled={!props.writeAccess}
              isMulti
              onChange={handleEmailToChange}
              value={emailToOptions}
            />
            {
              emailValidation.error &&
              <Form.Control.Feedback type="invalid">{emailValidation.message}</Form.Control.Feedback>
            }
          </Form.Group>
          <button className="mr-2 btn btn-primary btn-xs" disabled={!props.writeAccess} onClick={addEmailIfNotPresent}><FontIcon name="plus" /> ADD ME</button>
        </div>
      </div>
    </Modal.Body>
    <Modal.Footer>
      <Button variant="light" size="sm" onClick={props.handleClose}>CANCEL</Button>
      <Button variant="primary" size="sm" onClick={() => { save(false); }} disabled={saving || !props.writeAccess}>SAVE</Button>
      <Button variant="primary" size="sm" onClick={() => { save(true); }} disabled={saving || !props.writeAccess}>SAVE AND RUN NOW</Button>
    </Modal.Footer>
  </Modal>;
}
export default ReportModal;