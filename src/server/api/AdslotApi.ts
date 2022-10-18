import { Api, Credentials } from "./Api";
import { PublisherAdslot, PublisherAdslotCategory, PublisherSettings, PublisherSite } from "../../models/data/PublisherAdslot";
import { useLogger } from "react-use";
import { Console } from "console";

export default class AdslotApi extends Api {

    public GetPublisherCategories(credentials: Credentials, options: { publisherId: number, siteId?: Number }): Promise<any> {
        return this.Get({ path: ['/sell', 'publishers', options.publisherId, 'categories'].join('/'), credentials, qs: (options.siteId) ? { "siteId": options.siteId } : {} })
            .then(this.handleErrors).then(this.handleResponseType);
    };

    public CreatePublisherCategory(credentials: Credentials, options: { publisherId: number, data: Partial<PublisherAdslotCategory> }): Promise<any> {
        return this.Post({ path: ['/sell', 'publishers', options.publisherId, 'categories'].join('/'), credentials, body: options.data })
            .then(this.handleErrors).then(this.handleResponseType);
    };

    public UpdatePublisherCategory(credentials: Credentials, options: { publisherId: number, id?: Number, data: Partial<PublisherAdslotCategory> }): Promise<any> {
        return this.Put({ path: ['/sell', 'publishers', options.publisherId, 'categories', options.id].join('/'), credentials, body: options.data })
            .then(this.handleErrors).then(this.handleResponseType);
    };

    public DeletePublisherCategory(credentials: Credentials, options: { publisherId: number, id?: Number }): Promise<any> {
        return this.Delete({ path: ['/sell', 'publishers', options.publisherId, 'categories', options.id].join('/'), credentials });
    };

    public GetPublisherAdslots(credentials: Credentials, options: { publisherId: number, siteId?: Number }): Promise<any> {
        return this.Get({ path: ['/sell', 'publishers', options.publisherId, 'adslots'].join('/'), credentials, qs: (options.siteId) ? { "siteId": options.siteId } : {} })
            .then(this.handleErrors).then(this.handleResponseType);
    }

    public CreatePublisherAdslot(credentials: Credentials, options: { publisherId: number, data: Partial<PublisherAdslot> }): Promise<any> {
        return this.Post({ path: ['/sell', 'publishers', options.publisherId, 'adslots'].join('/'), credentials, body: options.data })
            .then(this.handleErrors).then(this.handleResponseType);
    };

    public UpdatePublisherAdslot(credentials: Credentials, options: { publisherId: number, id?: Number, data: Partial<PublisherAdslot> }): Promise<any> {
        return this.Put({ path: ['/sell', 'publishers', options.publisherId, 'adslots', options.id].join('/'), credentials, body: options.data })
            .then(this.handleErrors).then(this.handleResponseType);
    };

    public DeletePublisherAdslot(credentials: Credentials, options: { publisherId: number, id?: Number }): Promise<any> {
        return this.Delete({ path: ['/sell', 'publishers', options.publisherId, 'adslots', options.id].join('/'), credentials })
            .then(this.handleErrors).then(this.handleResponseType);
    };

    public GetPublisherSites(credentials: Credentials, options: { publisherId: number }): Promise<any> {
        return this.Get({ path: ['/sell', 'publishers', options.publisherId, 'sites'].join('/'), credentials }).then(this.handleErrors).then(this.handleResponseType);

    };

    public CreatePublisherSite(credentials: Credentials, options: { publisherId: number, data: Partial<PublisherSite> }): Promise<any> {
        return this.Post({ path: ['/sell', 'publishers', options.publisherId, 'sites'].join('/'), credentials, body: options.data }).then(this.handleErrors).then(this.handleResponseType);
    };

    public UpdatePublisherSite(credentials: Credentials, options: { publisherId: number, id: number, data: Partial<PublisherSite> }): Promise<any> {
        return this.Put({ path: ['/sell', 'publishers', options.publisherId, 'sites', options.id].join('/'), credentials, body: options.data }).then(this.handleErrors).then(this.handleResponseType);

    };

    public DeletePublisherSite(credentials: Credentials, options: { publisherId: number, id: number }): Promise<any> {
        return this.Delete({ path: ['/sell', 'publishers', options.publisherId, 'sites', options.id].join('/'), credentials }).then(this.handleErrors).then(this.handleResponseType);
    };

    public GetPublisherAdslotSettings(credentials: Credentials, options: { publisherId: number }): Promise<any> {
        return this.Get({ path: ['/sell', 'publishers', options.publisherId, 'adslotsettings'].join('/'), credentials }).then(this.handleErrors).then(this.handleResponseType);

    };

    public UpdatePublisherSettings(credentials: Credentials, options: { publisherId: number, data: Partial<PublisherSettings> }): Promise<any> {
        return this.Put({ path: ['/sell', 'publishers', options.publisherId, 'adslotsettings'].join('/'), credentials, body: options.data }).then(this.handleErrors).then(this.handleResponseType);
    };

}