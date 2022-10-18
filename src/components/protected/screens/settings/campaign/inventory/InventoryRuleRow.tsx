import React, { useState, useRef, Fragment, useEffect } from "react";
import { Form, InputGroup, Tooltip, OverlayTrigger } from "react-bootstrap";
import Select from "react-select";
import NumberFormat from "react-number-format";
import * as _ from "lodash";
import NotificationSystem from "react-notification-system";
import * as Helper from "../../../../../../client/Helper";
import * as Validation from "../../../../../../client/Validation";
import * as NotificationOptions from "../../../../../../client/NotificationOptions";
import * as Api from "../../../../../../client/Api";
import * as CampaignHelper from "../../../../../../client/CampaignHelper";
import { InventoryRule, RuleActionType } from "../../../../../../models/data/Campaign";
import FontIcon from "../../../../../UI/FontIcon";
import AsyncSelectList from "../../../../../UI/AsyncSelectList";
import ListValuesModal from "../../../lists/ListValuesModal";
import ListModal from "../../../lists/ListModal";
import { Rights } from "../../../../../../models/Common";
import { List } from "../../../../../../models/data/List";
import { ScopeType, ValidationError } from "../../../../../../client/schemas";

export interface InventoryRuleRowProps {
  index: number;
  isList: boolean;
  rule: InventoryRule;
  attribute: string;
  attributeName: string;
  creatable: boolean;
  campaignId: number;
  editAsText: boolean;
  createLists: boolean;
  listModalScope: ScopeType;
  listModalScopeId: number;
  listModalMaxLevel: ScopeType,
  rights: Rights;
  maxBidPrice: number;
  onDelete: (i: number) => void;
  onChange: (i: number, rule: InventoryRule, isValid: boolean) => void;
}

const InventoryRuleRow = (props: InventoryRuleRowProps) => {
  const bidOptions = CampaignHelper.ruleBidOptions();
  const selectedValues = CampaignHelper.attributeValueNameSelectOptions({ values: _.get(props, "rule.values") || [], displayNames: _.get(props, "rule.displayNames") || [] });
  const bidAction = _.get(props, "rule.consequence.action");
  const limitBid = _.get(props, "rule.consequence.limitBid", null);
  const url = getAttributeValuesUrl();
  const attributeSelectClassNames = props.isList ? "react-select-container multiple bordered" : "react-select-container multiple";
  const writeAccess = props.rights.MANAGE_CAMPAIGN || false;

  const [showEditAsTextModal, setShowEditAsTextModal] = useState<boolean>(false);
  const [showCreateListModal, setShowCreateListModal] = useState<boolean>(false);
  const [limitBidValidationError, setLimitBidValidationError] = useState<ValidationError>({ error: false, message: "" });
  const [valuesValidationError, setValuesValidationError] = useState<ValidationError>({ error: false, message: "" });
  const notificationSystem = useRef<NotificationSystem.System>(null);

  useEffect(() => {
    const valuesValidation = Validation.required(_.get(props, "rule.values") || []);
    setValuesValidationError(valuesValidation);
    props.onChange(props.index, props.rule, !valuesValidation.error);
  }, []);

  useEffect(() => {
    if (bidAction === "LIMIT_BID") {
      const limitBidValidation = Validation.limitBid(limitBid, props.maxBidPrice);
      setLimitBidValidationError(limitBidValidation);
      props.onChange(props.index, props.rule, !limitBidValidation.error);
    }
  }, [props.maxBidPrice]);

  function getAttributeValuesUrl() {
    return `/api/targeting/suggestion/advanced/campaign/${props.campaignId}/attribute/${props.attribute}`;
  }

  const handleAttributeValuesChange = (selected) => {
    const values = selected.map((s) => { return s.value as string; });
    const displayNames = selected.map((s) => {
      if (s.__isNew__) {
        return s.value;
      } else {
        return s.label;
      }
    });
    const valuesValidation = Validation.required(values);
    setValuesValidationError(valuesValidation);
    const rule: InventoryRule = _.assign({}, props.rule, { values, displayNames });
    props.onChange(props.index, rule, !valuesValidation.error && !limitBidValidationError.error);
  }

  const handleBidActionChange = (selected) => {
    const bidAction = selected.value as RuleActionType;
    const limitBid = _.get(props, "rule.consequence.limitBid");
    const consequence = CampaignHelper.getRuleConsequence(bidAction, limitBid);

    let limitBidValidation = { error: false, message: "" };
    if (bidAction === "LIMIT_BID") {
      limitBidValidation = Validation.limitBid(limitBid, props.maxBidPrice);
    }
    const rule: InventoryRule = _.assign({}, props.rule, { consequence });
    setLimitBidValidationError(limitBidValidation);
    props.onChange(props.index, rule, !limitBidValidation.error && !valuesValidationError.error);
  }

  const handleLimitBidChange = (values) => {
    const limitBid = _.get(values, "floatValue") as number;
    const bidAction = _.get(props, "rule.consequence.action");
    const consequence = CampaignHelper.getRuleConsequence(bidAction, limitBid);
    const rule: InventoryRule = _.assign({}, props.rule, { consequence });
    const limitBidValidation = Validation.limitBid(limitBid, props.maxBidPrice);
    setLimitBidValidationError(limitBidValidation);
    props.onChange(props.index, rule, !limitBidValidation.error && !valuesValidationError.error);
  }

  const editAsTextClick = (e) => {
    e.preventDefault();
    setShowEditAsTextModal(true);
  }

  const createListClick = (e) => {
    e.preventDefault();
    setShowCreateListModal(true);
  }

  const handleListValuesSubmit = (values) => {
    setShowEditAsTextModal(false);
    const rule: InventoryRule = _.assign({}, props.rule, { values, displayNames: values });
    setValuesValidationError({ error: false, message: "" });
    props.onChange(props.index, rule, true);
  }

  const handleListSubmit = async (id: number, list: List) => {
    try {
      const newList: List = _.pick(list, "scope", "name", "description", "attributeValues", "attribute");
      await Api.Post({ path: "/api/lists", body: newList });
      setShowCreateListModal(false);
      notificationSystem.current.addNotification(NotificationOptions.success(<span>List <strong>{list.name}</strong> created.</span>, false));
    } catch (err) {
      setShowCreateListModal(false);
      notificationSystem.current.addNotification(NotificationOptions.error("Error creating list."));
    }
  }

  const removeClick = (e) => {
    e.preventDefault();
    if (writeAccess) {
      props.onDelete(props.index);
    }
  }

  const limitBidInputClass = limitBidValidationError.error ? "form-control is-invalid" : "form-control";
  const deleteTooltip = <Tooltip id={`inventory-rule-delete-tooltip-${props.attribute}-${props.index}`}>delete rule</Tooltip>;
  const popperConfig = Helper.getPopperConfig();

  return <div className="inventory-rule">
    <div className="row no-gutters">
      <div className="col-lg-12 px-2">
        <OverlayTrigger placement="top" overlay={deleteTooltip} popperConfig={popperConfig}>
          <a href="" className="table-btn-lg pull-right" onClick={removeClick}><FontIcon name="remove" /></a>
        </OverlayTrigger>
      </div>
    </div>
    <div className="row no-gutters">
      <div className="col-lg-12 px-1">
        <Form.Group>
          <Form.Label>{props.isList && <FontIcon name="list" />} {props.attributeName}</Form.Label>
          <AsyncSelectList
            id={`inventory-attribute-${props.attribute}-${props.index}`}
            writeAccess={writeAccess}
            creatable={props.creatable}
            url={url}
            classNames={attributeSelectClassNames}
            onChange={handleAttributeValuesChange}
            values={selectedValues}
          />
          {valuesValidationError.error && <Form.Control.Feedback type="invalid" style={{ display: "block" }}>{valuesValidationError.message}</Form.Control.Feedback>}
          {!props.isList && props.editAsText &&
            <ul className="rule-link-list">
              <li><a href="#" onClick={editAsTextClick}>Edit as text</a></li>
              {props.createLists && <li><a href="#" onClick={createListClick}>Create list like this</a></li>}
            </ul>
          }
        </Form.Group>
        <ListValuesModal
          show={showEditAsTextModal}
          attribute={props.attribute}
          attributeDisplayName={props.attributeName}
          writeAccess={writeAccess}
          values={_.get(props, "rule.values", [])}
          onClose={() => { setShowEditAsTextModal(false) }}
          onSubmit={handleListValuesSubmit}
        />
        {props.createLists && <Fragment>
          <ListModal
            show={showCreateListModal}
            list={null}
            attribute={props.attribute}
            attributeDisplayName={props.attributeName}
            acceptAnyValue={props.creatable}
            rights={props.rights}
            scope={props.listModalScope}
            scopeId={props.listModalScopeId}
            maxLevel={props.listModalMaxLevel}
            attributeValues={_.get(props, "rule.values", [])}
            onClose={() => setShowCreateListModal(false)}
            onSubmit={handleListSubmit}
          />
          <NotificationSystem ref={notificationSystem} />
        </Fragment>
        }
      </div>
    </div>
    <div className="row no-gutters">
      <div className="col-lg-4 px-1">
        <Form.Group>
          <Form.Label>Bid</Form.Label>
          <Select
            isDisabled={!writeAccess}
            inputId={`inventory-bid-action-${props.attribute}-${props.index}`}
            className="react-select-container"
            classNamePrefix="react-select"
            clearable={false}
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
              disabled={!writeAccess}
              id={`inventory-limit-bid-${props.attribute}-${props.index}`}
              className={limitBidInputClass}
              value={limitBid}
              thousandSeparator={true}
              allowNegative={false}
              allowLeadingZeros={false}
              decimalScale={2}
              fixedDecimalScale={true}
              onValueChange={handleLimitBidChange}
            />
            {limitBidValidationError.error && <Form.Control.Feedback type="invalid">{limitBidValidationError.message}</Form.Control.Feedback>}
          </InputGroup>
        </div>
      }
    </div>
  </div>;
}
export default InventoryRuleRow;