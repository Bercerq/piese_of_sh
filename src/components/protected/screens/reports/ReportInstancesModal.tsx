import * as React from "react";
import { Modal, Button } from "react-bootstrap";
import moment from "moment";
import * as Api from "../../../../client/Api";;
import ErrorContainer from "../../../UI/ErrorContainer";
import Loader from "../../../UI/Loader";
import { Report, ReportInstance } from "../../../../models/data/Report";

interface ReportInstancesModalProps {
  show: boolean;
  report: Report;
  handleClose: () => void;
}

const ReportInstancesModal = (props: ReportInstancesModalProps) => {
  const [instances, setInstances] = React.useState<ReportInstance[]>([]);
  const [showLoader, setShowLoader] = React.useState<boolean>(true);
  const [error, setError] = React.useState<boolean>(false);
  const [errorMessage, setErrorMessage] = React.useState<string>("");

  const handleEntering = async () => {
    setShowLoader(true);
    try {
      const instances = await Api.Get({ path: `/api/reports/${props.report.id}/instances` });
      setInstances(instances);
      setError(false);
      setErrorMessage("");
    } catch (err) {
      setError(true);
      setErrorMessage("Error loading report versions.");
    }
    setShowLoader(false);
  };

  if (props.report) {
    return <Modal size="lg" show={props.show} onHide={props.handleClose} onEntering={handleEntering} backdrop="static">
      <Modal.Header closeButton>
        <Modal.Title>Report versions: {props.report.name}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Loader visible={showLoader} />
        {instances.length === 0 && !showLoader && <div>
          There are no versions of this report to download.
          </div>}
        {instances.length > 0 && !showLoader && <div className="row">
          <div className="col-sm-12">
            <div style={{ overflowX: "auto" }}>
              <table className="table table-striped">
                <thead>
                  <th>Created</th>
                  <th>Status</th>
                </thead>
                <tbody>
                  {
                    instances.map((row, i) => <tr key={`item-${i}`}>
                      <td><a href={`/api/reports/${props.report.id}/instances/${row.id}/download`}>{moment(row.created).format('YYYY-MM-DD HH:mm:ss')}</a></td>
                      <td>{row.status}</td>
                    </tr>)
                  }
                </tbody>
              </table>
            </div>
          </div>
        </div>}
        {error && <ErrorContainer message={errorMessage} />}
      </Modal.Body>
      <Modal.Footer>
        <Button onClick={props.handleClose}>CANCEL</Button>
      </Modal.Footer>
    </Modal>;
  }
  return null;
};
export default ReportInstancesModal;