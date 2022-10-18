import React, { Fragment, useState, useEffect } from "react";
import { Form, InputGroup } from "react-bootstrap";
import Select from "react-select";
import Datetime from "react-datetime";
import NumberFormat from "react-number-format";
import * as _ from "lodash";
import momentPropTypes from "react-moment-proptypes";
import moment from "moment";
import * as Api from "../../../../../client/Api";
import * as Helper from "../../../../../client/Helper";
import * as CampaignHelper from "../../../../../client/CampaignHelper";
import * as Validation from "../../../../../client/Validation";
import { ScopeType, SelectOption, ValidationError } from "../../../../../client/schemas";
import Loader from "../../../../UI/Loader";
import { CampaignGroup } from "../../../../../models/data/CampaignGroup";
import { ScopeData } from "../../../../../models/Common";
import { Campaign } from "../../../../../models/data/Campaign";
import { BudgetPeriod, ExistingCampaign } from "../../../../../client/campaignSchemas";
import FontIcon from "../../../../UI/FontIcon";

interface CampaignExistingFormProps {
  advertisers: SelectOption[];
  scope: ScopeType;
  data: ScopeData;
  submit: boolean;
  onClone: (error: boolean, data: ExistingCampaign) => void;
}

const CampaignExistingForm = (props: CampaignExistingFormProps) => {
  const [name, setName] = useState<string>("");
  const [startDate, setStartDate] = useState<momentPropTypes.momentObj>(moment().startOf('day'));
  const [endDate, setEndDate] = useState<momentPropTypes.momentObj | null>(moment().add(1, 'months').endOf('day'));
  const [budget, setBudget] = useState<number>(null);
  const [budgetPeriod, setBudgetPeriod] = useState<BudgetPeriod>("campaign");
  const [advertiserId, setAdvertiserId] = useState<number>(-1);
  const [campaignId, setCampaignId] = useState<number>(-1);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [campaignsLoader, setCampaignsLoader] = useState<boolean>(true);
  const [clusterId, setClusterId] = useState<number>(-1);
  const [campaigngroups, setCampaigngroups] = useState<SelectOption[]>([]);
  const [campaigngroupsLoader, setCampaigngroupsLoader] = useState<boolean>(true);
  const [nameValidation, setNameValidation] = useState<ValidationError>({ error: false, message: "" });
  const [periodValidation, setPeriodValidation] = useState<ValidationError>({ error: false, message: "" });
  const [budgetValidation, setBudgetValidation] = useState<ValidationError>({ error: false, message: "" });

  useEffect(() => {
    setAdvertiserId(props.advertisers.length > 0 ? props.advertisers[0].value as number : -1);
  }, [props.advertisers.length]);

  useEffect(() => {
    loadCampaigns();
    loadCampaigngroups();
  }, [advertiserId]);

  useEffect(() => {
    loadCampaignFields();
    loadCampaignConstraints();
  }, [campaignId]);

  useEffect(submitForm, [props.submit]);

  async function loadCampaigns() {
    setCampaignsLoader(true);
    const campaigns = await getCampaigns(advertiserId);
    setCampaigns(campaigns);
    if (campaigns.length > 0) {
      setCampaignId(campaigns[0].campaign.id);
    } else {
      setCampaignId(-1);
    }
    setCampaignsLoader(false);
  }

  async function getCampaigns(advertiserId: number): Promise<Campaign[]> {
    try {
      if (advertiserId > 0) {
        const qs = Helper.scopedParam({ scope: "advertiser", scopeId: advertiserId });
        const campaigns = await Api.Get({ path: "/api/campaigns", qs });
        return campaigns;
      } else {
        return [];
      }
    } catch (err) {
      console.log(err);
      return [];
    }
  }

  function getCampaignOptions() {
    return campaigns.map((o) => { return { value: o.campaign.id, label: o.campaign.name } });
  }

  function loadCampaignFields() {
    const campaignData = campaigns.find((o) => { return o.campaign.id === campaignId });
    if (campaignData) {
      const campaign = campaignData.campaign;
      setName(`Copy of ${campaign.name}`);
      if (props.scope !== "campaigngroup") {
        const clusterId = campaign.clusterId ? campaign.clusterId : -1;
        setClusterId(clusterId);
      }
      if (campaign.startTime > moment().unix()) {
        setStartDate(moment.unix(campaign.startTime));
        setEndDate(moment.unix(campaign.endTime));
      }
    } else {
      setName("");
      setClusterId(-1);
      setStartDate(moment().startOf('day'));
      setEndDate(moment().add(1, 'months').endOf('day'));
      setBudget(null);
      setBudgetPeriod("campaign");
    }
  }

  async function loadCampaignConstraints() {
    if (campaignId > 0) {
      try {
        const constraints = await Api.Get({ path: `/api/campaigns/${campaignId}/constraint` });
        const budgetFields = CampaignHelper.getBudgetFields(constraints);
        if (budgetFields) {
          setBudget(budgetFields.budget);
          setBudgetPeriod(budgetFields.budgetPeriod);
        }
      } catch (err) {
        console.log(err);
      }
    }
  }

  async function loadCampaigngroups() {
    setCampaigngroupsLoader(true);
    if (props.scope === "campaigngroup") {
      const campaigngroup = _.get(props.data as CampaignGroup, "campaignGroup");
      if (campaigngroup) {
        const campaigngroups = [{ value: campaigngroup.id, label: campaigngroup.name }];
        setCampaigngroups(campaigngroups);
        setClusterId(campaigngroup.id);
      }
    } else {
      const campaigngroups = await CampaignHelper.campaigngroupOptions(advertiserId);
      setCampaigngroups(campaigngroups);
      setClusterId(-1);
    }
    setCampaigngroupsLoader(false);
  }

  const handleAdvertiserChange = (selected) => {
    setAdvertiserId(selected.value as number);
  }

  const handleCampaignChange = (selected) => {
    setCampaignId(selected.value as number);
  }

  const handleCampaigngroupChange = (selected) => {
    setClusterId(selected.value as number);
  }

  const handleNameChange = (e) => {
    const name = e.target.value;
    const nameValidation = Validation.required(name);
    setName(name);
    setNameValidation(nameValidation);
  }

  const handleStartDateChange = (date) => {
    setStartDate(date);
  }

  const handleEndDateChange = (date) => {
    setEndDate(date);
  }

  const handleBudgetChange = (values) => {
    const budget = _.get(values, "floatValue") as number;
    const budgetValidation = getBudgetValidation(budget);
    setBudget(budget);
    setBudgetValidation(budgetValidation);
  }

  const handleBudgetPeriodChange = (selected) => {
    const budgetPeriod = selected.value as BudgetPeriod;
    setBudgetPeriod(budgetPeriod);
  }

  function getPeriodValidation() {
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

  function getBudgetValidation(budget) {
    if (!budget) {
      return { error: true, message: "Please fill out this field." };
    } else {
      return { error: false, message: "" };
    }
  }

  function submitForm() {
    if (props.submit) {
      const nameValidation = Validation.required(name);
      const periodValidation = getPeriodValidation();
      const budgetValidation = getBudgetValidation(budget);
      setNameValidation(nameValidation);
      setPeriodValidation(periodValidation);
      setBudgetValidation(budgetValidation);

      if (nameValidation.error || periodValidation.error || budgetValidation.error) {
        props.onClone(true, null);
      } else {
        props.onClone(false, {
          name,
          campaignId,
          startTime: startDate.unix(),
          endTime: endDate.unix(),
          budget,
          budgetPeriod,
          clusterId
        });
      }
    }
  }

  const campaignOptions = getCampaignOptions();
  const budgetPeriodOptions = CampaignHelper.budgetPeriodOptions();
  const budgetInputClass = budgetValidation.error ? "form-control is-invalid" : "form-control";
  return <Fragment>
    <div className="row no-gutters">
      <div className="col-lg-6 px-1">
        <Form.Group>
          <Form.Label>Advertiser</Form.Label>
          <Select
            inputId="campaign-existing-advertiser"
            className="react-select-container"
            classNamePrefix="react-select"
            clearable={false}
            value={props.advertisers.find((o) => { return o.value === advertiserId })}
            onChange={handleAdvertiserChange}
            options={props.advertisers}
          />
        </Form.Group>
      </div>
      <div className="col-lg-6 px-1">
        <Loader visible={campaignsLoader} loaderClass="loading-input" />
        {!campaignsLoader &&
          <Form.Group>
            <Form.Label>Campaign</Form.Label>
            <Select
              inputId="campaign-existing-campaign"
              className="react-select-container"
              classNamePrefix="react-select"
              clearable={false}
              value={campaignOptions.find((o) => { return o.value === campaignId })}
              onChange={handleCampaignChange}
              options={campaignOptions}
            />
          </Form.Group>
        }
      </div>
    </div>
    <div className="row no-gutters">
      <div className="col-lg-12 px-1"><hr /></div>
    </div>
    <div className="row no-gutters">
      <div className="col-lg-12 px-1">
        <Form.Group controlId="campaign-existing-name">
          <Form.Label>Name *</Form.Label>
          <Form.Control
            type="text"
            value={name}
            isInvalid={nameValidation.error}
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
            dateFormat="YYYY-MM-DD"
            timeFormat="HH:mm"
            onChange={handleStartDateChange}
            value={startDate}
          />
          {periodValidation.error && <Form.Control.Feedback type="invalid">{periodValidation.message}</Form.Control.Feedback>}
        </InputGroup>
      </div>
      <div className="col-lg-6 px-1 pb-2">
        <Form.Label>End date *</Form.Label>
        <InputGroup>
          <InputGroup.Prepend>
            <InputGroup.Text><FontIcon name="calendar" /></InputGroup.Text>
          </InputGroup.Prepend>
          <Datetime
            dateFormat="YYYY-MM-DD"
            timeFormat="HH:mm"
            onChange={handleEndDateChange}
            value={endDate}
          />
        </InputGroup>
      </div>
    </div>
    <div className="row no-gutters">
      <div className="col-lg-6 px-1">
        <Form.Label>Budget *</Form.Label>
        <InputGroup>
          <InputGroup.Prepend>
            <InputGroup.Text>€</InputGroup.Text>
          </InputGroup.Prepend>
          <NumberFormat
            id="campaign-existing-budget"
            className={budgetInputClass}
            value={budget}
            thousandSeparator={true}
            allowNegative={false}
            allowLeadingZeros={false}
            decimalScale={2}
            onValueChange={handleBudgetChange}
          />
          {budgetValidation.error && <Form.Control.Feedback type="invalid">{budgetValidation.message}</Form.Control.Feedback>}
        </InputGroup>
      </div>
      <div className="col-lg-6 px-1">
        <Form.Group style={{ marginTop: "27px" }}>
          <Select
            inputId="campaign-existing-budget-period"
            className="react-select-container"
            classNamePrefix="react-select"
            clearable={false}
            value={budgetPeriodOptions.find((o) => { return o.value === budgetPeriod })}
            onChange={handleBudgetPeriodChange}
            options={budgetPeriodOptions}
          />
        </Form.Group>
      </div>
    </div>
    <div className="row no-gutters">
      <div className="col-lg-6 px-1">
        <Loader visible={campaigngroupsLoader} loaderClass="loading-input" />
        {!campaigngroupsLoader &&
          <Form.Group>
            <Form.Label>Campaign group</Form.Label>
            <Select
              inputId="campaign-existing-campaigngroup"
              className="react-select-container"
              classNamePrefix="react-select"
              clearable={false}
              value={campaigngroups.find((o) => { return o.value === clusterId })}
              onChange={handleCampaigngroupChange}
              options={campaigngroups}
            />
          </Form.Group>
        }
      </div>
    </div>
  </Fragment>;
}
export default CampaignExistingForm;