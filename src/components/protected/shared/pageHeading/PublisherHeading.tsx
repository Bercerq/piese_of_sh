import React, { useState, useContext, useRef, Fragment } from "react";
import * as _ from "lodash";
import * as Roles from "../../../../modules/Roles";
import * as Api from "../../../../client/Api";
import { ScopeDataContextType, Rights } from "../../../../models/Common";
import ScopeDataContext from "../../context/ScopeDataContext";
import FontIcon from "../../../UI/FontIcon";
import NotificationSystem from "react-notification-system";
import * as NotificationOptions from "../../../../client/NotificationOptions";
import { Publisher, PublisherEntity, PublisherSettings } from "../../../../models/data/Publisher";
import PublisherModal from "../../screens/settings/publishers/PublisherModal";

const PublisherHeading = () => {
  let { data, updateReload } = useContext<ScopeDataContextType>(ScopeDataContext);
  const publisher: PublisherEntity = _.get(data, "publisher");
  const heading = _.get(data as Publisher, "publisher.settings.name");
  const rights: Rights = Roles.getRights(data.rights);

  const [showEditModal, setShowEditModal] = useState<boolean>(false);
  const notificationSystem = useRef<NotificationSystem.System>(null);
  
  const editClick = (e) => { e.preventDefault(); setShowEditModal(true); };
  const handleClose = () => { setShowEditModal(false); };

  const handleSubmit = async (id: number, settings: PublisherSettings) => {
    if (rights.MANAGE_PUBLISHER) {
      try {
        await Api.Put({ path: `/api/publishers/${id}`, body: settings });
        updateReload(true);
        setShowEditModal(false);
        notificationSystem.current.addNotification(NotificationOptions.success(<span>Publisher <strong>{_.get(settings, "name")}</strong> saved.</span>, false));
      } catch (err) {
        console.log(err);
        setShowEditModal(false);
        notificationSystem.current.addNotification(NotificationOptions.error("Error updating publisher."));
      }
    }
  }

  if (rights.MANAGE_PUBLISHER) {
    return <Fragment>
      <h2>Publisher: {heading} <span className="pointer d-inline-block ml-2" onClick={editClick}><FontIcon name="pencil" /></span> </h2>
      <PublisherModal
        show={showEditModal}
        publisher={publisher}
        writeAccess={true}
        onClose={handleClose}
        onSubmit={handleSubmit}
      />
      <NotificationSystem ref={notificationSystem} />
    </Fragment>;
  } else if (rights.VIEW_PUBLISHER) {
    return <Fragment>
      <h2>Publisher: {heading} <span className="pointer d-inline-block ml-2" onClick={editClick}><FontIcon name="search-plus" /></span> </h2>
      <PublisherModal
        show={showEditModal}
        publisher={publisher}
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
export default PublisherHeading;