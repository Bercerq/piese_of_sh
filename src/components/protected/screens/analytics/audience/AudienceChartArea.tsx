import React from "react";
import { AudienceChartProps } from "./AudienceSchemas";
import AudienceChartHeader from "./AudienceChartHeader";
import AudienceChart from "./AudienceChart";

const AudienceChartArea = (props: AudienceChartProps) => {

  function getCardStyle() {
    if (props.audienceCategory.height) {
      return { height: `${props.audienceCategory.height}px` }
    }
    return {};
  }

  const cardStyle = getCardStyle();
  return <div className={`col-lg-${props.audienceCategory.width} mb-3`}>
    <div className="card mr-2" style={cardStyle}>
      <AudienceChartHeader {...props} />
      <AudienceChart {...props} />
      <div className="graph-png-container">
        <div className="attribute-graph" id={`chart-${props.audienceCategory.category.toLowerCase()}-png`}>
        </div>
      </div>
    </div>
  </div>;
}
export default AudienceChartArea;