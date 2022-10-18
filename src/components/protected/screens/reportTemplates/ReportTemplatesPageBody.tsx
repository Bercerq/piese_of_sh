import React, { useState, useEffect, useRef, useContext, Fragment } from "react";
import { Route, Switch, useParams, useHistory, useRouteMatch } from "react-router-dom";
import { Button } from "react-bootstrap";
import * as _ from "lodash";
import NotificationSystem from "react-notification-system";
import * as NotificationOptions from "../../../../client/NotificationOptions";
import * as Api from "../../../../client/Api";
import * as Helper from "../../../../client/Helper";
import * as Roles from "../../../../modules/Roles";
import Loader from "../../../UI/Loader";
import { ReportTemplate } from "../../../../models/data/Report";
import ErrorContainer from "../../../UI/ErrorContainer";
import Confirm from "../../../UI/Confirm";
import FontIcon from "../../../UI/FontIcon";
import { BreadcrumbContextType, Rights, ScopeDataContextType, TabProps } from "../../../../models/Common";
import ReportTemplatesTable from "./ReportTemplatesTable";
import { ScopeType } from "../../../../client/schemas";
import ScopeDataContext from "../../context/ScopeDataContext";
import { AppUser } from "../../../../models/AppUser";
import UserContext from "../../context/UserContext";
import ReportTemplatePage, { ReportTemplatePageProps } from "./ReportTemplatePage";
import BreadcrumbContext from "../../context/BreadcrumbContext";

const ReportTemplatesPageBody = () => {
  let history = useHistory();
  let match = useRouteMatch();
  let params: { scope?, scopeId?} = useParams();
  let scope = params.scope as ScopeType;
  let scopeId = params.scopeId;

  let { data } = useContext<ScopeDataContextType>(ScopeDataContext);
  const rights: Rights = Roles.getRights(data.rights);
  const user: AppUser = useContext<AppUser>(UserContext);
  let { items } = useContext<BreadcrumbContextType>(BreadcrumbContext);

  const [showTemplatesLoader, setShowTemplatesLoader] = useState<boolean>(true);
  const [reportTemplates, setReportTemplates] = useState<ReportTemplate[]>([]);
  const [templateFiltersCounter, setTemplateFiltersCounter] = useState<number>(0);
  const [deleteTemplateId, setDeleteTemplateId] = useState<number>(-1);
  const [deleteTemplate, setDeleteTemplate] = useState<ReportTemplate>(null);
  const [showDeleteTemplateConfirm, setShowDeleteTemplateConfirm] = useState<boolean>(false);
  const [error, setError] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>("");

  const notificationSystem = useRef<NotificationSystem.System>(null);
  const controller = useRef<AbortController>(null);

  useEffect(() => { loadReportTemplates(); }, [scope, scopeId]);

  async function loadReportTemplates() {
    setShowTemplatesLoader(true);
    try {
      unload();
      controller.current = new AbortController();
      const qs = Helper.scopedParam({ scope, scopeId });
      const reportTemplates = await Api.Get({ path: `/api/reportTemplates`, qs, signal: controller.current.signal });
      setReportTemplates(reportTemplates);
    } catch (err) {
      if (err.name === "AbortError") {
        setError(false);
        setErrorMessage("");
      } else {
        setError(true);
        setErrorMessage("Error loading report templates.");
      }
    }
    setShowTemplatesLoader(false);
  }

  function unload() {
    if (controller.current) {
      controller.current.abort();
    }
  }

  const deleteTemplateClick = (deleteId: number) => {
    const deleteTemplate = reportTemplates.find((o) => { return o.id === deleteId });
    setDeleteTemplateId(deleteId);
    setDeleteTemplate(deleteTemplate);
    setShowDeleteTemplateConfirm(true);
  }

  const handleTemplateDelete = async () => {
    try {
      await Api.Delete({ path: `/api/reportTemplates/${deleteTemplateId}` });
      notificationSystem.current.addNotification(NotificationOptions.success(<span>Template {deleteTemplate.name} deleted.</span>, false));
      setShowDeleteTemplateConfirm(false);
      loadReportTemplates();
    } catch (err) {
      setShowDeleteTemplateConfirm(false);
      notificationSystem.current.addNotification(NotificationOptions.error("Error deleting template."));
    }
  }

  if (!error) {
    const deleteTemplateName = _.get(deleteTemplate, "name", "");
    const maxLevel = Helper.getMaxLevel(user, items);
    const templateProps: ReportTemplatePageProps = { rights, scope, scopeId, maxLevel };
    return <Switch>
      <Route path={`${match.path}/:templateId`}>
        <ReportTemplatePage {...templateProps} />
      </Route>
      <Route path={match.path}>
        <div className="row">
          <div className="col-sm-12 pt-3">
            <div className="card mb-2">
              <h3 className="pull-left">Report templates</h3>
              <div className="pull-right">
                {rights.MANAGE_REPORT_TEMPLATES &&
                  <Button variant="primary" size="sm" className="mr-2" onClick={() => { history.push(`/report-templates/${scope}/${scopeId}/-1`) }}><FontIcon name="plus" /> ADD TEMPLATE</Button>}
                <Button variant="primary" size="sm" onClick={() => { setTemplateFiltersCounter(templateFiltersCounter + 1) }}><FontIcon name="remove" /> CLEAR FILTERS</Button>
              </div>
              <Loader visible={showTemplatesLoader} />
              {!showTemplatesLoader &&
                <ReportTemplatesTable
                  records={reportTemplates}
                  filtersCounter={templateFiltersCounter}
                  user={user}
                  scope={scope}
                  scopeId={scopeId}
                  deleteClick={deleteTemplateClick}
                />
              }
            </div>
          </div>
          <Confirm
            message={`Delete template ${deleteTemplateName}`}
            show={showDeleteTemplateConfirm}
            onClose={() => setShowDeleteTemplateConfirm(false)}
            onConfirm={handleTemplateDelete}
          />
          <NotificationSystem ref={notificationSystem} />
        </div>
      </Route>
    </Switch>
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
export default ReportTemplatesPageBody;