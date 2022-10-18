import React, { useContext, Fragment } from "react";
import PageHeader from "../../layout/PageHeader";
import PageHeading from "../../shared/pageHeading/PageHeading";
import Breadcrumb from "../../shared/breadcrumb/Breadcrumb";
import * as Roles from "../../../../modules/Roles";
import { ScopeDataContextType, Rights } from "../../../../models/Common"
import ScopeDataContext from "../../context/ScopeDataContext";
import ErrorContainer from "../../../UI/ErrorContainer";
import DocumentTitle from "../../../UI/DocumentTitle";
import PublisherAdslotPageBody from "./PublisherAdslotPageBody";

const PublisherAdslotPage = () => {
  let { data } = useContext<ScopeDataContextType>(ScopeDataContext);
  const rights: Rights = Roles.getRights(data.rights);

  if (rights.VIEW_PUBLISHER_AD_SLOTS) {
    return <Fragment>
      <PageHeader>
        <div className="col-sm-12">
          <PageHeading />
          <Breadcrumb id="breadcrumb" minScope="advertiser" />
        </div>
      </PageHeader>
      <DocumentTitle title="Ad slots" />
      <PublisherAdslotPageBody />
    </Fragment>;
  } else {
    return <ErrorContainer message="Access forbidden" />;
  }
}
export default PublisherAdslotPage;