import React from "react";
import { Tooltip, OverlayTrigger } from "react-bootstrap";
import * as _ from "lodash";
import { Ad } from "../models/data/Ads";
import * as Helper from "./Helper";
import { ThirdPartyTrackingEvent } from "../components/protected/screens/advault/ThirdPartyTrackingRow";

export const dimensionDurationColumn = (ad: Ad): string => {
  if (ad.type == 5 || ad.type == 6 || ad.type == 7) {
    if (_.isUndefined(ad.durationMS) || _.isNull(ad.durationMS) || ad.durationMS == -1) {
      return '-';
    } else {
      return Math.round(10 * (ad.durationMS / 1000)) / 10 + "s";
    }
  } else {
    return ad.width + " x " + ad.height;
  }
}

export const statusColumn = (ad: Ad): { color: string; title: string; } => {
  let color = "";
  let title = "";

  if (ad.adWorking) {
    if (ad.active === 1 && ad.approved === 1) {
      color = "green";
      title = "ad is okay";
    } else {
      color = "orange";
      if (ad.active === 0 && ad.approved === 1) {
        title = "ad is inactive";
      } else if (ad.active === 0 && ad.approved === 0) {
        title = "ad is inactive, ";
      }

      if (ad.approved === 0) {
        title += "ad is awaiting approval";
      } else if (ad.approved === -1) {
        color = "red";
        title += "ad has been disapproved";
      } else if (ad.approved === -2) {
        title += "ad requires approval, request approval";
      }
    }
  } else {
    if (ad.hostAt3rdParty !== null) {
      color = "orange";
      title = "ad is pending publisher processing";
    } else {
      color = "red";
      title = "ad does not work!";
    }
  }
  return { color, title };
}

export const statusFormatter = (cellContent, row, rowIndex) => {
  const { color, title } = cellContent;
  const rowTooltip = <Tooltip id={`ad-status-tooltip-${rowIndex}`}>{title}</Tooltip>;
  const popperConfig = Helper.getPopperConfig();
  return <OverlayTrigger placement="top" overlay={rowTooltip} popperConfig={popperConfig}>
    <span className={`pointer circle ${color}`}></span>
  </OverlayTrigger>;
}

export const idFormatter = (cellContent, row, rowIndex) => {
  return cellContent > 0 ? cellContent : "";
}

export const statusSort = (a, b, order, dataField) => {
  const a1 = a.color === "green" ? 1 : (a.color === "orange" ? 2 : 3);
  const b1 = b.color === "green" ? 1 : (b.color === "orange" ? 2 : 3);
  if (order === "asc") {
    return a1 - b1;
  }
  return b1 - a1;
}

export const isVideoAd = (type: number): boolean => {
  const videoTypes = [5, 6, 7];
  return videoTypes.indexOf(type) >= 0;
}

export const isThirdPartyBanner = (ad: Ad): boolean => {
  return ad.type === 4 && !ad.local;
}

export const getThirdPartyTrackingEvents = (ad: Ad): ThirdPartyTrackingEvent[] => {
  const impressionEvents = ad.thirdPartyImpressions || [];
  const clickEvents = ad.thirdPartyClicks || [];
  const trackingEvents = ad.thirdPartyTracking || [];

  const thirdPartyTracking = [];
  impressionEvents.forEach((o) => { thirdPartyTracking.push({ type: "impression", url: o }); });
  clickEvents.forEach((o) => { thirdPartyTracking.push({ type: "click", url: o }); });
  trackingEvents.forEach((o) => {
    const items = o.split("__");
    if (items.length === 2) {
      thirdPartyTracking.push({ type: items[0], url: items[1] });
    }
  });
  return thirdPartyTracking;
}

export const getThirdPartyImpressions = (events: ThirdPartyTrackingEvent[]): string[] => {
  return events.filter((o) => { return o.type === "impression" }).map((o) => { return o.url });
}

export const getThirdPartyClicks = (events: ThirdPartyTrackingEvent[]): string[] => {
  return events.filter((o) => { return o.type === "click" }).map((o) => { return o.url });
}

export const getThirdPartyTracking = (events: ThirdPartyTrackingEvent[]): string[] => {
  return events.filter((o) => { return ["impression", "click"].indexOf(o.type) === -1 }).map((o) => { return `${o.type}__${o.url}` });
}

export const previewScale = (width: number, containerWidth: number): number => {
  let scale = 1;
  if (width > containerWidth) {
    scale = containerWidth / width;
  }
  return scale;
};

export const previewStyle = (width: number, height: number, scale: number) => {
  return `width: ${width}px; height: ${height}px; -webkit-transform: scale(${scale}); -moz-transform: scale(${scale}); -o-transform: scale(${scale}); -ms-transform: scale(${scale}); transform: scale(${scale}); transform-origin: top left;`
}