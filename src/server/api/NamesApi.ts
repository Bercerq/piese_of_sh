import { Api, Credentials } from "./Api";
import { Scope } from "../../models/Common";

export default class NamesApi extends Api {

  public search(credentials: Credentials, options: { search: string }): Promise<any[]> {
    return this.Get({ path: "/names/search", credentials, qs: options }).then(this.handleErrors).then(this.handleResponseType);
  }
}