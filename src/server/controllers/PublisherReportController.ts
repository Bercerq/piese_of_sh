import { RequestHandler } from "express";
import * as _ from "lodash";
import Constants from "../../modules/Constants";
import { Controller } from "./Controller";
import ApiController from "./ApiController";
import { NOAX } from "../api/NOAX";
import { Report } from "../../models/data/Report";

export default class PublisherReportController extends ApiController implements Controller {
  constructor(protected API: NOAX) {
    super(API);
    this.router.get("/:publisherId/", this.getAll);
    this.router.get("/:publisherId/:id", this.get);
    this.router.post("/:publisherId", this.post);
    this.router.put("/:publisherId/:id", this.put);
    this.router.delete("/:publisherId/:id", this.delete);
    this.router.get("/:publisherId/:id/instances", this.getInstances);
    this.router.get("/:publisherId/:id/instances/:instanceId/download", this.downloadInstance);
    this.router.post("/:publisherId/:id/token", this.createToken)    
    this.router.get("/:publisherId/:id/token", this.getToken)    
    this.router.delete("/:publisherId/:id/token", this.deleteToken)    

  }

  createToken: RequestHandler = async (req, res) => {
    try {
      const credentials = this.getCredentials(req);
      const id = parseInt(req.params.id, 10);
      await this.API.createReportToken(credentials, { id });
      res.json({ msg: "ok" });
    } catch (err) {
      res.status(500).json(err);
    }
  }

  getToken: RequestHandler = async (req, res) => {
    try {
      const credentials = this.getCredentials(req);
      const id = parseInt(req.params.id, 10);
      const report = await this.API.getReportToken(credentials, { id });
      res.json(report);
    } catch (err) {
      res.status(500).json(err);
    }
  }

  deleteToken: RequestHandler = async (req, res) => {
    try {
      const credentials = this.getCredentials(req);
      const id = parseInt(req.params.id, 10);
      await this.API.deleteReportToken(credentials, { id });
      res.json({ msg: "ok" });
    } catch (err) {
      res.status(500).json(err);
    }
  }

  get: RequestHandler = async (req, res) => {
    try {
      const credentials = this.getCredentials(req);
      const id = parseInt(req.params.id, 10);
      const report = await this.API.getReport(credentials, { id });
      res.json(report);
    } catch (err) {
      res.status(500).json(err);
    }
  }

  getAll: RequestHandler = async (req, res) => {
    try {
      const publisherId = parseInt(req.params.publisherId, 10);
      console.log("publisher Id" + publisherId)
      const credentials = this.getCredentials(req);
      const options = _.assign({}, { id: publisherId, limit: Constants.MAX_API_LIMIT });
      const reports = await this.API.getPublisherReports(credentials, options);
      res.json(reports);
    } catch (err) {
      res.status(500).json(err);
    }
  }

  post: RequestHandler = async (req, res) => {
    try {
      const credentials = this.getCredentials(req);
      const report = req.body as Report;
      await this.API.createReport(credentials, { data: report });
      res.json({ msg: "ok" });
    } catch (err) {
      res.status(500).json(err);
    }
  }

  put: RequestHandler = async (req, res) => {
    try {
      const credentials = this.getCredentials(req);
      const id = parseInt(req.params.id, 10);
      const report = req.body as Report;
      await this.API.updateReport(credentials, { id, data: report });
      res.json({ msg: "ok" });
    } catch (err) {
      res.status(500).json(err);
    }
  }

  delete: RequestHandler = async (req, res) => {
    try {
      const credentials = this.getCredentials(req);
      const id = parseInt(req.params.id, 10);
      await this.API.deleteReport(credentials, { id });
      res.json({ msg: "ok" });
    } catch (err) {
      res.status(500).json(err);
    }
  }

  getInstances: RequestHandler = async (req, res) => {
    try {
      const credentials = this.getCredentials(req);
      const id = parseInt(req.params.id, 10);
      const options = { id, limit: Constants.MAX_API_LIMIT };
      const reportInstances = await this.API.getReportInstances(credentials, options);
      res.json(reportInstances);
    } catch (err) {
      res.status(500).json(err);
    }
  }

  downloadInstance: RequestHandler = async (req, res) => {
    try {
      const credentials = this.getCredentials(req);
      const id = parseInt(req.params.id, 10);
      const instanceId = parseInt(req.params.instanceId, 10);
      const fileRequest = this.API.downloadReportInstance(credentials, { id, instanceId });
      req.pipe(fileRequest).pipe(res);
    } catch (err) {
      res.status(500).json(err);
    }
  }
}