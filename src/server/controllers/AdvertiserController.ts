import { RequestHandler } from "express";
import * as _ from "lodash";
import Constants from "../../modules/Constants";
import * as Roles from "../../modules/Roles";
import { Controller } from "./Controller";
import ApiController from "./ApiController";
import { Api } from "../api/Api";
import { NOAX } from "../api/NOAX";
import { AdvertiserEntity } from "../../models/data/Advertiser";
import { StatisticsOptions } from "../../models/data/Statistics";
import { Scope } from "../../models/Common";
import { Attributes } from "../../modules/Enums";
import { RetailBranch } from "../../models/data/RetailBranch";

export default class AdvertiserController extends ApiController implements Controller {

  constructor(protected API: NOAX) {
    super(API);
    this.router.get("", this.getAll);
    this.router.get("/statistics", this.getStatistics);
    this.router.get("/:id/ads", this.getAdsNames)
    this.router.get("/:id/banners/thirdpartyhosts", this.getThirdPartyHosts);
    this.router.get("/:id/retailbranches", this.getRetailBranches);
    this.router.get("/:id", this.get);
    this.router.post("", this.post);
    this.router.post("/:id/retailbranches", this.importRetailBranches);
    this.router.put("/:id", this.put);
    this.router.put("/:id/retailbranches/:retailBranchId", this.updateRetailBranch);
    this.router.delete("/:id", this.delete);
    this.router.delete("/:id/retailbranches/:retailBranchId", this.deleteRetailBranch);
  }

  get: RequestHandler = async (req, res) => {
    try {
      const credentials = this.getCredentials(req);
      const id = parseInt(req.params.id, 10);
      const advertiser = await this.API.getAdvertiser(credentials, { id });
      res.json(advertiser);
    } catch (err) {
      res.status(500).json(err);
    }
  }

  getAll: RequestHandler = async (req, res) => {
    try {
      const credentials = this.getCredentials(req);
      const options = _.assign({}, { limit: Constants.MAX_API_LIMIT }, req.query);
      const advertisers = await this.API.getAdvertisers(credentials, options);
      res.json(advertisers);
    } catch (err) {
      res.status(500).json(err);
    }
  }

  getAdsNames : RequestHandler =  async (req, res) => {
    try {
      const credentials = this.getCredentials(req);
      const id = parseInt(req.params.id, 10);
      const ads = await this.API.getBanners(credentials, { scopeId : id, active : true });
      res.json(ads);
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
          attributeId: Attributes.ADVERTISER,
          startDate: req.query.startDate as string,
          endDate: req.query.endDate as string,
          limit: Constants.MAX_API_LIMIT,
          videoMetrics: req.query.videoMetrics as "true" | "false" | "any",
          simple: "true",
          aggregator: "name"
        };
        if (req.query.scopeId) statisticsOptions.scopeId = parseInt(req.query.scopeId as string, 10);
        const advertisersP = this.API.getAdvertisers(credentials, options);
        const statisticsP = this.API.getStatistics(credentials, statisticsOptions);
        data = await Promise.all([advertisersP, statisticsP]);
      } else {
        const advertisers = await this.API.getAdvertisers(credentials, options);
        data = [advertisers];
      }
      const statistics = transformAdvertisers(data);
      res.json(statistics);
    } catch (err) {
      res.status(500).json(err);
    }
  }

  getThirdPartyHosts: RequestHandler = async (req, res) => {
    try {
      const credentials = this.getCredentials(req);
      const id = parseInt(req.params.id, 10);
      const thirdpartyhosts = await this.API.getThirdPartyHosts(credentials, { id });
      res.json(thirdpartyhosts);
    } catch (err) {
      res.status(500).json(err);
    }
  }

  getRetailBranches: RequestHandler = async (req, res) => {
    try {
      const credentials = this.getCredentials(req);
      const id = parseInt(req.params.id, 10);
      const data = req.query;
      const rslt = await this.API.getRetailBranches(credentials, { id, data });
      const retailBranches = _.get(rslt, "retailBranches", []);
      res.json(retailBranches);
    } catch (err) {
      res.status(500).json(err);
    }
  }

  post: RequestHandler = async (req, res) => {
    try {
      const credentials = this.getCredentials(req);
      const advertiser = req.body as AdvertiserEntity;
      await this.API.createAdvertiser(credentials, { data: advertiser });
      res.json({ msg: "ok" });
    } catch (err) {
      res.status(500).json(err);
    }
  }

  put: RequestHandler = async (req, res) => {
    try {
      const credentials = this.getCredentials(req);
      const id = parseInt(req.params.id, 10);
      const advertiser = req.body as AdvertiserEntity;
      await this.API.updateAdvertiser(credentials, { id, data: advertiser });
      res.json({ msg: "ok" });
    } catch (err) {
      res.status(500).json(err);
    }
  }

  importRetailBranches: RequestHandler = async (req, res) => {
    try {
      const credentials = this.getCredentials(req);
      const id = parseInt(req.params.id, 10);
      const data = req.body as { retailBranches: RetailBranch[], replaceAll: boolean };
      await this.API.importRetailBranches(credentials, { id, data });
      res.json({ msg: "ok" });
    } catch (err) {
      res.status(500).json(err);
    }
  }

  updateRetailBranch: RequestHandler = async (req, res) => {
    try {
      const credentials = this.getCredentials(req);
      const id = parseInt(req.params.id, 10);
      const retailBranchId = parseInt(req.params.retailBranchId, 10);
      const data = req.body as Partial<RetailBranch>;
      await this.API.updateRetailBranch(credentials, { id, retailBranchId, data });
      res.json({ msg: "ok" });
    } catch (err) {
      res.status(500).json(err);
    }
  }

  delete: RequestHandler = async (req, res) => {
    try {
      const credentials = this.getCredentials(req);
      const id = parseInt(req.params.id, 10);
      await this.API.deleteAdvertiser(credentials, { id });
      res.json({ msg: "ok" });
    } catch (err) {
      res.status(500).json(err);
    }
  }

  deleteRetailBranch: RequestHandler = async (req, res) => {
    try {
      const credentials = this.getCredentials(req);
      const id = parseInt(req.params.id, 10);
      const retailBranchId = parseInt(req.params.retailBranchId, 10);
      await this.API.deleteRetailBranch(credentials, { id, retailBranchId });
      res.json({ msg: "ok" });
    } catch (err) {
      res.status(500).json(err);
    }
  }
}

function transformAdvertisers(data) {
  const advertisers = data[0] ? _.get(data[0], 'advertisers', []) : [];
  const statistics = data[1] ? _.get(data[1], 'statisticList', []) : [];
  const statisticList = [];
  let advertiserStats;

  advertisers.forEach((o) => {
    var advertiser: AdvertiserEntity = o.advertiser;
    if (statistics.length > 0) {
      advertiserStats = statistics.find((row) => { return row.name == advertiser.id.toString() });
      if (_.isUndefined(advertiserStats)) {
        advertiserStats = {
          name: advertiser.id,
          displayName: advertiser.name
        }
      }
    } else {
      advertiserStats = {
        name: advertiser.id,
        displayName: advertiser.name
      }
    }
    advertiserStats.advertiser = advertiser;
    advertiserStats.rights = Roles.getChildrenRights(o.rights);
    statisticList.push(advertiserStats);
  });
  return statisticList;
}