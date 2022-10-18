import React from "react";
import { Metric } from "../../../../../client/schemas";
import { AttributeChartType } from "../../../../../models/data/Attribute";
import AttributeC3Chart from "./AttributeC3Chart";
import AttributeTable from "./AttributeTable";

export interface AttributeGraphProps {
  id: string;
  data: any[];
  metric: Metric;
  chartType: AttributeChartType;
  attributeLabel: string;
  png: boolean;
}

const AttributeGraph = (props: AttributeGraphProps) => {
  if (props.chartType === "table") {
    return <AttributeTable {...props} />
  } else {
    return <AttributeC3Chart {...props} />
  }
}
export default AttributeGraph;