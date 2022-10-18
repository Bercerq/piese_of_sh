import React, { useState } from "react";
import { Modal, Button } from "react-bootstrap";
import * as Api from "../../../../../../client/Api";
import { CampaignDeal } from "../../../../../../models/data/Campaign";
import { Deal } from "../../../../../../models/data/Deal";
import DealsSelectTable from "./DealsSelectTable";

interface AddDealsModalProps {
  show: boolean;
  campaignId: number;
  campaignDealIds: number[];
  onClose: () => void;
  onSubmit: (campaignDeals: CampaignDeal[]) => void;
}

const AddDealsModal = (props: AddDealsModalProps) => {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [selected, setSelected] = useState<number[]>([]);

  const handleEntering = async () => {
    const deals: Deal[] = await Api.Get({ path: "/api/deals", qs: { campaignId: props.campaignId } });
    const filteredDeals = deals.filter((d) => { return props.campaignDealIds.indexOf(d.id) < 0 });

    setDeals(filteredDeals);
  }

  const handleSubmit = () => {
    const selectedDeals = deals.filter((d) => { return selected.indexOf(d.id) > -1 });
    const campaignDeals = selectedDeals.map((d) => {
      return {
        campaignId: props.campaignId,
        dealId: d.id,
        deal: d
      }
    });
    props.onSubmit(campaignDeals);
  }

  return <Modal size="lg" show={props.show} onHide={props.onClose} onEntering={handleEntering} backdrop="static">
    <Modal.Header closeButton>
      <Modal.Title>Add deals</Modal.Title>
    </Modal.Header>
    <Modal.Body>
      <div className="row">
        <div className="col-lg-12">
          <DealsSelectTable
            records={deals}
            onChange={setSelected}
          />
        </div>
      </div>
    </Modal.Body>
    <Modal.Footer>
      <Button size="sm" variant="light" onClick={props.onClose}>CLOSE</Button>
      <Button size="sm" variant="primary" onClick={handleSubmit}>OKAY</Button>
    </Modal.Footer>
  </Modal>
}
export default AddDealsModal;