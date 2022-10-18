import { PublisherAdslot, PublisherAdslotCategory, PublisherSite, PublisherSettings } from "../../../../models/data/PublisherAdslot";
import * as _ from "lodash";



export interface OverwritableProperty {
  propertyName: string;
  original?: String;
  level?: string;
  overwritten?: String;
  current?: String;

}
export const flattenAdslotPublisher = (currentLevel: string, publisherSettings: PublisherSettings, overwritableProperties: OverwritableProperty[]): OverwritableProperty[] => {
  if (!overwritableProperties || overwritableProperties.length ==0) {
    return [];
  }
  let defaultAllowableProperties = overwritableProperties || [];
  let defaultOverwritten = new Map(defaultAllowableProperties.map(a => [a.propertyName as string, ((a.current) ? [a.current] : []) as string[]]));
  let adslotPublisherCustoms = publisherSettings.customProperties
  if (adslotPublisherCustoms) {
    adslotPublisherCustoms = new Map<string, Array<string>>(Object.entries(adslotPublisherCustoms))
  }else {
    adslotPublisherCustoms = new Map<string, Array<string>>()
  }
  let customs = _.assign({},
    Object.fromEntries(defaultOverwritten),
    Object.fromEntries(adslotPublisherCustoms),
  )
  let entries = (Object.entries(customs)) ? Object.entries(customs) : [];
  let properties: OverwritableProperty[] = entries.map((keyValue) => {
    let level = ""
    let current = ""
    let overwritten = ""
    if (currentLevel  == "publisher" && adslotPublisherCustoms && adslotPublisherCustoms.has(keyValue[0])) {
      current = adslotPublisherCustoms.get(keyValue[0]).reduce((a, b) => ((a) ? a + ", " : "") + b, "") as string;
    }
    if (currentLevel != "publisher" && adslotPublisherCustoms && adslotPublisherCustoms.has(keyValue[0])) {
      level = "publisher"
      overwritten = adslotPublisherCustoms.get(keyValue[0]).reduce((a, b) => ((a) ? a + ", " : "") + b, "") as string;
    }
    return {
      propertyName: keyValue[0],
      current: current,
      level: level,
      overwritten: (current != "") ? overwritten : "",
      original: (current == "") ? overwritten : "",
    }
  });
  return properties;
}

export const flattenAdslotSites = (currentLevel: string, siteSettings: PublisherSite, overwritableProperties: OverwritableProperty[]): OverwritableProperty[] => {
  if (!overwritableProperties || overwritableProperties.length ==0) {
    return [];
  }
  let defaultAllowableProperties = overwritableProperties || [];
  let defaultOverwritten = new Map(defaultAllowableProperties.map(a => [a.propertyName as string, ((a.current) ? [a.current] : []) as string[]]));
  let adslotSiteCustoms = siteSettings.customProperties
  let adslotPublisherCustoms = siteSettings.publisherSettings.customProperties

  if (adslotSiteCustoms) {
    adslotSiteCustoms = new Map<string, Array<string>>(Object.entries(adslotSiteCustoms))
  }else {
    adslotSiteCustoms = new Map<string, Array<string>>()
  }
  if (adslotPublisherCustoms) {
    adslotPublisherCustoms = new Map<string, Array<string>>(Object.entries(adslotPublisherCustoms))
  }else {
    adslotPublisherCustoms = new Map<string, Array<string>>()
  }
  let customs = _.assign({},
    Object.fromEntries(defaultOverwritten),
    Object.fromEntries(adslotPublisherCustoms),
    Object.fromEntries(adslotSiteCustoms),
  )
  let entries = (Object.entries(customs)) ? Object.entries(customs) : [];
  let properties: OverwritableProperty[] = entries.map((keyValue) => {
    let level = ""
    let current = ""
    let overwritten = ""
    if (currentLevel  == "site" && adslotSiteCustoms && adslotSiteCustoms.has(keyValue[0])) {
      current = adslotSiteCustoms.get(keyValue[0]).reduce((a, b) => ((a) ? a + ", " : "") + b, "") as string;
    }
    if (currentLevel != "site" && adslotSiteCustoms && adslotSiteCustoms.has(keyValue[0])) {
      level = "site"
      overwritten = adslotSiteCustoms.get(keyValue[0]).reduce((a, b) => ((a) ? a + ", " : "") + b, "") as string;
    } else if (adslotPublisherCustoms && adslotPublisherCustoms.has(keyValue[0])) {
      level = "publisher"
      overwritten = adslotPublisherCustoms.get(keyValue[0]).reduce((a, b) => ((a) ? a + ", " : "") + b, "") as string;
    }
    return {
      propertyName: keyValue[0],
      current: current,
      level: level,
      overwritten: (current != "") ? overwritten : "",
      original: (current == "") ? overwritten : "",
    }
  });
  return properties;
}

export const flattenAdslotCategories= (currentLevel: string, adslotCategory: PublisherAdslotCategory, overwritableProperties: OverwritableProperty[]): OverwritableProperty[] => {
  if (!overwritableProperties || overwritableProperties.length ==0) {
    return [];
  }
  let defaultAllowableProperties = overwritableProperties || [];
  let defaultOverwritten = new Map(defaultAllowableProperties.map(a => [a.propertyName as string, ((a.current) ? [a.current] : []) as string[]]));
  let adslotCategoryCustoms = adslotCategory.customProperties
  let adslotSiteCustoms = adslotCategory.siteSettings.customProperties
  let adslotPublisherCustoms = adslotCategory.siteSettings.publisherSettings.customProperties
  if (adslotCategoryCustoms) {
    adslotCategoryCustoms = new Map<string, Array<string>>(Object.entries(adslotCategoryCustoms))
  } else {
    adslotCategoryCustoms = new Map<string, Array<string>>()
  }
  if (adslotSiteCustoms) {
    adslotSiteCustoms = new Map<string, Array<string>>(Object.entries(adslotSiteCustoms))
  }else {
    adslotSiteCustoms = new Map<string, Array<string>>()
  }
  if (adslotPublisherCustoms) {
    adslotPublisherCustoms = new Map<string, Array<string>>(Object.entries(adslotPublisherCustoms))
  }else {
    adslotPublisherCustoms = new Map<string, Array<string>>()
  }
  let customs = _.assign({},
    Object.fromEntries(defaultOverwritten),
    Object.fromEntries(adslotPublisherCustoms),
    Object.fromEntries(adslotSiteCustoms),
    Object.fromEntries(adslotCategoryCustoms),
  )
  let entries = (Object.entries(customs)) ? Object.entries(customs) : [];
  let properties: OverwritableProperty[] = entries.map((keyValue) => {
    let level = ""
    let current = ""
    let overwritten = ""
    if (currentLevel  == "category" && adslotCategoryCustoms && adslotCategoryCustoms.has(keyValue[0])) {
      current = adslotCategoryCustoms.get(keyValue[0]).reduce((a, b) => ((a) ? a + ", " : "") + b, "") as string;
    }
    if (currentLevel != "category" && adslotCategoryCustoms && adslotCategoryCustoms.has(keyValue[0])) {
      level = "group"
      overwritten = adslotCategoryCustoms.get(keyValue[0]).reduce((a, b) => ((a) ? a + ", " : "") + b, "") as string;
    } else if (adslotSiteCustoms && adslotSiteCustoms.has(keyValue[0])) {
      level = "site"
      overwritten = adslotSiteCustoms.get(keyValue[0]).reduce((a, b) => ((a) ? a + ", " : "") + b, "") as string;
    } else if (adslotPublisherCustoms && adslotPublisherCustoms.has(keyValue[0])) {
      level = "publisher"
      overwritten = adslotPublisherCustoms.get(keyValue[0]).reduce((a, b) => ((a) ? a + ", " : "") + b, "") as string;
    }
    return {
      propertyName: keyValue[0],
      current: current,
      level: level,
      overwritten: (current != "") ? overwritten : "",
      original: (current == "") ? overwritten : "",
    }
  });
  return properties;
}

export const flattenAdslotCustoms = (adslot: PublisherAdslot, overwritableProperties: OverwritableProperty[]): OverwritableProperty[] => {
  if (!overwritableProperties || overwritableProperties.length ==0) {
    return [];
  }
  let defaultAllowableProperties = overwritableProperties || [];
  let defaultOverwritten = new Map(defaultAllowableProperties.map(a => [a.propertyName as string, ((a.current) ? [a.current] : []) as string[]]));
  let adslotCustoms = adslot.customProperties
  let adslotCategoryCustoms = adslot.categorySettings.customProperties
  let adslotSiteCustoms = adslot.categorySettings.siteSettings.customProperties
  let adslotPublisherCustoms = adslot.categorySettings.siteSettings.publisherSettings.customProperties
  if (adslotCustoms) {
    adslotCustoms = new Map<string, Array<string>>(Object.entries(adslotCustoms))
  } else {
    adslotCustoms = new Map<string, Array<string>>()
  }
  if (adslotCategoryCustoms) {
    adslotCategoryCustoms = new Map<string, Array<string>>(Object.entries(adslotCategoryCustoms))
  } else {
    adslotCategoryCustoms = new Map<string, Array<string>>()
  }
  if (adslotSiteCustoms) {
    adslotSiteCustoms = new Map<string, Array<string>>(Object.entries(adslotSiteCustoms))
  }else {
    adslotSiteCustoms = new Map<string, Array<string>>()
  }
  if (adslotPublisherCustoms) {
    adslotPublisherCustoms = new Map<string, Array<string>>(Object.entries(adslotPublisherCustoms))
  }else {
    adslotPublisherCustoms = new Map<string, Array<string>>()
  }
  let customs = _.assign({},
    Object.fromEntries(defaultOverwritten),
    Object.fromEntries(adslotPublisherCustoms),
    Object.fromEntries(adslotSiteCustoms),
    Object.fromEntries(adslotCategoryCustoms),
    Object.fromEntries(adslotCustoms),
  )


  let entries = (Object.entries(customs)) ? Object.entries(customs) : [];
  let properties: OverwritableProperty[] = entries.map((keyValue) => {
    let level = ""
    let current = ""
    let overwritten = ""
    if (adslotCustoms && adslotCustoms.has(keyValue[0])) {
      current = adslotCustoms.get(keyValue[0]).reduce((a, b) => ((a) ? a + ", " : "") + b, "") as string;
    }
    if (adslotCategoryCustoms && adslotCategoryCustoms.has(keyValue[0])) {
      level = "group"
      overwritten = adslotCategoryCustoms.get(keyValue[0]).reduce((a, b) => ((a) ? a + ", " : "") + b, "") as string;
    } else if (adslotSiteCustoms && adslotSiteCustoms.has(keyValue[0])) {
      level = "site"
      overwritten = adslotSiteCustoms.get(keyValue[0]).reduce((a, b) => ((a) ? a + ", " : "") + b, "") as string;
    } else if (adslotPublisherCustoms && adslotPublisherCustoms.has(keyValue[0])) {
      level = "publisher"
      overwritten = adslotPublisherCustoms.get(keyValue[0]).reduce((a, b) => ((a) ? a + ", " : "") + b, "") as string;
    }
    return {
      propertyName: keyValue[0],
      current: current,
      level: level,
      overwritten: (current != "") ? overwritten : "",
      original: (current == "") ? overwritten : "",
    }
  });
  return properties;
}

export const overwritablePropertiesToMap = (overwritableProperties: OverwritableProperty[]): Map<String, String[]> => {
  //keep only the properties that are non empty
  const values = new Map(overwritableProperties.filter(property => property.current != "")
    .map(property => [property.propertyName, property.current.split(",").map( a => a.trim())]))
  return values
}