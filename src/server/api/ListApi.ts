import { Api, Credentials } from "./Api";
import { List } from "../../models/data/List";

export default class ListApi extends Api {

  public getLists(credentials: Credentials, options?: any): Promise<any> {
    return this.Get({ path: `/lists`, credentials, qs: options }).then(this.handleErrors).then(this.handleResponseType);
  }

  public getList(credentials: Credentials, options: {id: number}): Promise<any> {
    return this.Get({ path: `/lists/${options.id}`, credentials }).then(this.handleErrors).then(this.handleResponseType);
  }

  public createList(credentials: Credentials, options: { data: List }): Promise<any> {
    return this.Post({ path: `/lists`, credentials, body: options.data }).then(this.handleErrors).then(this.handleResponseType);
  }

  public updateList(credentials: Credentials, options: { id: number, data: List }): Promise<any> {
    return this.Put({ path: `/lists/${options.id}`, credentials, body: options.data }).then(this.handleErrors).then(this.handleResponseType);
  }

  public deleteList(credentials: Credentials, options: { id: number }): Promise<any> {
    return this.Delete({ path: `/lists/${options.id}`, credentials }).then(this.handleErrors).then(this.handleResponseType);
  }
}