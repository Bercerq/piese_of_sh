import React, { Fragment } from "react";
import * as _ from "lodash";
import { TabProps } from "../../../../../models/Common";
import CampaignPacingContainer from "./CampaignPacingContainer";
import Summary from "./Summary";

const DashboardCampaign = (props: TabProps) => {
  const budgetProps = _.assign({}, props, { type: "budget_completion" });
  const impressionsProps = _.assign({}, props, { type: "impression_completion" });

  return <Fragment>
    <Summary {...props} />
    <CampaignPacingContainer {...budgetProps} />
    <CampaignPacingContainer {...impressionsProps} />
  </Fragment>;
}
export default DashboardCampaign;