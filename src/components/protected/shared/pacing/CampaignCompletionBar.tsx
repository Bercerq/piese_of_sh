import React from "react";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import * as Utils from "../../../../client/Utils";
import * as Helper from "../../../../client/Helper";
import { Pacing } from "../../../../models/data/Campaign";
import CompletionBarContainer from "./CompletionBarContainer";

const CampaignCompletionBar = (props: { pacing: Pacing & { percentageDone: number; }; type: "budget_completion" | "impression_completion"; }) => {
  if (props.pacing) {
    const action = props.pacing.action || "";
    const percentage = props.pacing.percentage ? props.pacing.percentage * 100 : 0;
    const percentageDone = props.pacing.percentageDone * 100;
    const actual = props.type === "budget_completion" ? Utils.currency(props.pacing.actual || 0) : Utils.numberWithCommas(props.pacing.actual);
    const tooltipId = `completion-tooltip-${props.type}`;
    const tooltip = <Tooltip id={tooltipId}>{action}</Tooltip>;

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
    return <div className="campaign-pacing-area">
      <OverlayTrigger placement="top" overlay={tooltip} popperConfig={popperConfig}>{completionBar}</OverlayTrigger>
    </div>;
  } else {
    return null;
  }
}
export default CampaignCompletionBar;