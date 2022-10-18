import React, { Fragment, useContext, useEffect, useRef, useState } from "react";
import { useParams, useHistory } from "react-router-dom";
import { Prompt } from "react-router";
import { Nav, Tab, Button, Alert } from "react-bootstrap";
import { useBeforeUnload } from "react-use";
import * as _ from "lodash";
import * as Api from "../../../../client/Api";
import * as Roles from "../../../../modules/Roles";
import * as CampaignHelper from "../../../../client/CampaignHelper";
import * as FEtoBEConverter from "./campaign/FEtoBEConverter";
import { Rights, ScopeDataContextType } from "../../../../models/Common";
import { CampaignEntity, CampaignSettings } from "../../../../models/data/Campaign";
import ScopeDataContext from "../../context/ScopeDataContext";
import GeneralTab from "./campaign/general/GeneralTab";
import RetailTab from "./campaign/retail/RetailTab";
import TargetingTab from "./campaign/targeting/TargetingTab";
import InventoryTab from "./campaign/inventory/InventoryTab";
import AdsTab from "./campaign/ads/AdsTab";
import SegmentsTab from "./campaign/segments/SegmentsTab";
import AdvancedRulesTab from "./campaign/strategies/AdvancedRulesTab";
import SubstrategiesTab from "./campaign/strategies/SubstrategiesTab";
import { AdsTabFormData, AdsTabProps, AdvancedRulesTabFormData, AdvancedRulesTabProps, CampaignFormData, GeneralTabFormData, GeneralTabProps, InventoryTabFormData, InventoryTabProps, RetailTabFormData, RetailTabProps, SegmentsTabFormData, SegmentsTabProps, SubstrategiesBoxProps, SubstrategiesTabFormData, SubstrategiesTabProps, TargetingTabFormData, TargetingTabProps } from "../../../../client/campaignSchemas";
import UserContext from "../../context/UserContext";
import { AppUser } from "../../../../models/AppUser";
import Loader from "../../../UI/Loader";
import CampaignStatusButton from "../../shared/CampaignStatusButton";
import Confirm from "../../../UI/Confirm";
import FontIcon from "../../../UI/FontIcon";

const SettingsCampaign = () => {
  let { page, scope, scopeId, tab }: any = useParams();
  let history = useHistory();
  let { data, loading, loadError, updateReload, updateLoading } = useContext<ScopeDataContextType>(ScopeDataContext);

  const rights: Rights = Roles.getRights(_.get(data as CampaignSettings, "rights"));
  const user: AppUser = useContext<AppUser>(UserContext);
  const campaign: CampaignEntity = _.get(data as CampaignSettings, "campaign");
  const isRetail = CampaignHelper.isRetail(_.get(campaign, "structure"));
  const videoCampaign: boolean = _.get(campaign, "videoCampaign");
  const isAdserving = CampaignHelper.isAdserving(_.get(campaign, "biddingType"));

  const [generalTab, setGeneralTab] = useState<GeneralTabFormData>(null);
  const [targetingTab, setTargetingTab] = useState<TargetingTabFormData>(null);
  const [inventoryTab, setInventoryTab] = useState<InventoryTabFormData>(null);
  const [adsTab, setAdsTab] = useState<AdsTabFormData>(null);
  const [segmentsTab, setSegmentsTab] = useState<SegmentsTabFormData>(null);
  const [advancedRulesTab, setAdvancedRulesTab] = useState<AdvancedRulesTabFormData>(null);
  const [substrategiesTab, setSubstrategiesTab] = useState<SubstrategiesTabFormData>(null);
  const [retailTab, setRetailTab] = useState<RetailTabFormData>(null);
  const [isGeneralValid, setIsGeneralValid] = useState<boolean>(true);
  const [isTargetingValid, setIsTargetingValid] = useState<boolean>(true);
  const [isInventoryValid, setIsInventoryValid] = useState<boolean>(true);
  const [isAdvancedRulesValid, setIsAdvancedRulesValid] = useState<boolean>(true);
  const [isSubstrategiesValid, setIsSubstrategiesValid] = useState<boolean>(true);
  const [isRetailValid, setIsRetailValid] = useState<boolean>(true);
  const [saveError, setSaveError] = useState<string>("");
  const [showSaveErrorAlert, setShowSaveErrorAlert] = useState<boolean>(false);
  const [showStatusConfirm, setShowStatusConfirm] = useState<boolean>(false);
  const [isFormUpdated, setIsFormUpdated] = useState<boolean>(false);

  const isValid = getIsValid();

  useBeforeUnload(isFormUpdated, "There are unsaved changes, are you sure you want to leave?");

  useEffect(() => {
    if (!tab) { //TODO redirect in general if not valid tab
      history.push(`/${page}/${scope}/${scopeId}/general`);
    }
  }, []);

  useEffect(clearState, [scopeId]);
  useEffect(() => { if (loading) clearState(); }, [loading]);

  function clearState() {
    setGeneralTab(null);
    setTargetingTab(null);
    setInventoryTab(null);
    setAdsTab(null);
    setSegmentsTab(null);
    setAdvancedRulesTab(null);
    setSubstrategiesTab(null);
    setRetailTab(null);
    setIsGeneralValid(true);
    setIsTargetingValid(true);
    setIsInventoryValid(true);
    setIsAdvancedRulesValid(true);
    setIsSubstrategiesValid(true);
    setIsRetailValid(true);
    setIsFormUpdated(false);
  }

  const handleTabSelect = (key) => {
    if (key !== tab) {
      history.push(`/${page}/${scope}/${scopeId}/${key}`)
    }
  }

  const handleGeneralTabChange = (generalData: GeneralTabFormData) => {
    if (!_.isNull(generalTab)) {
      setIsFormUpdated(true);
    }
    setGeneralTab(generalData);
  }

  const handleTargetingTabChange = (targetingData: TargetingTabFormData) => {
    if (!_.isNull(targetingTab)) {
      setIsFormUpdated(true);
    }
    setTargetingTab(targetingData);
  }

  const handleInventoryTabChange = (inventoryData: InventoryTabFormData) => {
    if (!_.isNull(inventoryTab)) {
      setIsFormUpdated(true);
    }
    setInventoryTab(inventoryData);
  }

  const handleAdsTabChange = (adsData: AdsTabFormData) => {
    if (!_.isNull(adsTab)) {
      setIsFormUpdated(true);
    }
    setAdsTab(adsData);
  }

  const handleSegmentsTabChange = (segmentsData: SegmentsTabFormData) => {
    if (!_.isNull(segmentsTab)) {
      setIsFormUpdated(true);
    }
    setSegmentsTab(segmentsData);
  }

  const handleAdvancedRulesTabChange = (advancedRulesData: AdvancedRulesTabFormData) => {
    if (!_.isNull(advancedRulesTab)) {
      setIsFormUpdated(true);
    }
    setAdvancedRulesTab(advancedRulesData);
  }

  const handleSubstrategiesTabChange = (substrategiesData: SubstrategiesTabFormData) => {
    if (!_.isNull(substrategiesTab)) {
      setIsFormUpdated(true);
    }
    setSubstrategiesTab(substrategiesData);
  }

  const handleRetailTabChange = (retailData: RetailTabFormData) => {
    if (!_.isNull(retailTab) && retailTab?.retailBox?.retailStrategies && retailTab?.retailBox?.retailStrategies.length > 0) {
      setIsFormUpdated(true);
    }
    setRetailTab(retailData);
  }

  const handleSubmit = async () => {
    await save(false);
  }

  const updateCampaignStatusConfirm = async () => {
    setShowStatusConfirm(false);
    await save(true);
  }

  const exportTags = () => {
    const tags = (_.get(data as CampaignSettings, "settings.tags") || []).filter((tag) => { return tag.finalized; });
    CampaignHelper.exportTags(campaign, tags);
  }

  const cancelClick = () => {
    const fromDashboard = _.get(history, "location.state.fromDashboard") || false;
    if (fromDashboard) {
      history.goBack();
    } else {
      const advertiserId = _.get(campaign, "advertiserId");
      history.push(`/settings/advertiser/${advertiserId}`);
    }
  }

  async function save(updateStatus: boolean) {
    //add submit prop to show the validations in components but get is valid by actually validating the formData
    if (isValid) {
      const formData = getFormData();
      const BEdata = FEtoBEConverter.convert(formData, isRetail, isAdserving, videoCampaign, rights);
      console.log("SAVING ALL! "+ JSON.stringify(BEdata));
      try {
        updateLoading(true);
        await Api.Post({ path: `/api/campaigns/${campaign.id}/settings`, body: BEdata });
        if (updateStatus) {
          const action = campaign.isActive ? "deactivate" : "activate";
          await Api.Post({ path: `/api/campaigns/${campaign.id}/${action}` });
        }
        updateReload(true);
        setSaveError("");
        setShowSaveErrorAlert(false);
      } catch (err) {
        updateReload(true);
        setSaveError("There was an error saving the campaign settings. Try again!");
        setShowSaveErrorAlert(true);
        console.log("err", err);
      }
    }
  }

  function getFormData(): CampaignFormData {
    return {
      generalTab,
      targetingTab,
      inventoryTab,
      adsTab,
      segmentsTab,
      advancedRulesTab,
      substrategiesTab,
      retailTab
    }
  }

  function getIsValid() {
    return isGeneralValid && isTargetingValid && isInventoryValid && isAdvancedRulesValid && isSubstrategiesValid && isRetailValid;
  }

  function getMaxBidPrice() {
    const maxBidPrice = _.get(data, "settings.constraints.maxBidPrice");
    if (isRetail) {
      return _.get(retailTab, "retailBox.maxBidPrice") || maxBidPrice;
    } else {
      return _.get(generalTab, "budgetBox.maxBidPrice") || maxBidPrice;
    }
  }

  function getTabClassName(isTabValid: boolean) {
    return !isTabValid ? "nav-link nav-link-danger" : "nav-link";
  }

  if (loading) {
    return <Loader visible={loading} />
  } else {
    if (campaign && (data as CampaignSettings).settings && !loadError.error) {
      const maxBidPrice = getMaxBidPrice();
      const generalTabProps: GeneralTabProps = { data: data as CampaignSettings, isRetail, rights, onChange: handleGeneralTabChange, onValidate: setIsGeneralValid };
      const targetingTabProps: TargetingTabProps = { data: data as CampaignSettings, rights, onChange: handleTargetingTabChange, onValidate: setIsTargetingValid };
      const inventoryTabProps: InventoryTabProps = { data: data as CampaignSettings, rights, user, isAdserving, maxBidPrice, onChange: handleInventoryTabChange, onValidate: setIsInventoryValid };
      const adsTabProps: AdsTabProps = { data: data as CampaignSettings, rights, isAdserving, dataFeedAllowed: isRetail, onChange: handleAdsTabChange }
      const segmentsTabProps: SegmentsTabProps = { data: data as CampaignSettings, rights, maxBidPrice, onChange: handleSegmentsTabChange }
      const advancedRulesTabProps: AdvancedRulesTabProps = { data: data as CampaignSettings, rights, user, maxBidPrice, onChange: handleAdvancedRulesTabChange, onValidate: setIsAdvancedRulesValid };
      const substrategiesTabProps: SubstrategiesTabProps = { data: data as CampaignSettings, rights, user, maxBidPrice, onChange: handleSubstrategiesTabChange, onValidate: setIsSubstrategiesValid };
      const retailTabProps: RetailTabProps = { data: data as CampaignSettings, rights, onChange: handleRetailTabChange, onValidate: setIsRetailValid };

      return <Fragment>
        <Prompt
          message={(location, action) => {
            const currentPath = `/${page}/${scope}/${scopeId}`;
            const locationPath = location.pathname.split("/", 4).join("/");
            return (currentPath === locationPath || !isFormUpdated) ? true : "There are unsaved changes, are you sure you want to leave?";
          }}
        />
        {!isValid && <Alert variant="danger" className="alert-position">
          <span className="font-weight-bold">Errors in the following sections! </span>
          {!isGeneralValid && <button className="mr-2 btn btn-danger btn-xs" onClick={() => { handleTabSelect("general"); }}>GENERAL</button>}
          {!isTargetingValid && <button className="mr-2 btn btn-danger btn-xs" onClick={() => { handleTabSelect("targeting"); }}>TARGETING</button>}
          {!isInventoryValid && <button className="mr-2 btn btn-danger btn-xs" onClick={() => { handleTabSelect("inventory"); }}>INVENTORY</button>}
          {!isAdvancedRulesValid && <button className="mr-2 btn btn-danger btn-xs" onClick={() => { handleTabSelect("advanced-rules"); }}>ADVANCED RULES</button>}
          {!isSubstrategiesValid && <button className="mr-2 btn btn-danger btn-xs" onClick={() => { handleTabSelect("strategies"); }}>SUB-STRATEGIES</button>}
          {!isRetailValid && <button className="mr-2 btn btn-danger btn-xs" onClick={() => { handleTabSelect("retail"); }}>RETAIL</button>}
        </Alert>}
        {showSaveErrorAlert && <Alert variant="danger" className="alert-position" dismissible={true} onClose={() => { setShowSaveErrorAlert(false) }}>
          <span className="font-weight-bold">{saveError}</span>
        </Alert>}
        <Tab.Container id="campaign-settings-tabs" activeKey={tab || "general"} defaultActiveKey={tab || "general"} onSelect={handleTabSelect}>
          <div className="row page-tabs">
            <Nav as="ul" variant="tabs">
              <Nav.Item as="li">
                <Nav.Link className={getTabClassName(isGeneralValid)} eventKey="general">General</Nav.Link>
              </Nav.Item>
              {isRetail && <Nav.Item as="li">
                <Nav.Link className={getTabClassName(isRetailValid)} eventKey="retail">Retail</Nav.Link>
              </Nav.Item>}
              <Nav.Item as="li">
                <Nav.Link className={getTabClassName(isTargetingValid)} eventKey="targeting">Targeting</Nav.Link>
              </Nav.Item>
              <Nav.Item as="li">
                <Nav.Link className={getTabClassName(isInventoryValid)} eventKey="inventory">Inventory</Nav.Link>
              </Nav.Item>
              {rights.VIEW_ADS && <Nav.Item as="li">
                <Nav.Link className="nav-link" eventKey="ads">Ads</Nav.Link>
              </Nav.Item>}
              {rights.VIEW_SEGMENTS && <Nav.Item as="li">
                <Nav.Link className="nav-link" eventKey="segments">Segments</Nav.Link>
              </Nav.Item>}
              <Nav.Item as="li">
                <Nav.Link className={getTabClassName(isAdvancedRulesValid)} eventKey="advanced-rules">Advanced rules</Nav.Link>
              </Nav.Item>
              {!isRetail && <Nav.Item as="li">
                <Nav.Link className={getTabClassName(isSubstrategiesValid)} eventKey="strategies">Sub-strategies</Nav.Link>
              </Nav.Item>}
            </Nav>
            <div style={{ marginRight: "25px" }}>
              <button className="btn btn-linkbutton btn-sm mr-2" onClick={cancelClick}>CANCEL</button>
              <Button variant="primary" size="sm" className="mr-2" disabled={!rights.MANAGE_CAMPAIGN || !isFormUpdated} onClick={handleSubmit}>SAVE</Button>
              {isAdserving && <Button variant="primary" size="sm" className="mr-2" disabled={isFormUpdated} onClick={exportTags}><FontIcon name="download" /> EXPORT TAGS</Button>}
              <CampaignStatusButton
                status={campaign.status}
                rights={rights}
                isActive={campaign.isActive}
                startTime={_.get(generalTab, "generalBox.startTime") as number}
                endTime={_.get(generalTab, "generalBox.endTime") as number}
                onClick={() => { setShowStatusConfirm(true) }}
              />
              <Confirm
                message="Update campaign status?"
                show={showStatusConfirm}
                onClose={() => setShowStatusConfirm(false)}
                onConfirm={updateCampaignStatusConfirm}
              />
            </div>
          </div>
          <div className="row">
            <div className="col-sm-12 pt-3">
              <Tab.Content>
                <Tab.Pane eventKey="general"><GeneralTab {...generalTabProps} /></Tab.Pane>
                {isRetail && <Tab.Pane eventKey="retail"><RetailTab {...retailTabProps} /></Tab.Pane>}
                <Tab.Pane eventKey="targeting"><TargetingTab {...targetingTabProps} /></Tab.Pane>
                <Tab.Pane eventKey="inventory"><InventoryTab {...inventoryTabProps} /></Tab.Pane>
                {rights.VIEW_ADS && <Tab.Pane eventKey="ads"><AdsTab {...adsTabProps} /></Tab.Pane>}
                {rights.VIEW_SEGMENTS && <Tab.Pane eventKey="segments"><SegmentsTab {...segmentsTabProps} /></Tab.Pane>}
                <Tab.Pane eventKey="advanced-rules"><AdvancedRulesTab {...advancedRulesTabProps} /></Tab.Pane>
                {!isRetail && <Tab.Pane eventKey="strategies"><SubstrategiesTab {...substrategiesTabProps} /></Tab.Pane>}
              </Tab.Content>
            </div>
          </div>
        </Tab.Container>
      </Fragment>
    }
    return null;
  }
}
export default SettingsCampaign;