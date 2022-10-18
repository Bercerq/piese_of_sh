import React, { useState } from "react";
import { Modal, Button } from "react-bootstrap";
import * as Api from "../../../../../client/Api";
import Loader from "../../../../UI/Loader";
import CampaignPacing from "../../../shared/pacing/CampaignPacing";

interface CampaignsPacingModalProps {
  id: number;
  type: "budget_completion" | "impression_completion";
  show: boolean;
  onClose: () => void;
}

const CampaignsPacingModal = (props: CampaignsPacingModalProps) => {
  const [data, setData] = useState<any>({});
  const [predictionDays, setPredictionDays] = useState<number>(1);
  const [showLoader, setShowLoader] = useState<boolean>(true);

  const handleEntering = async () => {
    setShowLoader(true);
    try {
      const path = props.type === "budget_completion" ? "budget" : "impressions";
      const pacing = await Api.Get({ path: `/api/campaigns/${props.id}/pacing/${path}` });
      setData(pacing);
    } catch (err) {
      console.log(err);
    }
    setShowLoader(false);
  }

  const predictionDaysChange = (days: number) => {
    setPredictionDays(days);
  }

  function getTitle() {
    if (props.type === "budget_completion") {
      return `Budget pacing - id: ${props.id}`;
    } else {
      return `Impressions pacing - id: ${props.id}`;
    }
  }
  const title = getTitle();
  const chartType = props.type === "budget_completion" ? "budget" : "impressions";
  const chartId = props.type === "budget_completion" ? "budget-pacing" : "impressions-pacing";
  return <Modal dialogClassName="modal-xxl" show={props.show} onHide={props.onClose} onEntering={handleEntering} backdrop="static">
    <Modal.Header closeButton>
      <Modal.Title>{title}</Modal.Title>
    </Modal.Header>
    <Modal.Body>
      <div className="row">
        <div className="col-sm-12">
          <Loader visible={showLoader} />
          {!showLoader &&
            <CampaignPacing
              id={chartId}
              type={chartType}
              data={data}
              predictionDays={predictionDays}
              onPredictionChange={predictionDaysChange}
            />
          }
        </div>
      </div>
    </Modal.Body>
    <Modal.Footer>
      <Button size="sm" variant="light" onClick={props.onClose}>CLOSE</Button>
    </Modal.Footer>
  </Modal>
}
export default CampaignsPacingModal;