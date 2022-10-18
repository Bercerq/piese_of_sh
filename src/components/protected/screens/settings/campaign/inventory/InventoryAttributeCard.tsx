import React, { Fragment, useState } from "react";
import * as _ from "lodash";
import { Collapse, Card, DropdownButton, Dropdown, Button } from "react-bootstrap";
import { ScopeType } from "../../../../../../client/schemas";
import { Rights } from "../../../../../../models/Common";
import { InventoryRule } from "../../../../../../models/data/Campaign";
import FontIcon from "../../../../../UI/FontIcon";
import InventoryRuleRow from "./InventoryRuleRow";

export interface InventoryAttributeCardProps {
  title: string;
  rules: InventoryRule[];
  listRules?: InventoryRule[];
  attribute: string;
  listAttribute?: string;
  creatable: boolean;
  campaignId?: number;
  editAsText: boolean;
  createLists: boolean;
  listModalScope?: ScopeType;
  listModalScopeId?: number;
  listModalMaxLevel?: ScopeType;
  maxBidPrice: number;
  rights: Rights;
  onRuleChange: (index: number, rule: InventoryRule, isValid: boolean) => void;
  onListRuleChange?: (index: number, rule: InventoryRule, isValid: boolean) => void;
  onRuleDelete: (index: number) => void;
  onListRuleDelete?: (index: number) => void;
  onRuleAdd: (rule: InventoryRule) => void;
  onListRuleAdd?: (rule: InventoryRule) => void;
}

const InventoryAttributeCard = (props: InventoryAttributeCardProps) => {
  const [open, setOpen] = useState<boolean>(getInitialOpenState());
  const [newRuleId, setNewRuleId] = useState<number>(0);

  function getRulesProps() {
    return (props.rules || []).map((rule) => {
      let item: any = {
        isList: false,
        rule,
        campaignId: props.campaignId,
        attribute: props.attribute,
        attributeName: props.title,
        creatable: props.creatable,
        maxBidPrice: props.maxBidPrice,
        editAsText: props.editAsText,
        createLists: props.createLists,
        listModalScope: props.listModalScope,
        listModalScopeId: props.listModalScopeId,
        listModalMaxLevel: props.listModalMaxLevel,
        rights: props.rights,
        onChange: (i: number, rule: InventoryRule, isValid: boolean) => {
          props.onRuleChange(i, rule, isValid);
        },
        onDelete: (i: number) => {
          props.onRuleDelete(i);
        }
      };
      return item;
    });
  }

  function getListRulesProps() {
    return (props.listRules || []).map((rule, i) => {
      let item: any = {
        isList: true,
        rule,
        campaignId: props.campaignId,
        attribute: props.listAttribute,
        attributeName: `${props.title} lists`,
        creatable: false,
        maxBidPrice: props.maxBidPrice,
        listModalScope: props.listModalScope,
        listModalScopeId: props.listModalScopeId,
        listModalMaxLevel: props.listModalMaxLevel,
        rights: props.rights,
        onChange: (i: number, rule: InventoryRule, isValid: boolean) => {
          if (props.onListRuleChange) {
            props.onListRuleChange(i, rule, isValid);
          }
        },
        onDelete: (i: number) => {
          if (props.onListRuleDelete) {
            props.onListRuleDelete(i);
          }
        }
      };
      return item;
    });
  }

  const handleListRuleAdd = () => {
    if (props.onListRuleAdd) {
      props.onListRuleAdd(getNewRule());
    }
  }

  const handleRuleAdd = () => {
    props.onRuleAdd(getNewRule());
  }

  function getNewRule(): InventoryRule {
    const id = newRuleId - 1;
    setNewRuleId(id);
    return {
      id,
      values: [],
      displayNames: [],
      consequence: {
        action: "REQUIRED"
      }
    };
  }

  function getInitialOpenState() {
    return (props.rules || []).concat(props.listRules || []).length > 0;
  }

  const listRulesProps = getListRulesProps();
  const rulesProps = getRulesProps();
  const writeAccess = props.rights.MANAGE_CAMPAIGN || false;

  return <div className="inventory-rules-box">
    <Card id={`accordion-${props.attribute}`}>
      <Card.Header onClick={() => { setOpen(!open); }}>{props.title}</Card.Header>
      <Collapse in={open}>
        <Card.Body>
          {
            listRulesProps.map((ruleProps, i) => <InventoryRuleRow key={_.get(ruleProps, "rule.id")} index={i} {...ruleProps} />)
          }
          {
            rulesProps.map((ruleProps, i) => <InventoryRuleRow key={_.get(ruleProps, "rule.id")} index={i} {...ruleProps} />)
          }
          <div className="row no-gutters">
            <div className="col-lg-12 p-4">
              <div className="pull-right">
                {props.listAttribute &&
                  <DropdownButton
                    disabled={!writeAccess}
                    size="sm"
                    alignRight
                    title={<Fragment><FontIcon name="plus" /> CREATE RULE FROM</Fragment>}
                    id={`create-rule-dropdown-${props.attribute}`}
                  >
                    <Dropdown.Item disabled={!writeAccess} onClick={handleListRuleAdd}>Existing lists</Dropdown.Item>
                    <Dropdown.Item disabled={!writeAccess} onClick={handleRuleAdd}>Values</Dropdown.Item>
                  </DropdownButton>
                }
                {!props.listAttribute &&
                  <Button size="sm" disabled={!writeAccess} variant="primary" onClick={handleRuleAdd}><FontIcon name="plus" /> CREATE RULE</Button>
                }
              </div>
            </div>
          </div>
        </Card.Body>
      </Collapse>
    </Card>
  </div>;
}
export default InventoryAttributeCard;