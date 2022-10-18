import React, { useEffect, useState } from "react";
import * as _ from "lodash";
import * as CampaignAdsHelper from "./CampaignAdsHelper";
import { AdsBoxFormData, AdsTabFormData, AdsTabProps } from "../../../../../../client/campaignSchemas";
import AdsBox from "./AdsBox";

const AdsTab = (props: AdsTabProps) => {
  const [adsBox, setAdsBox] = useState<AdsBoxFormData>(null);

  const submitData = getSubmitData();

  useEffect(() => {
    const initialSubmitData = getInitialSubmitData();
    if (JSON.stringify(submitData) !== initialSubmitData) {
      props.onChange(submitData);
    }
  }, [JSON.stringify(submitData)]);

  function getSubmitData(): AdsTabFormData {
    return {
      adsBox
    };
  }

  function getInitialSubmitData() {
    return JSON.stringify({ adsBox: null });
  }

  const adsBoxChange = (adsBoxData: AdsBoxFormData) => {
    setAdsBox(adsBoxData);
  }

  const adsBoxProps = CampaignAdsHelper.getAdsBoxProps(props.data, props.rights, props.isAdserving, props.dataFeedAllowed, adsBoxChange);

  return <div className="row no-gutters">
    <div className="col-lg-12">
      <AdsBox {...adsBoxProps} />
    </div>
  </div>
}
export default AdsTab;