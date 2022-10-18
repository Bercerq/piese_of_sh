import * as _ from "lodash";
import { CampaignFormData, DeliveryType, BudgetPeriod, ImpressionsPeriod, GeoTargetingBoxFormData, TargetsBoxFormData } from "../../../../../client/campaignSchemas";
import { Rights } from "../../../../../models/Common";
import { AttributeValueName, CampaignEntity, CampaignSubmitData, Constraints, DayHourTargeting, FrequencyCaps, GeoTargeting, MediaAgencyRevenueModelType, MetricTargets, SegmentRule, Strategy, StrategyRule, Targeting, InventoryRule } from "../../../../../models/data/Campaign";

export const convert = (formData: CampaignFormData, isRetail: boolean, isAdserving: boolean, videoCampaign: boolean, rights: Rights): CampaignSubmitData => {
  const campaign = getCampaign(formData, isRetail);
  const constraints = getConstraints(formData, isRetail);
  const targeting = getTargeting(formData, isRetail);
  const deals = rights.MANAGE_DEALS ? _.get(formData, "inventoryTab.dealsBox") : null;
  const ads = rights.MANAGE_ADS ? _.get(formData, "adsTab.adsBox") : null;
  const metricTargets = getMetricTargets(formData, videoCampaign);
  const retailStrategies = isRetail ? _.get(formData, "retailTab.retailBox.retailStrategies") : null;

  return {
    isRetail,
    isAdserving,
    videoCampaign,
    campaign,
    constraints,
    targeting,
    deals,
    ads,
    metricTargets,
    retailStrategies: { retailStrategies, replaceAll: true }
  };
}

function getCampaign(formData: CampaignFormData, isRetail: boolean): CampaignEntity {
  const name = _.get(formData, "generalTab.generalBox.name");
  const startTime = _.get(formData, "generalTab.generalBox.startTime");
  const endTime = _.get(formData, "generalTab.generalBox.endTime");
  const revenueType = _.get(formData, "generalTab.generalBox.revenueType");
  const deliveryType = _.get(formData, "generalTab.generalBox.deliveryType");
  const clusterId = _.get(formData, "generalTab.generalBox.clusterId");
  const remarks = _.get(formData, "generalTab.generalBox.remarks");
  const mediaAgencyRevenueModel = _.get(formData, "generalTab.commercialBox.mediaAgencyRevenueModel");
  const commercialValue = _.get(formData, "generalTab.commercialBox.commercialValue");

  let campaign: CampaignEntity = {
    name,
    startTime,
    endTime,
    revenueType,
    frontLoading: getFrontLoading(deliveryType),
    clusterId: clusterId > 0 ? clusterId : null,
    remarks
  };

  if (!isRetail) {
    campaign.distributeUsers = _.get(formData, "substrategiesTab.substrategiesBox.distributeUsers");
    campaign.redistributeBudget = _.get(formData, "substrategiesTab.substrategiesBox.redistributeBudget");
    campaign.useDataFeed = _.get(formData, "substrategiesTab.substrategiesBox.useDataFeed");
    campaign.floorPriceOnly = _.get(formData, "generalTab.budgetBox.floorPriceOnly") ? 1.0 : 0.0;
  }

  if (isRetail) {
    campaign.floorPriceOnly = _.get(formData, "retailTab.retailBox.floorPriceOnly") ? 1.0 : 0.0;
  }

  const commercialData = getCommercialData(mediaAgencyRevenueModel, commercialValue);
  campaign = _.assign(campaign, commercialData);

  return campaign;
}


function getFrontLoading(deliveryType: DeliveryType) {
  switch (deliveryType) {
    case "evenly": return 1.0;
    case "frontloaded": return 1.2;
    case "fast": return 20;
    default: return null;
  }
}

function getCommercialData(mediaAgencyRevenueModel: MediaAgencyRevenueModelType, commercialValue: number): Partial<CampaignEntity> {
  let commercialData = {
    mediaAgencyRevenueModel,
    mediaAgencyRevenuePerImpression: null,
    mediaAgencyRevenuePerClick: null,
    mediaAgencyRevenuePerSale: null,
    mediaAgencyMargin: null
  };
  if (mediaAgencyRevenueModel === 1) {
    commercialData.mediaAgencyRevenuePerImpression = commercialValue;
  } else if (mediaAgencyRevenueModel === 2) {
    commercialData.mediaAgencyRevenuePerClick = commercialValue;
  } else if (mediaAgencyRevenueModel === 3) {
    commercialData.mediaAgencyRevenuePerSale = commercialValue;
  } else if (mediaAgencyRevenueModel === 5) {
    commercialData.mediaAgencyMargin = commercialValue;
  }
  return commercialData;
}

function getConstraints(formData: CampaignFormData, isRetail: boolean): Constraints {
  let constraints: Constraints = {
    maxBudgetPerDay: null,
    maxBudgetPerWeek: null,
    maxBudgetPerMonth: null,
    maxBudgetPerCampaign: null,
    impressionsPerDayAllUsers: null,
    impressionsPerCampaignAllUsers: null,
    impressionsPerDayPerUser: null,
    impressionsPerWeekPerUser: null,
    impressionsPerMonthPerUser: null,
    impressionsPerCampaignPerUser: null,
    clicksPerDayPerUser: null,
    clicksPerWeekPerUser: null,
    clicksPerMonthPerUser: null,
    clicksPerCampaignPerUser: null,
    conversionsPerDayPerUser: null,
    conversionsPerWeekPerUser: null,
    conversionsPerMonthPerUser: null,
    conversionsPerCampaignPerUser: null
  };

  const budget = isRetail ? _.get(formData, "retailTab.retailBox.budget") : _.get(formData, "generalTab.budgetBox.budget");
  const budgetPeriod: BudgetPeriod = isRetail ? _.get(formData, "retailTab.retailBox.budgetPeriod") : _.get(formData, "generalTab.budgetBox.budgetPeriod");

  if (budgetPeriod === "day") {
    constraints.maxBudgetPerDay = budget;
  } else if (budgetPeriod === "week") {
    constraints.maxBudgetPerWeek = budget;
  } else if (budgetPeriod === "month") {
    constraints.maxBudgetPerMonth = budget;
  } else if (budgetPeriod === "campaign") {
    constraints.maxBudgetPerCampaign = budget;
  }

  const impressions = isRetail ? _.get(formData, "retailTab.retailBox.impressions") : _.get(formData, "generalTab.budgetBox.impressions");
  const impressionsPeriod: ImpressionsPeriod = isRetail ? _.get(formData, "retailTab.retailBox.impressionsPeriod") : _.get(formData, "generalTab.budgetBox.impressionsPeriod");

  if (impressionsPeriod === "day") {
    constraints.impressionsPerDayAllUsers = impressions;
  } else if (impressionsPeriod === "campaign") {
    constraints.impressionsPerCampaignAllUsers = impressions;
  }

  const maxBidPrice = isRetail ? _.get(formData, "retailTab.retailBox.maxBidPrice") : _.get(formData, "generalTab.budgetBox.maxBidPrice");
  constraints.maxBidPrice = maxBidPrice;

  const fixedBidPrice = isRetail ? _.get(formData, "retailTab.retailBox.fixedBidPrice") : _.get(formData, "generalTab.budgetBox.fixedBidPrice");
  if (fixedBidPrice) {
    constraints.minBidPrice = constraints.maxBidPrice;
  } else {
    constraints.minBidPrice = 0;
  }

  return constraints;
}

function getTargeting(formData: CampaignFormData, isRetail: boolean): Targeting {
  const dayHour: DayHourTargeting = _.get(formData, "generalTab.generalBox.dayHour");
  const campaignFrequencyCaps = _.get(formData, "generalTab.frequencyCapBox") as FrequencyCaps;
  const segmentRules: SegmentRule[] = _.get(formData, "segmentsTab.segmentsBox.segmentRules");
  const digitalAudience: AttributeValueName = { values: _.get(formData, "segmentsTab.segmentsBox.digitalAudience") || [] };
  const deviceType: AttributeValueName = getAttributeValueName(_.get(formData, "targetingTab.positionBox.deviceTypes"));
  const os: AttributeValueName = getAttributeValueName(_.get(formData, "targetingTab.osBox.os"));
  const browser: AttributeValueName = getAttributeValueName(_.get(formData, "targetingTab.browserBox.browsers"));
  const language: AttributeValueName = getAttributeValueName(_.get(formData, "targetingTab.languageBox.languages"));
  const geoTargetingBox = _.get(formData, "targetingTab.geoTargetingBox");
  const geo: GeoTargeting = getGeoTargeting(geoTargetingBox);
  const inventoryType: AttributeValueName = getAttributeValueName(_.get(formData, "targetingTab.positionBox.inventoryTypes"));
  const positionOnPage: AttributeValueName = getAttributeValueName(_.get(formData, "targetingTab.positionBox.positionTypes"));
  const playerSize: AttributeValueName = getAttributeValueName(_.get(formData, "targetingTab.videoTargetingBox.playerSizes"));
  const initiationType: AttributeValueName = getAttributeValueName(_.get(formData, "targetingTab.videoTargetingBox.initiationTypes"));
  const publishersAndExchanges: AttributeValueName = getAttributeValueName(_.get(formData, "inventoryTab.publishersAndExchangesBox.publishersAndExchanges"));
  const domains = getInventoryRules(_.get(formData, "inventoryTab.inventoryRulesBox.domains"));
  const domainLists = getInventoryRules(_.get(formData, "inventoryTab.inventoryRulesBox.domainLists"));
  const topLevelDomains = getInventoryRules(_.get(formData, "inventoryTab.inventoryRulesBox.topLevelDomains"));
  const applications = getInventoryRules(_.get(formData, "inventoryTab.inventoryRulesBox.applications"));
  const applicationLists = getInventoryRules(_.get(formData, "inventoryTab.inventoryRulesBox.applicationLists"));
  const advancedRules = { rules: getStrategyRules(_.get(formData, "advancedRulesTab.advancedRulesBox.advancedRules") || []) }

  let targeting: Targeting = {
    basicRules: {
      time: {
        dayHour
      },
      user: {
        campaignFrequencyCaps,
        segmentRules,
        digitalAudience
      },
      device: {
        deviceType,
        os,
        browser,
        language,
        geo
      },
      inventory: {
        inventoryType,
        positionOnPage,
        playerSize,
        initiationType,
        publishersAndExchanges,
        domains,
        domainLists,
        topLevelDomains,
        applications,
        applicationLists
      }
    },
    advancedRules
  };

  if (!isRetail) {
    targeting.strategies = getStrategies(_.get(formData, "substrategiesTab.substrategiesBox.strategies") || []);
  }

  return targeting;
}

function getGeoTargeting(geoTargetingBox: GeoTargetingBoxFormData): GeoTargeting {
  const country: AttributeValueName = getAttributeValueName(_.get(geoTargetingBox, "countries") || []);
  const region: AttributeValueName = getAttributeValueName(_.get(geoTargetingBox, "regions") || []);
  const cities = _.get(geoTargetingBox, "cities") || [];
  const radius = _.get(geoTargetingBox, "radius") || null;
  const city: AttributeValueName = cities.length === 0 ? null : { values: cities, radius };
  const postalCodes = _.get(geoTargetingBox, "postalCodes") || [];
  const postalCode: AttributeValueName = postalCodes.length === 0 ? null : { values: postalCodes, countryCode: _.get(geoTargetingBox, "countryCode") };

  return {
    country,
    region,
    city,
    postalCode
  };
}

function getAttributeValueName(values: string[]) {
  if (values && values.length > 0) {
    return { values };
  }
  return null;
}

function getMetricTargets(formData: CampaignFormData, videoCampaign: boolean): MetricTargets {
  const targetsObject = getTargetsObject(_.get(formData, "generalTab.targetsBox"), videoCampaign);
  let metricTargets = {};
  _.forEach(targetsObject, (groupData, group) => {
    metricTargets[group] = [];
    _.forEach(groupData, (value, metric) => {
      if (!_.isNull(value)) {
        metricTargets[group].push({ metric, value });
      }
    });
  });
  return metricTargets as MetricTargets;
}

function getTargetsObject(targetsBox: TargetsBoxFormData, videoCampaign: boolean) {
  if (videoCampaign) {
    return {
      maximumPerformance: {
        CTR: getMetricTargetValue(targetsBox.maximumPerformanceCTR, true)
      },
      minimumPerformance: {
        CTR: getMetricTargetValue(targetsBox.minimumPerformanceCTR, true),
        COMPLETION_RATE: getMetricTargetValue(targetsBox.completionRate, true),
      },
      maximumBid: {
        CPC: getMetricTargetValue(targetsBox.CPC, false),
        CPCV: getMetricTargetValue(targetsBox.CPCV, false)
      }
    }
  } else {
    return {
      maximumPerformance: {
        CTR: getMetricTargetValue(targetsBox.maximumPerformanceCTR, true)
      },
      minimumPerformance: {
        CTR: getMetricTargetValue(targetsBox.minimumPerformanceCTR, true),
        VIEWABLE_MEASURABLE: getMetricTargetValue(targetsBox.viewableMeasurable, true),
        VIEWABLE: getMetricTargetValue(targetsBox.viewable, true),
      },
      maximumBid: {
        CPC: getMetricTargetValue(targetsBox.CPC, false),
        CPV: getMetricTargetValue(targetsBox.CPV, false)
      }
    }
  }
}

function getMetricTargetValue(value: number, isPerc: boolean): number {
  if (!_.isNil(value)) {
    return isPerc ? value / 100 : value;
  };
  return null;
}

function getStrategies(strategies: Strategy[]) {
  return strategies.map((s) => {
    const rules = getStrategyRules(s.rules || []);
    return _.assign({}, s, { rules });
  });
}

function getStrategyRules(rules: StrategyRule[]) {
  return rules.map((rule) => {
    return _.omit(rule, "condition.displayNames");
  });
}

function getInventoryRules(rules: InventoryRule[]) {
  return rules.map((rule) => {
    return _.omit(rule, "displayNames");
  });
}