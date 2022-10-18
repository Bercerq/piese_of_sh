import React, { useContext, useState, useEffect, Fragment } from "react";
import { useParams, Route, Switch, Redirect, NavLink, useLocation } from "react-router-dom";
import { Nav } from "react-bootstrap";
import "react-dates/initialize";
import { AppUser } from "../../../../models/AppUser";
import UserContext from "../../context/UserContext";
import { ScopeType } from "../../../../client/schemas";
import { ScopeDataContextType, Rights, Options, TabProps, QsContextType } from "../../../../models/Common";
import ScopeDataContext from "../../context/ScopeDataContext";
import * as Roles from "../../../../modules/Roles";
import * as Helper from "../../../../client/Helper";
import StatisticsDateRangePicker from "../../shared/StatisticsDateRangePicker";
import DashboardTab from "./dashboard/DashboardTab";
import AudienceTab from "./audience/AudienceTab";
import AnalysisTab from "./analysis/AnalysisTab";
import StatisticsTab from "./statistics/StatisticsTab";
import { Agency } from "../../../../models/data/Agency";
import { Advertiser } from "../../../../models/data/Advertiser";
import { CampaignGroup } from "../../../../models/data/CampaignGroup";
import { Campaign } from "../../../../models/data/Campaign";
import * as Api from "../../../../client/Api";
import SegmentsTab from "./segments/SegmentsTab";
import QsContext from "../../context/QsContext";

const Analytics = (props: { videoMode: boolean }) => {
  let { page, scope, scopeId }: any = useParams();
  let { data } = useContext<ScopeDataContextType>(ScopeDataContext);
  const [digitalAudience, setDigitalAudience] = useState<boolean>(false);
  const url = `/${page}/${scope}/${scopeId}`;
  const path = "/:page/:scope/:scopeId";
  const rights: Rights = Roles.getRights(data.rights);
  const user: AppUser = useContext<AppUser>(UserContext);
  let { daterange, attributeId, attributeId2, filters } = useContext<QsContextType>(QsContext);
  const startDate: string = daterange.startDate.format("YYYY-MM-DD");
  const endDate: string = daterange.endDate.format("YYYY-MM-DD");

  useEffect(() => { loadDigitalAudience(); }, [JSON.stringify(data)]);

  async function loadDigitalAudience() {
    if (scope === "root" || scope === "organization") {
      setDigitalAudience(true);
    } else if (scope === "agency") {
      return setDigitalAudience((data as Agency).agency.digitalAudience || false);
    } else if (scope === "advertiser") {
      return setDigitalAudience((data as Advertiser).advertiser.digitalAudience || false);
    } else {
      let advertiserId = -1;
      if (scope === "campaigngroup") {
        advertiserId = (data as CampaignGroup).campaignGroup.advertiserId;
      } else if (scope === "campaign") {
        advertiserId = (data as Campaign).campaign.advertiserId;
      }
      if (advertiserId > 0) {
        try {
          const advertiser: Advertiser = await Api.Get({ path: `/api/advertisers/${advertiserId}` });
          setDigitalAudience(advertiser.advertiser.digitalAudience || false);
        } catch (err) {
          setDigitalAudience(false);
        }
      }
    }
  }

  function getOptions(): Options {
    const sourceScope = Helper.getSourceScope(scope as ScopeType);
    if (scope === "root") {
      return {
        scope: sourceScope,
        startDate,
        endDate
      }
    } else {
      return {
        scope: sourceScope,
        scopeId,
        startDate,
        endDate
      }
    }
  }

  function getStatisticsTabQs() {
    let query = new URLSearchParams("");
    query.append("sd", startDate);
    query.append("ed", endDate);
    query.append("attributeId", attributeId.toString());
    query.append("attributeId2", attributeId2.toString());
    filters.forEach((filter) => {
      query.append("filters[]", filter);
    });
    return `?${query.toString()}`;
  }

  const tabProps: TabProps = { rights, user, data, options: getOptions(), videoMode: props.videoMode };
  const statisticsTabQs = getStatisticsTabQs();

  return <Fragment>
    <div className="row page-tabs">
      <Nav as="ul" variant="tabs" defaultActiveKey="/dashboard">
        <Nav.Item as="li">
          <NavLink activeClassName="active" className="nav-link" to={`${url}/dashboard?sd=${startDate}&ed=${endDate}`}>Dashboard</NavLink>
        </Nav.Item>
        <Nav.Item as="li">
          <NavLink activeClassName="active" className="nav-link" to={`${url}/statistics${statisticsTabQs}`}>Statistics</NavLink>
        </Nav.Item>
        {digitalAudience &&
          <Nav.Item as="li">
            <NavLink activeClassName="active" className="nav-link" to={`${url}/audience?sd=${startDate}&ed=${endDate}`}>Audience</NavLink>
          </Nav.Item>
        }
        <Nav.Item as="li">
          <NavLink activeClassName="active" className="nav-link" to={`${url}/analysis?sd=${startDate}&ed=${endDate}`}>Advanced analysis</NavLink>
        </Nav.Item>
        {scope === "campaign" &&
          <Nav.Item as="li">
            <NavLink activeClassName="active" className="nav-link" to={`${url}/segments?sd=${startDate}&ed=${endDate}`}>Segment insights</NavLink>
          </Nav.Item>
        }
      </Nav>
      <div style={{ marginRight: "25px" }}>
        <StatisticsDateRangePicker />
      </div>
    </div>
    <div className="row">
      <Switch>
        <Redirect exact from={`${path}`} to={`${path}/dashboard?sd=${startDate}&ed=${endDate}`} />
        <Route path={`${path}/dashboard`}><DashboardTab {...tabProps} /></Route>
        <Route path={`${path}/statistics`}><StatisticsTab {...tabProps} /></Route>
        {digitalAudience && <Route path={`${path}/audience`}><AudienceTab {...tabProps} /></Route>}
        <Route path={`${path}/analysis`}><AnalysisTab {...tabProps} /></Route>
        {scope === "campaign" && <Route path={`${path}/segments`}><SegmentsTab {...tabProps} /></Route>}
      </Switch>
    </div>
  </Fragment>;
}
export default Analytics;