import { RequestHandler } from "express";
import ApiController from "./ApiController";
import { NOAX } from "../api/NOAX";
import * as _ from "lodash";
import { AppUser } from "../../models/AppUser";
import Constants from "../../modules/Constants";
import { User, UserRow, Level, UserInvite, UserBan } from "../../models/data/User";
import { Credentials } from "../api/Api";
import { Entities } from "../../models/Common";

export default class UserController extends ApiController {

  constructor(protected API: NOAX) {
    super(API);
    this.router.get("/roles", this.getRoles);
    this.router.post("/password", this.changePassword);
    this.router.post("/invite", this.invite);
    this.router.post("/ban", this.ban);
    this.router.post("/twofactor", this.twofactor);
    this.router.post("/verifyCode", this.verifyCode);
  }

  changePassword: RequestHandler = async (req, res) => {
    try {
      const credentials = this.getCredentials(req);
      const options = _.pick(req.body, ["oldpass", "newpass"]);
      const resp = await this.API.changePassword(credentials, options);
      (req.user as AppUser).password = req.body.newpass;
      let user = req.user as AppUser;
      req.logIn(user, (err) => {
        if (err) {
          res.redirect('/logout');
        } else {
          res.json({ msg: "ok" });
        }
      });
    } catch (err) {
      console.log(err);
      res.status(500).json(err);
    }
  }

  getRoles: RequestHandler = async (req, res) => {
    try {
      const credentials = this.getCredentials(req);
      const resp: { users: User[] } = await this.API.getUsers(credentials, req.query);
      const users = resp.users;
      const userRows = this.getUserRows(users);
      const levels = _.uniqBy(userRows, "level").map((row) => { return row.level });
      const entities = await this.getEntities(credentials, levels);
      const userRoles = this.transformRoles(userRows, entities);

      res.json(userRoles);
    } catch (err) {
      res.status(500).json(err);
    }
  }

  invite: RequestHandler = async (req, res) => {
    try {
      const credentials = this.getCredentials(req);
      const userRole = req.body as UserInvite;
      await this.API.userInvite(credentials, { data: userRole });
      res.json({ msg: "ok" });
    } catch (err) {
      res.status(500).json(err);
    }
  }

  ban: RequestHandler = async (req, res) => {
    try {
      const credentials = this.getCredentials(req);
      const userRole = req.body as UserBan;
      await this.API.userBan(credentials, { data: userRole });
      res.json({ msg: "ok" });
    } catch (err) {
      res.status(500).json(err);
    }
  }

  twofactor: RequestHandler = async (req, res) => {
    try {
      const credentials = this.getCredentials(req);
      await this.API.twofactor(credentials, req.body);
      res.json({msg: "ok" });
    } catch (err) {
      res.status(500).json(err);
    }
  }

  verifyCode: RequestHandler = async (req, res) => {
    try {
      const credentials = this.getCredentials(req);
      await this.API.verifyCode(credentials, req.body);
      res.json({msg: "ok"});
    } catch (err) {
      res.status(500).json(err);
      }
    }

  async getEntities(credentials: Credentials, levels: Level[]): Promise<Entities> {
    const options = { limit: Constants.MAX_API_LIMIT };
    const organizationsP: Promise<any> = levels.includes("organization") ? this.API.getOrganizations(credentials, options) : Promise.resolve({ organizations: [] });
    const agenciesP: Promise<any> = levels.includes("agency") ? this.API.getAgencies(credentials, options) : Promise.resolve({ agencies: [] });
    const advertisersP: Promise<any> = levels.includes("advertiser") ? this.API.getAdvertisers(credentials, options) : Promise.resolve({ advertisers: [] });
    const publishersP: Promise<any> = levels.includes("publisher") ? this.API.getPublishers(credentials, options) : Promise.resolve({ publishers: [] });

    const results = await Promise.all([organizationsP, agenciesP, advertisersP, publishersP]);
    return Object.assign({}, ...results);
  }

  getUserRows(users: User[]): UserRow[] {
    return _.flatMap(users, (user) => {
      return user.roles.map((role) => {
        return _.assign({}, role, { userId: user.id, email: user.email, lastLogin: user.lastLogin, twoFactorEnabled: user.twoFactorEnabled });
      });
    });
  }

  transformRoles(userRows: UserRow[], entities: Entities) {
    return userRows.map(function (role, i) {
      let entityName = "";
      if (role.level === "organization") {
        var organization = entities.organizations.find(function (entity) { return entity.organization.id === role.entityId });
        if (organization) {
          entityName = organization.organization.name;
        }
      } else if (role.level === "agency") {
        var agency = entities.agencies.find(function (entity) { return entity.agency.id === role.entityId });
        if (agency) {
          entityName = agency.agency.name;
        }
      } else if (role.level === "advertiser") {
        var advertiser = entities.advertisers.find(function (entity) { return entity.advertiser.id === role.entityId });
        if (advertiser) {
          entityName = advertiser.advertiser.name;
        }
      } else if (role.level === "publisher") {
        var publisher = entities.publishers.find(function (entity) { return entity.publisher.id === role.entityId });
        if (publisher) {
          entityName = publisher.publisher.settings.name;
        }
      }

      return _.assign({}, role, { id: i, entityName });
    });
  }
}