import React, { useState, useContext, Fragment } from "react";
import { useParams, useHistory } from "react-router-dom";
import * as _ from "lodash";
import PageHeader from "../../layout/PageHeader";
import PageHeading from "../../shared/pageHeading/PageHeading";
import Breadcrumb from "../../shared/breadcrumb/Breadcrumb";
import * as Roles from "../../../../modules/Roles";
import { ScopeDataContextType, Rights } from "../../../../models/Common"
import ScopeDataContext from "../../context/ScopeDataContext";
import ErrorContainer from "../../../UI/ErrorContainer";
import DocumentTitle from "../../../UI/DocumentTitle";
import SwitchInput from "../../../UI/SwitchInput";
import { AppUser } from "../../../../models/AppUser";
import UserContext from "../../context/UserContext";
import * as Api from "../../../../client/Api";
import * as Helper from "../../../../client/Helper";
import AnalyticsPageBody from "./AnalyticsPageBody";
import CampaignStatusButton from "../../shared/CampaignStatusButton";
import { Campaign, CampaignEntity } from "../../../../models/data/Campaign";
import Confirm from "../../../UI/Confirm";
import FontIcon from "../../../UI/FontIcon";

const AnalyticsPage = () => {
  let history = useHistory();
  let { scope, scopeId, tab }: any = useParams();
  let { data, updateReload, loading, updateLoading } = useContext<ScopeDataContextType>(ScopeDataContext);
  const rights: Rights = Roles.getRights(data.rights);
  const user: AppUser = useContext<AppUser>(UserContext);
  const mainRole = Helper.getMainRole(user);
  const initialVideoMode = Helper.getVideoMode(user, mainRole);
  const [videoChecked, setVideoChecked] = useState<boolean>(initialVideoMode);
  const [showStatusConfirm, setShowStatusConfirm] = useState<boolean>(false);

  const videoModeChange = (checked: boolean) => {
    setVideoChecked(checked);
    Helper.storeVideoMode(user, mainRole, checked);
  }

  const showVideoSwitch = !(scope === "campaign" || scope === "publisher") || (scope === "publisher" && tab === "statistics");

  if (rights.VIEW_STATISTICS) {
    if (scope === "campaign") {
      const campaign: CampaignEntity = _.get(data as Campaign, "campaign");
      const updateCampaignStatusConfirm = async () => {
        setShowStatusConfirm(false);
        try {
          updateLoading(true);
          const action = campaign.isActive ? "deactivate" : "activate";
          await Api.Post({ path: `/api/campaigns/${campaign.id}/${action}` });
          updateReload(true);
        } catch (err) {
          console.log("err", err);
        }
      }

      const editCampaignClick = () => {
        history.push(Helper.campaignSettingsLink(`/settings/campaign/${scopeId}/general`));
      }

      return <Fragment>
        <PageHeader>
          <div className="col-sm-9">
            <PageHeading />
            <Breadcrumb id="breadcrumb" minScope="campaign" />
          </div>
          <div className="col-sm-3">
            {!loading && campaign &&
              <div className="pull-right" style={{ marginRight: "10px" }}>
                {rights.MANAGE_CAMPAIGN && <Fragment>
                  <CampaignStatusButton
                    status={campaign.status}
                    rights={rights}
                    isActive={campaign.isActive}
                    startTime={campaign.startTime}
                    endTime={campaign.endTime}
                    onClick={() => { setShowStatusConfirm(true) }}
                  />
                  <button className="btn btn-linkbutton btn-sm ml-2" onClick={editCampaignClick}><FontIcon name="pencil" /> EDIT CAMPAIGN</button>
                  <Confirm
                    message="Update campaign status?"
                    show={showStatusConfirm}
                    onClose={() => setShowStatusConfirm(false)}
                    onConfirm={updateCampaignStatusConfirm}
                  />
                </Fragment>}
                {!rights.MANAGE_CAMPAIGN && rights.VIEW_CAMPAIGN && <button className="btn btn-linkbutton btn-sm mr-2" onClick={editCampaignClick}><FontIcon name="search-plus" /> VIEW CAMPAIGN</button>}
              </div>
            }
          </div>
        </PageHeader>
        <DocumentTitle title="Analytics" />
        <AnalyticsPageBody videoMode={_.get(campaign, "videoCampaign") || false} />
      </Fragment>;
    } else {
      return <Fragment>
        <PageHeader>
          <div className="col-sm-9">
            <PageHeading />
            <Breadcrumb id="breadcrumb" minScope="campaign" />
          </div>
          <div className="col-sm-3">
            {showVideoSwitch &&
              <div className="pull-right">
                <SwitchInput
                  id="video-mode"
                  label="Video mode"
                  checked={videoChecked}
                  onChange={videoModeChange}
                />
              </div>
            }
          </div>
        </PageHeader>
        <DocumentTitle title="Analytics" />
        <AnalyticsPageBody videoMode={videoChecked} />
      </Fragment>;
    }
  } else {
    return <ErrorContainer message="Access forbidden" />;
  }
}
export default AnalyticsPage;