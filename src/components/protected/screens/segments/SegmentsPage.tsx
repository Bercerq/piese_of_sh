import React, { useContext, Fragment, useEffect } from "react";
import { useHistory, useParams } from "react-router-dom";
import PageHeader from "../../layout/PageHeader";
import PageHeading from "../../shared/pageHeading/PageHeading";
import Breadcrumb from "../../shared/breadcrumb/Breadcrumb";
import * as Roles from "../../../../modules/Roles";
import { ScopeDataContextType, Rights, QsContextType } from "../../../../models/Common"
import ScopeDataContext from "../../context/ScopeDataContext";
import ErrorContainer from "../../../UI/ErrorContainer";
import DocumentTitle from "../../../UI/DocumentTitle";
import SegmentsPageBody from "./SegmentsPageBody";
import StatisticsDateRangePicker from "../../shared/StatisticsDateRangePicker";
import { ScopeType } from "../../../../client/schemas";
import QsContext from "../../context/QsContext";

const SegmentsPage = () => {
  let { data } = useContext<ScopeDataContextType>(ScopeDataContext);
  let history = useHistory();
  let params: { scope?, scopeId?} = useParams();
  let scope = params.scope as ScopeType;
  let scopeId = params.scopeId;
  const rights: Rights = Roles.getRights(data.rights);
  let { daterange } = useContext<QsContextType>(QsContext);
  const startDate: string = daterange.startDate.format("YYYY-MM-DD");
  const endDate: string = daterange.endDate.format("YYYY-MM-DD");

  useEffect(() => {
    history.push(`/segments/${scope}/${scopeId}?sd=${startDate}&ed=${endDate}`);
  }, []);

  if (rights.VIEW_SEGMENTS) {
    return <Fragment>
      <PageHeader>
        <div className="col-sm-9">
          <PageHeading />
          <Breadcrumb id="breadcrumb" minScope="advertiser" />
        </div>
        <div className="col-sm-3">
          <div className="daterange-container">
            <StatisticsDateRangePicker />
          </div>
        </div>
      </PageHeader>
      <DocumentTitle title="Segments" />
      <SegmentsPageBody />
    </Fragment>;
  } else {
    return <ErrorContainer message="Access forbidden" />;
  }
}
export default SegmentsPage;