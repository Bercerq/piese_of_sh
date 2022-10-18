import { Api, Credentials } from "./Api";

export default class AlertsApi extends Api {

  public getCampaignAlerts(credentials: Credentials): Promise<any[]> {
    return this.Get({ path: "/alerts/campaigns", credentials }).then(this.handleErrors).then(this.handleResponseType);
  }
}