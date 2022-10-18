import { response } from "express";
import { Report } from "../../models/data/Report";
import { Api, Credentials } from "./Api";

export default class ReportApi extends Api {

  public getReports(credentials: Credentials, options?: any): Promise<any[]> {
    return this.Get({ path: `/reports`, credentials, qs: options }).then(this.handleErrors).then(this.handleResponseType);
  }

  public getPublisherReports(credentials: Credentials, options : { id: number }): Promise<any[]> {
    return this.Get({ path: `/reports/publisher`, credentials, qs: options }).then(this.handleErrors).then(this.handleResponseType);

  }

  public getReport(credentials: Credentials, options: any): Promise<any> {
    return this.Get({ path: `/reports/${options.id}`, credentials }).then(this.handleErrors).then(this.handleResponseType);
  }

  public createReport(credentials: Credentials, options: { data: Report }): Promise<any> {
    return this.Post({ path: `/reports`, credentials, body: options.data }).then(this.handleErrors).then(this.handleResponseType);
  }

  public updateReport(credentials: Credentials, options: { id: number, data: Report }): Promise<any> {
    return this.Put({ path: `/reports/${options.id}`, credentials, body: options.data }).then(this.handleErrors).then(this.handleResponseType);
  }

  public deleteReport(credentials: Credentials, options: { id: number }): Promise<any> {
    return this.Delete({ path: `/reports/${options.id}`, credentials }).then(this.handleErrors).then(this.handleResponseType);
  }

  public getReportInstances(credentials: Credentials, options?: any): Promise<any[]> {
    return this.Get({ path: `/reports/${options.id}/instances`, credentials, qs: { limit: options.limit } }).then(this.handleErrors).then(this.handleResponseType);
  }

  public downloadReportInstance(credentials: Credentials, options?: any) {
    return this.GetFile({ path: `/reports/${options.id}/instances/${options.instanceId}/download`, credentials });
  }

  public createReportToken(credentials: Credentials, options?: any): Promise<any> {
    return this.Post({ path: `/reports/${options.id}/token`, credentials });
  }

  public getReportToken(credentials: Credentials, options?: any): Promise<any> {
    return this.Get({ path: `/reports/${options.id}/token`, credentials })
      .then((res) => { return (!res.ok) ? { token: null } : this.handleResponseType(res); });
  }

  public deleteReportToken(credentials: Credentials, options?: any): Promise<any> {
    return this.Delete({ path: `/reports/${options.id}/token`, credentials });
  }

}