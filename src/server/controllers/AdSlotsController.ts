import { RequestHandler } from "express";
import * as _ from "lodash";
import Constants from "../../modules/Constants";
import * as Roles from "../../modules/Roles";
import { Controller } from "./Controller";
import ApiController from "./ApiController";
import { Api } from "../api/Api";
import { NOAX } from "../api/NOAX";
import { AdvertiserEntity } from "../../models/data/Advertiser";
import { StatisticsOptions } from "../../models/data/Statistics";
import { Scope } from "../../models/Common";
import { Attributes } from "../../modules/Enums";
import { RetailBranch } from "../../models/data/RetailBranch";

export default class AdslotController extends ApiController {

    constructor(protected API: NOAX) {
        super(API);
        this.router.get('/publishers/:id/categories', this.getCategories);
        this.router.post('/publishers/:id/categories', this.createCategories);
        this.router.put('/publishers/:id/categories/:categoryId', this.updateCategory);
        this.router.delete('/publishers/:id/categories/:categoryId', this.deleteCategory)

        this.router.get('/publishers/:id/adslots', this.getAdslots);
        this.router.post('/publishers/:id/adslots', this.createAdslot);
        this.router.put('/publishers/:id/adslots/:slotId', this.updateAdslot)
        this.router.delete('/publishers/:id/adslots/:slotId', this.deleteAdslot)

        this.router.get('/publishers/:id/sites', this.getSites)
        this.router.post('/publishers/:id/sites', this.createSite)
        this.router.put('/publishers/:id/sites/:siteId', this.updateSite)
        this.router.delete('/publishers/:id/sites/:siteId', this.deleteSite)

        this.router.get('/publishers/:id/adslotSettings', this.getPublisherAdslotSettings)
        this.router.put('/publishers/:id/adslotSettings', this.updatePublisherAdslotSettings)
    }

    getCategories: RequestHandler = async (req, res) => {
        try {
            var options = { publisherId: Number(req.params.id), siteId: Number(req.query.siteId) };
            const credentials = this.getCredentials(req);
            const response = await this.API.GetPublisherCategories(credentials, options);
            res.json(response || []);
        } catch (err) {
            res.json({ err: err })
        }
    };

    updateCategory: RequestHandler = async (req, res) => {
        try {
            var options = { publisherId: Number(req.params.id), id: Number(req.params.categoryId), data: req.body };
            const credentials = this.getCredentials(req);
            const response = await this.API.UpdatePublisherCategory(credentials, options);
            res.json(response || []);
        } catch (err) {
            res.json({ err: err })
        }
    };

    createCategories: RequestHandler = async (req, res) => {
        try {
            var options = { publisherId: Number(req.params.id), id: Number(req.params.categoryId), data: req.body};
            const credentials = this.getCredentials(req);
            const response = await this.API.CreatePublisherCategory(credentials, options);
            res.json(response || []);
        } catch (err) {
            res.json({ err: err })
        }
    };

    deleteCategory: RequestHandler = async (req, res) => {
        try {
            var options = { publisherId: Number(req.params.id), id: Number(req.params.categoryId)};
            const credentials = this.getCredentials(req);
            const response = await this.API.DeletePublisherCategory(credentials, options);
            res.json(response || []);
        } catch (err) {
            res.json({ err: err })
        }
    };

    getAdslots: RequestHandler = async (req, res) => {
        try {
            var options = { publisherId: Number(req.params.id), siteId: Number(req.query.siteId) };
            const credentials = this.getCredentials(req);
            const response = await this.API.GetPublisherAdslots(credentials, options);
            res.json(response || []);
        } catch (err) {
            res.json({ err: err })
        }
    }


    createAdslot: RequestHandler = async (req, res) => {
        try {
            var options = { publisherId: Number(req.params.id), data: req.body};
            const credentials = this.getCredentials(req);
            const response = await this.API.CreatePublisherAdslot(credentials, options);
            res.json(response || []);
        } catch (err) {
            res.json({ err: err })
        }
    };

    updateAdslot: RequestHandler = async (req, res) => {
        try {
            var options = { publisherId: Number(req.params.id), id: Number(req.params.slotId), data: req.body};
            const credentials = this.getCredentials(req);
            const response = await this.API.UpdatePublisherAdslot(credentials, options);
            res.json(response || []);
        } catch (err) {
            res.json({ err: err })
        }
    };

    deleteAdslot: RequestHandler = async (req, res) => {
        try {
            var options = { publisherId: Number(req.params.id), id: Number(req.params.slotId)};
            const credentials = this.getCredentials(req);
            const response = await this.API.DeletePublisherAdslot(credentials, options);
            res.json(response || []);
        } catch (err) {
            res.json({ err: err })
        }
    };

    getSites: RequestHandler = async (req, res) => {
        try {
            var options = { publisherId: Number(req.params.id) };
            const credentials = this.getCredentials(req);
            const response = await this.API.GetPublisherSites(credentials, options);
            res.json(response || []);
        } catch (err) {
            res.json({ err: err })
        }
    };

    createSite: RequestHandler = async (req, res) => {
        try {
            var options = { publisherId: Number(req.params.id), data: req.body };
            const credentials = this.getCredentials(req);
            const response = await this.API.CreatePublisherSite(credentials, options);
            res.json(response || []);
        } catch (err) {
            res.json({ err: err })
        }
    };

    updateSite: RequestHandler = async (req, res) => {
        try {
            var options = { publisherId: Number(req.params.id), id: Number(req.params.siteId), data: req.body };
            const credentials = this.getCredentials(req);
            const response = await this.API.UpdatePublisherSite(credentials, options);
            res.json(response || []);
        } catch (err) {
            res.json({ err: err })
        }
    };

    deleteSite: RequestHandler = async (req, res) => {
        try {
            var options = { publisherId: Number(req.params.id), id: Number(req.params.siteId) };
            const credentials = this.getCredentials(req);
            const response = await this.API.DeletePublisherSite(credentials, options);
            res.json(response || []);
        } catch (err) {
            res.json({ err: err })
        }
    }

    getPublisherAdslotSettings: RequestHandler = async (req, res) => {
        var options = { publisherId: Number(req.params.id) };
        const credentials = this.getCredentials(req);
        const response = await this.API.GetPublisherAdslotSettings(credentials, options);
        res.json(response || []);

    };

    updatePublisherAdslotSettings: RequestHandler = async (req, res) => {
        try {
            var options = { publisherId: Number(req.params.id), data: req.body };
            const credentials = this.getCredentials(req);
            const response = await this.API.UpdatePublisherSettings(credentials, options);
            res.json(response || []);
        } catch (err) {
            res.json({ err: err })
        }
    };
}