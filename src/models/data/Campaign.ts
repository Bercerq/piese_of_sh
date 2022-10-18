import { Right } from "../Common";
import { Parents } from "./Parent";
import { Deal } from "./Deal";
import { Ad } from "./Ads";
import { RetailBranch } from "./RetailBranch";
import { CreativeFeed } from "./CreativeFeed";

export type BiddingType = "RTB" | "Adserving";
export type RevenueType = 1 | 2 | 3 | 4;
export type StructureType = "DEFAULT" | "RETAIL_GPS" | "RETAIL_ZIP";
export type OptimizationMetricType = 0 | 1 | 2 | 3;
export type MetricTargetType = "CTR" | "COMPLETION_RATE" | "CPC" | "CPCV" | "CPV" | "VIEWABLE_MEASURABLE" | "VIEWABLE";
export type MediaAgencyRevenueModelType = 1 | 2 | 3 | 4 | 5;
export type TimeType = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15 | 16 | 17 | 18 | 19 | 20 | 21 | 22 | 23;
export type PeriodType = "DAY" | "WEEK" | "MONTH" | "ALL";
export type DayType = "monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday" | "sunday";
export type RuleActionType = "REQUIRED" | "LIMIT_BID" | "NO_BID";
export type StrategyRuleActionType = "REQUIRED" | "LIMIT_BID" | "NO_BID" | "DECREASE_BID_PERCENTAGE" | "INCREASE_BID_PERCENTAGE";
export type RulePeriodType = "DAY" | "HOUR" | "MINUTE";
export type UserInteractionEventType = "IMPRESSION" | "CLICK" | "CONVERSION";
export type StrategyRuleConditionType = AttributeValueName | UserInteractionCondition | GPSCondition | EntityCondition | SegmentCondition;

export interface Campaign {
  campaign: CampaignEntity;
  rights: Right[];
  parents: Parents;
}

export interface CampaignEntity {
  id?: number;
  metaAgencyId?: number;
  agencyId?: number;
  advertiserId?: number;
  theme?: string;
  biddingType?: BiddingType;
  name: string;
  startTime?: number;
  endTime?: number;
  lastUpdate?: string;
  adscienceRevenuePerImpression?: number;
  mediaAgencyRevenuePerImpression?: number;
  adscienceRevenuePerClick?: number;
  mediaAgencyRevenuePerClick?: number;
  adscienceRevenuePerLead?: number;
  mediaAgencyRevenuePerLead?: number;
  adscienceRevenuePerSale?: number;
  mediaAgencyRevenuePerSale?: number;
  frontLoading?: number;
  revenueType?: RevenueType;
  adscienceRevenueModel?: number;
  mediaAgencyRevenueModel?: MediaAgencyRevenueModelType;
  mediaAgencyMargin?: number;
  onTrack?: any;
  remarks?: string;
  clusterId?: number;
  isRetargeting?: boolean;
  isActive?: boolean;
  distributeUsers?: boolean;
  redistributeBudget?: boolean;
  externallySynced?: boolean;
  videoCampaign?: boolean;
  dmai?: any[];
  budgetPacing?: Pacing;
  impressionPacing?: Pacing;
  isRecent?: boolean;
  percentageDone?: number;
  includeAdservingInBudget?: boolean;
  includeCostsInBid?: boolean;
  status?: string;
  floorPriceOnly?: number;
  deals?: any[] | null;
  startDate?: string;
  endDate?: string;
  ads?: CampaignAd[] | null;
  structure?: StructureType;
  constraints?: Constraints;
  retailBranches?: number[];
  useDataFeed?: boolean;
}

export interface Pacing {
  budget: number;
  actual: number;
  expected: number;
  percentage: number;
  actionType: number;
  action: string;
}

export interface Constraints {
  id?: number;
  campaignId?: number;
  name?: string;
  minBudgetPerDay?: number | null;
  minBudgetPerCampaign?: number | null;
  maxBudgetPerDay?: number | null;
  maxBudgetPerWeek?: number | null;
  maxBudgetPerMonth?: number | null;
  maxBudgetPerCampaign?: number | null;
  impressionsPerDayPerUser?: number | null;
  impressionsPerWeekPerUser?: number | null;
  impressionsPerMonthPerUser?: number | null;
  impressionsPerDayAllUsers?: number | null;
  impressionsPerCampaignPerUser?: number | null;
  impressionsPerCampaignAllUsers?: number | null;
  clicksPerDayPerUser?: number | null;
  clicksPerWeekPerUser?: number | null;
  clicksPerMonthPerUser?: number | null;
  clicksPerDayAllUsers?: number | null;
  clicksPerCampaignPerUser?: number | null;
  clicksPerCampaignAllUsers?: number | null;
  conversionsPerDayPerUser?: number | null;
  conversionsPerWeekPerUser?: number | null;
  conversionsPerMonthPerUser?: number | null;
  conversionsPerDayAllUsers?: number | null;
  conversionsPerCampaignPerUser?: number | null;
  conversionsPerCampaignAllUsers?: number | null;
  maxBidPrice?: number | null;
  minBidPrice?: number | null;
}

export interface CampaignClone {
  name: string;
  startTime: number;
  endTime: number;
  clusterId?: number;
  constraints: Constraints;
}

export interface CampaignAd {
  status: string;
  name: string;
}

export interface Qualification {
  conversionsPostView: number;
  conversionsPostClick: number;
  optimizationMetric: OptimizationMetricType;
}

export interface MetricTargets {
  minimumPerformance: MetricTargetPerformance[];
  maximumPerformance: MetricTargetPerformance[];
  maximumBid: MetricTargetPerformance[];
}

export interface MetricTargetPerformance {
  metric: MetricTargetType;
  value: number;
}

export interface CampaignDeal {
  id?: number;
  campaignId: number;
  dealId: number;
  deal?: Deal;
}

export interface CampaignBanner {
  id?: number;
  campaignId: number;
  bannerId: number;
  clickUrl: string;
  name: string;
  active: 0 | 1;
  tagId?: number;
  noSSPTag?: any;
  startTime?: number;
  endTime?: number;
  banner?: Ad;
  dataFeedId ?: number;
}

export interface CampaignTag {
  id?: number;
  campaignId?: number;
  supportedSizes: string[];
  iframe: boolean;
  javascript: boolean;
  tracking: boolean;
  finalized: boolean;
  name: string;
  defaultCampaignBannerId?: number;
  clickTag?: string;
  impressionTag?: string;
  javascriptTag?: string;
  iframeTag?: string;
}

export interface CampaignSettings {
  campaign: CampaignEntity;
  rights: Right[];
  parents: Parents;
  settings: {
    constraints: Constraints;
    targeting: Targeting;
    metricTargets: MetricTargets;
    deals: CampaignDeal[];
    ads: CampaignBanner[];
    dataFeeds: CreativeFeed[];
    tags: CampaignTag[];
    retailStrategies: RetailStrategy[];
  };
}

export interface CampaignSubmitData {
  isRetail: boolean;
  isAdserving: boolean;
  videoCampaign: boolean;
  campaign: CampaignEntity;
  constraints: Constraints;
  targeting: Targeting;
  deals?: { deals: CampaignDeal[] };
  ads?: {
    adsToUpdate: CampaignBanner[];
    adsToCreate: CampaignBanner[];
    adsToDelete: number[];
    tagsToUpdate: CampaignTag[];
    tagsToCreate: CampaignTag[];
  };
  metricTargets: MetricTargets;
  retailStrategies: { 
    retailStrategies: RetailStrategy[];
    replaceAll: boolean;
  }
}

export interface Targeting {
  basicRules: {
    time: {
      dayHour: DayHourTargeting;
    };
    user: UserTargeting;
    device: {
      deviceType: AttributeValueName;
      os: AttributeValueName;
      browser: AttributeValueName;
      language: AttributeValueName;
      geo: GeoTargeting;
    };
    inventory: {
      inventoryType: AttributeValueName;
      positionOnPage: AttributeValueName;
      playerSize: AttributeValueName;
      initiationType: AttributeValueName;
      publishersAndExchanges: AttributeValueName;
      domains: InventoryRule[];
      domainLists: InventoryRule[];
      topLevelDomains: InventoryRule[];
      applications: InventoryRule[];
      applicationLists: InventoryRule[];
    };
  };
  advancedRules: {
    rules: StrategyRule[];
  };
  strategies?: Strategy[];
}

export interface AttributeValueName {
  values: string[];
  displayNames?: string[];
  radius?: number;
  countryCode?: string;
}

export interface UserInteractionCondition {
  doneBy: "CAMPAIGN",
  minimum: number;
  event: UserInteractionEventType;
  inPast?: RulePeriod;
  sinceStartOf?: PeriodType;
}

export interface GPSCondition {
  locations: GPSLocation[];
  radius: number;
}

export interface EntityCondition {
  ids: number[];
  displayNames?: string[];
}

export interface SegmentCondition {
  addedInPast: RulePeriod;
  ids: number[];
  displayNames?: string[];
}

export interface GPSLocation {
  latitude: number;
  longitude: number;
}

export interface InventoryRule {
  id?: number;
  values: string[];
  displayNames: string[];
  consequence: RuleConsequence;
}

export interface RuleConsequence {
  action: RuleActionType;
  limitBid?: number;
}

export interface DayHourTargeting {
  monday: TimeType[];
  tuesday: TimeType[];
  wednesday: TimeType[];
  thursday: TimeType[];
  friday: TimeType[];
  saturday: TimeType[];
  sunday: TimeType[];
}

export interface GeoTargeting {
  country: AttributeValueName;
  region: AttributeValueName;
  city: AttributeValueName;
  postalCode: AttributeValueName;
}

export interface UserTargeting {
  campaignFrequencyCaps: FrequencyCaps;
  advertiserFrequencyCaps?: FrequencyCaps;
  segmentRules: SegmentRule[];
  digitalAudience: AttributeValueName;
}

export interface FrequencyCaps {
  impressions: FrequencyCapItem[];
  clicks: FrequencyCapItem[];
  conversions: FrequencyCapItem[];
}

export interface FrequencyCapItem {
  sinceStartOf: PeriodType;
  maximum: number;
}

export interface SuggestionItem {
  value: string;
  name: string;
}

export interface SegmentRule {
  segmentId: number;
  displayName: string;
  addedInPast: RulePeriod;
  consequence: RuleConsequence;
}

export interface RulePeriod {
  time: number;
  timeUnit: RulePeriodType;
}

export interface StrategyRule {
  ruleId?: number;
  attribute: string;
  condition: StrategyRuleConditionType;
  consequence: StrategyRuleConsequenceType;
}

export interface StrategyRuleConsequenceType {
  action: StrategyRuleActionType;
  limitBid?: number;
  decreaseBidPercentage?: number;
  increaseBidPercentage?: number;
}

export interface Strategy {
  id?: number;
  name: string;
  percentage: number;
  datafeed?: StrategyDataFeed;
  rules: StrategyRule[];
}

export interface StrategyDataFeed {
  id?: number;
  key?: string;
}

export interface RetailStrategy {
  campaignConstraints: RetailStrategyConstraint;
  geoTargeting: RetailStrategyGeoTargeting;
  dynamicAdParameters: RetailStrategyDynamicAdParameters;
  branchId: string;
  retailBranchId: number;
  retailBranch?: RetailBranch;
}

export interface RetailStrategyConstraint {
  maxBid: number;
  budget: number;
  impressionCap: number;
}

export interface RetailStrategyGeoTargeting {
  radius: number | null;
  targetingZipCodes: string[] | null;
}

export interface RetailStrategyDynamicAdParameters {
  urlTag: string;
  custom1: string;
  custom2: string;
  custom3: string;
  custom4: string;
  custom5: string;
  custom6: string;
  custom7: string;
  custom8: string;
  custom9: string;
}