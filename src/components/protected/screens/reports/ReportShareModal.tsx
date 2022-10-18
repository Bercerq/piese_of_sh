import * as React from "react";
import { findDOMNode } from "react-dom";
import { Modal, Button, FormGroup, FormLabel, Overlay, Tooltip } from "react-bootstrap";
import { CopyToClipboard } from "react-copy-to-clipboard/lib";
import * as _ from "lodash";
import * as Api from "../../../../client/Api";
import { Report } from "../../../../models/data/Report";
import ErrorContainer from "../../../UI/ErrorContainer";
import Loader from "../../../UI/Loader";

interface ReportShareModalProps {
  show: boolean;
  report: Report;
  shareBaseUrl: string;
  handleClose: () => void;
}

const ReportShareModal = (props: ReportShareModalProps) => {
  const [showLoader, setShowLoader] = React.useState<boolean>(true);
  const [token, setToken] = React.useState<string>(null);
  const [copied, setCopied] = React.useState<boolean>(false);
  const [error, setError] = React.useState<boolean>(false);
  const [errorMessage, setErrorMessage] = React.useState<string>("");

  const copyBtn = React.useRef<HTMLButtonElement>(null);

  const handleEntering = () => {
    loadToken();
  }

  const handleCopy = () => {
    setCopied(true);
    setTimeout(() => { setCopied(false) }, 2000);
  }

  const handleDelete = async () => {
    setShowLoader(true);
    try {
      await Api.Delete({ path: `/api/reports/${props.report.id}/token` });
      setError(false);
      setErrorMessage("");
    } catch (err) {
      setError(true);
      setErrorMessage("Error deleting report token.");
    }
    loadToken();
  }

  const handleCreate = async () => {
    setShowLoader(true);
    try {
      await Api.Post({ path: `/api/reports/${props.report.id}/token` });
      setError(false);
      setErrorMessage("");
    } catch (err) {
      setError(true);
      setErrorMessage("Error creating report token.");
    }
    loadToken();
  }

  async function loadToken() {
    setShowLoader(true);
    try {
      const { token } = await Api.Get({ path: `/api/reports/${props.report.id}/token` });
      setToken(token);
      setError(false);
      setErrorMessage("");
    } catch (err) {
      setError(true);
      setErrorMessage("Error loading report token.");
    }
    setShowLoader(false);
  }

  function getShareLink(): string {
    if (!_.isNull(token)) {
      return `${props.shareBaseUrl}/reports/${props.report.id}/token/${token}`;
    }
    return "";
  }

  function getClassNames() {
    return copied ? "gray-box mb-10 highlight-box" : "gray-box mb-10";
  }

  if (props.report) {
    const shareLink = getShareLink();
    return <Modal size="lg" show={props.show} onHide={props.handleClose} onEntering={handleEntering} backdrop="static">
      <Modal.Header closeButton>
        <Modal.Title>Share report: {props.report.name}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Loader visible={showLoader} />
        {!showLoader && shareLink !== "" &&
          <FormGroup>
            <FormLabel>Share report link</FormLabel>
            <div className={getClassNames()}>{shareLink}</div>
            {props.report.writeAccess &&
              <Button onClick={handleDelete} variant="primary" size="sm" className="pull-right">DELETE LINK</Button>
            }
            <CopyToClipboard text={shareLink} onCopy={handleCopy}>
              <button ref={copyBtn} className="btn btn-primary btn-xs pull-right mr-5"><i className="fa fa-files-o" aria-hidden="true"></i> GET LINK</button>
            </CopyToClipboard>
            <Overlay target={findDOMNode(copyBtn.current)} show={copied} placement="bottom">
              <Tooltip id="copy-share-tooltip">Copied!</Tooltip>
            </Overlay>
          </FormGroup>
        }
        {!showLoader && shareLink === "" && <React.Fragment>
          <p>No share link has been created for this report yet.</p>
          {props.report.writeAccess && <Button onClick={handleCreate} variant="primary" size="sm">CREATE LINK</Button>}
        </React.Fragment>
        }
        {error && <ErrorContainer message={errorMessage} />}
      </Modal.Body>
      <Modal.Footer>
        <Button onClick={props.handleClose}>CANCEL</Button>
      </Modal.Footer>
    </Modal>;
  }
  return null;
};
export default ReportShareModal;