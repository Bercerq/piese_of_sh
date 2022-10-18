import momentPropTypes from "react-moment-proptypes";
import * as querystring from "qs";
import validator from "validator";
import { KeyValue, MetricType } from "./schemas";
const countriesData = require('country-data').countries;

export const getStartDate = (m: momentPropTypes.momentObj): string => {
  if (m.hours() === 0 && m.minutes() === 0) {
    return m.format('YYYY-MM-DD');
  } else {
    return m.format('YYYY-MM-DD HH:mm');
  }
}

export const getEndDate = (m: momentPropTypes.momentObj): string => {
  if (m.hours() === 23 && m.minutes() === 59) {
    return m.format('YYYY-MM-DD');
  } else {
    return m.format('YYYY-MM-DD HH:mm');
  }
}

export const countries = () => {
  return countriesData["all"].map((o) => {
    return {
      value: o.alpha2,
      label: o.name
    };
  });
}

export const removeLineBreaks = (s: string): string => {
  return s.replace(/(\r\n\t|\n|\r\t)/gm, "");
}

export const numberWithCommas = (n: number | string): string => {
  let parts = n.toString().split(".");
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  if (parts.length > 1) {
    parts[1] = parts[1].substring(0, 2)
  }
  return parts.join(".");
}

export const currency = (n: number | string): string => {
  const nFloat = parseFloat(n as string);
  if (!isNaN(nFloat)) {
    return "€ " + numberWithCommas(parseFloat(n as string).toFixed(2));
  }
  return "-";
}

export const percentage = (n: number | string): string => {
  const value = Math.round((n as number) * 100) / 100;
  if (!isNaN(value)) {
    return value.toFixed(2) + '%';
  }
  return "-";
}

export const getFormat = (n: number | string, type: MetricType,): string => {
  if (n !== undefined) {
    switch (type) {
      case "number": return numberWithCommas(n);
      case "money": return currency(n);
      case "perc": return percentage(n);
      default: return n as string;
    }
  }
  return "-";
}

export const getValuePeriod = (minutes: number): { value: string; period: string; } => {
  if (minutes >= 1440 && (minutes % 1440 == 0)) { //day
    return {
      value: (minutes / 1440).toString(),
      period: "2"
    }
  }

  if (minutes >= 60 && (minutes % 60 == 0)) { //hour
    return {
      value: (minutes / 60).toString(),
      period: "1"
    }
  }

  if (minutes >= 0) { //minutes
    return {
      value: minutes.toString(),
      period: "0"
    }
  }

  if (minutes == -1) { //never
    return {
      value: "",
      period: "3"
    }
  }

  return {
    value: "30",
    period: "2"
  };
}

export const getValueInMinutes = (obj: { value: string; period: string; }): number => {
  if (obj.value === "" && obj.period !== "3") {
    return 30 * 24 * 60; //default 30 days
  } else {
    switch (obj.period) {
      case "0": //minutes
        return parseInt(obj.value);
      case "1": //hours
        return parseInt(obj.value) * 60;
      case "2": //day
        return parseInt(obj.value) * 60 * 24;
      case "3":
        return -1;
      default:
        return 30 * 24 * 60;
    }
  }
}

export const fixExcelData = (filedata) => {
  let o = "",
    l = 0,
    w = 10240;
  for (; l < filedata.byteLength / w; ++l) o += String.fromCharCode.apply(null, new Uint8Array(filedata.slice(l * w, l * w + w)));
  o += String.fromCharCode.apply(null, new Uint8Array(filedata.slice(l * w)));
  return o;
}

export const getExtension = (filename: string) => {
  const i = filename.lastIndexOf('.');
  return i < 0 ? '' : filename.substr(i);
}

export const addQueryParam = (url: string, params: KeyValue) => {
  const parts = url.split("?");
  const paramString = querystring.stringify(params);
  if (parts.length > 1) {
    if (parts[1] === "") {
      return `${url}${paramString}`;
    } else {
      return `${url}&${paramString}`;
    }
  } else {
    return `${url}?${paramString}`;
  }
}

export const isValidUrl = (url: string): boolean => {
  const options = { protocols: ["http", "https"], require_protocol: true };
  return validator.isURL(url, options);
}

export const isNumeric = (value) => {
  return /^(0|[1-9][0-9]*)$/.test(value);
}

export const isValidIp = (value) => {
  //not strict validation
  return /([0-9]{1,3}|\*)\.([0-9]{1,3}|\*)\.([0-9]{1,3}|\*)\.([0-9]{1,3}|\*)/.test(value);
}

export const addOrRemoveItemFromArray = (arr: any[], item: any): any[] => {
  const updated = arr.concat();
  const itemIndex = updated.findIndex((v) => { return v === item });
  if (itemIndex > -1) {
    updated.splice(itemIndex, 1);
  } else {
    updated.push(item);
  }
  return updated;
}