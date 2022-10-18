import React, { useState, useEffect } from "react";
import { Form, InputGroup, Alert } from "react-bootstrap";
import Select from "react-select";
import NumberFormat from "react-number-format";
import * as _ from "lodash";
import * as CampaignHelper from "../../../../../../client/CampaignHelper";
import { BudgetBoxFormData, BudgetBoxProps, BudgetPeriod, ImpressionsPeriod } from "../../../../../../client/campaignSchemas";
import SettingsBox from "../shared/SettingsBox";
import { ValidationError } from "../../../../../../client/schemas";
import Checkbox from "../../../../../UI/Checkbox";
import FontIcon from "../../../../../UI/FontIcon";

const BudgetBox = (props: BudgetBoxProps) => {
  const [budget, setBudget] = useState<number>(props.budget);
  const [budgetPeriod, setBudgetPeriod] = useState<BudgetPeriod>(props.budgetPeriod);
  const [maxBidPrice, setMaxBidPrice] = useState<number>(props.maxBidPrice);
  const [floorPriceOnly, setFloorPriceOnly] = useState<boolean>(props.floorPriceOnly);
  const [fixedBidPrice, setFixedBidPrice] = useState<boolean>(props.fixedBidPrice);
  const [impressions, setImpressions] = useState<number>(props.impressions);
  const [impressionsPeriod, setImpressionsPeriod] = useState<ImpressionsPeriod>(props.impressionsPeriod);
  const [budgetValidation, setBudgetValidation] = useState<ValidationError>({ error: false, message: "" });
  const [maxBidPriceValidation, setMaxBidPriceValidation] = useState<ValidationError>({ error: false, message: "" });

  const submitData = getSubmitData();
  const isValid = getIsValid();

  useEffect(loadForm, [props.id]);

  useEffect(() => { props.onChange(submitData, isValid); }, [JSON.stringify(submitData), isValid]);

  function loadForm() {
    setBudget(props.budget);
    setBudgetPeriod(props.budgetPeriod);
    setMaxBidPrice(props.maxBidPrice);
    setFloorPriceOnly(props.floorPriceOnly);
    setFixedBidPrice(props.fixedBidPrice);
    setImpressions(props.impressions);
    setImpressionsPeriod(props.impressionsPeriod);
    setBudgetValidation({ error: false, message: "" });
    setMaxBidPriceValidation({ error: false, message: "" });
  }

  function getSubmitData(): BudgetBoxFormData {
    return {
      budget,
      budgetPeriod,
      maxBidPrice,
      floorPriceOnly,
      fixedBidPrice,
      impressions,
      impressionsPeriod
    };
  }

  function getIsValid() {
    return !(budgetValidation.error || maxBidPriceValidation.error);
  }

  function getNumberFormatValidation(value) {
    if (!value) {
      return { error: true, message: "Please fill out this field." };
    } else {
      return { error: false, message: "" };
    }
  }

  const handleBudgetChange = (values) => {
    const budget = _.get(values, "floatValue") as number;
    const budgetValidation = getNumberFormatValidation(budget);
    setBudget(budget);
    setBudgetValidation(budgetValidation);
  }

  const handleBudgetPeriodChange = (selected) => {
    const budgetPeriod = selected.value as BudgetPeriod;
    setBudgetPeriod(budgetPeriod);
  }

  const handleMaxBidPriceChange = (values) => {
    const maxBidPrice = _.get(values, "floatValue") as number;
    const maxBidPriceValidation = getNumberFormatValidation(maxBidPrice);
    setMaxBidPrice(maxBidPrice);
    setMaxBidPriceValidation(maxBidPriceValidation);
  }

  const handleFloorPriceOnlyChange = (checked: boolean) => {
    setFloorPriceOnly(checked);
    if (fixedBidPrice) {
      setFixedBidPrice(false);
    }
  }

  const handleFixedBidPriceChange = (checked: boolean) => {
    setFixedBidPrice(checked);
    if (floorPriceOnly) {
      setFloorPriceOnly(false);
    }
  }

  const handleImpressionsChange = (values) => {
    const impressions = _.get(values, "floatValue") as number;
    setImpressions(impressions);
  }

  const handleImpressionsPeriodChange = (selected) => {
    const impressionsPeriod = selected.value as ImpressionsPeriod;
    setImpressionsPeriod(impressionsPeriod);
  }

  const budgetInputClass = budgetValidation.error ? "form-control is-invalid" : "form-control";
  const maxBidPriceInputClass = maxBidPriceValidation.error ? "form-control is-invalid" : "form-control";
  const budgetPeriodOptions = CampaignHelper.budgetPeriodOptions();
  const impressionsPeriodOptions = CampaignHelper.impressionsPeriodOptions();
  const writeAccess = props.rights.MANAGE_CAMPAIGN || false;

  return <SettingsBox title="Budget">
    <div className="row no-gutters">
      <div className="col-lg-6 px-1">
        <Form.Label>Budget *</Form.Label>
        <InputGroup>
          <InputGroup.Prepend>
            <InputGroup.Text>€</InputGroup.Text>
          </InputGroup.Prepend>
          <NumberFormat
            disabled={!writeAccess}
            id="settings-budget-budget"
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
            isDisabled={!writeAccess}
            inputId="settings-budget-budget-period"
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
        <Form.Label>Max bidprice (CPM)</Form.Label>
        <InputGroup>
          <InputGroup.Prepend>
            <InputGroup.Text>€</InputGroup.Text>
          </InputGroup.Prepend>
          <NumberFormat
            disabled={!writeAccess}
            id="settings-budget-maxbidprice"
            className={maxBidPriceInputClass}
            value={maxBidPrice}
            thousandSeparator={true}
            allowNegative={false}
            allowLeadingZeros={false}
            decimalScale={2}
            fixedDecimalScale={true}
            onValueChange={handleMaxBidPriceChange}
          />
          {maxBidPriceValidation.error && <Form.Control.Feedback type="invalid">{maxBidPriceValidation.message}</Form.Control.Feedback>}
        </InputGroup>
      </div>
      <div className="col-lg-6 px-1">
        <Form.Group style={{ marginTop: "33px" }}>
          <Checkbox disabled={!writeAccess} classes="d-inline-block mr-2" id="settings-budget-floorpriceonly" checked={floorPriceOnly} onChange={handleFloorPriceOnlyChange}>On deals bid external floor price</Checkbox>
          <Checkbox disabled={!writeAccess} classes="d-inline-block" id="settings-budget-fixedbidprice" checked={fixedBidPrice} onChange={handleFixedBidPriceChange}>Fixed bid price only</Checkbox>
        </Form.Group>
      </div>
      <div className="col-lg-12 px-1">
        {floorPriceOnly &&
          <Alert variant="warning">
            <FontIcon name="warning" /> Only use this option if your campaign uses a pre made deal managed in an external system. This can be useful if the floor price of this deal is managed in a different currency, which may cause small variations in the euro floor price.
          </Alert>
        }
        {fixedBidPrice &&
          <Alert variant="warning">
            <FontIcon name="warning" /> Using a fixed bid price disables dynamic bidding based on campaign pacing and performance. Using a fixed bid price does not increase likelihood of winning impressions and is typically not recommended.
          </Alert>
        }
      </div>
    </div>
    <div className="row no-gutters">
      <div className="col-lg-6 px-1">
        <Form.Label>Max impressions</Form.Label>
        <Form.Group>
          <NumberFormat
            disabled={!writeAccess}
            id="settings-budget-impressions"
            className="form-control"
            value={impressions}
            thousandSeparator={true}
            allowNegative={false}
            allowLeadingZeros={false}
            decimalScale={0}
            onValueChange={handleImpressionsChange}
          />
        </Form.Group>
      </div>
      <div className="col-lg-6 px-1">
        <Form.Group style={{ marginTop: "27px" }}>
          <Select
            isDisabled={!writeAccess}
            inputId="settings-budget-impressions-period"
            className="react-select-container"
            classNamePrefix="react-select"
            clearable={false}
            value={impressionsPeriodOptions.find((o) => { return o.value === impressionsPeriod })}
            onChange={handleImpressionsPeriodChange}
            options={impressionsPeriodOptions}
          />
        </Form.Group>
      </div>
    </div>
  </SettingsBox>;
}
export default BudgetBox;