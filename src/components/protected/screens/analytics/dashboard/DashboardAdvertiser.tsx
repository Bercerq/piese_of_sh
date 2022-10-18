import React from "react";
import { TabProps } from "../../../../../models/Common";
import Summary from "./Summary";

const DashboardAdvertiser = (props: TabProps) => {
  return <Summary {...props} />;
}
export default DashboardAdvertiser;