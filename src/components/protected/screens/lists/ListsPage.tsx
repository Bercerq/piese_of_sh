import React, { useContext, Fragment } from "react";
import PageHeader from "../../layout/PageHeader";
import PageHeading from "../../shared/pageHeading/PageHeading";
import Breadcrumb from "../../shared/breadcrumb/Breadcrumb";
import * as Roles from "../../../../modules/Roles";
import { ScopeDataContextType, Rights, ScopeData } from "../../../../models/Common"
import ScopeDataContext from "../../context/ScopeDataContext";
import ErrorContainer from "../../../UI/ErrorContainer";
import DocumentTitle from "../../../UI/DocumentTitle";
import ListsPageBody from "./ListsPageBody";

const ListsPage = () => {
  let { data } = useContext<ScopeDataContextType>(ScopeDataContext);
  const rights: Rights = Roles.getRights(data.rights);

  if (rights.VIEW_LISTS) {
    return <Fragment>
      <PageHeader>
        <div className="col-sm-9">
          <PageHeading />
          <Breadcrumb id="breadcrumb" minScope="advertiser" />
        </div>
      </PageHeader>
      <DocumentTitle title="Lists" />
      <ListsPageBody />
    </Fragment>;
  } else {
    return <ErrorContainer message="Access forbidden" />;
  }
}
export default ListsPage;