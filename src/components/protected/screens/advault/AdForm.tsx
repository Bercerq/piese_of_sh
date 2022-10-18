import React from "react";
import { Ad, AdType, LocalBannerData, LocalBanner, ThirdPartyHost } from "../../../../models/data/Ads";
import BannerForm from "./BannerForm";
import ThirdPartyForm from "./ThirdPartyForm";
import VideoForm from "./VideoForm";
import VASTForm from "./VASTForm";

export interface AdFormProps {
  ad?: Ad;
  adType?: AdType | "";
  localBanners?: LocalBanner[]; //after banners are uploaded send back to form in case of deletion
  thirdPartyHosts?: ThirdPartyHost[];
  submit: boolean;
  isSter?: boolean;
  onPreviewChange?: (ad: Partial<Ad>) => void;
  onUploadBanners?: (data: LocalBannerData) => void;
  onUploadVideo?: (uploaded: boolean) => void;
  onSubmit?: (error: boolean, ad: Partial<Ad>) => void;
  onCreate?: (error: boolean, ads: Partial<Ad>[]) => void;
}

const AdForm = (props: AdFormProps) => {
  if (props.ad) {
    if (props.ad.type == 5 && props.ad.local == true) { //video local ad
      return <VideoForm {...props} />;
    } else if (props.ad.local == false && (props.ad.type == 6 || props.ad.type == 7)) { //vast types - video 3rd party
      return <VASTForm {...props} />;
    } else if (props.ad.local == false) { //if the local is false and the banner is 3rd party, then fill the 3rd party form
      return <ThirdPartyForm {...props} />;
    } else { // the banner to be edited is a local banner and the local banner form is filled.
      return <BannerForm {...props} />
    }
  } else {
    if (props.adType === "video") {
      return <VideoForm {...props} />;
    } else if (props.adType === "vast") {
      return <VASTForm {...props} />;
    } else if (props.adType === "thirdparty") {
      return <ThirdPartyForm {...props} />;
    } else if (props.adType === "banner") {
      return <BannerForm {...props} />
    }
  }
  return null;
}
export default AdForm;