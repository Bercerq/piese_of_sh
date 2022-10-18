import React from "react";
import FontIcon from "../../../UI/FontIcon";

const CompletionBarContainer = ({ color, percentage, percentageDone, actual, ...props }) => {
  return <div {...props} className="completion-bar-container">
    <div className={`completion-bar ${color}`}>
      <span className={`completion-progress ${color}`} style={{ width: `${percentage}%` }}></span>
      <span className="completion-line" style={{ width: `${percentageDone}%` }}></span>
      <span className="completion-value">{actual}</span>
    </div>
    <div className="completion-arrow" style={{ left: `${percentageDone}%` }}>
      <FontIcon name="caret-up" />
    </div>
  </div>;
}
export default CompletionBarContainer;