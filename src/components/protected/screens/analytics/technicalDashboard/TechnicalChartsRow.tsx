import React from "react";
import * as _ from "lodash";
import moment from "moment";
import C3Chart from "../../../../UI/C3Chart";

interface TechnicalChartsRowProps {
  data: any;
}

const TechnicalChartsRow = (props: TechnicalChartsRowProps) => {
  const chart1ID = `${_.kebabCase(props.data.name)}-technical-chart1`;
  const chart2ID = `${_.kebabCase(props.data.name)}-technical--chart2`;
  const chart3ID = `${_.kebabCase(props.data.name)}-technical--chart3`;
  const categories = getCategories();

  const chart1Options = getChartOptions(["timeouts", "request_errors", "bids_filtered", "bids_error"], categories);
  const chart2Options = getChartOptions(["request_quantile_75", "request_quantile_95", "request_quantile_99"], categories);
  const chart3Options = getChartOptions(["request_number", "bid_number", "won_bids"], categories);

  function getCategories() {
    return props.data.results.map((o) => {
      return moment(o.dateTime).format("YYYY-MM-DD HH:mm");
    });
  }

  function getChartOptions(metrics: string[], categories: string[]) {
    const columns = getColumns(metrics);
    let showPoint: boolean = false;
    if (columns.length > 0 && columns[0].length === 2) showPoint = true;
    return {
      data: {
        columns
      },
      axis: {
        x: {
          type: 'category',
          categories,
          padding: {
            right: 20
          },
          tick: {
            culling: {
              max: 15
            },
            rotate: 60,
            multiline: false,
            fit: true
          },
          height: 100
        },
        y: {
          min: 0,
          padding: {
            bottom: 0
          }
        }
      },
      point: {
        show: showPoint
      },
      size: {
        height: 300
      }
    };
  }

  function getColumns(metrics: string[]) {
    return metrics.map((m) => { return getDataArray(m); });
  }

  function getDataArray(metric: string) {
    const cArray = [getMetricLabel(metric)];
    const cDataArray = props.data.results.map((o) => {
      return o.metrics[metric];
    });
    return cArray.concat(cDataArray);
  }

  function getMetricLabel(metric: string) {
    switch (metric) {
      case "timeouts": return "time outs";
      case "request_errors": return "request errors";
      case "bids_filtered": return "filtered bids";
      case "bids_error": return "bids error";
      case "request_quantile_75": return "response time (75%)";
      case "request_quantile_95": return "response time (95%)";
      case "request_quantile_99": return "response time (99%)";
      case "request_number": return "bid requests";
      case "bid_number": return "bids";
      case "won_bids": return "bids won";
      default: return metric;
    }
  }

  return <div className="row no-gutters">
    <div className="col-lg-4">
      <C3Chart id={chart1ID} options={chart1Options} height="300px" />
    </div>
    <div className="col-lg-4">
      <C3Chart id={chart2ID} options={chart2Options} height="300px" />
    </div>
    <div className="col-lg-4">
      <C3Chart id={chart3ID} options={chart3Options} height="300px" />
    </div>
  </div>
}
export default TechnicalChartsRow;