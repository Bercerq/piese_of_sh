import { Api } from "./Api";

export default class LoginApi extends Api {

  public resetPassword(options: { email: string }): Promise<any> {
    return this.Post({ path: "/login/resetpassword", qs: options, contentType: "text/plain" }).then(this.handleErrors).then(res => res.text());
  }

  public setPassword(options: { email: string; hash: string; password: string; }): Promise<any> {
    return this.Post({ path: "/login/setpassword", body: options }).then(this.handleErrors).then(res => res.text());
  }
}