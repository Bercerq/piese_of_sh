import React from "react";
import * as CampaignHelper from "../../../../../../client/CampaignHelper";
import { ScopeType } from "../../../../../../client/schemas";
import { StrategyRuleConditionType } from "../../../../../../models/data/Campaign";
import AttributeValues from "./AttributeValues";
import Cities from "./Cities";
import Entities from "./Entities";
import GPS from "./GPS";
import IPAddress from "./IPAddress";
import PostalCodes from "./PostalCodes";
import Segments from "./Segments";
import UserInteraction from "./UserInteraction";

export interface StrategyRuleConditionProps {
  index: number;
  campaignId: number;
  strategyId: string | number;
  writeAccess: boolean;
  attribute: string;
  attributeName: string;
  acceptAnyValue: boolean;
  listsAllowed: boolean;
  isList: boolean;
  createLists: boolean;
  listModalScope: ScopeType;
  listModalScopeId: number;
  listModalMaxLevel: ScopeType;
  condition: StrategyRuleConditionType;
  onChange: (condition: StrategyRuleConditionType, isValid?: boolean) => void;
}

const StrategyRuleCondition = (props: StrategyRuleConditionProps) => {
  const entityAttributes = CampaignHelper.getEntityAttributes();
  if (props.attribute === "userInteraction") {
    return <UserInteraction {...props} />;
  } else if (props.attribute === "postalCode") {
    return <PostalCodes {...props} />
  } else if (props.attribute === "cityDistance") {
    return <Cities {...props} />
  } else if (props.attribute === "ip") {
    return <IPAddress {...props} />
  } else if (props.attribute === "gps" || props.attribute === "gpsHyperLocal") {
    return <GPS {...props} />
  } else if (entityAttributes.indexOf(props.attribute) > -1) {
    return <Entities {...props} />;
  } else if (props.attribute === "segment") {
    return <Segments {...props} />;
  } else {
    return <AttributeValues {...props} />
  }
}
export default StrategyRuleCondition;