import React, { useState, useEffect } from "react";
import { Alert } from "../../../../models/data/Alert";
import * as Api from "../../../../client/Api";
import { AlertsList } from "../../layout/alerts/Alerts";
import ErrorContainer from "../../../UI/ErrorContainer";
import Loader from "../../../UI/Loader";

const AlertsListContainer = () => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [showLoader, setShowLoader] = useState<boolean>(true);
  const [error, setError] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>("");

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    try {
      const res: Alert[] = await Api.Get({ path: "/api/alerts/campaigns" });
      setAlerts(res);
    } catch (err) {
      setError(true);
      setErrorMessage("Error loading alerts.")
    }
    setShowLoader(false);
  }

  if (!error) {
    return <div className="card mb-2">
      <h3>Alerts</h3>
      <Loader visible={showLoader} />
      {!showLoader && <div className="border rounded-sm">
        <AlertsList alerts={alerts} />
      </div>}
    </div>;
  } else {
    return <div className="card mb-2">
      <h3><ErrorContainer message={errorMessage} /></h3>
    </div>;
  }
}

export default AlertsListContainer;