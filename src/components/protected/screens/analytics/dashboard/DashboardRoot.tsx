import React, { Fragment } from "react";
import { TabProps } from "../../../../../models/Common";
import SSPBillsCard from "./SSPBillsCard";
import InvoicingCard from "./InvoicingCard";
import Summary from "./Summary";

const DashboardRoot = (props: TabProps) => {
  const options = {
    startDate: props.options.startDate,
    endDate: props.options.endDate
  };

  return <Fragment>
    <Summary {...props} />
    <div className="col-sm-12"><SSPBillsCard options={options} user={props.user} /></div>
    <div className="col-sm-12"><InvoicingCard options={options} user={props.user} /></div>
  </Fragment>;
}
export default DashboardRoot;