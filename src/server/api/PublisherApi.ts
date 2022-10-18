import { Api, Credentials } from "./Api";
import { PublisherDeal } from "../../models/data/PublisherDeal";
import { PublisherSettings } from "../../models/data/Publisher";

export default class PublisherApi extends Api {

  public getPublishers(credentials: Credentials, options?: any): Promise<any> {
    return this.Get({ path: `/sell/publishers`, credentials, qs: options }).then(this.handleErrors).then(this.handleResponseType);
  }

  public getPublisher(credentials: Credentials, options: { id: number }): Promise<any> {
    return this.Get({ path: `/sell/publishers/${options.id}`, credentials }).then(this.handleErrors).then(this.handleResponseType);
  }

  public updatePublisher(credentials: Credentials, options: { id: number, data: PublisherSettings }): Promise<any> {
    return this.Put({ path: `/sell/publishers/${options.id}`, credentials, body: options.data }).then(this.handleErrors).then(this.handleResponseType);
  }
  
  public getPublisherNames(credentials: Credentials): Promise<any> {
    return this.Get({ path: `/sell/publishers/names`, credentials }).then(this.handleErrors).then(this.handleResponseType);
  }

  public getPublisherDealRequests(credentials: Credentials, options: { id: number }): Promise<any> {
    return this.Get({ path: `/sell/publishers/${options.id}/dealrequests`, credentials }).then(this.handleErrors).then(this.handleResponseType);
  }

  public getPublisherDeals(credentials: Credentials, options: { id: number }): Promise<any> {
    return this.Get({ path: `/sell/publishers/${options.id}/deals`, credentials }).then(this.handleErrors).then(this.handleResponseType);
  }

  public updatePublisherDeal(credentials: Credentials, options: { id: number, dealId: number, data: PublisherDeal }): Promise<any> {
    return this.Put({ path: `/sell/publishers/${options.id}/deals/${options.dealId}`, credentials, body: options.data }).then(this.handleErrors).then(this.handleResponseType);
  }

  public deletePublisherDeal(credentials: Credentials, options: { id: number, dealId: number }): Promise<any> {
    return this.Delete({ path: `/sell/publishers/${options.id}/deals/${options.dealId}`, credentials }).then(this.handleErrors).then(this.handleResponseType);
  }

  public approveDealRequest(credentials: Credentials, options: { id: number, dealRequestId: number, data: PublisherDeal }): Promise<any> {
    return this.Post({ path: `/sell/publishers/${options.id}/dealrequests/${options.dealRequestId}/approve`, credentials, body: options.data }).then(this.handleErrors).then(this.handleResponseType);
  }

  public rejectDealRequest(credentials: Credentials, options: { id: number, dealRequestId: number }): Promise<any> {
    return this.Post({ path: `/sell/publishers/${options.id}/dealrequests/${options.dealRequestId}/reject`, credentials }).then(this.handleErrors).then(this.handleResponseType);
  }
}