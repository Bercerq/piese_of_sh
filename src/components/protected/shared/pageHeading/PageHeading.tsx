import * as React from "react";
import { useParams } from "react-router-dom";
import { ScopeType } from "../../../../client/schemas";
import RootHeading from "./RootHeading";
import OrganizationHeading from "./OrganizationHeading";
import AgencyHeading from "./AgencyHeading";
import AdvertiserHeading from "./AdvertiserHeading";
import CampaignGroupHeading from "./CampaignGroupHeading";
import CampaignHeading from "./CampaignHeading";
import PublisherHeading from "./PublisherHeading";

const PageHeading = () => {
  let params: { scope?, scopeId?} = useParams();
  let scope = params.scope as ScopeType;

  switch (scope) {
    case "root": return <RootHeading />;
    case "organization": return <OrganizationHeading />;
    case "publisher": return <PublisherHeading />;
    case "agency": return <AgencyHeading />;
    case "advertiser": return <AdvertiserHeading />;
    case "campaigngroup": return <CampaignGroupHeading />
    case "campaign": return <CampaignHeading />;
  }
  return null;
}

export default PageHeading;

