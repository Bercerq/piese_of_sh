import React, { useState, useEffect, Fragment } from "react";
import { Form, InputGroup } from "react-bootstrap";
import Select from "react-select";
import Datetime from "react-datetime";
import NumberFormat from "react-number-format";
import * as _ from "lodash";
import momentPropTypes from "react-moment-proptypes";
import moment from "moment";
import { RetailBranch } from "../../../../../models/data/RetailBranch";
import { BudgetPeriod, CampaignAdType, CampaignType, NewCampaign } from "../../../../../client/campaignSchemas";
import * as Api from "../../../../../client/Api";
import * as CampaignHelper from "../../../../../client/CampaignHelper";
import * as Validation from "../../../../../client/Validation";
import { ScopeType, SelectOption, ValidationError } from "../../../../../client/schemas";
import { ScopeData } from "../../../../../models/Common";
import { CampaignGroup } from "../../../../../models/data/CampaignGroup";
import Loader from "../../../../UI/Loader";
import RetailBranchesSelectTable from "./RetailBranchesSelectTable";
import { BiddingType, RevenueType } from "../../../../../models/data/Campaign";
import FontIcon from "../../../../UI/FontIcon";

interface CampaignNewFormProps {
  videoMode: boolean;
  advertisers: SelectOption[];
  scope: ScopeType;
  data: ScopeData;
  submit: boolean;
  onCreate: (error: boolean, data: NewCampaign) => void;
}

const CampaignNewForm = (props: CampaignNewFormProps) => {
  const [name, setName] = useState<string>("");
  const [startDate, setStartDate] = useState<momentPropTypes.momentObj>(moment().startOf('day'));
  const [endDate, setEndDate] = useState<momentPropTypes.momentObj | null>(moment().add(1, 'months').endOf('day'));
  const [budget, setBudget] = useState<number>(null);
  const [budgetPeriod, setBudgetPeriod] = useState<BudgetPeriod>("campaign");
  const [adType, setAdType] = useState<CampaignAdType>(props.videoMode ? "video" : "display");
  const [biddingType, setBiddingType] = useState<BiddingType>("RTB");
  const [campaignType, setCampaignType] = useState<CampaignType>("prospecting");
  const [revenueType, setRevenueType] = useState<RevenueType>(props.videoMode ? 1 : 2);
  const [advertiserId, setAdvertiserId] = useState<number>(-1);
  const [retailBranches, setRetailBranches] = useState<number[]>([]);
  const [advertiserRetailBranches, setAdvertiserRetailBranches] = useState<RetailBranch[]>([]);
  const [retailBranchesLoader, setRetailBranchesLoader] = useState<boolean>(true);
  const [campaigngroups, setCampaigngroups] = useState<SelectOption[]>([]);
  const [campaigngroupsLoader, setCampaigngroupsLoader] = useState<boolean>(true);
  const [clusterId, setClusterId] = useState<number>(-1);
  const [nameValidation, setNameValidation] = useState<ValidationError>({ error: false, message: "" });
  const [periodValidation, setPeriodValidation] = useState<ValidationError>({ error: false, message: "" });
  const [budgetValidation, setBudgetValidation] = useState<ValidationError>({ error: false, message: "" });

  const isRetail = CampaignHelper.isRetail(campaignType);

  useEffect(() => {
    setAdvertiserId(props.advertisers.length > 0 ? props.advertisers[0].value as number : -1);
  }, [props.advertisers.length]);

  useEffect(() => {
    loadCampaigngroups();
  }, [advertiserId]);

  useEffect(() => {
    loadAdvertiserRetailBranches();
  }, [JSON.stringify({ advertiserId, isRetail })]);

  useEffect(submitForm, [props.submit]);

  const handleNameChange = (e) => {
    const name = e.target.value;
    const nameValidation = Validation.native(e.target);
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

  const handleAdTypeChange = (e) => {
    if (e.target.checked) {
      const adType = e.target.value as CampaignAdType;
      setAdType(adType);
      if (adType === "video") {
        setBiddingType("RTB");
        setRevenueType(1);
      } else {
        setRevenueType(2);
      }
    }
  }

  const handleBiddingTypeChange = (e) => {
    if (e.target.checked) {
      const biddingType = e.target.value as BiddingType;
      setBiddingType(e.target.value as BiddingType);
      if (biddingType === "Adserving" && campaignType === "retargeting") {
        setCampaignType("prospecting");
      }
    }
  }

  const handleCampaignTypeChange = (e) => {
    if (e.target.checked) {
      setCampaignType(e.target.value as CampaignType);
    }
  }

  const handleRevenueTypeChange = (e) => {
    if (e.target.checked) {
      const revenueType = parseInt(e.target.value) as RevenueType;
      setRevenueType(revenueType);
    }
  }

  const handleAdvertiserChange = (selected) => {
    setAdvertiserId(selected.value as number);
  }

  const handleCampaigngroupChange = (selected) => {
    setClusterId(selected.value as number);
  }

  const handleRetailBranchesChange = (retailBranches: number[]) => {
    setRetailBranches(retailBranches);
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

  async function loadAdvertiserRetailBranches() {
    if (isRetail && advertiserId > 0) {
      setRetailBranchesLoader(true);
      const advertiserRetailBranches = await Api.Get({ path: `/api/advertisers/${advertiserId}/retailbranches` });
      setAdvertiserRetailBranches(advertiserRetailBranches);
      setRetailBranchesLoader(false);
    }
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
      const nameInput = document.getElementById("campaign-new-name") as HTMLInputElement;
      const nameValidation = Validation.native(nameInput);
      const periodValidation = getPeriodValidation();
      const budgetValidation = getBudgetValidation(budget);
      setNameValidation(nameValidation);
      setPeriodValidation(periodValidation);
      setBudgetValidation(budgetValidation);

      if (nameValidation.error || periodValidation.error || budgetValidation.error) {
        props.onCreate(true, null);
      } else {
        props.onCreate(false, {
          name,
          startTime: startDate.unix(),
          endTime: endDate.unix(),
          budget,
          budgetPeriod,
          adType,
          biddingType,
          campaignType,
          revenueType,
          advertiserId,
          clusterId,
          retailBranches
        });
      }
    }
  }

  const budgetPeriodOptions = CampaignHelper.budgetPeriodOptions();
  const adTypeOptions = CampaignHelper.adTypeOptions();
  const biddingTypeOptions = CampaignHelper.biddingTypeOptions();
  const campaignTypeOptions = CampaignHelper.campaignTypeOptions(biddingType);
  const revenueTypeOptions = CampaignHelper.revenueTypeOptions(adType === "video");
  const budgetInputClass = budgetValidation.error ? "form-control is-invalid" : "form-control";

  return <Fragment>
    <div className="row no-gutters">
      <div className="col-lg-12 px-1">
        <Form.Group controlId="campaign-new-name">
          <Form.Label>Name *</Form.Label>
          <Form.Control
            type="text"
            value={name}
            isInvalid={nameValidation.error}
            onChange={handleNameChange}
            required={true}
            maxLength={200}
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
            id="campaign-new-budget"
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
            inputId="campaign-new-budget-period"
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
      <div className="col-lg-12 px-1">
        <Form.Group>
          <Form.Label className="width-100">Ad type</Form.Label>
          {
            adTypeOptions.map((o, i) => <Form.Check inline
              id={`campaign-new-adtype-${o.value}`}
              type="radio"
              value={o.value}
              name="campaign-new-adtype"
              checked={o.value === adType}
              onChange={handleAdTypeChange}
              label={o.label} />)
          }
        </Form.Group>
      </div>
      <div className="col-lg-12 px-1">
        <Form.Group>
          <Form.Label className="width-100">Delivery type</Form.Label>
          {
            biddingTypeOptions.map((o, i) => <Form.Check inline
              id={`campaign-new-biddingtype-${o.value}`}
              disabled={adType === "video"}
              type="radio"
              value={o.value}
              name="campaign-new-biddingtype"
              checked={o.value === biddingType}
              onChange={handleBiddingTypeChange}
              label={o.label} />)
          }
        </Form.Group>
      </div>
      <div className="col-lg-12 px-1">
        <Form.Group>
          <Form.Label className="width-100">Campaign type</Form.Label>
          {
            campaignTypeOptions.map((o, i) => <Form.Check inline
              id={`campaign-new-campaigntype-${o.value}`}
              type="radio"
              value={o.value}
              name="campaign-new-campaigntype"
              checked={o.value === campaignType}
              onChange={handleCampaignTypeChange}
              label={o.label} />)
          }
        </Form.Group>
      </div>
      <div className="col-lg-12 px-1">
        <Form.Group>
          <Form.Label className="width-100">Optimize</Form.Label>
          {
            revenueTypeOptions.map((o, i) => <Form.Check inline
              id={`campaign-new-optimizationtype-${o.value}`}
              type="radio"
              value={o.value}
              name="campaign-new-optimizationtype"
              checked={o.value === revenueType.toString()}
              onChange={handleRevenueTypeChange}
              label={o.label} />)
          }
        </Form.Group>
      </div>
    </div>
    <div className="row no-gutters">
      <div className="col-lg-6 px-1">
        <Form.Group>
          <Form.Label>Advertiser</Form.Label>
          <Select
            inputId="campaign-new-advertiser"
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
        <Loader visible={campaigngroupsLoader} loaderClass="loading-input" />
        {!campaigngroupsLoader &&
          <Form.Group>
            <Form.Label>Campaign group</Form.Label>
            <Select
              inputId="campaign-new-campaigngroup"
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
    {isRetail &&
      <div className="row no-gutters">
        <div className="col-lg-12 px-1">
          <Form.Label className="pull-left">Retail branches</Form.Label>
          <Loader visible={retailBranchesLoader} />
          {!retailBranchesLoader &&
            <RetailBranchesSelectTable
              records={advertiserRetailBranches}
              onChange={handleRetailBranchesChange}
            />
          }
        </div>
      </div>
    }
  </Fragment>;
}
export default CampaignNewForm;