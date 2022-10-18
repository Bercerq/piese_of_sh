const fetch = require('node-fetch');

import { RequestHandler } from "express";
import ApiController from "./ApiController";
import { NOAX } from "../api/NOAX";
import * as _ from "lodash";
import { AppUser } from "../../models/AppUser";
import Constants from "../../modules/Constants";
import { User, UserRow, Level, UserInvite, UserBan } from "../../models/data/User";
import { Credentials } from "../api/Api";
import { Entities } from "../../models/Common";

export default class XMLController extends ApiController {

  constructor(protected API: NOAX) {
    super(API);
    this.router.post("/", this.getXML)
  }

   getXML: RequestHandler = async (req, res) => {
    try {
      const url = req.body.url
      const xml = await fetch(url, { method: 'GET' }).then((res) => res.text())
      res.json({"xml": xml});
    } catch (err) {
      res.status(500).json(err);
    }
  }









}