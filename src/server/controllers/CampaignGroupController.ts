import { RequestHandler } from "express";
import { Controller } from "./Controller";
import * as _ from "lodash";
import moment from "moment";
import Constants from "../../modules/Constants";
import * as Roles from "../../modules/Roles";
import ApiController from "./ApiController";
import { Api } from "../api/Api";
import { NOAX } from "../api/NOAX";
import { CampaignGroupEntity, CampaignGroup } from "../../models/data/CampaignGroup";
import { StatisticsOptions } from "../../models/data/Statistics";
import { Scope } from "../../models/Common";
import { Attributes } from "../../modules/Enums";

export default class CampaignGroupController extends ApiController implements Controller {

  constructor(protected API: NOAX) {
    super(API);
    this.router.get("", this.getAll);
    this.router.get("/statistics", this.getStatistics);
    this.router.get("/:id", this.get);
    this.router.post("", this.post);
    this.router.put("/:id", this.put);
    this.router.put("/:id/restore", this.restore);
    this.router.delete("/", this.deleteAll);
    this.router.delete("/:id", this.delete);
  }

  get: RequestHandler = async (req, res) => {
    try {
      const credentials = this.getCredentials(req);
      const id = parseInt(req.params.id, 10);
      const campaignGroup = await this.API.getCampaignGroup(credentials, { id });
      res.json(campaignGroup);
    } catch (err) {
      res.status(500).json(err);
    }
  }

  getAll: RequestHandler = async (req, res) => {
    try {
      const credentials = this.getCredentials(req);
      const options = _.assign({}, { limit: Constants.MAX_API_LIMIT }, req.query);
      const data = await this.API.getCampaignGroups(credentials, options);
      res.json(data.campaignGroups || []);
    } catch (err) {
      res.status(500).json(err);
    }
  }

  getStatistics: RequestHandler = async (req, res) => {
    try {
      const credentials = this.getCredentials(req);
      const params = Api.ScopedParam({ scope: req.query.scope as Scope, scopeId: req.query.scopeId as any });
      const options = _.assign({}, params, { limit: Constants.MAX_API_LIMIT, includeArchived: true });
      let data;
      if (req.query.statistics === "true") {
        let statisticsOptions: StatisticsOptions = {
          scope: req.query.scope as Scope,
          attributeId: Attributes.CLUSTER,
          startDate: req.query.startDate as string,
          endDate: req.query.endDate as string,
          limit: Constants.MAX_API_LIMIT,
          videoMetrics: req.query.videoMetrics as "true" | "false" | "any",
          simple: "true",
          aggregator: "name"
        };
        if (req.query.scopeId) statisticsOptions.scopeId = parseInt(req.query.scopeId as string, 10);
        const campaignGroupsP = this.API.getCampaignGroups(credentials, options);
        const statisticsP = this.API.getStatistics(credentials, statisticsOptions);
        data = await Promise.all([campaignGroupsP, statisticsP]);
      } else {
        const campaignGroups = await this.API.getCampaignGroups(credentials, options);
        data = [campaignGroups];
      }
      const statistics = transformCampaignGroups(data);
      res.json(statistics);
    } catch (err) {
      res.status(500).json(err);
    }
  }

  post: RequestHandler = async (req, res) => {
    try {
      const credentials = this.getCredentials(req);
      const campaignGroup = req.body as CampaignGroupEntity;
      await this.API.createCampaignGroup(credentials, { data: campaignGroup });
      res.json({ msg: "ok" });
    } catch (err) {
      res.status(500).json(err);
    }
  }

  put: RequestHandler = async (req, res) => {
    try {
      const credentials = this.getCredentials(req);
      const id = parseInt(req.params.id, 10);
      const campaignGroup = req.body as CampaignGroupEntity;
      await this.API.updateCampaignGroup(credentials, { id, data: campaignGroup });
      res.json({ msg: "ok" });
    } catch (err) {
      res.status(500).json(err);
    }
  }

  restore: RequestHandler = async (req, res) => {
    try {
      const credentials = this.getCredentials(req);
      const id = parseInt(req.params.id, 10);
      await this.API.restoreCampaignGroup(credentials, { id });
      res.json({ msg: "ok" });
    } catch (err) {
      res.status(500).json(err);
    }
  }

  delete: RequestHandler = async (req, res) => {
    try {
      const credentials = this.getCredentials(req);
      const id = parseInt(req.params.id, 10);
      await this.API.deleteCampaignGroup(credentials, { id });
      res.json({ msg: "ok" });
    } catch (err) {
      res.status(500).json(err);
    }
  }

  deleteAll: RequestHandler = async (req, res) => {
    try {
      const credentials = this.getCredentials(req);
      const { scope, scopeId, endDate } = req.query;
      const params = Api.ScopedParam({ scope: scope as Scope, scopeId: scopeId as any });
      const options = _.assign({}, params, { limit: Constants.MAX_API_LIMIT });
      const data = await this.API.getCampaignGroups(credentials, options);
      const campaignGroups = data.campaignGroups || [];
      const campaignGroupIds = getCampaignGroupIdsToDelete(campaignGroups, endDate as string);
      const campaignGroupsP = campaignGroupIds.map((id) => { return this.API.deleteCampaignGroup(credentials, { id }) });
      await Promise.all(campaignGroupsP);
      res.json({ msg: "ok" });
    } catch (err) {
      console.log("err", err);
      res.status(500).json(err);
    }
  }
}

function transformCampaignGroups(data) {
  const campaignGroups = data[0] ? _.get(data[0], 'campaignGroups', []) : [];
  const statistics = data[1] ? _.get(data[1], 'statisticList', []) : [];
  const statisticList = [];
  let campaignGroupStats;

  campaignGroups.forEach((o) => {
    const campaignGroup: CampaignGroupEntity = o.campaignGroup;
    if (statistics.length > 0) {
      campaignGroupStats = statistics.find((row) => { return row.name == campaignGroup.id.toString() });
      if (_.isUndefined(campaignGroupStats)) {
        campaignGroupStats = {
          name: campaignGroup.id,
          displayName: campaignGroup.name
        }
      }
    } else {
      campaignGroupStats = {
        name: campaignGroup.id,
        displayName: campaignGroup.name
      }
    }
    campaignGroupStats.campaignGroup = campaignGroup;
    campaignGroupStats.rights = Roles.getChildrenRights(o.rights);
    statisticList.push(campaignGroupStats);
  });
  return statisticList;
}

function getCampaignGroupIdsToDelete(campaignGroups: CampaignGroup[], endDate: string) {
  const campaignGroupsToDelete = campaignGroups.filter((c) => {
    if (!c.campaignGroup.isRecent) {
      const eDate = moment(endDate);
      const cEndDate = moment(c.campaignGroup.endDate);
      const daysDiff = eDate.diff(cEndDate, 'days');
      return daysDiff >= 0;
    } else {
      return false;
    }
  });
  return campaignGroupsToDelete.map((c) => { return c.campaignGroup.id; });
}