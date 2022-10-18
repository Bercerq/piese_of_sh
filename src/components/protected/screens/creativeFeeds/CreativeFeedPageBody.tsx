import React, { useState, useRef, useContext, useEffect, Fragment } from "react";
import { useParams } from "react-router-dom";
import { Button } from "react-bootstrap";
import * as _ from "lodash";
import moment from "moment";
import NotificationSystem from "react-notification-system";
import * as NotificationOptions from "../../../../client/NotificationOptions";
import * as Api from "../../../../client/Api";
import * as Helper from "../../../../client/Helper";
import * as Roles from "../../../../modules/Roles";
import { ScopeDataContextType, Rights, LookUp, BreadcrumbContextType } from "../../../../models/Common";
import { AppUser } from "../../../../models/AppUser";
import UserContext from "../../context/UserContext";
import ScopeDataContext from "../../context/ScopeDataContext";
import FontIcon from "../../../UI/FontIcon";
import Loader from "../../../UI/Loader";
import ErrorContainer from "../../../UI/ErrorContainer";
import { ScopeType } from "../../../../client/schemas";
import Confirm from "../../../UI/Confirm";
import CreativeFeedTable from "./CreativeFeedTable";
import CreativeFeedModal from "./CreativeFeedModal"
import { CreativeFeed } from "../../../../models/data/CreativeFeed";
import BreadcrumbContext from "../../context/BreadcrumbContext";

const CreativeFeedPageBody = () => {
  let params: { scope?, scopeId?} = useParams();
  let scope = params.scope as ScopeType;
  let scopeId = params.scopeId;
  let { data } = useContext<ScopeDataContextType>(ScopeDataContext);
  const rights: Rights = Roles.getRights(data.rights);
  const user: AppUser = useContext<AppUser>(UserContext);
  let { items } = useContext<BreadcrumbContextType>(BreadcrumbContext);

  const [showLoader, setShowLoader] = useState<boolean>(true);
  const [creativeFeeds, setCreativeFeeds] = useState<CreativeFeed[]>([]);
  const [currentFiltersCounter, setCurrentFiltersCounter] = useState<number>(0);
  const [pastFiltersCounter, setPastFiltersCounter] = useState<number>(0);
  const [editCreativeFeed, setEditCreativeFeed] = useState<CreativeFeed>(null);
  const [writeAccess, setWriteAccess] = useState<boolean>(false);
  const [showEditModal, setShowEditModal] = useState<boolean>(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<boolean>(false);
  const [showCreativeFeedModal, setShowCreativeFeedModal] = useState<boolean>(false);
  const [instancesReport, setInstancesReport] = useState<CreativeFeed>(null);
  const [deleteId, setDeleteId] = useState<number>(-1);
  const [deleteCreativeFeed, setDeleteCreativeFeed] = useState<CreativeFeed>(null);
  const [error, setError] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>("");

  const notificationSystem = useRef<NotificationSystem.System>(null);
  const controller = useRef<AbortController>(null);

  useEffect(() => { return unload; }, []);
  useEffect(() => { loadCreativeFeeds(); }, [scope, scopeId]);

  async function loadCreativeFeeds() {
    setShowLoader(true);
    try {
      unload();
      controller.current = new AbortController();
      const qs = Helper.scopedParam({ scope, scopeId });
      const results = await Api.Get({ path: `/api/creativefeed`, qs, signal: controller.current.signal });
      setCreativeFeeds(results);
    } catch (err) {
      if (err.name === "AbortError") {
        setError(false);
        setErrorMessage("");
      } else {
        setError(true);
        setErrorMessage("Error loading feeds.");
      }
    }
    setShowLoader(false);
  }

  function unload() {
    if (controller.current) {
      controller.current.abort();
    }
  }

  async function editClick(editId: number, writeAccess: boolean) {
    const results = await Api.Get({ path: `/api/creativefeed/${editId}`, signal: controller.current.signal });
    const editReport = results;
    setEditCreativeFeed(editReport);
    setWriteAccess(writeAccess);
    setShowEditModal(true);
  }

  function deleteClick(deleteId: number) {
    const deleteReport = creativeFeeds.find((o) => { return o.id === deleteId });
    setDeleteId(deleteId);
    setDeleteCreativeFeed(deleteReport);
    setShowDeleteConfirm(true);
  }


  const addCreativeFeedClick = () => {
    setShowEditModal(true);
    setEditCreativeFeed(null);
    setWriteAccess(true);
  }

  const handleDelete = async () => {
    try {
      await Api.Delete({ path: `/api/creativefeed/${deleteId}` });
      notificationSystem.current.addNotification(NotificationOptions.success(<span>Creative feed {deleteCreativeFeed.name} deleted.</span>, false));
      setShowDeleteConfirm(false);
      loadCreativeFeeds();
    } catch (err) {
      setShowDeleteConfirm(false);
      notificationSystem.current.addNotification(NotificationOptions.error("Error deleting feed."));
    }
  }

  const handleSubmit = async (id: number, creativeFeed: Partial<CreativeFeed>) => {
    try {
      if (id > 0) {
        await Api.Put({ path: `/api/creativefeed/${id}`, body: creativeFeed });
      } else {
        await Api.Post({ path: `/api/creativefeed`, body: creativeFeed });
      }
      setShowEditModal(false);
      setEditCreativeFeed(null);
      loadCreativeFeeds();
      notificationSystem.current.addNotification(NotificationOptions.success(<span>Creative feed <strong>{creativeFeed.name}</strong> saved.</span>, false));
    } catch (err) {
      setShowEditModal(false);
      setEditCreativeFeed(null);
      notificationSystem.current.addNotification(NotificationOptions.error("Error saving feed."));
    }
  }

  if (!error) {
    const deleteCreativeFeedName = _.get(deleteCreativeFeed, "name", "");
    const maxLevel = Helper.getMaxLevel(user, items);
    return <div className="row">
      <div className="col-sm-12 pt-3">
        <div className="card mb-2">
          <h3 className="pull-left">Data feeds</h3>
          <div className="pull-right">
            {rights.MANAGE_FEEDS &&
              <Button size="sm" variant="primary" className="mr-2" onClick={addCreativeFeedClick}><FontIcon name="plus" /> ADD DATA FEED</Button>
            }
            <Button size="sm" variant="primary" onClick={() => { setCurrentFiltersCounter(currentFiltersCounter + 1) }}><FontIcon name="remove" /> CLEAR FILTERS</Button>
          </div>
          <Loader visible={showLoader} />
          {!showLoader &&
            <CreativeFeedTable
              type="current"
              user={user}
              records={creativeFeeds}
              filtersCounter={currentFiltersCounter}
              editClick={(editId: number, writeAccess: boolean) => { editClick(editId, writeAccess); }}
              deleteClick={(deleteId: number) => { deleteClick(deleteId) }}
            />
          }
        </div>
      </div>
      
      <CreativeFeedModal
        creativeFeed={editCreativeFeed}
        writeAccess={writeAccess}
        show={showEditModal}
        rights={rights}
        scope={scope}
        scopeId={scopeId}
        maxLevel={maxLevel}
        handleClose={() => { setShowEditModal(false); }}
        handleSubmit={handleSubmit}
      />
      <Confirm
        message={`Delete creative feed ${deleteCreativeFeedName}`}
        show={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDelete}
      />
      <NotificationSystem ref={notificationSystem} />
    </div>;
  } else {
    return <div className="row">
      <div className="col-sm-12 pt-3">
        <div className="card">
          <h3><ErrorContainer message={errorMessage} /></h3>
        </div>
      </div>
    </div>;
  }
}
export default CreativeFeedPageBody;