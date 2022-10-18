const fetch = require('node-fetch');
const request = require("request");

import * as querystring from "qs";
import * as _ from "lodash";
import { Scope } from "../../models/Common";
import * as configproperties from "../../../config";


export interface ApiConfig {
  host: string;
  timeout: number; //in milliseconds
}

export interface ApiParams {
  path: string;
  credentials?: Credentials;
  qs?: any;
  body?: any;
  contentType?: string;
}

export interface Credentials {
  username: string;
  password: string;
}

export class Api {
  private config: ApiConfig;

  constructor(config: ApiConfig) {
    this.config = config;
  }

  protected handleErrors(res) {
    if (!res.ok) {
      throw Error(res.statusText);
    }
    return res;
  }

  protected handleResponseType(res) {
    const contentType = res.headers.get("content-type");
    if (contentType && contentType.indexOf("application/json") !== -1) {
      return res.json();
    } else {
      return res.text();
    }
  }

  protected getIdFromHeader = function (response) {
    if (!!response) {
      return response.headers.get('Object-ID');
    } else {
      console.log('Undefined response in function getIdFromHeader');
      return null;
    }
  
  }
  protected handlePostResponseType(res) {
    return res.headers.get("object-id");
  }

  protected Get(params: ApiParams): Promise<any> {
    const url = Api.buildUrl(this.config.host, params.path, params.qs);
    console.log("GET: ", url);
    const headers = this.getHeaders(params);
    return fetch(url, { method: 'GET', timeout: this.config.timeout, headers });
  }

  protected GetFile(params: ApiParams) {
    const url = Api.buildUrl(this.config.host, params.path, params.qs);
    console.log("GET: ", url);
    const headers = this.getHeaders(params);
    const fileRequest = request({
      url: url,
      headers: headers
    });
    return fileRequest;
  }

  protected Post(params: ApiParams): Promise<any> {
    const url = Api.buildUrl(this.config.host, params.path, params.qs);
    console.log("POST: ", url);
    const headers = this.getHeaders(params);
    const body = params.body ? JSON.stringify(params.body) : "";
    return fetch(url, { method: 'POST', timeout: this.config.timeout, headers, body });
  }

  protected PostForm(params: ApiParams): Promise<any> {
    const url = Api.buildUrl(this.config.host, params.path, params.qs);
    console.log("POST: ", url);
    const headerParams: ApiParams = _.assign({}, params, { contentType: "application/x-www-form-urlencoded" });
    const headers = this.getHeaders(headerParams);
    const body = params.body ? querystring.stringify(params.body) : "";
    return fetch(url, { method: 'POST', timeout: this.config.timeout, headers, body });
  }

  protected PostMultipartForm(params: ApiParams): Promise<any> {
    const url = Api.buildUrl(this.config.host, params.path, params.qs);
    console.log("POST: ", url);
    const headers = { 
      'Authorization': "Basic " + Buffer.from(params.credentials.username + ":" + params.credentials.password).toString("base64"),
      'Proxy-Authorization': Buffer.from(configproperties.dashboarduser + ":" + configproperties.dashboardpass).toString("base64")
    }
    const body = params.body;
    return fetch(url, { method: 'POST', timeout: this.config.timeout, headers, body });
  }

  protected Put(params: ApiParams): Promise<any> {
    const url = Api.buildUrl(this.config.host, params.path, params.qs);
    console.log("PUT: ", url);
    const headers = this.getHeaders(params);
    const body = params.body ? JSON.stringify(params.body) : "";
    return fetch(url, { method: 'PUT', timeout: this.config.timeout, headers, body });
  }

  protected Delete(params: ApiParams): Promise<any> {
    const url = Api.buildUrl(this.config.host, params.path, params.qs);
    console.log("DELETE: ", url);
    const headers = this.getHeaders(params);
    return fetch(url, { method: 'DELETE', headers });
  }

  public static ScopedParam(options: { scope: Scope, scopeId: number }) {
    let param = {};
    if (options.scope && options.scopeId !== undefined) {
      const mapping = {
        metaAgency: "organizationId",
        agency: "agencyId",
        advertiser: "advertiserId",
        cluster: "campaignGroupId",
        publisher: "publisherId"
      }
      param[mapping[options.scope]] = options.scopeId;
    }
    return param;
  }

  private getHeaders(params: ApiParams) {
    if (params.credentials) {
      return {
        'Content-Type': params.contentType || "application/json",
        'Authorization': "Basic " + Buffer.from(params.credentials.username + ":" + params.credentials.password).toString("base64"),
        'Proxy-Authorization': Buffer.from(configproperties.dashboarduser + ":" + configproperties.dashboardpass).toString("base64")
      };
    }
    return {
      'Content-Type': params.contentType || "application/json"
    };
  }

  private static buildUrl(host: string, path: string, qs?: any): string {
    if (qs) {
      return host + path + "?" + querystring.stringify(qs, { arrayFormat: 'repeat' });
    }
    return host + path;
  }
}