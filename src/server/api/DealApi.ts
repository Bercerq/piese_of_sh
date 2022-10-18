import { Api, Credentials } from "./Api";
import { Deal, DealRequest } from "../../models/data/Deal";

export default class DealApi extends Api {

  public getDeals(credentials: Credentials, options?: any): Promise<any> {
    return this.Get({ path: `/deals`, credentials, qs: options }).then(this.handleErrors).then(this.handleResponseType);
  }

  public getDeal(credentials: Credentials, options: { id: number }): Promise<any> {
    return this.Get({ path: `/deals/${options.id}`, credentials }).then(this.handleErrors).then(this.handleResponseType);
  }

  public createDeal(credentials: Credentials, options: { data: Deal }): Promise<any> {
    return this.Post({ path: `/deals`, credentials, body: options.data }).then(this.handleErrors).then(this.handleResponseType);
  }

  public createDealRequest(credentials: Credentials, options: { data: DealRequest }): Promise<any> {
    return this.Post({ path: `/deals/request`, credentials, body: options.data }).then(this.handleErrors).then(this.handleResponseType);
  }

  public updateDeal(credentials: Credentials, options: { id: number, data: Deal }): Promise<any> {
    return this.Put({ path: `/deals/${options.id}`, credentials, body: options.data }).then(this.handleErrors).then(this.handleResponseType);
  }

  public deleteDeal(credentials: Credentials, options: { id: number }): Promise<any> {
    return this.Delete({ path: `/deals/${options.id}`, credentials }).then(this.handleErrors).then(this.handleResponseType);
  }
}