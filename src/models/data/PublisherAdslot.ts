
export interface BannerSize {
    width?: number;
    height?: number;
}

export interface PlacementProperties {
    anyDeviceSizes?: Array<BannerSize>
    desktopSizes?: Array<BannerSize>
    tabletSizes?: Array<BannerSize>
    phoneSizes?: Array<BannerSize>
    divId?: String;
}

export interface IpToGeoConsent {
    truncateIpTo?: Number;
    maxAccuracy?: String;
    fixedCountry?: String;

}
export interface ConsentSettings {
    allowedDomains?: Array<String>;
    geoFromIpAllowed?: IpToGeoConsent;
}

export interface PublisherSettings {
    name?: String;
    comments?: String;
    consentSettings?: ConsentSettings;
    customProperties?: Map<String, Array<String>>;
}
export interface SiteProperties {
    domain?: String;
}
export interface PublisherSite {
    id?: Number;
    rowId?: String
    publisherSettings?: PublisherSettings;
    siteProperties?: SiteProperties
    adslots?: Array<PublisherAdslot>;
    adCategories?: Array<PublisherAdslotCategory>;
    consentSettings?: ConsentSettings
    customProperties?: Map<String, Array<String>>;
    exampleUrl?: String;
    comments?: String;
}

export interface PublisherAdslotCategory {
    id?: Number;
    siteId?: Number;
    rowId?: String;
    name?: String;
    siteSettings?: PublisherSite;
    adslots?: Array<PublisherAdslot>;
    customProperties?: Map<String, Array<String>>;
    exampleUrl?: String;
    comments?: String;
}

export interface PublisherAdslot {
    id?: Number;
    categoryId?: Number;
    siteId?: Number;
    rowId?: String;
    name?: string;
    customProperties?: Map<String, Array<String>>;
    exampleUrl?: String;
    comments?: String;
    placementProperties?:  PlacementProperties;
    categorySettings?: PublisherAdslotCategory;
    
}