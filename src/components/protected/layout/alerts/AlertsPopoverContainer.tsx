import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { AlertsPopover } from "./Alerts";
import { Alert } from "../../../../models/data/Alert";
import * as Api from "../../../../client/Api";

const AlertsPopoverContainer = () => {
  let { page, scope, scopeId }: any = useParams();
  const [alerts, setAlerts] = useState<Alert[]>([]);

  useEffect(() => { loadData(); }, [page, scope, scopeId]);

  async function loadData() {
    try {
      const res: Alert[] = await Api.Get({ path: "/api/alerts/campaigns" });
      setAlerts(res);
    } catch (err) {
      console.log(err);
    }
  }

  return <AlertsPopover alerts={alerts} />
}

export default AlertsPopoverContainer;