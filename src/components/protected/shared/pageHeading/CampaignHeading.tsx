import React, { useContext } from "react";
import { Tooltip, OverlayTrigger } from "react-bootstrap";
import * as _ from "lodash";
import { ScopeDataContextType } from "../../../../models/Common";
import ScopeDataContext from "../../context/ScopeDataContext";
import { Campaign, CampaignEntity, CampaignSettings } from "../../../../models/data/Campaign";
import * as CampaignHelper from "../../../../client/CampaignHelper";

const CampaignIcon = (props: { id: string; title: string; iconClasses: string; }) => {
  const tooltip = <Tooltip id={props.id}>{props.title}</Tooltip>;
  return <OverlayTrigger placement="top" overlay={tooltip}><i className={props.iconClasses}></i></OverlayTrigger>;
}

const CampaignHeading = () => {
  let { data } = useContext<ScopeDataContextType>(ScopeDataContext);
  const campaign: CampaignEntity = _.get(data as Campaign | CampaignSettings, "campaign");

  if (campaign) {
    const isRetail = CampaignHelper.isRetail(campaign.structure);
    return <h2>
      {campaign.videoCampaign && <CampaignIcon id="video-campaign-tooltip" title="Video" iconClasses="fa fa-video-camera" />}
      {!campaign.videoCampaign && <CampaignIcon id="display-campaign-tooltip" title="Display" iconClasses="fa fa-image" />}
      {campaign.biddingType === "Adserving" && <CampaignIcon id="adserving-campaign-tooltip" title="Ad serving only" iconClasses="adserving-campaign" />}
      {campaign.biddingType === "RTB" && <CampaignIcon id="rtb-campaign-tooltip" title="RTB" iconClasses="fa fa-gavel" />}
      {campaign.structure === "RETAIL_GPS" && <CampaignIcon id="gps-campaign-tooltip" title="Retail - GPS based" iconClasses="fa fa-globe" />}
      {campaign.structure === "RETAIL_ZIP" && <CampaignIcon id="zip-campaign-tooltip" title="Retail - Postal code based" iconClasses="fa fa-globe" />}
      {!isRetail && campaign.isRetargeting && <CampaignIcon id="retargeting-campaign-tooltip" title="Retargeting" iconClasses="fa fa-refresh" />}
      {!isRetail && !campaign.isRetargeting && <CampaignIcon id="prospecting-campaign-tooltip" title="Prospecting" iconClasses="fa fa-search" />}
      Campaign: {campaign.name}
    </h2>;
  }
  return null;
}
export default CampaignHeading;