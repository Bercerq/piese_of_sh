import React, { Fragment, useEffect, useRef, useState } from "react";
import { Form } from "react-bootstrap";
import * as _ from "lodash";
import * as Validation from "../../../../../../client/Validation";
import * as CampaignHelper from "../../../../../../client/CampaignHelper";
import NotificationSystem from "react-notification-system";
import * as NotificationOptions from "../../../../../../client/NotificationOptions";
import * as Api from "../../../../../../client/Api";
import { StrategyRuleConditionProps } from "./StrategyRuleCondition";
import { ValidationError } from "../../../../../../client/schemas";
import AsyncSelectList from "../../../../../UI/AsyncSelectList";
import ListValuesModal from "../../../lists/ListValuesModal";
import ListModal from "../../../lists/ListModal";
import { List } from "../../../../../../models/data/List";

const AttributeValues = (props: StrategyRuleConditionProps) => {
  const [showEditAsTextModal, setShowEditAsTextModal] = useState<boolean>(false);
  const [showCreateListModal, setShowCreateListModal] = useState<boolean>(false);
  const [valuesValidation, setValuesValidation] = useState<ValidationError>({ error: false, message: "" });

  const notificationSystem = useRef<NotificationSystem.System>(null);
  const values = _.get(props, "condition.values", []);
  const displayNames = _.get(props, "condition.displayNames", []);
  const options = CampaignHelper.attributeValueNameSelectOptions({ values, displayNames });

  useEffect(() => {
    const valuesValidation = Validation.required(values);
    setValuesValidation(valuesValidation);
    props.onChange(props.condition, !valuesValidation.error);
  }, []);

  const handleValuesChange = (selected) => {
    const selectedValues = (selected || []).map((s) => { return s.value; });
    const selectedNames = getSelectedNames(selected);
    const valuesValidation = Validation.required(selectedValues);
    const condition = _.assign({}, props.condition, { values: selectedValues, displayNames: selectedNames });
    props.onChange(condition, !valuesValidation.error);
    setValuesValidation(valuesValidation);
  }

  function getSelectedNames(selected) {
    if (props.acceptAnyValue) {
      return (selected || []).map((s) => { return s.value; });
    } else {
      return (selected || []).map((s) => { return s.label; });
    }
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
    const condition = _.assign({}, props.condition, { values, displayNames: values });
    setValuesValidation({ error: false, message: "" });
    props.onChange(condition, true);
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

  const attributeSelectClassNames = props.isList ? "react-select-container multiple bordered" : "react-select-container multiple";
  return <Fragment>
    <Form.Group>
      <Form.Label>{props.attributeName}</Form.Label>
      <AsyncSelectList
        id={`strategy-rule-condition-attrvalues-${props.strategyId}-${props.index}`}
        writeAccess={props.writeAccess}
        url={`/api/targeting/suggestion/advanced/campaign/${props.campaignId}/attribute/${props.attribute}`}
        creatable={props.acceptAnyValue}
        classNames={attributeSelectClassNames}
        values={options}
        onChange={handleValuesChange}
      />
      {!props.isList && props.listsAllowed &&
        <ul className="rule-link-list">
          <li><a href="#" onClick={editAsTextClick}>Edit as text</a></li>
          {props.createLists && <li><a href="#" onClick={createListClick}>Create list like this</a></li>}
        </ul>
      }
      {valuesValidation.error && <Form.Control.Feedback type="invalid" style={{ display: "block" }}>{valuesValidation.message}</Form.Control.Feedback>}
    </Form.Group>
    <ListValuesModal
      show={showEditAsTextModal}
      attribute={props.attribute}
      attributeDisplayName={props.attributeName}
      writeAccess={props.writeAccess}
      values={values}
      onClose={() => { setShowEditAsTextModal(false) }}
      onSubmit={handleListValuesSubmit}
    />
    {props.createLists && <Fragment>
      <ListModal
        show={showCreateListModal}
        list={null}
        attribute={props.attribute}
        attributeDisplayName={props.attributeName}
        acceptAnyValue={props.acceptAnyValue}
        rights={{ MANAGE_LISTS: props.createLists }}
        scope={props.listModalScope}
        scopeId={props.listModalScopeId}
        maxLevel={props.listModalMaxLevel}
        attributeValues={values}
        onClose={() => setShowCreateListModal(false)}
        onSubmit={handleListSubmit}
      />
      <NotificationSystem ref={notificationSystem} />
    </Fragment>
    }
  </Fragment>
}
export default AttributeValues;