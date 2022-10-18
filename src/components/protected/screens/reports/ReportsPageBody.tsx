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
import ReportsTable from "./ReportsTable";
import ReportInstancesModal from "./ReportInstancesModal";
import ReportModal from "./ReportModal";
import ReportShareModal from "./ReportShareModal"
import { Report } from "../../../../models/data/Report";
import BreadcrumbContext from "../../context/BreadcrumbContext";

const ReportsPageBody = () => {
  let params: { scope?, scopeId?} = useParams();
  let scope = params.scope as ScopeType;
  let scopeId = params.scopeId;
  let { data } = useContext<ScopeDataContextType>(ScopeDataContext);
  const rights: Rights = Roles.getRights(data.rights);
  const user: AppUser = useContext<AppUser>(UserContext);
  let { items } = useContext<BreadcrumbContextType>(BreadcrumbContext);

  const [showLoader, setShowLoader] = useState<boolean>(true);
  const [reports, setReports] = useState<{ current: Report[], past: Report[] }>({ current: [], past: [] });
  const [currentFiltersCounter, setCurrentFiltersCounter] = useState<number>(0);
  const [pastFiltersCounter, setPastFiltersCounter] = useState<number>(0);
  const [editReport, setEditReport] = useState<Report>(null);
  const [shareReport, setShareReport] = useState<Report>(null);
  const [writeAccess, setWriteAccess] = useState<boolean>(false);
  const [showEditModal, setShowEditModal] = useState<boolean>(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<boolean>(false);
  const [showReportInstancesModal, setShowReportInstancesModal] = useState<boolean>(false);
  const [showReportShareModal, setShowReportShareModal] = useState<boolean>(false);
  const [instancesReport, setInstancesReport] = useState<Report>(null);
  const [deleteId, setDeleteId] = useState<number>(-1);
  const [deleteReport, setDeleteReport] = useState<Report>(null);
  const [error, setError] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>("");

  const notificationSystem = useRef<NotificationSystem.System>(null);
  const controller = useRef<AbortController>(null);

  useEffect(() => { return unload; }, []);
  useEffect(() => { loadReports(); }, [scope, scopeId]);

  async function loadReports() {
    setShowLoader(true);
    try {
      unload();
      controller.current = new AbortController();
      const qs = Helper.scopedParam({ scope, scopeId });
      const results = await Api.Get({ path: `/api/reports`, qs, signal: controller.current.signal });
      const [current, past] = _.partition(results, (o) => { return moment(o.scheduleEnd).diff(moment()) > 0 });
      setReports({ current, past });
    } catch (err) {
      if (err.name === "AbortError") {
        setError(false);
        setErrorMessage("");
      } else {
        setError(true);
        setErrorMessage("Error loading reports.");
      }
    }
    setShowLoader(false);
  }

  function unload() {
    if (controller.current) {
      controller.current.abort();
    }
  }

  function editClick(editId: number, writeAccess: boolean, type: "current" | "past") {
    const editReport = reports[type].find((o) => { return o.id === editId });
    setEditReport(editReport);
    setWriteAccess(writeAccess);
    setShowEditModal(true);
  }

  function deleteClick(deleteId: number, type: "current" | "past") {
    const deleteReport = reports[type].find((o) => { return o.id === deleteId });
    setDeleteId(deleteId);
    setDeleteReport(deleteReport);
    setShowDeleteConfirm(true);
  }

  async function downloadClick(downloadId: number, type: "current" | "past") {
    try {
      const instancesReport = reports[type].find((o) => { return o.id === downloadId });
      setInstancesReport(instancesReport);
      setShowReportInstancesModal(true);
    } catch (err) {
      console.log(err);
    }
  }

  const addReportClick = () => {
    setShowEditModal(true);
    setEditReport(null);
    setWriteAccess(true);
  }

  const handleDelete = async () => {
    try {
      await Api.Delete({ path: `/api/reports/${deleteId}` });
      notificationSystem.current.addNotification(NotificationOptions.success(<span>Report {deleteReport.name} deleted.</span>, false));
      setShowDeleteConfirm(false);
      loadReports();
    } catch (err) {
      setShowDeleteConfirm(false);
      notificationSystem.current.addNotification(NotificationOptions.error("Error deleting report."));
    }
  }

  function shareClick(shareId: number, type: "current" | "past") {
    const shareReport = reports[type].find((o) => { return o.id === shareId });
    setShareReport(shareReport);
    setShowReportShareModal(true);
  }

  const handleSubmit = async (id: number, report: Partial<Report>) => {
    try {
      if (id > 0) {
        await Api.Put({ path: `/api/reports/${id}`, body: report });
      } else {
        await Api.Post({ path: `/api/reports`, body: report });
      }
      setShowEditModal(false);
      setEditReport(null);
      loadReports();
      notificationSystem.current.addNotification(NotificationOptions.success(<span>Report <strong>{report.name}</strong> saved.</span>, false));
    } catch (err) {
      setShowEditModal(false);
      setEditReport(null);
      notificationSystem.current.addNotification(NotificationOptions.error("Error saving report."));
    }
  }

  if (!error) {
    const deleteReportName = _.get(deleteReport, "name", "");
    const maxLevel = Helper.getMaxLevel(user, items);
    return <div className="row">
      <div className="col-sm-12 pt-3">
        <div className="card mb-2">
          <h3 className="pull-left">Current reports</h3>
          <div className="pull-right">
            {rights.MANAGE_REPORTS &&
              <Button size="sm" variant="primary" className="mr-2" onClick={addReportClick}><FontIcon name="plus" /> ADD REPORT</Button>
            }
            <Button size="sm" variant="primary" onClick={() => { setCurrentFiltersCounter(currentFiltersCounter + 1) }}><FontIcon name="remove" /> CLEAR FILTERS</Button>
          </div>
          <Loader visible={showLoader} />
          {!showLoader &&
            <ReportsTable
              type="current"
              user={user}
              records={reports.current}
              filtersCounter={currentFiltersCounter}
              shareClick={(shareId: number) => {shareClick(shareId, "current");}}
              editClick={(editId: number, writeAccess: boolean) => { editClick(editId, writeAccess, "current"); }}
              deleteClick={(deleteId: number) => { deleteClick(deleteId, "current") }}
              downloadClick={(downloadId: number) => { downloadClick(downloadId, "current") }}
            />
          }
        </div>
        <div className="card mb-2">
          <h3 className="pull-left">Past reports</h3>
          <div className="pull-right">
            <Button size="sm" variant="primary" onClick={() => { setPastFiltersCounter(pastFiltersCounter + 1) }}><FontIcon name="remove" /> CLEAR FILTERS</Button>
          </div>
          <Loader visible={showLoader} />
          {!showLoader &&
            <ReportsTable
              type="past"
              user={user}
              records={reports.past}
              filtersCounter={pastFiltersCounter}
              shareClick={(shareId: number) => {shareClick(shareId, "past");}}
              editClick={(editId: number, writeAccess: boolean) => { editClick(editId, writeAccess, "past"); }}
              deleteClick={(deleteId: number) => { deleteClick(deleteId, "past") }}
              downloadClick={(downloadId: number) => { downloadClick(downloadId, "past") }}
            />
          }
        </div>
      </div>
      <ReportModal
        report={editReport}
        writeAccess={writeAccess}
        show={showEditModal}
        rights={rights}
        scope={scope}
        scopeId={scopeId}
        maxLevel={maxLevel}
        handleClose={() => { setShowEditModal(false); }}
        handleSubmit={handleSubmit}
      />
      <ReportInstancesModal
        report={instancesReport}
        show={showReportInstancesModal}
        handleClose={() => { setShowReportInstancesModal(false); }}
      />
       <ReportShareModal
        report={shareReport}
        show={showReportShareModal}
        shareBaseUrl={"https://api.optoutadvertising.com/noax2"}
        handleClose={() => { setShowReportShareModal(false); }}
      />
      <Confirm
        message={`Delete report ${deleteReportName}`}
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
export default ReportsPageBody;