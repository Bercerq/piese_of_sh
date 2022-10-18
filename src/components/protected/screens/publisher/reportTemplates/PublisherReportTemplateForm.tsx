import React, { useState, useEffect, Fragment } from "react";
import { Form, Button } from "react-bootstrap";
import { Tabs, DragTabList, DragTab, TabList, Tab, PanelList, Panel } from "react-tabtab";
import { simpleSwitch } from "react-tabtab/lib/helpers/move";
import * as customStyle from "./customTabStyle";
import Select from "react-select";
import * as _ from "lodash";
import { v4 as uuidv4 } from "uuid";
import * as Api from "../../../../../client/Api";
import * as Validation from "../../../../../client/Validation";
import * as Helper from "../../../../../client/Helper";
import * as FiltersHelper from "../../../shared/filters/FiltersHelper";
import * as ReportTemplateHelper from "./PublisherReportTemplateHelper";
import { Rights, Scope } from "../../../../../models/Common";
import PublisherReportTemplateTabContainer from "./PublisherReportTemplateTabContainer";
import { ReportTemplate, ReportTemplateTab } from "../../../../../models/data/Report";
import { GroupOption, ScopeType, SelectOption, StatisticFilter, ValidationError } from "../../../../../client/schemas";
import { AttributeCollection } from "../../../../../models/data/Attribute";
import Loader from "../../../../UI/Loader";
import StatisticFilterRow from "../../../shared/filters/StatisticFilterRow";
import Checkbox from "../../../../UI/Checkbox";
import FontIcon from "../../../../UI/FontIcon";
import { Preset, PresetMetric } from "../../../../../models/data/Preset";
import ErrorContainer from "../../../../UI/ErrorContainer";

interface ReportTemplateFormProps {
  id: number;
  rights: Rights;
  scope: ScopeType;
  scopeId: number;
  maxLevel: ScopeType;
  saving: boolean;
  onClose: () => void;
  onSubmit: (id: number, reportTemplate: Partial<ReportTemplate>) => void;
}

const PublisherReportTemplateForm = (props: ReportTemplateFormProps) => {
  const levelOptions = Helper.getLevelOptions(props.maxLevel);

  const [showLoader, setShowLoader] = useState<boolean>(true);
  const [showEntityLoader, setShowEntityLoader] = useState<boolean>(false);
  const [name, setName] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [writeAccess, setWriteAccess] = useState<boolean>(false);
  const [owner, setOwner] = useState<string>("");
  const [frontPage, setFrontPage] = useState<boolean>(true);
  const [statisticFilters, setStatisticFilters] = useState<StatisticFilter[]>([]);
  const [filterAttributeCollection, setFilterAttributeCollection] = useState<AttributeCollection>({});
  const [metricOptions, setMetricOptions] = useState<SelectOption[]>([]);
  const [dimensionAttributeCollection, setDimensionAttributeCollection] = useState<AttributeCollection>({});
  const [tabs, setTabs] = useState<(ReportTemplateTab & { key: string })[]>([]);
  const [entityOptions, setEntityOptions] = useState<SelectOption[]>([{ value: -1, label: "" }]);
  const [nameValidation, setNameValidation] = useState<ValidationError>({ error: false, message: "" });
  const [tabsValidation, setTabsValidation] = useState<boolean[]>([]);
  const [tabActiveIndex, setTabActiveIndex] = useState<number>(0);
  const [error, setError] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>("");

  useEffect(() => {
    if (!props.saving) {
      loadForm();
    }
  }, [props.id, props.saving]);

  async function loadAttributes(scope: Scope, scopeId: number) {
    const scopeQs = getScopeQueryString(scope, scopeId);
    const filterAttributeCollection = await FiltersHelper.getFilterAttributes(scopeQs);
    setFilterAttributeCollection(filterAttributeCollection);
    const dimensionAttributeCollection = await ReportTemplateHelper.getStatisticAttributes(scopeQs);
    setDimensionAttributeCollection(dimensionAttributeCollection);
  }

  async function loadPresets(writeAccess: boolean, scope: Scope, scopeId: number) {
    if (writeAccess) {
      const metricOptions = await getMetrics(scope, scopeId);
      setMetricOptions(metricOptions);
    }
  }

  async function loadForm() {
    setShowLoader(true);
    setShowEntityLoader(false);
    setNameValidation({ error: false, message: "" });
    if (props.id > 0) {
      const template = await getTemplate();
      if (template) {
        setWriteAccess(template.writeAccess);
        setName(template.name);
        setDescription(template.description);
        const owner = _.get(template, "scope.owner", "");
        setOwner(owner);
        const templateScope = "publisher"
        const templateScopeId = props.scopeId
        await loadAttributes(templateScope, templateScopeId);
        await loadPresets(template.writeAccess, templateScope, templateScopeId);
        const frontPage = _.get(template, "template.frontPage", false);
        setFrontPage(frontPage);
        const filters = _.get(template, "template.filters", []);
        const statisticFilters = FiltersHelper.getStatisticFilters(filters || []);
        setStatisticFilters(statisticFilters);
        const tabs = assignKeys(_.get(template, "template.tabs") || []);
        setTabs(tabs);
        setTabActiveIndex(0);
        const tabsValidation = tabs.map((o) => { return true; });
        setTabsValidation(tabsValidation);
      } else {
        setError(true);
        setErrorMessage("Error loading template.");
      }
      setShowLoader(false);
    } else {
      setError(false);
      setErrorMessage("");
      setShowLoader(false);
      setWriteAccess(true);
      setName("");
      setDescription("");
      const templateScope = "publisher"
      const templateScopeId = props.scopeId
      await loadAttributes(templateScope, templateScopeId);
      await loadPresets(true, templateScope, templateScopeId);
      setFrontPage(true);
      setStatisticFilters([]);
      setTabs([]);
      setTabsValidation([]);
    }
  }

  function assignKeys(items: ReportTemplateTab[]): (ReportTemplateTab & { key: string })[] {
    return items.map((o) => { return _.assign(o, { key: uuidv4() }); });
  }

  function removeKeys(items: (ReportTemplateTab & { key: string })[]): ReportTemplateTab[] {
    return items.map((o) => { return _.omit(o, "key") });
  }

  async function getTemplate() {
    try {
      const template: ReportTemplate = await Api.Get({ path: `/api/reportTemplates/${props.id}` });
      return template;
    } catch (err) {
      return null;
    }
  }

  async function getMetrics(scope: Scope, scopeId: number): Promise<SelectOption[]> {
    try {
      const scopeQs = getScopeQueryString(scope, scopeId);
      const allPresets: Preset[] = await Api.Get({ path: "/api/presets", qs: scopeQs });
      const statisticsPresets = (allPresets || []).filter((o) => { return o.groupName === "VideoStatistics" || o.groupName === "DisplayStatistics" });
      const allMetrics: PresetMetric[] = _.flatMap(statisticsPresets, (o) => { return o.metrics });
      const metricOptions: SelectOption[] = _.uniqBy(allMetrics, 'fieldName').map((o) => { return { value: o.fieldName, label: o.displayName } });
      return metricOptions;
    } catch (err) {
      console.log(err);
      return [];
    }
  }

  function getScopeQueryString(scope: Scope, scopeId: number) {
    let qs: any = { scope };
    if (scope !== "all") {
      qs.scopeId = scopeId;
    }
    return qs;
  }

  function hasInvalidTabs() {
    return tabsValidation.indexOf(false) > -1;
  }

  const handleNameChange = (e) => {
    const name = e.target.value;
    const nameValidation = Validation.required(name);
    setName(name);
    setNameValidation(nameValidation);
  }

  const addFilterClick = () => {
    const newStatisticFilter: StatisticFilter = { attributeId: -1, condition: "in", values: [] };
    setStatisticFilters([...statisticFilters, newStatisticFilter]);
  }

  const statisticFilterDelete = (i: number) => {
    const updated = statisticFilters.concat();
    if (updated.length > 0) {
      updated.splice(i, 1);
      setStatisticFilters(updated);
    }
  }

  const statisticFilterChange = (i: number, filter: StatisticFilter) => {
    let updated = statisticFilters.concat();
    updated[i] = filter;
    setStatisticFilters(updated);
  }

  const clearFiltersClick = () => {
    setStatisticFilters([]);
  }

  const addTabClick = () => {
    const newTab = { name: "New tab", figures: [], key: uuidv4() };
    setTabActiveIndex(tabs.length);
    setTabs([...tabs, newTab]);
  }

  const handleTabFormChange = (i: number, tab: ReportTemplateTab & { key: string }, isValid: boolean) => {
    let updatedTabs = _.cloneDeep(tabs);
    updatedTabs[i] = tab;
    setTabs(updatedTabs);
    const updatedTabsValidation = tabsValidation.concat();
    updatedTabsValidation[i] = isValid;
    setTabsValidation(updatedTabsValidation);
  }

  const handleTabDelete = (i: number) => {
    let updatedTabs = _.cloneDeep(tabs);
    if (updatedTabs.length > 0) {
      if (tabActiveIndex >= 1) {
        setTabActiveIndex(tabActiveIndex - 1);
      } else {
        setTabActiveIndex(0);
      }
      updatedTabs.splice(i, 1);
      setTabs(updatedTabs);
      let updatedTabsValidation = tabsValidation.concat();
      updatedTabsValidation.splice(i, 1);
      setTabsValidation(updatedTabsValidation);
    }
  }

  const handleTabChange = (index: number) => {
    setTabActiveIndex(index);
  }

  const handleTabSequenceChange = ({ oldIndex, newIndex }) => {
    const updatedTabs = simpleSwitch(tabs, oldIndex, newIndex);
    setTabs(updatedTabs);
    setTabActiveIndex(newIndex);
  }

  const saveClick = () => {
    const nameValidation = Validation.required(name);
    const invalidTabs = hasInvalidTabs();
    const filters = FiltersHelper.getFilters(statisticFilters);
    if (nameValidation.error || invalidTabs) {
      setNameValidation(nameValidation);
    } else {
      if (props.id > 0) {
        const template: Partial<ReportTemplate> = {
          id: props.id,
          name,
          description,
          template: {
            title: name,
            frontPage,
            filters,
            tabs: removeKeys(tabs)
          }
        };
        props.onSubmit(props.id, template);
      } else {
        const scope = "publisher"
        let template: Partial<ReportTemplate> = {
          name,
          description,
          scope: {
            scope,
            scopeId: props.scopeId
          },
          template: {
            title: name,
            frontPage,
            filters,
            tabs: removeKeys(tabs)
          }
        };
   
        template.scope.scopeId = props.scopeId;
        
        props.onSubmit(props.id, template);
      }
    }
  }

  const filterOptions: (GroupOption | SelectOption)[] = ([{ value: -1, label: "Select dimension" }] as (GroupOption | SelectOption)[]).concat(Helper.attributeIdOptions(filterAttributeCollection));
  const dimensionOptions: (GroupOption | SelectOption)[] = ReportTemplateHelper.statisticAttributeOptions(dimensionAttributeCollection);

  if (!error) {
    return <Fragment>
      <Loader visible={showLoader} />
      {
        !showLoader && <Fragment>
          <div className="row no-gutters">
            <div className="col-lg-12 px-1">
              <div className="pull-left">
                <h3>Template settings: {name}</h3>
              </div>
              <div className="pull-right">
                <Button variant="light" size="sm" className="mr-2" onClick={props.onClose}>CANCEL</Button>
                <Button variant="primary" size="sm" className="mr-3" onClick={saveClick} disabled={props.saving || !writeAccess}>SAVE</Button>
              </div>
            </div>
          </div>
          <div className="row no-gutters">
            <div className="col-lg-12 px-1">
              <Form.Group controlId="template-name">
                <Form.Label>Name *</Form.Label>
                <Form.Control
                  autoFocus
                  readOnly={!writeAccess}
                  isInvalid={nameValidation.error}
                  type="text"
                  value={name}
                  onChange={handleNameChange}
                />
                {
                  nameValidation.error &&
                  <Form.Control.Feedback type="invalid">{nameValidation.message}</Form.Control.Feedback>
                }
              </Form.Group>
              <Form.Group controlId="template-description">
                <Form.Label>Description</Form.Label>
                <Form.Control as="textarea"
                  disabled={!writeAccess}
                  type="text"
                  rows="3"
                  value={description}
                  onChange={(e) => { setDescription((e.target as any).value); }}
                />
              </Form.Group>
            </div>
          </div>

          <div className="row no-gutters">
            <div className="col-lg-12 px-1">
              <Form.Group>
                <Checkbox
                  id="template-frontpage"
                  disabled={!writeAccess}
                  checked={frontPage}
                  onChange={(checked) => { setFrontPage(checked) }}
                >
                  Add front tab with settings
            </Checkbox>
              </Form.Group>
              <Form.Group>
                <Form.Label>Filters:</Form.Label>
                <div>
                  {
                    statisticFilters.map((statisticFilter, i) => <StatisticFilterRow
                      key={`filter-${i}`}
                      index={i}
                      filter={statisticFilter}
                      writeAccess={writeAccess}
                      attributes={filterOptions}
                      onChange={statisticFilterChange}
                      onDelete={statisticFilterDelete}
                    />)
                  }
                </div>
                <button className="mr-2 btn btn-primary btn-xs" onClick={addFilterClick} disabled={!writeAccess}><FontIcon name="plus" /> ADD FILTER</button>
                {statisticFilters.length > 0 && <button className="btn btn-primary btn-xs" disabled={!writeAccess} onClick={clearFiltersClick}><FontIcon name="remove" /> CLEAR FILTERS</button>}
              </Form.Group>
            </div>
            <div className="col-lg-12 px-1">
              <Form.Group>
                <button className="mr-2 mb-2 btn btn-primary btn-xs" disabled={!writeAccess} onClick={addTabClick}><FontIcon name="plus" /> ADD TAB</button>
                {tabs.length > 0 && writeAccess &&
                  <div className="draggable-tabs">
                    <Tabs
                      onTabChange={handleTabChange}
                      activeIndex={tabActiveIndex}
                      customStyle={customStyle}
                      onTabSequenceChange={handleTabSequenceChange}
                      showModalButton={false}
                      showArrowButton="auto"
                    >
                      <DragTabList>
                        {
                          tabs.map((tab, i) => <DragTab key={tab.key}>{tab.name}</DragTab>)
                        }
                      </DragTabList>
                      <PanelList>
                        {
                          tabs.map((tab, i) => <Panel key={tab.key}>
                            <PublisherReportTemplateTabContainer
                              index={i}
                              tab={tab}
                              writeAccess={writeAccess}
                              metricOptions={metricOptions}
                              dimensionOptions={dimensionOptions}
                              onChange={handleTabFormChange}
                              onDelete={handleTabDelete}
                            />
                          </Panel>)
                        }
                      </PanelList>
                    </Tabs>
                  </div>
                }
                {tabs.length > 0 && !writeAccess &&
                  <div className="draggable-tabs readonly">
                    <Tabs
                      onTabChange={handleTabChange}
                      activeIndex={tabActiveIndex}
                      customStyle={customStyle}
                      showModalButton={false}
                      showArrowButton="auto"
                    >
                      <TabList>
                        {
                          tabs.map((tab, i) => <Tab key={tab.key}>{tab.name}</Tab>)
                        }
                      </TabList>
                      <PanelList>
                        {
                          tabs.map((tab, i) => <Panel key={tab.key}>
                            <PublisherReportTemplateTabContainer
                              index={i}
                              tab={tab}
                              writeAccess={writeAccess}
                              metricOptions={metricOptions}
                              dimensionOptions={dimensionOptions}
                              onChange={handleTabFormChange}
                              onDelete={handleTabDelete}
                            />
                          </Panel>)
                        }
                      </PanelList>
                    </Tabs>
                  </div>
                }
              </Form.Group>
            </div>
          </div>
        </Fragment>
      }
    </Fragment>;
  } else {
    return <div className="row">
      <div className="col-lg-12">
        <ErrorContainer message={errorMessage} />
      </div>
      <div className="col-lg-12">
        <div className="pull-right">
          <Button variant="light" size="sm" className="mr-2" onClick={props.onClose}>CANCEL</Button>
        </div>
      </div>
    </div>;
  }

}
export default PublisherReportTemplateForm;