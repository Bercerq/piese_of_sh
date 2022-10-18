import React, { useState, useEffect, useRef, Fragment } from "react";
import * as _ from "lodash";
import NotificationSystem from "react-notification-system";
import * as NotificationOptions from "../../../../../client/NotificationOptions";
import * as Api from "../../../../../client/Api";
import * as Utils from "../../../../../client/Utils";
import * as ExcelHelper from "../../../../../client/ExcelHelper";
import { TabProps } from "../../../../../models/Common";
import { RetailBranch } from "../../../../../models/data/RetailBranch";
import Loader from "../../../../UI/Loader";
import RetailBranchesTable from "./RetailBranchesTable";
import ErrorContainer from "../../../../UI/ErrorContainer";
import FontIcon from "../../../../UI/FontIcon";
import RetailBranchModal from "./RetailBranchModal";
import RetailAdPreviewModal from "./RetailAdPreviewModal"
import RetailBranchImportModal from "./RetailBranchImportModal";
import Confirm from "../../../../UI/Confirm";
import { Modal, Form, Button} from "react-bootstrap";
import Select from "react-select";

const AdvertiserRetailTab = (props: TabProps) => {
  const [retailBranches, setRetailBranches] = useState<RetailBranch[]>([]);
  const [selectableAds, setSelectableAds] = useState<{value:string, name: string}[]>([])
  const [previewRetailBranch, setPreviewRetailBranch] = useState<RetailBranch>(null);
  const [editRetailBranch, setEditRetailBranch] = useState<RetailBranch>(null);
  const [deleteRetailBranch, setDeleteRetailBranch] = useState<RetailBranch>(null);
  const [deleteId, setDeleteId] = useState<number>(-1);
  const [showLoader, setShowLoader] = useState<boolean>(true);
  const [showPreviewModal, setShowPreviewModal] = useState<boolean>(false);
  const [showEditModal, setShowEditModal] = useState<boolean>(false);
  const [showImportModal, setShowImportModal] = useState<boolean>(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<boolean>(false);
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
      const retailBranches = await Api.Get({ path: `/api/advertisers/${props.options.scopeId}/retailbranches`, signal: controller.current.signal });
      const ads = await Api.Get({path: `/api/advertisers/${props.options.scopeId}/ads`})
      const adOptions = ads.map((ad) => { return { value: ad.id, label: ad.name }});
      setSelectableAds(adOptions)
      setRetailBranches(retailBranches);
      setShowLoader(false);
      setError(false);
      setErrorMessage("");
    } catch (err) {
      if (err.name === "AbortError") {
        setError(false);
        setErrorMessage("");
      } else {
        setError(true);
        setErrorMessage("Error loading retail branches.");
        setShowLoader(false);
      }
    }
  }

  function unload() {
    if (controller.current) {
      controller.current.abort();
    }
  }

  function getIsBranchIdNumeric() {
    const branchIds = retailBranches.map((o) => { return o.branchId });
    const numericIds = branchIds.filter((id) => { return Utils.isNumeric(id); });
    return branchIds.length === numericIds.length;
  }

  function sortRetailBranches() {
    const isBranchIdNumeric = getIsBranchIdNumeric();
    if (isBranchIdNumeric) {
      return retailBranches.concat().sort(numericSort);
    } else {
      return retailBranches.concat().sort(stringSort);
    }
  }

  function numericSort(a, b) {
    return parseInt(a.branchId) - parseInt(b.branchId);
  }

  function stringSort(a, b) {
    if (a.branchId < b.branchId) {
      return -1;
    }
    if (a.branchId > b.branchId) {
      return 1;
    }
    return 0;
  }

  async function addRetailBranch(retailBranch: RetailBranch) {
    setShowLoader(true);
    try {
      const body = { retailBranches: [retailBranch], replaceAll: false };
      await Api.Post({ path: `/api/advertisers/${props.options.scopeId}/retailbranches`, body });
      loadData();
      notificationSystem.current.addNotification(NotificationOptions.success(<span>Retail branch <strong>{retailBranch.name}</strong> created.</span>, false));
    } catch (err) {
      setShowLoader(false);
      notificationSystem.current.addNotification(NotificationOptions.error("Error creating retail branch."));
    }
    setShowEditModal(false);
    setEditRetailBranch(null);
  }

  async function updateRetailBranch(id: number, retailBranch: RetailBranch) {
    setShowLoader(true);
    try {
      await Api.Put({ path: `/api/advertisers/${props.options.scopeId}/retailbranches/${id}`, body: retailBranch });
      loadData();
      notificationSystem.current.addNotification(NotificationOptions.success(<span>Retail branch <strong>{retailBranch.name}</strong> saved.</span>, false));
    } catch (err) {
      setShowLoader(false);
      notificationSystem.current.addNotification(NotificationOptions.error("Error updating retail branch."));
    }
    setShowEditModal(false);
    setEditRetailBranch(null);
  }

  function exportMapping() {
    return {
      "branchId": "id",
      "name": "name",
      "urlTag": "landing page",
      "latitude": "latitude",
      "longitude": "longitude",
      "radius": "radius",
      "targetingZipCodes": "targeting postal codes",
      "country": "country",
      "region": "region",
      "city": "city",
      "postalCode": "postal code",
      "address1": "address line 1",
      "address2": "address line 2",
      "custom1": "custom 1",
      "custom2": "custom 2",
      "custom3": "custom 3",
      "custom4": "custom 4",
      "custom5": "custom 5",
      "custom6": "custom 6",
      "custom7": "custom 7",
      "custom8": "custom 8",
      "custom9": "custom 9"
    };
  }

  const previewClick = (id) => {
    const previewRetailBranch = retailBranches.find((o) => { return o.id === id });
    setPreviewRetailBranch(previewRetailBranch)
    setShowPreviewModal(true);
  }

  const editClick = (id) => {
    const editRetailBranch = retailBranches.find((o) => { return o.id === id });
    setEditRetailBranch(editRetailBranch);
    setShowEditModal(true);
  }

  const deleteClick = (deleteId: number) => {
    const deleteRetailBranch = retailBranches.find((o) => { return o.id === deleteId });
    setShowDeleteConfirm(true);
    setDeleteId(deleteId);
    setDeleteRetailBranch(deleteRetailBranch);
  }

  const deleteConfirm = async () => {
    setShowLoader(true);
    try {
      await Api.Delete({ path: `/api/advertisers/${props.options.scopeId}/retailbranches/${deleteId}` });
      const deleteRetailBranchName = _.get(deleteRetailBranch, "name", "");
      loadData();
      notificationSystem.current.addNotification(NotificationOptions.success(<span>Retail branch <strong>{deleteRetailBranchName}</strong> deleted.</span>, false));
    } catch (err) {
      setShowLoader(false);
      notificationSystem.current.addNotification(NotificationOptions.error("Error deleting retail branch."));
    }
    setShowDeleteConfirm(false);
    setDeleteId(-1);
    setDeleteRetailBranch(null);
  }

  const exportClick = () => {
    const mapping = exportMapping();
    const header = _.values(mapping).map((value) => { return ExcelHelper.getBoldCell(value); });
    const sortedRetailBranches = sortRetailBranches();
    const rows = sortedRetailBranches.map((o) => {
      const row = _.keys(mapping).map((r) => {
        if (Array.isArray(o[r])) {
          return ExcelHelper.getCell(o[r].join(','));
        } else {
          return ExcelHelper.getCell(o[r]);
        }
      });
      return row;
    });
    const exportData = [header].concat(rows);
    ExcelHelper.save(exportData, "Retail branches", "RetailBranches");
  }

  const handleSubmit = async (id: number, retailBranch: RetailBranch) => {
    if (id > 0) {
      await updateRetailBranch(id, retailBranch);
    } else {
      await addRetailBranch(retailBranch);
    }
  }

  const importSubmit = async (data: { retailBranches: RetailBranch[], replaceAll: boolean }) => {
    setShowLoader(true);
    try {
      await Api.Post({ path: `/api/advertisers/${props.options.scopeId}/retailbranches`, body: data });
      loadData();
      notificationSystem.current.addNotification(NotificationOptions.success("Retail branches successfully imported.", false));
    } catch (err) {
      setShowLoader(false);
      notificationSystem.current.addNotification(NotificationOptions.error("Error importing retail branches."));
    }
    setShowImportModal(false);
  }

  if (!error) {
    const deleteRetailBranchName = _.get(deleteRetailBranch, "name", "");

    return <div className="col-sm-12 pt-3">
      <div className="card mb-2">
        <h3 className="pull-left">Retail</h3>
        <div className="table-btn-container">
          {props.rights.MANAGE_ADVERTISER && <Fragment>
            <Button size="sm" variant="primary" className="mr-2" onClick={() => { setShowEditModal(true) }}><FontIcon name="plus" /> ADD</Button>
            <Button size="sm" variant="primary" className="mr-2" onClick={() => { setShowImportModal(true) }}><FontIcon name="upload" /> IMPORT</Button>
          </Fragment>}
          <Button size="sm" variant="primary" onClick={exportClick}><FontIcon name="download" /> EXPORT</Button>
        </div>
        <Loader visible={showLoader} />
        {!showLoader &&
          <RetailBranchesTable
            retailBranches={retailBranches}
            user={props.user}
            rights={props.rights}
            previewClick={previewClick}
            editClick={editClick}
            deleteClick={deleteClick}
          />
        }
      </div>
      <RetailAdPreviewModal
        show={showPreviewModal}
        ads={selectableAds}
        branch={previewRetailBranch}
        onClose={() => { setShowPreviewModal(false);setPreviewRetailBranch(null); }}
      />
      <RetailBranchModal
        show={showEditModal}
        writeAccess={props.rights.MANAGE_ADVERTISER}
        retailBranch={editRetailBranch}
        handleClose={() => { setShowEditModal(false); setEditRetailBranch(null); }}
        handleSubmit={handleSubmit}
      />
      <RetailBranchImportModal
        show={showImportModal}
        existingBranches={retailBranches}
        handleSubmit={importSubmit}
        handleClose={() => { setShowImportModal(false); }}
      />
      <Confirm
        message={`Delete retail branch ${deleteRetailBranchName}?`}
        show={showDeleteConfirm}
        onClose={() => { setShowDeleteConfirm(false) }}
        onConfirm={deleteConfirm}
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
export default AdvertiserRetailTab;