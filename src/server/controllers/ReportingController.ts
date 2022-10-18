import { RequestHandler } from "express";
import ApiController from "./ApiController";
import { NOAX } from "../api/NOAX";

export default class ReportingController extends ApiController {

  constructor(protected API: NOAX) {
    super(API);
    this.router.get("/ssp", this.ssp);
    this.router.get("/financials", this.financials);
  }

  ssp: RequestHandler = async (req, res) => {
    try {
      const credentials = this.getCredentials(req);
      const options = {
        startDate: req.query.startDate as string,
        endDate: req.query.endDate as string,
      };
      const results = await this.API.ssp(credentials, options);
      res.json(results);
    } catch (err) {
      console.log(err);
      res.status(500).json(err);
    }
  }

  financials: RequestHandler = async (req, res) => {
    try {
      const credentials = this.getCredentials(req);
      const options = {
        startDate: req.query.startDate as string,
        endDate: req.query.endDate as string,
      };
      const results = await this.API.financials(credentials, options);
      res.json(results);
    } catch (err) {
      console.log(err);
      res.status(500).json(err);
    }
  }
}