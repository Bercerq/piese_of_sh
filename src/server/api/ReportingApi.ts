import { Api, Credentials } from "./Api";

export default class ReportingApi extends Api {
  public ssp(credentials: Credentials, options: { startDate: string, endDate: string }): Promise<any[]> {
    return this.Get({ path: `/reporting/ssp`, credentials, qs: options }).then(this.handleErrors).then(this.handleResponseType);
  }

  public financials(credentials: Credentials, options: { startDate: string, endDate: string }): Promise<any[]> {
    return this.Get({ path: `/reporting/financials`, credentials, qs: options }).then(this.handleErrors).then(this.handleResponseType);
  }
}