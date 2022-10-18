import * as _ from "lodash";
import { BrowserBoxFormData, BrowserBoxProps, GeoTargetingBoxFormData, GeoTargetingBoxProps, LanguageBoxFormData, LanguageBoxProps, OSBoxFormData, OSBoxProps, PositionBoxFormData, PositionBoxProps, TargetingTabProps, VideoTargetingBoxFormData, VideoTargetingBoxProps } from "../../../../../../client/campaignSchemas";
import { Rights } from "../../../../../../models/Common";
import { CampaignSettings } from "../../../../../../models/data/Campaign";

export const getPositionBoxProps = (data: CampaignSettings, rights: Rights, onChange: (data: PositionBoxFormData) => void): PositionBoxProps => {
  return {
    id: _.get(data, "campaign.id"),
    deviceTypes: _.get(data, "settings.targeting.basicRules.device.deviceType.values") || [],
    inventoryTypes: _.get(data, "settings.targeting.basicRules.inventory.inventoryType.values") || [],
    positionTypes: _.get(data, "settings.targeting.basicRules.inventory.positionOnPage.values") || [],
    rights,
    onChange
  }
}

export const getVideoTargetingBoxProps = (data: CampaignSettings, rights: Rights, onChange: (data: VideoTargetingBoxFormData) => void): VideoTargetingBoxProps => {
  return {
    id: _.get(data, "campaign.id"),
    playerSizes: _.get(data, "settings.targeting.basicRules.inventory.playerSize.values") || [],
    initiationTypes: _.get(data, "settings.targeting.basicRules.inventory.initiationType.values") || [],
    rights,
    onChange
  }
}

export const getBrowserBoxProps = (data: CampaignSettings, rights: Rights, onChange: (data: BrowserBoxFormData) => void): BrowserBoxProps => {
  return {
    id: _.get(data, "campaign.id"),
    browsers: _.get(data, "settings.targeting.basicRules.device.browser.values") || [],
    rights,
    onChange
  }
}

export const getOSBoxProps = (data: CampaignSettings, rights: Rights, onChange: (data: OSBoxFormData) => void): OSBoxProps => {
  return {
    id: _.get(data, "campaign.id"),
    os: _.get(data, "settings.targeting.basicRules.device.os.values") || [],
    rights,
    onChange
  }
}

export const getLanguageBoxProps = (data: CampaignSettings, rights: Rights, onChange: (data: LanguageBoxFormData) => void): LanguageBoxProps => {
  return {
    id: _.get(data, "campaign.id"),
    languages: _.get(data, "settings.targeting.basicRules.device.language.values") || [],
    rights,
    onChange
  }
}

export const getGeoTargetingBoxProps = (data: CampaignSettings, rights: Rights, onChange: (data: GeoTargetingBoxFormData, isValid: boolean) => void): GeoTargetingBoxProps => {
  return {
    id: _.get(data, "campaign.id"),
    countries: _.get(data, "settings.targeting.basicRules.device.geo.country"),
    regions: _.get(data, "settings.targeting.basicRules.device.geo.region"),
    cities: _.get(data, "settings.targeting.basicRules.device.geo.city"),
    postalCodes: _.get(data, "settings.targeting.basicRules.device.geo.postalCode"),
    rights,
    onChange
  }
}