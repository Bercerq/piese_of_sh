import * as _ from "lodash";
import moment from "moment";
import { AttributeValueName, BiddingType, CampaignClone, CampaignEntity, CampaignSettings, CampaignTag, Constraints, EntityCondition, GPSLocation, RuleActionType, RuleConsequence, SegmentCondition, StructureType, SuggestionItem } from "../models/data/Campaign";
import { BudgetPeriod, CampaignAdType, CampaignStatus, CampaignType, ExistingCampaign, ImpressionsPeriod, NewCampaign } from "./campaignSchemas";
import { ScopeType, SelectOption } from "./schemas";
import * as Api from "./Api";
import * as Helper from "./Helper";
import * as ExcelHelper from "./ExcelHelper";
import { AppUser } from "../models/AppUser";
import { NavigationItem } from "../models/data/NavigationItem";

export const budgetPeriodOptions = (): SelectOption[] => {
  return [
    { value: "day", label: "Per day" },
    { value: "week", label: "Per week" },
    { value: "month", label: "Per month" },
    { value: "campaign", label: "Entire campaign" }
  ];
}

export const impressionsPeriodOptions = (): SelectOption[] => {
  return [
    { value: "day", label: "Per day" },
    { value: "campaign", label: "Entire campaign" }
  ];
}

export const adTypeOptions = (): SelectOption[] => {
  return [
    { value: "display", label: "Banners" },
    { value: "video", label: "Video" }
  ];
}

export const biddingTypeOptions = (): SelectOption[] => {
  return [
    { value: "RTB", label: "Standard" },
    { value: "Adserving", label: "Fixed tags, externally managed" }
  ];
}

export const campaignTypeOptions = (biddingType: BiddingType): SelectOption[] => {
  if (biddingType === "RTB") {
    return [
      { value: "prospecting", label: "Prospecting" },
      { value: "retargeting", label: "Retargeting" },
      { value: "RETAIL_GPS", label: "Retail - GPS based" },
      { value: "RETAIL_ZIP", label: "Retail - postal code based" }
    ];
  } else {
    return [
      { value: "prospecting", label: "Prospecting" },
      { value: "RETAIL_GPS", label: "Retail - GPS based" },
      { value: "RETAIL_ZIP", label: "Retail - postal code based" }
    ];
  }
}

export const revenueTypeOptions = (videoCampaign: boolean): SelectOption[] => {
  if (videoCampaign) {
    return [
      { value: "1", label: "Impressions" },
      { value: "2", label: "Clicks" },
      { value: "3", label: "Conversions" },
      { value: "4", label: "Completion cost" }
    ];
  } else {
    return [
      { value: "1", label: "Impressions" },
      { value: "2", label: "Clicks" },
      { value: "3", label: "Conversions" },
      { value: "5", label: "Viewable impressions" }
    ];
  }
}

export const deliveryTypeOptions = (): SelectOption[] => {
  return [
    { value: "evenly", label: "Evenly" },
    { value: "frontloaded", label: "Frontloaded" },
    { value: "fast", label: "As fast as possible" }
  ];
}

export const commercialTypeOptions = (): SelectOption[] => {
  return [
    { value: "2", label: "CPC" },
    { value: "3", label: "CPA" },
    { value: "1", label: "CPM" },
    { value: "5", label: "% spent" },
    { value: "4", label: "None" }
  ];
}

export const frequencyCapsPeriodOptions = (): SelectOption[] => {
  return [
    { value: "DAY", label: "Per day" },
    { value: "WEEK", label: "Per week" },
    { value: "MONTH", label: "Per month" },
    { value: "ALL", label: "Entire campaign" }
  ];
}

export const ruleBidOptions = (): SelectOption[] => {
  return [
    { value: "REQUIRED", label: "Bid" },
    { value: "LIMIT_BID", label: "Bid no more than" },
    { value: "NO_BID", label: "No bid" }
  ];
}

export const timeUnitOptions = (): SelectOption[] => {
  return [
    { value: "MINUTE", label: "minutes" },
    { value: "HOUR", label: "hours" },
    { value: "DAY", label: "days" }
  ];
}

export const getRuleConsequence = (action: RuleActionType, limitBid: number): RuleConsequence => {
  if (action === "LIMIT_BID") {
    return { action, limitBid }
  } else {
    return { action };
  }
}

export const suggestionSelectOptions = (items: SuggestionItem[], selectAll?: boolean): SelectOption[] => {
  const options = items.map((item) => { return { value: item.value, label: item.name } });
  if (selectAll) {
    options.unshift({ value: "-1", label: "Select all" });
  }
  return options;
}

export const attributeValueNameSelectOptions = (data: AttributeValueName): SelectOption[] => {
  const values = _.get(data, "values", []);
  const displayNames = _.get(data, "displayNames", []);
  return values.map((value, i) => {
    return {
      value,
      label: displayNames[i] || ""
    }
  });
}

export const attributeIdValuesSelectOptions = (data: EntityCondition | SegmentCondition): SelectOption[] => {
  const ids = _.get(data, "ids", []);
  const displayNames = _.get(data, "displayNames", []);
  return ids.map((id, i) => {
    return {
      value: id,
      label: displayNames[i] || ""
    }
  });
}

export const gpsLocationsSelectOptions = (locations: GPSLocation[]): SelectOption[] => {
  return locations.map((location) => {
    const coordinates = [location.latitude, location.longitude].join(",");
    return { value: coordinates, label: coordinates };
  });
}

export const campaigngroupOptions = async (advertiserId: number): Promise<SelectOption[]> => {
  try {
    if (advertiserId > 0) {
      const qs = Helper.scopedParam({ scope: "advertiser", scopeId: advertiserId });
      const rslt = await Api.Get({ path: "/api/campaigngroups", qs });
      const campaigngroups = (rslt || []).map((o) => { return { value: o.campaignGroup.id, label: o.campaignGroup.name } });
      return [{ value: -1, label: "Choose group" }].concat(campaigngroups);
    } else {
      return [];
    }
  } catch (err) {
    console.log(err);
    return [];
  }
}

export const getListModalMaxLevel = async (user: AppUser, advertiserId: number): Promise<ScopeType> => {
  if (user.isRootAdmin) {
    return "root";
  } else {
    try {
      const items: NavigationItem[] = await Api.Get({ path: `/api/frontend/navigation/lists/advertiser/${advertiserId}` });
      if (items.length > 0) {
        return items[0].level;
      }
      return "advertiser";
    } catch (err) {
      "advertiser";
    }
  }
}

export const isRetail = (structure: StructureType | CampaignType): boolean => {
  return structure === "RETAIL_GPS" || structure === "RETAIL_ZIP";
}

export const isAdserving = (biddingType: BiddingType): boolean => {
  return biddingType === "Adserving";
}

export const getNewCampaignData = (data: NewCampaign): CampaignEntity => {
  const constraints = getBudgetConstraints(data.budget, data.budgetPeriod);
  let campaign: CampaignEntity = {
    name: data.name,
    advertiserId: data.advertiserId,
    startTime: data.startTime,
    endTime: data.endTime,
    videoCampaign: getVideoCampaignField(data.adType),
    biddingType: data.biddingType,
    revenueType: data.revenueType,
    isRetargeting: getRetargetingField(data.campaignType),
    structure: getStructureField(data.campaignType),
    constraints
  };

  if (data.clusterId > 0) {
    campaign.clusterId = data.clusterId;
  }

  if (data.retailBranches.length > 0) {
    campaign.retailBranches = data.retailBranches;
  }
  return campaign;
}

export const getExistingCampaignData = (data: ExistingCampaign): { id: number; campaign: CampaignClone } => {
  const constraints = getBudgetConstraints(data.budget, data.budgetPeriod);
  let campaign: CampaignClone = {
    name: data.name,
    startTime: data.startTime,
    endTime: data.endTime,
    constraints
  };
  if (data.clusterId > 0) {
    campaign.clusterId = data.clusterId;
  }
  return { id: data.campaignId, campaign };
}

export const getBudgetFields = (constraints: Constraints): { budget: number, budgetPeriod: BudgetPeriod } => {
  if (constraints) {
    if (constraints.maxBudgetPerCampaign) {
      return {
        budget: constraints.maxBudgetPerCampaign,
        budgetPeriod: "campaign"
      };
    } else if (constraints.maxBudgetPerMonth) {
      return {
        budget: constraints.maxBudgetPerMonth,
        budgetPeriod: "month"
      };
    } else if (constraints.maxBudgetPerWeek) {
      return {
        budget: constraints.maxBudgetPerWeek,
        budgetPeriod: "week"
      };
    } else if (constraints.maxBudgetPerDay) {
      return {
        budget: constraints.maxBudgetPerDay,
        budgetPeriod: "day"
      };
    }
  }
  return null;
}

export const getImpressionsFields = (constraints: Constraints): { impressions: number, impressionsPeriod: ImpressionsPeriod } => {
  if (constraints) {
    if (constraints.impressionsPerDayAllUsers) {
      return {
        impressions: constraints.impressionsPerDayAllUsers,
        impressionsPeriod: "day"
      };
    } else if (constraints.impressionsPerCampaignAllUsers) {
      return {
        impressions: constraints.impressionsPerCampaignAllUsers,
        impressionsPeriod: "campaign"
      };
    }
  }
  return null;
}

export const getEntityAttributes = (): string[] => {
  return ["adSelection", "deal", "domain(Lists)", "application(Lists)"]
}

export const getStatus = (isActive: boolean, startTime: number, endTime: number, status: string): CampaignStatus => {
  if (status === "archived") {
    return "archived";
  } else {
    if (endTime < moment().unix()) {
      if (moment.unix(endTime).format("YYYY-MM-DD") === "1970-01-01") { //some campaigns inserted by api get this default value
        return "not scheduled";
      } else {
        return "ended";
      }
    } else {
      if (startTime > moment().unix()) {
        if (isActive) {
          return "scheduled";
        } else {
          return "not scheduled";
        }
      } else {
        if (isActive) {
          return "active";
        } else {
          return "paused";
        }
      }
    }
  }
}

export const exportTags = (campaign: CampaignEntity, tags: CampaignTag[]) => {
  const tagHeaders = ["id", "name", "supported sizes", "click tag", "impression tag", "javascript tag", "iframe tag"].map((value) => { return ExcelHelper.getBoldCell(value); });
  const headerRows = [
    [ExcelHelper.getBoldCell("Campaign"), ExcelHelper.getCell(campaign.name)],
    [ExcelHelper.getBoldCell("Start date"), ExcelHelper.getCell(campaign.startDate)],
    [ExcelHelper.getBoldCell("End date"), ExcelHelper.getCell(campaign.endDate)],
    [""],
    tagHeaders
  ];
  const rows = tags.map((tag) => {
    const row = [tag.id.toString(), tag.name, tag.supportedSizes.join(","), tag.clickTag || "", tag.impressionTag || "", tag.javascriptTag || "", tag.iframeTag || ""];
    return row.map((col) => { return ExcelHelper.getCell(col) });
  });
  const exportData = headerRows.concat(rows);
  ExcelHelper.save(exportData, "Campaign tags", `Tags_${campaign.name}`);
}

function getBudgetConstraints(budget: number, budgetPeriod: BudgetPeriod) {
  switch (budgetPeriod) {
    case "day": return { maxBudgetPerDay: budget };
    case "week": return { maxBudgetPerWeek: budget };
    case "month": return { maxBudgetPerMonth: budget };
    case "campaign": return { maxBudgetPerCampaign: budget };
  }
}

function getVideoCampaignField(adType: CampaignAdType): boolean {
  return adType === "video";
}

function getRetargetingField(campaignType: CampaignType): boolean {
  return campaignType === "retargeting";
}

function getStructureField(campaignType: CampaignType): StructureType {
  if (campaignType === "prospecting" || campaignType === "retargeting") {
    return "DEFAULT";
  } else {
    return campaignType as StructureType;
  }
}