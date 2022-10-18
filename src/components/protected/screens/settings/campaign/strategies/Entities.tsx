import React, { useEffect, useState } from "react";
import { Form } from "react-bootstrap";
import * as _ from "lodash";
import * as CampaignHelper from "../../../../../../client/CampaignHelper";
import { StrategyRuleConditionProps } from "./StrategyRuleCondition";
import AsyncSelectList from "../../../../../UI/AsyncSelectList";
import { ValidationError } from "../../../../../../client/schemas";
import { EntityCondition } from "../../../../../../models/data/Campaign";

const Entities = (props: StrategyRuleConditionProps) => {
  const [valuesValidation, setValuesValidation] = useState<ValidationError>({ error: false, message: "" });
  const options = CampaignHelper.attributeIdValuesSelectOptions(props.condition as EntityCondition);

  useEffect(() => {
    const ids = _.get(props, "condition.ids", []);
    const valuesValidation = ids.length > 0 ? { error: false, message: "" } : { error: true, message: "Please fill out this field." };
    setValuesValidation(valuesValidation);
    props.onChange(props.condition, !valuesValidation.error);
  }, []);

  const handleValuesChange = (selected) => {
    const selectedValues = (selected || []).map((s) => { return parseInt(s.value); });
    const selectedNames = (selected || []).map((s) => { return s.label; });
    const valuesValidation = (selectedValues || []).length > 0 ? { error: false, message: "" } : { error: true, message: "Please fill out this field." };
    const condition = _.assign({}, props.condition, { ids: selectedValues, displayNames: selectedNames });
    props.onChange(condition, !valuesValidation.error);
    setValuesValidation(valuesValidation);
  }

  const attributeSelectClassNames = props.isList ? "react-select-container multiple bordered" : "react-select-container multiple";
  return <Form.Group>
    <Form.Label>{props.attributeName}</Form.Label>
    <AsyncSelectList
      id={`strategy-rule-condition-entities-${props.strategyId}-${props.index}`}
      writeAccess={props.writeAccess}
      url={`/api/targeting/suggestion/advanced/campaign/${props.campaignId}/attribute/${props.attribute}`}
      creatable={false}
      classNames={attributeSelectClassNames}
      values={options}
      onChange={handleValuesChange}
    />
    {valuesValidation.error && <Form.Control.Feedback type="invalid" style={{ display: "block" }}>{valuesValidation.message}</Form.Control.Feedback>}
  </Form.Group>
}
export default Entities;