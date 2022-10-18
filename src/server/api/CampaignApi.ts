import { Api, Credentials } from "./Api";
import { ChangelogOptions } from "../../models/Common";
import { Campaign, CampaignBanner, CampaignClone, CampaignDeal, CampaignEntity, CampaignTag, Constraints, MetricTargets, Qualification, RetailStrategy, Targeting } from "../../models/data/Campaign";
import * as Helper from "../../client/Helper";
import { ScopeType } from "../../client/schemas";

export default class CampaignApi extends Api {

  public getCampaigns(credentials: Credentials, options?: any): Promise<any> {
    return this.Get({ path: `/campaigns`, credentials, qs: options }).then(this.handleErrors).then(this.handleResponseType);
  }

  public getCampaign(credentials: Credentials, options: any): Promise<Campaign> {
    return this.Get({ path: `/campaigns/${options.id}`, credentials }).then(this.handleErrors).then(this.handleResponseType);
  }

  public createCampaign(credentials: Credentials, options: { data: CampaignEntity }): Promise<any> {
    return this.Post({ path: `/campaigns`, credentials, body: options.data }).then(this.handleErrors).then(this.handleResponseType);
  }

  public updateCampaign(credentials: Credentials, options: { id: number; data: CampaignEntity }): Promise<any> {
    return this.Put({ path: `/campaigns/${options.id}`, credentials, body: options.data }).then(this.handleErrors).then(this.handleResponseType);
  }

  public cloneCampaign(credentials: Credentials, options: { id: number; data: CampaignClone }): Promise<any> {
    return this.Post({ path: `/campaigns/${options.id}/clone`, credentials, body: options.data }).then(this.handleErrors).then(this.handleResponseType);
  }

  public getCampaignSegmentStatistics(credentials: Credentials, options: { id: number; startDate: string; endDate: string; }): Promise<any[]> {
    return this.Get({ path: `/campaigns/${options.id}/segmentstats`, credentials, qs: { startDate: options.startDate, endDate: options.endDate } }).then(this.handleErrors).then(this.handleResponseType);
  }

  public getCampaignSettingsHistory(credentials: Credentials, options: ChangelogOptions): Promise<any> {
    return this.Get({ path: `/CampaignSettingsHistory`, credentials, qs: options }).then(this.handleErrors).then(this.handleResponseType);
  }

  public restoreCampaign(credentials: Credentials, options: { id: number }): Promise<any> {
    return this.Put({ path: `/campaigns/${options.id}/restore`, credentials }).then(this.handleErrors).then(this.handleResponseType);
  }

  public deleteCampaign(credentials: Credentials, options: { id: number }): Promise<any> {
    return this.Delete({ path: `/campaigns/${options.id}`, credentials }).then(this.handleErrors).then(this.handleResponseType);
  }

  public getCampaignPacingBudget(credentials: Credentials, options: { id: number }): Promise<any> {
    return this.Get({ path: `/campaigns/${options.id}/pacing/budget`, credentials }).then(this.handleErrors).then(this.handleResponseType);
  }

  public getCampaignPacingImpressions(credentials: Credentials, options: { id: number }): Promise<any> {
    return this.Get({ path: `/campaigns/${options.id}/pacing/impressions`, credentials }).then(this.handleErrors).then(this.handleResponseType);
  }

  public getCampaignConstraints(credentials: Credentials, options: { id: number }): Promise<Constraints> {
    return this.Get({ path: `/campaigns/${options.id}/constraint`, credentials }).then(this.handleErrors).then(this.handleResponseType);
  }

  public updateCampaignConstraints(credentials: Credentials, options: { id: number, data: Constraints }): Promise<any> {
    return this.Put({ path: `/campaigns/${options.id}/constraint`, credentials, body: options.data }).then(this.handleErrors).then(this.handleResponseType);
  }

  public getCampaignMetricTargets(credentials: Credentials, options: { id: number }): Promise<any> {
    return this.Get({ path: `/campaigns/${options.id}/metrictargets`, credentials }).then(this.handleErrors).then(this.handleResponseType);
  }

  public updateCampaignMetricTargets(credentials: Credentials, options: { id: number, data: MetricTargets }): Promise<any> {
    return this.Put({ path: `/campaigns/${options.id}/metrictargets`, credentials, body: options.data }).then(this.handleErrors).then(this.handleResponseType);
  }

  public getCampaignTargeting(credentials: Credentials, options: { id: number }): Promise<any> {
    return this.Get({ path: `/campaigns/${options.id}/targeting`, credentials }).then(this.handleErrors).then(this.handleResponseType);
  }

  public updateCampaignTargeting(credentials: Credentials, options: { id: number, data: Targeting }): Promise<any> {
    return this.Put({ path: `/campaigns/${options.id}/targeting`, credentials, body: options.data }).then(this.handleErrors).then(this.handleResponseType);
  }

  public getCampaignDeals(credentials: Credentials, options: { id: number, includedeals: "true" | "false" }): Promise<any> {
    return this.Get({ path: `/campaigns/${options.id}/deals/all`, credentials, qs: { includedeals: options.includedeals } }).then(this.handleErrors).then(this.handleResponseType);
  }

  public updateCampaignDeals(credentials: Credentials, options: { id: number, data: { deals: CampaignDeal[] } }): Promise<any> {
    return this.Put({ path: `/campaigns/${options.id}/deals/all`, credentials, body: options.data }).then(this.handleErrors).then(this.handleResponseType);
  }

  public getCampaignAds(credentials: Credentials, options: { id: number, includebanner: "true" | "false" }): Promise<any> {
    return this.Get({ path: `/campaigns/${options.id}/campaignbanners`, credentials, qs: { includebanner: options.includebanner } }).then(this.handleErrors).then(this.handleResponseType);
  }

  public createCampaignAd(credentials: Credentials, options: { id: number, data: CampaignBanner }): Promise<any> {
    return this.Post({ path: `/campaigns/${options.id}/campaignbanners`, credentials, body: options.data }).then(this.handleErrors).then(this.handlePostResponseType);
  }

  public updateCampaignAd(credentials: Credentials, options: { id: number, campaignAdId: number; data: Partial<CampaignBanner> }): Promise<any> {
    return this.Put({ path: `/campaigns/${options.id}/campaignbanners/${options.campaignAdId}`, credentials, body: options.data }).then(this.handleErrors).then(this.handleResponseType);
  }

  public deleteCampaignAd(credentials: Credentials, options: { id: number, campaignAdId: number; }): Promise<any> {
    return this.Delete({ path: `/campaigns/${options.id}/campaignbanners/${options.campaignAdId}`, credentials }).then(this.handleErrors).then(this.handleResponseType);
  }

  public getCampaignTags(credentials: Credentials, options: { id: number }): Promise<any> {
    return this.Get({ path: `/campaigns/${options.id}/tags`, credentials }).then(this.handleErrors).then(this.handleResponseType);
  }

  public createCampaignTag(credentials: Credentials, options: { id: number, data: CampaignTag }): Promise<any> {
    return this.Post({ path: `/campaigns/${options.id}/tags`, credentials, body: options.data }).then(this.handleErrors).then(this.getIdFromHeader);
  }

  public updateCampaignTag(credentials: Credentials, options: { id: number, tagId: number; data: Partial<CampaignTag> }): Promise<any> {
    return this.Put({ path: `/campaigns/${options.id}/tags/${options.tagId}`, credentials, body: options.data }).then(this.handleErrors).then(this.getIdFromHeader);
  }

  public getDataFeeds(credentials: Credentials, options: { id: number }): Promise<any> {
    const scope = Helper.scopedParam({ scope: "campaign", scopeId: options.id });
    return this.Get({ path: `/dynamicfeeds`, credentials, qs: scope }).then(this.handleErrors).then(this.handleResponseType);
  }

  public getCampaignRetailStrategies(credentials: Credentials, options: { id: number }): Promise<any> {
    return this.Get({ path: `/campaigns/${options.id}/retailstrategies`, credentials }).then(this.handleErrors).then(this.handleResponseType);
  }

  public updateCampaignRetailStrategies(credentials: Credentials, options: { id: number, data: { retailStrategies: RetailStrategy[], replaceAll: boolean } }): Promise<any> {
    return this.Post({ path: `/campaigns/${options.id}/retailstrategies`, credentials, body: options.data }).then(this.handleErrors).then(this.handleResponseType);
  }

  public updateCampaignStatus(credentials: Credentials, options: { id: number, action: "activate" | "deactivate" }): Promise<any> {
    return this.Post({ path: `/campaigns/${options.id}/${options.action}`, credentials }).then(this.handleErrors).then(this.handleResponseType);
  }
}