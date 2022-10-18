import React, { useContext, Fragment } from "react";
import { Route, Switch, Redirect, NavLink, useParams } from "react-router-dom";
import { Nav } from "react-bootstrap";
import "react-dates/initialize";
import CampaignsTab from "./campaigns/CampaignsTab";
import CampaignGroupsTab from "./campaigngroups/CampaignGroupsTab";
import AdvertisersTab from "./advertisers/AdvertisersTab";
import AgenciesTab from "./agencies/AgenciesTab";
import OrganizationsTab from "./organizations/OrganizationsTab";
import PublishersTab from "./publishers/PublishersTab";
import { ScopeDataContextType, Rights, Options, QsContextType } from "../../../../models/Common";
import * as Roles from "../../../../modules/Roles";
import ScopeDataContext from "../../context/ScopeDataContext";
import { AppUser } from "../../../../models/AppUser";
import UserContext from "../../context/UserContext";
import StatisticsDateRangePicker from "../../shared/StatisticsDateRangePicker";
import QsContext from "../../context/QsContext";

const SettingsRoot = (props: { videoMode: boolean }) => {
  let { page, scope, scopeId }: any = useParams();
  let { data } = useContext<ScopeDataContextType>(ScopeDataContext);

  const url = `/${page}/${scope}/${scopeId}`;
  const path = "/:page/:scope/:scopeId";

  const rights: Rights = Roles.getRights(data.rights);
  const user: AppUser = useContext<AppUser>(UserContext);
  let { daterange } = useContext<QsContextType>(QsContext);
  const startDate: string = daterange.startDate.format("YYYY-MM-DD");
  const endDate: string = daterange.endDate.format("YYYY-MM-DD");
  const search: string = `?sd=${startDate}&ed=${endDate}`;

  const options: Options = {
    startDate,
    endDate,
    scope: "all",
    statistics: rights.VIEW_STATISTICS,
    videoMetrics: props.videoMode
  };

  const tabOptions = { rights, user, scope, scopeId, options, videoMode: props.videoMode };

  return <Fragment>
    <div className="row page-tabs">
      <Nav as="ul" variant="tabs" defaultActiveKey="/campaigns">
        <Nav.Item as="li">
          <NavLink activeClassName="active" className="nav-link" to={`${url}/campaigns${search}`}>Campaigns</NavLink>
        </Nav.Item>
        <Nav.Item as="li">
          <NavLink activeClassName="active" className="nav-link" to={`${url}/campaigngroups${search}`}>Campaign groups</NavLink>
        </Nav.Item>
        <Nav.Item as="li">
          <NavLink activeClassName="active" className="nav-link" to={`${url}/advertisers${search}`}>Advertisers</NavLink>
        </Nav.Item>
        <Nav.Item as="li">
          <NavLink activeClassName="active" className="nav-link" to={`${url}/agencies${search}`}>Agencies</NavLink>
        </Nav.Item>
        <Nav.Item as="li">
          <NavLink activeClassName="active" className="nav-link" to={`${url}/organizations${search}`}>Organizations</NavLink>
        </Nav.Item>
        <Nav.Item as="li">
          <NavLink activeClassName="active" className="nav-link" to={`${url}/publishers${search}`}>Publishers</NavLink>
        </Nav.Item>
      </Nav>
      <div style={{ marginRight: "25px" }}>
        <StatisticsDateRangePicker />
      </div>
    </div>
    <div className="row">
      <Switch>
        <Redirect exact from={`${path}`} to={`${path}/campaigns?sd=${startDate}&ed=${endDate}`} />
        <Route path={`${path}/campaigns`}><CampaignsTab {...tabOptions} /></Route>
        <Route path={`${path}/campaigngroups`}><CampaignGroupsTab {...tabOptions} /></Route>
        <Route path={`${path}/advertisers`}><AdvertisersTab {...tabOptions} /></Route>
        <Route path={`${path}/agencies`}><AgenciesTab {...tabOptions} /></Route>
        <Route path={`${path}/organizations`}><OrganizationsTab {...tabOptions} /></Route>
        <Route path={`${path}/publishers`}><PublishersTab {...tabOptions} /></Route>
      </Switch>
    </div>
  </Fragment>;
}
export default SettingsRoot;