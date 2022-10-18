import React, { useState, useContext, Fragment } from "react";
import { useParams } from "react-router-dom";
import PageHeader from "../../layout/PageHeader";
import PageHeading from "../../shared/pageHeading/PageHeading";
import Breadcrumb from "../../shared/breadcrumb/Breadcrumb";
import { ScopeType } from "../../../../client/schemas";
import SettingsRoot from "./SettingsRoot";
import SettingsOrganization from "./SettingsOrganization";
import SettingsAgency from "./SettingsAgency";
import SettingsAdvertiser from "./SettingsAdvertiser";
import SettingsCampaignGroup from "./SettingsCampaignGroup";
import SettingsCampaign from "./SettingsCampaign";
import DocumentTitle from "../../../UI/DocumentTitle";
import SwitchInput from "../../../UI/SwitchInput";
import { AppUser } from "../../../../models/AppUser";
import UserContext from "../../context/UserContext";
import * as Helper from "../../../../client/Helper";

const SettingsPageBody = (props: { videoMode: boolean }) => {
  let { scope }: any = useParams();
  switch ((scope as ScopeType)) {
    case "root": return <SettingsRoot {...props} />;
    case "organization": return <SettingsOrganization {...props} />;
    case "agency": return <SettingsAgency {...props} />
    case "advertiser": return <SettingsAdvertiser {...props} />;
    case "campaigngroup": return <SettingsCampaignGroup {...props} />;
  }
  return null;
}

const SettingsPage = () => {
  let { scope }: any = useParams();
  if (scope === "campaign") {
    return <Fragment>
      <PageHeader>
        <div className="col-sm-12">
          <PageHeading />
          <Breadcrumb id="breadcrumb" minScope="campaign" />
        </div>
      </PageHeader>
      <DocumentTitle title="Campaign settings" />
      <SettingsCampaign />
    </Fragment>;
  } else {
    const user: AppUser = useContext<AppUser>(UserContext);
    const mainRole = Helper.getMainRole(user);
    const initialVideoMode = Helper.getVideoMode(user, mainRole);
    const [videoChecked, setVideoChecked] = useState<boolean>(initialVideoMode);

    const videoModeChange = (checked: boolean) => {
      setVideoChecked(checked);
      Helper.storeVideoMode(user, mainRole, checked);
    }

    return <Fragment>
      <PageHeader>
        <div className="col-sm-9">
          <PageHeading />
          <Breadcrumb id="breadcrumb" minScope="campaign" />
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
      <DocumentTitle title="Campaigns" />
      <SettingsPageBody videoMode={videoChecked} />
    </Fragment>
  }
}
export default SettingsPage;