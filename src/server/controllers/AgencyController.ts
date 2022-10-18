import { RequestHandler } from "express";
import * as _ from "lodash";
import Constants from "../../modules/Constants";
import * as Roles from "../../modules/Roles";
import { Controller } from "./Controller";
import ApiController from "./ApiController";
import { Api } from "../api/Api";
import { NOAX } from "../api/NOAX";
import { AgencyEntity } from "../../models/data/Agency";
import { StatisticsOptions } from "../../models/data/Statistics";
import { Scope } from "../../models/Common";
import { Attributes } from "../../modules/Enums";

export default class AgencyController extends ApiController implements Controller {

  constructor(protected API: NOAX) {
    super(API);
    this.router.get("", this.getAll);
    this.router.get("/statistics", this.getStatistics);
    this.router.get("/:id", this.get);
    this.router.post("", this.post);
    this.router.put("/:id", this.put);
    this.router.delete("/:id", this.delete);
  }

  getAll: RequestHandler = async (req, res) => {
    try {
      const credentials = this.getCredentials(req);
      const options = _.assign({}, { limit: Constants.MAX_API_LIMIT }, req.query);
      const agencies = await this.API.getAgencies(credentials, options);
      res.json(agencies);
    } catch (err) {
      res.status(500).json(err);
    }
  }

  getStatistics: RequestHandler = async (req, res) => {
    try {
      const credentials = this.getCredentials(req);
      const params = Api.ScopedParam({ scope: req.query.scope as Scope, scopeId: req.query.scopeId as any });
      const options = _.assign({}, params, { limit: Constants.MAX_API_LIMIT });
      let data;
      if (req.query.statistics === "true") {
        let statisticsOptions: StatisticsOptions = {
          scope: req.query.scope as Scope,
          attributeId: Attributes.AGENCY,
          startDate: req.query.startDate as string,
          endDate: req.query.endDate as string,
          limit: Constants.MAX_API_LIMIT,
          videoMetrics: req.query.videoMetrics as "true" | "false" | "any",
          simple: "true",
          aggregator: "name"
        };
        if (req.query.scopeId) statisticsOptions.scopeId = parseInt(req.query.scopeId as string, 10);
        const agenciesP = this.API.getAgencies(credentials, options);
        const statisticsP = this.API.getStatistics(credentials, statisticsOptions);
        data = await Promise.all([agenciesP, statisticsP]);
      } else {
        const agencies = await this.API.getAgencies(credentials, options);
        data = [agencies];
      }
      const statistics = transformAgencies(data);
      res.json(statistics);
    } catch (err) {
      res.status(500).json(err);
    }
  }

  get: RequestHandler = async (req, res) => {
    try {
      const credentials = this.getCredentials(req);
      const id = parseInt(req.params.id, 10);
      const agency = await this.API.getAgency(credentials, { id });
      res.json(agency);
    } catch (err) {
      res.status(500).json(err);
    }
  }

  post: RequestHandler = async (req, res) => {
    try {
      const credentials = this.getCredentials(req);
      const agency = req.body as AgencyEntity;
      await this.API.createAgency(credentials, { data: agency });
      res.json({ msg: "ok" });
    } catch (err) {
      res.status(500).json(err);
    }
  }

  put: RequestHandler = async (req, res) => {
    try {
      const credentials = this.getCredentials(req);
      const id = parseInt(req.params.id, 10);
      const agency = req.body as AgencyEntity;
      await this.API.updateAgency(credentials, { id, data: agency });
      res.json({ msg: "ok" });
    } catch (err) {
      res.status(500).json(err);
    }
  }

  delete: RequestHandler = async (req, res) => {
    try {
      const credentials = this.getCredentials(req);
      const id = parseInt(req.params.id, 10);
      await this.API.deleteAgency(credentials, { id });
      res.json({ msg: "ok" });
    } catch (err) {
      res.status(500).json(err);
    }
  }
}

function transformAgencies(data) {
  const agencies = data[0] ? _.get(data[0], 'agencies', []) : [];
  const statistics = data[1] ? _.get(data[1], 'statisticList', []) : [];
  const statisticList = [];
  let agencyStats;

  agencies.forEach((o) => {
    const agency: AgencyEntity = o.agency;
    if (statistics.length > 0) {
      agencyStats = statistics.find((row) => { return row.name === agency.id.toString() });
      if (_.isUndefined(agencyStats)) {
        agencyStats = {
          name: agency.id,
          displayName: agency.name
        }
      }
    } else {
      agencyStats = {
        name: agency.id,
        displayName: agency.name
      }
    }
    agencyStats.agency = agency;
    agencyStats.rights = Roles.getChildrenRights(o.rights);
    statisticList.push(agencyStats);
  });
  return statisticList;
}