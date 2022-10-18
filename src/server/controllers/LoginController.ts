import { RequestHandler } from "express";
import * as _ from "lodash";
import ApiController from "./ApiController";
import { NOAX } from "../api/NOAX";

export default class LoginController extends ApiController {

  constructor(protected API: NOAX) {
    super(API);
    this.router.post("/resetpassword", this.resetPassword);
    this.router.post("/setpassword", this.setPassword);
  }

  resetPassword: RequestHandler = async (req, res) => {
    try {
      const resp = await this.API.resetPassword({ email: req.body.email });
      res.json({ msg: "An email was send to the e-mail address you provided. Follow the instructions and create a new password." });
    } catch (err) {
      console.log("err", err);
      res.status(500).json(err);
    }
  }

  setPassword: RequestHandler = async (req, res) => {
    try {
      const options = _.pick(req.body, ["email", "hash", "password"]);
      const resp = await this.API.setPassword(options);
      res.json({ msg: "ok" });
    } catch (err) {
      console.log("err", err);
      res.status(500).json(err);
    }
  }
}