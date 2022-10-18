import React, { useContext, useState, useRef, Fragment } from "react";
import * as _ from "lodash";
import * as Roles from "../../../../modules/Roles";
import * as Api from "../../../../client/Api";
import { ScopeDataContextType, Rights, ScopeData } from "../../../../models/Common";
import ScopeDataContext from "../../context/ScopeDataContext";
import { Agency, AgencyEntity } from "../../../../models/data/Agency";
import FontIcon from "../../../UI/FontIcon";
import NotificationSystem from "react-notification-system";
import * as NotificationOptions from "../../../../client/NotificationOptions";
import AgencyEditModal from "../../screens/settings/agencies/AgencyEditModal";

const AgencyHeading = () => {
  let { data, updateReload } = useContext<ScopeDataContextType>(ScopeDataContext);
  const agency: AgencyEntity = _.get(data, "agency");
  const heading = _.get(data as Agency, "agency.name");
  const rights: Rights = Roles.getRights(data.rights);

  const [showEditModal, setShowEditModal] = useState<boolean>(false);
  const notificationSystem = useRef<NotificationSystem.System>(null);

  const editClick = (e) => { e.preventDefault(); setShowEditModal(true); };
  const handleClose = () => { setShowEditModal(false); };

  const handleSubmit = async (id: number, agency: AgencyEntity) => {
    if (rights.MANAGE_AGENCY) {
      try {
        await Api.Put({ path: "/api/agencies/" + id, body: agency });
        updateReload(true);
        setShowEditModal(false);
        notificationSystem.current.addNotification(NotificationOptions.success(<span>Agency <strong>{agency.name}</strong> saved.</span>, false));
      } catch (err) {
        console.log(err);
        setShowEditModal(false);
        notificationSystem.current.addNotification(NotificationOptions.error("Error updating agency."));
      }
    }
  }

  if (rights.MANAGE_AGENCY) {
    return <Fragment>
      <h2>Agency: {heading} <span className="pointer d-inline-block ml-2" onClick={editClick}><FontIcon name="pencil" /></span> </h2>
      <AgencyEditModal
        show={showEditModal}
        agency={agency}
        writeAccess={true}
        onClose={handleClose}
        onSubmit={handleSubmit}
      />
      <NotificationSystem ref={notificationSystem} />
    </Fragment>;
  } else if (rights.VIEW_AGENCY) {
    return <Fragment>
      <h2>Agency: {heading} <span className="pointer d-inline-block ml-2" onClick={editClick}><FontIcon name="search-plus" /></span> </h2>
      <AgencyEditModal
        show={showEditModal}
        agency={agency}
        writeAccess={false}
        onClose={handleClose}
        onSubmit={handleSubmit}
      />
      <NotificationSystem ref={notificationSystem} />
    </Fragment>;
  } else {
    return null;
  }
}
export default AgencyHeading;