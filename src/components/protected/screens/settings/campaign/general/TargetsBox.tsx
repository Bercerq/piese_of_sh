import React, { useState, useEffect, Fragment } from "react";
import { Form, InputGroup, Alert } from "react-bootstrap";
import NumberFormat from "react-number-format";
import * as _ from "lodash";
import * as Validation from "../../../../../../client/Validation";
import FontIcon from "../../../../../UI/FontIcon";
import SettingsBoxCollapse from "../shared/SettingsBoxCollapse";
import { TargetsBoxFormData, TargetsBoxProps } from "../../../../../../client/campaignSchemas";
import { ValidationError } from "../../../../../../client/schemas";

const TargetsBox = (props: TargetsBoxProps) => {
  const [minimumPerformanceCTR, setMinimumPerformanceCTR] = useState<number>(props.minimumPerformanceCTR);
  const [viewableMeasurable, setViewableMeasurable] = useState<number>(props.viewableMeasurable);
  const [viewable, setViewable] = useState<number>(props.viewable);
  const [completionRate, setCompletionRate] = useState<number>(props.completionRate);
  const [maximumPerformanceCTR, setMaximumPerformanceCTR] = useState<number>(props.maximumPerformanceCTR);
  const [CPC, setCPC] = useState<number>(props.CPC);
  const [CPCV, setCPCV] = useState<number>(props.CPCV);
  const [CPV, setCPV] = useState<number>(props.CPV);
  const [open, setOpen] = useState<boolean>(props.open);
  const [showMinimumPerformanceInfo, setShowMinimumPerformanceInfo] = useState<boolean>(false);
  const [showMaximumPerformanceInfo, setShowMaximumPerformanceInfo] = useState<boolean>(false);
  const [showMaximumBidInfo, setShowMaximumBidInfo] = useState<boolean>(false);
  const [minimumPerformanceCTRValidation, setMinimumPerformanceCTRValidation] = useState<ValidationError>({ error: false, message: "" });
  const [viewableMeasurableValidation, setViewableMeasurableValidation] = useState<ValidationError>({ error: false, message: "" });
  const [viewableValidation, setViewableValidation] = useState<ValidationError>({ error: false, message: "" });
  const [completionRateValidation, setCompletionRateValidation] = useState<ValidationError>({ error: false, message: "" });
  const [maximumPerformanceCTRValidation, setMaximumPerformanceCTRValidation] = useState<ValidationError>({ error: false, message: "" });

  const submitData = getSubmitData();
  const isValid = getIsValid();

  useEffect(loadForm, [props.id]);

  useEffect(() => { props.onChange(submitData, isValid); }, [JSON.stringify(submitData), isValid]);

  function loadForm() {
    setMinimumPerformanceCTR(props.minimumPerformanceCTR);
    setViewableMeasurable(props.viewableMeasurable);
    setCompletionRate(props.completionRate);
    setViewable(props.viewable);
    setMaximumPerformanceCTR(props.maximumPerformanceCTR);
    setCPC(props.CPC);
    setCPCV(props.CPCV);
    setCPV(props.CPV);
    setOpen(props.open);
    setShowMinimumPerformanceInfo(false);
    setShowMaximumPerformanceInfo(false);
    setShowMaximumBidInfo(false);
    setMinimumPerformanceCTRValidation({ error: false, message: "" });
    setViewableMeasurableValidation({ error: false, message: "" });
    setViewableValidation({ error: false, message: "" });
    setCompletionRateValidation({ error: false, message: "" });
    setMaximumPerformanceCTRValidation({ error: false, message: "" });
  }

  function getSubmitData(): TargetsBoxFormData {
    return {
      minimumPerformanceCTR,
      viewableMeasurable,
      viewable,
      completionRate,
      maximumPerformanceCTR,
      CPC,
      CPCV,
      CPV
    }
  }

  function getIsValid() {
    return !(minimumPerformanceCTRValidation.error || viewableMeasurableValidation.error || viewableValidation.error || completionRateValidation.error || maximumPerformanceCTRValidation.error);
  }

  const minimumPerformanceInfoClick = (e) => {
    e.preventDefault();
    setShowMinimumPerformanceInfo(!showMinimumPerformanceInfo);
  }

  const maximumPerformanceInfoClick = (e) => {
    e.preventDefault();
    setShowMaximumPerformanceInfo(!showMaximumPerformanceInfo);
  }

  const maximumBidInfoClick = (e) => {
    e.preventDefault();
    setShowMaximumBidInfo(!showMaximumBidInfo);
  }

  const minimumPerformanceCTRChange = (e) => {
    const minimumPerformanceCTR = e.target.value !== "" ? parseFloat(e.target.value) : null;
    const minimumPerformanceCTRValidation = Validation.native(e.target);
    setMinimumPerformanceCTR(minimumPerformanceCTR);
    setMinimumPerformanceCTRValidation(minimumPerformanceCTRValidation);
  }

  const viewableMeasurableChange = (e) => {
    const viewableMeasurable = e.target.value !== "" ? parseFloat(e.target.value) : null;
    const viewableMeasurableValidation = Validation.native(e.target);
    setViewableMeasurable(viewableMeasurable);
    setViewableMeasurableValidation(viewableMeasurableValidation);
  }

  const viewableChange = (e) => {
    const viewable = e.target.value !== "" ? parseFloat(e.target.value) : null;
    const viewableValidation = Validation.native(e.target);
    setViewable(viewable);
    setViewableValidation(viewableValidation);
  }

  const completionRateChange = (e) => {
    const completionRate = e.target.value !== "" ? parseFloat(e.target.value) : null;
    const completionRateValidation = Validation.native(e.target);
    setCompletionRate(completionRate);
    setCompletionRateValidation(completionRateValidation);
  }

  const maximumPerformanceCTRChange = (e) => {
    const maximumPerformanceCTR = e.target.value !== "" ? parseFloat(e.target.value) : null;
    const maximumPerformanceCTRValidation = Validation.native(e.target);
    setMaximumPerformanceCTR(maximumPerformanceCTR);
    setMaximumPerformanceCTRValidation(maximumPerformanceCTRValidation);
  }

  const writeAccess = props.rights.MANAGE_CAMPAIGN || false;

  return <SettingsBoxCollapse title="Targets" open={open} onClick={() => { setOpen(!open) }}>
    <div className="row no-gutters">
      <div className="col-lg-12 px-1">
        <span className="font-weight-bold">Minimum performance</span><a style={{ fontSize: "1.1em" }} className="text-info ml-1" href="" onClick={minimumPerformanceInfoClick}><FontIcon name="info-circle" /></a>
        {showMinimumPerformanceInfo &&
          <Alert onClose={() => { setShowMinimumPerformanceInfo(false) }} variant="info" dismissible>
            By setting a minimum performance you are excluding inventory that is not expected to meet this level from being bid on. This may also negatively affect the campaign, as it does mean that only higher quality - but more expensive inventory - can be bought. Setting the bar too high may even result in a campaign not being able to find any inventory that it can bid on.
          </Alert>
        }
      </div>
    </div>
    <div className="row no-gutters mb-3">
      <div className="col-lg-6 px-1">
        <Form.Label>Click-through rate</Form.Label>
        <InputGroup>
          <InputGroup.Prepend>
            <InputGroup.Text>%</InputGroup.Text>
          </InputGroup.Prepend>
          <Form.Control
            disabled={!writeAccess}
            id="settings-targets-ctr-min-performance"
            type="number"
            min="0"
            max="100"
            step="0.01"
            isInvalid={minimumPerformanceCTRValidation.error}
            value={_.toString(minimumPerformanceCTR)}
            onChange={minimumPerformanceCTRChange}
          />
          {minimumPerformanceCTRValidation.error && <Form.Control.Feedback type="invalid">{minimumPerformanceCTRValidation.message}</Form.Control.Feedback>}
        </InputGroup>
      </div>
    </div>
    {!props.videoCampaign && <Fragment>
      <div className="row no-gutters mb-3">
        <div className="col-lg-6 px-1">
          <Form.Label>Viewable measurable</Form.Label>
          <InputGroup>
            <InputGroup.Prepend>
              <InputGroup.Text>%</InputGroup.Text>
            </InputGroup.Prepend>
            <Form.Control
              disabled={!writeAccess}
              id="settings-targets-viewable-measurable"
              type="number"
              min="0"
              max="100"
              step="0.01"
              isInvalid={viewableMeasurableValidation.error}
              value={_.toString(viewableMeasurable)}
              onChange={viewableMeasurableChange}
            />
            {viewableMeasurableValidation.error && <Form.Control.Feedback type="invalid">{viewableMeasurableValidation.message}</Form.Control.Feedback>}
          </InputGroup>
        </div>
      </div>
      <div className="row no-gutters mb-3">
        <div className="col-lg-6 px-1">
          <Form.Label>Viewable</Form.Label>
          <InputGroup>
            <InputGroup.Prepend>
              <InputGroup.Text>%</InputGroup.Text>
            </InputGroup.Prepend>
            <Form.Control
              disabled={!writeAccess}
              id="settings-targets-viewable"
              type="number"
              min="0"
              max="100"
              step="0.01"
              isInvalid={viewableValidation.error}
              value={_.toString(viewable)}
              onChange={viewableChange}
            />
            {viewableValidation.error && <Form.Control.Feedback type="invalid">{viewableValidation.message}</Form.Control.Feedback>}
          </InputGroup>
        </div>
      </div>
    </Fragment>}
    {props.videoCampaign &&
      <div className="row no-gutters mb-3">
        <div className="col-lg-6 px-1">
          <Form.Label>Completion rate</Form.Label>
          <InputGroup>
            <InputGroup.Prepend>
              <InputGroup.Text>%</InputGroup.Text>
            </InputGroup.Prepend>
            <Form.Control
              disabled={!writeAccess}
              id="settings-targets-completion-rate"
              type="number"
              min="0"
              max="100"
              step="0.01"
              isInvalid={completionRateValidation.error}
              value={_.toString(completionRate)}
              onChange={completionRateChange}
            />
            {completionRateValidation.error && <Form.Control.Feedback type="invalid">{completionRateValidation.message}</Form.Control.Feedback>}
          </InputGroup>
        </div>
      </div>}
    <div className="row no-gutters">
      <div className="col-lg-12 px-1">
        <span className="font-weight-bold">Maximum performance</span><a style={{ fontSize: "1.1em" }} className="text-info ml-1" href="" onClick={maximumPerformanceInfoClick}><FontIcon name="info-circle" /></a>
        {showMaximumPerformanceInfo &&
          <Alert onClose={() => { setShowMaximumPerformanceInfo(false) }} variant="info" dismissible>
            Setting a maximum performance may help to exclude inventory that has suspiciously good results. This typically means advertisement areas that move during the loading of a page’s content and result in a high number of unintentional clicks.
          </Alert>
        }
      </div>
    </div>
    <div className="row no-gutters mb-3">
      <div className="col-lg-6 px-1">
        <Form.Label>Click-through rate</Form.Label>
        <InputGroup>
          <InputGroup.Prepend>
            <InputGroup.Text>%</InputGroup.Text>
          </InputGroup.Prepend>
          <Form.Control
            disabled={!writeAccess}
            id="settings-targets-ctr-max-performance"
            type="number"
            min="0"
            max="100"
            step="0.01"
            isInvalid={maximumPerformanceCTRValidation.error}
            value={_.toString(maximumPerformanceCTR)}
            onChange={maximumPerformanceCTRChange}
          />
          {maximumPerformanceCTRValidation.error && <Form.Control.Feedback type="invalid">{maximumPerformanceCTRValidation.message}</Form.Control.Feedback>}
        </InputGroup>
      </div>
    </div>
    <div className="row no-gutters">
      <div className="col-lg-12 px-1">
        <span className="font-weight-bold">Maximum cost</span><a style={{ fontSize: "1.1em" }} className="text-info ml-1" href="" onClick={maximumBidInfoClick}><FontIcon name="info-circle" /></a>
        {showMaximumBidInfo &&
          <Alert onClose={() => { setShowMaximumBidInfo(false) }} variant="info" dismissible>
            Setting a maximum cost on a metric may help when trying to optimize your campaign on several metrics. For example if you are optimizing on clicks, but do not want to pay more than 1 euro CPM per viewable impression then you can set that as an additional limit here.
          </Alert>
        }
      </div>
    </div>
    <div className="row no-gutters mb-3">
      <div className="col-lg-6 px-1">
        <Form.Label>Cost per click</Form.Label>
        <InputGroup>
          <InputGroup.Prepend>
            <InputGroup.Text>€</InputGroup.Text>
          </InputGroup.Prepend>
          <NumberFormat
            disabled={!writeAccess}
            id="settings-cpc"
            className="form-control"
            value={CPC}
            thousandSeparator={true}
            allowNegative={false}
            allowLeadingZeros={false}
            decimalScale={2}
            fixedDecimalScale={true}
            onValueChange={(values) => { setCPC(_.get(values, "floatValue") as number); }}
          />
        </InputGroup>
      </div>
    </div>
    {!props.videoCampaign &&
      <div className="row no-gutters mb-3">
        <div className="col-lg-6 px-1">
          <Form.Label>Cost per view</Form.Label>
          <InputGroup>
            <InputGroup.Prepend>
              <InputGroup.Text>€</InputGroup.Text>
            </InputGroup.Prepend>
            <NumberFormat
              disabled={!writeAccess}
              id="settings-cpv"
              className="form-control"
              value={CPV}
              thousandSeparator={true}
              allowNegative={false}
              allowLeadingZeros={false}
              decimalScale={2}
              fixedDecimalScale={true}
              onValueChange={(values) => { setCPV(_.get(values, "floatValue") as number); }}
            />
          </InputGroup>
        </div>
      </div>}
    {props.videoCampaign &&
      <div className="row no-gutters mb-3">
        <div className="col-lg-6 px-1">
          <Form.Label>Cost per completed video</Form.Label>
          <InputGroup>
            <InputGroup.Prepend>
              <InputGroup.Text>€</InputGroup.Text>
            </InputGroup.Prepend>
            <NumberFormat
              disabled={!writeAccess}
              id="settings-cpcv"
              className="form-control"
              value={CPCV}
              thousandSeparator={true}
              allowNegative={false}
              allowLeadingZeros={false}
              decimalScale={2}
              fixedDecimalScale={true}
              onValueChange={(values) => { setCPCV(_.get(values, "floatValue") as number); }}
            />
          </InputGroup>
        </div>
      </div>}
  </SettingsBoxCollapse>
}
export default TargetsBox;