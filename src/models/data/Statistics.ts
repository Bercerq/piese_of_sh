import { Scope } from "../Common";

export interface StatisticsOptions {
  scope?: Scope;
  scopeId?: number;
  attributeId?: number;
  attributeId2?: number;
  startDate?: string;
  endDate?: string;
  limit?: number;
  limit1?: number;
  limit2?: number;
  aggregator?: string;
  filter?: string[];
  filter1?: string;
  videoMetrics?: "true" | "false" | "any";
  simple?: "true" | "false";
}

export interface TimeseriesOptions {
  scope?: Scope;
  scopeId?: number;
  attributeId?: number;
  granularity: string;
  start: string;
  end: string;
  metrics: string[];
  sortMetric?: string;
  filter?: string[];
}