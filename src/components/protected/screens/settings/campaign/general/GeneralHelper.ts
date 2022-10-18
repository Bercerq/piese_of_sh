import * as _ from "lodash";
import * as CampaignHelper from "../../../../../../client/CampaignHelper";
import { BudgetBoxProps, DeliveryType, GeneralBoxProps, TargetsBoxProps, CommercialBoxProps, FrequencyCapBoxProps, GeneralBoxFormData, BudgetBoxFormData, TargetsBoxFormData, FrequencyCapBoxFormData, CommercialBoxFormData } from "../../../../../../client/campaignSchemas";
import { Rights } from "../../../../../../models/Common";
import { CampaignEntity, CampaignSettings, Constraints, MetricTargets, MetricTargetType, Targeting } from "../../../../../../models/data/Campaign";

export const getGeneralBoxProps = (data: CampaignSettings, rights: Rights, onChange: (data: GeneralBoxFormData, isValid: boolean) => void): GeneralBoxProps => {
  const campaign: CampaignEntity = _.get(data, "campaign");
  const targeting: Targeting = _.get(data, "settings.targeting");

  return {
    id: _.get(campaign, "id"),
    advertiserId: _.get(campaign, "advertiserId"),
    clusterId: _.get(campaign, "clusterId") || -1,
    name: _.get(campaign, "name"),
    startTime: _.get(campaign, "startTime"),
    endTime: _.get(campaign, "endTime"),
    videoCampaign: _.get(campaign, "videoCampaign"),
    revenueType: _.get(campaign, "revenueType"),
    deliveryType: getDeliveryType(_.get(campaign, "frontLoading")),
    remarks: _.get(campaign, "remarks") || "",
    dayHour: _.get(targeting, "basicRules.time.dayHour"),
    rights,
    onChange
  }
}

export const getBudgetBoxProps = (data: CampaignSettings, rights: Rights, onChange: (data: BudgetBoxFormData, isValid: boolean) => void): BudgetBoxProps => {
  const campaign: CampaignEntity = _.get(data, "campaign");
  const constraints: Constraints = _.get(data, "settings.constraints");

  const budgetFields = CampaignHelper.getBudgetFields(constraints);
  const impressionsFields = CampaignHelper.getImpressionsFields(constraints);

  return {
    id: _.get(campaign, "id"),
    budget: _.get(budgetFields, "budget"),
    budgetPeriod: _.get(budgetFields, "budgetPeriod"),
    impressions: _.get(impressionsFields, "impressions"),
    impressionsPeriod: _.get(impressionsFields, "impressionsPeriod") || "campaign",
    maxBidPrice: _.get(constraints, "maxBidPrice"),
    fixedBidPrice: _.get(constraints, "minBidPrice") === _.get(constraints, "maxBidPrice"),
    floorPriceOnly: _.get(campaign, "floorPriceOnly") !== 0,
    rights,
    onChange
  };
}

export const getTargetsBoxProps = (data: CampaignSettings, rights: Rights, onChange: (data: TargetsBoxFormData, isValid: boolean) => void): TargetsBoxProps => {
  const campaign: CampaignEntity = _.get(data, "campaign");
  const metricTargets: MetricTargets = _.get(data, "settings.metricTargets");

  const minimumPerformanceCTR = getTargetMetricValue(metricTargets, "minimumPerformance", "CTR", true);
  const viewableMeasurable = getTargetMetricValue(metricTargets, "minimumPerformance", "VIEWABLE_MEASURABLE", true);
  const viewable = getTargetMetricValue(metricTargets, "minimumPerformance", "VIEWABLE", true);
  const completionRate = getTargetMetricValue(metricTargets, "minimumPerformance", "COMPLETION_RATE", true);
  const maximumPerformanceCTR = getTargetMetricValue(metricTargets, "maximumPerformance", "CTR", true);
  return {
    id: _.get(campaign, "id"),
    videoCampaign: campaign.videoCampaign,
    open: isTargetsOpen(metricTargets),
    minimumPerformanceCTR,
    viewableMeasurable,
    viewable,
    completionRate,
    maximumPerformanceCTR,
    CPC: getTargetMetricValue(metricTargets, "maximumBid", "CPC", false),
    CPCV: getTargetMetricValue(metricTargets, "maximumBid", "CPCV", false),
    CPV: getTargetMetricValue(metricTargets, "maximumBid", "CPV", false),
    rights,
    onChange
  };
}

export const getFrequencyCapBoxProps = (data: CampaignSettings, rights: Rights, onChange: (data: FrequencyCapBoxFormData, isValid: boolean) => void): FrequencyCapBoxProps => {
  const targeting: Targeting = _.get(data, "settings.targeting");
  return {
    id: _.get(data, "campaign.id"),
    frequencyCaps: _.get(targeting, "basicRules.user.campaignFrequencyCaps"),
    rights,
    onChange
  };
}

export const getCommercialBoxProps = (data: CampaignSettings, rights: Rights, onChange: (data: CommercialBoxFormData, isValid: boolean) => void): CommercialBoxProps => {
  const campaign: CampaignEntity = _.get(data, "campaign");
  let commercialValue = null;
  if (campaign.mediaAgencyRevenueModel === 1) {
    commercialValue = campaign.mediaAgencyRevenuePerImpression;
  } else if (campaign.mediaAgencyRevenueModel === 2) {
    commercialValue = campaign.mediaAgencyRevenuePerClick;
  } else if (campaign.mediaAgencyRevenueModel === 3) {
    commercialValue = campaign.mediaAgencyRevenuePerSale;
  } else if (campaign.mediaAgencyRevenueModel === 5) {
    commercialValue = campaign.mediaAgencyMargin;
  }
  return {
    id: _.get(campaign, "id"),
    mediaAgencyRevenueModel: campaign.mediaAgencyRevenueModel,
    commercialValue,
    rights,
    onChange
  };
}

function getDeliveryType(frontLoading: number): DeliveryType {
  if (_.isNull(frontLoading) || frontLoading <= 1.1) {
    return "evenly";
  } else if (frontLoading > 1.1 && frontLoading <= 10) {
    return "frontloaded";
  } else if (frontLoading > 10) {
    return "fast";
  }
  return "evenly";
}

function getTargetMetricValue(data: MetricTargets, group: "minimumPerformance" | "maximumPerformance" | "maximumBid", metric: MetricTargetType, isPerc: boolean): number {
  var metricValue = null;
  if (data && data[group]) {
    var metricItem = (data[group] || []).find(function (o) { return o.metric === metric });
    if (metricItem) {
      metricValue = isPerc ? metricItem.value * 100 : metricItem.value;
    }
  }
  return metricValue;
}

function isTargetsOpen(data: MetricTargets) {
  let performanceObjects = [];
  _.forEach(data, (groupData, group) => {
    performanceObjects = performanceObjects.concat(groupData);
  });
  return performanceObjects.length > 0;
}