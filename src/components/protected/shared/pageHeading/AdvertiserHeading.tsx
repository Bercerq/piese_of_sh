import React, { useContext, useState, useRef, Fragment } from "react";
import * as _ from "lodash";
import * as Roles from "../../../../modules/Roles";
import * as Api from "../../../../client/Api";
import { ScopeDataContextType, Rights } from "../../../../models/Common";
import ScopeDataContext from "../../context/ScopeDataContext";
import FontIcon from "../../../UI/FontIcon";
import NotificationSystem from "react-notification-system";
import * as NotificationOptions from "../../../../client/NotificationOptions";
import AdvertiserEditModal from "../../screens/settings/advertisers/AdvertiserEditModal";
import { Advertiser, AdvertiserEntity } from "../../../../models/data/Advertiser";

const AdvertiserHeading = () => {
  let { data, updateReload } = useContext<ScopeDataContextType>(ScopeDataContext);
  const advertiser: AdvertiserEntity = _.get(data, "advertiser");
  const heading = _.get(data as Advertiser, "advertiser.name");
  const rights: Rights = Roles.getRights(data.rights);

  const [showEditModal, setShowEditModal] = useState<boolean>(false);
  const notificationSystem = useRef<NotificationSystem.System>(null);

  const editClick = (e) => { e.preventDefault(); setShowEditModal(true); };
  const handleClose = () => { setShowEditModal(false); };

  const handleSubmit = async (id: number, advertiser: AdvertiserEntity) => {
    if (rights.MANAGE_ADVERTISER) {
      try {
        await Api.Put({ path: "/api/advertisers/" + id, body: advertiser });
        updateReload(true);
        setShowEditModal(false);
        notificationSystem.current.addNotification(NotificationOptions.success(<span>Advertiser <strong>{advertiser.name}</strong> saved.</span>, false));
      } catch (err) {
        console.log(err);
        setShowEditModal(false);
        notificationSystem.current.addNotification(NotificationOptions.error("Error updating advertiser."));
      }
    }
  }

  if (rights.MANAGE_ADVERTISER) {
    return <Fragment>
      <h2>Advertiser: {heading} <span className="pointer d-inline-block ml-2" onClick={editClick}><FontIcon name="pencil" /></span> </h2>
      <AdvertiserEditModal
        show={showEditModal}
        advertiser={advertiser}
        writeAccess={true}
        onClose={handleClose}
        onSubmit={handleSubmit}
      />
      <NotificationSystem ref={notificationSystem} />
    </Fragment>;
  } else if (rights.VIEW_ADVERTISER) {
    return <Fragment>
      <h2>Advertiser: {heading} <span className="pointer d-inline-block ml-2" onClick={editClick}><FontIcon name="search-plus" /></span> </h2>
      <AdvertiserEditModal
        show={showEditModal}
        advertiser={advertiser}
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
export default AdvertiserHeading;