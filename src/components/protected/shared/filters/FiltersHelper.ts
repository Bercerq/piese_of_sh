import * as _ from "lodash";
import * as Api from "../../../../client/Api";
import { StatisticFilter } from "../../../../client/schemas";
import { Scope } from "../../../../models/Common";
import { AttributeCollection } from "../../../../models/data/Attribute";

export const getFilterAttributes = async (options: { scope: Scope, scopeId?: number, video?: string }) => {
  try {
    const attributeCollection: AttributeCollection = await Api.Get({ path: "/api/attributes/filters", qs: options });
    return attributeCollection;
  } catch (err) {
    console.log(err);
    return {};
  }
}

export const getFilters = (statisticFilters: StatisticFilter[]): string[] => {
  const filters = _.flatMap(statisticFilters, (o) => {
    const condition = o.condition === "in" ? "==" : "!=";
    return o.values.map((v) => {
      return o.attributeId + condition + v;
    });
  });
  return filters;
}

export const getStatisticFilters = (filters: string[]): StatisticFilter[] => {
  const groupedFilters = getGroupedFilters(filters);
  const statisticFilters = [];
  _.forEach(groupedFilters, (items, group) => {
    const [attributeId, condition] = group.split('-');
    const values = items.map((item) => { return item.value; });
    statisticFilters.push({ attributeId: parseInt(attributeId, 10), condition, values });
  });
  return statisticFilters;
}

function getGroupedFilters(filters: string[]) {
  let filterItems = filters.map((filter) => {
    let parts = filter.split("==");
    if (parts.length === 2) {
      return {
        attributeId: parts[0],
        value: parts[1],
        condition: "in",
        group: `${parts[0]}-in`
      }
    } else {
      parts = filter.split("!=");
      if (parts.length === 2) {
        return {
          attributeId: parts[0],
          value: parts[1],
          condition: "notin",
          group: `${parts[0]}-notin`
        }
      }
    }
    return null;
  });
  filterItems = filterItems.filter(function (filter) { return filter !== null });
  return _.groupBy(filterItems, 'group');
}