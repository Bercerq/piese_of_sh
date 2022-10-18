import React, { useState, useContext, Fragment } from "react";
import PageHeader from "../../layout/PageHeader";
import PageHeading from "../../shared/pageHeading/PageHeading";
import Breadcrumb from "../../shared/breadcrumb/Breadcrumb";
import * as Roles from "../../../../modules/Roles";
import { ScopeDataContextType, Rights } from "../../../../models/Common";
import ScopeDataContext from "../../context/ScopeDataContext";
import ErrorContainer from "../../../UI/ErrorContainer";
import DocumentTitle from "../../../UI/DocumentTitle";
import SwitchInput from "../../../UI/SwitchInput";
import * as Helper from "../../../../client/Helper";
import { AppUser } from "../../../../models/AppUser";
import UserContext from "../../context/UserContext";
import AdvaultPageBody from "./AdvaultPageBody";

const AdvaultPage = () => {
  let { data } = useContext<ScopeDataContextType>(ScopeDataContext);
  const rights: Rights = Roles.getRights(data.rights);
  const user: AppUser = useContext<AppUser>(UserContext);
  const mainRole = Helper.getMainRole(user);
  const initialVideoMode = Helper.getVideoMode(user, mainRole);
  const [videoChecked, setVideoChecked] = useState<boolean>(initialVideoMode);

  const videoModeChange = (checked: boolean) => {
    setVideoChecked(checked);
    Helper.storeVideoMode(user, mainRole, checked);
  }

  if (rights.VIEW_ADS) {
    return <Fragment>
      <PageHeader>
        <div className="col-sm-9">
          <PageHeading />
          <Breadcrumb id="breadcrumb" minScope="advertiser" />
        </div>
        <div className="col-sm-3">
          <div className="pull-right">
            <SwitchInput
              id="video-mode"
              label="Video mode"
              checked={videoChecked}
              onChange={videoModeChange}
            />
          </div>
        </div>
      </PageHeader>
      <DocumentTitle title="Ad vault" />
      <AdvaultPageBody videoMode={videoChecked} />
    </Fragment>;
  } else {
    return <ErrorContainer message="Access forbidden" />;
  }
}
export default AdvaultPage;