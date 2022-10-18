export type AttributeChartType = "donut" | "bar" | "table";

export interface Attribute {
  chartTypes: AttributeChartType[];
  acceptAnyValue: 0 | 1;
  targetingAllowed: 0 | 1;
  statisticsAllowed: 0 | 1;
  filtersAllowed: 0 | 1;
  listsAllowed: 0 | 1;
  displayName: string;
  name: string;
  attributeId: number;
  categoryName: string;
  isList: 0 | 1;
  attributeDisplayFormat: number;
}

export interface AttributeCollection {
  [key: string]: Attribute[];
}

export interface DATargeting {
  segmentId: number;
  cpmPriceCents: number;
  name: string;
  attributeName: string;
  children: DATargeting[];
}