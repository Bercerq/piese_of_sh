import { RequestHandler } from "express";
import ApiController from "./ApiController";
import { NOAX } from "../api/NOAX";

export default class NamesController extends ApiController {

  constructor(protected API: NOAX) {
    super(API);
    this.router.get("/search", this.search);
  }

  search: RequestHandler = async (req, res) => {
    try {
      const credentials = this.getCredentials(req);
      const results = await this.API.search(credentials, req.query as any);
      res.json(results);
    } catch (err) {
      console.log(err);
      res.status(500).json(err);
    }
  }
}