import React, { useState, useRef, useContext, useEffect, Fragment } from "react";
import { findDOMNode } from "react-dom";
import { useParams } from "react-router-dom";
import { Button, Overlay, Tooltip } from "react-bootstrap";
import { CopyToClipboard } from "react-copy-to-clipboard/lib";
import * as _ from "lodash";
import NotificationSystem from "react-notification-system";
import * as NotificationOptions from "../../../../client/NotificationOptions";
import * as Api from "../../../../client/Api";
import * as Helper from "../../../../client/Helper";
import * as ExcelHelper from "../../../../client/ExcelHelper";
import * as Roles from "../../../../modules/Roles";
import { ScopeType, DateRange, Metric } from "../../../../client/schemas";
import { ScopeDataContextType, Rights, Options, QsContextType } from "../../../../models/Common";
import ScopeDataContext from "../../context/ScopeDataContext";
import { AppUser } from "../../../../models/AppUser";
import UserContext from "../../context/UserContext";
import ErrorContainer from "../../../UI/ErrorContainer";
import FontIcon from "../../../UI/FontIcon";
import { Segment } from "../../../../models/data/Segment";
import Loader from "../../../UI/Loader";
import SegmentsTable from "./SegmentsTable";
import SegmentCodeModal from "./SegmentCodeModal";
import SegmentModal from "./SegmentModal";
import Confirm from "../../../UI/Confirm";
import { AdvertiserEntity } from "../../../../models/data/Advertiser";
import ReportModal from "../../shared/reports/ReportModal";
import QsContext from "../../context/QsContext";

const SegmentsPageBody = () => {
  let params: { scope?, scopeId?} = useParams();
  let scope = params.scope as ScopeType;
  let scopeId = params.scopeId;
  let { data } = useContext<ScopeDataContextType>(ScopeDataContext);
  const rights: Rights = Roles.getRights(data.rights);
  const user: AppUser = useContext<AppUser>(UserContext);
  let { daterange } = useContext<QsContextType>(QsContext);
  const startDate: string = daterange.startDate.format("YYYY-MM-DD");
  const endDate: string = daterange.endDate.format("YYYY-MM-DD");

  const options: Options = {
    startDate,
    endDate,
    statistics: rights.VIEW_STATISTICS
  };

  const [segments, setSegments] = useState<Segment[]>([]);
  const [advertisers, setAdvertisers] = useState<AdvertiserEntity[]>([]);
  const [editSegment, setEditSegment] = useState<Segment>(null);
  const [deleteSegment, setDeleteSegment] = useState<Segment>(null);
  const [deleteId, setDeleteId] = useState<number>(-1);
  const [codeId, setCodeId] = useState<number>(-1);
  const [codeSegment, setCodeSegment] = useState<Segment>(null);
  const [showLoader, setShowLoader] = useState<boolean>(false);
  const [showEditModal, setShowEditModal] = useState<boolean>(false);
  const [showCodeModal, setShowCodeModal] = useState<boolean>(false);
  const [showReportModal, setShowReportModal] = useState<boolean>(false);
  const [downloading, setDownloading] = useState<boolean>(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [writeAccess, setWriteAccess] = useState<boolean>(false);
  const [error, setError] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>("");

  const notificationSystem = useRef<NotificationSystem.System>(null);
  const controller = useRef<AbortController>(null);
  const copyBtn = useRef<HTMLButtonElement>(null);

  useEffect(() => { return unload; }, []);
  useEffect(() => { loadData(); }, [scopeId, startDate, endDate]);

  async function loadData() {
    setShowLoader(true);
    try {
      unload();
      controller.current = new AbortController();
      const scopedParam = Helper.scopedParam({ scope, scopeId });
      const statisticOptions = _.assign({}, scopedParam, options);
      const segments: Segment[] = await Api.Get({ path: "/api/segments/statistics", qs: statisticOptions, signal: controller.current.signal });
      if (scope !== "advertiser") {
        const advertisersData = await Api.Get({ path: "/api/advertisers", qs: scopedParam, signal: controller.current.signal });
        const advertisers = advertisersData.advertisers.map((o) => { return o.advertiser; });
        setAdvertisers(advertisers);
      }
      setSegments(segments);
      setError(false);
      setErrorMessage("");
      setShowLoader(false);
    } catch (err) {
      console.log(err);
      if (err.name === "AbortError") {
        setError(false);
        setErrorMessage("");
      } else {
        setError(true);
        setErrorMessage("Error loading segments.");
        setShowLoader(false);
      }
    }
  }

  function unload() {
    if (controller.current) {
      controller.current.abort();
    }
  }

  const createSegmentClick = () => {
    setShowEditModal(true);
    setEditSegment(null);
    setWriteAccess(true);
  }

  const editClick = (id, writeAccess) => {
    const editSegment = segments.find((o) => { return o.id === id });
    setEditSegment(editSegment);
    setShowEditModal(true);
    setWriteAccess(writeAccess);
  }

  const deleteClick = (deleteId) => {
    const deleteSegment = segments.find((o) => { return o.id === deleteId });
    setShowDeleteConfirm(true);
    setDeleteId(deleteId);
    setDeleteSegment(deleteSegment);
  }

  const codeClick = (codeId) => {
    const codeSegment = segments.find((o) => { return o.id === codeId });
    setCodeId(codeId);
    setCodeSegment(codeSegment);
    setShowCodeModal(true);
  }

  const handleSubmit = async (id: number, segment: Segment) => {
    if (id > 0) {
      await updateSegment(id, segment);
    } else {
      await addSegment(segment);
    }
  }

  async function addSegment(segment: Segment) {
    try {
      await Api.Post({ path: `/api/segments`, body: segment, qs: { advertiserId: segment.advertiserId } });
      setShowEditModal(false);
      loadData();
      notificationSystem.current.addNotification(NotificationOptions.success(<span>Segment <strong>{segment.name}</strong> created.</span>, false));
    } catch (err) {
      setShowEditModal(false);
      setShowLoader(false);
      notificationSystem.current.addNotification(NotificationOptions.error("Error creating segment."));
    }
  }

  async function updateSegment(id: number, segment: Segment) {
    try {
      await Api.Put({ path: `/api/segments/${id}`, body: segment, qs: { advertiserId: segment.advertiserId } });
      setShowEditModal(false);
      loadData();
      notificationSystem.current.addNotification(NotificationOptions.success(<span>Segment <strong>{segment.name}</strong> saved.</span>, false));
    } catch (err) {
      setShowEditModal(false);
      setShowLoader(false);
      notificationSystem.current.addNotification(NotificationOptions.error("Error saving segment."));
    }
  }

  const removeSegment = async () => {
    try {
      await Api.Delete({ path: `/api/segments/${deleteId}`, qs: { advertiserId: deleteSegment.advertiserId } });
      setShowDeleteConfirm(false);
      loadData();
      const deleteSegmentName = _.get(deleteSegment, "segmentName", "");
      notificationSystem.current.addNotification(NotificationOptions.success(<span>Segment <strong>{deleteSegmentName}</strong> deleted.</span>, false));
    } catch (err) {
      setShowDeleteConfirm(false);
      setShowLoader(false);
      notificationSystem.current.addNotification(NotificationOptions.error("Error deleting segment."));
    }
  }

  const handleCopy = () => {
    setCopied(true);
    setTimeout(() => { setCopied(false) }, 2000);
  }

  const handleReportSubmit = async (data: { daterange: DateRange, selectedMetrics: Metric[] }) => {
    setDownloading(true);
    const scopedParam = Helper.scopedParam({ scope, scopeId });
    const startDate: string = data.daterange.startDate.format("YYYY-MM-DD");
    const endDate: string = data.daterange.endDate.format("YYYY-MM-DD");
    const options: Options = {
      startDate,
      endDate,
      statistics: rights.VIEW_STATISTICS
    };
    const statisticOptions = _.assign({}, scopedParam, options);
    const segments: Segment[] = await Api.Get({ path: "/api/segments/statistics", qs: statisticOptions });

    const headerRow = data.selectedMetrics.map((metric) => { return ExcelHelper.getBoldCell(metric.label || metric.col) });
    const rows = [headerRow];

    segments.forEach((row) => {
      const rowData = [];
      data.selectedMetrics.forEach((metric) => {
        const format = ExcelHelper.format(metric);
        const value = ExcelHelper.cellFormatter(row, metric);
        const cell = ExcelHelper.getCell(value, null, format);
        rowData.push(cell);
      });
      rows.push(rowData);
    });
    ExcelHelper.save(rows, "Segment statistics", "SegmentStats_" + startDate + "_" + endDate);
    setDownloading(false);
    setShowReportModal(false);
  }

  function getClassNames() {
    return copied ? "gray-box mb-2 highlight-box" : "gray-box mb-2";
  }

  function getSegmentTag() {
    return `<script type="text/javascript" async="true"> (function() { setTimeout(function(){ var adscienceScript = document.createElement("script"); adscienceScript.type = "text/javascript"; adscienceScript.async = true; adscienceScript.src = "//segments.optinadserving.com/segmentpixel.php?advertiser_id=${scopeId}"; var s = document.getElementsByTagName("script")[0]; s.parentNode.insertBefore(adscienceScript, s); },1); })(); </script><noscript><img src="//segments.optinadserving.com/cgi-bin/sgmnt.fcgi?advertiser_id=${scopeId}"/></noscript>`;
  }

  function getMetrics(): Metric[] {
    if (rights.VIEW_STATISTICS) {
      return [{
        col: 'type',
        label: 'type',
        align: 'left'
      }, {
        col: 'countUnique',
        label: 'total visitors',
        type: 'number',
        align: 'right'
      }, {
        col: 'countTargetedUnique',
        label: 'visitors post targeting',
        type: 'number',
        align: 'right'
      }, {
        col: 'postViewCountUnique',
        label: 'visited post view',
        type: 'number',
        align: 'right'
      }, {
        col: 'postClickCountUnique',
        label: 'visited post click',
        type: 'number',
        align: 'right'
      }, {
        col: 'lastEvent',
        label: 'Active',
        align: 'center'
      }];
    } else {
      return [{
        col: 'type',
        label: 'type',
        align: 'left'
      }, {
        col: 'lastEvent',
        label: 'Active',
        align: 'center'
      }];
    }
  }
  if (!error) {
    const segmentTag = getSegmentTag();
    const advertiserDomain = _.get(data, "advertiser.advertiserDomain", "");
    const deleteSegmentName = _.get(deleteSegment, "segmentName", "");
    const metrics = getMetrics();

    return <Fragment>
      <div className="row">
        <div className="col-sm-12 pt-3">
          <div className="card mb-2">
            <h3 className="pull-left">Segments</h3>
            <div className="table-btn-container">
              {rights.MANAGE_SEGMENTS &&
                <Button variant="primary" size="sm" className="mr-2" onClick={createSegmentClick}><FontIcon name="plus" /> CREATE SEGMENT</Button>}
              {rights.VIEW_STATISTICS &&
                <Button variant="primary" size="sm" className="mr-2" onClick={() => { setShowReportModal(true) }}><FontIcon name="download" /> REPORT</Button>
              }
            </div>
            <Loader visible={showLoader} />
            {!showLoader &&
              <SegmentsTable
                records={segments}
                advertisers={advertisers}
                showAdvertiserCol={scope !== "advertiser"}
                user={user}
                rights={rights}
                metrics={metrics}
                editClick={editClick}
                deleteClick={deleteClick}
                codeClick={codeClick}
              />
            }
          </div>
        </div>
      </div>
      {scope === "advertiser" &&
        <div className="row">
          <div className="col-sm-12 pt-3">
            <div className="card mb-2" style={{ paddingBottom: "40px" }}>
              <div>
                <strong>Segment pixels only work if the segment tag is present on your domain. Copy here:</strong>
              </div>
              <div className={getClassNames()}>{segmentTag}</div>
              <CopyToClipboard text={segmentTag} onCopy={handleCopy}>
                <button ref={copyBtn} className="btn btn-primary btn-sm pull-right"><FontIcon name="files-o" /> GET CODE</button>
              </CopyToClipboard>
              <Overlay target={findDOMNode(copyBtn.current) as any} show={copied} placement="bottom">
                <Tooltip id="copy-segment-tag-tooltip">Copied!</Tooltip>
              </Overlay>
            </div>
          </div>
        </div>
      }
      <SegmentCodeModal
        id={codeId}
        advertiserId={_.get(codeSegment, "advertiserId")}
        show={showCodeModal}
        handleClose={() => { setShowCodeModal(false); }}
      />
      <SegmentModal
        segment={editSegment}
        scope={scope}
        scopeId={scopeId}
        writeAccess={writeAccess}
        show={showEditModal}
        advertiserDomain={advertiserDomain}
        onClose={() => { setShowEditModal(false); }}
        onSubmit={handleSubmit}
      />
      <ReportModal
        id="segments-report"
        show={showReportModal}
        downloading={downloading}
        metrics={metrics}
        onClose={() => { setShowReportModal(false); setDownloading(false); }}
        onSubmit={handleReportSubmit}
      />
      <Confirm
        message={`Delete segment ${deleteSegmentName}?`}
        show={showDeleteConfirm}
        onClose={() => { setShowDeleteConfirm(false); }}
        onConfirm={removeSegment}
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
export default SegmentsPageBody;