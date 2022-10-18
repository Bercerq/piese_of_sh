import * as _ from "lodash";
import { SegmentsBoxFormData, SegmentsBoxProps, SegmentsTabProps } from "../../../../../../client/campaignSchemas";
import { Rights } from "../../../../../../models/Common";
import { CampaignSettings } from "../../../../../../models/data/Campaign";

export const getSegmentsBoxProps = (data: CampaignSettings, maxBidPrice: number, rights: Rights, onChange: (data: SegmentsBoxFormData) => void): SegmentsBoxProps => {
  return {
    id: _.get(data, "campaign.id"),
    advertiserId: _.get(data, "campaign.advertiserId"),
    rights,
    maxBidPrice,
    segmentRules: _.get(data, "settings.targeting.basicRules.user.segmentRules", []),
    digitalAudience: _.get(data, "settings.targeting.basicRules.user.digitalAudience", { displayNames: [], values: [] }),
    onChange
  }
}

