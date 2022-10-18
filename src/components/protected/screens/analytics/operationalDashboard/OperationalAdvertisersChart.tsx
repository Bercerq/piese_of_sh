import React from "react";
import * as _ from "lodash";
import moment from "moment";
import C3Chart from "../../../../UI/C3Chart";

interface OperationalAdvertisersChartProps {
  data: any[];
  granularity: "P1D" | "PT1H";
  metric: "impressions" | "mediaCost"
}

const OperationalAdvertisersChart = (props: OperationalAdvertisersChartProps) => {
  const chartID = "advertisers-chart";
  const categories = getCategories();
  const chartOptions = getChartOptions(categories);

  function getChartOptions(categories: string[]) {
    const columns = getColumns();
    const types = getTypes();
    const groups = [getGroups()];
    let showPoint: boolean = false;
    if(columns.length > 0 && columns[0].length === 2) showPoint = true;
    return {
      data: {
        columns,
        types,
        groups
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
        }
      },
      point: {
        show: showPoint
      },
      size: {
        height: 500
      }
    };
  }

  function getColumns() {
    return props.data.map((row) => { return getDataArray(row); });
  }

  function getDataArray(row) {
    const cArray = [row.name];
    const cDataArray = row.results.map((o) => {
      return o.metrics[props.metric];
    });
    return cArray.concat(cDataArray);
  }

  function getTypes() {
    let types: any = {};
    props.data.forEach((row) => {
      types[row.name] = "area";
    });
    return types;
  }

  function getGroups() {
    return props.data.map((row) => { return row.name });
  }

  function getCategories() {
    let format = props.granularity === "P1D" ? "YYYY-MM-DD" : "YYYY-MM-DD HH:mm";
    return props.data[0].results.map((o) => {
      return moment(o.dateTime).format(format);
    });
  }

  return <div className="row">
    <div className="col-lg-12">
      <C3Chart id={chartID} options={chartOptions} height="300px" />
    </div>
  </div>
}
export default OperationalAdvertisersChart;