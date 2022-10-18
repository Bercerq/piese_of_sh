import React, { useState, useEffect, useRef } from "react";
import NotificationSystem from "react-notification-system";
import * as NotificationOptions from "../../../../../client/NotificationOptions";
import * as Api from "../../../../../client/Api";
import * as _ from "lodash";
import { TabProps } from "../../../../../models/Common";
import PublishersTable from "./PublishersTable";
import PublisherModal from "./PublisherModal";
import { PublisherEntity, PublisherSettings } from "../../../../../models/data/Publisher";
import Loader from "../../../../UI/Loader";
import ErrorContainer from "../../../../UI/ErrorContainer";

const PublishersTab = (props: TabProps) => {
  const [publishers, setPublishers] = useState<any[]>([]);
  const [showLoader, setShowLoader] = useState<boolean>(true);
  const [showEditModal, setShowEditModal] = useState<boolean>(false);
  const [editPublisher, setEditPublisher] = useState<PublisherEntity>(null);
  const [writeAccess, setWriteAccess] = useState<boolean>(false);
  const [error, setError] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>("");

  const notificationSystem = useRef<NotificationSystem.System>(null);
  const controller = useRef<AbortController>(null);

  useEffect(() => { return unload }, []);
  useEffect(() => { loadData(); }, [JSON.stringify(props.options)]);

  async function loadData() {
    setShowLoader(true);
    try {
      controller.current = new AbortController();
      const publishers = await Api.Get({ path: "/api/publishers/statistics", qs: props.options, signal: controller.current.signal });
      setPublishers(publishers);
      setShowLoader(false);
      setError(false);
      setErrorMessage("");
    } catch (err) {
      if (err.name === "AbortError") {
        setError(false);
        setErrorMessage("");
      } else {
        setError(true);
        setErrorMessage("Error loading publishers");
        setShowLoader(false);
      }
    }
  }

  function unload() {
    if (controller.current) {
      controller.current.abort();
    }
  }

  const editClick = (id, writeAccess) => {
    const publisherRow = publishers.find((o) => { return o.publisher.id === id });
    const editPublisher = _.get(publisherRow, "publisher");

    setEditPublisher(editPublisher);
    setShowEditModal(true);
    setWriteAccess(writeAccess);
  }

  const handleSubmit = async (id: number, settings: PublisherSettings) => {
    try {
      await Api.Put({ path: `/api/publishers/${id}`, body: settings });
      setShowEditModal(false);
      setEditPublisher(null);
      loadData();
      notificationSystem.current.addNotification(NotificationOptions.success(<span>Publisher <strong>{settings.name}</strong> saved.</span>, false));
    } catch (err) {
      setShowEditModal(false);
      setEditPublisher(null);
      notificationSystem.current.addNotification(NotificationOptions.error("Error updating publisher."));
    }
  }

  if (!error) {
    return <div className="col-sm-12 pt-3">
      <div className="card mb-2">
        <h3 className="pull-left">Publishers</h3>
        <Loader visible={showLoader} />
        {!showLoader &&
          <PublishersTable
            publishers={publishers}
            user={props.user}
            rights={props.rights}
            videoMode={props.videoMode}
            editClick={editClick}
          />
        }
      </div>
      <PublisherModal
        publisher={editPublisher}
        show={showEditModal}
        writeAccess={writeAccess}
        onClose={() => { setShowEditModal(false); }}
        onSubmit={handleSubmit}
      />
      <NotificationSystem ref={notificationSystem} />
    </div>;
  } else {
    return <div className="col-sm-12 pt-3">
      <div className="card">
        <h3><ErrorContainer message={errorMessage} /></h3>
      </div>
    </div>;
  }
}
export default PublishersTab;