import React, { useEffect } from "react";
import * as _ from "lodash";

declare var c3: any;

interface C3ChartProps {
  id: string;
  options: any;
  height: string;
}

const C3Chart = (props: C3ChartProps) => {
  useEffect(() => {
    const c3options = _.assign({ bindto: "#" + props.id }, props.options);
    var chart = c3.generate(c3options);
  }, [JSON.stringify(props.options)]);

  return <div id={props.id} style={{ height: props.height }}></div>
}
export default C3Chart;