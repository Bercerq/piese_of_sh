import { Api, Credentials } from "./Api";
import { CampaignGroupEntity } from "../../models/data/CampaignGroup";

export default class CampaignGroupApi extends Api {

  public getCampaignGroups(credentials: Credentials, options?: any): Promise<any> {
    return this.Get({ path: `/campaigngroups`, credentials, qs: options }).then(this.handleErrors).then(this.handleResponseType);
  }

  public getCampaignGroup(credentials: Credentials, options: any): Promise<any> {
    return this.Get({ path: `/campaigngroups/${options.id}`, credentials }).then(this.handleErrors).then(this.handleResponseType);
  }

  public createCampaignGroup(credentials: Credentials, options: { data: CampaignGroupEntity }): Promise<any> {
    return this.Post({ path: `/campaigngroups`, credentials, body: options.data }).then(this.handleErrors).then(this.handleResponseType);
  }

  public updateCampaignGroup(credentials: Credentials, options: { id: number, data: CampaignGroupEntity }): Promise<any> {
    return this.Put({ path: `/campaigngroups/${options.id}`, credentials, body: options.data }).then(this.handleErrors).then(this.handleResponseType);
  }

  public restoreCampaignGroup(credentials: Credentials, options: { id: number }): Promise<any> {
    return this.Put({ path: `/campaigngroups/${options.id}/restore`, credentials }).then(this.handleErrors).then(this.handleResponseType);
  }

  public deleteCampaignGroup(credentials: Credentials, options: { id: number }): Promise<any> {
    return this.Delete({ path: `/campaigngroups/${options.id}`, credentials }).then(this.handleErrors).then(this.handleResponseType);
  }
}