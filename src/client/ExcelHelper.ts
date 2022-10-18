import * as FileSaver from "file-saver";
import * as _ from "lodash";
import { Metric } from "./schemas";
import * as Utils from "./Utils";
import moment from "moment";

declare var XLSX; //npm xlsx-style fork

export const format = (metric: Metric) => {
  let format;
  if (metric.type === "perc") format = percentageFormat();
  if (metric.type === "money") format = currencyFormat();
  return format;
}

export const currencyFormat = () => {
  return '€#,##0.00'; 
}

export const percentageFormat = () => {
  return '0.00%';
}

export const cellFormatter = (row: any, metric: Metric) => {
  const value = row[metric.col];
  const type = metric.type;

  if (value === undefined || value === null) {
    return "";
  } else if (type === "money") {
    return currency(parseFloat(value));
  } else if (type === "perc") {
    return percentage(parseFloat(value));
  } else if (type === "budget_completion") {
    return currency(parseFloat(value.actual || 0));
  } else if (type === "impression_completion") {
    return parseFloat(value.actual || 0);
  } else if (type === "campaign_list") {
    return value.length;
  } else if (type === "ad_list") {
    return value.filter((o) => { return o.status === "active" }).length;
  } else if (type === "date") {
    return moment(value).format('YYYY-MM-DD HH:mm');
  } else if (type === "start") {
    return Utils.getStartDate(moment.unix(value));
  } else if (type === "end") {
    return Utils.getEndDate(moment.unix(value));
  } else {
    return value;
  }
}

export const getCell = (value: string, style?: any, format?: string) => {
  let cell: any = { v: value };
  if (style) cell.s = style;
  if (format) cell.z = format;
  return cell;
}

export const getBoldCell = (value: string, format?: string) => {
  return getCell(value, { font: { bold: true } }, format);
}

export const getBoldItalicCell = (value: string, format?: string) => {
  return getCell(value, { font: { bold: true, italic: true } }, format);
}

export const save = (data: any[], sheetName: string, fileName: string) => {
  const ws = sheet_from_array_of_arrays(data);
  let Sheets = {};
  Sheets[sheetName] = ws;
  const wb = { Sheets, SheetNames: [sheetName] };
  let wbout = XLSX.write(wb, { bookType: 'xlsx', bookSST: false, type: 'binary', cellHTML: true, cellStyles: true, cellDates: true });
  FileSaver.saveAs(new Blob([s2ab(wbout)], { type: "application/octet-stream" }), fileName + ".xlsx");
}

function currency(value: number) {
  if (value !== undefined) {
    const v = Math.round(value * 100) / 100;
    return parseFloat(v.toFixed(2));
  }
  return 0.00;
}

function percentage(value: number) {
  if (value !== undefined) {
    return value / 100;
  }
  return 0;
}

function s2ab(s) {
  var buf = new ArrayBuffer(s.length);
  var view = new Uint8Array(buf);
  for (var i = 0; i != s.length; ++i) view[i] = s.charCodeAt(i) & 0xFF;
  return buf;
}

function getColumnWidths(data) {
  const widths = data.map(function (row) { return row.map(function (col) { return col.v ? col.v.toString().length : 0 }) });
  let obj = {};
  for (let i = 0; i < widths.length; i++) {
    for (let j = 0; j < widths[i].length; j++) {
      if (!obj[j]) obj[j] = {};
      obj[j][i] = widths[i][j];
    }
  }
  let wscols = [];
  for (let key in obj) {
    wscols.push({ wch: _.max(_.values(obj[key])) + 5 });
  }
  return wscols;
}


function datenum(v, date1904?) {
  const basedate = new Date(1899, 11, 30, 0, 0, 0); // 2209161600000
  const dnthresh = basedate.getTime() + (new Date().getTimezoneOffset() - basedate.getTimezoneOffset()) * 60000;

  let epoch = v.getTime();
  if (date1904) epoch -= 1462 * 24 * 60 * 60 * 1000;
  return (epoch - dnthresh) / (24 * 60 * 60 * 1000);
}

function sheet_from_array_of_arrays(data) {
  var ws = {};
  var range = { s: { c: 10000000, r: 10000000 }, e: { c: 0, r: 0 } };
  for (var R = 0; R != data.length; ++R) {
    for (var C = 0; C != data[R].length; ++C) {
      if (range.s.r > R) range.s.r = R;
      if (range.s.c > C) range.s.c = C;
      if (range.e.r < R) range.e.r = R;
      if (range.e.c < C) range.e.c = C;
      var cell = data[R][C];
      if (cell.v == null) continue;

      var cell_ref = XLSX.utils.encode_cell({ c: C, r: R });

      if (typeof cell.v === 'number') cell.t = 'n';
      else if (typeof cell.v === 'boolean') cell.t = 'b';
      else if (cell.v instanceof Date) {
        cell.t = 'n';
        cell.z = XLSX.SSF._table[14];
        cell.v = datenum(cell.v);
      } else {
        cell.t = 's';
      }

      ws[cell_ref] = cell;
    }
  }
  if (range.s.c < 10000000) ws['!ref'] = XLSX.utils.encode_range(range);
  var wscols = getColumnWidths(data);
  ws['!cols'] = wscols;
  return ws;
}
