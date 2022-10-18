import React, { useContext, Fragment } from "react";
import PageHeader from "../../../layout/PageHeader";
import PageHeading from "../../../shared/pageHeading/PageHeading";
import Breadcrumb from "../../../shared/breadcrumb/Breadcrumb";
import * as Roles from "../../../../../modules/Roles";
import { ScopeDataContextType, Rights } from "../../../../../models/Common"
import ScopeDataContext from "../../../context/ScopeDataContext";
import ErrorContainer from "../../../../UI/ErrorContainer";
import DocumentTitle from "../../../../UI/DocumentTitle";
import PublisherReportsPageBody from "./PublisherReportsPageBody";

const PublisherReportsPage = () => {
  let { data } = useContext<ScopeDataContextType>(ScopeDataContext);
  const rights: Rights = Roles.getRights(data.rights);

  if (rights.VIEW_REPORTS) {
    return <Fragment>
      <PageHeader>
        <div className="col-sm-12">
          <PageHeading />
          <Breadcrumb id="breadcrumb" minScope="publisher" />
        </div>
      </PageHeader>
      <DocumentTitle title="Reports" />
      <PublisherReportsPageBody />
    </Fragment>;
  } else {
    return <ErrorContainer message="Access forbidden" />;
  }
}
export default PublisherReportsPage;