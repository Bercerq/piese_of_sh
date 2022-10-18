import React, { useState, useRef, useContext, useEffect, Fragment } from "react";
import { useParams } from "react-router-dom";
import { Collapse, Button } from "react-bootstrap";
import * as _ from "lodash";
import NotificationSystem from "react-notification-system";
import * as NotificationOptions from "../../../../client/NotificationOptions";
import * as Api from "../../../../client/Api";
import * as Helper from "../../../../client/Helper";
import * as Roles from "../../../../modules/Roles";
import { AppUser } from "../../../../models/AppUser";
import UserContext from "../../context/UserContext";
import { ScopeDataContextType, Rights, Options, LookUp } from "../../../../models/Common";
import { ScopeType } from "../../../../client/schemas";
import ScopeDataContext from "../../context/ScopeDataContext";
import { Ad, AdRow, AdUpdateAction } from "../../../../models/data/Ads";
import Loader from "../../../UI/Loader";
import AdsTable from "./AdsTable";
import ErrorContainer from "../../../UI/ErrorContainer";
import Confirm from "../../../UI/Confirm";
import AdPreviewModal from "./AdPreviewModal";
import AdShareModal from "./AdShareModal";
import AdModal from "./AdModal";
import AdsCreateModal from "./AdsCreateModal";
import FontIcon from "../../../UI/FontIcon";
import { AdvertiserEntity } from "../../../../models/data/Advertiser";
import CampaignLinksModal from "../../shared/CampaignLinksModal";

const AdvaultPageBody = (props: { videoMode: boolean }) => {
  let params: { scope?, scopeId?} = useParams();
  let scope = params.scope as ScopeType;
  let scopeId = params.scopeId;
  const scopedParam = Helper.scopedParam({ scope, scopeId });
  let { data } = useContext<ScopeDataContextType>(ScopeDataContext);
  const rights: Rights = Roles.getRights(data.rights);
  const user: AppUser = useContext<AppUser>(UserContext);

  const [activeAds, setActiveAds] = useState<Ad[]>([]);
  const [inactiveAds, setInactiveAds] = useState<Ad[]>(null);
  const [advertisers, setAdvertisers] = useState<AdvertiserEntity[]>([]);
  const [showActiveLoader, setShowActiveLoader] = useState<boolean>(false);
  const [showInactiveLoader, setShowInactiveLoader] = useState<boolean>(false);
  const [showAdPreviewModal, setShowAdPreviewModal] = useState<boolean>(false);
  const [previewAdId, setPreviewAdId] = useState<number>(-1);
  const [previewAdvertiserId, setPreviewAdvertiserId] = useState<number>(-1);
  const [editAdId, setEditAdId] = useState<number>(-1);
  const [deleteAd, setDeleteAd] = useState<Ad>(null);
  const [editType, setEditType] = useState<"active" | "inactive">("active");
  const [deleteType, setDeleteType] = useState<"active" | "inactive">("active");
  const [showEditModal, setShowEditModal] = useState<boolean>(false);
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<boolean>(false);
  const [showDeleteInactiveConfirm, setShowDeleteInactiveConfirm] = useState<boolean>(false);
  const [shareId, setShareId] = useState<number>(-1);
  const [showShareModal, setShowShareModal] = useState<boolean>(false);
  const [campaignsModalTitle, setCampaignsModalTitle] = useState<string>("");
  const [showCampaignsModal, setShowCampaignsModal] = useState<boolean>(false);
  const [campaigns, setCampaigns] = useState<LookUp[]>([]);
  const [inactiveOpen, setInactiveOpen] = useState<boolean>(false);
  const [activeError, setActiveError] = useState<boolean>(false);
  const [inactiveError, setInactiveError] = useState<boolean>(false);
  const [activeErrorMessage, setActiveErrorMessage] = useState<string>("");
  const [inactiveErrorMessage, setInactiveErrorMessage] = useState<string>("");

  const notificationSystem = useRef<NotificationSystem.System>(null);
  const activeController = useRef<AbortController>(null);
  const inactiveController = useRef<AbortController>(null);
  const advertisersController = useRef<AbortController>(null);

  useEffect(() => {
    return () => {
      unload(activeController.current);
      unload(inactiveController.current);
      unload(advertisersController.current);
    }
  }, []);
  useEffect(() => { loadActiveData(); loadAdvertisers(); }, [scope, scopeId]);

  async function loadActiveData() {
    setShowActiveLoader(true);
    try {
      unload(activeController.current);
      activeController.current = new AbortController();
      const qs = _.assign({}, scopedParam, { active: "true" });
      const activeAds: Ad[] = await Api.Get({ path: "/api/ads", qs, signal: activeController.current.signal });
      setActiveAds(activeAds);
      setActiveError(false);
      setActiveErrorMessage("");
      setShowActiveLoader(false);
    } catch (err) {
      console.log(err);
      if (err.name === "AbortError") {
        setActiveError(false);
        setActiveErrorMessage("");
      } else {
        setActiveError(true);
        setActiveErrorMessage("Error loading active ads.");
        setShowActiveLoader(false);
      }
    }
  }

  async function loadInactiveData() {
    setShowInactiveLoader(true);
    try {
      unload(inactiveController.current);
      inactiveController.current = new AbortController();
      const qs = _.assign({}, scopedParam, { active: "false" });
      const inactiveAds: Ad[] = await Api.Get({ path: "/api/ads", qs, signal: inactiveController.current.signal });
      setInactiveAds(inactiveAds);
      setInactiveError(false);
      setInactiveErrorMessage("");
      setShowInactiveLoader(false);
    } catch (err) {
      console.log(err);
      if (err.name === "AbortError") {
        setInactiveError(false);
        setInactiveErrorMessage("");
      } else {
        setInactiveError(true);
        setInactiveErrorMessage("Error loading ads.");
        setShowInactiveLoader(false);
      }
    }
  }

  async function loadAdvertisers() {
    if (scope !== "advertiser") {
      unload(advertisersController.current);
      advertisersController.current = new AbortController();
      const advertisersData = await Api.Get({ path: "/api/advertisers", qs: scopedParam, signal: advertisersController.current.signal });
      const advertisers = advertisersData.advertisers.map((o) => { return o.advertiser; });
      setAdvertisers(advertisers);
    }
  }

  function unload(controller: AbortController) {
    if (controller) {
      controller.abort();
    }
  }

  function getAds(type: "active" | "inactive") {
    return type === "active" ? activeAds : inactiveAds;
  }

  const update = async (row: Ad | AdRow, action: AdUpdateAction, data: Partial<Ad>) => {
    try {
      await Api.Put({ path: `/api/ads/${row.id}`, body: { advertiserId: row.advertiserId, data } });
      const notificationMessage = getNotificationMessage(row, action, true);
      notificationSystem.current.addNotification(NotificationOptions.success(notificationMessage, false));
      setShowEditModal(false);
      loadActiveData();
      if (inactiveAds) {
        loadInactiveData();
      }
      setEditAdId(-1);
    } catch (err) {
      const notificationMessage = getNotificationMessage(row, action, false);
      notificationSystem.current.addNotification(NotificationOptions.error(notificationMessage));
      setShowEditModal(false);
      setEditAdId(-1);
    }
  }

  const removeAd = async () => {
    try {
      await Api.Post({ path: `/api/ads/${deleteAd.id}`, body: { advertiserId: deleteAd.advertiserId } });
      notificationSystem.current.addNotification(NotificationOptions.success(<span>Ad <strong>{deleteAd.name}</strong> deleted.</span>, false));
      setShowDeleteConfirm(false);
      if (deleteType === "active") {
        loadActiveData();
      } else {
        loadInactiveData();
      }
      setDeleteAd(null);
    } catch (err) {
      notificationSystem.current.addNotification(NotificationOptions.error("Error deleting ad."));
    }
  }

  const removeInactiveAds = async () => {
    try {
      const scopedParam = Helper.scopedParam({ scope, scopeId });
      await Api.Delete({ path: "/api/ads/delete-inactive", qs: scopedParam });
      notificationSystem.current.addNotification(NotificationOptions.success("Inactive ads successfully deleted.", false));
      setShowDeleteInactiveConfirm(false);
      loadInactiveData();
    } catch (err) {
      notificationSystem.current.addNotification(NotificationOptions.error("Error deleting inactive ads."));
    }
  }

  const previewClick = (id: number, advertiserId: number) => {
    setPreviewAdId(id);
    setPreviewAdvertiserId(advertiserId)
    setShowAdPreviewModal(true);
  }

  const shareClick = (id: number) => {
    setShareId(id);
    setShowShareModal(true);
  }

  const editClick = (id: number, type: "active" | "inactive") => {
    setEditAdId(id);
    setEditType(type);
    setShowEditModal(true);
  }

  const deleteClick = (id: number, type: "active" | "inactive") => {
    const ads = getAds(type) || [];
    const deleteAd = ads.find((o) => { return o.id === id }) || null;
    setDeleteAd(deleteAd);
    setDeleteType(type);
    setShowDeleteConfirm(true);
  }

  const confirmClose = () => {
    setShowDeleteConfirm(false);
    setDeleteAd(null);
  }

  const confirmInactiveClose = () => {
    setShowDeleteInactiveConfirm(false);
  }

  const previewClose = () => {
    setPreviewAdId(-1);
    setShowAdPreviewModal(false);
  }

  const editClose = () => {
    setEditAdId(-1);
    setShowEditModal(false);
  }

  const shareClose = () => {
    setShareId(-1);
    setShowShareModal(false);
  }

  const createClose = async (toDelete: string[]) => {
    setShowCreateModal(false);
    await deleteDirs(toDelete || []);
  }

  const editSubmit = async (id: number, data: Partial<Ad>) => {
    const ads = getAds(editType) || [];
    const row = ads.find((o) => { return o.id === id });
    if (row) {
      await update(row, null, data);
    }
  }

  const createSubmit = async (advertiserId: number, ads: Partial<Ad>[], toDelete: string[]) => {
    try {
      const erroredAds = await Api.Post({ path: "/api/ads", body: { advertiserId, ads } });
      if (erroredAds.length === 0) {
        const notificationMessage = "Ads created.";
        notificationSystem.current.addNotification(NotificationOptions.success(notificationMessage, false));
      } else {
        const notificationMessage = getErroredAdsNotificationMessage(erroredAds);
        notificationSystem.current.addNotification(NotificationOptions.error(notificationMessage));
      }
      setShowCreateModal(false);
      loadActiveData();
      if (inactiveAds) {
        loadInactiveData();
      }
    } catch (err) {
      const notificationMessage = "Error creating ads."
      notificationSystem.current.addNotification(NotificationOptions.error(notificationMessage));
      setShowCreateModal(false);
    }
    await deleteDirs(toDelete || []);
  }

  const createAdsClick = () => {
    setShowCreateModal(true);
  }

  const removeInactiveAdsClick = () => {
    setShowDeleteInactiveConfirm(true);
  }

  const handleInactiveHeaderClick = async (e) => {
    e.preventDefault();
    setInactiveOpen(!inactiveOpen);
    if (!inactiveAds) {
      await loadInactiveData();
    }
  }

  const campaignsClick = (campaigns: LookUp[], row: AdRow) => {
    setShowCampaignsModal(true);
    setCampaignsModalTitle(`Campaigns using ad: ${row.name}`);
    setCampaigns(campaigns);
  }

  const campaignsModalClose = () => {
    setShowCampaignsModal(false);
    setCampaignsModalTitle("");
    setCampaigns([]);
  }

  function getNotificationMessage(ad: Ad | AdRow, action: AdUpdateAction | null, success: boolean): JSX.Element {
    if (success) {
      switch (action) {
        case "activate": return <span>Ad <strong>{ad.name}</strong>  activated</span>;
        case "deactivate": return <span>Ad <strong>{ad.name}</strong>  deactivated</span>;
        case "approve": return <span>Ad <strong>{ad.name}</strong>  approved</span>;
        case "disapprove": return <span>Ad <strong>{ad.name}</strong>  disapproved</span>;
        case "request": return <span> Approval requested for ad <strong>{ad.name}</strong></span>;
        case "withdrawrequest": return <span> Withdrawn approval request for ad <strong>{ad.name}</strong></span>;
        case "requestrehost": return <span> Requested rehost for ad <strong>{ad.name}</strong></span>;
        default: return <span>Ad <strong>{ad.name}</strong> saved.</span>;
      }
    } else {
      switch (action) {
        case "activate": return <span>Failed to activate ad <strong>{ad.name}</strong></span>;
        case "deactivate": return <span>Failed to deactivate ad <strong>{ad.name}</strong></span>;
        case "approve": return <span>Failed to approve ad <strong>{ad.name}</strong></span>;
        case "disapprove": return <span>Failed to disapprove ad <strong>{ad.name}</strong></span>;
        case "request": return <span> Failed to request approval for ad <strong>{ad.name}</strong></span>;
        case "withdrawrequest": return <span> Failed to withdraw approval request for ad <strong>{ad.name}</strong></span>;
        case "requestrehost": return <span> Failed to request rehost for ad <strong>{ad.name}</strong></span>;

        default: return <span>Error saving ad <strong>{ad.name}</strong></span>;
      }
    }
  }

  async function deleteDirs(dirsToDelete) {
    if (dirsToDelete.length > 0) {
      try {
        await Api.Post({ path: "/api/ads/delete-dirs", body: { toDelete: dirsToDelete } });
      } catch (err) {
        console.log("Error delete temp dirs", err);
      }
    }
  }

  function getErroredAdsNotificationMessage(erroredAds) {
    return <Fragment>
      <div>The following ads failed to save: </div>
      {
        erroredAds.map((erroredAd, i) => <div key={`errored-ad-${i}`}>Ad {erroredAd.key}: {erroredAd.msg}</div>)
      }
    </Fragment>
  }

  const deleteAdName = deleteAd ? deleteAd.name : "";
  return <Fragment>
    <div className="row">
      <div className="col-sm-12 pt-3">
        {!activeError &&
          <div className="card mb-2">
            <h3 className="pull-left">Ads</h3>
            <div className="table-btn-container">
              {rights.MANAGE_ADS &&
                <Button variant="primary" size="sm" className="mr-2" onClick={createAdsClick}><FontIcon name="plus" /> CREATE ADS</Button>}
            </div>
            <Loader visible={showActiveLoader} />
            {!showActiveLoader && <AdsTable
              type="active"
              ads={activeAds}
              advertisers={advertisers}
              showAdvertiserCol={scope !== "advertiser"}
              user={user}
              rights={rights}
              update={update}
              editClick={(id: number) => { editClick(id, "active"); }}
              deleteClick={(id: number) => { deleteClick(id, "active"); }}
              previewClick={(id: number, advertiserId: number) => { previewClick(id, advertiserId); }}
              shareClick={shareClick}
              campaignsClick={campaignsClick}
            />}
          </div>
        }
        {activeError &&
          <div className="card mb-2">
            <h3><ErrorContainer message={activeErrorMessage} /></h3>
          </div>
        }
      </div>
      <div className="col-sm-12 pt-3">
        <div className="card h-100 mb-2">
          <div>
            <a className="table-collapse-header" href="" onClick={handleInactiveHeaderClick}><FontIcon name={inactiveOpen ? "chevron-up" : "chevron-down"} /> <h3>Inactive ads</h3></a>
            <Collapse in={inactiveOpen}>
              <div>
                <Loader visible={showInactiveLoader} />
                {!showInactiveLoader && <Fragment>
                  <div className="table-btn-container">
                    {rights.MANAGE_ADS &&
                      <Button variant="danger" size="sm" className="mr-2" onClick={removeInactiveAdsClick}><FontIcon name="remove" /> REMOVE INACTIVE ADS</Button>}
                  </div>
                  {!inactiveError &&
                    <AdsTable
                      type="inactive"
                      ads={inactiveAds || []}
                      advertisers={advertisers}
                      showAdvertiserCol={scope !== "advertiser"}
                      user={user}
                      rights={rights}
                      update={update}
                      editClick={(id: number) => { editClick(id, "inactive"); }}
                      deleteClick={(id: number) => { deleteClick(id, "inactive"); }}
                      previewClick={(id: number, advertiserId: number) => { previewClick(id, advertiserId); }}
                      shareClick={shareClick}
                      campaignsClick={campaignsClick}
                    />
                  }
                  {inactiveError &&
                    <h3><ErrorContainer message={inactiveErrorMessage} /></h3>
                  }
                </Fragment>}
              </div>
            </Collapse>
          </div>
        </div>
      </div>
    </div>
    <AdPreviewModal
      show={showAdPreviewModal}
      advertiserId={previewAdvertiserId}
      id={previewAdId}
      onClose={previewClose}
    />
    <AdModal
      show={showEditModal}
      id={editAdId}
      writeAccess={rights.MANAGE_ADS}
      onClose={editClose}
      onSubmit={editSubmit}
    />
    <AdsCreateModal
      scope={scope}
      scopeId={scopeId}
      data={data}
      videoMode={props.videoMode}
      show={showCreateModal}
      onClose={createClose}
      onSubmit={createSubmit}
    />
    <AdShareModal
      show={showShareModal}
      id={shareId}
      onClose={shareClose}
    />
    <CampaignLinksModal
      title={campaignsModalTitle}
      show={showCampaignsModal}
      campaigns={campaigns}
      tab="ads"
      onClose={campaignsModalClose}
    />
    <Confirm
      message={`Are you sure you want to delete ad ${deleteAdName}?`}
      show={showDeleteConfirm}
      onClose={confirmClose}
      onConfirm={removeAd}
    />
    <Confirm
      message={`Delete all inactive ads?`}
      show={showDeleteInactiveConfirm}
      onClose={confirmInactiveClose}
      onConfirm={removeInactiveAds}
    />
    <NotificationSystem ref={notificationSystem} />
  </Fragment >;
}
export default AdvaultPageBody;