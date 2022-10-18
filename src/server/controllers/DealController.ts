import { RequestHandler } from "express";
import * as _ from "lodash";
import Constants from "../../modules/Constants";
import { Controller } from "./Controller";
import ApiController from "./ApiController";
import { NOAX } from "../api/NOAX";
import { Deal, DealRequest } from "../../models/data/Deal";

export default class DealController extends ApiController implements Controller {

  constructor(protected API: NOAX) {
    super(API);
    this.router.get("", this.getAll);
    this.router.get("/:id", this.get);
    this.router.post("", this.post);
    this.router.post("/request", this.postRequest);
    this.router.put("/:id", this.put);
    this.router.delete("/:id", this.delete);
  }

  get: RequestHandler = async (req, res) => {
    try {
      const credentials = this.getCredentials(req);
      const id = parseInt(req.params.id, 10);
      const deal = await this.API.getDeal(credentials, { id });
      res.json(deal);
    } catch (err) {
      res.status(500).json(err);
    }
  }

  getAll: RequestHandler = async (req, res) => {
    try {
      const credentials = this.getCredentials(req);
      const options = _.assign({}, { limit: Constants.MAX_API_LIMIT }, req.query);
      const deals = await this.API.getDeals(credentials, options);
      res.json(deals);
    } catch (err) {
      res.status(500).json(err);
    }
  }

  post: RequestHandler = async (req, res) => {
    try {
      const credentials = this.getCredentials(req);
      const deal = req.body as Deal;
      await this.API.createDeal(credentials, { data: deal });
      res.json({ msg: "ok" });
    } catch (err) {
      res.status(500).json(err);
    }
  }

  postRequest: RequestHandler = async (req, res) => {
    try {
      const credentials = this.getCredentials(req);
      const dealRequest = req.body as DealRequest;
      await this.API.createDealRequest(credentials, { data: dealRequest });
      res.json({ msg: "ok" });
    } catch (err) {
      res.status(500).json(err);
    }
  }

  put: RequestHandler = async (req, res) => {
    try {
      const credentials = this.getCredentials(req);
      const id = parseInt(req.params.id, 10);
      const deal = req.body as Deal;
      await this.API.updateDeal(credentials, { id, data: deal });
      res.json({ msg: "ok" });
    } catch (err) {
      res.status(500).json(err);
    }
  }

  delete: RequestHandler = async (req, res) => {
    try {
      const credentials = this.getCredentials(req);
      const id = parseInt(req.params.id, 10);
      await this.API.deleteDeal(credentials, { id });
      res.json({ msg: "ok" });
    } catch (err) {
      res.status(500).json(err);
    }
  }
}