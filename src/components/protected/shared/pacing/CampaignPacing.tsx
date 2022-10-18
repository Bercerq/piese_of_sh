import React from "react";
import CampaignPacingPredictions from "./CampaignPacingPredictions";
import CampaignPacingChart from "./CampaignPacingChart";

export interface CampaignPacingProps {
  id: string;
  data: any;
  type: "budget" | "impressions";
  predictionDays: number;
  onPredictionChange: (days: number) => void;
}

const CampaignPacing = (props: CampaignPacingProps) => {
  return <div className="row">
    <div className="col-lg-8">
      <CampaignPacingChart {...props} />
    </div>
    <div className="col-lg-4">
      <React.Fragment>
        <CampaignPacingPredictions {...props} />
        <div id={`${props.id}-changes`}></div>
      </React.Fragment>
    </div>
  </div>;
}
export default CampaignPacing;