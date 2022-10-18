import React, { Fragment, useEffect, useState } from "react";
import { Button } from "react-bootstrap";
import * as _ from "lodash";
import * as Helper from "../../../../../../client/Helper";
import * as CampaignHelper from "../../../../../../client/CampaignHelper";
import * as StrategiesHelper from "./StrategiesHelper";
import { AdvancedRulesBoxFormData, AdvancedRulesBoxProps } from "../../../../../../client/campaignSchemas";
import SettingsBox from "../shared/SettingsBox";
import { AttributeCollection } from "../../../../../../models/data/Attribute";
import { Scope } from "../../../../../../models/Common";
import { StrategyRule } from "../../../../../../models/data/Campaign";
import StrategyRuleRow from "./StrategyRuleRow";
import Loader from "../../../../../UI/Loader";
import FontIcon from "../../../../../UI/FontIcon";
import { ScopeType } from "../../../../../../client/schemas";

const AdvancedRulesBox = (props: AdvancedRulesBoxProps) => {
  const initialValidations = (props.advancedRules || []).map((rule) => { return true; });
  const [attributeCollection, setAttributeCollection] = useState<AttributeCollection>({});
  const [advancedRules, setAdvancedRules] = useState<StrategyRule[]>(props.advancedRules || []);
  const [validations, setValidations] = useState<boolean[]>(initialValidations);
  const [listModalScope, setListModalScope] = useState<ScopeType>("advertiser");
  const [listModalScopeId, setListModalScopeId] = useState<number>(props.advertiserId);
  const [listModalMaxLevel, setListModalMaxLevel] = useState<ScopeType>("advertiser");
  const [showLoader, setShowLoader] = useState<boolean>(true);
  const [newRuleId, setNewRuleId] = useState<number>(0);
  const attributes = Helper.attributeOptions(attributeCollection);

  const submitData = getSubmitData();
  const isValid = getIsValid();

  useEffect(() => { loadForm(); }, [props.id]);

  useEffect(() => { props.onChange(submitData, isValid); }, [JSON.stringify(submitData), isValid]);

  async function loadForm() {
    setShowLoader(true);
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
    setAdvancedRules(props.advancedRules || []);
    setValidations(initialValidations);
    setShowLoader(false);
  }

  function getSubmitData(): AdvancedRulesBoxFormData {
    return {
      advancedRules: StrategiesHelper.setNullIds(advancedRules)
    }
  }

  function getIsValid(): boolean {
    return validations.indexOf(false) < 0;
  }

  function getNewRule(): StrategyRule {
    const firstOption = Helper.firstGroupSelectOption(attributes);
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

  const handleRulesChange = (i: number, rule: StrategyRule, isValid: boolean) => {
    let updatedRules = _.cloneDeep(advancedRules);
    updatedRules[i] = rule;
    let updatedValidations = validations.concat();
    updatedValidations[i] = isValid;
    setAdvancedRules(updatedRules);
    setValidations(updatedValidations);
  }

  const handleRulesDelete = (i: number) => {
    const updatedRules = _.cloneDeep(advancedRules);
    const updatedValidations = validations.concat();
    if (updatedRules.length > 0 && updatedValidations.length > 0) {
      updatedRules.splice(i, 1);
      updatedValidations.splice(i, 1);
    }
    setAdvancedRules(updatedRules);
    setValidations(updatedValidations);
  }

  const handleRuleAdd = () => {
    const updatedRules = _.cloneDeep(advancedRules);
    updatedRules.push(getNewRule());
    const updatedValidations = validations.concat();
    updatedValidations.push(true);
    setAdvancedRules(updatedRules);
    setValidations(updatedValidations);
  }

  const writeAccess = props.rights.MANAGE_CAMPAIGN || false;

  return <SettingsBox title="Advanced rules">
    <Loader visible={showLoader} />
    {!showLoader && <Fragment>
      {
        advancedRules.map((rule, i) => <StrategyRuleRow
          key={rule.ruleId}
          index={i}
          rule={rule}
          campaignId={props.id}
          strategyId="advanced-rules"
          attributes={attributes}
          writeAccess={writeAccess}
          createLists={props.rights.MANAGE_LISTS}
          listModalScope={listModalScope}
          listModalScopeId={listModalScopeId}
          listModalMaxLevel={listModalMaxLevel}
          maxBidPrice={props.maxBidPrice}
          onDelete={handleRulesDelete}
          onChange={handleRulesChange}
        />)
      }
      <div className="row no-gutters">
        <div className="col-lg-12 pr-2 pb-2 pt-3">
          <div className="pull-right">
            <Button disabled={!writeAccess} size="sm" variant="primary" onClick={handleRuleAdd}><FontIcon name="plus" /> CREATE ADVANCED RULE</Button>
          </div>
        </div>
      </div>
    </Fragment>
    }
  </SettingsBox>;
}
export default AdvancedRulesBox;