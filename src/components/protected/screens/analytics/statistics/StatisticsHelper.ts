import * as _ from "lodash";
import { GroupOption, SelectOption, StatisticFilter } from "../../../../../client/schemas";

export const getAttributeValue = (attributeId: number, attributeOptions: (GroupOption | SelectOption)[]) => {
  if (attributeId === 0) {
    return { value: 0, label: "Per day" };
  } else {
    const groupOptions = attributeOptions.concat();
    groupOptions.shift();
    const options: SelectOption[] = _.flatMap(groupOptions, (g: GroupOption) => { return g.options });
    const selected = options.find((o) => { return o.value === attributeId })
    return selected;
  }
}

export const getAttribute2Value = (attributeId2: number, attribute2Options: (GroupOption | SelectOption)[]) => {
  if (attributeId2 === 0) {
    return { value: 0, label: "Per day" };
  } else if (attributeId2 === -1) {
    return { value: -1, label: "Secondary dimension" };
  } else {
    const groupOptions = attribute2Options.concat().slice(2);
    const options: SelectOption[] = _.flatMap(groupOptions, (g: GroupOption) => { return g.options });
    const selected = options.find((o) => { return o.value === attributeId2 })
    return selected;
  }
}