import React, { useState, useEffect } from "react";
import { Form, InputGroup, Alert } from "react-bootstrap";
import Select from "react-select";
import Datetime from "react-datetime";
import momentPropTypes from "react-moment-proptypes";
import moment from "moment";
import * as _ from "lodash";
import * as Validation from "../../../../../../client/Validation";
import * as CampaignHelper from "../../../../../../client/CampaignHelper";
import { SelectOption, ValidationError } from "../../../../../../client/schemas";
import SettingsBox from "../shared/SettingsBox";
import { DeliveryType, GeneralBoxFormData, GeneralBoxProps } from "../../../../../../client/campaignSchemas";
import { DayHourTargeting, RevenueType } from "../../../../../../models/data/Campaign";
import FontIcon from "../../../../../UI/FontIcon";
import DayHourGrid from "./DayHourGrid";
import Loader from "../../../../../UI/Loader";

const GeneralBox = (props: GeneralBoxProps) => {
  const [name, setName] = useState<string>(props.name);
  const [startDate, setStartDate] = useState<momentPropTypes.momentObj>(moment.unix(props.startTime));
  const [endDate, setEndDate] = useState<momentPropTypes.momentObj | null>(moment.unix(props.endTime));
  const [revenueType, setRevenueType] = useState<RevenueType>(props.revenueType);
  const [deliveryType, setDeliveryType] = useState<DeliveryType>(props.deliveryType);
  const [dayHour, setDayHour] = useState<DayHourTargeting>(props.dayHour);
  const [clusterId, setClusterId] = useState<number>(props.clusterId);
  const [campaignGroups, setCampaignGroups] = useState<SelectOption[]>([]);
  const [remarks, setRemarks] = useState<string>(props.remarks);
  const [nameValidation, setNameValidation] = useState<ValidationError>({ error: false, message: "" });
  const [periodValidation, setPeriodValidation] = useState<ValidationError>({ error: false, message: "" });
  const [showLoader, setShowLoader] = useState<boolean>(true);

  const submitData = getSubmitData();
  const isValid = getIsValid();

  useEffect(() => { loadForm(); }, [props.id]);

  useEffect(() => { props.onChange(submitData, isValid); }, [JSON.stringify(submitData), isValid]);

  async function loadForm() {
    setShowLoader(true);
    setName(props.name);
    setStartDate(moment.unix(props.startTime));
    setEndDate(moment.unix(props.endTime));
    setRevenueType(props.revenueType);
    setDeliveryType(props.deliveryType);
    setDayHour(props.dayHour);
    setRemarks(props.remarks);
    setNameValidation({ error: false, message: "" });
    setPeriodValidation({ error: false, message: "" });
    setClusterId(props.clusterId);
    const campaignGroups = await CampaignHelper.campaigngroupOptions(props.advertiserId);
    setCampaignGroups(campaignGroups);
    setShowLoader(false);
  }

  function getSubmitData(): GeneralBoxFormData {
    return {
      name,
      startTime: moment(startDate).unix(),
      endTime: moment(endDate).unix(),
      revenueType,
      deliveryType,
      dayHour,
      clusterId,
      remarks
    };
  }

  function getIsValid(): boolean {
    return !(periodValidation.error || nameValidation.error);
  }

  const handleNameChange = (e) => {
    const name = e.target.value;
    const nameValidation = Validation.native(e.target);
    setName(name);
    setNameValidation(nameValidation);
  }

  const handleStartDateChange = (date) => {
    const periodValidation = getPeriodValidation(date, endDate);
    setStartDate(date);
    setPeriodValidation(periodValidation);
  }

  const handleEndDateChange = (date) => {
    const periodValidation = getPeriodValidation(startDate, date);
    setEndDate(date);
    setPeriodValidation(periodValidation);
  }

  const handleRevenueTypeChange = (e) => {
    if (e.target.checked) {
      const revenueType = parseInt(e.target.value) as RevenueType;
      setRevenueType(revenueType);
    }
  }

  const handleDeliveryTypeChange = (e) => {
    if (e.target.checked) {
      const deliveryType = e.target.value as DeliveryType;
      setDeliveryType(deliveryType);
    }
  }

  const dayHourChange = (dayHour: DayHourTargeting) => {
    setDayHour(dayHour);
  }

  const handleCampaigngroupChange = (selected) => {
    setClusterId(selected.value as number);
  }

  const handleRemarksChange = (e) => {
    const remarks = e.target.value;
    setRemarks(remarks);
  }

  function getPeriodValidation(startDate, endDate) {
    let periodValidation = { error: false, message: "" };
    if (!startDate || !endDate) {
      periodValidation = { error: true, message: "Please fill out start/end date" };
    } else {
      if (startDate.isAfter(endDate)) {
        periodValidation = { error: true, message: "End date should be same or after start date." };
      }
    }
    return periodValidation;
  }

  const revenueTypeOptions = CampaignHelper.revenueTypeOptions(props.videoCampaign);
  const deliveryTypeOptions = CampaignHelper.deliveryTypeOptions();
  const writeAccess = props.rights.MANAGE_CAMPAIGN || false;

  return <SettingsBox title="General">
    <div className="row no-gutters">
      <div className="col-lg-12 px-1">
        <Form.Group controlId="settings-general-name">
          <Form.Label>Name *</Form.Label>
          <Form.Control
            type="text"
            value={name}
            required={true}
            maxLength={200}
            isInvalid={nameValidation.error}
            disabled={!writeAccess}
            onChange={handleNameChange}
          />
          {nameValidation.error && <Form.Control.Feedback type="invalid">{nameValidation.message}</Form.Control.Feedback>}
        </Form.Group>
      </div>
    </div>
    <div className="row no-gutters">
      <div className="col-lg-6 px-1 pb-2">
        <Form.Label>Start date *</Form.Label>
        <InputGroup>
          <InputGroup.Prepend>
            <InputGroup.Text><FontIcon name="calendar" /></InputGroup.Text>
          </InputGroup.Prepend>
          <Datetime
            inputProps={{ disabled: !writeAccess }}
            dateFormat="YYYY-MM-DD"
            timeFormat="HH:mm"
            onChange={handleStartDateChange}
            value={startDate}
          />
          {periodValidation.error && <Form.Control.Feedback type="invalid" style={{ display: "block" }}>{periodValidation.message}</Form.Control.Feedback>}
        </InputGroup>
      </div>
      <div className="col-lg-6 px-1 pb-2">
        <Form.Label>End date *</Form.Label>
        <InputGroup>
          <InputGroup.Prepend>
            <InputGroup.Text><FontIcon name="calendar" /></InputGroup.Text>
          </InputGroup.Prepend>
          <Datetime
            inputProps={{ disabled: !writeAccess }}
            dateFormat="YYYY-MM-DD"
            timeFormat="HH:mm"
            onChange={handleEndDateChange}
            value={endDate}
          />
        </InputGroup>
      </div>
    </div>
    <div className="row no-gutters">
      <div className="col-lg-12 px-1">
        <Form.Group>
          <Form.Label className="width-100">Optimize</Form.Label>
          {
            revenueTypeOptions.map((o, i) => <Form.Check inline
              disabled={!writeAccess}
              id={`settings-general-revenuetype-${o.value}`}
              type="radio"
              value={o.value}
              name="settings-general-revenuetype"
              checked={o.value === revenueType.toString()}
              onChange={handleRevenueTypeChange}
              label={o.label} />)
          }
        </Form.Group>
      </div>
    </div>
    <div className="row no-gutters">
      <div className="col-lg-12 px-1">
        <Form.Group>
          <Form.Label className="width-100">Delivery</Form.Label>
          {
            deliveryTypeOptions.map((o, i) => <Form.Check inline
              disabled={!writeAccess}
              id={`settings-general-deliverytype-${o.value}`}
              type="radio"
              value={o.value}
              name="settings-general-deliverytype"
              checked={o.value === deliveryType}
              onChange={handleDeliveryTypeChange}
              label={o.label} />)
          }
        </Form.Group>
        {deliveryType === "frontloaded" &&
          <Alert variant="warning">
            <FontIcon name="warning" /> Campaign tries to deliver slightly ahead of schedule. This builds up a buffer to reduce the chance of underdelivery if issues arise at some point during the campaign.
          </Alert>
        }
        {deliveryType === "fast" &&
          <Alert variant="warning">
            <p><FontIcon name="warning" /> NOTE: this does not increase the chance of winning
				impressions, and will likely hurt the campaign's performance. For any delivery type, bids are modified by
				scheduling and will automatically be increased to meet the campaign's goal by the scheduled date.</p>
            <p>By selecting "as fast as possible", the campaign will completely disregard scheduling and will always
            "overbid". In most cases of underdelivery, increasing the maximum bid price or expanding the targeting is a more
				effective way to meet the campaign's goals.</p>
          </Alert>
        }
      </div>
    </div>
    <div className="row no-gutters">
      <div className="col-lg-12 px-1">
        <Form.Group>
          <Form.Label>Day parting</Form.Label>
          <p>
            Select cells in the grid, then assign hours and days using the bid button. Cells are selected by clicking. Click day or hour label to select whole row or column. Use shift-click (on cells, rows or columns) to select a range.
          </p>
          <DayHourGrid disabled={!writeAccess} data={dayHour} onChange={dayHourChange} />
        </Form.Group>
      </div>
    </div>
    <div className="row no-gutters">
      <div className="col-lg-6 px-1">
        <Loader visible={showLoader} loaderClass="loading-input" />
        {!showLoader &&
          <Form.Group>
            <Form.Label>Campaign group</Form.Label>
            <Select
              isDisabled={!writeAccess}
              inputId="settings-general-campaigngroup"
              className="react-select-container"
              classNamePrefix="react-select"
              clearable={false}
              value={campaignGroups.find((o) => { return o.value === clusterId })}
              onChange={handleCampaigngroupChange}
              options={campaignGroups}
            />
          </Form.Group>
        }
      </div>
    </div>
    <div className="row no-gutters">
      <div className="col-lg-12 px-1">
        <Form.Group controlId="settings-general-remarks">
          <Form.Label>Campaign remarks</Form.Label>
          <Form.Control as="textarea"
            disabled={!writeAccess}
            type="text"
            value={remarks}
            rows={6}
            onChange={handleRemarksChange}
          />
        </Form.Group>
      </div>
    </div>
  </SettingsBox>
}
export default GeneralBox;