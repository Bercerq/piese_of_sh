import React, { useState, Fragment } from "react";
import { Link, useLocation, useHistory } from "react-router-dom";
import { FormGroup, FormControl, Button } from "react-bootstrap";
import * as Api from "../../client/Api";
import * as Validation from "../../client/Validation";
import { ValidationError } from "../../client/schemas";
import PublicFormWrapper from "./PublicFormWrapper";
import DocumentTitle from "../UI/DocumentTitle";

const SetPasswordForm = () => {
  let query = new URLSearchParams(useLocation().search);
  let history = useHistory();
  const email: string = query.get("email");
  const hash: string = query.get("hash");

  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [passwordValidation, setPasswordValidation] = useState<ValidationError>({ error: false, message: "" });
  const [confirmPasswordValidation, setConfirmPasswordValidation] = useState<ValidationError>({ error: false, message: "" });

  const passwordChange = (e) => {
    setPassword(e.target.value);
    setPasswordValidation(Validation.length(e.target.value, 8, true));
  }

  const confirmPasswordChange = (e) => {
    setConfirmPassword(e.target.value);
    setConfirmPasswordValidation(Validation.matchPassword(password, e.target.value));
  }

  const submitClick = async () => {
    const passwordValidation = Validation.length(password, 8, true);
    const confirmPasswordValidation = Validation.matchPassword(password, confirmPassword);

    if (passwordValidation.error || confirmPasswordValidation.error) {
      setPasswordValidation(passwordValidation);
      setConfirmPasswordValidation(confirmPasswordValidation);
    } else {
      try {
        const body = { email, hash, password };
        await Api.Post({ path: "/api/login/setpassword", body });
        history.push("/login");
      } catch (err) {
        console.log(err);
        history.push("/forgotPassword?warning=true");
      }
    }
  }

  return <Fragment>
    <PublicFormWrapper>
      <p>Welcome <strong>{email}</strong>,</p>
      <p>To start using our system please enter a password:</p>
      <FormGroup>
        <FormControl type="password" name="password" placeholder="New Password" onChange={passwordChange} isInvalid={passwordValidation.error} />
        {passwordValidation.error && <FormControl.Feedback type="invalid">{passwordValidation.message}</FormControl.Feedback>}
      </FormGroup>
      <FormGroup>
        <FormControl type="password" name="confirmPassword" placeholder="Confirm Password" onChange={confirmPasswordChange} isInvalid={confirmPasswordValidation.error} />
        {confirmPasswordValidation.error && <FormControl.Feedback type="invalid">{confirmPasswordValidation.message}</FormControl.Feedback>}
      </FormGroup>
      <Button type="submit" variant="primary" block onClick={submitClick}>SUBMIT</Button>
      <Link to="/login">Login</Link>
    </PublicFormWrapper>
    <DocumentTitle title="Reset password" />
  </Fragment>;
}

export default SetPasswordForm;