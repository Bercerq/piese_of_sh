import React, { Fragment, useContext, useEffect } from "react";
import { useHistory, useParams } from "react-router-dom";
import { QsContextType } from "../../../../models/Common"
import PageHeader from "../../layout/PageHeader";
import PageHeading from "../../shared/pageHeading/PageHeading";
import Breadcrumb from "../../shared/breadcrumb/Breadcrumb";
import DocumentTitle from "../../../UI/DocumentTitle";
import ChangelogPageBody from "./ChangelogPageBody";
import StatisticsDateRangePicker from "../../shared/StatisticsDateRangePicker";
import { ScopeType } from "../../../../client/schemas";
import QsContext from "../../context/QsContext";

const ChangelogPage = () => {
  let history = useHistory();
  let params: { scope?, scopeId?} = useParams();
  let scope = params.scope as ScopeType;
  let scopeId = params.scopeId;
  let { daterange } = useContext<QsContextType>(QsContext);
  const startDate: string = daterange.startDate.format("YYYY-MM-DD");
  const endDate: string = daterange.endDate.format("YYYY-MM-DD");

  useEffect(() => {
    history.push(`/changelog/${scope}/${scopeId}?sd=${startDate}&ed=${endDate}`);
  }, []);

  return <Fragment>
    <PageHeader>
      <div className="col-sm-9">
        <PageHeading />
        <Breadcrumb id="breadcrumb" minScope="campaign" />
      </div>
      <div className="col-sm-3">
        <div className="daterange-container">
          <StatisticsDateRangePicker />
        </div>
      </div>
    </PageHeader>
    <DocumentTitle title="Change log" />
    <ChangelogPageBody />
  </Fragment>;
}
export default ChangelogPage;