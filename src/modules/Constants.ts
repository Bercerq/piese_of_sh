import { Right } from "../models/Common";
import * as path from "path";

export default class Constants {
  public static readonly ACTIONS: Right[] = [
    "VIEW_PUBLISHER",
    "MANAGE_PUBLISHER",
    "VIEW_ORGANIZATION",
    "MANAGE_ORGANIZATION",
    "VIEW_AGENCY",
    "MANAGE_AGENCY",
    "CREATE_ADVERTISER",
    "VIEW_ADVERTISER",
    "MANAGE_ADVERTISER",
    "VIEW_CAMPAIGNGROUP",
    "MANAGE_CAMPAIGNGROUP",
    "VIEW_CAMPAIGN",
    "MANAGE_CAMPAIGN",
    "VIEW_FINANCIALS",
    "VIEW_STATISTICS",
    "VIEW_USERS",
    "MANAGE_USERS",
    "VIEW_LISTS",
    "MANAGE_LISTS",
    "VIEW_DEALS",
    "MANAGE_DEALS",
    "VIEW_ADS",
    "MANAGE_ADS",
    "VIEW_SEGMENTS",
    "MANAGE_SEGMENTS",
    "SEARCH_NAMES",
    "MANAGE_PRESETS",
    "VIEW_PRESETS",
    "MANAGE_PUBLISHER_DEALS",
    "VIEW_PUBLISHER_DEALS",
    "VIEW_REPORTS",
    "MANAGE_REPORTS",
    "VIEW_REPORT_TEMPLATES",
    "MANAGE_REPORT_TEMPLATES",
    "VIEW_FEEDS",
    "MANAGE_FEEDS",
    "VIEW_PUBLISHER_AD_SLOTS",
    "MANAGE_PUBLISHER_AD_SLOTS"
  ];

  public static readonly CHILDREN_ACTIONS: Right[] = [
    "VIEW_ORGANIZATION",
    "MANAGE_ORGANIZATION",
    "VIEW_AGENCY",
    "MANAGE_AGENCY",
    "VIEW_ADVERTISER",
    "MANAGE_ADVERTISER",
    "VIEW_CAMPAIGNGROUP",
    "MANAGE_CAMPAIGNGROUP",
    "VIEW_CAMPAIGN",
    "MANAGE_CAMPAIGN",
    "VIEW_PUBLISHER",
    "MANAGE_PUBLISHER"
  ];

  public static readonly MAX_API_LIMIT: number = 2147483647;

  public static readonly LOCAL_BANNERS_DIR: string = path.join(__dirname, '../tmp/banners/');

  public static readonly LOCAL_VIDEOS_DIR: string = path.join(__dirname, '../tmp/videos/');

  public static readonly LOCAL_ADS_PREVIEW: string = '/banners/preview/';

  public static readonly ZIP_LEVEL: number = 3;

  public static readonly STER_AGENCIES: number[] = [70, 89];

  public static readonly ABOVO_AGENCIES: number[] = [90];
}