import { ReportTemplate } from "../../models/data/Report";
import { Api, Credentials } from "./Api";

export default class ReportTemplateApi extends Api {
  
  public getReportTemplates(credentials: Credentials, options?: any): Promise<any[]> {
    return this.Get({ path: `/reportTemplates`, credentials, qs: options }).then(this.handleErrors).then(this.handleResponseType);
  }

  public getPublisherReportTemplates(credentials: Credentials, options : { id: number }): Promise<any[]> {
    return this.Get({ path: `/reportTemplates/publisher`, credentials, qs: options }).then(this.handleErrors).then(this.handleResponseType);

  }
  public getReportTemplate(credentials: Credentials, options: any): Promise<any> {
    return this.Get({ path: `/reportTemplates/${options.id}`, credentials }).then(this.handleErrors).then(this.handleResponseType);
  }

  public createReportTemplate(credentials: Credentials, options: { data: ReportTemplate }): Promise<any> {
    return this.Post({ path: `/reportTemplates`, credentials, body: options.data }).then(this.handleErrors).then(this.handlePostResponseType);
  }

  public updateReportTemplate(credentials: Credentials, options: { id: number, data: ReportTemplate }): Promise<any> {
    return this.Put({ path: `/reportTemplates/${options.id}`, credentials, body: options.data }).then(this.handleErrors).then(this.handleResponseType);
  }

  public deleteReportTemplate(credentials: Credentials, options: { id: number }): Promise<any> {
    return this.Delete({ path: `/reportTemplates/${options.id}`, credentials }).then(this.handleErrors).then(this.handleResponseType);
  }
}