import React, { useState } from "react";
import { Modal, Button, Form, InputGroup } from "react-bootstrap";
import NumberFormat from "react-number-format";
import * as _ from "lodash";
import * as Api from "../../../../../../client/Api";
import { RetailStrategy } from "../../../../../../models/data/Campaign";
import { RetailBranch } from "../../../../../../models/data/RetailBranch";
import Loader from "../../../../../UI/Loader";
import RetailBranchesSelectTable from "../../campaigns/RetailBranchesSelectTable";

interface AddRetailStrategiesModalProps {
  show: boolean;
  advertiserId: number;
  ids: number[];
  onClose: () => void;
  onSubmit: (retailStrategies: RetailStrategy[]) => void;
}

const AddRetailStrategiesModal = (props: AddRetailStrategiesModalProps) => {
  const [budget, setBudget] = useState<number>(null);
  const [maxBid, setMaxBid] = useState<number>(null);
  const [impressionCap, setImpressionCap] = useState<number>(null);
  const [retailBranches, setRetailBranches] = useState<RetailBranch[]>([]);
  const [selected, setSelected] = useState<number[]>([]);
  const [showLoader, setShowLoader] = useState<boolean>(true);

  const handleEntering = async () => {
    setShowLoader(true);
    const retailBranches: RetailBranch[] = await Api.Get({ path: `/api/advertisers/${props.advertiserId}/retailbranches` });
    const filtered = retailBranches.filter((rb) => { return props.ids.indexOf(rb.id) < 0 });
    setRetailBranches(filtered);
    setShowLoader(false);
  }

  const handleBudgetChange = (values) => {
    const budget = _.get(values, "floatValue") as number;
    setBudget(budget);
  }

  const handleImpressionsChange = (values) => {
    const impressionCap = _.get(values, "floatValue") as number;
    setImpressionCap(impressionCap);
  }

  const handleMaxBidPriceChange = (values) => {
    const maxBid = _.get(values, "floatValue") as number;
    setMaxBid(maxBid);
  }

  const handleRetailBranchesChange = (selected: number[]) => {
    setSelected(selected);
  }

  const handleSubmit = () => {
    const selectedRetailBranches = retailBranches.filter((rb) => { return selected.indexOf(rb.id) > -1 });
    const retailStrategies = selectedRetailBranches.map((rb) => {
      return {
        retailBranchId: rb.id,
        branchId: rb.branchId,
        campaignConstraints: {
          budget: budget ? budget : 0,
          impressionCap,
          maxBid
        },
        geoTargeting: {
          radius: null,
          targetingZipCodes: null
        },
        dynamicAdParameters: {
          urlTag: null,
          custom1: null,
          custom2: null,
          custom3: null,
          custom4: null,
          custom5: null,
          custom6: null,
          custom7: null,
          custom8: null,
          custom9: null,
        },
        retailBranch: rb
      }
    });
    props.onSubmit(retailStrategies);
  }

  return <Modal size="lg" show={props.show} onHide={props.onClose} onEntering={handleEntering} backdrop="static">
    <Modal.Header closeButton>
      <Modal.Title>Add retail branches</Modal.Title>
    </Modal.Header>
    <Modal.Body>
      <div className="row no-gutters">
        <div className="col-lg-4 px-1">
          <Form.Label>Budget</Form.Label>
          <InputGroup>
            <InputGroup.Prepend>
              <InputGroup.Text>€</InputGroup.Text>
            </InputGroup.Prepend>
            <NumberFormat
              id="add-retail-budget"
              className="form-control"
              value={budget}
              thousandSeparator={true}
              allowNegative={false}
              allowLeadingZeros={false}
              decimalScale={2}
              onValueChange={handleBudgetChange}
            />
          </InputGroup>
        </div>
        <div className="col-lg-4 px-1">
          <Form.Label>Impression cap</Form.Label>
          <Form.Group>
            <NumberFormat
              id="add-retail-impressions"
              className="form-control"
              value={impressionCap}
              thousandSeparator={true}
              allowNegative={false}
              allowLeadingZeros={false}
              decimalScale={0}
              onValueChange={handleImpressionsChange}
            />
          </Form.Group>
        </div>
        <div className="col-lg-4 px-1">
          <Form.Label>Max bidprice</Form.Label>
          <InputGroup>
            <InputGroup.Prepend>
              <InputGroup.Text>€</InputGroup.Text>
            </InputGroup.Prepend>
            <NumberFormat
              id="add-retail-maxbidprice"
              className="form-control"
              value={maxBid}
              thousandSeparator={true}
              allowNegative={false}
              allowLeadingZeros={false}
              decimalScale={2}
              fixedDecimalScale={true}
              onValueChange={handleMaxBidPriceChange}
            />
          </InputGroup>
        </div>
      </div>
      <div className="row no-gutters">
        <div className="col-lg-12 px-1">
          <Form.Label className="pull-left">Retail branches</Form.Label>
          <Loader visible={showLoader} />
          {!showLoader &&
            <RetailBranchesSelectTable
              records={retailBranches}
              onChange={handleRetailBranchesChange}
            />
          }
        </div>
      </div>
    </Modal.Body>
    <Modal.Footer>
      <Button size="sm" variant="light" onClick={props.onClose}>CLOSE</Button>
      <Button size="sm" variant="primary" onClick={handleSubmit}>SAVE</Button>
    </Modal.Footer>
  </Modal>
}
export default AddRetailStrategiesModal;