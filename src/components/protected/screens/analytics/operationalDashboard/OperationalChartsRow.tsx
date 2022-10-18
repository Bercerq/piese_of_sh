import React from "react";
import * as _ from "lodash";
import moment from "moment";
import C3Chart from "../../../../UI/C3Chart";

interface OperationalChartsRowProps {
  data: any;
  granularity: "P1D" | "PT1H";
}

const OperationalChartsRow = (props: OperationalChartsRowProps) => {
  const chart1ID = `${_.kebabCase(props.data.name)}-chart1`;
  const chart2ID = `${_.kebabCase(props.data.name)}-chart2`;
  const categories = getCategories();

  const chart1Options = getChartOptions(["maxAdpodSpots", "bidsInternal", "impressions"], categories);
  const chart2Options = getChartOptions(["avgBid", "winning_cpm"], categories);

  function getChartOptions(metrics: string[], categories: string[]) {
    const columns = getColumns(metrics);
    let showPoint: boolean = false;
    if(columns.length > 0 && columns[0].length === 2) showPoint = true;
    return {
      data: {
        columns
      },
      padding: {
        right: 20
      },
      axis: {
        x: {
          type: 'category',
          categories,
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

  function getCategories() {
    let format = props.granularity === "P1D" ? "YYYY-MM-DD" : "YYYY-MM-DD HH:mm";
    return props.data.results.map((o) => {
      return moment(o.dateTime).format(format);
    });
  }

  function getMetricLabel(metric: string) {
    switch (metric) {
      case "maxAdpodSpots": return "spots";
      case "bidsInternal": return "bids";
      case "avgBid": return "avg bid";
      case "winning_cpm": return "winning price";
      default: return metric;
    }
  }

  return <div className="row no-gutters">
    <div className="col-lg-6">
      <C3Chart id={chart1ID} options={chart1Options} height="300px" />
    </div>
    <div className="col-lg-6">
      <C3Chart id={chart2ID} options={chart2Options} height="300px" />
    </div>
  </div>
}
export default OperationalChartsRow;