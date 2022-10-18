import { LookUp } from "../Common";

export interface Ad {
  id: number;
  bannerId?: number;
  name: string;
  width: number;
  height: number;
  durationMS: number;
  type: number;
  adType?: string;
  active: 0 | 1;
  cookieLess: 0 | 1;
  submissionType: 0 | 1;
  local: boolean;
  clickUrl: string;
  previewTag: string;
  preview?: string; //will be used for uploaded banners before saving
  tag: string;
  vastXML: string;
  vastURL: string;
  bannerMemSize: number;
  advertiser: string;
  advertiserId: number;
  agency: string;
  agencyId?: number;
  approved?: -1 | 1 | 0 | -2;
  thirdPartyEventsServerSide?: 0 | 1;
  adWorking: boolean;
  title?: string;
  companyDomain?: string;
  imageUrl?: string;
  facebookUrl?: string;
  facebookId?: string;
  message?: string;
  utmCode?: string;
  clicktag?: string;
  backup_type?: string;
  adx_status?: string;
  adx_errors?: string;
  appnexus_status?: string;
  appnexus_errors?: string;
  id_status?: number;
  id_errors?: string;
  fileId?: string;
  jsFile?: string;
  imgFile?: string;
  indexFile?: string;
  thirdPartyImpressions?: string[];
  thirdPartyClicks?: string[];
  thirdPartyTracking?: string[];
  hostAt3rdParty?: string;
  displayBanner?: boolean;
  path?:string;
  filename?:string;
  uuid?:string;
  tag_type?: number;
  file?: File;
  activeCampaigns?: LookUp[];
  addClickLayer?: 0 | 1;
  requestRehost?: 0 | 1 | 2 | 3
}

export interface AdPreview {
  preview: string
}

export interface AdqueueRow {
  id: number;
  advertiserId: number;
  agencyId: number;
  name: string;
  adType: string;
  dimension: string;
  fileSize: number;
  cookieLess: 0 | 1;
  agencyName: string;
  advertiserName: string;
}

export type AdqueueUpdateAction = "approve" | "disapprove" | "disablecookieless" | "enablecookieless";

export type AdUpdateAction = "activate" | "deactivate" | "approve" | "disapprove" | "request" | "withdrawrequest" | "requestrehost";

export type AdType = "banner" | "thirdparty" | "vast" | "video";

export interface AdRow {
  id: number;
  name: string;
  adType: string;
  advertiserId: number;
  advertiserName: string;
  cookieLess: 0 | 1;
  approved: -1 | 1 | 0 | -2;
  active: 0 | 1;
  dimension: string;
  status: { color: string; title: string; };
  fileSize: number;
  activeCampaigns?: LookUp[];
}

export type InvalidLocalBannerType = "dir" | "file";

export interface LocalBannerData {
  banners: LocalBanner[];
  invalid: InvalidLocalBanner[];
  toDelete: string[];
  zip: string[];
}

export interface LocalBanner {
  name: string;
  path: string;
  preview: string;
  type: number;
  width: number;
  height: number;
}

export interface InvalidLocalBanner {
  name: string;
  type: InvalidLocalBannerType;
  msg: string;
}

export interface ThirdPartyHost {
  name: string;
  sspName: string;
}