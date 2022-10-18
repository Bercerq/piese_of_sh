import React, { useContext, useState, useRef, Fragment } from "react";
import { useParams } from "react-router-dom";
import * as _ from "lodash";
import * as Roles from "../../../../modules/Roles";
import * as Api from "../../../../client/Api";
import { ScopeDataContextType, Rights, ScopeData } from "../../../../models/Common";
import ScopeDataContext from "../../context/ScopeDataContext";
import FontIcon from "../../../UI/FontIcon";
import NotificationSystem from "react-notification-system";
import * as NotificationOptions from "../../../../client/NotificationOptions";
import { CampaignGroup, CampaignGroupEntity } from "../../../../models/data/CampaignGroup";
import CampaignGroupModal from "../../screens/settings/campaigngroups/CampaignGroupModal";
import { ScopeType } from "../../../../client/schemas";

const CampaignGroupHeading = () => {
  let { data, updateReload } = useContext<ScopeDataContextType>(ScopeDataContext);
  let params: { page?, scope?, scopeId?} = useParams();
  let scope = params.scope as ScopeType;
  let scopeId = params.scopeId;

  const campaignGroup: CampaignGroupEntity = _.get(data as CampaignGroup, "campaignGroup");
  const heading = _.get(data as CampaignGroup, "campaignGroup.name");
  const rights: Rights = Roles.getRights(data.rights);

  const [showEditModal, setShowEditModal] = useState<boolean>(false);
  const notificationSystem = useRef<NotificationSystem.System>(null);

  const editClick = (e) => { e.preventDefault(); setShowEditModal(true); };
  const handleClose = () => { setShowEditModal(false); };

  const handleSubmit = async (id: number, campaigngroup: CampaignGroupEntity) => {
    if (rights.MANAGE_CAMPAIGNGROUP) {
      try {
        await Api.Put({ path: "/api/campaigngroups/" + id, body: campaigngroup });
        updateReload(true);
        setShowEditModal(false);
        notificationSystem.current.addNotification(NotificationOptions.success(<span>Campaign group <strong>{campaigngroup.name}</strong> saved.</span>, false));
      } catch (err) {
        console.log(err);
        setShowEditModal(false);
        notificationSystem.current.addNotification(NotificationOptions.error("Error updating campaign group."));
      }
    }
  }

  if (rights.MANAGE_CAMPAIGNGROUP) {
    return <Fragment>
      <h2>Campaign group: {heading} <span className="pointer d-inline-block ml-2" onClick={editClick}><FontIcon name="pencil" /></span> </h2>
      <CampaignGroupModal
        show={showEditModal}
        campaignGroup={campaignGroup}
        onClose={handleClose}
        onSubmit={handleSubmit}
      />
      <NotificationSystem ref={notificationSystem} />
    </Fragment>;
  } else if (rights.VIEW_CAMPAIGNGROUP) {
    return <Fragment>
      <h2>Campaign group: {heading}</h2>
    </Fragment>;
  } else {
    return null;
  }
}
export default CampaignGroupHeading;