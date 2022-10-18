import React from "react";
import moment from "moment";
import { Button } from "react-bootstrap";
import * as CampaignHelper from "../../../client/CampaignHelper";
import { CampaignStatus } from "../../../client/campaignSchemas";
import { Rights } from "../../../models/Common";
import FontIcon from "../../UI/FontIcon";

interface CampaignStatusButtonProps {
  status: string;
  isActive: boolean;
  startTime: number;
  endTime: number;
  rights: Rights;
  onClick: () => void;
}

const CampaignStatusButton = (props: CampaignStatusButtonProps) => {
  const status: CampaignStatus = CampaignHelper.getStatus(props.isActive, props.startTime, props.endTime, props.status);
  const disabled = props.endTime < moment().unix() || props.status === "archived" || !props.rights.MANAGE_CAMPAIGN;
  if (status === "ended") {
    return <button disabled={disabled} className="btn btn-linkbutton btn-sm" onClick={props.onClick}><FontIcon name="stop" /> ENDED</button>
  } else if (status === "scheduled") {
    return <Button variant="warning" size="sm" disabled={disabled} onClick={props.onClick}><FontIcon name="pause" /> UNSCHEDULE</Button>
  } else if (status === "not scheduled") {
    return <Button variant="success" size="sm" disabled={disabled} onClick={props.onClick}><FontIcon name="play" /> SCHEDULE</Button>
  } else if (status === "active") {
    return <Button variant="warning" size="sm" disabled={disabled} onClick={props.onClick}><FontIcon name="pause" /> PAUSE</Button>
  } else if (status === "paused") {
    return <Button variant="success" size="sm" disabled={disabled} onClick={props.onClick}><FontIcon name="play" /> ACTIVATE</Button>
  } else if (status === "archived") {
    return <button disabled={disabled} className="btn btn-linkbutton btn-sm" onClick={props.onClick}><FontIcon name="archive" /> ARCHIVED</button>
  }
  return null;
}
export default CampaignStatusButton;