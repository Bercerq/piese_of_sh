import React, { Fragment, useEffect, useState } from "react";
import { Form, InputGroup } from "react-bootstrap";
import NumberFormat from "react-number-format";
import Select from "react-select";
import * as _ from "lodash";
import * as StrategiesHelper from "./StrategiesHelper";
import * as Validation from "../../../../../../client/Validation";
import { SelectOption, ValidationError } from "../../../../../../client/schemas";
import { StrategyRuleActionType, StrategyRuleConsequenceType } from "../../../../../../models/data/Campaign";

interface StrategyRuleConsequenceProps {
  index: number;
  options: SelectOption[];
  strategyId: string | number;
  consequence: StrategyRuleConsequenceType;
  writeAccess: boolean;
  maxBidPrice: number;
  onChange: (consequence: StrategyRuleConsequenceType, isValid: boolean) => void;
}

const StrategyRuleConsequence = (props: StrategyRuleConsequenceProps) => {
  const action = _.get(props, "consequence.action") as StrategyRuleActionType;
  const limitBid = _.get(props, "consequence.limitBid");
  const increaseBidPercentage = _.get(props, "consequence.increaseBidPercentage");
  const decreaseBidPercentage = _.get(props, "consequence.decreaseBidPercentage");

  const [increaseBidValidationError, setIncreaseBidValidationError] = useState<ValidationError>({ error: false, message: "" });
  const [decreaseBidValidationError, setDecreaseBidValidationError] = useState<ValidationError>({ error: false, message: "" });
  const [limitBidValidationError, setLimitBidValidationError] = useState<ValidationError>({ error: false, message: "" });

  useEffect(() => {
    if (action === "LIMIT_BID") {
      const limitBidValidation = Validation.limitBid(limitBid, props.maxBidPrice);
      setLimitBidValidationError(limitBidValidation);
      props.onChange(props.consequence, !limitBidValidation.error);
    }
  }, [props.maxBidPrice]);

  const selectChange = (selected) => {
    const action = selected.value as StrategyRuleActionType;
    if (action === "REQUIRED" || action === "NO_BID") {
      props.onChange({ action }, true);
    } else if (action === "LIMIT_BID") {
      const limitBidValidation = Validation.limitBid(limitBid, props.maxBidPrice);
      setLimitBidValidationError(limitBidValidation);
      props.onChange({ action }, !limitBidValidation.error);
    } else if (action === "INCREASE_BID_PERCENTAGE") {
      const increaseBidValidation = Validation.required(_.toString(increaseBidPercentage));
      setIncreaseBidValidationError(increaseBidValidation);
      props.onChange({ action }, !increaseBidValidation.error);
    } else if (action === "DECREASE_BID_PERCENTAGE") {
      const decreaseBidValidation = Validation.required(_.toString(decreaseBidPercentage));
      setDecreaseBidValidationError(decreaseBidValidation);
      props.onChange({ action }, !decreaseBidValidation.error);
    }
  }

  const handleLimitBidChange = (values) => {
    const limitBid = _.get(values, "floatValue") as number;
    const consequence = StrategiesHelper.getRuleConsequence(action, limitBid);
    const limitBidValidation = Validation.limitBid(limitBid, props.maxBidPrice);
    setLimitBidValidationError(limitBidValidation);
    props.onChange(consequence, !limitBidValidation.error);
  }

  const handleIncreaseBidChange = (e) => {
    const increaseBidPercentage = e.target.value.trim() !== "" ? parseFloat(e.target.value) : null;
    const increaseBidValidation = Validation.native(e.target);
    const consequence = StrategiesHelper.getRuleConsequence(action, increaseBidPercentage);
    setIncreaseBidValidationError(increaseBidValidation);
    props.onChange(consequence, !increaseBidValidation.error);
  }

  const handleDecreaseBidChange = (e) => {
    const decreaseBidPercentage = e.target.value.trim() !== "" ? parseFloat(e.target.value) : null;
    const decreaseBidValidation = Validation.native(e.target);
    const consequence = StrategiesHelper.getRuleConsequence(action, decreaseBidPercentage);
    setDecreaseBidValidationError(decreaseBidValidation);
    props.onChange(consequence, !decreaseBidValidation.error);
  }

  const limitBidInputClass = limitBidValidationError.error ? "form-control is-invalid" : "form-control";
  return <Fragment>
    <Form.Group>
      <Form.Label>Bid</Form.Label>
      <Select
        isDisabled={!props.writeAccess}
        inputId={`strategy-rule-consequence-${props.strategyId}-${props.index}`}
        className="react-select-container"
        classNamePrefix="react-select"
        name="consequence-select"
        value={props.options.find((o) => { return o.value === action })}
        clearable={false}
        onChange={selectChange}
        options={props.options}
      />
    </Form.Group>
    {action === "LIMIT_BID" &&
      <InputGroup>
        <InputGroup.Prepend>
          <InputGroup.Text>€</InputGroup.Text>
        </InputGroup.Prepend>
        <NumberFormat
          disabled={!props.writeAccess}
          id={`strategy-rule-limit-bid-${props.strategyId}-${props.index}`}
          className={limitBidInputClass}
          value={limitBid}
          thousandSeparator={true}
          allowNegative={false}
          allowLeadingZeros={false}
          decimalScale={2}
          fixedDecimalScale={true}
          onValueChange={handleLimitBidChange}
        />
        {limitBidValidationError.error && <Form.Control.Feedback type="invalid">{limitBidValidationError.message}</Form.Control.Feedback>}
      </InputGroup>
    }
    {action === "INCREASE_BID_PERCENTAGE" && <InputGroup>
      <InputGroup.Prepend>
        <InputGroup.Text>%</InputGroup.Text>
      </InputGroup.Prepend>
      <Form.Control
        disabled={!props.writeAccess}
        id={`strategy-rule-increase-bid-${props.strategyId}-${props.index}`}
        required
        type="number"
        min="0"
        max="10000"
        step="0.01"
        isInvalid={increaseBidValidationError.error}
        value={_.toString(increaseBidPercentage)}
        onChange={handleIncreaseBidChange}
      />
      {increaseBidValidationError.error && <Form.Control.Feedback type="invalid">{increaseBidValidationError.message}</Form.Control.Feedback>}
    </InputGroup>}
    {action === "DECREASE_BID_PERCENTAGE" && <InputGroup>
      <InputGroup.Prepend>
        <InputGroup.Text>%</InputGroup.Text>
      </InputGroup.Prepend>
      <Form.Control
        disabled={!props.writeAccess}
        id={`strategy-rule-decrease-bid-${props.strategyId}-${props.index}`}
        required
        type="number"
        min="0"
        max="100"
        step="0.01"
        isInvalid={decreaseBidValidationError.error}
        value={_.toString(decreaseBidPercentage)}
        onChange={handleDecreaseBidChange}
      />
      {decreaseBidValidationError.error && <Form.Control.Feedback type="invalid">{decreaseBidValidationError.message}</Form.Control.Feedback>}
    </InputGroup>}
  </Fragment>
}
export default StrategyRuleConsequence;