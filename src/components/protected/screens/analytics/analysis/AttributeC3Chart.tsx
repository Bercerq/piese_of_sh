import React from "react";
import C3Chart from "../../../../UI/C3Chart";
import { AttributeGraphProps } from "./AttributeGraph";

declare var $: any;

const AttributeC3Chart = (props: AttributeGraphProps) => {
  function getColumns() {
    if (props.chartType === "donut") {
      return props.data.map((row) => {
        return [row.displayName, row[props.metric.col]];
      });
    } else if (props.chartType === "bar") {
      let columns = [
        ['x'],
        [props.metric.col]
      ];
      props.data.forEach((row) => {
        columns[0].push(row.displayName);
        columns[1].push(row[props.metric.col]);
      });
      return columns;
    }
  }

  function getAttributeGraph(config) {
    if (config.type == 'donut') {
      return donutGraph(config);
    } else if (config.type == 'bar') {
      return barChart(config);
    }
  }

  function donutGraph(config) {
    const donutConfig = { data: { type: 'donut' }, donut: { title: props.attributeLabel }, axis: { x: { show: false } } };
    return $.extend(true, defaultGraph(), donutConfig, config);
  }

  function barChart(config) {
    const barConfig = { padding: { top: 0, right: 20, bottom: 0, left: 60 }, legend: { show: false }, data: { type: 'bar', x: 'x' }, axis: { x: { type: 'category', tick: { rotate: 60, multiline: false } } } };
    return $.extend(true, defaultGraph(), barConfig, config);
  }

  function defaultGraph() {
    return {
      size: { height: 275 },
      padding: { top: 0, right: 20, bottom: 0, left: 40 },
      color: { pattern: ['#089bc2', '#96c03d', '#f58129', '#a62174', '#1f3364', '#ccc'] },
      legend: { show: true },
      point: { show: false }
    };
  }

  function getC3Options() {
    const columns = getColumns();
    const size = getSize();
    const config = {
      type: props.chartType,
      size,
      data: { columns }
    }
    return getAttributeGraph(config);
  }

  function getSize() {
    if (props.png) {
      if (props.chartType === "donut") {
        return { width: 1000, height: 1000 }
      } else {
        return { width: 1000, height: 500 }
      }
    } else {
      return { height: 300 };
    }
  }

  const options = getC3Options();
  return <C3Chart id={props.id} height={options.size.height + "px"} options={options} />
}
export default AttributeC3Chart;