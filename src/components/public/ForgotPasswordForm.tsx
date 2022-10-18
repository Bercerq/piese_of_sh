import React, { useState, Fragment } from "react";
import { Link, useLocation } from "react-router-dom";
import { Alert, FormControl, Button } from "react-bootstrap";
import * as Api from "../../client/Api";
import PublicFormWrapper from "./PublicFormWrapper";
import DocumentTitle from "../UI/DocumentTitle";

const ForgotPasswordForm = () => {
  let query = new URLSearchParams(useLocation().search);
  const initialShowAlert: boolean = query.get("warning") === "true";

  const [email, setEmail] = useState<string>("");
  const [alertType, setAlertType] = useState<"warning" | "success" | "danger" | "primary" | "secondary" | "info" | "dark" | "light">(initialShowAlert ? "warning" : "primary");
  const [showAlert, setShowAlert] = useState<boolean>(initialShowAlert);
  const [alertMessage, setAlertMessage] = useState<string>(initialShowAlert ? "The previous email link has expired. Fill in the form below to receive a new email." : "");

  const emailChange = (e) => { setEmail(e.target.value); }

  const alertClose = () => { setShowAlert(false); }

  const submitClick = async () => {
    try {
      const res = await Api.Post({ path: "/api/login/resetpassword", body: { email } });
      setAlertType("success");
      setShowAlert(true);
      setAlertMessage(res.msg);
    } catch (err) {
      console.log(err);
      setAlertType("danger");
      setShowAlert(true);
      setAlertMessage("Make sure the email is valid.");
    }
  }

  return <Fragment>
    <PublicFormWrapper>
      <FormControl type="email" name="email" placeholder="Email" onChange={emailChange} />
      <Button type="submit" variant="primary" block onClick={submitClick}>SUBMIT</Button>
      <Link to="/login">Login</Link>
    </PublicFormWrapper>
    {showAlert &&
      <Alert variant={alertType} className="alert-position" onClose={alertClose} dismissible>
        <div>{alertMessage}</div>
      </Alert>
    }
    <DocumentTitle title="Forgot password" />
  </Fragment>;
}

export default ForgotPasswordForm;