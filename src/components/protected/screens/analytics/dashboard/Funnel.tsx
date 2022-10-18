import React, { useEffect } from "react";
import * as Utils from "../../../../../client/Utils";

declare var D3Funnel: any;

const Funnel = (props: { id: any; data: any; }) => {
  if (props.data && props.data.bids > 0) {
    useEffect(() => {
      const funnel = new D3Funnel(`#${props.id}`);
      funnel.draw(funneldata, funnelOptions);
    }, [JSON.stringify(props.data)])

    const funneldata = [
      ['Bids', [260, Utils.numberWithCommas(props.data.bids)]],
      ['Impressions', [210, Utils.numberWithCommas(props.data.impressions)]],
      ['Viewable', [185, Utils.numberWithCommas(props.data.viewable)]],
      ['Clicks', [160, Utils.numberWithCommas(props.data.clicks)]],
      ['Conversions', [140, Utils.numberWithCommas(props.data.conversions)]]
    ];

    const funnelOptions = {
      chart: {
        height: 350
      },
      label: {
        format: '{l}\n{f}'
      },
      block: {
        dynamicSlope: true,
      }
    };

    return <div id={props.id} className="funnel"></div>;
  } else {
    return <div>No data in selected period.</div>
  }

}
export default Funnel;