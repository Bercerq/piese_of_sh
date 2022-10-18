import React, { useEffect, useState } from "react";
import { Form } from "react-bootstrap";
import Select from "react-select";
import * as _ from "lodash";
import * as Validation from "../../../../../../client/Validation";
import * as CampaignHelper from "../../../../../../client/CampaignHelper";
import { StrategyRuleConditionProps } from "./StrategyRuleCondition";
import AsyncSelectList from "../../../../../UI/AsyncSelectList";
import { ValidationError } from "../../../../../../client/schemas";
import { RulePeriodType, SegmentCondition } from "../../../../../../models/data/Campaign";

const Segments = (props: StrategyRuleConditionProps) => {
  const [valuesValidation, setValuesValidation] = useState<ValidationError>({ error: false, message: "" });
  const [timeValidation, setTimeValidation] = useState<ValidationError>({ error: false, message: "" });
  const options = CampaignHelper.attributeIdValuesSelectOptions(props.condition as SegmentCondition);
  const time = _.get(props, "condition.addedInPast.time");
  const timeUnit = _.get(props, "condition.addedInPast.timeUnit");

  useEffect(() => {
    const ids = _.get(props, "condition.ids", []);
    if (ids.length === 0) {
      const valuesValidation = ids.length > 0 ? { error: false, message: "" } : { error: true, message: "Please fill out this field." };
      setValuesValidation(valuesValidation);
      const condition = _.assign({}, props.condition, { addedInPast: { time: time || 30, timeUnit: timeUnit || "DAY" } });
      props.onChange(condition, !valuesValidation.error);
    }
  }, []);

  const handleValuesChange = (selected) => {
    const selectedValues = (selected || []).map((s) => { return parseInt(s.value); });
    const selectedNames = (selected || []).map((s) => { return s.label; });
    const valuesValidation = (selectedValues || []).length > 0 ? { error: false, message: "" } : { error: true, message: "Please fill out this field." };
    const condition = _.assign({}, props.condition, { ids: selectedValues, displayNames: selectedNames });
    props.onChange(condition, !valuesValidation.error && !timeValidation.error);
    setValuesValidation(valuesValidation);
  }

  const handleTimeChange = (e) => {
    const timeValue = e.target.value !== "" ? parseInt(e.target.value, 10) : null;
    const timeValidation = Validation.native(e.target);
    const condition = _.assign({}, props.condition, { addedInPast: { time: timeValue, timeUnit } });
    props.onChange(condition, !valuesValidation.error && !timeValidation.error);
    setTimeValidation(timeValidation);
  }

  const handleTimeUnitChange = (selected) => {
    const condition = _.assign({}, props.condition, { addedInPast: { time, timeUnit: selected.value as RulePeriodType } });
    props.onChange(condition, !valuesValidation.error && !timeValidation.error);
  }

  const timeUnitOptions = CampaignHelper.timeUnitOptions();

  return <div className="row no-gutters">
    <div className="col-lg-12 px-1">
      <Form.Group>
        <Form.Label>{props.attributeName}</Form.Label>
        <AsyncSelectList
          id={`strategy-rule-condition-segments-${props.strategyId}-${props.index}`}
          writeAccess={props.writeAccess}
          url={`/api/targeting/suggestion/advanced/campaign/${props.campaignId}/attribute/${props.attribute}`}
          creatable={false}
          classNames="react-select-container multiple"
          values={options}
          onChange={handleValuesChange}
        />
        {valuesValidation.error && <Form.Control.Feedback type="invalid" style={{ display: "block" }}>{valuesValidation.message}</Form.Control.Feedback>}
      </Form.Group>
    </div>
    <div className="col-lg-6 px-1">
      <Form.Group>
        <Form.Label>Period</Form.Label>
        <Form.Control
          id={`strategy-rule-condition-segments-time-${props.strategyId}-${props.index}`}
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
          inputId={`strategy-rule-condition-segments-period-${props.strategyId}-${props.index}`}
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
  </div>;
}
export default Segments;