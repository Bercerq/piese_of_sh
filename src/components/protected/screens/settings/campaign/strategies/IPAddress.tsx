import React, { Fragment, useEffect, useState } from "react";
import { Form } from "react-bootstrap";
import CreatableSelect from "react-select/creatable";
import * as _ from "lodash";
import * as Utils from "../../../../../../client/Utils";
import * as Validation from "../../../../../../client/Validation";
import * as CampaignHelper from "../../../../../../client/CampaignHelper";
import { StrategyRuleConditionProps } from "./StrategyRuleCondition";
import { ValidationError } from "../../../../../../client/schemas";

const IPAddress = (props: StrategyRuleConditionProps) => {
  const [ipValidation, setIpValidation] = useState<ValidationError>({ error: false, message: "" });
  const [valuesWarning, setValuesWarning] = useState<string>("");
  const values = _.get(props, "condition.values", []);
  const displayNames = _.get(props, "condition.displayNames", []);
  const ipAddresses = CampaignHelper.attributeValueNameSelectOptions({ values, displayNames });

  useEffect(() => {
    const ipValidation = Validation.required(values);
    setIpValidation(ipValidation);
    props.onChange(props.condition, !ipValidation.error);
  }, []);

  const handleValuesChange = (inputValues: any, actionMeta: any) => {
    if (actionMeta.action === "create-option") {
      if (inputValues.length > 0) {
        const latestValue = inputValues[inputValues.length - 1].value;
        const newValues = latestValue.split(/[\s,]+/);
        const [valid, invalid] = _.partition(newValues, (v) => { return Utils.isValidIp(v); });
        const valuesWarning = invalid.length > 0 ? `Incorrect ip format for "${invalid.join(",")}"` : "";
        setValuesWarning(valuesWarning);
        const selectedValues = values.concat(valid);
        const valuesValidation = Validation.required(selectedValues);
        setIpValidation(valuesValidation);
        if (valid.length > 0) {
          const condition = _.assign({}, props.condition, { values: selectedValues, displayNames: selectedValues });
          props.onChange(condition, !valuesValidation.error);
        }
      }
    } else {
      setValuesWarning("");
      const selectedValues = (inputValues || []).map((s) => { return s.value; });
      const selectedNames = (inputValues || []).map((s) => { return s.label; });
      const valuesValidation = Validation.required(selectedValues);
      const condition = _.assign({}, props.condition, { values: selectedValues, displayNames: selectedNames });
      props.onChange(condition, !valuesValidation.error);
      setIpValidation(valuesValidation);
    }
  }

  return <Fragment>
    <Form.Group>
      <Form.Label>Ip address</Form.Label>
      <CreatableSelect
        className="react-select-container"
        inputId={`strategy-rule-condition-ip-${props.strategyId}-${props.index}`}
        classNamePrefix="react-select"
        placeholder="e.g. 123.123.123.123 or 123.123.123.*"
        isClearable
        isDisabled={!props.writeAccess}
        isMulti
        value={ipAddresses}
        onChange={handleValuesChange}
      />
      {valuesWarning !== "" && <div className="text-warning pt-2">{valuesWarning}</div>}
      {ipValidation.error && <Form.Control.Feedback type="invalid" style={{ display: "block" }}>{ipValidation.message}</Form.Control.Feedback>}
    </Form.Group>
  </Fragment>
}
export default IPAddress;