import { RequestHandler, Router } from "express";
import * as _ from "lodash";
import Constants from "../../modules/Constants";
import * as Roles from "../../modules/Roles";
import { Controller } from "./Controller";
import ApiController from "./ApiController";
import { Api } from "../api/Api";
import { NOAX } from "../api/NOAX";
import { OrganizationEntity } from "../../models/data/Organization";
import { Attributes } from "../../modules/Enums";
import { Scope } from "../../models/Common";
import { StatisticsOptions } from "../../models/data/Statistics";

export default class OrganizationController extends ApiController implements Controller {

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
      const organizations = await this.API.getOrganizations(credentials, options);
      res.json(organizations);
    } catch (err) {
      res.status(500).json(err);
    }
  }

  getStatistics: RequestHandler = async (req, res) => {
    try {
      const credentials = this.getCredentials(req);
      const params = Api.ScopedParam({ scope: req.query.scope as Scope, scopeId: req.query.scopeId as any});
      const options = _.assign({}, params, { limit: Constants.MAX_API_LIMIT });
      let data;
      if (req.query.statistics === "true") {
        let statisticsOptions: StatisticsOptions = {
          scope: req.query.scope as Scope,
          attributeId: Attributes.ORGANIZATION,
          startDate: req.query.startDate as string,
          endDate: req.query.endDate as string,
          limit: Constants.MAX_API_LIMIT,
          videoMetrics: req.query.videoMetrics as "true" | "false" | "any",
          simple: "true",
          aggregator: "name"
        };
        if (req.query.scopeId) statisticsOptions.scopeId = parseInt(req.query.scopeId as string, 10);
        const organizationsP = this.API.getOrganizations(credentials, options);
        const statisticsP = this.API.getStatistics(credentials, statisticsOptions);
        data = await Promise.all([organizationsP, statisticsP]);
      } else {
        const organizations = await this.API.getOrganizations(credentials, options);
        data = [organizations];
      }
      const statistics = transformOrganizations(data);
      res.json(statistics);
    } catch (err) {
      res.status(500).json(err);
    }
  }

  get: RequestHandler = async (req, res) => {
    try {
      const credentials = this.getCredentials(req);
      const id = parseInt(req.params.id, 10);
      const organization = await this.API.getOrganization(credentials, { id });
      res.json(organization);
    } catch (err) {
      res.status(500).json(err);
    }
  }

  post: RequestHandler = async (req, res) => {
    try {
      const credentials = this.getCredentials(req);
      const organization = req.body as OrganizationEntity;
      await this.API.createOrganization(credentials, { data: organization });
      res.json({ msg: "ok" });
    } catch (err) {
      res.status(500).json(err);
    }
  }

  put: RequestHandler = async (req, res) => {
    try {
      const credentials = this.getCredentials(req);
      const id = parseInt(req.params.id, 10);
      const organization = req.body as OrganizationEntity;
      await this.API.updateOrganization(credentials, { id, data: organization });
      res.json({ msg: "ok" });
    } catch (err) {
      res.status(500).json(err);
    }
  }

  delete: RequestHandler = async (req, res) => {
    try {
      const credentials = this.getCredentials(req);
      const id = parseInt(req.params.id, 10);
      await this.API.deleteOrganization(credentials, { id });
      res.json({ msg: "ok" });
    } catch (err) {
      res.status(500).json(err);
    }
  }
}

function transformOrganizations(data) {
  const organizations = data[0] ? _.get(data[0], 'organizations', []) : [];
  const statistics = data[1] ? _.get(data[1], 'statisticList', []) : [];
  const statisticList = [];
  let organizationStats;

  organizations.forEach((o) => {
    const organization: OrganizationEntity = o.organization;
    if (statistics.length > 0) {
      organizationStats = statistics.find((row) => { return row.name === organization.id.toString() });
      if (_.isUndefined(organizationStats)) {
        organizationStats = {
          name: organization.id,
          displayName: organization.name
        }
      }
    } else {
      organizationStats = {
        name: organization.id,
        displayName: organization.name
      }
    }
    organizationStats.organization = organization;
    organizationStats.rights = Roles.getChildrenRights(o.rights);
    statisticList.push(organizationStats);
  });
  return statisticList;
}