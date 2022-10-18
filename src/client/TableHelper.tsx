import React, { Fragment } from "react";
import { Link } from "react-router-dom";
import * as _ from "lodash";
import moment from "moment";
import { Popover, OverlayTrigger, Tooltip } from "react-bootstrap";
import * as Utils from "./Utils";
import * as Helper from "./Helper";
import { MetricType } from "./schemas";
import { Pacing } from "../models/data/CampaignGroup";
import FontIcon from "../components/UI/FontIcon";
import { AppUser } from "../models/AppUser";
import CompletionBarContainer from "../components/protected/shared/pacing/CompletionBarContainer";

export const columnSort = (order, column) => {
  if (!order) return null;
  else if (order === 'asc') return (<FontIcon name="angle-up" />);
  else if (order === 'desc') return (<FontIcon name="angle-down" />);
  return null;
}

export const getLastPage = (rows, sizePerPage) => {
  let lastPage = 1;
  const length = rows.length;
  if (length > 0) {
    if (length % sizePerPage === 0) {
      lastPage = length / sizePerPage;
    } else {
      lastPage = length / sizePerPage + 1;
    }
  }
  return lastPage;
}

export const undefinedFormatter = (cellContent: any, row?: any): JSX.Element | string => {
  if (_.isNil(cellContent)) {
    return "-";
  }
  return cellContent;
}

export const organizationFormatter = (cellContent: any, row: any): JSX.Element | string => {
  if (!_.isNil(cellContent)) {
    return <Link to={`/settings/organization/${row.id}`}>{cellContent}</Link>;
  }
  return "-";
}

export const publisherFormatter = (cellContent: any, row: any): JSX.Element | string => {
  if (!_.isNil(cellContent)) {
    return <Link to={`/analytics/publisher/${row.id}`}>{cellContent}</Link>;
  }
  return "-";
}

export const agencyFormatter = (cellContent: any, row: any): JSX.Element | string => {
  if (!_.isNil(cellContent)) {
    return <Link to={`/settings/agency/${row.id}`}>{cellContent}</Link>;
  }
  return "-";
}

export const advertiserFormatter = (cellContent: any, row: any): JSX.Element | string => {
  if (!_.isNil(cellContent)) {
    return <Link to={`/settings/advertiser/${row.id}`}>{cellContent}</Link>;
  }
  return "-";
}

export const advertiserLinkFormatter = (cellContent: any, row: any): JSX.Element | string => {
  if (!_.isNil(cellContent)) {
    return <Link to={`/settings/advertiser/${row.advertiserId}`}>{cellContent}</Link>;
  }
  return "-";
}

export const campaigngroupFormatter = (cellContent: any, row: any): JSX.Element | string => {
  if (!_.isNil(cellContent)) {
    return <Link to={`/settings/campaigngroup/${row.id}`}>{cellContent}</Link>;
  }
  return "-";
}

export const campaignFormatter = (cellContent: any, row: any): JSX.Element | string => {
  if (!_.isNil(cellContent)) {
    const to = Helper.campaignSettingsLink(`/settings/campaign/${row.id}/general`);
    if (row.remarks) {
      const tooltip = <Tooltip id={`campaign-tooltip-${row.id}`}>{row.remarks}</Tooltip>;
      const popperConfig = Helper.getPopperConfig();
      return <OverlayTrigger placement="top" overlay={tooltip} popperConfig={popperConfig}><Link to={to}>{cellContent}</Link></OverlayTrigger>;
    } else {
      return <Link to={to}>{cellContent}</Link>
    }
  }
  return "-";
}

export const campaignListFormatter = (cellContent: any, row: any): JSX.Element | string => {
  const href = `/settings/campaigngroup/${row.id}`;
  if (cellContent && cellContent.length > 0) {
    const grouped = _.groupBy(cellContent, 'status');
    const groups = [];
    _.forEach(grouped, (group, key) => {
      groups.push({ group, key });
    });
    const popover = <Popover id={"campaign-list-" + row.id}><PopoverContent groups={groups} type="campaigns" /></Popover>
    return <OverlayTrigger trigger={['hover', 'focus']} placement="right" overlay={popover}>
      <Link to={href}>{cellContent.length.toString()}</Link>
    </OverlayTrigger>;
  } else {
    const popover = <Popover id={"campaign-list-" + row.id}><Popover.Content>No campaigns in group</Popover.Content></Popover>
    return <OverlayTrigger trigger={['hover', 'focus']} placement="right" overlay={popover}>
      <Link to={href}>0</Link>
    </OverlayTrigger>;
  }
}

export const adListFormatter = (cellContent: any, row: any): JSX.Element | string => {
  const to = Helper.campaignSettingsLink(`/settings/campaign/${row.id}/ads`);
  if (cellContent && cellContent.length > 0) {
    const grouped = _.groupBy(cellContent, 'status');
    const groups = [];
    _.forEach(grouped, (group, key) => {
      groups.push({ group, key });
    });
    const length = grouped.active ? grouped.active.length : 0;
    const popover = <Popover id={"ad-list-" + row.id}><PopoverContent groups={groups} type="ads" /></Popover>
    return <OverlayTrigger trigger={['hover', 'focus']} placement="right" overlay={popover}>
      <Link to={to}>{length.toString()}</Link>
    </OverlayTrigger>;
  } else {
    const popover = <Popover id={"campaign-list-" + row.id}><Popover.Content>No ads linked to campaign</Popover.Content></Popover>
    return <OverlayTrigger trigger={['hover', 'focus']} placement="right" overlay={popover}>
      <Link to={to}>0</Link>
    </OverlayTrigger>;
  }
}

export const segmentActiveFormatter = (cellContent: any, row: any, rowIndex: any): JSX.Element | string => {
  let tooltip = "Segment has not fired";
  let color = "red";

  if (cellContent) {
    const lastEventDate = moment(cellContent).unix();
    const midnightDate = moment(new Date().setHours(0, 0, 0, 0)).unix(); // today from midnight

    if (lastEventDate > midnightDate) {
      color = "green";
      tooltip = "Segment fired today at " + moment(cellContent).format("HH:mm:ss");
    } else {
      tooltip = "Segment last fired on " + moment(cellContent).format("YYYY/MM/DD HH:mm:ss");
    }
  }

  const rowTooltip = <Tooltip id={"segment-tooltip-" + rowIndex}>{tooltip}</Tooltip>;
  const popperConfig = Helper.getPopperConfig();
  return <OverlayTrigger placement="top" overlay={rowTooltip} popperConfig={popperConfig}>
    <span id={"segment-active-" + rowIndex} className={"segment-active circle " + color}></span>
  </OverlayTrigger>;
}

export const budgetCompletionFormatter = (chartClick: (id: number, type: "budget_completion" | "impression_completion") => void) => (cellContent: any, row: any): JSX.Element | string => {
  return <CompletionBar type="budget_completion" row={row} pacing={cellContent} chartClick={chartClick} />;
}

export const impressionCompletionFormatter = (chartClick: (id: number, type: "budget_completion" | "impression_completion") => void) => (cellContent: any, row: any): JSX.Element | string => {
  return <CompletionBar type="impression_completion" row={row} pacing={cellContent} chartClick={chartClick} />;
}

export const numberFormatter = (cellContent: any, row?: any): JSX.Element | string => {
  if (!_.isNil(cellContent)) {
    return Utils.numberWithCommas(cellContent);
  }
  return "-";
}

export const currencyFormatter = (cellContent: any, row?: any): JSX.Element | string => {
  if (!_.isNil(cellContent)) {
    return Utils.currency(cellContent);
  }
  return "-";
}

export const percentageFormatter = (cellContent: any, row?: any): JSX.Element | string => {
  if (!_.isNil(cellContent)) {
    return Utils.percentage(cellContent);
  }
  return "-";
}

export const percentageRoundFormatter = (cellContent: any, row?: any): JSX.Element | string => {
  if (!_.isNil(cellContent)) {
    return cellContent + '%';
  }
  return "-";
}

export const startDateFormatter = (cellContent: any, row: any): JSX.Element | string => {
  if (!_.isNil(cellContent)) {
    const momentDt = moment.unix(cellContent);
    return Utils.getStartDate(momentDt);
  }
  return "-";
}

export const endDateFormatter = (cellContent: any, row: any): JSX.Element | string => {
  if (!_.isNil(cellContent)) {
    const momentDt = moment.unix(cellContent);
    return Utils.getEndDate(momentDt);
  }
  return "-";
}

export const booleanFormatter = (cellContent: any, row: any): JSX.Element | string => {
  if (cellContent) {
    return <span className="text-success"><FontIcon names={["check", "lg"]} /></span>;
  } else {
    return <span className="text-danger"><FontIcon names={["remove", "lg"]} /></span>;
  }
}

export const getFormatter = (type: MetricType, chartClick?: (id: number, type: "budget_completion" | "impression_completion") => void): ((cellContent: any, row?: any, rowIndex?: any) => JSX.Element | string) => {
  switch (type) {
    case "organization": return organizationFormatter;
    case "publisher": return publisherFormatter;
    case "agency": return agencyFormatter;
    case "advertiser": return advertiserFormatter;
    case "advertiser_link": return advertiserLinkFormatter;
    case "campaigngroup": return campaigngroupFormatter;
    case "campaign": return campaignFormatter
    case "campaign_list": return campaignListFormatter;
    case "ad_list": return adListFormatter;
    case "budget_completion": return budgetCompletionFormatter(chartClick);
    case "impression_completion": return impressionCompletionFormatter(chartClick);
    case "number": return numberFormatter;
    case "money": return currencyFormatter;
    case "perc": return percentageFormatter;
    case "start": return startDateFormatter;
    case "end": return endDateFormatter;
    default: return undefinedFormatter;
  }
}

export const getPercentageFormatter = (type: MetricType): ((cellContent: any, row?: any, rowIndex?: any) => JSX.Element | string) => {
  switch (type) {
    case "number": return percentageRoundFormatter;
    case "money": return percentageRoundFormatter;
    case "perc": return percentageRoundFormatter;
    default: return undefinedFormatter;
  }
}

export const storeSizePerPage = (sizePerPage: number, tableId: string, user: AppUser): void => {
  const key = user.email + "-" + tableId + "-pageLength";
  if ([30, 50, 100].indexOf(sizePerPage) < 0) {
    localStorage[key] = "all";
  } else {
    localStorage[key] = sizePerPage;
  }
}

export const getSizePerPage = (sizePerPage: number | "all", length: number): number => {
  return (sizePerPage === "all" && length !== 0) ? length : sizePerPage as number;
}

export const getInitialSizePerPage = (tableId: string, user: AppUser): (number | "all") => {
  const pageLength = localStorage[user.email + "-" + tableId + "-pageLength"];
  if (pageLength === "all" || parseInt(pageLength) > 0) {
    return pageLength;
  }
  return 30;
}

const PopoverContent = (props: { groups: any[]; type: string }) => {
  return <Popover.Content>
    <table>
      <tbody>
        {
          props.groups.map((row, i) => <tr key={`tooltip-row-${props.type}-${i}`}>
            <td className="popover-status"><strong>{row.group.length} {row.key.toLowerCase()}</strong></td>
            <td className="popover-list"><PopoverList records={row.group} type={props.type} /></td>
          </tr>)
        }
      </tbody>
    </table>
  </Popover.Content>;
}

const PopoverList = (props: { records: any[], type: string }) => {
  return <ul>
    {
      props.records.map((campaign, j) => <li key={`tooltip-${props.type}-${j}`}>{campaign.name}</li>)
    }
  </ul>
}

const PopoverLink = ({ href, text, ...props }) => {
  return <a {...props} className="pl-1 pr-1" href={href}>{text}</a>;
}

const CompletionBar = (props: { pacing: Pacing & { percentageDone: number; }; type: "budget_completion" | "impression_completion"; row: any; chartClick: (id: number, type: "budget_completion" | "impression_completion") => void; }) => {
  if (props.pacing) {
    const action = props.pacing.action || "";
    const percentage = props.pacing.percentage ? props.pacing.percentage * 100 : 0;
    const percentageDone = props.pacing.percentageDone * 100;
    const actual = props.type === "budget_completion" ? Utils.currency(props.pacing.actual || 0) : Utils.numberWithCommas(props.pacing.actual);
    const tooltipId = `completion-tooltip-${props.type}-${props.row.id}`;
    const tooltip = <Tooltip id={tooltipId}>{action}</Tooltip>;
    const chartTooltipId = `completion-chart-tooltip-${props.type}-${props.row.id}`;
    const chartTooltip = <Tooltip id={chartTooltipId}>view chart</Tooltip>;
    const popperConfig = Helper.getPopperConfig();
    let completionBar;
    if (props.pacing.actionType === null || props.pacing.actionType === -1) {
      completionBar = <span>{actual}</span>;
    } else {
      const color = Helper.completionBarColor(props.pacing.actionType);
      const completionBarProps = { color, percentage, percentageDone, actual };
      completionBar = <CompletionBarContainer  {...completionBarProps} />;
    }
    if (action === "") {
      return completionBar;
    }
    return <Fragment>
      <div style={{ width: "80%", display: "inline-block" }}>
        <OverlayTrigger placement="top" overlay={tooltip} popperConfig={popperConfig}>{completionBar}</OverlayTrigger>
      </div>
      <div style={{ width: "20%", display: "inline-block", verticalAlign: "top", marginLeft: "5px" }}>
        <OverlayTrigger placement="top" overlay={chartTooltip} popperConfig={popperConfig}>
          <a style={{ color: "#333" }} onClick={(e) => { e.preventDefault(); props.chartClick(props.row.id, props.type) }} href=""><FontIcon name="line-chart" /></a>
        </OverlayTrigger>
      </div>
    </Fragment>;
  } else {
    return null;
  }
}