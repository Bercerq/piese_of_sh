import React, { Fragment, useEffect, useState } from "react";
import { Form } from "react-bootstrap";
import Select from "react-select";
import CreatableSelect from "react-select/creatable";
import * as _ from "lodash";
import * as Utils from "../../../../../../client/Utils";
import * as Validation from "../../../../../../client/Validation";
import * as CampaignHelper from "../../../../../../client/CampaignHelper";
import { StrategyRuleConditionProps } from "./StrategyRuleCondition";
import { ValidationError } from "../../../../../../client/schemas";

const PostalCodes = (props: StrategyRuleConditionProps) => {
  const [postalCodesValidation, setPostalCodesValidation] = useState<ValidationError>({ error: false, message: "" });
  const postalCodeCountries = Utils.countries();
  const countryCode = _.get(props, "condition.countryCode", "NL");
  const values = _.get(props, "condition.values", []);
  const displayNames = _.get(props, "condition.displayNames", []);
  const postalCodes = CampaignHelper.attributeValueNameSelectOptions({ values, displayNames });

  useEffect(() => {
    const postalCodesValidation = Validation.required(values);
    setPostalCodesValidation(postalCodesValidation);
    const condition = _.assign({}, props.condition, { countryCode });
    props.onChange(condition, !postalCodesValidation.error);
  }, []);

  const handlePostalCodeCountryChange = (selected) => {
    const condition = _.assign({}, props.condition, { countryCode: selected.value });
    props.onChange(condition, !postalCodesValidation.error);
  }
  
  const handleValuesChange = (inputValues: any, actionMeta: any) => {
    if (actionMeta.action === "create-option") {
      if (inputValues.length > 0) {
        const latestValue = inputValues[inputValues.length - 1].value;
        const newValues = latestValue.split(/[\s]+/);
        const selectedValues = values.concat(newValues);
        const selectedNames = displayNames.concat(newValues);
        const postalCodesValidation = Validation.required(selectedValues);
        const condition = _.assign({}, props.condition, { values: selectedValues, displayNames: selectedNames });
        props.onChange(condition, !postalCodesValidation.error);
        setPostalCodesValidation(postalCodesValidation);
      }
    } else {
      const selectedValues = (inputValues || []).map((s) => { return s.value; });
      const selectedNames = (inputValues || []).map((s) => { return s.label; });
      const postalCodesValidation = Validation.required(selectedValues);
      const condition = _.assign({}, props.condition, { values: selectedValues, displayNames: selectedNames });
      props.onChange(condition, !postalCodesValidation.error);
      setPostalCodesValidation(postalCodesValidation);
    }
  }

  return <Fragment>
    <Form.Group>
      <Form.Label>Country</Form.Label>
      <Select
        inputId={`strategy-rule-condition-postalcode-country-${props.strategyId}-${props.index}`}
        className="react-select-container"
        classNamePrefix="react-select"
        isDisabled={!props.writeAccess}
        onChange={handlePostalCodeCountryChange}
        value={postalCodeCountries.find((o) => { return o.value === countryCode })}
        options={postalCodeCountries}
      />
    </Form.Group>
    <Form.Group>
      <Form.Label>Postal codes</Form.Label>
      <CreatableSelect
        className="react-select-container"
        inputId={`strategy-rule-condition-postalcode-values-${props.strategyId}-${props.index}`}
        classNamePrefix="react-select"
        placeholder=" "
        isClearable
        isDisabled={!props.writeAccess}
        isMulti
        value={postalCodes}
        onChange={handleValuesChange}
      />
      {postalCodesValidation.error && <Form.Control.Feedback type="invalid" style={{ display: "block" }}>{postalCodesValidation.message}</Form.Control.Feedback>}
    </Form.Group>
  </Fragment>
}
export default PostalCodes;