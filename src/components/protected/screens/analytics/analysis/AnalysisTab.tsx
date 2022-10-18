import React, { useState, useEffect } from "react";
import * as _ from "lodash";
import * as Api from "../../../../../client/Api";
import * as Helper from "../../../../../client/Helper";
import * as Enums from "../../../../../modules/Enums";
import { GroupOption, Metric, SelectOption } from "../../../../../client/schemas";
import { TabProps } from "../../../../../models/Common";
import { AttributeCollection } from "../../../../../models/data/Attribute";
import AttributeGraphArea from "./AttributeGraphArea";

const AnalysisTab = (props: TabProps) => {
  const [attributeCollection, setAttributeCollection] = useState<AttributeCollection>({});

  useEffect(() => { loadAttributes(); }, [props.videoMode]);

  async function loadAttributes() {
    try {
      const attributeCollection: AttributeCollection = await Api.Get({ path: "/api/attributes/statistics", qs: { scope: props.options.scope, scopeId: props.options.scopeId, video: props.videoMode.toString() } });
      const analysisAttributeCollection: AttributeCollection = getAnalysisAttributes(attributeCollection);
      setAttributeCollection(analysisAttributeCollection);
    } catch (err) {
      console.log(err);
    }
  }

  function getAnalysisAttributes(attributeCollection: AttributeCollection): AttributeCollection {
    let analysisAttributes = {};
    _.forEach(attributeCollection, (attributes, group) => {
      const groupAttributes = attributes.filter((attr) => { return attr.chartTypes.length > 0; });
      if (groupAttributes.length > 0) {
        analysisAttributes[group] = groupAttributes;
      }
    });
    return analysisAttributes;
  }

  function getMetrics(): Metric[] {
    if (props.rights.VIEW_FINANCIALS) {
      return [
        { col: "bids", label: "bids", type: "number" },
        { col: "impressions", label: "impressions", type: "number" },
        { col: "clicks", label: "clicks", type: "number" },
        { col: "conversions", label: "conversions", type: "number" },
        { col: "ctr", label: "ctr", type: "perc" },
        { col: "postClickConversions", label: "post click conversions", type: "number" },
        { col: "postViewConversions", label: "post view conversions", type: "number" },
        { col: "costs", label: "costs", type: "money" },
        { col: "cpc", label: "cpc", type: "money" },
        { col: "cpm", label: "cpm", type: "money" },
        { col: "epc", label: "epc", type: "money" },
        { col: "epm", label: "epm", type: "number" },
        { col: "expenses", label: "expenses", type: "money" },
        { col: "profit", label: "profit", type: "money" },
        { col: "profitPercentage", label: "profit %", type: "perc" },
        { col: "revenue", label: "revenue", type: "money" },
        { col: "uniqueClicks", label: "unique clicks", type: "number" }
      ];
    } else {
      return [
        { col: "bids", label: "bids", type: "number" },
        { col: "impressions", label: "impressions", type: "number" },
        { col: "clicks", label: "clicks", type: "number" },
        { col: "conversions", label: "conversions", type: "number" },
        { col: "ctr", label: "ctr", type: "perc" },
        { col: "postClickConversions", label: "post click conversions", type: "number" },
        { col: "postViewConversions", label: "post view conversions", type: "number" },
        { col: "costs", label: "costs", type: "money" },
        { col: "cpc", label: "cpc", type: "money" },
        { col: "cpm", label: "cpm", type: "money" },
        { col: "epc", label: "epc", type: "money" },
        { col: "epm", label: "epm", type: "number" },
        { col: "uniqueClicks", label: "unique clicks", type: "number" }
      ];
    }
  }
  const attributeOptions: GroupOption[] = Helper.attributeIdOptions(attributeCollection);
  const metrics: Metric[] = getMetrics();

  return <div className="col-sm-12 pt-3 mb-2">
    <div className="row no-gutters">
      <div className="col-lg-6 mb-2">
        <AttributeGraphArea
          id="attribute-graph-1"
          attributes={attributeOptions}
          metrics={metrics}
          settings={{ attributeId: Enums.Attributes.DEVICE_TYPE, selectedMetric: { col: "impressions", label: "impressions", type: "number" }, chartType: "donut" }}
          options={props.options}
        />
      </div>
      <div className="col-lg-6 mb-2">
        <AttributeGraphArea
          id="attribute-graph-2"
          attributes={attributeOptions}
          metrics={metrics}
          settings={{ attributeId: Enums.Attributes.DEVICE_TYPE, selectedMetric: { col: "impressions", label: "impressions", type: "number" }, chartType: "donut" }}
          options={props.options}
        />
      </div>
      <div className="col-lg-6 mb-2">
        <AttributeGraphArea
          id="attribute-graph-3"
          attributes={attributeOptions}
          metrics={metrics}
          settings={{ attributeId: Enums.Attributes.DEVICE_TYPE, selectedMetric: { col: "cpc", label: "cpc", type: "money" }, chartType: "bar" }}
          options={props.options}
        />
      </div>
      <div className="col-lg-6 mb-2">
        <AttributeGraphArea
          id="attribute-graph-4"
          attributes={attributeOptions}
          metrics={metrics}
          settings={{ attributeId: Enums.Attributes.DEVICE_TYPE, selectedMetric: { col: "ctr", label: "ctr", type: "perc" }, chartType: "bar" }}
          options={props.options}
        />
      </div>
    </div>
  </div>
}
export default AnalysisTab;