import { RequestHandler } from "express";
import * as _ from "lodash";
import Constants from "../../modules/Constants";
import { Attributes } from "../../modules/Enums";
import * as Roles from "../../modules/Roles";
import ApiController from "./ApiController";
import { Api } from "../api/Api";
import { NOAX } from "../api/NOAX";
import { PublisherDeal } from "../../models/data/PublisherDeal";
import { PublisherSettings, PublisherEntity } from "../../models/data/Publisher";
import { StatisticsOptions } from "../../models/data/Statistics";
import { Scope } from "../../models/Common";

export default class PublisherController extends ApiController {

  constructor(protected API: NOAX) {
    super(API);
    this.router.get("", this.getAll);
    this.router.get("/statistics", this.getStatistics);
    this.router.get("/names", this.getNames);
    this.router.get("/:id/dealrequests", this.getDealRequests);
    this.router.get("/:id/deals", this.getDeals);
    this.router.get("/:id", this.get);
    this.router.put("/:id", this.put);
    this.router.put("/:id/deals/:dealId", this.updateDeal);
    this.router.delete("/:id/deals/:dealId", this.deleteDeal);
    this.router.post("/:id/dealrequests/:dealRequestId/approve", this.approveDealRequest);
    this.router.post("/:id/dealrequests/:dealRequestId/reject", this.rejectDealRequest);
  }

  get: RequestHandler = async (req, res) => {
    try {
      const credentials = this.getCredentials(req);
      const id = parseInt(req.params.id, 10);
      const publisher = await this.API.getPublisher(credentials, { id });
      res.json(publisher);
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
          attributeId: Attributes.PUBLISHER,
          startDate: req.query.startDate as string,
          endDate: req.query.endDate as string,
          limit: Constants.MAX_API_LIMIT,
          videoMetrics: req.query.videoMetrics as "true" | "false" | "any",
          simple: "true",
          aggregator: "name"
        };
        if (req.query.scopeId) statisticsOptions.scopeId = parseInt(req.query.scopeId as string, 10);
        const publishersP = this.API.getPublishers(credentials, options);
        const statisticsP = this.API.getStatistics(credentials, statisticsOptions);
        data = await Promise.all([publishersP, statisticsP]);
      } else {
        const publishers = await this.API.getPublishers(credentials, options);
        data = [publishers];
      }
      const statistics = transformPublishers(data);
      res.json(statistics);
    } catch (err) {
      res.status(500).json(err);
    }
  }

  put: RequestHandler = async (req, res) => {
    try {
      const credentials = this.getCredentials(req);
      const id = parseInt(req.params.id, 10);
      const settings = req.body as PublisherSettings;
      await this.API.updatePublisher(credentials, { id, data: settings });
      res.json({ msg: "ok" });
    } catch (err) {
      res.status(500).json(err);
    }
  }

  getAll: RequestHandler = async (req, res) => {
    try {
      const credentials = this.getCredentials(req);
      const options = _.assign({}, { limit: Constants.MAX_API_LIMIT }, req.query);
      const publishers = await this.API.getPublishers(credentials, options);
      res.json(publishers);
    } catch (err) {
      res.status(500).json(err);
    }
  }

  getNames: RequestHandler = async (req, res) => {
    try {
      const credentials = this.getCredentials(req);
      const names = await this.API.getPublisherNames(credentials);
      res.json(names);
    } catch (err) {
      res.status(500).json(err);
    }
  }

  getDealRequests: RequestHandler = async (req, res) => {
    try {
      const credentials = this.getCredentials(req);
      const options = { id: parseInt(req.params.id, 10)};
      const dealrequests = await this.API.getPublisherDealRequests(credentials, options);
      res.json(dealrequests);
    } catch (err) {
      res.status(500).json(err);
    }
  }

  getDeals: RequestHandler = async (req, res) => {
    try {
      const credentials = this.getCredentials(req);
      const options = { id: parseInt(req.params.id, 10)};
      const deals = await this.API.getPublisherDeals(credentials, options);
      res.json(deals);
    } catch (err) {
      res.status(500).json(err);
    }
  }

  updateDeal: RequestHandler = async (req, res) => {
    try {
      const credentials = this.getCredentials(req);
      const id = parseInt(req.params.id, 10);
      const dealId = parseInt(req.params.dealId, 10);
      const publisherDeal = req.body as PublisherDeal;
      await this.API.updatePublisherDeal(credentials, { id, dealId, data: publisherDeal });
      res.json({ msg: "ok" });
    } catch (err) {
      res.status(500).json(err);
    }
  }

  deleteDeal: RequestHandler = async (req, res) => {
    try {
      const credentials = this.getCredentials(req);
      const id = parseInt(req.params.id, 10);
      const dealId = parseInt(req.params.dealId, 10);
      await this.API.deletePublisherDeal(credentials, { id, dealId });
      res.json({ msg: "ok" });
    } catch (err) {
      res.status(500).json(err);
    }
  }

  approveDealRequest: RequestHandler = async (req, res) => {
    try {
      const credentials = this.getCredentials(req);
      const id = parseInt(req.params.id, 10);
      const dealRequestId = parseInt(req.params.dealRequestId, 10);
      const publisherDeal = req.body as PublisherDeal;
      await this.API.approveDealRequest(credentials, { id, dealRequestId, data: publisherDeal });
      res.json({ msg: "ok" });
    } catch (err) {
      res.status(500).json(err);
    }
  }

  rejectDealRequest: RequestHandler = async (req, res) => {
    try {
      const credentials = this.getCredentials(req);
      const id = parseInt(req.params.id, 10);
      const dealRequestId = parseInt(req.params.dealRequestId, 10);
      await this.API.rejectDealRequest(credentials, { id, dealRequestId });
      res.json({ msg: "ok" });
    } catch (err) {
      res.status(500).json(err);
    }
  }
}

function transformPublishers(data) {
  const publishers = data[0] ? _.get(data[0], 'publishers', []) : [];
  const statistics = data[1] ? _.get(data[1], 'statisticList', []) : [];
  const statisticList = [];
  let publisherStats;

  publishers.forEach((o) => {
    const publisher: PublisherEntity = o.publisher;
    if (statistics.length > 0) {
      publisherStats = statistics.find((row) => { return row.name === publisher.id.toString() });
      if (_.isUndefined(publisherStats)) {
        publisherStats = {
          name: publisher.id,
          displayName: publisher.settings.name
        }
      }
    } else {
      publisherStats = {
        name: publisher.id,
        displayName: publisher.settings.name
      }
    }
    publisherStats.publisher = publisher;
    publisherStats.rights = Roles.getChildrenRights(o.rights);
    statisticList.push(publisherStats);
  });
  return statisticList;
}