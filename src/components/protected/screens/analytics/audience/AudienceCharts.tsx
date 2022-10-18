import React, { useEffect } from "react";
import * as _ from "lodash";
import { SelectOption } from "../../../../../client/schemas";
import { AudienceCategory } from "./AudienceSchemas";
import AudienceChartArea from "./AudienceChartArea";
import { useLogger } from "react-use";

declare var $;

interface AudienceChartsProps {
  data: any;
  selectedMetric: string;
  metrics: SelectOption[];
}

const AudienceCharts = (props: AudienceChartsProps) => {

  useEffect(() => {
    $(window).resize(resizeCharts);
    resizeCharts();
  }, []);

  useEffect(() => {
    resizeCharts();
  }, [props.selectedMetric]);

  function getCategories() {
    try {
      let statisticList = _.get(props.data, "statisticList", []);
      statisticList = statisticList.filter(function (o) { return o.name !== "" });
      statisticList = statisticList.map(function (o) { o.name = parseInt(o.name); return o; });
      const mapping = getMapping();
      if (statisticList.length > 0) {
        const config = defaultConfig();
        const categories = config.map((configRow) => {
          let row = _.assign({}, configRow);
          const categoryData = statisticList.filter((statRow) => { return mapping[configRow.category].indexOf(statRow.name) > -1; });
          row.data = categoryData.map(getCategoryRow);
          return row;
        });
        return categories;
      } else {
        return [];
      }
    } catch (e) {
      console.log("Failed getting stats" + e);
    }
  }

  function getCategoryRow(o) {
    const ret = {
      id: o.name,
      name: o.displayName,
    };
    const metricKeys = props.metrics.map((m) => { return m.value });
    return _.assign({}, ret, _.pick(o, metricKeys));
  }

  function getMapping() {
    return {
      gender: [3, 4],
      age: _.range(6, 13),
      employment: _.range(54, 100),
      childGender: [31, 32],
      childAge: _.range(33, 39),
      householdIncome: _.range(666, 671),
      houseOwnership: [710, 711],
      propertyValue: _.range(723, 730),
      education: _.range(672, 676),
      mosaicSubgroups: _.range(946, 1005),
      region: _.range(14, 26)
    };
  }

  function tooltipFormat(value, ratio, id, index) {
    return value + "%";
  }

  function defaultConfig() {
    return [
      { category: "gender", png: true, type: "donut", width: 6, height: 300, title: "Gender", config: { padding: { top: 0, right: 0, bottom: 0, left: 0 }, type: "donut", size: { height: 250 } } },
      { category: "age", png: true, type: "bar", width: 6, height: 300, title: "Age", config: { padding: { top: 0, right: 50, bottom: 0, left: 120 }, type: "bar", size: { height: 250 }, axis: { rotated: true, y: { tick: { rotate: 60 }, label: '%' } }, tooltip: { format: { value: tooltipFormat } } } },
      { category: "childGender", png: true, type: "donut", width: 6, height: 300, title: "Child gender", config: { padding: { top: 0, right: 0, bottom: 0, left: 0 }, type: "donut", size: { height: 250 } } },
      { category: "childAge", png: true, type: "bar", width: 6, height: 300, title: "Child age", config: { padding: { top: 0, right: 50, bottom: 0, left: 120 }, type: "bar", size: { height: 250 }, axis: { rotated: true, y: { tick: { rotate: 60 }, label: '%' } }, tooltip: { format: { value: tooltipFormat } } } },
      { category: "houseOwnership", png: true, type: "donut", width: 6, height: 300, title: "House ownership", config: { padding: { top: 0, right: 50, bottom: 0, left: 0 }, type: "donut", size: { height: 250 } } },
      { category: "householdIncome", png: true, type: "bar", width: 6, height: 300, title: "Household income", config: { padding: { top: 0, right: 50, bottom: 0, left: 120 }, type: "bar", size: { height: 250 }, axis: { rotated: true, y: { tick: { rotate: 60 }, label: '%' } }, tooltip: { format: { value: tooltipFormat } } } },
      { category: "propertyValue", png: true, type: "bar", width: 6, height: 300, title: "Property value", config: { padding: { top: 0, right: 50, bottom: 0, left: 120 }, type: "bar", size: { height: 250 }, axis: { rotated: true, y: { tick: { rotate: 60 }, label: '%' } }, tooltip: { format: { value: tooltipFormat } } } },
      { category: "education", png: true, type: "donut", width: 6, height: 300, title: "Education", config: { padding: { top: 0, right: 0, bottom: 0, left: 0 }, type: "donut", size: { height: 250 } } },
      { category: "employment", png: true, type: "bar", width: 6, height: 650, title: "Employment", config: { padding: { top: 0, right: 50, bottom: 0, left: 200 }, type: "bar", size: { height: 600 }, axis: { rotated: true, y: { tick: { rotate: 60 }, label: '%' } }, tooltip: { format: { value: tooltipFormat } } } },
      { category: "region", png: true, type: "map", width: 6, height: 650, title: "Regions" },
      { category: "mosaicSubgroups", png: true, pngHeight: 1500, type: "mosaic", width: 12, title: "" }
    ];
  }

  function resizeMosaic() {
    var $mosaic = $(".card .mosaic-groups");
    var scale = $mosaic.parent().width() / $mosaic.width();
    if (scale > 1) scale = 1;
    var parentHeight = $mosaic.height() * scale;
    $mosaic.parent().height(parentHeight);
    $mosaic.css('transform', 'scale(' + scale + ')');
  }

  function resizeMap() {
    var $map = $(".choropleth-map");
    var scale = $map.width() / $map.find("svg").width() - 0.2;
    if (scale > 1) scale = 1;
    $map.css({ transform: 'scale(' + scale + ', ' + scale + ')' });
  }

  function resizeCharts() {
    resizeMosaic();
    resizeMap();
  }

  const categories: AudienceCategory[] = getCategories();
  const property = props.metrics.find((m) => { return m.value === props.selectedMetric })
  return <div className="row no-gutters">
    {
      categories.map((c) => <AudienceChartArea audienceCategory={c} property={property} />)
    }
  </div>;
}
export default AudienceCharts;