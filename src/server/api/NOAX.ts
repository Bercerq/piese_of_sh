import { Api, ApiConfig } from "./Api";
import LoginApi from "./LoginApi";
import UserApi from "./UserApi";
import OrganizationApi from "./OrganizationApi";
import AgencyApi from "./AgencyApi";
import AdvertiserApi from "./AdvertiserApi";
import CampaignGroupApi from "./CampaignGroupApi";
import CampaignApi from "./CampaignApi";
import AdsApi from "./AdsApi";
import NamesApi from "./NamesApi";
import FrontendApi from "./FrontendApi";
import AlertsApi from "./AlertsApi";
import StatisticsApi from "./StatisticsApi";
import PublisherApi from "./PublisherApi";
import PresetsApi from "./PresetsApi";
import AttributesApi from "./AttributesApi";
import ListApi from "./ListApi";
import DealApi from "./DealApi";
import SegmentApi from "./SegmentApi";
import ReportingApi from "./ReportingApi";
import ReportApi from "./ReportApi";
import ReportTemplateApi from "./ReportTemplateApi";
import SuggestionApi from "./SuggestionApi";
import CreativeFeedApi from "./CreativeFeedApi";
import { CreativeFeed } from "../../models/data/CreativeFeed";
import AdslotApi from "./AdslotApi";

export class NOAX extends Api {
  constructor(config: ApiConfig) {
    super(config);
  }
}

export interface NOAX extends
  Api,
  LoginApi,
  UserApi,
  OrganizationApi,
  PublisherApi,
  AgencyApi,
  AdvertiserApi,
  CampaignGroupApi,
  CampaignApi,
  ListApi,
  DealApi,
  AdsApi,
  NamesApi,
  FrontendApi,
  AlertsApi,
  StatisticsApi,
  PresetsApi,
  AttributesApi,
  SuggestionApi,
  SegmentApi,
  ReportingApi,
  ReportApi,
  AdslotApi,
  CreativeFeedApi,
  ReportTemplateApi {
  constructor(config: ApiConfig);
}

applyMixins(NOAX, [
  Api,
  LoginApi,
  UserApi,
  OrganizationApi,
  PublisherApi,
  AgencyApi,
  AdvertiserApi,
  CampaignGroupApi,
  CampaignApi,
  ListApi,
  DealApi,
  AdsApi,
  NamesApi,
  FrontendApi,
  AlertsApi,
  StatisticsApi,
  PresetsApi,
  AttributesApi,
  SuggestionApi,
  SegmentApi,
  ReportingApi,
  ReportApi,
  ReportTemplateApi,
  AdslotApi,
  CreativeFeedApi
]);

function applyMixins(derivedCtor: any, baseCtors: any[]) {
  baseCtors.forEach(baseCtor => {
    Object.getOwnPropertyNames(baseCtor.prototype).forEach(name => {
      Object.defineProperty(derivedCtor.prototype, name, Object.getOwnPropertyDescriptor(baseCtor.prototype, name));
    });
  });
}