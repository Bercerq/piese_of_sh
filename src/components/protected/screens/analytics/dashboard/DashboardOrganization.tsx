import React from "react";
import { TabProps } from "../../../../../models/Common";
import Summary from "./Summary";

const DashboardOrganization = (props: TabProps) => {
  return <Summary {...props} />;
}
export default DashboardOrganization;