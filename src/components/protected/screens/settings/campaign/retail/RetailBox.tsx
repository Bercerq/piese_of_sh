import React, { useState, useEffect } from "react";
import { Form, InputGroup, Alert, Button } from "react-bootstrap";
import Select from "react-select";
import NumberFormat from "react-number-format";
import * as _ from "lodash";
import * as Utils from "../../../../../../client/Utils";
import * as CampaignHelper from "../../../../../../client/CampaignHelper";
import * as ExcelHelper from "../../../../../../client/ExcelHelper";
import { BudgetPeriod, ImpressionsPeriod, RetailBoxFormData } from "../../../../../../client/campaignSchemas";
import { ValidationError } from "../../../../../../client/schemas";
import Checkbox from "../../../../../UI/Checkbox";
import FontIcon from "../../../../../UI/FontIcon";
import { RetailBoxProps } from "../../../../../../client/campaignSchemas";
import SettingsBox from "../shared/SettingsBox";
import { RetailStrategy } from "../../../../../../models/data/Campaign";
import RetailStrategiesTable from "./RetailStrategiesTable";
import Loader from "../../../../../UI/Loader";
import AddRetailStrategiesModal from "./AddRetailStrategiesModal";
import RetailStrategyModal from "./RetailStrategyModal";
import RetailStrategiesImportModal from "./RetailStrategiesImportModal";

const RetailBox = (props: RetailBoxProps) => {
  const [budget, setBudget] = useState<number>(props.budget);
  const [budgetPeriod, setBudgetPeriod] = useState<BudgetPeriod>(props.budgetPeriod);
  const [maxBidPrice, setMaxBidPrice] = useState<number>(props.maxBidPrice);
  const [floorPriceOnly, setFloorPriceOnly] = useState<boolean>(props.floorPriceOnly);
  const [fixedBidPrice, setFixedBidPrice] = useState<boolean>(props.fixedBidPrice);
  const [impressions, setImpressions] = useState<number>(props.impressions);
  const [impressionsPeriod, setImpressionsPeriod] = useState<ImpressionsPeriod>(props.impressionsPeriod || "campaign");
  const [retailStrategies, setRetailStrategies] = useState<RetailStrategy[]>([]);
  const [editRetailStrategy, setEditRetailStrategy] = useState<RetailStrategy>(null);
  const [budgetValidation, setBudgetValidation] = useState<ValidationError>({ error: false, message: "" });
  const [maxBidPriceValidation, setMaxBidPriceValidation] = useState<ValidationError>({ error: false, message: "" });
  const [showLoader, setShowLoader] = useState<boolean>(true);
  const [showAddRetailStrategiesModal, setShowAddRetailStrategiesModal] = useState<boolean>(false);
  const [showEditModal, setShowEditModal] = useState<boolean>(false);
  const [showImportModal, setShowImportModal] = useState<boolean>(false);

  const submitData = getSubmitData();
  const isValid = getIsValid();

  useEffect(loadForm, [props.id]);

  useEffect(() => { props.onChange(submitData, isValid); }, [JSON.stringify(submitData), isValid]);

  useEffect(() => { setShowLoader(false); }, [JSON.stringify(retailStrategies)]);

  function loadForm() {
    setBudget(props.budget);
    setBudgetPeriod(props.budgetPeriod);
    setMaxBidPrice(props.maxBidPrice);
    setFloorPriceOnly(props.floorPriceOnly);
    setFixedBidPrice(props.fixedBidPrice);
    setImpressions(props.impressions);
    setImpressionsPeriod(props.impressionsPeriod || "campaign");
    setRetailStrategies(_.cloneDeep(props.retailStrategies));
    setBudgetValidation({ error: false, message: "" });
    setMaxBidPriceValidation({ error: false, message: "" });
    setShowAddRetailStrategiesModal(false);
    setShowEditModal(false);
    setShowImportModal(false);
  }

  function getSubmitData(): RetailBoxFormData {
    const retailStrategiesToSubmit = retailStrategies.map((o) => {
      return _.omit(o, "retailBranch");
    });
    return {
      budget,
      budgetPeriod,
      maxBidPrice,
      floorPriceOnly,
      fixedBidPrice,
      impressions,
      impressionsPeriod,
      retailStrategies: retailStrategiesToSubmit
    }
  }

  function getIsValid(): boolean {
    return !(budgetValidation.error || maxBidPriceValidation.error);
  }

  function getTitle() {
    return props.structure === "RETAIL_GPS" ? "Retail - GPS based" : "Retail - Postal code based";
  }

  function getNumberFormatValidation(value) {
    if (!value) {
      return { error: true, message: "Please fill out this field." };
    } else {
      return { error: false, message: "" };
    }
  }

  const handleBudgetChange = (values) => {
    const budgetValue = _.get(values, "floatValue") as number;
    const budgetValidation = getNumberFormatValidation(budgetValue);
    setBudget(budgetValue);
    setBudgetValidation(budgetValidation);
    updateRetailStrategiesConstraint("budget", budgetValue);
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
    const newImpressions = _.get(values, "floatValue") as number;
    updateRetailStrategiesConstraint("impressionCap", newImpressions);
    setImpressions(newImpressions);
  }

  const handleImpressionsPeriodChange = (selected) => {
    const impressionsPeriod = selected.value as ImpressionsPeriod;
    setImpressionsPeriod(impressionsPeriod);
  }

  const handleDelete = (deleteId: number) => {
    setShowLoader(true);
    const updatedStrategies = retailStrategies.filter((s) => { return s.retailBranchId !== deleteId; });
    updateConstraint("budget", updatedStrategies);
    updateConstraint("impressionCap", updatedStrategies);
    setRetailStrategies(updatedStrategies);
  }

  const addRetailStrategiesSubmit = (selected: RetailStrategy[]) => {
    const updatedStrategies = retailStrategies.concat(selected);
    updateConstraint("budget", updatedStrategies);
    updateConstraint("impressionCap", updatedStrategies);
    setRetailStrategies(updatedStrategies);
    setShowAddRetailStrategiesModal(false);
  }

  const editClick = (editId: number) => {
    const editRetailStrategy = retailStrategies.find((s) => { return s.retailBranchId === editId; });
    setEditRetailStrategy(editRetailStrategy);
    setShowEditModal(true);
  }

  const retailStrategySubmit = (retailStrategy: RetailStrategy) => {
    const editIndex = retailStrategies.findIndex((s) => { return s.retailBranchId === retailStrategy.retailBranchId });
    if (editIndex > -1) {
      let updatedStrategies = _.cloneDeep(retailStrategies);
      updatedStrategies[editIndex] = retailStrategy;
      if (JSON.stringify(updatedStrategies) !== JSON.stringify(retailStrategies)) {
        setShowLoader(true);
      }
      updateConstraint("budget", updatedStrategies);
      updateConstraint("impressionCap", updatedStrategies);
      setRetailStrategies(updatedStrategies);
    }
    setShowEditModal(false);
  }

  const importSubmit = (toImport: RetailStrategy[]) => {
    if (JSON.stringify(toImport) !== JSON.stringify(retailStrategies)) {
      setShowLoader(true);
    }
    updateConstraint("budget", toImport);
    updateConstraint("impressionCap", toImport);
    setRetailStrategies(toImport);
    setShowImportModal(false);
  }

  const exportClick = () => {
    const targetingField = props.structure === 'RETAIL_GPS' ? "radius" : "targeting postal codes";
    const fields = ["id", "name", "budget", "impressions", "max bid price", targetingField, "landing page", "custom 1", "custom 2", "custom 3", "custom 4", "custom 5", "custom 6", "custom 7", "custom 8", "custom 9"];
    const header = fields.map((value) => { return ExcelHelper.getBoldCell(value); });
    const currencyFormat = ExcelHelper.currencyFormat();
    const sortedRetailStrategies = sortRetailStrategies(_.cloneDeep(retailStrategies));
    const rows = sortedRetailStrategies.map((o) => {
      const targeting = props.structure === 'RETAIL_GPS' ? _.get(o, "geoTargeting.radius") || "" : (_.get(o, "geoTargeting.targetingZipCodes") || []).join(",");
      return [
        ExcelHelper.getCell(_.get(o, "branchId")),
        ExcelHelper.getCell(_.get(o, "retailBranch.name")),
        ExcelHelper.getCell(_.get(o, "campaignConstraints.budget"), null, currencyFormat),
        ExcelHelper.getCell(_.get(o, "campaignConstraints.impressionCap") || ""),
        ExcelHelper.getCell(_.get(o, "campaignConstraints.maxBid"), null, currencyFormat),
        ExcelHelper.getCell(targeting),
        ExcelHelper.getCell(_.get(o, "dynamicAdParameters.urlTag") || ""),
        ExcelHelper.getCell(_.get(o, "dynamicAdParameters.custom1") || ""),
        ExcelHelper.getCell(_.get(o, "dynamicAdParameters.custom2") || ""),
        ExcelHelper.getCell(_.get(o, "dynamicAdParameters.custom3") || ""),
        ExcelHelper.getCell(_.get(o, "dynamicAdParameters.custom4") || ""),
        ExcelHelper.getCell(_.get(o, "dynamicAdParameters.custom5") || ""),
        ExcelHelper.getCell(_.get(o, "dynamicAdParameters.custom6") || ""),
        ExcelHelper.getCell(_.get(o, "dynamicAdParameters.custom7") || ""),
        ExcelHelper.getCell(_.get(o, "dynamicAdParameters.custom8") || ""),
        ExcelHelper.getCell(_.get(o, "dynamicAdParameters.custom9") || ""),
      ];
    });
    const exportData = [header].concat(rows);
    ExcelHelper.save(exportData, "Campaign retail branches", `CampaignRetailBranches_${props.id}`);
  }

  function getIsBranchIdNumeric() {
    const branchIds = retailStrategies.map((o) => { return o.branchId });
    const numericIds = branchIds.filter((id) => { return Utils.isNumeric(id); });
    return branchIds.length === numericIds.length;
  }

  function sortRetailStrategies(exportData) {
    const isBranchIdNumeric = getIsBranchIdNumeric();
    if (isBranchIdNumeric) {
      return exportData.sort(numericSort);
    } else {
      return exportData.sort(stringSort);
    }
  }

  function numericSort(a, b) {
    return parseInt(a.branchId) - parseInt(b.branchId);
  }

  function stringSort(a, b) {
    if (a.branchId < b.branchId) {
      return -1;
    }
    if (a.branchId > b.branchId) {
      return 1;
    }
    return 0;
  }

  function updateRetailStrategiesConstraint(constraint: "budget" | "impressionCap", value: number) {
    const total = _.sumBy(retailStrategies, (o) => { return _.get(o, `campaignConstraints[${constraint}]`, 0); });
    const recalculate = value !== 0 && !_.isNil(value) && total !== value && retailStrategies.length !== 0;
    if (recalculate) {
      const updatedRetailStrategies = retailStrategies.map((s) => {
        let retailStrategy = _.assign({}, s);
        if (total === 0) {
          retailStrategy.campaignConstraints[constraint] = value / retailStrategies.length;
        } else {
          const percentage = retailStrategy.campaignConstraints[constraint] / total;
          retailStrategy.campaignConstraints[constraint] = value * percentage;
        }
        return retailStrategy;
      });
      setRetailStrategies(updatedRetailStrategies);
    }
  }

  function updateConstraint(constraint: "budget" | "impressionCap", retailStrategies: RetailStrategy[]) {
    const total = _.sumBy(retailStrategies, (o) => { return _.get(o, `campaignConstraints[${constraint}]`, 0); });
    if (constraint === "budget") {
      setBudget(total);
    } else {
      setImpressions(total);
    }
  }

  const budgetInputClass = budgetValidation.error ? "form-control is-invalid" : "form-control";
  const maxBidPriceInputClass = maxBidPriceValidation.error ? "form-control is-invalid" : "form-control";
  const budgetPeriodOptions = CampaignHelper.budgetPeriodOptions();
  const impressionsPeriodOptions = CampaignHelper.impressionsPeriodOptions();
  const ids = retailStrategies.map((s) => { return s.retailBranchId });
  const writeAccess = props.rights.MANAGE_CAMPAIGN || false;

  return <SettingsBox title={getTitle()}>
    <div className="row no-gutters">
      <div className="col-lg-6 px-1">
        <Form.Label>Sum of budgets</Form.Label>
        <InputGroup>
          <InputGroup.Prepend>
            <InputGroup.Text>€</InputGroup.Text>
          </InputGroup.Prepend>
          <NumberFormat
            disabled={!writeAccess}
            id="settings-retail-budget"
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
            inputId="settings-retail-budget-period"
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
            id="settings-retail-maxbidprice"
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
          <Checkbox disabled={!writeAccess} classes="d-inline-block mr-2" id="settings-retail-floorpriceonly" checked={floorPriceOnly} onChange={handleFloorPriceOnlyChange}>On deals bid external floor price</Checkbox>
          <Checkbox disabled={!writeAccess} classes="d-inline-block" id="settings-retail-fixedbidprice" checked={fixedBidPrice} onChange={handleFixedBidPriceChange}>Fixed bid price only</Checkbox>
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
        <Form.Label>Sum of impression caps</Form.Label>
        <Form.Group>
          <NumberFormat
            disabled={!writeAccess}
            id="settings-retail-impressions"
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
            inputId="settings-retail-impressions-period"
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
    <div className="row no-gutters">
      <div className="col-lg-12 px-1">
        <h5 className="pull-left">Retail branches</h5>
        <div className="table-btn-container">
          <Button size="sm" disabled={!writeAccess} variant="primary" className="mr-2" onClick={() => { setShowAddRetailStrategiesModal(true) }}><FontIcon name="plus" /> ADD RETAIL BRANCHES</Button>
          <Button size="sm" disabled={!writeAccess} variant="primary" className="mr-2" onClick={() => { setShowImportModal(true) }}><FontIcon name="upload" /> IMPORT</Button>
          <Button size="sm" disabled={!writeAccess} variant="primary" className="mr-2" onClick={exportClick}><FontIcon name="download" /> EXPORT</Button>
        </div>
        <Loader visible={showLoader} />
        {!showLoader &&
          <RetailStrategiesTable
            records={retailStrategies}
            structure={props.structure}
            writeAccess={writeAccess}
            editClick={editClick}
            deleteClick={handleDelete}
          />
        }
      </div>
    </div>
    <AddRetailStrategiesModal
      show={showAddRetailStrategiesModal}
      ids={ids}
      advertiserId={props.advertiserId}
      onClose={() => setShowAddRetailStrategiesModal(false)}
      onSubmit={addRetailStrategiesSubmit}
    />
    <RetailStrategyModal
      show={showEditModal}
      retailStrategy={editRetailStrategy}
      structure={props.structure}
      writeAccess={writeAccess}
      maxBidPrice={maxBidPrice}
      onClose={() => setShowEditModal(false)}
      onSubmit={retailStrategySubmit}
    />
    <RetailStrategiesImportModal
      show={showImportModal}
      structure={props.structure}
      advertiserId={props.advertiserId}
      onClose={() => { setShowImportModal(false) }}
      onSubmit={importSubmit}
    />
  </SettingsBox>
}
export default RetailBox;