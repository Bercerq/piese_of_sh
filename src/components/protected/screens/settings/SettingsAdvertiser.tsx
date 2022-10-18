import React, { useContext, Fragment } from "react";
import { Route, Switch, Redirect, useParams, NavLink } from "react-router-dom";
import { Nav } from "react-bootstrap";
import * as Roles from "../../../../modules/Roles";
import { ScopeDataContextType, Rights, Options, QsContextType } from "../../../../models/Common";
import ScopeDataContext from "../../context/ScopeDataContext";
import CampaignsTab from "./campaigns/CampaignsTab";
import CampaignGroupsTab from "./campaigngroups/CampaignGroupsTab";
import StatisticsDateRangePicker from "../../shared/StatisticsDateRangePicker";
import { Advertiser } from "../../../../models/data/Advertiser";
import { AppUser } from "../../../../models/AppUser";
import UserContext from "../../context/UserContext";
import QsContext from "../../context/QsContext";
import AdvertiserRetailTab from "./retail/AdvertiserRetailTab";

const SettingsAdvertiser = (props: { videoMode: boolean }) => {
  let { page, scope, scopeId }: any = useParams();
  let { data, loadError } = useContext<ScopeDataContextType>(ScopeDataContext);
  const url = `/${page}/${scope}/${scopeId}`;
  const path = "/:page/:scope/:scopeId";
  const rights: Rights = Roles.getRights(data.rights);
  const user: AppUser = useContext<AppUser>(UserContext);
  let { daterange } = useContext<QsContextType>(QsContext);
  const startDate: string = daterange.startDate.format("YYYY-MM-DD");
  const endDate: string = daterange.endDate.format("YYYY-MM-DD");
  const search: string = `?sd=${startDate}&ed=${endDate}`;
  const redirectUrl = getRedirectUrl();

  const options: Options = {
    startDate,
    endDate,
    scope: "advertiser",
    scopeId: parseInt(scopeId, 10),
    statistics: rights.VIEW_STATISTICS,
    videoMetrics: props.videoMode
  };

  const tabOptions = { rights, user, scope, scopeId, options, videoMode: props.videoMode };

  function getRedirectUrl() {
    if (rights.VIEW_CAMPAIGN) {
      return `${path}/campaigns${search}`;
    } else if (rights.VIEW_CAMPAIGNGROUP) {
      return `${path}/campaigngroups${search}`;
    } else {
      if (rights.VIEW_STATISTICS) {
        return `/analytics/:scope/:scopeId`;
      } else if (rights.VIEW_SEGMENTS) {
        return `/segments/:scope/:scopeId`;
      } else if (rights.VIEW_LISTS) {
        return `/lists/:scope/:scopeId`;
      } else if (rights.VIEW_ADS) {
        return `/advault/:scope/:scopeId`;
      } else if (rights.VIEW_REPORTS) {
        return `/reports/:scope/:scopeId`;
      } else if (rights.VIEW_DEALS) {
        return `/deals/:scope/:scopeId`;
      } else if (rights.VIEW_USERS) {
        return `/users/:scope/:scopeId`;
      } else {
        return `/changelog/:scope/:scopeId`;
      }
    }
  }

  if ((data as Advertiser).advertiser || loadError.error) {
    return <Fragment>
      <div className="row page-tabs">
        <Nav as="ul" variant="tabs" defaultActiveKey="/campaigns">
          {rights.VIEW_CAMPAIGN && <Nav.Item as="li">
            <NavLink activeClassName="active" className="nav-link" to={`${url}/campaigns${search}`}>Campaigns</NavLink>
          </Nav.Item>}
          {rights.VIEW_CAMPAIGNGROUP && <Nav.Item as="li">
            <NavLink activeClassName="active" className="nav-link" to={`${url}/campaigngroups${search}`}>Campaign groups</NavLink>
          </Nav.Item>}
          <Nav.Item as="li">
            <NavLink activeClassName="active" className="nav-link" to={`${url}/retail${search}`}>Retail</NavLink>
          </Nav.Item>
        </Nav>
        <div style={{ marginRight: "25px" }}>
          <StatisticsDateRangePicker />
        </div>
      </div>
      <div className="row">
        <Switch>
          <Redirect exact from={path} to={redirectUrl} />
          {rights.VIEW_CAMPAIGN && <Route path={`${path}/campaigns`}><CampaignsTab {...tabOptions} /></Route>}
          {rights.VIEW_CAMPAIGNGROUP && <Route path={`${path}/campaigngroups`}><CampaignGroupsTab {...tabOptions} /></Route>}
          <Route path={`${path}/retail`}><AdvertiserRetailTab {...tabOptions} /></Route>
        </Switch>
      </div>
    </Fragment>;
  }
  return null;
}
export default SettingsAdvertiser;