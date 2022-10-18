import { RequestHandler } from "express";
import * as _ from "lodash";
import ApiController from "./ApiController";
import { NOAX } from "../api/NOAX";
import { Scope, AttributesOptions } from "../../models/Common";

export default class AttributesController extends ApiController {

  constructor(protected API: NOAX) {
    super(API);
    this.router.get("/:attributeid/values", this.getValues);
    this.router.get("/:attributeid/values/filter", this.getFilterValues);
    this.router.post("/:attributeid/values", this.postValues);
    this.router.get("/lists", this.getListAttributes);
    this.router.get("/statistics", this.getStatisticsAttributes);
    this.router.get("/filters", this.getFilterAttributes);
    this.router.get("/customs", this.getCustomAttributes);
    this.router.get("/targeting", this.getTargetingAttributes);
    this.router.get("/da-targeting", this.getDATargeting);
  }

  getValues: RequestHandler = async (req, res) => {
    try {
      const credentials = this.getCredentials(req);
      const attributeId = req.params.attributeid;
      let data: any = {
        count: _.get(req.query, "count", 500),
        substrings: _.get(req.query, "substrings", ""),
        start: _.get(req.query, "start", 0),
      };
      if (req.query.campaignId) data.campaignId = req.query.campaignId;
      const attributeValues = await this.API.getAttributeValues(credentials, { attributeId, data });
      res.json(attributeValues);
    } catch (err) {
      console.log(err);
      res.status(500).json(err);
    }
  }

  getFilterValues: RequestHandler = async (req, res) => {
    try {
      const credentials = this.getCredentials(req);
      const attributeId = req.params.attributeid;
      let data: any = {
        count: 5000,
        substrings: _.get(req.query, "substrings", ""),
        start: 0,
      };
      const results = await this.API.getFilterAttributeValues(credentials, { attributeId, data });
      const attributeValues = results.map((o) => { return { value: o.value, label: o.name } });
      attributeValues.unshift({ value: -1, label: "Select all" });
      res.json(attributeValues);
    } catch (err) {
      console.log(err);
      res.status(500).json(err);
    }
  }

  postValues: RequestHandler = async (req, res) => {
    try {
      const credentials = this.getCredentials(req);
      const attributeId = req.params.attributeid;
      const data = req.body as { values: string[] };
      const response = await this.API.postAttributeValues(credentials, { attributeId, data });
      const values = response.map(function (o) {
        return o.value;
      });
      const invalidValues = _.difference(data.values, values);
      res.json({ invalid: invalidValues, valid: values });
    } catch (err) {
      console.log(err);
      res.status(500).json({ err: "Attribute values could not be retrieved. API call failed." });
    }
  }

  getListAttributes: RequestHandler = async (req, res) => {
    try {
      const credentials = this.getCredentials(req);
      const attributes = await this.API.getListAttributes(credentials);
      res.json(attributes);
    } catch (err) {
      console.log(err);
      res.status(500).json(err);
    }
  }

  getStatisticsAttributes: RequestHandler = async (req, res) => {
    try {
      const credentials = this.getCredentials(req);
      let options: AttributesOptions = {
        scope: req.query.scope as Scope,
        video: req.query.video as ("true" | "false"),
      }
      if (req.query.scopeId) options.scopeId = parseInt(req.query.scopeId as string, 10);
      const attributes = await this.API.getStatisticsAttributes(credentials, options);
      res.json(attributes);
    } catch (err) {
      console.log(err);
      res.status(500).json(err);
    }
  }

  getFilterAttributes: RequestHandler = async (req, res) => {
    try {
      const credentials = this.getCredentials(req);
      let options: AttributesOptions = {
        scope: req.query.scope as Scope,
        video: req.query.video as ("true" | "false"),
      }
      if (req.query.scopeId) options.scopeId = parseInt(req.query.scopeId as string, 10);
      const attributes = await this.API.getFilterAttributes(credentials, options);
      res.json(attributes);
    } catch (err) {
      console.log(err);
      res.status(500).json(err);
    }
  }

  getTargetingAttributes: RequestHandler = async (req, res) => {
    try {
      const credentials = this.getCredentials(req);
      let options: AttributesOptions = {
        scope: req.query.scope as Scope,
        video: req.query.video as ("true" | "false"),
      }
      if (req.query.scopeId) options.scopeId = parseInt(req.query.scopeId as string, 10);
      const attributes = await this.API.getTargetingAttributes(credentials, options);
      res.json(attributes);
    } catch (err) {
      console.log(err);
      res.status(500).json(err);
    }
  }


  getCustomAttributes: RequestHandler = async (req, res) => {
    try {
      const credentials = this.getCredentials(req);
      let options: AttributesOptions = {
        scope: req.query.scope as Scope,
        video: req.query.video as ("true" | "false"),
      }
      if (req.query.scopeId) options.scopeId = parseInt(req.query.scopeId as string, 10);
      const attributes = await this.API.getCustomAttributes(credentials, options);
      res.json(attributes);
    } catch (err) {
      console.log(err);
      res.status(500).json(err);
    }
  }

  getDATargeting: RequestHandler = async (req, res) => {
    try {
      const credentials = this.getCredentials(req);
      const DATargeting = await this.API.DATargeting(credentials);
      res.json(DATargeting);
    } catch (err) {
      console.log(err);
      res.status(500).json(err);
    }
  }
}