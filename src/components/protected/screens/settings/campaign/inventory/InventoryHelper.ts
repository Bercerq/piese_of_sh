import * as _ from "lodash";
import * as CampaignHelper from "../../../../../../client/CampaignHelper";
import { DealsBoxFormData, DealsBoxProps, InventoryRulesBoxFormData, InventoryRulesBoxProps, InventoryTabProps, PublishersAndExchangesBoxFormData, PublishersAndExchangesBoxProps } from "../../../../../../client/campaignSchemas";
import { AppUser } from "../../../../../../models/AppUser";
import { Rights } from "../../../../../../models/Common";
import { CampaignSettings } from "../../../../../../models/data/Campaign";

export const getPublishersAndExchangesBoxProps = (data: CampaignSettings, rights: Rights, isAdserving: boolean, onChange: (data: PublishersAndExchangesBoxFormData) => void): PublishersAndExchangesBoxProps => {
  return {
    id: _.get(data, "campaign.id"),
    isAdserving,
    videoCampaign: _.get(data, "campaign.videoCampaign"),
    agencyId: _.get(data, "campaign.agencyId"),
    publishersAndExchanges: _.get(data, "settings.targeting.basicRules.inventory.publishersAndExchanges"),
    rights,
    onChange
  }
}

export const getDealsBoxProps = (data: CampaignSettings, rights: Rights, onChange: (data: DealsBoxFormData) => void): DealsBoxProps => {
  return {
    id: _.get(data, "campaign.id"),
    deals: _.get(data, "settings.deals", []),
    rights,
    onChange
  }
}

export const getInventoryRulesBoxProps = (data: CampaignSettings, maxBidPrice: number, rights: Rights, user: AppUser, onChange: (data: InventoryRulesBoxFormData, isValid: boolean) => void): InventoryRulesBoxProps => {
  return {
    id: _.get(data, "campaign.id"),
    advertiserId: _.get(data, "campaign.advertiserId"),
    user,
    rights,
    domains: _.get(data, "settings.targeting.basicRules.inventory.domains"),
    domainLists: _.get(data, "settings.targeting.basicRules.inventory.domainLists"),
    topLevelDomains: _.get(data, "settings.targeting.basicRules.inventory.topLevelDomains"),
    applications: _.get(data, "settings.targeting.basicRules.inventory.applications"),
    applicationLists: _.get(data, "settings.targeting.basicRules.inventory.applicationLists"),
    maxBidPrice,
    onChange
  }
}