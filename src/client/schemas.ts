import momentPropTypes from "react-moment-proptypes";
import { AttributeChartType } from "../models/data/Attribute";

export interface ValidationError {
  error: boolean;
  message: string;
}

export interface SelectOption {
  value: string | number;
  label: string;
  [key: string]: any;
}

export interface GroupOption {
  label: string;
  options: SelectOption[];
}

export type BreadcrumbType = "organization" | "publisher" | "agency" | "advertiser" | "campaigngroup" | "campaign";

export interface BreadcrumbItem {
  label: string;
  active: boolean;
  current: boolean;
  href?: string;
  parent?: number;
  type?: BreadcrumbType;
  parentType?: "advertiser" | "campaigngroup";
}

export interface BreadcrumbDropdownItem {
  id: number;
  label: string;
  type: BreadcrumbType;
}

export type MetricType = "organization" | "publisher" | "agency" | "advertiser" | "campaigngroup" | "campaign" | "advertiser_link" | "money" | "perc" | "budget_completion" | "impression_completion" | "campaign_list" | "ad_list" | "number" | "date" | "start" | "end" | "historyAction";
export type AlignType = "left" | "right" | "center";

export interface Metric {
  col: string;
  label?: string;
  type?: MetricType;
  align?: AlignType;
  sort?: number;
}

export interface DropFile {
  file: File;
  path: string;
  key: string | number;
}

export interface DateRange {
  startDate: momentPropTypes.momentObj;
  endDate: momentPropTypes.momentObj;
}

export interface DateRangePreset {
  text: string;
  start: momentPropTypes.momentObj;
  end: momentPropTypes.momentObj;
}

export type ScopeType = "root" | "organization" | "publisher" | "agency" | "advertiser" | "campaigngroup" | "campaign"; //scope url param
export type PageType = "settings" | "analytics" | "advault" | "segments" | "lists" | "deals" | "publisherdeals" | "reports" | "report-templates" | "users" | "adqueue" | "changelog" | "data-feeds"; //page url param

export interface KeyValue {
  [key: string]: string;
}

export interface KeyBoolean {
  [key: string]: boolean;
}

export interface StatisticFilter {
  attributeId: number;
  condition: "in" | "notin";
  values: string[];
}

export interface AttributeGraphSettings {
  attributeId: number;
  selectedMetric: Metric;
  chartType: AttributeChartType;
}