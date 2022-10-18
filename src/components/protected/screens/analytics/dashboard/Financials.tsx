import React from "react";
import * as _ from "lodash";
import * as Utils from "../../../../../client/Utils";
import { Metric } from "../../../../../client/schemas";
import { TabProps } from "../../../../../models/Common";

const Financials = (props: { data: any; tabProps: TabProps }) => {
  function getMetrics(): Metric[] {
    if (props.tabProps.options.scope === "metaAgency" || props.tabProps.options.scope === "agency" || props.tabProps.options.scope === "advertiser") {
      return [{ col: "revenue", label: "revenue", type: "money" }, { col: "fee", label: "fee", type: "money" }, { col: "media_costs", label: "media spend", type: "money" }, { col: "uploadCosts", label: "banner upload fee", type: "money" }, { col: "audience_costs", label: "audience insights", type: "money" }, { col: "audience_targeting_costs", label: "audience targeting", type: "money" }, { col: "adservingCosts", label: "adserving", type: "money" }, { col: "bannerwise_costs", label: "bannerwise costs", type: "money" }, { col: "profit", label: "profit", type: "money" }];
    } else {
      return [{ col: "revenue", label: "revenue", type: "money" }, { col: "fee", label: "fee", type: "money" }, { col: "media_costs", label: "media spend", type: "money" }, { col: "audience_costs", label: "audience insights", type: "money" }, { col: "audience_targeting_costs", label: "audience targeting", type: "money" }, { col: "adservingCosts", label: "adserving", type: "money" }, { col: "dma_costs", label: "DMA spend", type: "money" }, { col: "bannerwise_costs", label: "bannerwise costs", type: "money" }, { col: "profit", label: "profit", type: "money" }];
    }
  }

  if (props.data) {
    const data = _.assign({}, props.data, { fee: props.data.costs - props.data.expenses + props.data.cpm_fee_costs });
    const metrics = getMetrics();
    return <div>
      {
        metrics.map((metric, i) => <div className="clearfix financials-row">
          <span className="pull-left">{metric.label || metric.col}</span>
          <span className="pull-right">{Utils.getFormat(data[metric.col], metric.type)}</span>
        </div>)
      }
    </div>
  } else {
    return <div>No data in selected period.</div>;
  }

}
export default Financials;