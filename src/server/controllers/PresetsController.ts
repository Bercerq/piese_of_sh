import { RequestHandler } from "express";
import ApiController from "./ApiController";
import { NOAX } from "../api/NOAX";

export default class PresetsController extends ApiController {

  constructor(protected API: NOAX) {
    super(API);
    this.router.get("", this.getAll);
  }

  getAll: RequestHandler = async (req, res) => {
    try {
      const credentials = this.getCredentials(req);
      const options = req.query as any;
      const presets = await this.API.getPresets(credentials, options);
      res.json(presets);
    } catch (err) {
      console.log(err);
      res.status(500).json(err);
    }
  }
}