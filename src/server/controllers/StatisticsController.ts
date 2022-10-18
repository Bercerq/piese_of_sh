import { RequestHandler } from "express";
import ApiController from "./ApiController";
import { NOAX } from "../api/NOAX";
import { StatisticsOptions, TimeseriesOptions } from "../../models/data/Statistics";

export default class StatisticsController extends ApiController {

  constructor(protected API: NOAX) {
    super(API);
    this.router.get("/", this.getStatistics);
    this.router.get("/summary", this.getSummary);
    this.router.get("/timeseries", this.getTimeseries);
    this.router.get("/timeseries/technical", this.getTimeseriesTechnical);
  }

  getStatistics: RequestHandler = async (req, res) => {
    try {
      const credentials = this.getCredentials(req);
      const statistics = await this.API.getStatistics(credentials, req.query as StatisticsOptions);
      res.json(statistics);
    } catch (err) {
      console.log(err);
      res.status(500).json(err);
    }
  }

  getSummary: RequestHandler = async (req, res) => {
    try {
      const credentials = this.getCredentials(req);
      const statistics = await this.API.getSummary(credentials, req.query as StatisticsOptions);
      res.json(statistics);
    } catch (err) {
      console.log(err);
      res.status(500).json(err);
    }
  }

  getTimeseries: RequestHandler = async (req, res) => {
    try {
      const credentials = this.getCredentials(req);
      const statistics = await this.API.getTimeseries(credentials, (req.query as any) as TimeseriesOptions);
      res.json(statistics);
    } catch (err) {
      console.log(err);
      res.status(500).json(err);
    }
  }

  getTimeseriesTechnical: RequestHandler = async (req, res) => {
    try {
      const credentials = this.getCredentials(req);
      const statistics = await this.API.getTimeseriesTechnical(credentials, (req.query as any) as TimeseriesOptions);
      res.json(statistics);
    } catch (err) {
      console.log(err);
      res.status(500).json(err);
    }
  }
}