import React, { Fragment, useEffect, useState } from "react";
import { Form } from "react-bootstrap";
import Select from "react-select";
import * as _ from "lodash";
import * as Validation from "../../../../../../client/Validation";
import * as CampaignHelper from "../../../../../../client/CampaignHelper";
import { SelectOption, ValidationError } from "../../../../../../client/schemas";
import { StrategyRuleConditionProps } from "./StrategyRuleCondition";
import { PeriodType, RulePeriodType, StrategyRuleConditionType, UserInteractionEventType } from "../../../../../../models/data/Campaign";

const UserInteraction = (props: StrategyRuleConditionProps) => {
  const initialTime = _.get(props, "condition.inPast.time", 30);
  const [eventType, setEventType] = useState<UserInteractionEventType>(_.get(props, "condition.event", "IMPRESSION"));
  const [radioValue, setRadioValue] = useState<"inPast" | "sinceStartOf">(getRadioValue());
  const [time, setTime] = useState<number>(initialTime);
  const [timeUnit, setTimeUnit] = useState<RulePeriodType>(_.get(props, "condition.inPast.timeUnit", "DAY"));
  const [sinceStartOf, setSinceStartOf] = useState<PeriodType>(_.get(props, "condition.sinceStartOf", "DAY"));
  const [minimum, setMinimum] = useState<number>(_.get(props, "condition.minimum", null));
  const [timeValidation, setTimeValidation] = useState<ValidationError>({ error: false, message: "" });
  const [minimumValidation, setMinimumValidation] = useState<ValidationError>(Validation.required(_.toString(_.get(props, "condition.minimum", null))));

  useEffect(() => {
    const condition = getCondition();
    const isValid = getIsValidCondition();
    props.onChange(condition, isValid);
  }, [JSON.stringify({ eventType, radioValue, time, timeUnit, sinceStartOf, minimum, timeValidation, minimumValidation })])

  function getEventTypeOptions(): SelectOption[] {
    return [
      { value: "IMPRESSION", label: "Impression" },
      { value: "CLICK", label: "Click" },
      { value: "CONVERSION", label: "Conversion" }
    ];
  }

  function getRadioOptions(): SelectOption[] {
    return [
      { value: "inPast", label: "Last x time" },
      { value: "sinceStartOf", label: "Since fixed time" }
    ];
  }

  function getRadioValue() {
    const sinceStartOfValue = _.get(props, "condition.sinceStartOf");
    return _.isUndefined(sinceStartOfValue) ? "inPast" : "sinceStartOf";
  }

  function getSinceStartOfOptions(): SelectOption[] {
    return [
      { value: "DAY", label: "Today" },
      { value: "WEEK", label: "Start of week" },
      { value: "MONTH", label: "Start of month" },
      { value: "ALL", label: "Start of campaign" },
    ];
  }

  function getCondition(): StrategyRuleConditionType {
    if (radioValue === "sinceStartOf") {
      return {
        minimum,
        event: eventType,
        sinceStartOf,
        doneBy: "CAMPAIGN"
      }
    } else {
      return {
        minimum,
        event: eventType,
        inPast: {
          time,
          timeUnit
        },
        doneBy: "CAMPAIGN"
      }
    }
  }

  function getIsValidCondition(): boolean {
    if (radioValue === "sinceStartOf") {
      return !minimumValidation.error;
    } else {
      return !(minimumValidation.error || timeValidation.error);
    }
  }

  const eventTypeChange = (selected) => {
    setEventType(selected.value as UserInteractionEventType);
  }

  const handleRadioChange = (e) => {
    if (e.target.checked) {
      const radioValue = e.target.value;
      setRadioValue(radioValue);
    }
  }

  const handleTimeChange = (e) => {
    const time = e.target.value !== "" ? parseInt(e.target.value, 10) : null;
    const timeValidation = Validation.native(e.target);
    setTime(time);
    setTimeValidation(timeValidation);
  }

  const handleTimeUnitChange = (selected) => {
    setTimeUnit(selected.value as RulePeriodType);
  }

  const sinceStartOfChange = (selected) => {
    setSinceStartOf(selected.value as PeriodType);
  }

  const handleMinimumChange = (e) => {
    const minimum = e.target.value !== "" ? parseInt(e.target.value, 10) : null;
    const minimumValidation = Validation.native(e.target);
    setMinimum(minimum);
    setMinimumValidation(minimumValidation);
  }

  const eventTypeOptions = getEventTypeOptions();
  const radioOptions = getRadioOptions();
  const timeUnitOptions = CampaignHelper.timeUnitOptions();
  const sinceStartOfOptions = getSinceStartOfOptions();

  return <Fragment>
    <div className="row no-gutters">
      <div className="col-lg-12 px-1">
        <Form.Group>
          <Form.Label>Event type</Form.Label>
          <Select
            inputId={`strategy-rule-condition-ui-event-type-${props.strategyId}-${props.index}`}
            className="react-select-container"
            classNamePrefix="react-select"
            isDisabled={!props.writeAccess}
            name="strategy-rule-condition-ui-event-type"
            value={eventTypeOptions.find((o) => { return o.value === eventType })}
            clearable={false}
            onChange={eventTypeChange}
            options={eventTypeOptions}
          />
        </Form.Group>
        <Form.Group className="pt-1">
          {
            radioOptions.map((o, i) => <Form.Check inline
              id={`strategy-rule-condition-ui-radio-${props.strategyId}-${props.index}-${o.value}`}
              type="radio"
              value={o.value}
              disabled={!props.writeAccess}
              name={`strategy-rule-condition-ui-radio-${props.strategyId}-${props.index}`}
              checked={o.value === radioValue}
              onChange={handleRadioChange}
              label={o.label} />)
          }
        </Form.Group>
      </div>
    </div>
    {radioValue === "inPast" &&
      <div className="row no-gutters">
        <div className="col-lg-6 px-1">
          <Form.Group>
            <Form.Label>Period</Form.Label>
            <Form.Control
              id={`strategy-rule-condition-ui-inpast-time-${props.strategyId}-${props.index}`}
              disabled={!props.writeAccess}
              required
              type="number"
              min="0"
              value={_.toString(time)}
              isInvalid={timeValidation.error}
              onChange={handleTimeChange}
            />
            {timeValidation.error && <Form.Control.Feedback type="invalid">{timeValidation.message}</Form.Control.Feedback>}
          </Form.Group>
        </div>
        <div className="col-lg-6 px-1">
          <Form.Group style={{ marginTop: "27px" }}>
            <Select
              inputId={`strategy-rule-condition-ui-inpast-period-${props.strategyId}-${props.index}`}
              className="react-select-container"
              classNamePrefix="react-select"
              clearable={false}
              isDisabled={!props.writeAccess}
              value={timeUnitOptions.find((o) => { return o.value === timeUnit })}
              onChange={handleTimeUnitChange}
              options={timeUnitOptions}
            />
          </Form.Group>
        </div>
      </div>
    }
    {radioValue === "sinceStartOf" &&
      <div className="row no-gutters">
        <div className="col-lg-12 px-1">
          <Form.Group>
            <Form.Label>Period</Form.Label>
            <Select
              inputId={`strategy-rule-condition-ui-since-period-${props.strategyId}-${props.index}`}
              className="react-select-container"
              classNamePrefix="react-select"
              isDisabled={!props.writeAccess}
              value={sinceStartOfOptions.find((o) => { return o.value === sinceStartOf })}
              clearable={false}
              onChange={sinceStartOfChange}
              options={sinceStartOfOptions}
            />
          </Form.Group>
        </div>
      </div>
    }
    <div className="row no-gutters">
      <div className="col-lg-12 px-1">
        <Form.Group>
          <Form.Label>Number of events within time period</Form.Label>
          <Form.Control
            id={`strategy-rule-condition-ui-minimum-${props.strategyId}-${props.index}`}
            disabled={!props.writeAccess}
            required
            type="number"
            min="0"
            value={_.toString(minimum)}
            isInvalid={minimumValidation.error}
            onChange={handleMinimumChange}
          />
          {minimumValidation.error && <Form.Control.Feedback type="invalid">{minimumValidation.message}</Form.Control.Feedback>}
        </Form.Group>
      </div>
    </div>
  </Fragment>;
}
export default UserInteraction;