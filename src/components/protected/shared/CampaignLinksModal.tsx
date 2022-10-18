import React from "react";
import { Link } from "react-router-dom";
import { Modal, Button } from "react-bootstrap";
import * as Helper from "../../../client/Helper";
import { LookUp } from "../../../models/Common";

interface CampaignLinksModalProps {
  show: boolean;
  campaigns: LookUp[];
  title: string;
  tab: string;
  onClose: () => void;
}

const CampaignLinksModal = (props: CampaignLinksModalProps) => {
  return <Modal size="lg" show={props.show} onHide={props.onClose} backdrop="static">
    <Modal.Header closeButton>
      <Modal.Title>{props.title}</Modal.Title>
    </Modal.Header>
    <Modal.Body>
      <div className="row">
        <div className="col-sm-12">
          <div className="overflow-auto">
            <table className="table table-striped table-borderless">
              <tbody>
                {
                  props.campaigns.map((row, i) => <tr key={`item-${i}`}>
                    <td><Link to={Helper.campaignSettingsLink(`/settings/campaign/${row.id}/${props.tab}`)}>{row.name}</Link></td>
                  </tr>)
                }
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Modal.Body>
    <Modal.Footer>
      <Button onClick={props.onClose}>CANCEL</Button>
    </Modal.Footer>
  </Modal>;
}
export default CampaignLinksModal;