import * as _ from "lodash";
import * as Api from "../../../../../../client/Api";
import { AdvancedRulesBoxFormData, AdvancedRulesBoxProps, AdvancedRulesTabProps, SubstrategiesBoxFormData, SubstrategiesBoxProps } from "../../../../../../client/campaignSchemas";
import { AppUser } from "../../../../../../models/AppUser";
import { Rights, Scope } from "../../../../../../models/Common";
import { AttributeCollection } from "../../../../../../models/data/Attribute";
import { CampaignSettings, StrategyRule, StrategyRuleActionType, StrategyRuleConsequenceType } from "../../../../../../models/data/Campaign";

// export const getAdvancedRulesTabProps = (data: CampaignSettings, rights: Rights, user: AppUser): AdvancedRulesTabProps => {
//   return {
//     advancedRulesBox: getAdvancedRulesBoxProps(data, rights, user)
//   };
// }

export const getAdvancedRulesBoxProps = (data: CampaignSettings, maxBidPrice: number, rights: Rights, user: AppUser, onChange: (data: AdvancedRulesBoxFormData, isValid: boolean) => void): AdvancedRulesBoxProps => {
  return {
    id: _.get(data, "campaign.id"),
    advertiserId: _.get(data, "campaign.advertiserId"),
    videoCampaign: _.get(data, "campaign.videoCampaign"),
    advancedRules: _.get(data, "settings.targeting.advancedRules.rules", []),
    maxBidPrice,
    rights,
    user,
    onChange
  }
}

export const getSubstrategiesBoxProps = (data: CampaignSettings, maxBidPrice: number, rights: Rights, user: AppUser, onChange: (data: SubstrategiesBoxFormData, isValid: boolean) => void): SubstrategiesBoxProps => {
  return {
    id: _.get(data, "campaign.id"),
    advertiserId: _.get(data, "campaign.advertiserId"),
    videoCampaign: _.get(data, "campaign.videoCampaign"),
    distributeUsers: _.get(data, "campaign.distributeUsers", false),
    redistributeBudget: _.get(data, "campaign.redistributeBudget", false),
    useDataFeed: _.get(data, "campaign.useDataFeed", false),
    dataFeeds: _.get(data, "settings.dataFeeds", []),
    strategies: _.get(data, "settings.targeting.strategies", []),
    maxBidPrice,
    rights,
    user,
    onChange
  }
}

export const getTargetingAttributes = async (options: { scope: Scope, scopeId?: number, video?: string }) => {
  try {
    const attributeCollection: AttributeCollection = await Api.Get({ path: "/api/attributes/targeting", qs: options });
    return attributeCollection;
  } catch (err) {
    console.log(err);
    return {};
  }
}

export const getRuleConsequence = (action: StrategyRuleActionType, bid: number): StrategyRuleConsequenceType => {
  if (action === "LIMIT_BID") {
    return { action, limitBid: bid };
  } else if (action === "INCREASE_BID_PERCENTAGE") {
    return { action, increaseBidPercentage: bid };
  } else if (action === "DECREASE_BID_PERCENTAGE") {
    return { action, decreaseBidPercentage: bid };
  } else {
    return { action };
  }
}

export const setNullIds = (rules: StrategyRule[]) => {
  return rules.map((rule) => {
    if (rule.ruleId < 0) {
      return _.assign({}, rule, { ruleId: null });
    } else {
      return rule;
    }
  });
}