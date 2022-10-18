import React, { useContext, Fragment } from "react";
import PageHeader from "../../layout/PageHeader";
import PageHeading from "../../shared/pageHeading/PageHeading";
import Breadcrumb from "../../shared/breadcrumb/Breadcrumb";
import * as Roles from "../../../../modules/Roles";
import { ScopeDataContextType, Rights } from "../../../../models/Common"
import ScopeDataContext from "../../context/ScopeDataContext";
import ErrorContainer from "../../../UI/ErrorContainer";
import DocumentTitle from "../../../UI/DocumentTitle";
import CreativeFeedPageBody from "./CreativeFeedPageBody";

const CreativeFeedPage = () => {
  let { data } = useContext<ScopeDataContextType>(ScopeDataContext);
  const rights: Rights = Roles.getRights(data.rights);

  if (rights.VIEW_FEEDS) {
    return <Fragment>
      <PageHeader>
        <div className="col-sm-12">
          <PageHeading />
          <Breadcrumb id="breadcrumb" minScope="advertiser" />
        </div>
      </PageHeader>
      <DocumentTitle title="Data feeds" />
      <CreativeFeedPageBody />
    </Fragment>;
  } else {
    return <ErrorContainer message="Access forbidden" />;
  }
}
export default CreativeFeedPage;