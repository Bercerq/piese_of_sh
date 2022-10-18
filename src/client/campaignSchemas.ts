import { AppUser } from "../models/AppUser";
import { Rights } from "../models/Common";
import { BiddingType, DayHourTargeting, MediaAgencyRevenueModelType, RevenueType, FrequencyCapItem, FrequencyCaps, SuggestionItem, AttributeValueName, CampaignDeal, InventoryRule, CampaignBanner, CampaignTag, SegmentRule, StrategyRule, Strategy, RetailStrategy, StructureType, CampaignSettings } from "../models/data/Campaign";
import { CreativeFeed } from "../models/data/CreativeFeed";
import { SelectOption } from "./schemas";

export type BudgetPeriod = "day" | "week" | "month" | "campaign";
export type ImpressionsPeriod = "day" | "campaign";
export type CampaignAdType = "display" | "video";
export type CampaignType = "prospecting" | "retargeting" | "RETAIL_GPS" | "RETAIL_ZIP";
export type DeliveryType = "evenly" | "frontloaded" | "fast";
export type CampaignStatus = "scheduled" | "not scheduled" | "active" | "paused" | "ended" | "archived";

export interface NewCampaign {
  name: string;
  advertiserId: number;
  clusterId: number;
  adType: CampaignAdType;
  startTime: number;
  endTime: number;
  budget: number;
  budgetPeriod: BudgetPeriod;
  biddingType: BiddingType;
  campaignType: CampaignType;
  revenueType: RevenueType;
  retailBranches: number[];
}

export interface ExistingCampaign {
  name: string;
  campaignId: number;
  clusterId: number;
  startTime: number;
  endTime: number;
  budget: number;
  budgetPeriod: BudgetPeriod;
}

export interface CampaignFormData {
  generalTab: GeneralTabFormData;
  targetingTab: TargetingTabFormData;
  inventoryTab: InventoryTabFormData;
  adsTab: AdsTabFormData;
  segmentsTab: SegmentsTabFormData;
  advancedRulesTab: AdvancedRulesTabFormData;
  substrategiesTab: SubstrategiesTabFormData;
  retailTab: RetailTabFormData;
}

export interface GeneralTabProps {
  isRetail: boolean;
  data: CampaignSettings;
  rights: Rights;
  onChange: (data: GeneralTabFormData) => void;
  onValidate: (isValid: boolean) => void;
}

export interface GeneralTabFormData {
  generalBox: GeneralBoxFormData;
  budgetBox: BudgetBoxFormData;
  targetsBox: TargetsBoxFormData;
  frequencyCapBox: FrequencyCapBoxFormData;
  commercialBox: CommercialBoxFormData;
}

export interface GeneralBoxProps {
  id: number;
  advertiserId: number;
  clusterId: number;
  name: string;
  startTime: number;
  endTime: number;
  videoCampaign: boolean;
  revenueType: RevenueType;
  deliveryType: DeliveryType;
  remarks: string;
  dayHour: DayHourTargeting;
  rights: Rights;
  onChange: (data: GeneralBoxFormData, isValid: boolean) => void;
}

export interface GeneralBoxFormData {
  name: string;
  startTime: number;
  endTime: number;
  revenueType: RevenueType;
  deliveryType: DeliveryType;
  dayHour: DayHourTargeting;
  clusterId: number;
  remarks: string;
}

export interface BudgetBoxProps {
  id: number;
  budget: number;
  budgetPeriod: BudgetPeriod;
  maxBidPrice: number;
  impressions: number;
  impressionsPeriod: ImpressionsPeriod;
  fixedBidPrice: boolean;
  floorPriceOnly: boolean;
  rights: Rights;
  onChange: (data: BudgetBoxFormData, isValid: boolean) => void;
}

export interface BudgetBoxFormData {
  budget: number;
  budgetPeriod: BudgetPeriod;
  maxBidPrice: number;
  floorPriceOnly: boolean;
  fixedBidPrice: boolean;
  impressions: number;
  impressionsPeriod: ImpressionsPeriod;
}

export interface TargetsBoxProps {
  id: number;
  videoCampaign: boolean;
  open: boolean;
  minimumPerformanceCTR: number;
  viewableMeasurable: number;
  viewable: number;
  completionRate: number;
  maximumPerformanceCTR: number;
  CPC: number;
  CPCV: number;
  CPV: number;
  rights: Rights;
  onChange: (data: TargetsBoxFormData, isValid: boolean) => void;
}

export interface TargetsBoxFormData {
  minimumPerformanceCTR: number;
  viewableMeasurable: number;
  viewable: number;
  completionRate: number;
  maximumPerformanceCTR: number;
  CPC: number;
  CPCV: number;
  CPV: number;
}

export interface CommercialBoxProps {
  id: number;
  mediaAgencyRevenueModel: MediaAgencyRevenueModelType;
  commercialValue: number;
  rights: Rights;
  onChange: (data: CommercialBoxFormData, isValid: boolean) => void;
}

export interface CommercialBoxFormData {
  mediaAgencyRevenueModel: MediaAgencyRevenueModelType;
  commercialValue: number;
}

export interface FrequencyCapBoxProps {
  id: number;
  frequencyCaps: FrequencyCaps;
  rights: Rights;
  onChange: (data: FrequencyCapBoxFormData, isValid: boolean) => void;
}

export interface FrequencyCapBoxFormData {
  impressions: FrequencyCapItem[];
  clicks: FrequencyCapItem[];
  conversions: FrequencyCapItem[];
}

export interface FrequencyCapFormProps {
  label: string;
  field: string;
  rows: (FrequencyCapItem & { key: string })[];
  options: SelectOption[];
  writeAccess: boolean;
  onChange: (i: number, row: FrequencyCapItem & { key: string }, isValid: boolean) => void;
  onDelete: (i: number) => void;
  onAdd: (row: FrequencyCapItem & { key: string }) => void;
}

export interface FrequencyCapRowProps {
  index: number;
  field: string;
  row: FrequencyCapItem & { key: string };
  options: SelectOption[];
  writeAccess: boolean;
  onChange: (i: number, row: FrequencyCapItem & { key: string }, isValid: boolean) => void;
  onDelete: (i: number) => void;
}

export interface TargetingTabProps {
  data: CampaignSettings;
  rights: Rights;
  onChange: (data: TargetingTabFormData) => void;
  onValidate: (isValid: boolean) => void;
}

export interface TargetingTabFormData {
  positionBox: PositionBoxFormData;
  videoTargetingBox: VideoTargetingBoxFormData;
  geoTargetingBox: GeoTargetingBoxFormData;
  browserBox: BrowserBoxFormData;
  osBox: OSBoxFormData;
  languageBox: LanguageBoxFormData;
}

export interface PositionBoxProps {
  id: number;
  deviceTypes: string[];
  inventoryTypes: string[];
  positionTypes: string[];
  rights: Rights;
  onChange: (data: PositionBoxFormData) => void;
}

export interface PositionBoxFormData {
  deviceTypes: string[];
  inventoryTypes: string[];
  positionTypes: string[];
}

export interface VideoTargetingBoxProps {
  id: number;
  playerSizes: string[];
  initiationTypes: string[];
  rights: Rights;
  onChange: (data: VideoTargetingBoxFormData) => void;
}

export interface VideoTargetingBoxFormData {
  playerSizes: string[];
  initiationTypes: string[];
}

export interface GeoTargetingBoxProps {
  id: number;
  countries: AttributeValueName;
  regions: AttributeValueName;
  cities: AttributeValueName;
  postalCodes: AttributeValueName;
  rights: Rights;
  onChange: (data: GeoTargetingBoxFormData, isValid: boolean) => void;
}

export type GeoTargetingBoxFormData = CountryRegionCityFormData | PostalCodesFormData;

export interface CountryRegionCityFormData {
  countries: string[];
  regions: string[];
  cities: string[];
  radius: number;
}

export interface PostalCodesFormData {
  countryCode: string;
  postalCodes: string[];
}

export interface BrowserBoxProps {
  id: number;
  browsers: string[];
  rights: Rights;
  onChange: (data: BrowserBoxFormData) => void;
}

export interface BrowserBoxFormData {
  browsers: string[];
}

export interface OSBoxProps {
  id: number;
  os: string[];
  rights: Rights;
  onChange: (data: OSBoxFormData) => void;
}

export interface OSBoxFormData {
  os: string[];
}

export interface LanguageBoxProps {
  id: number;
  languages: string[];
  rights: Rights;
  onChange: (data: LanguageBoxFormData) => void;
}

export interface LanguageBoxFormData {
  languages: string[];
}

export interface InventoryTabProps {
  data: CampaignSettings;
  rights: Rights;
  user: AppUser;
  isAdserving: boolean;
  maxBidPrice: number;
  onChange: (data: InventoryTabFormData) => void;
  onValidate: (isValid: boolean) => void;
}

export interface InventoryTabFormData {
  publishersAndExchangesBox: PublishersAndExchangesBoxFormData;
  dealsBox: DealsBoxFormData;
  inventoryRulesBox: InventoryRulesBoxFormData;
}

export interface PublishersAndExchangesBoxProps {
  id: number;
  isAdserving: boolean;
  videoCampaign: boolean;
  agencyId: number;
  publishersAndExchanges: AttributeValueName;
  rights: Rights;
  onChange: (data: PublishersAndExchangesBoxFormData) => void;
}

export interface PublishersAndExchangesBoxFormData {
  publishersAndExchanges: string[];
}

export interface DealsBoxProps {
  id: number;
  deals: CampaignDeal[];
  rights: Rights;
  onChange: (data: DealsBoxFormData) => void;
}

export interface DealsBoxFormData {
  deals: CampaignDeal[];
}

export interface InventoryRulesBoxProps {
  id: number;
  user: AppUser;
  advertiserId: number;
  rights: Rights;
  domains: InventoryRule[];
  domainLists: InventoryRule[];
  topLevelDomains: InventoryRule[];
  applications: InventoryRule[];
  applicationLists: InventoryRule[];
  maxBidPrice: number;
  onChange: (data: InventoryRulesBoxFormData, isValid: boolean) => void;
}

export interface InventoryRulesBoxFormData {
  domains: InventoryRule[];
  domainLists: InventoryRule[];
  topLevelDomains: InventoryRule[];
  applications: InventoryRule[];
  applicationLists: InventoryRule[];
}

export interface AdsTabProps {
  data: CampaignSettings;
  rights: Rights;
  isAdserving: boolean;
  dataFeedAllowed: boolean;
  onChange: (data: AdsTabFormData) => void;
}

export interface AdsTabFormData {
  adsBox: AdsBoxFormData;
}

export interface AdsBoxProps {
  id: number;
  advertiserId: number;
  rights: Rights;
  isAdserving: boolean;
  dataFeedAllowed: boolean;
  videoCampaign: boolean;
  branches?: RetailStrategy[];
  ads: CampaignBanner[];
  tags: CampaignTag[];
  dataFeeds : CreativeFeed[];
  onChange: (data: AdsBoxFormData) => void;
}

export interface AdsBoxFormData {
  adsToUpdate: CampaignBanner[];
  adsToCreate: CampaignBanner[];
  adsToDelete: number[];
  tagsToUpdate: CampaignTag[];
  tagsToCreate: CampaignTag[];
}

export interface SegmentsTabProps {
  data: CampaignSettings;
  rights: Rights;
  maxBidPrice: number;
  onChange: (data: SegmentsTabFormData) => void;
}

export interface SegmentsTabFormData {
  segmentsBox: SegmentsBoxFormData;
}

export interface SegmentsBoxProps {
  id: number;
  advertiserId: number;
  rights: Rights;
  segmentRules: SegmentRule[];
  digitalAudience: AttributeValueName;
  maxBidPrice: number;
  onChange: (data: SegmentsBoxFormData) => void;
}

export interface SegmentsBoxFormData {
  segmentRules: SegmentRule[];
  digitalAudience: string[];
}

export interface AdvancedRulesTabProps {
  data: CampaignSettings;
  rights: Rights;
  user: AppUser;
  maxBidPrice: number;
  onChange: (data: AdvancedRulesTabFormData) => void;
  onValidate: (isValid: boolean) => void;
}

export interface AdvancedRulesTabFormData {
  advancedRulesBox: AdvancedRulesBoxFormData;
}

export interface AdvancedRulesBoxProps {
  id: number;
  user: AppUser;
  advertiserId: number;
  videoCampaign: boolean;
  advancedRules: StrategyRule[];
  rights: Rights;
  maxBidPrice: number;
  onChange: (data: AdvancedRulesBoxFormData, isValid: boolean) => void;
}

export interface AdvancedRulesBoxFormData {
  advancedRules: StrategyRule[];
}

export interface SubstrategiesTabProps {
  data: CampaignSettings;
  rights: Rights;
  user: AppUser;
  maxBidPrice: number;
  onChange: (data: SubstrategiesTabFormData) => void;
  onValidate: (isValid: boolean) => void;
}

export interface SubstrategiesTabFormData {
  substrategiesBox: SubstrategiesBoxFormData;
}

export interface SubstrategiesBoxProps {
  id: number;
  user: AppUser;
  advertiserId: number;
  videoCampaign: boolean;
  distributeUsers: boolean;
  redistributeBudget: boolean;
  useDataFeed: boolean;
  strategies: Strategy[];
  rights: Rights;
  maxBidPrice: number;
  dataFeeds: CreativeFeed[];
  onChange: (data: SubstrategiesBoxFormData, isValid: boolean) => void;
}

export interface SubstrategiesBoxFormData {
  distributeUsers: boolean;
  redistributeBudget: boolean;
  useDataFeed: boolean;
  strategies: Strategy[];
}

export interface RetailTabProps {
  data: CampaignSettings;
  rights: Rights;
  onChange: (data: RetailTabFormData) => void;
  onValidate: (isValid: boolean) => void;
}

export interface RetailTabFormData {
  retailBox: RetailBoxFormData;
}

export interface RetailBoxProps {
  id: number;
  advertiserId: number;
  structure: StructureType;
  budget: number;
  budgetPeriod: BudgetPeriod;
  maxBidPrice: number;
  impressions: number;
  impressionsPeriod: ImpressionsPeriod;
  fixedBidPrice: boolean;
  floorPriceOnly: boolean;
  retailStrategies: RetailStrategy[];
  rights: Rights;
  onChange: (data: RetailBoxFormData, isValid: boolean) => void;
}

export interface RetailBoxFormData {
  budget: number;
  budgetPeriod: BudgetPeriod;
  maxBidPrice: number;
  impressions: number;
  impressionsPeriod: ImpressionsPeriod;
  fixedBidPrice: boolean;
  floorPriceOnly: boolean;
  retailStrategies: RetailStrategy[];
}