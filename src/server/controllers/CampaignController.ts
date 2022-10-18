import { RequestHandler } from "express";
import * as _ from "lodash";
import moment from "moment";
import { Controller } from "./Controller";
import ApiController from "./ApiController";
import Constants from "../../modules/Constants";
import { Api, Credentials } from "../api/Api";
import { NOAX } from "../api/NOAX";
import * as Roles from "../../modules/Roles";
import { StatisticsOptions } from "../../models/data/Statistics";
import { Rights, Scope } from "../../models/Common";
import { Attributes } from "../../modules/Enums";
import { AdvertiserEntity } from "../../models/data/Advertiser";
import { Campaign, CampaignBanner, CampaignClone, CampaignEntity, CampaignSubmitData, CampaignTag } from "../../models/data/Campaign";

export default class CampaignController extends ApiController implements Controller {

  constructor(protected API: NOAX) {
    super(API);
    this.router.get("", this.getAll);
    this.router.get("/statistics", this.getStatistics);
    this.router.get("/history", this.getHistory);
    this.router.get("/:id", this.get);
    this.router.post("", this.post);
    this.router.post("/:id/clone", this.clone);
    this.router.put("/:id", this.put);
    this.router.put("/:id/restore", this.restore);
    this.router.delete("/", this.deleteAll);
    this.router.delete("/:id", this.delete);
    this.router.get("/:id/pacing/budget", this.getPacingBudget);
    this.router.get("/:id/pacing/impressions", this.getPacingImpressions);
    this.router.get("/:id/segmentstats", this.getSegmentStats);
    this.router.post("/:id/settings", this.postSettings);
    this.router.get("/:id/settings", this.getSettings);
    this.router.get("/:id/constraint", this.getConstraints);
    this.router.post("/:id/:action", this.updateStatus);
  }

  get: RequestHandler = async (req, res) => {
    try {
      const credentials = this.getCredentials(req);
      const id = parseInt(req.params.id, 10);
      const campaign = await this.API.getCampaign(credentials, { id });
      res.json(campaign);
    } catch (err) {
      res.status(500).json(err);
    }
  }

  getHistory: RequestHandler = async (req, res) => {
    try {
      const credentials = this.getCredentials(req);
      const campaignSettingsHistory = await this.API.getCampaignSettingsHistory(credentials, req.query as any);
      res.json(campaignSettingsHistory);
    } catch (err) {
      res.status(500).json(err);
    }
  }

  getAll: RequestHandler = async (req, res) => {
    try {
      const credentials = this.getCredentials(req);
      const options = _.assign({}, { limit: Constants.MAX_API_LIMIT }, req.query);
      const data = await this.API.getCampaigns(credentials, options);
      res.json(data.campaigns || []);
    } catch (err) {
      res.status(500).json(err);
    }
  }

  postSettings: RequestHandler = async (req, res) => {
    try {
      const credentials = this.getCredentials(req);
      const id = parseInt(req.params.id, 10);
      const campaignSubmitData = req.body as CampaignSubmitData;

      const campaign = _.get(campaignSubmitData, "campaign");
      const targeting = _.get(campaignSubmitData, "targeting");
      const constraints = _.get(campaignSubmitData, "constraints");
      const deals = _.get(campaignSubmitData, "deals");
      const metricTargets = _.get(campaignSubmitData, "metricTargets");
      const retailStrategies = _.get(campaignSubmitData, "retailStrategies");

      await this.API.updateCampaign(credentials, { id, data: campaign });
      await this.API.updateCampaignConstraints(credentials, { id, data: constraints });
      const targetingP = this.API.updateCampaignTargeting(credentials, { id, data: targeting });
      const dealsP = !_.isNull(deals) ? this.API.updateCampaignDeals(credentials, { id, data: deals }) : Promise.resolve();
      const metricTargetsP = this.API.updateCampaignMetricTargets(credentials, { id, data: metricTargets });
      const adsP = !_.isNull(_.get(campaignSubmitData, "ads")) ? this.saveAds(credentials, id, campaignSubmitData) : Promise.resolve();
      const retailStrategiesP = campaignSubmitData.isRetail ? this.API.updateCampaignRetailStrategies(credentials, { id, data: retailStrategies }) : Promise.resolve();

      await Promise.all([targetingP, dealsP, metricTargetsP, adsP, retailStrategiesP]);
      res.json({ msg: "ok" });
    } catch (err) {
      console.log("post-settings error", err);
      res.status(500).json(err);
    }
  }

  async saveAds(credentials: Credentials, id: number, campaignSubmitData: CampaignSubmitData) {
    const adsToDelete = _.get(campaignSubmitData, "ads.adsToDelete") || [];
    if (adsToDelete.length > 0) {
      await this.deleteAds(credentials, id, adsToDelete);
    }

    if (campaignSubmitData.isAdserving) {
      await this.saveAdsAdserving(credentials, id, campaignSubmitData.ads)
    } else {
      await this.saveAdsRTB(credentials, id, campaignSubmitData.ads);
    }
  }

  saveAdsRTB(credentials: Credentials, id: number, ads: { adsToUpdate: CampaignBanner[], adsToCreate: CampaignBanner[] }): Promise<any> {
    const { adsToUpdate, adsToCreate } = ads;

    const toUpdatePromises = adsToUpdate.map((ad) => { return this.API.updateCampaignAd(credentials, { id, campaignAdId: ad.id, data: ad }) });
    const toCreatePromises = adsToCreate.map((ad) => { return this.API.createCampaignAd(credentials, { id, data: _.omit(ad, "id") }) });

    return Promise.all(toUpdatePromises.concat(toCreatePromises));
  }

  async saveAdsAdserving(credentials: Credentials, id: number, ads: { adsToUpdate: CampaignBanner[], adsToCreate: CampaignBanner[], tagsToUpdate: CampaignTag[], tagsToCreate: CampaignTag[] }) {
    const { adsToUpdate, adsToCreate, tagsToUpdate, tagsToCreate } = ads;

     tagsToUpdate.forEach(async (tag) => {
      if (!tag.defaultCampaignBannerId) {
        await this.API.updateCampaignTag(credentials, { id, tagId: tag.id, data: _.pick(tag, ["name", "supportedSizes", "iframe", "javascript", "tracking"]) });
      } else if (tag.defaultCampaignBannerId > 0) {
        const updatedTag = {
          name: tag.name,
          defaultCampaignBannerId: tag.defaultCampaignBannerId,
          supportedSizes: tag.supportedSizes,
          iframe: tag.iframe,
          javascript: tag.javascript,
          tracking: tag.tracking,
          finalized: true
        };
        await this.API.updateCampaignTag(credentials, { id, tagId: tag.id, data: updatedTag });
      } else {
        //create new default ad for tag
        const defaultAd = _.remove(adsToCreate, (ad) => { return ad.id === tag.defaultCampaignBannerId })[0];
        const defaultCampaignBannerId = await this.API.createCampaignAd(credentials, { id, data: _.omit(defaultAd, "id") });
        const updatedTag = {
          name: tag.name,
          defaultCampaignBannerId,
          supportedSizes: tag.supportedSizes,
          iframe: tag.iframe,
          javascript: tag.javascript,
          tracking: tag.tracking,
          finalized: true
        };
        //update tag with the new defaultCampaignBannerId
        await this.API.updateCampaignTag(credentials, { id, tagId: tag.id, data: updatedTag });
      }
    });

    const promiseTags = await Promise.all(tagsToCreate.map(async (tag) => {
      const negativeTagId = tag.id;
      const createdTag = {
        name: tag.name,
        campaignId: id,
        supportedSizes: tag.supportedSizes,
        iframe: tag.iframe,
        javascript: tag.javascript,
        tracking: tag.tracking,
        finalized: false
      };

      const newTagId = await this.API.createCampaignTag(credentials, { id, data: createdTag });
      if (tag.defaultCampaignBannerId && tag.defaultCampaignBannerId < 0) {
        let defaultAd = _.remove(adsToCreate, (ad) => { return ad.id === tag.defaultCampaignBannerId })[0];
        defaultAd.tagId = newTagId;
        //create new default ad
        const defaultCampaignBannerId = await this.API.createCampaignAd(credentials, { id, data: _.omit(defaultAd, "id") });
        //update newly created tag with the new defaultCampaignBannerId
        await this.API.updateCampaignTag(credentials, { id, tagId: newTagId, data: { defaultCampaignBannerId, finalized: true } });
        //find the rest of the ads linked to the new tag
        const tagAds = _.remove(adsToCreate, (ad) => { return ad.tagId === negativeTagId }).map((ad) => { return _.assign(ad, { tagId: newTagId }) });
        const tagAdsPromises = tagAds.map((ad) => { return this.API.createCampaignAd(credentials, { id, data: _.omit(ad, "id") }) })
        return await Promise.all(tagAdsPromises);
      }
    }));
    const adsToUpdatePromises = adsToUpdate.map((ad) => { return this.API.updateCampaignAd(credentials, { id, campaignAdId: ad.id, data: ad }) });
    const adsToCreatePromises = adsToCreate.map((ad) => { return this.API.createCampaignAd(credentials, { id, data: _.omit(ad, "id") }) });

    return Promise.all(adsToUpdatePromises.concat(adsToCreatePromises));
  }

  deleteAds(credentials: Credentials, id: number, adsToDelete: number[]) {
    const promises = adsToDelete.map((campaignAdId) => { return this.API.deleteCampaignAd(credentials, { id, campaignAdId }) });
    return Promise.all(promises);
  }

  getSettings: RequestHandler = async (req, res) => {
    try {
      const credentials = this.getCredentials(req);
      const id = parseInt(req.params.id, 10);
      const campaign = await this.API.getCampaign(credentials, { id });
      const isAdserving = _.get(campaign, "campaign.biddingType") === "Adserving";
      const structure = _.get(campaign, "campaign.structure");
      const isRetail = structure === "RETAIL_GPS" || structure === "RETAIL_ZIP";
      const rights: Rights = Roles.getRights(_.get(campaign, "rights"));

      const campaignData = await this.getCampaignData(credentials, id, isAdserving, isRetail, rights);
      const campaignSettings = {
        campaign: _.get(campaign, "campaign"),
        settings: {
          constraints: _.get(campaignData, "constraints"),
          targeting: _.get(campaignData, "targeting"),
          metricTargets: _.get(campaignData, "metricTargets"),
          deals: _.get(campaignData, "deals"),
          ads: _.get(campaignData, "ads", []),
          tags: _.get(campaignData, "tags", []),
          dataFeeds: _.get(campaignData, "dataFeeds", []),
          retailStrategies: _.get(campaignData, "retailStrategies", []),
        },
        rights: _.get(campaign, "rights"),
        parents: _.get(campaign, "parents")
      };
      res.json(campaignSettings);
    } catch (err) {
      console.log("err", err);
      res.status(500).json(err);
    }
  }

  async getCampaignData(credentials: Credentials, id: number, isAdserving: boolean, isRetail: boolean, rights: Rights) {
    const constraintsP = this.API.getCampaignConstraints(credentials, { id });
    const targetingP = this.API.getCampaignTargeting(credentials, { id });
    const metricTargetsP = this.API.getCampaignMetricTargets(credentials, { id });
    const dealsP = rights.VIEW_DEALS ? this.API.getCampaignDeals(credentials, { id, includedeals: "true" }) : Promise.resolve();
    const adsP = rights.VIEW_ADS ? this.API.getCampaignAds(credentials, { id, includebanner: "true" }) : Promise.resolve();
    const tagsP = isAdserving && rights.VIEW_ADS ? this.API.getCampaignTags(credentials, { id }) : Promise.resolve();
    const retailStrategiesP = isRetail ? this.API.getCampaignRetailStrategies(credentials, { id }) : Promise.resolve();
    const dataFeedsP = this.API.getDataFeeds(credentials, { id })
    const [constraints, targeting, metricTargets, deals, ads, tags, dataFeeds, retailStrategies] = await Promise.all(
      [constraintsP, targetingP, metricTargetsP, dealsP, adsP, tagsP, dataFeedsP, retailStrategiesP]);   
      return { constraints, targeting, metricTargets, deals: _.get(deals, "deals") || [], ads, tags, dataFeeds, retailStrategies };
  }

  getStatistics: RequestHandler = async (req, res) => {
    try {
      const credentials = this.getCredentials(req);
      const params = Api.ScopedParam({ scope: req.query.scope as Scope, scopeId: req.query.scopeId as any });
      const typeParam = getTypeParam(req.query.type as "recent" | "older" | "archived");
      const options = _.assign({}, params, typeParam, { limit: Constants.MAX_API_LIMIT, includeConstraints: true });
      const advOptions = _.assign({}, params, { limit: Constants.MAX_API_LIMIT });

      const campaignsP = this.API.getCampaigns(credentials, options);
      const advertisersP = this.API.getAdvertisers(credentials, advOptions);
      const data = await Promise.all([campaignsP, advertisersP]);

      if (req.query.statistics === "true") {
        try {
          let statisticsOptions: StatisticsOptions = {
            scope: req.query.scope as Scope,
            attributeId: Attributes.CAMPAIGN,
            startDate: req.query.startDate as string,
            endDate: req.query.endDate as string,
            limit: Constants.MAX_API_LIMIT,
            videoMetrics: req.query.videoMetrics as "true" | "false" | "any",
            simple: "true",
            aggregator: "name"
          };
          if (req.query.scopeId) statisticsOptions.scopeId = parseInt(req.query.scopeId as string, 10);
          const statsResponse = await this.API.getStatistics(credentials, statisticsOptions);
          const statistics = transformCampaigns(data.concat(statsResponse));
          res.json({ warning: null, statistics });
        } catch (statErr) {
          // used to still show campaigns table if statistics endpoint fails.
          const statistics = transformCampaigns(data);
          res.json({ warning: "Error loading statistics.", statistics });
        }
      } else {
        const statistics = transformCampaigns(data);
        res.json({ warning: null, statistics });
      }
    } catch (err) {
      res.status(500).json(err);
    }
  }

  getSegmentStats: RequestHandler = async (req, res) => {
    try {
      const credentials = this.getCredentials(req);
      const options = {
        id: req.params.id,
        startDate: req.query.startDate,
        endDate: req.query.endDate
      };
      const segmentstats = await this.API.getCampaignSegmentStatistics(credentials, options as any);
      res.json(segmentstats);
    } catch (err) {
      res.status(500).json(err);
    }
  }

  post: RequestHandler = async (req, res) => {
    try {
      const credentials = this.getCredentials(req);
      const campaign = req.body as CampaignEntity;
      await this.API.createCampaign(credentials, { data: campaign });
      res.json({ msg: "ok" });
    } catch (err) {
      res.status(500).json(err);
    }
  }

  clone: RequestHandler = async (req, res) => {
    try {
      const credentials = this.getCredentials(req);
      const id = parseInt(req.params.id, 10);
      const data = req.body as CampaignClone;
      await this.API.cloneCampaign(credentials, { id, data });
      res.json({ msg: "ok" });
    } catch (err) {
      res.status(500).json(err);
    }
  }

  updateStatus: RequestHandler = async (req, res) => {
    try {
      const credentials = this.getCredentials(req);
      const id = parseInt(req.params.id, 10);
      const action = req.params.action as "activate" | "deactivate";
      await this.API.updateCampaignStatus(credentials, { id, action });
      res.json({ msg: "ok" });
    } catch (err) {
      res.status(500).json(err);
    }
  }

  put: RequestHandler = async (req, res) => {

  }

  restore: RequestHandler = async (req, res) => {
    try {
      const credentials = this.getCredentials(req);
      const id = parseInt(req.params.id, 10);
      await this.API.restoreCampaign(credentials, { id });
      res.json({ msg: "ok" });
    } catch (err) {
      res.status(500).json(err);
    }
  }

  delete: RequestHandler = async (req, res) => {
    try {
      const credentials = this.getCredentials(req);
      const id = parseInt(req.params.id, 10);
      await this.API.deleteCampaign(credentials, { id });
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
      const data = await this.API.getCampaigns(credentials, options);
      const campaigns = data.campaigns || [];
      const campaignIds = getCampaignIdsToDelete(campaigns, endDate as string);
      const campaignsP = campaignIds.map((id) => { return this.API.deleteCampaign(credentials, { id }) });
      await Promise.all(campaignsP);
      res.json({ msg: "ok" });
    } catch (err) {
      console.log("err", err);
      res.status(500).json(err);
    }
  }

  getPacingBudget: RequestHandler = async (req, res) => {
    try {
      const credentials = this.getCredentials(req);
      const id = parseInt(req.params.id, 10);
      const pacing = await this.API.getCampaignPacingBudget(credentials, { id });
      res.json(pacing);
    } catch (err) {
      res.status(500).json(err);
    }
  }

  getPacingImpressions: RequestHandler = async (req, res) => {
    try {
      const credentials = this.getCredentials(req);
      const id = parseInt(req.params.id, 10);
      const pacing = await this.API.getCampaignPacingImpressions(credentials, { id });
      res.json(pacing);
    } catch (err) {
      res.status(500).json(err);
    }
  }

  getConstraints: RequestHandler = async (req, res) => {
    try {
      const credentials = this.getCredentials(req);
      const id = parseInt(req.params.id, 10);
      const constraints = await this.API.getCampaignConstraints(credentials, { id });
      res.json(constraints);
    } catch (err) {
      res.status(500).json(err);
    }
  }

  getMetricTargets: RequestHandler = async (req, res) => {
    try {
      const credentials = this.getCredentials(req);
      const id = parseInt(req.params.id, 10);
      const targets = await this.API.getCampaignMetricTargets(credentials, { id });
      res.json(targets);
    } catch (err) {
      res.status(500).json(err);
    }
  }

  getTargeting: RequestHandler = async (req, res) => {
    try {
      const credentials = this.getCredentials(req);
      const id = parseInt(req.params.id, 10);
      const targeting = await this.API.getCampaignTargeting(credentials, { id });
      res.json(targeting);
    } catch (err) {
      res.status(500).json(err);
    }
  }
}

function transformCampaigns(data) {
  const campaigns = data[0] ? _.get(data[0], 'campaigns', []) : [];
  const advertisers = data[1] ? _.get(data[1], 'advertisers', []) : [];
  const statistics = data[2] ? _.get(data[2], 'statisticList', []) : [];
  const statisticList = [];
  let campaignStats;
  let advertisersObj = {};
  advertisers.forEach((item) => {
    advertisersObj[item.advertiser.id] = item.advertiser.name;
  });

  campaigns.forEach((o) => {
    const advertiser: AdvertiserEntity = advertisersObj[o.campaign.advertiserId];
    const campaign = _.assign({}, o.campaign, { advertiser: advertiser });

    if (statistics.length > 0) {
      campaignStats = statistics.find((row) => { return row.name === campaign.id.toString() });
      if (_.isUndefined(campaignStats)) {
        campaignStats = {
          name: campaign.id,
          displayName: campaign.name
        }
      }
    } else {
      campaignStats = {
        name: campaign.id,
        displayName: campaign.name
      }
    }
    campaignStats.campaign = campaign;
    campaignStats.rights = Roles.getChildrenRights(o.rights);
    statisticList.push(campaignStats);
  });
  return statisticList;
}

function getCampaignIdsToDelete(campaigns: Campaign[], endDate: string) {
  const campaignsToDelete = campaigns.filter((c) => {
    if (!c.campaign.isRecent) {
      const eDate = moment(endDate);
      const cEndDate = moment(c.campaign.endDate);
      const daysDiff = eDate.diff(cEndDate, 'days');
      return daysDiff >= 0;
    } else {
      return false;
    }
  });
  return campaignsToDelete.map((c) => { return c.campaign.id; });
}

function getTypeParam(type: "recent" | "older" | "archived") {
  var today = moment().format("YYYY-MM-DD");
  if (type === "recent") {
    return { endsAfter: today }
  } else if (type === "older") {
    return { endsBefore: today }
  } else if (type === "archived") {
    return { archived: "true" }
  }
  return {};
}