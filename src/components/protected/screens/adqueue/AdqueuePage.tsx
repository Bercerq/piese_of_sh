import React, { useContext, Fragment } from "react";
import PageHeader from "../../layout/PageHeader";
import PageHeading from "../../shared/pageHeading/PageHeading";
import Breadcrumb from "../../shared/breadcrumb/Breadcrumb";
import { AppUser } from "../../../../models/AppUser";
import UserContext from "../../context/UserContext";
import ErrorContainer from "../../../UI/ErrorContainer";
import DocumentTitle from "../../../UI/DocumentTitle";
import AdqueuePageBody from "./AdqueuePageBody";

const AdqueuePage = () => {
  const user: AppUser = useContext<AppUser>(UserContext);

  if (user.isRootAdmin) {
    return <Fragment>
      <PageHeader>
        <div className="col-sm-9">
          <PageHeading />
          <Breadcrumb id="breadcrumb" minScope="campaign" />
        </div>
      </PageHeader>
      <DocumentTitle title="Ad queue" />
      <AdqueuePageBody />
    </Fragment>;
  } else {
    return <ErrorContainer message="Access forbidden" />;
  }
}
export default AdqueuePage;