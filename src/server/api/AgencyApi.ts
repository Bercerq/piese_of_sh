import { Api, Credentials } from "./Api";
import { AgencyEntity, Agency } from "../../models/data/Agency";

export default class AgencyApi extends Api {

  public getAgencies(credentials: Credentials, options: any): Promise<{ organizations: Agency }> {
    return this.Get({ path: `/agencies`, credentials, qs: options }).then(this.handleErrors).then(this.handleResponseType);
  }

  public getAgency(credentials: Credentials, options: any): Promise<any> {
    return this.Get({ path: `/agencies/${options.id}`, credentials }).then(this.handleErrors).then(this.handleResponseType);
  }

  public createAgency(credentials: Credentials, options: { data: AgencyEntity }): Promise<any> {
    return this.Post({ path: `/agencies`, credentials, body: options.data }).then(this.handleErrors).then(this.handleResponseType);
  }

  public updateAgency(credentials: Credentials, options: { id: number, data: AgencyEntity }): Promise<any> {
    return this.Put({ path: `/agencies/${options.id}`, credentials, body: options.data }).then(this.handleErrors).then(this.handleResponseType);
  }

  public deleteAgency(credentials: Credentials, options: { id: number }): Promise<any> {
    return this.Delete({ path: `/agencies/${options.id}`, credentials }).then(this.handleErrors).then(this.handleResponseType);
  }
}