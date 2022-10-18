import * as _ from "lodash";
import * as CampaignHelper from "../../../../../../client/CampaignHelper";
import { RetailBoxFormData, RetailBoxProps } from "../../../../../../client/campaignSchemas";
import { Rights } from "../../../../../../models/Common";
import { CampaignEntity, CampaignSettings, Constraints } from "../../../../../../models/data/Campaign";

export const getRetailBoxProps = (data: CampaignSettings, rights: Rights, onChange: (data: RetailBoxFormData, isValid: boolean) => void): RetailBoxProps => {
  const campaign: CampaignEntity = _.get(data, "campaign");
  const constraints: Constraints = _.get(data, "settings.constraints");
  const budgetFields = CampaignHelper.getBudgetFields(constraints);
  const impressionsFields = CampaignHelper.getImpressionsFields(constraints);
  const retailStrategies = _.get(data, "settings.retailStrategies", []);
  const structure = _.get(campaign, "structure");

  return {
    id: _.get(campaign, "id"),
    advertiserId: _.get(campaign, "advertiserId"),
    structure,
    budget: _.get(budgetFields, "budget"),
    budgetPeriod: _.get(budgetFields, "budgetPeriod"),
    impressions: _.get(impressionsFields, "impressions"),
    impressionsPeriod: _.get(impressionsFields, "impressionsPeriod"),
    maxBidPrice: _.get(constraints, "maxBidPrice"),
    fixedBidPrice: _.get(constraints, "minBidPrice") === _.get(constraints, "maxBidPrice"),
    floorPriceOnly: _.get(campaign, "floorPriceOnly") !== 0,
    retailStrategies,
    rights,
    onChange
  };
}