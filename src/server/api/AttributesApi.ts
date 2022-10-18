import { Api, Credentials } from "./Api";
import { AttributesOptions } from "../../models/Common";

export default class AttributesApi extends Api {

  public getAttributeValues(credentials: Credentials, options?: { attributeId: string, data: any }): Promise<any> {
    return this.Get({ path: `/Attributes/${options.attributeId}/AttributeValues`, credentials, qs: options.data }).then(this.handleErrors).then(this.handleResponseType);
  }

  public getFilterAttributeValues(credentials: Credentials, options?: { attributeId: string, data: any }): Promise<any> {
    return this.Get({ path: `/Attributes/${options.attributeId}/AttributeValues/filter`, credentials, qs: options.data }).then(this.handleErrors).then(this.handleResponseType);
  }

  public postAttributeValues(credentials: Credentials, options?: { attributeId: string, data: { values: string[] } }): Promise<any> {
    return this.Post({ path: `/Attributes/${options.attributeId}/AttributeValues`, credentials, body: options.data }).then(this.handleErrors).then(this.handleResponseType);
  }

  public getListAttributes(credentials: Credentials): Promise<any> {
    return this.Get({ path: `/allowedattributes/lists`, credentials }).then(this.handleErrors).then(this.handleResponseType);
  }

  public getStatisticsAttributes(credentials: Credentials, options: AttributesOptions): Promise<any> {
    return this.Get({ path: `/allowedattributes/statistics`, credentials, qs: options }).then(this.handleErrors).then(this.handleResponseType);
  }

  public getFilterAttributes(credentials: Credentials, options: AttributesOptions): Promise<any> {
    return this.Get({ path: `/allowedattributes/filters`, credentials, qs: options }).then(this.handleErrors).then(this.handleResponseType);
  }

  public getCustomAttributes(credentials: Credentials, options: AttributesOptions): Promise<any> {
    return this.Get({ path: `/allowedattributes/customs`, credentials, qs: options }).then(this.handleErrors).then(this.handleResponseType);

  }
  public getTargetingAttributes(credentials: Credentials, options: AttributesOptions): Promise<any> {
    return this.Get({ path: `/allowedattributes/targeting`, credentials, qs: options }).then(this.handleErrors).then(this.handleResponseType);
  }

  public DATargeting(credentials: Credentials): Promise<any> {
    return this.Get({ path: `/da-targeting`, credentials }).then(this.handleErrors).then(this.handleResponseType);
  }

}