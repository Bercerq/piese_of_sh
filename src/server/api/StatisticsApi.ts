import { Api, Credentials } from "./Api";
import { StatisticsOptions, TimeseriesOptions } from "../../models/data/Statistics";

export default class StatisticsApi extends Api {
  public getStatistics(credentials: Credentials, options: StatisticsOptions): Promise<any> {
    return this.Get({ path: `/statistics/partial`, credentials, qs: options }).then(this.handleErrors).then(this.handleResponseType);
  }

  public getSummary(credentials: Credentials, options: StatisticsOptions): Promise<any> {
    return this.Get({ path: `/statistics/summary`, credentials, qs: options }).then(this.handleErrors).then(this.handleResponseType);
  }

  public getTimeseries(credentials: Credentials, options: TimeseriesOptions): Promise<any> {
    return this.Get({ path: `/statistics/timeseries`, credentials, qs: options }).then(this.handleErrors).then(this.handleResponseType);
  }

  public getTimeseriesTechnical(credentials: Credentials, options: TimeseriesOptions): Promise<any> {
    return this.Get({ path: `/statistics/timeseries/technical`, credentials, qs: options }).then(this.handleErrors).then(this.handleResponseType);
  }
}