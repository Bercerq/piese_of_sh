import React, { useState, Fragment, useEffect } from "react";
import { Modal, Button, Form, Alert, InputGroup } from "react-bootstrap";
import Select from "react-select";
import CreatableSelect from "react-select/creatable";
import Datetime from "react-datetime";
import momentPropTypes from "react-moment-proptypes";
import * as _ from "lodash";
import validator from "validator";
import moment from "moment";
import * as Validation from "../../../../client/Validation";
import * as Api from "../../../../client/Api";
import * as Helper from "../../../../client/Helper";
import * as FiltersHelper from "../../shared/filters/FiltersHelper";
import * as ExcelHelper from "../../../../client/ExcelHelper";
import { ValidationError, SelectOption, StatisticFilter, GroupOption, ScopeType } from "../../../../client/schemas";
import { Rights, Scope } from "../../../../models/Common";
import { CreativeFeed, CreativeFeedRow, UpdateSettings, CreativeFeedType } from "../../../../models/data/CreativeFeed";
import CreativeFeedImport from "./CreativeFeedImport";
import CreativeFeedRefreshModal from "./CreativeFeedRefreshModal"
import { AttributeCollection } from "../../../../models/data/Attribute";
import Loader from "../../../UI/Loader";
import StatisticFilterRow from "../../shared/filters/StatisticFilterRow";
import FontIcon from "../../../UI/FontIcon";
import Checkbox from "../../../UI/Checkbox";

interface CreativeFeedModalProps {
  show: boolean;
  creativeFeed: CreativeFeed | null;
  rights: Rights;
  scope: ScopeType;
  scopeId: number;
  maxLevel: ScopeType;
  writeAccess: boolean;
  handleClose: () => void;
  handleSubmit: (id: number, creativeFeed: Partial<CreativeFeed>) => void;
}

const CreativeFeedModal = (props: CreativeFeedModalProps) => {
  const id = _.get(props, "creativeFeed.id", -1);
  const owner = _.get(props, "creativeFeed.scope.owner", "");
  const reportScope = _.get(props, "creativeFeed.scope.scope") || "all";
  const reportScopeId = _.get(props, "creativeFeed.scope.scopeId") || -1;
  const levelOptions = Helper.getLevelOptions(props.maxLevel);
  const typeOptions = ["retail branch", "products", "product category", "product subcategory"].map((value) => { return {label: value, value: value} } )
  const [saving, setSaving] = useState<boolean>(false);
  const [showLoader, setShowLoader] = useState<boolean>(false);
  const [name, setName] = useState<string>("");
  const [type, setType] =  useState<CreativeFeedType>(props.creativeFeed?.attribute || CreativeFeedType.PRODUCTS);
  const [numberEvents, setNumberEvents] = useState<number>(props.creativeFeed?.numberEventsUsed || 1);

  const [description, setDescription] = useState<string>("");
  const [level, setLevel] = useState<ScopeType>(props.scope);
  const [entityId, setEntityId] = useState<number>(-1);
  const [showRefreshModal, setShowRefreshModal] = useState<boolean>(false);
  const [entityOptions, setEntityOptions] = useState<SelectOption[]>([{ value: -1, label: "" }]);
  const [numberValidation, setNumberValidation] = useState<ValidationError>({ error: false, message: "" });
  const [nameValidation, setNameValidation] = useState<ValidationError>({ error: false, message: "" });
  const [rows, setRows] = useState<CreativeFeedRow[]>(props.creativeFeed?.rows || []);
  const [updateSettings, setUpdateSettings] = useState<UpdateSettings>(props.creativeFeed?.updateSettings );

  const handleEntering = async () => {
    setSaving(false);
    setShowLoader(false);
    setShowRefreshModal(false);
    setNameValidation({ error: false, message: "" });
    setUpdateSettings(props.creativeFeed?.updateSettings);

    await loadScopeFields(level);
    if (props.creativeFeed) {
      setType(props.creativeFeed.attribute);
      setNumberEvents(props.creativeFeed.numberEventsUsed);
      setName(props.creativeFeed.name);
      setDescription(props.creativeFeed.description);
    } else {
      setType(CreativeFeedType.PRODUCTS);
      setNumberEvents(1);
      setName("");
      setDescription("");
    }
  }

  async function loadScopeFields(level: ScopeType) {
    setShowLoader(true);
    const entityOptions = await Helper.getEntityOptions("data-feeds", props.scope, props.scopeId, level);
    const entityId = (entityOptions.length > 0 ? entityOptions[0].value : -1) as number;
    setLevel(level);
    setEntityOptions(entityOptions);
    setEntityId(entityId);
    setShowLoader(false);
  }



  function save(needsRun: boolean) {
    const nameValidation = Validation.required(name);
    const numberValidation = Validation.numberInRange(numberEvents, 1, 5);
    if (nameValidation.error || numberValidation.error) {
      setNameValidation(nameValidation);
    } else {
      setSaving(true);
      if (id > 0) {
        const scope =Helper.getScopeByLevel(props.scope)
        let creativeFeed: Partial<CreativeFeed> = {
          name,
          description,
          scope: {
            scope: scope,
            scopeId: props.scopeId
          },
          numberEventsUsed: numberEvents,
          attribute: type,
          rows: rows,
          updateSettings: updateSettings
        };
        props.handleSubmit(id, creativeFeed);
      } else {
        const scope = Helper.getScopeByLevel(level);
        let report: Partial<CreativeFeed> = {
          name,
          description,
          scope: {
            scope,
            scopeId: null
          },
          numberEventsUsed: numberEvents,
          attribute: type,
          rows: rows,
          updateSettings: updateSettings,
        };
        if (level !== "root") {
          report.scope.scopeId = entityId;
        }
        props.handleSubmit(id, report);
      }
    }
  }

  const handleNumberEvents = (e) => {
    try {
    const number = Number(e.target.value);
      setNumberValidation(Validation.numberInRange(number, 1, 5));   
      setNumberEvents(number);
    } catch {

    }
  }

  const handleNameChange = (e) => {
    const name = e.target.value;
    const nameValidation = Validation.required(name);
    setName(name);
    setNameValidation(nameValidation);
  }

  const handleLevelChange = async (selected) => {
    await loadScopeFields(selected.value as ScopeType);
  }

  const handleEntityChange = async (selected) => {
    const entityId = selected.value as number;
    setEntityId(entityId);
  }
  
  const exportExcel =  (data : CreativeFeedRow[]) => {
    const fields = ["id", "name", "landing page", "custom 1", "custom 2", "custom 3", "custom 4", "custom 5", "custom 6", "custom 7", "custom 8", "custom 9"];
    const header = fields.map((value) => { return ExcelHelper.getBoldCell(value); });

    const rows = data.map((o) => {
      return [
        ExcelHelper.getCell(o.key),
        ExcelHelper.getCell(o.name),
        ExcelHelper.getCell((o.landingPage ? o.landingPage : "")),
        ExcelHelper.getCell((o.custom1 ? o.custom1 : "")),
        ExcelHelper.getCell((o.custom2 ? o.custom2 : "")),
        ExcelHelper.getCell((o.custom3 ? o.custom3 : "")),
        ExcelHelper.getCell((o.custom4 ? o.custom4 : "")),
        ExcelHelper.getCell((o.custom5 ? o.custom5 : "")),
        ExcelHelper.getCell((o.custom6 ? o.custom6 : "")),
        ExcelHelper.getCell((o.custom7 ? o.custom7 : "")),
        ExcelHelper.getCell((o.custom8 ? o.custom8 : "")),
        ExcelHelper.getCell((o.custom9 ? o.custom9 : "")),
      ];
    });
    const exportData = [header].concat(rows);
    const name = props.creativeFeed?.name ? props.creativeFeed.name : "New";
    ExcelHelper.save(exportData, "Data", `Data_${name}`);
  }

  return <Modal size="lg" show={props.show} onHide={() => { 
    setShowRefreshModal(false);
    props.handleClose(); }
    } onEntering={handleEntering} backdrop="static">
    <Modal.Header closeButton>
      <Modal.Title>Data feed settings</Modal.Title>
    </Modal.Header>
    <Modal.Body>
      <div className="row no-gutters">
        <div className="col-lg-12 px-1">
          <Form.Group controlId="creative-feed-name">
            <Form.Label>Name *</Form.Label>
            <Form.Control
              autoFocus
              readOnly={!props.writeAccess}
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
          <Form.Group controlId="creative-feed-attribute">
              <Form.Label>type:</Form.Label>
              <Select
                inputId="react-select-creative-type"
                className="react-select-container"
                classNamePrefix="react-select"
                readOnly={!props.writeAccess}
                clearable={false}
                onChange={(value) => setType(value.value as CreativeFeedType) }
                options={typeOptions}
                value={typeOptions.find((a) =>  a.value ==  type.valueOf())}
              />
            </Form.Group>
            <Form.Group controlId="creative-feed-description">
            <Form.Label>Max number of rows per impression:</Form.Label>
            <Form.Control
              readOnly={!props.writeAccess}
              isInvalid={numberValidation.error}
              type="text"
              value={ ((!isNaN(numberEvents)) ? numberEvents.toString() : "")  }
              onChange={handleNumberEvents}
            />
             {
              numberValidation.error &&
              <Form.Control.Feedback type="invalid">{numberValidation.message}</Form.Control.Feedback>
            }
          </Form.Group>
          
          <Form.Group controlId="creative-feed-description">
            <Form.Label>Description</Form.Label>
            <Form.Control as="textarea"
              autoFocus
              disabled={!props.writeAccess}
              type="text"
              rows="3"
              value={description}
              onChange={(e) => { setDescription((e.target as any).value as string); }}
            />
          </Form.Group>
          <a href="" onClick={(e) => { e.preventDefault(); setShowRefreshModal(true ) }}>Set automatic update settings</a>

        </div>
      </div>
      <div></div>
      <div className="row no-gutters">
        {id === -1 &&
          <div className="col-lg-6 px-1">
            <Form.Group controlId="report-scope">
              <Form.Label>Level:</Form.Label>
              <Select
                inputId="react-select-creative-feed-scope"
                className="react-select-container"
                classNamePrefix="react-select"
                clearable={false}
                value={levelOptions.find((o) => { return o.value === level })}
                onChange={handleLevelChange}
                options={levelOptions}
              />
            </Form.Group>
          </div>
        }
        {level !== "root" && id === -1 &&
          <div className="col-lg-6 px-1">
            <Loader visible={showLoader} loaderClass="loading-input" />
            {!showLoader &&
              <Form.Group controlId="report-entity">
                <Form.Label>{Helper.getLabelByScopeType(level)}</Form.Label>
                <Select
                  inputId="react-select-creative-feed-entity"
                  className="react-select-container"
                  classNamePrefix="react-select"
                  value={entityOptions.find((o) => { return o.value === entityId })}
                  clearable={false}
                  onChange={handleEntityChange}
                  options={entityOptions}
                />
              </Form.Group>
            }
          </div>
        }
        {id > 0 && <Fragment>
          <div className="col-lg-6 px-1">
            <Form.Group controlId="report-level">
              <Form.Label>Level:</Form.Label>
              <Form.Control
                disabled={true}
                type="text"
                value={Helper.getLabelByScope(reportScope)}
              />
            </Form.Group>
          </div>
          <div className="col-lg-6 px-1">
            <Form.Group controlId="report-owner">
              <Form.Label>Entity:</Form.Label>
              <Form.Control
                disabled={true}
                type="text"
                value={owner}
              />
            </Form.Group>
          </div>
        </Fragment>
        }
      </div>

      <CreativeFeedImport
      show={true}
      creativeFeed={props.creativeFeed}
      rowsChanged={setRows}
      exportData={exportExcel}
    />
        {(showRefreshModal) ? <CreativeFeedRefreshModal 
            show={showRefreshModal}
            updateSettings={updateSettings}
            rights={props.rights}
            writeAccess={props.writeAccess}
            handleClose={() => {setShowRefreshModal(false)}}
            handleSubmit={(e) => {setUpdateSettings(e); setShowRefreshModal(false)}}
        /> : null }
    </Modal.Body>
    <Modal.Footer>
      <Button variant="light" size="sm" onClick={props.handleClose}>CANCEL</Button>
      <Button variant="primary" size="sm" onClick={() => { save(false); }} disabled={saving || !props.writeAccess}>SAVE</Button>
    </Modal.Footer>



  </Modal>;
}
export default CreativeFeedModal;