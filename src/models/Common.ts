import { Organization, OrganizationEntity } from "./data/Organization";
import { Agency, AgencyEntity } from "./data/Agency";
import { Advertiser, AdvertiserEntity } from "./data/Advertiser";
import { CampaignGroup, CampaignGroupEntity } from "./data/CampaignGroup";
import { Campaign, CampaignEntity, CampaignSettings } from "./data/Campaign";
import { DateRange, ScopeType, ValidationError } from "../client/schemas";
import { Publisher, PublisherEntity } from "./data/Publisher";
import { NavigationItem } from "./data/NavigationItem";
import { AppUser } from "./AppUser";

export type Scope = "all" | "metaAgency" | "publisher" | "agency" | "advertiser" | "cluster" | "campaign";
export type ScopeData = Organization | Publisher | Agency | Advertiser | CampaignGroup | Campaign | CampaignSettings | { rights: Right[] };
export type ScopeDataEntity = OrganizationEntity | PublisherEntity | AgencyEntity | AdvertiserEntity | CampaignGroupEntity | CampaignEntity;

export interface ScopeInfo {
  scope: Scope;
  scopeId: number | null;
  owner?: string;
}

export interface ScopeDataContextType {
  data: ScopeData;
  loadError?: ValidationError;
  loading?: boolean;
  updateLoading?: (loading: boolean) => void;
  updateReload?: (reload: boolean) => void;
}

export interface BreadcrumbContextType {
  items: NavigationItem[];
  loadError?: ValidationError;
}

export interface QsContextType {
  daterange: DateRange;
  attributeId: number;
  attributeId2: number;
  filters: string[];
  opfilters: string[];
  opgranularity: ("P1D" | "PT1H");
  tgranularity: ("PT10M" | "PT1H");
  opmetric: ("impressions" | "mediaCost");
  tperiod: ("24h" | "3d" | "1w");
  listattribute: string;
  updateDaterange?: (daterange: DateRange) => void;
  updateAttributeId?: (attributeId: number) => void;
  updateAttributeId2?: (attributeId2: number) => void;
  updateFilters?: (filters: string[]) => void;
  updateOpFilters?: (filters: string[]) => void;
  updateOpGranularity?: (granularity: ("P1D" | "PT1H")) => void;
  updateTGranularity?: (granularity: ("PT10M" | "PT1H")) => void;
  updateOpMetric?: (metric: ("impressions" | "mediaCost")) => void;
  updateTPeriod?: (period: ("24h" | "3d" | "1w")) => void;
  updateListattribute?: (listattribute: string) => void;
}

export interface AdqueueCountContextType {
  adqueueCount: number;
  updateAdqueueCount?: (count: number) => void;
}

export type ChangelogLevel = "adscience" | "metaAgency" | "customer" | "advertiser" | "cluster" | "campaign";

export interface LookUp {
  id: number;
  name: string;
  level?: string;
}

export interface Options {
  scope?: Scope;
  scopeId?: number;
  startDate: string;
  endDate: string;
  statistics?: boolean;
  attributeId?: number;
  videoMetrics?: boolean;
}

export interface ChangelogOptions {
  id?: number;
  level: ChangelogLevel;
  startDate: string;
  endDate: string;
}

export interface AttributesOptions {
  scope: Scope;
  scopeId?: number;
  video: "true" | "false"
}

export interface TabProps {
  options?: Options;
  user: AppUser;
  rights: Rights;
  data?: ScopeData;
  videoMode?: boolean;
  scope?: ScopeType;
  scopeId?: number;
}

export type Right =
  "VIEW_PUBLISHER" |
  "MANAGE_PUBLISHER" |
  "VIEW_ORGANIZATION" |
  "MANAGE_ORGANIZATION" |
  "VIEW_AGENCY" |
  "MANAGE_AGENCY" |
  "CREATE_ADVERTISER" |
  "VIEW_ADVERTISER" |
  "MANAGE_ADVERTISER" |
  "VIEW_CAMPAIGNGROUP" |
  "MANAGE_CAMPAIGNGROUP" |
  "VIEW_CAMPAIGN" |
  "MANAGE_CAMPAIGN" |
  "VIEW_FINANCIALS" |
  "VIEW_STATISTICS" |
  "VIEW_USERS" |
  "MANAGE_USERS" |
  "VIEW_LISTS" |
  "MANAGE_LISTS" |
  "VIEW_DEALS" |
  "MANAGE_DEALS" |
  "VIEW_ADS" |
  "MANAGE_ADS" |
  "VIEW_SEGMENTS" |
  "MANAGE_SEGMENTS" |
  "SEARCH_NAMES" |
  "MANAGE_PRESETS" |
  "VIEW_PRESETS" |
  "MANAGE_PUBLISHER_DEALS" |
  "VIEW_PUBLISHER_DEALS" |
  "VIEW_REPORTS" |
  "MANAGE_REPORTS" | 
  "VIEW_REPORT_TEMPLATES" | 
  "MANAGE_REPORT_TEMPLATES" |
  "MANAGE_FEEDS" |
  "VIEW_FEEDS" |
  "MANAGE_PUBLISHER_AD_SLOTS" |
  "VIEW_PUBLISHER_AD_SLOTS"

export type Rights = { [R in Right]?: boolean; }

export interface Entities {
  organizations?: Organization[],
  agencies?: Agency[],
  advertisers?: Advertiser[],
  publishers?: Publisher[]
}

export interface Variables {
  adServerUrl: string;
}