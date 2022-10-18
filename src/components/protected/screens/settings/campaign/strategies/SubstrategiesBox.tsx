import React, { Fragment, useEffect, useState } from "react";
import { Button } from "react-bootstrap";
import * as _ from "lodash";
import * as Helper from "../../../../../../client/Helper";
import * as CampaignHelper from "../../../../../../client/CampaignHelper";
import * as StrategiesHelper from "./StrategiesHelper";
import { SubstrategiesBoxFormData, SubstrategiesBoxProps } from "../../../../../../client/campaignSchemas";
import { AttributeCollection } from "../../../../../../models/data/Attribute";
import { Strategy, StrategyRule } from "../../../../../../models/data/Campaign";
import Checkbox from "../../../../../UI/Checkbox";
import { Scope } from "../../../../../../models/Common";
import { ScopeType } from "../../../../../../client/schemas";
import StrategyRow from "./StrategyRow";
import Loader from "../../../../../UI/Loader";
import FontIcon from "../../../../../UI/FontIcon";

const SubstrategiesBox = (props: SubstrategiesBoxProps) => {
  const initialStrategiesValidations = getInitialStrategiesValidations();
  const initialRulesValidations = getInitialRulesValidations();
  const [distributeUsers, setDistributeUsers] = useState<boolean>(props.distributeUsers);
  const [redistributeBudget, setRedistributeBudget] = useState<boolean>(props.redistributeBudget);
  const [useDataFeed, setUseDataFeed] = useState<boolean>(props.useDataFeed)
  const [attributeCollection, setAttributeCollection] = useState<AttributeCollection>({});
  const [strategies, setStrategies] = useState<Strategy[]>(props.strategies);
  const [strategiesValidations, setStrategiesValidations] = useState<boolean[]>(initialStrategiesValidations);
  const [rulesValidations, setRulesValidations] = useState<boolean[][]>(initialRulesValidations);
  const [listModalScope, setListModalScope] = useState<ScopeType>("advertiser");
  const [listModalScopeId, setListModalScopeId] = useState<number>(props.advertiserId);
  const [listModalMaxLevel, setListModalMaxLevel] = useState<ScopeType>("advertiser");
  const [showLoader, setShowLoader] = useState<boolean>(true);
  const attributes = Helper.attributeOptions(attributeCollection);
  const submitData = getSubmitData();
  const isValid = getIsValid();

  useEffect(() => { loadForm(); }, [props.id]);

  useEffect(() => { props.onChange(submitData, isValid); }, [JSON.stringify(submitData), isValid]);

  async function loadForm() {
    setShowLoader(true);
    setDistributeUsers(props.distributeUsers);
    setRedistributeBudget(props.redistributeBudget);
    setStrategies(props.strategies);
    setStrategiesValidations(initialStrategiesValidations);
    setRulesValidations(initialRulesValidations);
    const options = {
      scope: "campaign" as Scope,
      scopeId: props.id,
      video: props.videoCampaign ? "true" : "false"
    }
    const attributeCollection = await StrategiesHelper.getTargetingAttributes(options);
    setAttributeCollection(attributeCollection);
    if (props.rights.MANAGE_LISTS) {
      const listModalMaxLevel = await CampaignHelper.getListModalMaxLevel(props.user, props.advertiserId);
      setListModalMaxLevel(listModalMaxLevel);
      setListModalScope("advertiser");
      setListModalScopeId(props.advertiserId);
    }
    setShowLoader(false);
  }

  function getSubmitData(): SubstrategiesBoxFormData {
    return {
      distributeUsers,
      redistributeBudget,
      useDataFeed: useDataFeed,
      strategies: setStrategyRulesNullIds(strategies)
    }
  }

  function setStrategyRulesNullIds(strategies: Strategy[]) {
    return strategies.map((s) => {
      const rules = StrategiesHelper.setNullIds(s.rules);
      return _.assign({}, s, { rules });
    });
  }

  function getIsValid(): boolean {
    const strategiesValid = strategiesValidations.indexOf(false) < 0;
    const rulesValid = _.flatten(rulesValidations).indexOf(false) < 0;
    return strategiesValid && rulesValid;
  }

  function getInitialStrategiesValidations(): boolean[] {
    return (props.strategies || []).map((s) => { return true });
  }

  function getInitialRulesValidations(): boolean[][] {
    return (props.strategies || []).map((s) => {
      return (s.rules || []).map((r) => { return true; });
    });
  }

  const handleStrategyChange = (i: number, strategy: Strategy, isValid: boolean) => {
    let updatedStrategies = _.cloneDeep(strategies);
    updatedStrategies[i] = strategy;
    let updatedValidations = strategiesValidations.concat();
    updatedValidations[i] = isValid;
    console.log(JSON.stringify(strategy))
    setStrategies(updatedStrategies);
    setStrategiesValidations(updatedValidations);
  }

  const handleStrategyDelete = (i: number) => {
    const updatedStrategies = _.cloneDeep(strategies);
    const updatedValidations = strategiesValidations.concat();
    const updatedRulesValidations = rulesValidations.concat();
    updatedStrategies.splice(i, 1);
    updatedValidations.splice(i, 1);
    updatedRulesValidations.splice(i, 1);
    setStrategies(updatedStrategies);
    setStrategiesValidations(updatedValidations);
    setRulesValidations(updatedRulesValidations);
  }

  const handleStrategyAdd = () => {
    if (strategies.length === 0) {
      const newStrategies: Strategy[] = [
        {
          name: "A",
          percentage: 50,
          rules: []
        },
        {
          name: "B",
          percentage: 50,
          rules: []
        }
      ];
      setStrategies(newStrategies);
      setStrategiesValidations([true, true]);
      setRulesValidations([[], []]);
    } else {
      const newStrategy = {
        name: "",
        percentage: null,
        rules: []
      }
      const updatedStrategies = _.cloneDeep(strategies);
      updatedStrategies.push(newStrategy);
      setStrategies(updatedStrategies);
      const updatedStrategiesValidations = strategiesValidations.concat();
      updatedStrategiesValidations.push(true);
      setStrategiesValidations(updatedStrategiesValidations);
      const updatedRulesValidations = rulesValidations.concat();
      updatedRulesValidations.push([]);
      setRulesValidations(updatedRulesValidations);
    }
  }

  const handleRuleChange = (strategyIndex: number, ruleIndex: number, rule: StrategyRule, isValid: boolean) => {
    let updatedStrategies = _.cloneDeep(strategies);
    updatedStrategies[strategyIndex].rules[ruleIndex] = rule;
    let updatedRulesValidations = rulesValidations.concat();
    updatedRulesValidations[strategyIndex][ruleIndex] = isValid;
    setStrategies(updatedStrategies);
    setRulesValidations(updatedRulesValidations);
  }

  const handleRuleDelete = (strategyIndex: number, ruleIndex: number) => {
    let updatedStrategies = _.cloneDeep(strategies);
    let updatedRulesValidations = rulesValidations.concat();
    updatedStrategies[strategyIndex].rules.splice(ruleIndex, 1);
    setStrategies(updatedStrategies);
    updatedRulesValidations[strategyIndex].splice(ruleIndex, 1);
    setRulesValidations(updatedRulesValidations);
  }

  const handleRuleAdd = (strategyIndex: number, rule: StrategyRule) => {
    let updatedStrategies = _.cloneDeep(strategies);
    let updatedRulesValidations = rulesValidations.concat();
    updatedStrategies[strategyIndex].rules.push(rule);
    setStrategies(updatedStrategies);
    updatedRulesValidations[strategyIndex].push(true);
    setRulesValidations(updatedRulesValidations);
  }

  const writeAccess = props.rights.MANAGE_CAMPAIGN || false;

  return <Fragment>
    <Loader visible={showLoader} />
    {!showLoader && <Fragment>
      <div className="col-lg-12 pb-3">
        <h5>Sub-strategies and A/B testing</h5>
      </div>
      <div className="col-lg-12">
        <Checkbox id="settings-strategies-distribute-users"
          checked={distributeUsers}
          disabled={!writeAccess}
          onChange={setDistributeUsers}>A/B testing (Distribute users using budget percentages)
      </Checkbox>
        <Checkbox id="settings-strategies-redistribute-budget"
          checked={!redistributeBudget}
          disabled={!writeAccess}
          onChange={(checked) => { setRedistributeBudget(!checked); }}>Do not redistribute unspent budget between sub-strategies
      </Checkbox>
      <Checkbox id="settings-strategies-use-datafeeds"
          checked={useDataFeed}
          disabled={!writeAccess}
          onChange={ setUseDataFeed}> Allow data feeds in strategies
             </Checkbox>
      </div>
      <div className="col-lg-12">
        {
          strategies.map((strategy, i) => <StrategyRow
            index={i}
            campaignId={props.id}
            strategy={strategy}
            attributes={attributes}
            writeAccess={writeAccess}
            createLists={props.rights.MANAGE_LISTS}
            listModalScope={listModalScope}
            listModalScopeId={listModalScopeId}
            listModalMaxLevel={listModalMaxLevel}
            maxBidPrice={props.maxBidPrice}
            useDataFeeds={useDataFeed}
            dynamicFeeds={props.dataFeeds}
            dynamicFeedId={strategy?.datafeed?.id}
            dynamicFeedKey={strategy?.datafeed?.key}            
            onChange={handleStrategyChange}
            onDelete={handleStrategyDelete}
            onRuleChange={handleRuleChange}
            onRuleDelete={handleRuleDelete}
            onRuleAdd={handleRuleAdd}
          />)
        }
      </div>
      <div className="col-lg-12 text-center">
        <Button variant="primary" size="sm" className="mr-2" disabled={!writeAccess} onClick={handleStrategyAdd}><FontIcon name="plus" /> CREATE SUB-STRATEGY</Button>
      </div>
    </Fragment>}
  </Fragment>
}
export default SubstrategiesBox;