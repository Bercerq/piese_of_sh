import React, { Fragment } from "react";
import PageHeader from "../../layout/PageHeader";
import PageHeading from "../../shared/pageHeading/PageHeading";
import Breadcrumb from "../../shared/breadcrumb/Breadcrumb";
import AlertsListContainer from "./AlertsListContainer";
import DocumentTitle from "../../../UI/DocumentTitle";

const AlertsPage = () => {
  return <Fragment>
    <PageHeader>
      <div className="col-sm-9">
        <PageHeading />
        <Breadcrumb id="breadcrumb" minScope="campaign" />
      </div>
    </PageHeader>
    <div className="row">
      <div className="col-sm-12 pt-3">
        <AlertsListContainer />
      </div>
    </div>
    <DocumentTitle title="Alerts" />
  </Fragment>;
}
export default AlertsPage;