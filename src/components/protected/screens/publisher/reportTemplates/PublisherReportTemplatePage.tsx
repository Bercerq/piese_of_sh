import React, { useRef, useState } from "react";
import { useParams, useHistory } from "react-router-dom";
import NotificationSystem from "react-notification-system";
import * as NotificationOptions from "../../../../../client/NotificationOptions";
import * as Api from "../../../../../client/Api";
import { Rights, TabProps } from "../../../../../models/Common";
import { ReportTemplate } from "../../../../../models/data/Report";
import PublisherReportTemplateForm from "./PublisherReportTemplateForm";
import { ScopeType } from "../../../../../client/schemas";

export interface ReportTemplatePageProps {
  rights: Rights;
  scope: ScopeType;
  scopeId: number;
  maxLevel: ScopeType;
}

const PublisherReportTemplatePage = (props: ReportTemplatePageProps) => {
  let params: { templateId } = useParams();
  let history = useHistory();
  const templateId = parseInt(params.templateId, 10);

  const [saving, setSaving] = useState<boolean>(false);

  const notificationSystem = useRef<NotificationSystem.System>(null);

  const cancelClick = () => {
    history.push(`/publisherreporttemplates/${props.scope}/${props.scopeId}`);
  }

  const handleTemplateSubmit = async (id: number, template: Partial<ReportTemplate>) => {
    setSaving(true);
    try {
      if (id > 0) {
        await Api.Put({ path: `/api/reportTemplates/${id}`, body: template });
        notificationSystem.current.addNotification(NotificationOptions.success(<span>Template <strong>{template.name}</strong> saved.</span>, false));
      } else {
        const res = await Api.Post({ path: `/api/reportTemplates`, body: template });
        notificationSystem.current.addNotification(NotificationOptions.success(<span>Template <strong>{template.name}</strong> saved.</span>, false, () => { history.push(`/publisherreports/${props.scope}/${props.scopeId}`); }));
      }
    } catch (err) {
      notificationSystem.current.addNotification(NotificationOptions.error("Error saving template."));
    }
    setSaving(false);
  }

  return <div className="row">
    <div className="col-sm-12 pt-3">
      <div className="card mb-2">
        <PublisherReportTemplateForm
          id={templateId}
          rights={props.rights}
          scope={props.scope}
          scopeId={props.scopeId}
          maxLevel={props.maxLevel}
          saving={saving}
          onClose={cancelClick}
          onSubmit={handleTemplateSubmit}
        />
        <NotificationSystem ref={notificationSystem} />
      </div>
    </div>
  </div>
}
export default PublisherReportTemplatePage;