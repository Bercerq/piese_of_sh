import { RequestHandler } from "express";
import * as _ from "lodash";
import { NOAX } from "../api/NOAX";
import ApiController from "./ApiController";

export default class SuggestionController extends ApiController {

  constructor(protected API: NOAX) {
    super(API);
    this.router.get("/*", this.get);
  }

  get: RequestHandler = async (req, res) => {
    try {
      const credentials = this.getCredentials(req);
      const path = req.path;
      let qs: any = {
        count: _.get(req.query, "count", 5000),
        search: _.get(req.query, "search", ""),
        start: _.get(req.query, "start", 0),
      };
      const campaignId = _.get(req.query, "campaignId");
      if (campaignId) {
        qs.campaignId = campaignId;
      }
      const response = await this.API.getSuggestion(credentials, { path, qs });
      const suggestions = (response || []).map((s) => { return { value: s.value, label: s.name } });
      const selectAll = _.get(req.query, "all", "true") === "true";
      if (selectAll) {
        suggestions.unshift({ value: -1, label: "Select all" });
      }
      res.json(suggestions);
    } catch (err) {
      res.status(500).json(err);
    }
  }
}