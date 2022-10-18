import * as _ from "lodash";
import moment from "moment";
import * as Api from "./Api";
import { GroupOption, SelectOption, ScopeType, DateRangePreset, PageType } from "./schemas";
import { AppUser } from "../models/AppUser";
import { Scope } from "../models/Common";
import { UserRole } from "../models/data/User";
import Constants from "../modules/Constants";
import { AttributeCollection } from "../models/data/Attribute";
import { NavigationItem } from "../models/data/NavigationItem";

export const attributeIdOptions = (attributesObj: AttributeCollection): (GroupOption)[] => {
  const groupOptions = [];
  for (let group in attributesObj) {
    const attributes = attributesObj[group].map((attribute) => { return { value: attribute.attributeId, label: attribute.displayName, name: attribute.name, acceptAnyValue: attribute.acceptAnyValue === 1, attributeFormat: attribute.attributeDisplayFormat, chartTypes: attribute.chartTypes }; });
    const groupOption = {
      label: group,
      options: attributes
    };
    groupOptions.push(groupOption);
  }
  return groupOptions;
}

export const attributeOptions = (attributesObj: AttributeCollection): (GroupOption)[] => {
  const groupOptions = [];
  for (let group in attributesObj) {
    const attributes = attributesObj[group].map((attribute) => { return { value: attribute.name, label: attribute.displayName, acceptAnyValue: attribute.acceptAnyValue === 1, isList: attribute.isList === 1, listsAllowed: attribute.listsAllowed === 1 }; });
    const groupOption = {
      label: group,
      options: attributes
    };
    groupOptions.push(groupOption);
  }
  return groupOptions;
}

export const firstGroupSelectOption = (groupOptions: GroupOption[]): SelectOption => {
  const defaultOption = { value: -1, label: "Select..." };
  return _.get(groupOptions, "[0].options[0]", defaultOption);
}

export const findGroupSelectOption = (groupOptions: GroupOption[], value: string | number): SelectOption => {
  const defaultOption = { value: -1, label: "Select..." };
  const options: SelectOption[] = _.flatMap(groupOptions, (g: GroupOption) => { return g.options });
  const selected = options.find((o) => { return o.value === value })
  return selected || defaultOption;
}

export const getDateRangePresets = (): DateRangePreset[] => {
  return [{
    text: "Today",
    start: moment(),
    end: moment()
  }, {
    text: "Yesterday",
    start: moment().subtract(1, "days"),
    end: moment().subtract(1, "days")
  }, {
    text: "Last 7 days",
    start: moment().subtract(1, "week"),
    end: moment()
  }, {
    text: "Last 30 days",
    start: moment().subtract(29, "days"),
    end: moment()
  }, {
    text: "This month",
    start: moment().startOf("month"),
    end: moment()
  }, {
    text: "Last month",
    start: moment().subtract(1, "month").startOf("month"),
    end: moment().subtract(1, "month").endOf("month")
  }];
}

export const scopedParam = (options: { scope: ScopeType, scopeId: number }) => {
  let param = {};
  if (options.scope !== "root" && options.scopeId !== undefined) {
    const mapping = {
      organization: "organizationId",
      agency: "agencyId",
      advertiser: "advertiserId",
      publisher: "publisherId",
      campaigngroup: "campaignGroupId",
      campaign: "campaignId"
    }
    param[mapping[options.scope]] = options.scopeId;
  }
  return param;
}

export const getSourceScope = (scope: ScopeType): Scope => {
  switch (scope) {
    case "root": return "all";
    case "organization": return "metaAgency";
    case "campaigngroup": return "cluster";
    default: return scope;
  }
}

export const getSelectedMetrics = (email: string, defaultMetrics: string[], presetId: number): string[] => {
  const key = `${email}-metrics-${presetId}`;
  let selectedMetrics: string[] = [];
  try {
    selectedMetrics = JSON.parse(localStorage.getItem(key));
  } catch (err) {
    selectedMetrics = defaultMetrics;
  }
  return selectedMetrics || defaultMetrics;
}

export const storeSelectedMetrics = (email: string, selectedMetrics: string[], presetId: number) => {
  if (presetId > -1) {
    const key = `${email}-metrics-${presetId}`;
    localStorage.setItem(key, JSON.stringify(selectedMetrics));
  }
}

export const getMainRole = (user: AppUser): UserRole => {
  const userRoleKey = user.email + "-role";
  const mainRole = JSON.parse(localStorage.getItem(userRoleKey));
  if (!mainRole) {
    return user.roles[0];
  }
  return mainRole;
}

export const getVideoMode = (user: AppUser, mainRole: UserRole): boolean => {
  let videoMode: boolean = false;
  try {
    const videoModeKey = [user.email, mainRole.level, mainRole.entityId, "videomode"].join("-");
    videoMode = JSON.parse(localStorage.getItem(videoModeKey)) || false;
  } catch (err) {
    videoMode = false;
  }
  return videoMode;
}

export const storeVideoMode = (user: AppUser, mainRole: UserRole, videoMode: boolean) => {
  const videoModeKey = [user.email, mainRole.level, mainRole.entityId, "videomode"].join("-");
  localStorage.setItem(videoModeKey, videoMode.toString());
}

export const isSter = (agencyId: number) => {
  return Constants.STER_AGENCIES.indexOf(agencyId) > -1;
}

export const isAbovo = (agencyId: number) => {
  return Constants.ABOVO_AGENCIES.indexOf(agencyId) > -1;
}

export const getPopperConfig = () => {
  return {
    modifiers: {
      preventOverflow: {
        enabled: false
      },
      hide: {
        enabled: false
      }
    }
  };
}

export const completionBarColor = (actionType: number): string => {
  switch (actionType) {
    case 0: return 'green';
    case 1: return 'blue';
    case 2: return 'orange';
    case 3: return 'red';
  }
}

export const campaignSettingsLink = (pathname: string) => {
  //set fromDashboard state variable to be used in campaign settings cancel button
  return { pathname, state: { fromDashboard: true } };
}

export const getLabelByScope = (scope: Scope): string => {
  switch (scope) {
    case "all": return "All"
    case "metaAgency": return "Organization";
    case "agency": return "Agency";
    case "advertiser": return "Advertiser";
    case "cluster": return "Campaign group";
    case "campaign": return "Campaign"
    default: return "";
  }
}

export const getLabelByScopeType = (scope: ScopeType): string => {
  switch (scope) {
    case "root": return "All"
    case "organization": return "Organization";
    case "agency": return "Agency";
    case "advertiser": return "Advertiser";
    case "campaigngroup": return "Campaign group";
    case "campaign": return "Campaign"
    default: return "";
  }
}

export const getLevelOptions = (scope: ScopeType): SelectOption[] => {
  if (scope === "root") {
    return [
      { value: "root", label: "all" },
      { value: "organization", label: "organization" },
      { value: "agency", label: "agency" },
      { value: "advertiser", label: "advertiser" }
    ];
  } else if (scope === "organization") {
    return [
      { value: "organization", label: "organization" },
      { value: "agency", label: "agency" },
      { value: "advertiser", label: "advertiser" }
    ];
  } else if (scope === "agency") {
    return [
      { value: "agency", label: "agency" },
      { value: "advertiser", label: "advertiser" }
    ];
  } else if (scope === "advertiser") {
    return [
      { value: "advertiser", label: "advertiser" }
    ];
  } else if (scope === "publisher") {
    return [
      { value: "publisher", label: "publisher" }
    ];
  } else {
    return [];
  }
};

export const getLevelOptionsUptoCampaign = (scope: ScopeType): SelectOption[] => {
  if (scope === "root") {
    return [
      { value: "root", label: "all" },
      { value: "organization", label: "organization" },
      { value: "agency", label: "agency" },
      { value: "advertiser", label: "advertiser" },
      { value: "campaigngroup", label: "campaign group" },
      { value: "campaign", label: "campaign" }
    ];
  } else if (scope === "organization") {
    return [
      { value: "organization", label: "organization" },
      { value: "agency", label: "agency" },
      { value: "advertiser", label: "advertiser" },
      { value: "campaigngroup", label: "campaign group" },
      { value: "campaign", label: "campaign" }
    ];
  } else if (scope === "agency") {
    return [
      { value: "agency", label: "agency" },
      { value: "advertiser", label: "advertiser" },
      { value: "campaigngroup", label: "campaign group" },
      { value: "campaign", label: "campaign" }
    ];
  } else if (scope === "advertiser") {
    return [
      { value: "advertiser", label: "advertiser" },
      { value: "campaigngroup", label: "campaign group" },
      { value: "campaign", label: "campaign" }
    ];
  } else if (scope === "campaigngroup") {
    return [
      { value: "campaigngroup", label: "campaign group" },
      { value: "campaign", label: "campaign" }
    ];
  } else if (scope === "campaign") {
    return [
      { value: "campaign", label: "campaign" }
    ];
  } else if (scope === "publisher") {
    return [
      { value: "publisher", label: "publisher" }
    ];
  } {
    return [];
  }
};

export const getEntityOptions = async (page: PageType, scope: ScopeType, scopeId: number, level: ScopeType): Promise<SelectOption[]> => {
  try {
    const rslt = await Api.Get({ path: `/api/frontend/navigation/${page}/${scope}/${scopeId}/level/${level}` });
    return rslt.map((o) => { return { value: o.id, label: o.name } });
  } catch (err) {
    return [];
  }
}

export const getScopeByLevel = (level: ScopeType): Scope => {
  if (level === "root") {
    return "all";
  } else if (level === "organization") {
    return "metaAgency";
  } else if (level === "campaigngroup") {
    return "cluster";
  } else {
    return level as Scope;
  }
}

export const getMaxLevel = (user: AppUser, items: NavigationItem[]): ScopeType => {
  if (user.isRootAdmin) {
    return "root";
  } else {
    if (items.length > 0) {
      return items[0].level;
    }
  }
  return "advertiser";
}