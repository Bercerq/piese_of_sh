import { RequestHandler } from "express";
import ApiController from "./ApiController";
import { NOAX } from "../api/NOAX";

export default class AlertsController extends ApiController {

  constructor(protected API: NOAX) {
    super(API);
    this.router.get("/campaigns", this.getCampaignAlerts);
  }

  getCampaignAlerts: RequestHandler = async (req, res) => {
    try {
      const credentials = this.getCredentials(req);
      const alerts = await this.API.getCampaignAlerts(credentials);
      res.json(alerts);
    } catch (err) {
      console.log(err);
      res.status(500).json(err);
    }
  }
}