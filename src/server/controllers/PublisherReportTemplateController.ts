import { RequestHandler } from "express";
import * as _ from "lodash";
import Constants from "../../modules/Constants";
import { Controller } from "./Controller";
import ApiController from "./ApiController";
import { NOAX } from "../api/NOAX";
import { ReportTemplate } from "../../models/data/Report";

export default class PublisherReportTemplateController extends ApiController implements Controller {
  constructor(protected API: NOAX) {
    super(API);
    this.router.get("/:publisherId", this.getAll);
    this.router.get("/:publisherId/:id", this.get);
    this.router.post("/:publisherId", this.post);
    this.router.put("/:publisherId/:id", this.put);
    this.router.delete("/:publisherId/:id", this.delete);
  }

  get: RequestHandler = async (req, res) => {
    try {
      const credentials = this.getCredentials(req);
      const id = parseInt(req.params.id, 10);
      const reportTemplate = await this.API.getReportTemplate(credentials, { id });
      res.json(reportTemplate);
    } catch (err) {
      res.status(500).json(err);
    }
  }

  getAll: RequestHandler = async (req, res) => {
    try {
      const publisherId = req.params.publisherId
      const credentials = this.getCredentials(req);
      const options = _.assign({}, { limit: Constants.MAX_API_LIMIT }, {id: publisherId});
      const reportTemplates = await this.API.getPublisherReportTemplates(credentials, options);
      res.json(reportTemplates);
    } catch (err) {
      res.status(500).json(err);
    }
  }

  post: RequestHandler = async (req, res) => {
    try {
      const credentials = this.getCredentials(req);
      const reportTemplate = req.body as ReportTemplate;
      const objectId = await this.API.createReportTemplate(credentials, { data: reportTemplate });
      res.json({ id: objectId });
    } catch (err) {
      res.status(500).json(err);
    }
  }

  put: RequestHandler = async (req, res) => {
    try {
      const credentials = this.getCredentials(req);
      const id = parseInt(req.params.id, 10);
      const reportTemplate = req.body as ReportTemplate;
      await this.API.updateReportTemplate(credentials, { id, data: reportTemplate });
      res.json({ msg: "ok" });
    } catch (err) {
      res.status(500).json(err);
    }
  }

  delete: RequestHandler = async (req, res) => {
    try {
      const credentials = this.getCredentials(req);
      const id = parseInt(req.params.id, 10);
      await this.API.deleteReportTemplate(credentials, { id });
      res.json({ msg: "ok" });
    } catch (err) {
      res.status(500).json(err);
    }
  }
}