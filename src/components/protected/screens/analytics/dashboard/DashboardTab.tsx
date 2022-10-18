import React from "react";
import { useParams } from "react-router-dom";
import { TabProps } from "../../../../../models/Common";
import { ScopeType } from "../../../../../client/schemas";
import DashboardRoot from "./DashboardRoot";
import DashboardOrganization from "./DashboardOrganization";
import DashboardAgency from "./DashboardAgency";
import DashboardAdvertiser from "./DashboardAdvertiser";
import DashboardCampaign from "./DashboardCampaign";
import DashboardCampaignGroup from "./DashboardCampaignGroup";

const DashboardTab = (props: TabProps) => {
  let { scope }:any = useParams();
  switch ((scope as ScopeType)) {
    case "root": return <DashboardRoot {...props} />;
    case "organization": return <DashboardOrganization {...props} />;
    case "agency": return <DashboardAgency {...props} />
    case "advertiser": return <DashboardAdvertiser {...props} />;
    case "campaigngroup": return <DashboardCampaignGroup {...props} />;
    case "campaign": return <DashboardCampaign {...props} />;
  }
  return null;
}
export default DashboardTab;