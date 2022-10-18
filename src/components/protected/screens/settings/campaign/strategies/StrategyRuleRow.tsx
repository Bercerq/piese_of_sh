import React, { useState } from "react";
import { Form, Tooltip, OverlayTrigger } from "react-bootstrap";
import Select from "react-select";
import * as _ from "lodash";
import * as Helper from "../../../../../../client/Helper";
import { GroupOption, ScopeType, SelectOption } from "../../../../../../client/schemas";
import { StrategyRule } from "../../../../../../models/data/Campaign";
import FontIcon from "../../../../../UI/FontIcon";
import StrategyRuleConsequence from "./StrategyRuleConsequence";
import StrategyRuleCondition from "./StrategyRuleCondition";

interface StrategyRuleRowProps {
  index: number;
  rule: StrategyRule;
  campaignId: number;
  strategyId: string | number;
  attributes: GroupOption[];
  writeAccess: boolean;
  createLists: boolean;
  listModalScope: ScopeType;
  listModalScopeId: number;
  listModalMaxLevel: ScopeType;
  maxBidPrice: number;
  onDelete: (i: number) => void;
  onChange: (i: number, rule: StrategyRule, isValid: boolean) => void;
}

const StrategyRuleRow = (props: StrategyRuleRowProps) => {
  const [isConsequenceValid, setIsConsequenceValid] = useState<boolean>(true);
  const [isConditionValid, setIsConditionValid] = useState<boolean>(true);

  function getConsequenceOptions(): SelectOption[] {
    return [
      { value: "REQUIRED", label: "Required for bid" },
      { value: "LIMIT_BID", label: "Bid no more than" },
      { value: "INCREASE_BID_PERCENTAGE", label: "Increase bid" },
      { value: "DECREASE_BID_PERCENTAGE", label: "Decrease bid" },
      { value: "NO_BID", label: "No bid" },
    ]
  }
  const attributeChange = (selected) => {
    const rule: StrategyRule = _.assign({}, props.rule, { attribute: selected.value, condition: { values: [], displayNames: [] } });
    props.onChange(props.index, rule, (isConsequenceValid && isConditionValid));
  }

  const consequenceChange = (consequence, isValid) => {
    const rule: StrategyRule = _.assign({}, props.rule, { consequence });
    setIsConsequenceValid(isValid);
    props.onChange(props.index, rule, isValid && isConditionValid);
  }

  const conditionChange = (condition, isValid) => {
    const rule: StrategyRule = _.assign({}, props.rule, { condition });
    setIsConditionValid(isValid);
    props.onChange(props.index, rule, isValid && isConsequenceValid);
  }

  const removeClick = (e) => {
    e.preventDefault();
    if (props.writeAccess) {
      props.onDelete(props.index);
    }
  }

  const attribute = _.get(props, "rule.attribute", "");
  const attributeValue = Helper.findGroupSelectOption(props.attributes, attribute) as any;
  const isList = _.get(attributeValue, "isList", false);
  const acceptAnyValue = _.get(attributeValue, "acceptAnyValue", false);
  const listsAllowed = _.get(attributeValue, "listsAllowed", false);
  const attributeName = _.get(attributeValue, "label", "");
  const consequenceOptions = getConsequenceOptions();
  const consequence = _.get(props, "rule.consequence");
  const condition = _.get(props, "rule.condition");
  const deleteTooltip = <Tooltip id={`strategy-rule-delete-tooltip-${props.strategyId}-${props.index}`}>delete rule</Tooltip>;
  const popperConfig = Helper.getPopperConfig();

  return <div className="strategy-rule">
    <div className="row no-gutters">
      <div className="col-lg-12 px-2">
        <OverlayTrigger placement="top" overlay={deleteTooltip} popperConfig={popperConfig}>
          <a href="" className="table-btn-lg pull-right" onClick={removeClick}><FontIcon name="remove" /></a>
        </OverlayTrigger>
      </div>
    </div>
    <div className="row no-gutters">
      <div className="col-lg-3 px-2">
        <Form.Group>
          <Form.Label>{isList && <FontIcon name="list" />} Condition</Form.Label>
          <Select
            isDisabled={!props.writeAccess}
            inputId={`react-select-strategy-rule-attribute-${props.strategyId}-${props.index}`}
            className="react-select-container"
            classNamePrefix="react-select"
            name="attribute-select"
            value={attributeValue}
            clearable={false}
            onChange={attributeChange}
            options={props.attributes}
          />
        </Form.Group>
      </div>
      <div className="col-lg-3 px-2">
        <StrategyRuleConsequence
          index={props.index}
          writeAccess={props.writeAccess}
          strategyId={props.strategyId}
          options={consequenceOptions}
          consequence={consequence}
          maxBidPrice={props.maxBidPrice}
          onChange={consequenceChange}
        />
      </div>
      <div className="col-lg-6 px-2">
        <StrategyRuleCondition
          index={props.index}
          writeAccess={props.writeAccess}
          strategyId={props.strategyId}
          campaignId={props.campaignId}
          condition={condition}
          attribute={attribute}
          attributeName={attributeName}
          acceptAnyValue={acceptAnyValue}
          listsAllowed={listsAllowed}
          isList={isList}
          createLists={props.createLists}
          listModalScope={props.listModalScope}
          listModalScopeId={props.listModalScopeId}
          listModalMaxLevel={props.listModalMaxLevel}
          onChange={conditionChange}
        />
      </div>
    </div>
  </div>;
}
export default StrategyRuleRow;