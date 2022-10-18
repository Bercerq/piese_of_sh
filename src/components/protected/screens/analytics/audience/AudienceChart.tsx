import React, { useEffect } from "react";
import * as _ from "lodash";
import * as AudienceHelper from "./AudienceHelper";
import { AudienceChartProps } from "./AudienceSchemas";

declare var $: any;
declare var c3: any;

const AudienceChart = (props: AudienceChartProps) => {
  const chartId = `chart-${props.audienceCategory.category.toLowerCase()}`;

  useEffect(() => {
    $('body').popover({
      selector: '[data-toggle="popover"]',
      container: 'body',
      html: true,
      trigger: 'hover'
    });
  }, []);

  useEffect(() => {
    drawChart("#" + chartId, props.property, props.audienceCategory);
  }, [JSON.stringify(props)]);

  function drawChart(chartId, property, category) {
    if (category.type === "bar" || category.type === "donut") {
      const columns = AudienceHelper.chartColumns(category, property);
      const graph = AudienceHelper.createAttributeGraph(chartId, { property: property.label }, _.assign({}, { data: { columns: columns, order: 'desc' } }, category.config));
      const chart = c3.generate(graph);
    } else if (category.type === "mosaic") {
      AudienceHelper.mosaicGraph(chartId, category, property);
    } else if (category.type === "map") {
      const dimensions = {
        width: 600,
        height: 600,
        scale: 7000
      };
      AudienceHelper.choroplethMap(chartId, category, property, dimensions);
    }
  }

  return <div id={chartId} className="text-center"></div>;
}
export default AudienceChart;