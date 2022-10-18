import React, { FunctionComponent } from "react";
import { Modal, Button } from "react-bootstrap";

interface ConfirmProps {
  message: string;
  show: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const Confirm: FunctionComponent<ConfirmProps> = (props) => {
  return <Modal dialogClassName="confirm-alert-modal" show={props.show} onHide={props.onClose} backdrop="static">
    <Modal.Header closeButton>
      <Modal.Title>{props.message}</Modal.Title>
    </Modal.Header>
    {props.children &&
      <Modal.Body>{props.children}</Modal.Body>
    }
    <Modal.Footer>
      <Button size="sm" variant="danger" onClick={props.onClose}>No</Button>
      <Button size="sm" variant="success" onClick={props.onConfirm}>Yes</Button>
    </Modal.Footer>
  </Modal>;
}
export default Confirm;