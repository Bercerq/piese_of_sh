import React, { useState, useRef, useContext, useEffect, Fragment } from "react";
import { useParams } from "react-router-dom";
import * as _ from "lodash";
import NotificationSystem from "react-notification-system";
import * as NotificationOptions from "../../../../client/NotificationOptions";
import * as Api from "../../../../client/Api";
import * as Roles from "../../../../modules/Roles";
import { ScopeDataContextType, Rights } from "../../../../models/Common";
import { AppUser } from "../../../../models/AppUser";
import UserContext from "../../context/UserContext";
import ScopeDataContext from "../../context/ScopeDataContext";
import Loader from "../../../UI/Loader";
import ErrorContainer from "../../../UI/ErrorContainer";
import Confirm from "../../../UI/Confirm";
import { PublisherDeal } from "../../../../models/data/PublisherDeal";
import PublisherDealRequestsTable from "./PublisherDealRequestsTable";
import PublisherDealApproveModal from "./PublisherDealApproveModal";
import PublisherDealsTable from "./PublisherDealsTable";
import PublisherDealModal from "./PublisherDealModal";
import { ScopeType } from "../../../../client/schemas";

const PublisherDealsPageBody = () => {
  let params: { scope?, scopeId?} = useParams();
  let scope = params.scope as ScopeType;
  let scopeId = parseInt(params.scopeId);
  let { data } = useContext<ScopeDataContextType>(ScopeDataContext);
  const rights: Rights = Roles.getRights(data.rights);
  const user: AppUser = useContext<AppUser>(UserContext);

  const [showRequestsLoader, setShowRequestsLoader] = useState<boolean>(true);
  const [showDealsLoader, setShowDealsLoader] = useState<boolean>(true);
  const [showRejectConfirm, setShowRejectConfirm] = useState<boolean>(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<boolean>(false);
  const [dealRequests, setDealRequests] = useState<PublisherDeal[]>([]);
  const [deals, setDeals] = useState<PublisherDeal[]>([]);
  const [showApproveModal, setShowApproveModal] = useState<boolean>(false);
  const [showEditModal, setShowEditModal] = useState<boolean>(false);
  const [publisherApproveDeal, setPublisherApproveDeal] = useState<PublisherDeal>(null);
  const [rejectId, setRejectId] = useState<number>(-1);
  const [deleteId, setDeleteId] = useState<number>(-1);
  const [publisherEditDeal, setPublisherEditDeal] = useState<PublisherDeal>(null);
  const [publisherDeleteDeal, setPublisherDeleteDeal] = useState<PublisherDeal>(null);
  const [error, setError] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>("");

  const notificationSystem = useRef<NotificationSystem.System>(null);

  useEffect(() => { loadRequests(); loadDeals(); }, []);
  useEffect(() => { loadRequests(); }, [showRequestsLoader]);
  useEffect(() => { loadDeals(); }, [showDealsLoader]);
  useEffect(() => { setShowRequestsLoader(true); setShowDealsLoader(true); }, [scope, scopeId]);

  async function loadRequests() {
    if (showRequestsLoader) {
      try {
        const dealRequests = await Api.Get({ path: `/api/publishers/${scopeId}/dealrequests` });
        setDealRequests(dealRequests);
        setShowRequestsLoader(false);
      } catch (err) {
        setError(true);
        setErrorMessage("Error loading deal requests.")
      }
    }
  }

  async function loadDeals() {
    if (showDealsLoader) {
      try {
        const deals = await Api.Get({ path: `/api/publishers/${scopeId}/deals` });
        setDeals(deals);
        setShowDealsLoader(false);
      } catch (err) {
        setError(true);
        setErrorMessage("Error loading deals.")
      }
    }
  }

  const approveClick = (id: number) => {
    const publisherDeal = dealRequests.find((o) => { return o.id === id });
    setPublisherApproveDeal(publisherDeal);
    setShowApproveModal(true);
  }

  const rejectClick = (id: number) => {
    setRejectId(id);
    setShowRejectConfirm(true);
  }

  const editClick = (id: number) => {
    const publisherDeal = deals.find((o) => { return o.id === id });
    setPublisherEditDeal(publisherDeal);
    setShowEditModal(true);
  }

  const deleteClick = (id: number) => {
    setDeleteId(id);
    const publisherDeal = deals.find((o) => { return o.id === id });
    setPublisherDeleteDeal(publisherDeal);
    setShowDeleteConfirm(true);
  }

  const approvalStatusClick = async (id: number, deal: PublisherDeal) => {
    try {
      await Api.Put({ path: `/api/publishers/${scopeId}/deals/${id}`, body: deal });
      setShowDealsLoader(true);
      notificationSystem.current.addNotification(NotificationOptions.success(<span>Deal <strong>{deal.name}</strong> {deal.approvalStatus}.</span>, false));
    } catch (err) {
      notificationSystem.current.addNotification(NotificationOptions.error("Error updating deal."));
    }
  }

  const handleApprove = async (dealRequestId: number, dealApprove: PublisherDeal) => {
    try {
      await Api.Post({ path: `/api/publishers/${scopeId}/dealrequests/${dealRequestId}/approve`, body: dealApprove });
      setShowApproveModal(false);
      setShowRequestsLoader(true);
      setShowDealsLoader(true);
      notificationSystem.current.addNotification(NotificationOptions.success(<span>Deal <strong>{dealApprove.name}</strong> approved.</span>, false));
    } catch (err) {
      notificationSystem.current.addNotification(NotificationOptions.error("Error approving deal."));
    }
  }

  const handleReject = async () => {
    try {
      await Api.Post({ path: `/api/publishers/${scopeId}/dealrequests/${rejectId}/reject` });
      notificationSystem.current.addNotification(NotificationOptions.success(<span>Deal rejected.</span>, false));
      setShowRejectConfirm(false);
      setShowRequestsLoader(true);
      setShowDealsLoader(true);
    } catch (err) {
      notificationSystem.current.addNotification(NotificationOptions.error("Error rejecting deal."));
    }
  }

  const handleDelete = async () => {
    try {
      await Api.Delete({ path: `/api/publishers/${scopeId}/deals/${deleteId}` });
      notificationSystem.current.addNotification(NotificationOptions.success(<span>Deal {publisherDeleteDeal.name} deleted.</span>, false));
      setShowDeleteConfirm(false);
      setShowDealsLoader(true);
    } catch (err) {
      setShowDeleteConfirm(false);
      notificationSystem.current.addNotification(NotificationOptions.error("Error deleting deal."));
    }
  }

  const handleSubmit = async (dealId: number, publisherId: number, deal: PublisherDeal) => {
    try {
      await Api.Put({ path: `/api/publishers/${publisherId}/deals/${dealId}`, body: deal });
      setShowEditModal(false);
      setShowDealsLoader(true);
      notificationSystem.current.addNotification(NotificationOptions.success(<span>Deal <strong>{deal.name}</strong> saved.</span>, false));
    } catch (err) {
      notificationSystem.current.addNotification(NotificationOptions.error("Error saving deal."));
    }
  }

  if (!error) {
    const publisherDeleteDealName = _.get(publisherDeleteDeal, "name") || "";
    const defaultFloorPrice = _.get(data, "publisher.settings.defaultDealFloorPrice", 0);
    return <Fragment>
      <div className="row">
        <div className="col-sm-12 pt-3">
          <div className="card mb-2">
            <h3 className="pull-left">Deal requests</h3>
            <Loader visible={showRequestsLoader} />
            {!showRequestsLoader &&
              <PublisherDealRequestsTable
                deals={dealRequests}
                user={user}
                writeAccess={rights.MANAGE_PUBLISHER_DEALS}
                approveClick={approveClick}
                rejectClick={rejectClick}
              />}
          </div>
        </div>
      </div>
      <div className="row">
        <div className="col-sm-12 pt-3">
          <div className="card mb-2">
            <h3 className="pull-left">Deals</h3>
            <Loader visible={showDealsLoader} />
            {!showDealsLoader &&
              <PublisherDealsTable
                deals={deals}
                user={user}
                writeAccess={rights.MANAGE_PUBLISHER_DEALS}
                approvalStatusClick={approvalStatusClick}
                editClick={editClick}
                deleteClick={deleteClick}
              />}
          </div>
        </div>
      </div>
      <PublisherDealApproveModal
        deal={publisherApproveDeal}
        defaultFloorPrice={defaultFloorPrice}
        show={showApproveModal}
        onClose={() => setShowApproveModal(false)}
        onSubmit={handleApprove}
      />
      <PublisherDealModal
        deal={publisherEditDeal}
        show={showEditModal}
        writeAccess={rights.MANAGE_PUBLISHER_DEALS}
        handleClose={() => setShowEditModal(false)}
        handleSubmit={handleSubmit}
      />
      <Confirm
        message="Reject deal request?"
        show={showRejectConfirm}
        onClose={() => setShowRejectConfirm(false)}
        onConfirm={handleReject}
      />
      <Confirm
        message={`Delete deal ${publisherDeleteDealName}`}
        show={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDelete}
      />
      <NotificationSystem ref={notificationSystem} />
    </Fragment>;
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
export default PublisherDealsPageBody;