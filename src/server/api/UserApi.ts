import { Api, Credentials } from "./Api";
import { UserInvite, UserBan } from "../../models/data/User";

export default class UserApi extends Api {

  public getUser(credentials: Credentials): Promise<any> {
    return this.Get({ path: "/users/me", credentials });
  }

  public changePassword(credentials: Credentials, options: { oldpass: string; newpass: string; }): Promise<any> {
    return this.PostForm({ path: "/users/me/password", credentials, body: options }).then(this.handleErrors).then(this.handleResponseType);
  }

  public twofactor(credentials: Credentials, options: {secret: string}): Promise<any> {
    return this.PostForm({ path: "/users/me/2fa", credentials, body: options}).then(this.handleErrors).then(this.handleResponseType);
  }
  
  public verifyCode(credentials: Credentials, options: {code: string}): Promise<any> {
    return this.PostForm({path: "/users/me/verifyCode", credentials, body: options}).then(this.handleErrors).then(this.handleResponseType);
  }

  public getUsers(credentials: Credentials, options?: any): Promise<any> {
    return this.Get({ path: `/users`, credentials, qs: options }).then(this.handleErrors).then(this.handleResponseType);
  }

  public userInvite(credentials: Credentials, options: { data: UserInvite }): Promise<any> {
    return this.Post({ path: `/users/invite`, credentials, body: options.data }).then(this.handleErrors).then(this.handleResponseType);
  }
  
  public userBan(credentials: Credentials, options: { data: UserBan }): Promise<any> {
    return this.Post({ path: `/users/ban`, credentials, body: options.data }).then(this.handleErrors).then(this.handleResponseType);
  }
}