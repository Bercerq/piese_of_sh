import { Api, Credentials } from "./Api";
import { AdvertiserEntity } from "../../models/data/Advertiser";
import { RetailBranch } from "../../models/data/RetailBranch";

export default class AdvertiserApi extends Api {

  public getAdvertisers(credentials: Credentials, options?: any): Promise<any> {
    return this.Get({ path: `/advertisers`, credentials, qs: options }).then(this.handleErrors).then(this.handleResponseType);
  }

  public getAdvertiser(credentials: Credentials, options: any): Promise<any> {
    return this.Get({ path: `/advertisers/${options.id}`, credentials }).then(this.handleErrors).then(this.handleResponseType);
  }

  public createAdvertiser(credentials: Credentials, options: { data: AdvertiserEntity }): Promise<any> {
    return this.Post({ path: `/advertisers`, credentials, body: options.data }).then(this.handleErrors).then(this.handleResponseType);
  }

  public updateAdvertiser(credentials: Credentials, options: { id: number, data: AdvertiserEntity }): Promise<any> {
    return this.Put({ path: `/advertisers/${options.id}`, credentials, body: options.data }).then(this.handleErrors).then(this.handleResponseType);
  }

  public deleteAdvertiser(credentials: Credentials, options: { id: number }): Promise<any> {
    return this.Delete({ path: `/advertisers/${options.id}`, credentials }).then(this.handleErrors).then(this.handleResponseType);
  }

  public getThirdPartyHosts(credentials: Credentials, options: { id: number }): Promise<any> {
    return this.Get({ path: `/advertisers/${options.id}/banners/thirdpartyhosts`, credentials }).then(this.handleErrors).then(this.handleResponseType);
  }

  public getRetailBranches(credentials: Credentials, options: any): Promise<any> {
    return this.Get({ path: `/advertisers/${options.id}/retailbranches`, credentials, qs: options.data || {} }).then(this.handleErrors).then(this.handleResponseType);
  }

  public importRetailBranches(credentials: Credentials, options: { id: number, data: { retailBranches: RetailBranch[], replaceAll: boolean } }): Promise<any> {
    return this.Post({ path: `/advertisers/${options.id}/retailbranches`, credentials, body: options.data }).then(this.handleErrors).then(this.handleResponseType);
  }

  public updateRetailBranch(credentials: Credentials, options: { id: number, retailBranchId: number, data: Partial<RetailBranch> }): Promise<any> {
    return this.Put({ path: `/advertisers/${options.id}/retailbranches/${options.retailBranchId}`, credentials, body: options.data }).then(this.handleErrors).then(this.handleResponseType);
  }

  public deleteRetailBranch(credentials: Credentials, options: { id: number, retailBranchId: number }): Promise<any> {
    return this.Delete({ path: `/advertisers/${options.id}/retailbranches/${options.retailBranchId}`, credentials }).then(this.handleErrors).then(this.handleResponseType);
  }
}