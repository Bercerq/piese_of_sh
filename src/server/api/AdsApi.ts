import { Api, Credentials } from "./Api";
import { Ad } from "../../models/data/Ads";
import * as _ from "lodash";

export default class AdsApi extends Api {

  public getAdqueue(credentials: Credentials): Promise<any[]> {
    return this.Get({ path: "/bannerqueue", credentials }).then(this.handleErrors).then(this.handleResponseType);
  }

  public createAds(credentials: Credentials, options: { advertiserId: number, data: any }): Promise<any> {
    return this.PostMultipartForm({ path: `/advertisers/${options.advertiserId}/banners`, credentials, body: options.data }).then(this.handleErrors).then(this.handleResponseType);
  }

  public updateAd(credentials: Credentials, options: { id: number, advertiserId: number, data: Partial<Ad> }): Promise<any> {
    return this.Put({ path: `/advertisers/${options.advertiserId}/banners/${options.id}`, credentials, body: options.data }).then(this.handleErrors).then(this.handleResponseType);
  }

  public deleteAd(credentials: Credentials, options: { id: number, advertiserId: number }): Promise<any> {
    return this.Delete({ path: `/advertisers/${options.advertiserId}/banners/${options.id}`, credentials }).then(this.handleErrors).then(this.handleResponseType);
  }

  public getBanners(credentials: Credentials, options: { scopeId: number, active?: boolean }): Promise<any[]> {
    return this.Get({ path: `/advertisers/${options.scopeId}/banners`, credentials, qs: { active: options.active || false } }).then(this.handleErrors).then(this.handleResponseType);
  }

  public getVideos(credentials: Credentials, options: { scopeId: number, active?: boolean }): Promise<any[]> {
    return this.Get({ path: `/advertisers/${options.scopeId}/videos`, credentials, qs: { active: options.active || false } }).then(this.handleErrors).then(this.handleResponseType);
  }

  public getAd(credentials: Credentials, options: { id: number }): Promise<any[]> {
    return this.Get({ path: `/ads/${options.id}`, credentials }).then(this.handleErrors).then(this.handleResponseType);
  }
  
  public getAdPreview(credentials: Credentials, options: { advertiserId: number, id: number, campaignId?: number, campaignBannerId?: number, 
    branchId?: number, datafeedId?: number, dataFeedOptions?: any}): Promise<any[]> {
    let path = `/advertisers/${options.advertiserId}/banners/${options.id}/preview/`;
     if (options?.campaignId) {
       path += `campaign/${options.campaignId}/`
     }
     if (options?.branchId) {
      path += `branch/${options.branchId}/`
     } 
     if (options?.campaignBannerId) {
       path += `campaignbanner/${options.campaignBannerId}/`
     }
     if (options?.datafeedId) {
       path += `datafeed/${options.datafeedId}/`
     }
    let getParams = { path: path , credentials }
    if (options.dataFeedOptions && Object.keys(options.dataFeedOptions).length > 0) {
      getParams = _.assign(getParams, {qs : options.dataFeedOptions})
    }
    return this.Get(getParams).then(this.handleErrors).then(this.handleResponseType);
  }

  public getAds(credentials: Credentials, options?: any): Promise<any[]> {
    return this.Get({ path: `/ads`, credentials, qs: options }).then(this.handleErrors).then(this.handleResponseType);
  }

}