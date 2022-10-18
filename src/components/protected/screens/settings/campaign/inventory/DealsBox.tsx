import React, { useState, useEffect } from "react";
import { Button } from "react-bootstrap";
import * as _ from "lodash";
import { DealsBoxFormData, DealsBoxProps } from "../../../../../../client/campaignSchemas";
import { CampaignDeal } from "../../../../../../models/data/Campaign";
import FontIcon from "../../../../../UI/FontIcon";
import SettingsBox from "../shared/SettingsBox";
import CampaignDealsTable from "./CampaignDealsTable";
import AddDealsModal from "./AddDealsModal";
import Loader from "../../../../../UI/Loader";

const DealsBox = (props: DealsBoxProps) => {
  const [deals, setDeals] = useState<CampaignDeal[]>(props.deals || []);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [showLoader, setShowLoader] = useState<boolean>(true);

  const submitData = getSubmitData();

  useEffect(loadForm, [props.id]);

  useEffect(() => { props.onChange(submitData); }, [JSON.stringify(submitData)]);

  useEffect(() => { setShowLoader(false); }, [JSON.stringify(deals)]);

  function loadForm() {
    setDeals(props.deals || []);
  }

  function getSubmitData(): DealsBoxFormData {
    const dealsToSubmit = deals.map((d) => {
      return {
        dealId: d.dealId,
        campaignId: d.campaignId
      }
    });
    return {
      deals: dealsToSubmit
    }
  }

  const handleDealDelete = (deleteId: number) => {
    setShowLoader(true);
    const updatedDeals = deals.filter((d) => { return d.dealId !== deleteId });
    setDeals(updatedDeals);
  }

  const handleAddDeals = (campaignDeals: CampaignDeal[]) => {
    const updatedDeals = deals.concat(campaignDeals);
    setShowLoader(true);
    setDeals(updatedDeals);
    setShowModal(false);
  }

  const campaignDealIds = deals.map((d) => { return d.dealId; });
  const writeAccess = props.rights.MANAGE_CAMPAIGN && props.rights.MANAGE_DEALS;

  return <SettingsBox>
    <div className="row no-gutters">
      <div className="col-lg-12 px-1">
        <h5 className="pull-left">Deals</h5>
        <div className="table-btn-container">
          <Button size="sm" variant="primary" className="mr-2" disabled={!writeAccess} onClick={() => { setShowModal(true) }}><FontIcon name="plus" /> ADD DEALS</Button>
        </div>
        <Loader visible={showLoader} />
        {!showLoader &&
          <CampaignDealsTable
            records={deals}
            writeAccess={writeAccess}
            deleteClick={handleDealDelete}
          />
        }
      </div>
      <AddDealsModal
        show={showModal}
        campaignId={props.id}
        campaignDealIds={campaignDealIds}
        onClose={() => { setShowModal(false) }}
        onSubmit={handleAddDeals}
      />
    </div>
  </SettingsBox>
}
export default DealsBox;