import { Api, Credentials } from "./Api";
import { PageType, ScopeType } from "../../client/schemas";

export default class FrontendApi extends Api {

  public navigation(credentials: Credentials, options: { page: PageType, scope: ScopeType, scopeId: number }): Promise<any[]> {
    return this.Get({ path: `/frontend/navigation/${options.page}/${options.scope}/${options.scopeId}`, credentials }).then(this.handleErrors).then(this.handleResponseType);
  }

  public navigationDropdown(credentials: Credentials, options: { page: PageType, scope: ScopeType, scopeId: number, targetScope: ScopeType }): Promise<any[]> {
    return this.Get({ path: `/frontend/navigation/${options.page}/${options.scope}/${options.scopeId}/dropdown/${options.targetScope}`, credentials }).then(this.handleErrors).then(this.handleResponseType);
  }

  public navigationItems(credentials: Credentials, options: { page: PageType, scope: ScopeType, manage: "true" | "false" }): Promise<any[]> {
    return this.Get({ path: `/frontend/navigation/${options.page}/${options.scope}`, credentials, qs: { manage: options.manage } }).then(this.handleErrors).then(this.handleResponseType);
  }

  public navigationLevel(credentials: Credentials, options: { page: PageType, scope: ScopeType, scopeId: number, level: ScopeType }): Promise<any[]> {
    return this.Get({ path: `/frontend/navigation/${options.page}/${options.scope}/${options.scopeId}/level/${options.level}`, credentials }).then(this.handleErrors).then(this.handleResponseType);
  }
}