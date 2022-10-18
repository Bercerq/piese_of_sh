import { Api, Credentials } from "./Api";
import { Scope } from "../../models/Common";

export default class PresetsApi extends Api {

  public getPresets(credentials: Credentials, options: { scope: Scope, scopeId?: number }): Promise<any[]> {
    return this.Get({ path: "/presets", credentials, qs: options }).then(this.handleErrors).then(this.handleResponseType);
  }
}