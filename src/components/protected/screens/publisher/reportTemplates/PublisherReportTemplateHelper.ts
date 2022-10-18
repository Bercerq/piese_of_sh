import * as _ from "lodash";
import * as Api from "../../../../../client/Api";
import { GroupOption, SelectOption } from "../../../../../client/schemas";
import { Scope } from "../../../../../models/Common";
import { AttributeCollection } from "../../../../../models/data/Attribute";

export const getStatisticAttributes = async (options: { scope: Scope, scopeId?: number }) => {
  try {
    const attributeCollection: AttributeCollection = await Api.Get({ path: "/api/attributes/statistics", qs: options });
    return attributeCollection;
  } catch (err) {
    console.log(err);
    return {};
  }
}

export const statisticAttributeOptions = (attributesObj: AttributeCollection): (GroupOption | SelectOption)[] => {
  const groupOptions = [];
  for (let group in attributesObj) {
    const attributes = attributesObj[group].map((attribute) => { return { value: attribute.name, label: attribute.displayName }; });
    const groupOption = {
      label: group,
      options: attributes
    };
    groupOptions.push(groupOption);
  }
  return ([{ value: "date", label: "Per day" }] as (GroupOption | SelectOption)[]).concat(groupOptions);
}