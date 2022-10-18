import express from "express";
import session from "express-session";
const MemcachedStore = require('connect-memcached')(session);
import { Server } from "http";
import passport from "passport";
import passportLocal from "passport-local";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import busboy from "connect-busboy";
import * as config from "../config";
import * as AppController from "./server/AppController";
import { NOAX } from "./server/api/NOAX";
import Constants from "./modules/Constants";
import AuthorizationService from "./server/AuthorizationService";
import LoginController from "./server/controllers/LoginController";
import UserController from "./server/controllers/UserController";
import OrganizationController from "./server/controllers/OrganizationController";
import PublisherController from "./server/controllers/PublisherController";
import AgencyController from "./server/controllers/AgencyController";
import AdvertiserController from "./server/controllers/AdvertiserController";
import AdsController from "./server/controllers/AdsController";
import NamesController from "./server/controllers/NamesController";
import FrontendController from "./server/controllers/FrontendController";
import CampaignGroupController from "./server/controllers/CampaignGroupController";
import CampaignController from "./server/controllers/CampaignController";
import ListController from "./server/controllers/ListController";
import DealController from "./server/controllers/DealController";
import SegmentController from "./server/controllers/SegmentController";
import AlertsController from "./server/controllers/AlertsController";
import PresetsController from "./server/controllers/PresetsController";
import AttributesController from "./server/controllers/AttributesController";
import StatisticsController from "./server/controllers/StatisticsController";
import ReportingController from "./server/controllers/ReportingController";
import ReportController from "./server/controllers/ReportController";
import PublisherReportController from "./server/controllers/PublisherReportController"
import ReportTemplateController from "./server/controllers/ReportTemplateController";
import PublisherReportTemplateController from "./server/controllers/PublisherReportTemplateController";
import SuggestionController from "./server/controllers/SuggestionController";
import CreativeFeedsController from "./server/controllers/CreativeFeedsController";
import AdslotController from "./server/controllers/AdSlotsController";
import XMLController from "./server/controllers/XMLController";
const app = express();
const server = new Server(app);
const LocalStrategy = passportLocal.Strategy;
const API = new NOAX({ host: config.backend, timeout: config.timeout as number });
const authService = new AuthorizationService(API);

app.use(express.static("public"));
app.use(Constants.LOCAL_ADS_PREVIEW, express.static(Constants.LOCAL_BANNERS_DIR)); //used for banner preview
app.use(bodyParser.json({ limit: 10000000 }));
app.use(bodyParser.urlencoded({
  extended: true,
  limit: 10000000,
  parameterLimit: 1000000
}));
app.use(busboy());
app.use(cookieParser());

let sessionParams: session.SessionOptions = {
  secret: 'noclue',
  resave: false,
  saveUninitialized: false
};

if (config.useMemcached) {
  sessionParams.store = new MemcachedStore({
    hosts: config.memcachedHosts
  });
}

app.use(session(sessionParams));
app.use(passport.initialize());
app.use(passport.session());

passport.use("local", new LocalStrategy(AppController.localStrategyHandler(authService)));
passport.serializeUser<any, any>((user: any, done: any) => { done(null, JSON.stringify(user)); });
passport.deserializeUser((user: string, done) => { done(null, JSON.parse(user)); });

app.get("/logout", AppController.logoutHandler);
app.route("/login")
  .get(AppController.publicGetHandler)
  .post(AppController.loginPostHandler(passport));

app.get("/forgotPassword", AppController.publicGetHandler);
app.get("/newPassword", AppController.newPasswordHandler);
app.use("/api/login", new LoginController(API).router);
app.use(AppController.ensureAuthenticated);
// static documentation site built by mkdocs
// test - run in manual folder:  mkdocs serve
// build - run in manual folder: mkdocs build
app.use("/kb", express.static("manual/site"));
app.use("/api/users", new UserController(API).router);
app.use("/api/organizations", new OrganizationController(API).router);
app.use("/api/publishers", new PublisherController(API).router);
app.use("/api/agencies", new AgencyController(API).router);
app.use("/api/advertisers", new AdvertiserController(API).router);
app.use("/api/campaigngroups", new CampaignGroupController(API).router);
app.use("/api/campaigns", new CampaignController(API).router);
app.use("/api/lists", new ListController(API).router);
app.use("/api/deals", new DealController(API).router);
app.use("/api/segments", new SegmentController(API).router);
app.use("/api/ads", new AdsController(API).router);
app.use("/api/names", new NamesController(API).router);
app.use("/api/frontend", new FrontendController(API).router);
app.use("/api/alerts", new AlertsController(API).router);
app.use("/api/presets", new PresetsController(API).router);
app.use("/api/attributes", new AttributesController(API).router);
app.use("/api/statistics", new StatisticsController(API).router);
app.use("/api/reporting", new ReportingController(API).router);
app.use("/api/reports", new ReportController(API).router);
app.use("/api/publisherreports", new PublisherReportController(API).router)
app.use("/api/reportTemplates", new ReportTemplateController(API).router);
app.use("/api/publisherReportTemplates", new PublisherReportTemplateController(API).router)
app.use("/api/targeting/suggestion", new SuggestionController(API).router);
app.use("/api/creativefeed", new CreativeFeedsController(API).router);
app.use("/api/adslots", new AdslotController(API).router);
app.use("/xml", new XMLController(API).router);

app.post("/session", AppController.sessionPostHandler);
app.get("/", AppController.rootGetHandler);
app.get("*", AppController.universalGetHandler);

const port = config.port;
server.listen(port, () => { console.info(`Server running on http://localhost:${port}`); });