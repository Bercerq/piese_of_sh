import React, { useContext, useState, useRef, Fragment } from "react";
import * as _ from "lodash";
import * as Roles from "../../../../modules/Roles";
import * as Api from "../../../../client/Api";
import { Rights, ScopeDataContextType } from "../../../../models/Common";
import ScopeDataContext from "../../context/ScopeDataContext";
import { Organization, OrganizationEntity } from "../../../../models/data/Organization";
import FontIcon from "../../../UI/FontIcon";
import OrganizationModal from "../../screens/settings/organizations/OrganizationModal";
import NotificationSystem from "react-notification-system";
import * as NotificationOptions from "../../../../client/NotificationOptions";

const OrganizationHeading = () => {
  let { data, updateReload } = useContext<ScopeDataContextType>(ScopeDataContext);
  const organization: OrganizationEntity = _.get(data, "organization");
  const heading = _.get(data as Organization, "organization.name");
  const rights: Rights = Roles.getRights(data.rights);

  const [showEditModal, setShowEditModal] = useState<boolean>(false);
  const notificationSystem = useRef<NotificationSystem.System>(null);

  const editClick = (e) => { e.preventDefault(); setShowEditModal(true); };
  const handleClose = () => { setShowEditModal(false); };

  const handleSubmit = async (id: number, organization: OrganizationEntity) => {
    try {
      await Api.Put({ path: "/api/organizations/" + id, body: organization });
      updateReload(true);
      setShowEditModal(false);
      notificationSystem.current.addNotification(NotificationOptions.success(<span>Organization <strong>{organization.name}</strong> saved.</span>, false));
    } catch (err) {
      console.log(err);
      setShowEditModal(false);
      notificationSystem.current.addNotification(NotificationOptions.error("Error updating organization."));
    }
  }

  if (rights.MANAGE_ORGANIZATION) {
    return <Fragment>
      <h2>Organization: {heading} <span className="pointer d-inline-block ml-2" onClick={editClick}><FontIcon name="pencil" /></span> </h2>
      <OrganizationModal
        show={showEditModal}
        organization={organization}
        onClose={handleClose}
        onSubmit={handleSubmit}
      />
      <NotificationSystem ref={notificationSystem} />
    </Fragment>;
  } else {
    return <h2>Organization: {heading}</h2>
  }
}
export default OrganizationHeading;