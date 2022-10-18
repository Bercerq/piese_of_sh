import * as _ from "lodash";
import * as CampaignHelper from "../../../../../../client/CampaignHelper";
import { AdsBoxFormData, AdsBoxProps, AdsTabProps } from "../../../../../../client/campaignSchemas";
import { Rights } from "../../../../../../models/Common";
import { CampaignSettings } from "../../../../../../models/data/Campaign";

export const getAdsBoxProps = (data: CampaignSettings, rights: Rights, isAdserving: boolean, dataFeedAllowed: boolean,
  onChange: (data: AdsBoxFormData) => void): AdsBoxProps => {
  return {
    id: _.get(data, "campaign.id"),
    advertiserId: _.get(data, "campaign.advertiserId"),
    branches: _.get(data, "settings.retailStrategies"),
    rights,
    isAdserving,
    dataFeedAllowed,
    videoCampaign: _.get(data, "campaign.videoCampaign"),
    ads: _.get(data, "settings.ads", []),
    tags: _.get(data, "settings.tags", []),
    dataFeeds: _.get(data, "settings.dataFeeds", []),
    onChange
  }
}