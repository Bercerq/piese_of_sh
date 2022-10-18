import { Router } from "express";
import * as bodyParser from "body-parser";
import { NOAX } from "../api/NOAX";
import { Credentials } from "../api/Api";

export default class ApiController {
  public router: Router = Router();
  
  constructor(protected API: NOAX) {
    this.router.use(bodyParser.json());
  }

  protected getCredentials(req): Credentials {
    return { username: req.user.username, password: req.user.password };
  }
}