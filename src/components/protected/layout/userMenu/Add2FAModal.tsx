import React, { useState } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import FontIcon from "../../../UI/FontIcon";
import { ValidationError } from "../../../../client/schemas";
import * as Validation from "../../../../client/Validation";
import * as twofactor from "node-2fa";
import { userInfo } from "os";

interface Add2FAModalProps {
  show: boolean;
  email: string;
  twoFactorEnabled: boolean;
  onClose: () => void;
  onSubmit: (body: { email: string; secret: string }) => void;
}

const Add2FAModal = (props: Add2FAModalProps) => {
  const newSecret = twofactor.generateSecret({ name: "Opt Out Advertising Dashboard", account: props.email });
  const [qrUri] = useState<string>(newSecret['qr']);
  const [secret] = useState<string>(newSecret['secret']);
  const [verificationCode, setVerificationCode] = useState<string>("");
  const [tokenValidation, setTokenValidation] = useState<ValidationError>({ error: true, message: "" });

  const verificationCodeChange = (e) => {
    setVerificationCode(e.target.value);
    let delta = -100;
    if (e.target.value.length == 6) {
      const verificationResult = twofactor.verifyToken(secret, e.target.value);
      try {
        delta = verificationResult.delta;
      } catch {}
    }
    setTokenValidation(Validation.token(e.target.value, 6, delta));
  }

  const handleSubmit = (e) => {
    const verificationResult = twofactor.verifyToken(secret, verificationCode);
    if (verificationResult != null) {
      if (verificationResult.delta <= 0 && verificationResult.delta > -2) {
        props.onSubmit({email: props.email, secret:secret});
      }
    }
  }
  if (!props.twoFactorEnabled) {
  return <Modal show={props.show} onHide={props.onClose} backdrop="static">
    <Modal.Header closeButton>
      <Modal.Title as="h4">Add Two Factor Authentication</Modal.Title>
    </Modal.Header>
    <Modal.Body>
      <Form.Group controlId="request-2fa">
        <b>Two Factor Authentication</b>
        <p>
          Two Factor Authentication is an enhanced security measure. 
          Once enabled, you'll be required to use an authenticator app when you login
          in addition to your regular username and password
        </p>
        <b>Don't have the app?</b>
        <p>
          You can download Authy here for <a href="https://play.google.com/store/apps/details?id=com.authy.authy">Android</a> or <a href="https://apps.apple.com/nl/app/twilio-authy/id494168017">iOS</a>.
          Or google authenticator here for <a href="https://play.google.com/store/apps/details?id=com.google.android.apps.authenticator2">Android</a> or <a href="https://apps.apple.com/nl/app/google-authenticator/id388497605">iOS</a>.
        </p>
        <Form.Label>Scan code with app</Form.Label>
        <div>
          <img src={qrUri}></img>
        </div>
        <Form.Label>Or paste this code directly in app</Form.Label>
        <div>
          <code>{secret}</code>
        </div>
        <Form.Label>Type code from authenticator app</Form.Label>
        <Form.Control
          type="text"
          value={verificationCode}
          onChange={verificationCodeChange}
          isInvalid={tokenValidation.error}
        />
        {tokenValidation.error && <Form.Control.Feedback type="invalid">{tokenValidation.message}</Form.Control.Feedback>}

      </Form.Group>
    </Modal.Body>
    <Modal.Footer>
      <Button size="sm" variant="light" onClick={props.onClose}>CANCEL</Button>
      <Button type="submit" size="sm" variant="primary" onClick={handleSubmit} disabled={tokenValidation.error}>ENABLE TWO FACTOR AUTHENTICATION</Button>
    </Modal.Footer>
    
  </Modal>;
  }
  else { //show "empty" modal
    return <Modal show={props.show} onHide={props.onClose} backdrop="static">
    <Modal.Header closeButton>
      <Modal.Title as="h4">Add Two Factor Authentication</Modal.Title>
    </Modal.Header>
    <Modal.Body>You have already enabled Two Factor Authentication for this account.
    If you're experiencing any problems please contact <a href="mailto:support@optoutadvertising.com">support@optoutadvertising.com</a>
    </Modal.Body>
    <Modal.Footer>
      <Button size="sm" variant="light" onClick={props.onClose}>OK</Button>
    </Modal.Footer>
    </Modal>;

  }
}

export default Add2FAModal;