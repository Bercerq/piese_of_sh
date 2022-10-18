import { RequestHandler } from "express";
import * as _ from "lodash";
import Constants from "../../modules/Constants";
import { Controller } from "./Controller";
import ApiController from "./ApiController";
import { NOAX } from "../api/NOAX";
import { Report } from "../../models/data/Report";

export default class ReportController extends ApiController implements Controller {
  constructor(protected API: NOAX) {
    super(API);
    this.router.get("", this.getAll);
    this.router.get("/:id", this.get);
    this.router.post("", this.post);
    this.router.put("/:id", this.put);
    this.router.delete("/:id", this.delete);
    this.router.get("/:id/instances", this.getInstances);
    this.router.get("/:id/instances/:instanceId/download", this.downloadInstance);
    this.router.post("/:id/token", this.createToken)    
    this.router.get("/:id/token", this.getToken)    
    this.router.delete("/:id/token", this.deleteToken)    

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
      const credentials = this.getCredentials(req);
      const options = _.assign({}, { limit: Constants.MAX_API_LIMIT }, req.query);
      const reports = await this.API.getReports(credentials, options);
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