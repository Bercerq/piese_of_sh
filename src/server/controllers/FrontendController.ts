import { RequestHandler } from "express";
import ApiController from "./ApiController";
import { NOAX } from "../api/NOAX";
import { PageType, ScopeType } from "../../client/schemas";

export default class NamesController extends ApiController {

  constructor(protected API: NOAX) {
    super(API);
    this.router.get("/navigation/:page/:scope", this.navigationItems);
    this.router.get("/navigation/:page/:scope/:scopeId", this.navigation);
    this.router.get("/navigation/:page/:scope/:scopeId/dropdown/:targetScope", this.navigationDropdown);
    this.router.get("/navigation/:page/:scope/:scopeId/level/:level", this.navigationLevel);
  }

  navigationItems: RequestHandler = async (req, res) => {
    try {
      const credentials = this.getCredentials(req);
      const options = {
        page: req.params.page as PageType,
        scope: req.params.scope as ScopeType,
        manage: req.query.manage as ("true" | "false")
      };
      const results = await this.API.navigationItems(credentials, options);
      res.json(results);
    } catch (err) {
      console.log(err);
      res.status(500).json(err);
    }
  }
  
  navigation: RequestHandler = async (req, res) => {
    try {
      const credentials = this.getCredentials(req);
      const options = {
        page: req.params.page as PageType,
        scope: req.params.scope as ScopeType,
        scopeId: parseInt(req.params.scopeId, 10)
      };
      const results = await this.API.navigation(credentials, options);
      res.json(results);
    } catch (err) {
      console.log(err);
      res.status(500).json(err);
    }
  }

  navigationDropdown: RequestHandler = async (req, res) => {
    try {
      const credentials = this.getCredentials(req);
      const options = {
        page: req.params.page as PageType,
        scope: req.params.scope as ScopeType,
        scopeId: parseInt(req.params.scopeId, 10),
        targetScope: req.params.targetScope as ScopeType
      };
      const results = await this.API.navigationDropdown(credentials, options);
      res.json(results);
    } catch (err) {
      console.log(err);
      res.status(500).json(err);
    }
  }

  navigationLevel: RequestHandler = async (req, res) => {
    try {
      const credentials = this.getCredentials(req);
      const options = {
        page: req.params.page as PageType,
        scope: req.params.scope as ScopeType,
        scopeId: parseInt(req.params.scopeId, 10),
        level: req.params.level as ScopeType
      };
      const results = await this.API.navigationLevel(credentials, options);
      res.json(results);
    } catch (err) {
      console.log(err);
      res.status(500).json(err);
    }
  }
}