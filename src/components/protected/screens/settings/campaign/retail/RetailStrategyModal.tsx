import React, { useState } from "react";
import { Modal, Button, Form, InputGroup } from "react-bootstrap";
import NumberFormat from "react-number-format";
import CreatableSelect from "react-select/creatable";
import * as _ from "lodash";
import * as Validation from "../../../../../../client/Validation";
import { RetailStrategy, RetailStrategyGeoTargeting, StructureType } from "../../../../../../models/data/Campaign";
import { SelectOption, ValidationError } from "../../../../../../client/schemas";

interface RetailStrategyModalProps {
  show: boolean;
  retailStrategy: RetailStrategy;
  maxBidPrice: number;
  structure: StructureType;
  writeAccess: boolean;
  onClose: () => void;
  onSubmit: (retailStrategy: RetailStrategy) => void;
}

const RetailStrategyModal = (props: RetailStrategyModalProps) => {
  const [budget, setBudget] = useState<number>(null);
  const [maxBid, setMaxBid] = useState<number>(null);
  const [impressionCap, setImpressionCap] = useState<number>(null);
  const [targetingZipCodes, setTargetingZipCodes] = useState<SelectOption[]>([]);
  const [radius, setRadius] = useState<number>(null);
  const [urlTag, setUrlTag] = useState<string>("");
  const [custom1, setCustom1] = useState<string>("");
  const [custom2, setCustom2] = useState<string>("");
  const [custom3, setCustom3] = useState<string>("");
  const [custom4, setCustom4] = useState<string>("");
  const [custom5, setCustom5] = useState<string>("");
  const [custom6, setCustom6] = useState<string>("");
  const [custom7, setCustom7] = useState<string>("");
  const [custom8, setCustom8] = useState<string>("");
  const [custom9, setCustom9] = useState<string>("");
  const [radiusValidation, setRadiusValidation] = useState<ValidationError>({ error: false, message: "" });

  const handleEntering = async () => {
    const budget = _.get(props, "retailStrategy.campaignConstraints.budget") || 0;
    const impressionCap = _.get(props, "retailStrategy.campaignConstraints.impressionCap");
    const maxBid = _.get(props, "retailStrategy.campaignConstraints.maxBid");
    const targetingZipCodes = (_.get(props, "retailStrategy.geoTargeting.targetingZipCodes") || []).map((v) => { return { value: v, label: v } });
    const radius = _.get(props, "retailStrategy.geoTargeting.radius");
    const urlTag = _.get(props, "retailStrategy.dynamicAdParameters.urlTag", "");
    const custom1 = _.get(props, "retailStrategy.dynamicAdParameters.custom1", "");
    const custom2 = _.get(props, "retailStrategy.dynamicAdParameters.custom2", "");
    const custom3 = _.get(props, "retailStrategy.dynamicAdParameters.custom3", "");
    const custom4 = _.get(props, "retailStrategy.dynamicAdParameters.custom4", "");
    const custom5 = _.get(props, "retailStrategy.dynamicAdParameters.custom5", "");
    const custom6 = _.get(props, "retailStrategy.dynamicAdParameters.custom6", "");
    const custom7 = _.get(props, "retailStrategy.dynamicAdParameters.custom7", "");
    const custom8 = _.get(props, "retailStrategy.dynamicAdParameters.custom8", "");
    const custom9 = _.get(props, "retailStrategy.dynamicAdParameters.custom9", "");
    setBudget(budget);
    setImpressionCap(impressionCap);
    setMaxBid(maxBid);
    setTargetingZipCodes(targetingZipCodes);
    setRadius(radius);
    setUrlTag(urlTag);
    setCustom1(custom1);
    setCustom2(custom2);
    setCustom3(custom3);
    setCustom4(custom4);
    setCustom5(custom5);
    setCustom6(custom6);
    setCustom7(custom7);
    setCustom8(custom8);
    setCustom9(custom9);
    setRadiusValidation({ error: false, message: "" });
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

  const handleTargetingZipCodesChange = (values: any, actionMeta: any) => {
    let targetingZipCodes = values;
    if (values.length > 0) {
      const latestValue = values[values.length - 1].value;
      const newValues = latestValue.split(/[\s,]+/).map((v) => { return { value: v, label: v } });
      if (newValues.length > 1) {
        targetingZipCodes = values.slice(0, values.length - 1).concat(newValues);
      }
    }
    setTargetingZipCodes(targetingZipCodes);
  }

  const handleRadiusChange = (e) => {
    const radius = e.target.value.trim() !== "" ? parseFloat(e.target.value) : null;
    const radiusValidation = Validation.native(e.target);
    setRadius(radius);
    setRadiusValidation(radiusValidation);
  }

  const handleSubmit = () => {
    if (!radiusValidation.error) {
      const targetingZipCodeValues = targetingZipCodes.map((o) => { return o.value as string });
      const geoTargeting: RetailStrategyGeoTargeting = props.structure === "RETAIL_GPS" ? { radius, targetingZipCodes: null } : { radius: null, targetingZipCodes: targetingZipCodeValues.length > 0 ? targetingZipCodeValues : null };
      const retailStrategy: RetailStrategy = {
        branchId: _.get(props, "retailStrategy.branchId"),
        retailBranchId: _.get(props, "retailStrategy.retailBranchId"),
        campaignConstraints: {
          budget: budget ? budget : 0,
          impressionCap,
          maxBid
        },
        geoTargeting,
        dynamicAdParameters: {
          urlTag: getNullIfEmpty(urlTag),
          custom1: getNullIfEmpty(custom1),
          custom2: getNullIfEmpty(custom2),
          custom3: getNullIfEmpty(custom3),
          custom4: getNullIfEmpty(custom4),
          custom5: getNullIfEmpty(custom5),
          custom6: getNullIfEmpty(custom6),
          custom7: getNullIfEmpty(custom7),
          custom8: getNullIfEmpty(custom8),
          custom9: getNullIfEmpty(custom9),
        },
        retailBranch: _.get(props, "retailStrategy.retailBranch")
      }
      props.onSubmit(retailStrategy);
    }
  }

  function getNullIfEmpty(value) {
    if (value === "") {
      return null;
    }
    return value;
  }

  function getRadiusPlaceholder() {
    const branchRadius = _.get(props, "retailStrategy.retailBranch.radius", null);
    return _.isNil(branchRadius) ? `Branch default: ${branchRadius}` : "";
  }

  function getTargetingZipCodesPlaceholder() {
    const branchTargetingZipCodes = _.get(props, "retailStrategy.retailBranch.targetingZipCodes", []);
    return branchTargetingZipCodes.length > 0 ? `Branch default: ${branchTargetingZipCodes.join(",")}` : "";
  }

  function getUrlTagPlaceholder() {
    const branchUrlTag = _.get(props, "retailStrategy.retailBranch.urlTag", "");
    return branchUrlTag !== "" ? `Branch default: ${branchUrlTag}` : "";
  }

  return <Modal size="lg" show={props.show} onHide={props.onClose} onEntering={handleEntering} backdrop="static">
    <Modal.Header closeButton>
      <Modal.Title>Edit retail branch</Modal.Title>
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
              id="edit-retail-budget"
              className="form-control"
              value={budget}
              disabled={!props.writeAccess}
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
              id="edit-retail-impressions"
              className="form-control"
              placeholder="No impression limit"
              value={impressionCap}
              disabled={!props.writeAccess}
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
              id="edit-retail-maxbidprice"
              className="form-control"
              value={maxBid}
              disabled={!props.writeAccess}
              placeholder={`Campaign max bid: ${props.maxBidPrice}`}
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
        {props.structure === "RETAIL_ZIP" &&
          <div className="col-lg-12 px-1">
            <Form.Group controlId="edit-retail-targetingzipcodes">
              <Form.Label>Targeting postal codes</Form.Label>
              <CreatableSelect
                className="react-select-container multiple"
                classNamePrefix="react-select"
                isClearable
                isMulti
                isDisabled={!props.writeAccess}
                placeholder={getTargetingZipCodesPlaceholder()}
                onChange={handleTargetingZipCodesChange}
                value={targetingZipCodes}
              />
            </Form.Group>
          </div>
        }
        {props.structure === "RETAIL_GPS" &&
          <div className="col-lg-12 px-1">
            <Form.Group controlId="edit-retail-radius">
              <Form.Label>Radius</Form.Label>
              <Form.Control
                disabled={!props.writeAccess}
                required
                type="number"
                min="0"
                placeholder={getRadiusPlaceholder()}
                isInvalid={radiusValidation.error}
                value={_.toString(radius)}
                onChange={handleRadiusChange}
              />
            </Form.Group>
            {radiusValidation.error && <Form.Control.Feedback type="invalid">{radiusValidation.message}</Form.Control.Feedback>}
          </div>
        }
      </div>
      <div className="row no-gutters">
        <div className="col-lg-12 px-1">
          <Form.Group controlId="edit-retail-urltag">
            <Form.Label>Landing page *</Form.Label>
            <Form.Control
              disabled={!props.writeAccess}
              type="text"
              placeholder={getUrlTagPlaceholder()}
              value={urlTag}
              onChange={(e) => { setUrlTag(e.target.value); }}
            />
          </Form.Group>
        </div>
      </div>
      <div className="row no-gutters">
        <div className="col-lg-6 px-1">
          <Form.Group controlId="edit-retail-custom1">
            <Form.Label>Custom 1</Form.Label>
            <Form.Control
              disabled={!props.writeAccess}
              type="text"
              value={custom1}
              onChange={(e) => { setCustom1(e.target.value); }}
            />
          </Form.Group>
        </div>
        <div className="col-lg-6 px-1">
          <Form.Group controlId="edit-retail-custom2">
            <Form.Label>Custom 2</Form.Label>
            <Form.Control
              disabled={!props.writeAccess}
              type="text"
              value={custom2}
              onChange={(e) => { setCustom2(e.target.value); }}
            />
          </Form.Group>
        </div>
      </div>
      <div className="row no-gutters">
        <div className="col-lg-6 px-1">
          <Form.Group controlId="edit-retail-custom3">
            <Form.Label>Custom 3</Form.Label>
            <Form.Control
              disabled={!props.writeAccess}
              type="text"
              value={custom3}
              onChange={(e) => { setCustom3(e.target.value); }}
            />
          </Form.Group>
        </div>
        <div className="col-lg-6 px-1">
          <Form.Group controlId="edit-retail-custom4">
            <Form.Label>Custom 4</Form.Label>
            <Form.Control
              disabled={!props.writeAccess}
              type="text"
              value={custom4}
              onChange={(e) => { setCustom4(e.target.value); }}
            />
          </Form.Group>
        </div>
      </div>
      <div className="row no-gutters">
        <div className="col-lg-6 px-1">
          <Form.Group controlId="edit-retail-custom5">
            <Form.Label>Custom 5</Form.Label>
            <Form.Control
              disabled={!props.writeAccess}
              type="text"
              value={custom5}
              onChange={(e) => { setCustom5(e.target.value); }}
            />
          </Form.Group>
        </div>
        <div className="col-lg-6 px-1">
          <Form.Group controlId="edit-retail-custom6">
            <Form.Label>Custom 6</Form.Label>
            <Form.Control
              disabled={!props.writeAccess}
              type="text"
              value={custom6}
              onChange={(e) => { setCustom6(e.target.value); }}
            />
          </Form.Group>
        </div>
      </div>
      <div className="row no-gutters">
        <div className="col-lg-6 px-1">
          <Form.Group controlId="edit-retail-custom7">
            <Form.Label>Custom 7</Form.Label>
            <Form.Control
              disabled={!props.writeAccess}
              type="text"
              value={custom7}
              onChange={(e) => { setCustom7(e.target.value); }}
            />
          </Form.Group>
        </div>
        <div className="col-lg-6 px-1">
          <Form.Group controlId="edit-retail-custom8">
            <Form.Label>Custom 8</Form.Label>
            <Form.Control
              disabled={!props.writeAccess}
              type="text"
              value={custom8}
              onChange={(e) => { setCustom8(e.target.value); }}
            />
          </Form.Group>
        </div>
      </div>
      <div className="row no-gutters">
        <div className="col-lg-6 px-1">
          <Form.Group controlId="edit-retail-custom9">
            <Form.Label>Custom 9</Form.Label>
            <Form.Control
              disabled={!props.writeAccess}
              type="text"
              value={custom9}
              onChange={(e) => { setCustom9(e.target.value); }}
            />
          </Form.Group>
        </div>
      </div>
    </Modal.Body>
    <Modal.Footer>
      <Button size="sm" variant="light" onClick={props.onClose}>CLOSE</Button>
      <Button size="sm" disabled={!props.writeAccess} variant="primary" onClick={handleSubmit}>SAVE</Button>
    </Modal.Footer>
  </Modal>
}
export default RetailStrategyModal;