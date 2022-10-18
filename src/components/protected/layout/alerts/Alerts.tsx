import * as React from "react";
import { Link, useParams } from "react-router-dom";
import { OverlayTrigger, Popover } from "react-bootstrap";
import * as _ from "lodash";
import moment from "moment";
import * as Utils from "../../../../client/Utils";
import * as Helper from "../../../../client/Helper";
import { Alert } from "../../../../models/data/Alert";
import FontIcon from "../../../UI/FontIcon";

const AlertsPopoverNoResults = () => {
  const popover = <Popover id="alerts-popover" className="alerts-list-popover">
    <Popover.Content><div className="alerts-list-noresults">No alerts found.</div></Popover.Content>
  </Popover>;
  return <OverlayTrigger trigger="click" placement="bottom" overlay={popover} rootClose>
    <div className="alerts-list-toggle">
      <FontIcon name="bell-o" />
    </div>
  </OverlayTrigger>;
}

const headerLinkText = (count: number): string => {
  if (count === 11) {
    return "1 more message not shown. See all"
  } else if (count > 11) {
    return `${count - 10} more message not shown. See all`;
  } else {
    return "See all";
  }
}

const AlertRow = (props: { alert: Alert }) => {
  if (props.alert.alertType === "NO_AD_LINK") {
    const sDate = Utils.getStartDate(moment.unix(props.alert.startTime));
    const eDate = Utils.getEndDate(moment.unix(props.alert.endTime));
    const to = Helper.campaignSettingsLink(`/settings/campaign/${props.alert.campaignId}/ads`);
    if (props.alert.warningLevel === 3) {
      return <li className="alert-list-row-danger">
        <Link to={to}><span className="alert-list-name">{props.alert.campaignName}</span> that started on {sDate} and ends on {eDate} has no active ads.</Link>
      </li>;
    } else {
      return <li className="alert-list-row-warning">
        <Link to={to}><span className="alert-list-name">{props.alert.campaignName}</span> that starts on {sDate} and ends on {eDate} has no active ads.</Link>
      </li>;
    }
  } else {
    return null;
  }
}

export const AlertsList = (props: { alerts: Alert[] }) => {
  return <ul className="alerts-list">
    {
      props.alerts.map((alert, i) => <AlertRow key={`alert-list-row${i}`} alert={alert} />)
    }
  </ul>;
}

export const AlertsPopover = (props: { alerts: Alert[] }) => {
  const count = props.alerts.length;
  if (count > 0) {
    let { scope, scopeId }: any = useParams();
    const warningLevel = _.maxBy(props.alerts, "warningLevel").warningLevel;
    const badgeColor: string = warningLevel === 3 ? "red" : "#ee7d0c";
    const alerts = _.take(props.alerts, 10);

    const popover = <Popover id="alerts-popover" className="alerts-list-popover">
      <Popover.Content>
        <div className="alerts-list-header">
          <h4>Alerts</h4>
          <Link to={`/alerts/${scope}/${scopeId}`}>{headerLinkText(count)}</Link>
        </div>
        <AlertsList alerts={alerts} />
      </Popover.Content>
    </Popover>;

    return <OverlayTrigger trigger="click" placement="bottom" overlay={popover} rootClose>
      <div className="alerts-list-toggle">
        <FontIcon name="bell-o" />
        <span className="alerts-list-badge" style={{ backgroundColor: badgeColor }}>{count}</span>
      </div>
    </OverlayTrigger>;
  } else {
    return <AlertsPopoverNoResults />;
  }
}