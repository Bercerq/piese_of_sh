import React, { useState } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import FontIcon from "../../../UI/FontIcon";
import { ValidationError } from "../../../../client/schemas";
import * as Validation from "../../../../client/Validation";

interface ChangePasswordModalProps {
  show: boolean;
  onClose: () => void;
  onSubmit: (body: { oldpass: string; newpass: string; }) => void;
}

const ChangePasswordModal = (props: ChangePasswordModalProps) => {
  const [oldpass, setOldpass] = useState<string>("");
  const [newpass, setNewpass] = useState<string>("");
  const [confirmpass, setConfirmpass] = useState<string>("");
  const [oldpassValidation, setOldpassValidation] = useState<ValidationError>({ error: false, message: "" });
  const [newpassValidation, setNewpassValidation] = useState<ValidationError>({ error: false, message: "" });
  const [confirmpassValidation, setConfirmpassValidation] = useState<ValidationError>({ error: false, message: "" });

  const oldpassChange = (e) => {
    setOldpass(e.target.value);
    setOldpassValidation(Validation.length(e.target.value, 8, true));
  }

  const newpassChange = (e) => {
    setNewpass(e.target.value);
    setNewpassValidation(Validation.length(e.target.value, 8, true));
  }

  const confirmpassChange = (e) => {
    setConfirmpass(e.target.value);
    setConfirmpassValidation(Validation.matchPassword(newpass, e.target.value));
  }

  const handleSubmit = () => {
    const oldpassValidation = Validation.length(oldpass, 8, true);
    const newpassValidation = Validation.length(newpass, 8, true);
    const confirmpassValidation = Validation.matchPassword(newpass, confirmpass);

    const validationErrors = [oldpassValidation.error, newpassValidation.error, confirmpassValidation.error];
    if (validationErrors.indexOf(true) > -1) {
      setOldpassValidation(oldpassValidation);
      setNewpassValidation(newpassValidation);
      setConfirmpassValidation(confirmpassValidation);
    } else {
      props.onSubmit({ oldpass, newpass });
    }
  }

  return <Modal show={props.show} onHide={props.onClose} backdrop="static">
    <Modal.Header closeButton>
      <Modal.Title as="h4">Change password</Modal.Title>
    </Modal.Header>

    <Modal.Body>
      <Form.Group controlId="current-password">
        <Form.Label>Current password</Form.Label>
        <Form.Control
          type="password"
          value={oldpass}
          onChange={oldpassChange}
          isInvalid={oldpassValidation.error}
        />
        {oldpassValidation.error && <Form.Control.Feedback type="invalid">{oldpassValidation.message}</Form.Control.Feedback>}
      </Form.Group>
      <Form.Group controlId="new-password">
        <Form.Label>New password</Form.Label>
        <Form.Control
          type="password"
          value={newpass}
          onChange={newpassChange}
          isInvalid={newpassValidation.error}
        />
        {newpassValidation.error && <Form.Control.Feedback type="invalid">{newpassValidation.message}</Form.Control.Feedback>}
      </Form.Group>
      <Form.Group controlId="confirm-password">
        <Form.Label>Confirm password</Form.Label>
        <Form.Control
          type="password"
          value={confirmpass}
          onChange={confirmpassChange}
          isInvalid={confirmpassValidation.error}
        />
        {confirmpassValidation.error && <Form.Control.Feedback type="invalid">{confirmpassValidation.message}</Form.Control.Feedback>}
      </Form.Group>
    </Modal.Body>

    <Modal.Footer>
      <Button size="sm" variant="light" onClick={props.onClose}>CANCEL</Button>
      <Button size="sm" variant="primary" onClick={handleSubmit}><FontIcon name="lock" /> CHANGE PASSWORD</Button>
    </Modal.Footer>
  </Modal>;
}

export default ChangePasswordModal;