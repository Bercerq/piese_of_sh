import React, { useEffect, useState } from "react";
import { Form, InputGroup, Button } from "react-bootstrap";
import * as _ from "lodash";
import * as Helper from "../../../../../../client/Helper";
import * as Validation from "../../../../../../client/Validation";
import { Strategy, StrategyRule } from "../../../../../../models/data/Campaign";
import FontIcon from "../../../../../UI/FontIcon";
import { GroupOption, ScopeType, ValidationError } from "../../../../../../client/schemas";
import StrategyRuleRow from "./StrategyRuleRow";
import Select from "react-select";
import {CreativeFeed} from "../../../../../../models/data/CreativeFeed"

interface StrategyRowProps {
  index: number;
  campaignId: number;
  strategy: Strategy;
  attributes: GroupOption[];
  writeAccess: boolean;
  createLists: boolean;
  listModalScope: ScopeType;
  listModalScopeId: number;
  listModalMaxLevel: ScopeType;
  useDataFeeds: boolean;
  dynamicFeeds: CreativeFeed[];
  dynamicFeedId?: number;
  dynamicFeedKey?: string;
  maxBidPrice: number;
  onDelete: (i: number) => void;
  onChange: (i: number, strategy: Strategy, isValid: boolean) => void;
  onRuleChange: (strategyIndex: number, ruleIndex: number, rule: StrategyRule, isValid: boolean) => void;
  onRuleDelete: (strategyIndex: number, ruleIndex: number) => void;
  onRuleAdd: (strategyIndex: number, rule: StrategyRule) => void;
}

const StrategyRow = (props: StrategyRowProps) => {
  const [nameValidation, setNameValidation] = useState<ValidationError>({ error: false, message: "" });
  const [percentageValidation, setPercentageValidation] = useState<ValidationError>({ error: false, message: "" });
  const [newRuleId, setNewRuleId] = useState<number>(0);
  const name = _.get(props, "strategy.name");
  const percentage = _.get(props, "strategy.percentage");
  const rules = _.get(props, "strategy.rules", []);
  const key = _.get(props, "strategy.datafeed.key");
  const dataFeedId = _.get(props, "strategy.datafeed.id");
  const dynamicFeedsOptions = [{"label" : "None", "value": null},
   ...props.dynamicFeeds.map( feed => { return {"label" : feed.name, "value": feed.id}})]

  useEffect(() => {
    const nameValidation = Validation.required(name || "");
    const percentageValidation = Validation.required(_.toString(percentage));
    setNameValidation(nameValidation);
    setPercentageValidation(percentageValidation);
    props.onChange(props.index, props.strategy, !(nameValidation.error || percentageValidation.error));
  }, []);

  const handleNameChange = (e) => {
    const name = e.target.value;
    const nameValidation = Validation.native(e.target);
    const strategy = _.assign({}, props.strategy, { name });
    props.onChange(props.index, strategy, !(nameValidation.error || percentageValidation.error));
    setNameValidation(nameValidation);
  }

  const handlePercentageChange = (e) => {
    const percentage = e.target.value.trim() !== "" ? parseFloat(e.target.value) : null;
    const percentageValidation = Validation.native(e.target);
    const strategy = _.assign({}, props.strategy, { percentage });
    props.onChange(props.index, strategy, !(nameValidation.error || percentageValidation.error));
    setPercentageValidation(percentageValidation);
  }

  const handleRulesChange = (i: number, rule: StrategyRule, isValid: boolean) => {
    props.onRuleChange(props.index, i, rule, isValid);
  }

  const handleDataFeedChange = (e) => {
    const dataFeedId = e.value;
    const dataFeed = _.assign({}, (props.strategy?.datafeed) ? props.strategy.datafeed : {}, { id: dataFeedId});
    const strategy = _.assign({}, props.strategy, { "datafeed": dataFeed });
    props.onChange(props.index, strategy, true);
  }

  const handleDataFeedKeyChange= (e) => {
    const dataFeedKey :string = e.target.value;
    const dataFeed = _.assign({}, (props.strategy?.datafeed) ? props.strategy.datafeed : {}, 
    { key: (dataFeedKey.trim() == "")? null : dataFeedKey.trim()});
    const strategy = _.assign({}, props.strategy, { "datafeed" : dataFeed});
    props.onChange(props.index, strategy, true);
  }

  const handleRulesDelete = (i: number) => {
    props.onRuleDelete(props.index, i);
  }

  const handleRuleAdd = () => {
    props.onRuleAdd(props.index, getNewRule());
  }

  function getNewRule(): StrategyRule {
    const firstOption = Helper.firstGroupSelectOption(props.attributes);
    const ruleId = newRuleId - 1;
    setNewRuleId(ruleId);
    return {
      ruleId,
      attribute: firstOption.value as string,
      condition: { values: [], displayNames: [] },
      consequence: {
        action: "REQUIRED"
      }
    }
  }

  return <div className="strategy mb-2">
    <div className="card">
      <div className="card-header">
        <div className="row no-gutters">
          <div className="col-lg-6 px-2">
            <Form.Group controlId={`settings-strategies-name-${props.index}`}>
              <Form.Label>Strategy</Form.Label>
              <Form.Control
                type="text"
                value={name}
                required={true}
                disabled={!props.writeAccess}
                maxLength={64}
                isInvalid={nameValidation.error}
                onChange={handleNameChange}
              />
              {nameValidation.error && <Form.Control.Feedback type="invalid">{nameValidation.message}</Form.Control.Feedback>}
            </Form.Group>
          </div>
          <div className="col-lg-6 px-2">
            <Form.Label>Apply to % budget</Form.Label>
            <InputGroup>
              <InputGroup.Prepend>
                <InputGroup.Text>%</InputGroup.Text>
              </InputGroup.Prepend>
              <Form.Control
                disabled={!props.writeAccess}
                id={`settings-strategies-percentage-${props.index}`}
                required
                type="number"
                min="0"
                step="0.01"
                isInvalid={percentageValidation.error}
                value={_.toString(percentage)}
                onChange={handlePercentageChange}
              />
              {percentageValidation.error && <Form.Control.Feedback type="invalid">{percentageValidation.message}</Form.Control.Feedback>}
            </InputGroup>
          </div>
        </div>
        {(props.useDataFeeds) ?
          <div className="row no-gutters">
            <div className="col-lg-6 px-2">
              <Form.Group>
                <Form.Label>Data feed</Form.Label>
                <Select
                  inputId={`strategy-rule-data-feed-${props.index}`}
                  isDisabled={!props.writeAccess}
                  className="react-select-container"
                  classNamePrefix="react-select"
                  name="data-feed-select"
                  value={dynamicFeedsOptions.find((o) => { return o.value === dataFeedId })}
                  clearable={false}
                  options={dynamicFeedsOptions}
                  onChange={handleDataFeedChange}
                />
                {<Form.Control.Feedback type="invalid" style={{ display: "block" }}>{ }</Form.Control.Feedback>}
              </Form.Group>
            </div>
            <div className="col-lg-6 px-2">
              <Form.Group controlId={`settings-data-key-${props.index}`}>
                <Form.Label>Data key</Form.Label>
                <Form.Control
                  type="text"
                  value={key}
                  required={false}
                  disabled={!props.writeAccess}
                  maxLength={64}
                  placeholder="Not fixed (dynamic)"
                  onChange={handleDataFeedKeyChange}
                />
                {nameValidation.error && <Form.Control.Feedback type="invalid">{nameValidation.message}</Form.Control.Feedback>}
              </Form.Group>
            </div> 
            </div> 
            : null}
      </div>
      <div className="card-body">
       
        {
          rules.map((rule, i) => <StrategyRuleRow
            key={rule.ruleId}
            index={i}
            rule={rule}
            campaignId={props.campaignId}
            strategyId={`settings-strategies-${props.index}`}
            attributes={props.attributes}
            writeAccess={props.writeAccess}
            createLists={props.createLists}
            maxBidPrice={props.maxBidPrice}
            listModalScope={props.listModalScope}
            listModalScopeId={props.listModalScopeId}
            listModalMaxLevel={props.listModalMaxLevel}
            onDelete={handleRulesDelete}
            onChange={handleRulesChange}
          />)
        }
        <div className="row no-gutters">
          <div className="col-lg-12 pr-2 pb-2 pt-3">
            <div className="pull-left">
              <Button size="sm" variant="secondary" disabled={!props.writeAccess} onClick={() => { props.onDelete(props.index) }}><FontIcon name="remove" /> DELETE SUB-STRATEGY</Button>
            </div>
            <div className="pull-right">
              <Button size="sm" variant="primary" disabled={!props.writeAccess} onClick={handleRuleAdd}><FontIcon name="plus" /> CREATE RULE</Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div >
}
export default StrategyRow;