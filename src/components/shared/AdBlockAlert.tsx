import React, { useState, useEffect } from "react";
import adBlocker from "just-detect-adblock";
import { Alert } from "react-bootstrap";
import FontIcon from "../UI/FontIcon";

const AdBlockAlert = () => {
  const [showAlert, setShowAlert] = useState<boolean>(false);

  useEffect(detectAdblock, []);

  function detectAdblock() {
    if (adBlocker.isDetected()) {
      setShowAlert(true);
    }
  }

  return showAlert &&
    <Alert variant="danger" className="alert-position" onClose={() => setShowAlert(false)} dismissible>
      <div style={{ fontSize: "1.1em" }}><strong><FontIcon name="warning" /> Warning! Ad blocking software detected. </strong></div>
      <div>Please disable it,to properly use the Opt Out Advertising dashboard.</div>
    </Alert>;
}
export default AdBlockAlert;