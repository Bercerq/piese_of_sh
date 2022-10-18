import React, { Fragment, useEffect, useState } from "react";
import { Form } from "react-bootstrap";
import * as _ from "lodash";
import * as Validation from "../../../../../../client/Validation";
import * as CampaignHelper from "../../../../../../client/CampaignHelper";
import { StrategyRuleConditionProps } from "./StrategyRuleCondition";
import { ValidationError } from "../../../../../../client/schemas";
import AsyncSelectList from "../../../../../UI/AsyncSelectList";

const Cities = (props: StrategyRuleConditionProps) => {
  const [citiesValidation, setCitiesValidation] = useState<ValidationError>({ error: false, message: "" });
  const [radiusValidation, setRadiusValidation] = useState<ValidationError>({ error: false, message: "" });
  const values = _.get(props, "condition.values", []);
  const displayNames = _.get(props, "condition.displayNames", []);
  const radius = _.get(props, "condition.radius", 0);
  const cities = CampaignHelper.attributeValueNameSelectOptions({ values, displayNames });

  useEffect(() => {
    const citiesValidation = Validation.required(values);
    setCitiesValidation(citiesValidation);
    props.onChange(props.condition, !citiesValidation.error);
  }, []);

  const handleValuesChange = (selected) => {
    const selectedValues = (selected || []).map((s) => { return s.value; });
    const selectedNames = (selected || []).map((s) => { return s.label; });
    const valuesValidation = Validation.required(selectedValues);
    const condition = _.assign({}, props.condition, { values: selectedValues, displayNames: selectedNames, radius });
    props.onChange(condition, !(valuesValidation.error || radiusValidation.error));
    setCitiesValidation(valuesValidation);
  }

  const handleRadiusChange = (e) => {
    const radius = e.target.value.trim() !== "" ? parseFloat(e.target.value) : 0;
    const radiusValidation = Validation.native(e.target);
    const condition = _.assign({}, props.condition, { values, displayNames, radius });
    props.onChange(condition, !(citiesValidation.error || radiusValidation.error));
    setRadiusValidation(radiusValidation);
  }

  return <Fragment>
    <Form.Group>
      <Form.Label>City</Form.Label>
      <AsyncSelectList
        id={`strategy-rule-condition-cities-${props.strategyId}-${props.index}`}
        writeAccess={props.writeAccess}
        url={`/api/targeting/suggestion/advanced/campaign/${props.campaignId}/attribute/${props.attribute}`}
        placeholder=""
        values={cities}
        onChange={handleValuesChange}
      />
      {citiesValidation.error && <Form.Control.Feedback type="invalid" style={{ display: "block" }}>{citiesValidation.message}</Form.Control.Feedback>}
    </Form.Group>
    <Form.Group>
      <Form.Label>Target around these cities (radius in km)</Form.Label>
      <Form.Control
        id={`strategy-rule-condition-radius-${props.strategyId}-${props.index}`}
        type="number"
        min="0"
        step="0.01"
        disabled={!props.writeAccess}
        isInvalid={radiusValidation.error}
        value={_.toString(radius)}
        onChange={handleRadiusChange}
      />
      {radiusValidation.error && <Form.Control.Feedback type="invalid">{radiusValidation.message}</Form.Control.Feedback>}
    </Form.Group>
  </Fragment>
}
export default Cities;