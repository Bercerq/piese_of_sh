
import React, { useState, Fragment } from "react";
import { Link } from 'react-router-dom';
import { Alert, FormControl, Button } from "react-bootstrap";
import * as Api from "../../client/Api";
import PublicFormWrapper from "./PublicFormWrapper";
import DocumentTitle from "../UI/DocumentTitle";

const LoginForm = () => {
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [verificationCode, setVerificationCode] = useState<string>("");
  const [showAlert, setShowAlert] = useState<boolean>(false);

  const usernameChange = (e) => { setUsername(e.target.value); }

  const passwordChange = (e) => { setPassword(e.target.value); }

  const verificationCodeChange = (e) => { setVerificationCode(e.target.value); }

  const alertClose = () => { setShowAlert(false); }

  const submitClick = async () => {
    try {
      const role = localStorage.getItem(username + "-role");
      await Api.Post({ path: "/login", body: { username, password, verificationCode, role } });
      window.location.href = window.location.origin + '/';
    } catch (err) {
      console.error(err);
      setShowAlert(true);
    }
  }

  const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      submitClick();
    }
  }

  return <Fragment>
    <PublicFormWrapper>
      <FormControl type="text" name="username" placeholder="Email" onChange={usernameChange} />
      <FormControl  type="password" name="password" placeholder="Password" onChange={passwordChange} onKeyDown={handleKeyDown}/>
      <i>Enter verification code if two factor authentication has been enabled.</i>
      <FormControl autoFocus={true} type="text" name="verificationCode" placeholder="Verification Code" onChange={verificationCodeChange} onKeyDown={handleKeyDown}/>
      <Button type="submit" variant="primary"  block onClick={submitClick}>LOGIN</Button>
      <Link to="/forgotPassword">Forgot password ?</Link>
    </PublicFormWrapper>
    {showAlert &&
      <Alert variant="danger" className="alert-position" onClose={alertClose} dismissible>
        <div>
          Incorrect username, password or verification code.
          </div>
      </Alert>
    }
    <DocumentTitle title="Login" />
  </Fragment>;
}

export default LoginForm;