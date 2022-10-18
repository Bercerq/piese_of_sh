import React, { useState } from "react";
import { Modal, Form, InputGroup, Button } from "react-bootstrap";
import Select from "react-select";
import NumberFormat from "react-number-format";
import * as _ from "lodash";
import * as Validation from "../../../../../../client/Validation";
import * as CampaignHelper from "../../../../../../client/CampaignHelper";
import { SelectOption, ValidationError } from "../../../../../../client/schemas";
import { RuleActionType, RulePeriodType, SegmentRule } from "../../../../../../models/data/Campaign";
import { Segment } from "../../../../../../models/data/Segment";

interface SegmentRuleModalProps {
  index: number;
  show: boolean;
  segmentRule: SegmentRule;
  segments: Segment[];
  writeAccess: boolean;
  maxBidPrice: number;
  onSubmit: (i: number, segmentRule: SegmentRule) => void;
  onClose: () => void;
}

const SegmentRuleModal = (props: SegmentRuleModalProps) => {
  const [segmentId, setSegmentId] = useState<number>(-1);
  const [displayName, setDisplayName] = useState<string>("");
  const [bidAction, setBidAction] = useState<RuleActionType>("REQUIRED");
  const [limitBid, setLimitBid] = useState<number>(null);
  const [time, setTime] = useState<number>(30);
  const [timeUnit, setTimeUnit] = useState<RulePeriodType>("DAY");
  const [timeValidation, setTimeValidation] = useState<ValidationError>({ error: false, message: "" });
  const [limitBidValidation, setLimitBidValidation] = useState<ValidationError>({ error: false, message: "" });

  const handleEntering = () => {
    if (props.segmentRule) {
      setSegmentId(_.get(props, "segmentRule.segmentId"));
      setDisplayName(_.get(props, "segmentRule.displayName"));
      setBidAction(_.get(props, "segmentRule.consequence.action"));
      setLimitBid(_.get(props, "segmentRule.consequence.limitBid", null));
      setTime((_.get(props, "segmentRule.addedInPast.time", null)));
    } else {
      setSegmentId(props.segments.length > 0 ? props.segments[0].id : -1);
      setDisplayName(props.segments.length > 0 ? props.segments[0].name : "");
      setBidAction("REQUIRED");
      setLimitBid(null);
      setTime(30);
    }
    setTimeValidation({ error: false, message: "" });
    setLimitBidValidation({ error: false, message: "" });
  }

  const handleSegmentSelectChange = (selected) => {
    setSegmentId(selected.value as number);
    setDisplayName(selected.label);
  }

  const handleBidActionChange = (selected) => {
    setBidAction(selected.value as RuleActionType);
    setLimitBidValidation({ error: false, message: "" });
  }

  const handleLimitBidChange = (values) => {
    const limitBid = _.get(values, "floatValue") as number;
    const limitBidValidation = Validation.limitBid(limitBid, props.maxBidPrice);
    setLimitBid(limitBid);
    setLimitBidValidation(limitBidValidation);
  }

  const handleTimeChange = (e) => {
    const time = parseInt(e.target.value, 10);
    const timeValidation = Validation.native(e.target);
    setTime(time);
    setTimeValidation(timeValidation);
  }

  const handleTimeUnitChange = (selected) => {
    setTimeUnit(selected.value as RulePeriodType);
  }

  const handleSubmit = () => {
    let limitBidValidation = { error: false, message: "" };
    if (bidAction === "LIMIT_BID") {
      limitBidValidation = Validation.limitBid(limitBid, props.maxBidPrice);
    }
    setLimitBidValidation(limitBidValidation);
    if (!(timeValidation.error || limitBidValidation.error)) {
      const segmentRule: SegmentRule = {
        segmentId,
        displayName,
        addedInPast: {
          time,
          timeUnit
        },
        consequence: CampaignHelper.getRuleConsequence(bidAction, limitBid)
      }
      props.onSubmit(props.index, segmentRule);
    }
  }

  function getSegmentOptions(): SelectOption[] {
    return props.segments.map((o) => {
      return {
        value: o.id,
        label: o.name
      };
    })
  }

  const segmentOptions = getSegmentOptions();
  const bidOptions = CampaignHelper.ruleBidOptions();
  const timeUnitOptions = CampaignHelper.timeUnitOptions();
  const limitBidInputClass = limitBidValidation.error ? "form-control is-invalid" : "form-control";

  return <Modal size="lg" show={props.show} onHide={props.onClose} onEntering={handleEntering} backdrop="static">
    <Modal.Header closeButton>
      <Modal.Title>Rule settings</Modal.Title>
    </Modal.Header>
    <Modal.Body>
      <div className="row no-gutters">
        <div className="col-lg-12 px-1">
          <Form.Group>
            <Select
              isDisabled={!!props.segmentRule || !props.writeAccess}
              inputId={`segment-rule-select`}
              className="react-select-container"
              classNamePrefix="react-select"
              clearable={false}
              value={segmentOptions.find((o) => { return o.value === segmentId })}
              onChange={handleSegmentSelectChange}
              options={segmentOptions}
            />
          </Form.Group>
        </div>
      </div>
      <div className="row no-gutters">
        <div className="col-lg-4 px-1">
          <Form.Group>
            <Form.Label>Bid</Form.Label>
            <Select
              inputId="segment-bid-action"
              className="react-select-container"
              classNamePrefix="react-select"
              clearable={false}
              isDisabled={!props.writeAccess}
              value={bidOptions.find((o) => { return o.value === bidAction })}
              onChange={handleBidActionChange}
              options={bidOptions}
            />
          </Form.Group>
        </div>
        {bidAction === "LIMIT_BID" &&
          <div className="col-lg-8 px-1">
            <InputGroup style={{ marginTop: "27px" }}>
              <InputGroup.Prepend>
                <InputGroup.Text>€</InputGroup.Text>
              </InputGroup.Prepend>
              <NumberFormat
                id="segment-limit-bid"
                className={limitBidInputClass}
                disabled={!props.writeAccess}
                value={limitBid}
                thousandSeparator={true}
                allowNegative={false}
                allowLeadingZeros={false}
                decimalScale={2}
                fixedDecimalScale={true}
                onValueChange={handleLimitBidChange}
              />
              {limitBidValidation.error && <Form.Control.Feedback type="invalid">{limitBidValidation.message}</Form.Control.Feedback>}
            </InputGroup>
          </div>
        }
      </div>
      <div className="row no-gutters">
        <div className="col-lg-4 px-1">
          <Form.Group>
            <Form.Label>Period</Form.Label>
            <Form.Control
              id="segment-time"
              disabled={!props.writeAccess}
              required
              type="number"
              min="0"
              value={_.isNil(time) ? "" : time.toString()}
              isInvalid={timeValidation.error}
              onChange={handleTimeChange}
            />
            {timeValidation.error && <Form.Control.Feedback type="invalid">{timeValidation.message}</Form.Control.Feedback>}
          </Form.Group>
        </div>
        <div className="col-lg-4 px-1">
          <Form.Group style={{ marginTop: "28px" }}>
            <Select
              inputId="segment-time-unit"
              className="react-select-container"
              classNamePrefix="react-select"
              clearable={false}
              isDisabled={!props.writeAccess}
              value={timeUnitOptions.find((o) => { return o.value === timeUnit })}
              onChange={handleTimeUnitChange}
              options={timeUnitOptions}
            />
          </Form.Group>
        </div>
      </div>
    </Modal.Body>
    <Modal.Footer>
      <Button size="sm" variant="light" onClick={props.onClose}>CLOSE</Button>
      <Button size="sm" variant="primary" disabled={!props.writeAccess} onClick={handleSubmit}>{props.segmentRule ? "UPDATE" : "ADD"}</Button>
    </Modal.Footer>
  </Modal>;

}
export default SegmentRuleModal;