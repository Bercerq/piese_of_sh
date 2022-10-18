import { Api, Credentials } from "./Api";
import { Segment } from "../../models/data/Segment";

export default class SegmentApi extends Api {

  public getSegments(credentials: Credentials, options?: any): Promise<any[]> {
    return this.Get({ path: `/segments`, credentials, qs: options }).then(this.handleErrors).then(this.handleResponseType);
  }

  public getSegmentStatistics(credentials: Credentials, options: { organizationId?: number; agencyId?: number; advertiserId?: number; startDate: string; endDate: string; }): Promise<any[]> {
    return this.Get({ path: `/segmentstats`, credentials, qs: options }).then(this.handleErrors).then(this.handleResponseType);
  }

  public createSegment(credentials: Credentials, options: { advertiserId: number; data: Segment }): Promise<any> {
    return this.Post({ path: `/advertisers/${options.advertiserId}/segments`, credentials, body: options.data }).then(this.handleErrors).then(this.handleResponseType);
  }

  public updateSegment(credentials: Credentials, options: { advertiserId: number; segmentId: number; data: Segment }): Promise<any> {
    return this.Put({ path: `/advertisers/${options.advertiserId}/segments/${options.segmentId}`, credentials, body: options.data }).then(this.handleErrors).then(this.handleResponseType);
  }

  public deleteSegment(credentials: Credentials, options: { advertiserId: number; segmentId: number; }): Promise<any> {
    return this.Delete({ path: `/advertisers/${options.advertiserId}/segments/${options.segmentId}`, credentials }).then(this.handleErrors).then(this.handleResponseType);
  }

}