import { Api, Credentials } from "./Api";
import { CreativeFeed } from "../../models/data/CreativeFeed";

export default class CreativeFeedApi extends Api {

  public getCreativeFeeds(credentials: Credentials, options?: any): Promise<any[]> {
    return this.Get({ path: "/dynamicfeeds", credentials, qs: options}).then(this.handleErrors).then(this.handleResponseType);
  }

  public getSpecificCreativeFeed(credentials: Credentials, id : Number, options?: any): Promise<any[]> {
    return this.Get({ path: `/dynamicfeeds/${id}`, credentials, qs: options}).then(this.handleErrors).then(this.handleResponseType);
  }

  public createCreativeFeed(credentials: Credentials, options?: any): Promise<any[]> {
    return this.Post({ path: "/dynamicfeeds", credentials, body: options.data}).then(this.handleErrors).then(this.handleResponseType);
  }

  public updateCreativeFeed(credentials: Credentials, id : Number, options?: any): Promise<any[]> {
    return this.Put({ path: `/dynamicfeeds/${id}`, credentials, body: options.data}).then(this.handleErrors).then(this.handleResponseType);
  }

  public deleteCreativeFeed(credentials: Credentials, id : Number, options?: any): Promise<any[]> {
    return this.Delete({ path: `/dynamicfeeds/${id}`, credentials, body: options.data}).then(this.handleErrors).then(this.handleResponseType);
  }
}