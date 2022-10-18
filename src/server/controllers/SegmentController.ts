import { RequestHandler } from "express";
import * as _ from "lodash";
import ApiController from "./ApiController";
import { NOAX } from "../api/NOAX";
import Constants from "../../modules/Constants";
import { Segment } from "../../models/data/Segment";

export default class SegmentController extends ApiController {

  constructor(protected API: NOAX) {
    super(API);
    this.router.get("", this.getAll);
    this.router.get("/statistics", this.getStatistics);
    this.router.post("", this.post);
    this.router.put("/:id", this.put);
    this.router.delete("/:id", this.delete);
  }

  getAll: RequestHandler = async (req, res) => {
    try {
      const credentials = this.getCredentials(req);
      const options = _.assign({}, req.query, { limit: Constants.MAX_API_LIMIT });
      const segments = await this.API.getSegments(credentials, options);
      res.json(segments);
    } catch (err) {
      res.status(500).json(err);
    }
  }

  getStatistics: RequestHandler = async (req, res) => {
    try {
      const credentials = this.getCredentials(req);
      const options = _.assign({}, req.query, { limit: Constants.MAX_API_LIMIT });
      const segmentOptions = _.omit(options, ["startDate", "endDate", "statistics"]);
      let data;
      if (req.query.statistics === "true") {
        const segmentsP = this.API.getSegments(credentials, segmentOptions);
        const statisticsP = this.API.getSegmentStatistics(credentials, options);
        data = await Promise.all([segmentsP, statisticsP]);
      } else {
        const segments = await this.API.getSegments(credentials, { scopeId: options.scopeId });
        data = [segments, []];
      }
      const statistics = transformSegments(data);
      res.json(statistics);
    } catch (err) {
      console.log(err);
      res.status(500).json(err);
    }
  }

  post: RequestHandler = async (req, res) => {
    try {
      const credentials = this.getCredentials(req);
      const segment = req.body as Segment;
      const advertiserId = parseInt(req.query.advertiserId as string, 10);
      await this.API.createSegment(credentials, { advertiserId, data: segment });
      res.json({ msg: "ok" });
    } catch (err) {
      res.status(500).json(err);
    }
  }

  put: RequestHandler = async (req, res) => {
    try {
      const credentials = this.getCredentials(req);
      const segment = req.body as Segment;
      const advertiserId = parseInt(req.query.advertiserId as string, 10);
      const segmentId = parseInt(req.params.id, 10)
      await this.API.updateSegment(credentials, { segmentId, advertiserId, data: segment });
      res.json({ msg: "ok" });
    } catch (err) {
      res.status(500).json(err);
    }
  }

  delete: RequestHandler = async (req, res) => {
    try {
      const credentials = this.getCredentials(req);
      const advertiserId = parseInt(req.query.advertiserId as string, 10);
      const segmentId = parseInt(req.params.id, 10);
      await this.API.deleteSegment(credentials, { segmentId, advertiserId });
      res.json({ msg: "ok" });
    } catch (err) {
      res.status(500).json(err);
    }
  }
}

function transformSegments(data) {
  const segments = data[0];
  const segmentStats = data[1];
  return segments.map((o) => {
    const segmentStat = segmentStats.find((stat) => { return o.id === stat.segmentId }) || { segmentId: o.id, segmentName: o.name };
    return _.assign({}, o, segmentStat);
  });
}