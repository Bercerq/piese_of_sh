import { Api, Credentials } from "./Api";
import { Organization, OrganizationEntity } from "../../models/data/Organization";

export default class OrganizationApi extends Api {

  public getOrganizations(credentials: Credentials, options: any): Promise<{ organizations: Organization[] }> {
    return this.Get({ path: `/organizations`, credentials, qs: options }).then(this.handleErrors).then(this.handleResponseType);
  }

  public getOrganization(credentials: Credentials, options: { id: number }): Promise<Organization> {
    return this.Get({ path: `/organizations/${options.id}`, credentials }).then(this.handleErrors).then(this.handleResponseType);
  }

  public createOrganization(credentials: Credentials, options: { data: OrganizationEntity }): Promise<any> {
    return this.Post({ path: `/organizations`, credentials, body: options.data }).then(this.handleErrors).then(this.handleResponseType);
  }

  public updateOrganization(credentials: Credentials, options: { id: number, data: OrganizationEntity }): Promise<any> {
    return this.Put({ path: `/organizations/${options.id}`, credentials, body: options.data }).then(this.handleErrors).then(this.handleResponseType);
  }

  public deleteOrganization(credentials: Credentials, options: { id: number }): Promise<any> {
    return this.Delete({ path: `/organizations/${options.id}`, credentials }).then(this.handleErrors).then(this.handleResponseType);
  }
}