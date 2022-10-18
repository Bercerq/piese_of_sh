import React from "react";
import { Metric } from "../../../../../client/schemas";
import * as Utils from "../../../../../client/Utils";

interface KPIProps {
  data: any;
  metrics: Metric[];
}

const KPI = (props: KPIProps) => {
  return <div className="row kpi-container">
    {
      props.metrics.map((metric, i) => <div className="text-center kpi">
        <h3>{Utils.getFormat(props.data[metric.col], metric.type)}</h3>
        <span>{metric.label || metric.col}</span>
      </div>)
    }
  </div>
}
export default KPI;