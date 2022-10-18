import { Api, Credentials } from "./Api";

export default class SuggestionApi extends Api {

  public getSuggestion(credentials: Credentials, options: { path: string, qs?: any }): Promise<any> {
    return this.Get({ path: `/targeting/suggestion${options.path}`, qs: options.qs, credentials }).then(this.handleErrors).then(this.handleResponseType);
  }
}