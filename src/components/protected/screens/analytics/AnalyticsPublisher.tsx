import React, { useContext, Fragment } from "react";
import { useParams, Route, Switch, Redirect, NavLink } from "react-router-dom";
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
import StatisticsTab from "./statistics/StatisticsTab";
import OperationalDashboardTab from "./operationalDashboard/OperationalDashboardTab";
import TechnicalDashboardTab from "./technicalDashboard/TechnicalDashboardTab";
import QsContext from "../../context/QsContext";

const AnalyticsPublisher = (props: { videoMode: boolean }) => {
  let { page, scope, scopeId, tab }: any = useParams();
  let { data } = useContext<ScopeDataContextType>(ScopeDataContext);
  const url = `/${page}/${scope}/${scopeId}`;
  const path = "/:page/:scope/:scopeId";
  const rights: Rights = Roles.getRights(data.rights);
  const user: AppUser = useContext<AppUser>(UserContext);
  let {
    daterange,
    attributeId,
    attributeId2,
    filters,
    opfilters,
    opgranularity,
    tgranularity,
    opmetric,
    tperiod
  } = useContext<QsContextType>(QsContext);
  const startDate: string = daterange.startDate.format("YYYY-MM-DD");
  const endDate: string = daterange.endDate.format("YYYY-MM-DD");

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

  function getOperationalTabQs() {
    let query = new URLSearchParams("");
    query.append("sd", startDate);
    query.append("ed", endDate);
    query.append("opgranularity", opgranularity);
    query.append("opmetric", opmetric);
    opfilters.forEach((filter) => {
      query.append("opfilters[]", filter);
    });
    return `?${query.toString()}`;
  }

  function getTechnicalTabQs() {
    let query = new URLSearchParams("");
    query.append("tgranularity", tgranularity);
    query.append("tperiod", tperiod);
    return `?${query.toString()}`;
  }

  const tabProps: TabProps = { rights, user, data, options: getOptions(), videoMode: props.videoMode };
  const statisticsTabQs = getStatisticsTabQs();
  const operationalTabQs = getOperationalTabQs();
  const technicalTabQs = getTechnicalTabQs();

  return <Fragment>
    <div className="row page-tabs">
      <Nav as="ul" variant="tabs" defaultActiveKey="/operational-dashboard">
        <Nav.Item as="li">
          <NavLink activeClassName="active" className="nav-link" to={`${url}/operational-dashboard${operationalTabQs}`}>Operational dashboard</NavLink>
        </Nav.Item>
        <Nav.Item as="li">
          <NavLink activeClassName="active" className="nav-link" to={`${url}/technical-dashboard${technicalTabQs}`}>Technical dashboard</NavLink>
        </Nav.Item>
        <Nav.Item as="li">
          <NavLink activeClassName="active" className="nav-link" to={`${url}/statistics${statisticsTabQs}`}>Statistics</NavLink>
        </Nav.Item>
      </Nav>
      <div style={{ marginRight: "25px" }}>
        {tab !== "technical-dashboard" &&
          <StatisticsDateRangePicker />
        }
      </div>
    </div>
    <div className="row">
      <Switch>
        <Redirect exact from={`${path}`} to={`${path}/operational-dashboard${operationalTabQs}`} />
        <Route path={`${path}/operational-dashboard`}><OperationalDashboardTab {...tabProps} /></Route>
        <Route path={`${path}/technical-dashboard`}><TechnicalDashboardTab {...tabProps} /></Route>
        <Route path={`${path}/statistics`}><StatisticsTab {...tabProps} /></Route>
      </Switch>
    </div>
  </Fragment>;
}
export default AnalyticsPublisher;