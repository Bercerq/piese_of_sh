import React, { useEffect } from "react";
import moment from "moment";
import * as _ from "lodash";
import * as Utils from "../../../../client/Utils";
import * as CampaignPacingHelper from "./CampaignPacingHelper";
import C3Chart from "../../../UI/C3Chart";
import { CampaignPacingProps } from "./CampaignPacing";

declare var $: any;

const CampaignPacingChart = (props: CampaignPacingProps) => {

  useEffect(() => {
    drawDateChanges(moment().format('YYYY-MM-DD'));
  }, []);

  function getChartOptions() {
    const dates = getPacingDates(props.data.startDate, props.data.endDate);
    const predictionKey = `expectationToPredicted${props.predictionDays}DayTotal`;
    const categories = getCategories(dates);
    const aim = getAimData(dates);
    const linear = getLinearData(dates);
    const spent = getSpentData(dates);
    const prediction = getPredictionData(dates, predictionKey);
    const lineColors = getLineColors();
    const names = getLineNames();
    const dateRegions = getDateRegions(categories);
    const predictionRegions = getPredictionRegions(categories, predictionKey);
    const regions = dateRegions.concat(predictionRegions);
    const maxLinear = linear[linear.length - 1];
    const y2 = getY2Axis(maxLinear);

    let c3options = {
      data: {
        columns: [aim, linear, prediction, spent],
        colors: lineColors,
        names,
        axes: {
          aim: 'y2',
          linear: 'y2',
          spent: 'y2',
          prediction: 'y2'
        },
        color: function (color, d) {
          return getPointColor(color, d, categories, predictionKey);
        },
        hide: ['aim']
      },
      axis: {
        x: {
          type: 'category',
          categories: categories,
          tick: {
            rotate: 40,
            multiline: false,
            culling: {
              max: 15 // the number of tick texts will be adjusted to less than this value
            }
          },
          height: 80
        },
        y: {
          show: false
        },
        y2: y2
      },
      regions,
      grid: {
        x: {
          lines: []
        }
      },
      point: {
        r: 2,
        focus: {
          expand: {
            r: 6
          }
        }
      },
      tooltip: {
        contents: function (d, defaultTitleFormat, defaultValueFormat, color) {
          return getTooltip(d, dates, categories);
        }
      },
      onmouseout: mouseoutPoints,
      size: {
        height: 480
      }
    };

    const gridXLines = getGridXLines(categories, predictionKey);
    if (gridXLines.length > 0) c3options.grid.x.lines = gridXLines;

    return c3options;
  }

  function getCategories(dates) {
    let categories = [];
    if (dates.start.length > 0) {
      categories = categories.concat(dates.start);
      categories.push("");
    }

    if (dates.past.length > 0) {
      categories = categories.concat(dates.past);
    }

    if (dates.future.length > 0) {
      categories = categories.concat(dates.future);
      categories.push("");
    }

    if (dates.end.length > 0) {
      categories = categories.concat(dates.end);
    }

    return categories;
  }

  function getPacingDates(startDate, endDate) {
    const mEndDate = moment(endDate);
    const mStartDate = moment(startDate);

    const now = moment().format('YYYY-MM-DD');//to have 1 day difference instead of 0, time is not important here
    const mNow = moment(now);
    let pacingDates = {
      start: [],
      past: [],
      future: [],
      end: []
    }

    if (mNow.diff(mStartDate, 'days') < 0) {//future campaign
      if (mEndDate.diff(mStartDate, 'days') > 14) {
        //(startDate + 7) + (endDate - 7)
        for (let i = 0; i < 7; i++) {
          pacingDates.future.push(moment(startDate).add(i, 'days').format('YYYY-MM-DD'));
        }

        for (let i = 6; i >= 0; i--) {
          pacingDates.end.push(moment(endDate).subtract(i, 'days').format('YYYY-MM-DD'));
        }
      } else {
        //(endDate - startDate)
        const diff = mEndDate.diff(mStartDate, 'days');
        for (let i = diff; i >= 0; i--) {
          pacingDates.end.push(moment(endDate).subtract(i, 'days').format('YYYY-MM-DD'));
        }
      }

    } else if (mEndDate.diff(mNow, 'days') < 0) {//ended campaigns
      //now = endDate;
      if (mEndDate.diff(mStartDate, 'days') > 67) {
        //(startDate + 7) + (endDate - 60)
        for (let i = 0; i < 7; i++) {
          pacingDates.start.push(moment(startDate).add(i, 'days').format('YYYY-MM-DD'));
        }

        for (let i = 59; i >= 0; i--) {
          pacingDates.past.push(moment(endDate).subtract(i, 'days').format('YYYY-MM-DD'));
        }
      } else {
        //(endDate - startDate)
        const diff = mEndDate.diff(mStartDate, 'days');
        for (let i = diff; i >= 0; i--) {
          pacingDates.past.push(moment(endDate).subtract(i, 'days').format('YYYY-MM-DD'));
        }
      }
    } else {
      if (mNow.diff(mStartDate, 'days') > 67) {
        //(startDate + 7) + (now - 60)
        for (let i = 0; i < 7; i++) {
          pacingDates.start.push(moment(startDate).add(i, 'days').format('YYYY-MM-DD'));
        }

        for (let i = 60; i > 0; i--) {
          pacingDates.past.push(moment(now).subtract(i, 'days').format('YYYY-MM-DD'));
        }
      } else {
        //(now - startDate)
        const diff = mNow.diff(mStartDate, 'days');
        for (let i = diff; i > 0; i--) {
          pacingDates.past.push(moment(now).subtract(i, 'days').format('YYYY-MM-DD'));
        }
      }

      if (mEndDate.diff(mNow, 'days') > 14) {
        //(now + 7) + (endDate - 7)
        for (let i = 0; i < 7; i++) {
          pacingDates.future.push(moment(now).add(i, 'days').format('YYYY-MM-DD'));
        }

        for (let i = 6; i >= 0; i--) {
          pacingDates.end.push(moment(endDate).subtract(i, 'days').format('YYYY-MM-DD'));
        }
      } else {
        //(endDate - now)
        const diff = mEndDate.diff(mNow, 'days');
        for (let i = diff; i >= 0; i--) {
          pacingDates.end.push(moment(endDate).subtract(i, 'days').format('YYYY-MM-DD'));
        }
      }
    }

    return pacingDates;
  }

  function getAimData(dates) {
    const aim = ["aim"];
    if (dates.start.length > 0) {
      dates.start.forEach(function (d) {
        const aimData = (props.data.aimToSpendTotal || []).find(function (o) { return o.date === d; });
        aim.push(_.get(aimData, "value.needed", null));
      });
      //to create gap in chart
      aim.push(null);
    }

    if (dates.past.length > 0) {
      dates.past.forEach(function (d, i) {
        const aimData = (props.data.aimToSpendTotal || []).find(function (o) { return o.date === d; });
        aim.push(_.get(aimData, "value.needed", null));
      });
    }

    if (dates.future.length > 0) {
      dates.future.forEach(function (d) {
        const aimData = (props.data.aimToSpendTotal || []).find(function (o) { return o.date === d; });
        aim.push(_.get(aimData, "value.needed", null));
      });
      //to create gap in chart
      aim.push(null);
    }

    if (dates.end.length > 0) {
      dates.end.forEach(function (d) {
        const aimData = (props.data.aimToSpendTotal || []).find(function (o) { return o.date === d; });
        aim.push(_.get(aimData, "value.needed", null));
      });
    }
    return aim;
  }

  function getLinearData(dates) {
    const linear = ["linear"];
    if (dates.start.length > 0) {
      dates.start.forEach(function (d) {
        const linearData = (props.data.expectationToSpendTotal || []).find(function (o) { return o.date === d; });
        linear.push(_.get(linearData, "value.needed", null));
      });
      linear.push(null);
    }

    if (dates.past.length > 0) {
      dates.past.forEach(function (d, i) {
        const linearData = (props.data.expectationToSpendTotal || []).find(function (o) { return o.date === d; });
        linear.push(_.get(linearData, "value.needed", null));
      });
    }

    if (dates.future.length > 0) {
      dates.future.forEach(function (d) {
        const linearData = (props.data.expectationToSpendTotal || []).find(function (o) { return o.date === d; });
        linear.push(_.get(linearData, "value.needed", null));
      });
      linear.push(null);
    }

    if (dates.end.length > 0) {
      dates.end.forEach(function (d) {
        const linearData = (props.data.expectationToSpendTotal || []).find(function (o) { return o.date === d; });
        linear.push(_.get(linearData, "value.needed", null));
      });
    }

    return linear;
  }

  function getSpentData(dates) {
    const spent = ["spent"];
    if (dates.start.length > 0) {
      dates.start.forEach(function (d) {
        const spentData = (props.data.spentTotal || []).find(function (o) { return o.date === d; });
        spent.push(_.get(spentData, "value", null));
      });
      spent.push(null);
    }

    if (dates.past.length > 0) {
      dates.past.forEach(function (d, i) {
        const spentData = (props.data.spentTotal || []).find(function (o) { return o.date === d; });
        spent.push(_.get(spentData, "value", null));
      });
    }

    if (dates.future.length > 0) {
      dates.future.forEach(function (d) {
        spent.push(null);
      });
      spent.push(null);
    }

    if (dates.end.length > 0) {
      dates.end.forEach(function (d) {
        spent.push(null);
      });
    }

    return spent;
  }

  function getPredictionData(dates, predictionKey) {
    const prediction = ["prediction"];

    if (dates.start.length > 0) {
      dates.start.forEach(function (d) {
        prediction.push(null);
      });
      prediction.push(null);
    }

    if (dates.past.length > 0) {
      dates.past.forEach(function (d, i) {
        if (i === dates.past.length - 1) {
          const spentData = (props.data.spentTotal || []).find(function (o) { return o.date === d; });
          prediction.push(_.get(spentData, "value", null));
        } else {
          prediction.push(null);
        }
      });
    }

    if (dates.future.length > 0) {
      dates.future.forEach(function (d) {
        const predictionData = (props.data[predictionKey] || []).find(function (o) { return o.date === d; });
        prediction.push(_.get(predictionData, "value.actual", null));
      });
      prediction.push(null);
    }

    if (dates.end.length > 0) {
      dates.end.forEach(function (d) {
        const predictionData = (props.data[predictionKey] || []).find(function (o) { return o.date === d; });
        prediction.push(_.get(predictionData, "value.actual", null));
      });
    }

    return prediction;
  }

  function getY2Axis(maxLinear) {
    if (maxLinear === "NaN") {
      return {
        show: true,
        padding: {
          top: 10,
          bottom: 10
        }
      };
    } else {
      return {
        show: true,
        min: 0,
        max: maxLinear * 1.25,
        tick: {
          format: function (d) {
            return Math.round((d / maxLinear) * 100) + "%";
          },
          values: function () {
            const values = [0 * maxLinear,
            0.25 * maxLinear,
            0.5 * maxLinear,
            0.75 * maxLinear,
            1 * maxLinear,
            1.25 * maxLinear];
            return values;
          }
        },
        padding: {
          top: 10,
          bottom: 10
        }
      };
    }
  }

  function getLineColors() {
    return {
      aim: '#66e0ff',
      linear: '#0067e6',
      spent: '#000000',
      prediction: '#000000'
    };
  }

  function getLineNames() {
    const spentLabel = props.type === "budget" ? "spent" : "impressions";
    return {
      aim: 'aim',
      linear: 'goal',
      spent: spentLabel,
      prediction: 'prediction'
    };
  }

  function getPointColor(color, d, categories, predictionKey) {
    if (d.id === "prediction") {
      const date = categories[d.index];
      const predictionData = (props.data[predictionKey] || []).find(function (o) { return o.date === date; });
      if (predictionData) {
        const judgement = _.get(predictionData, "value.judgement", "");
        const judgementColor = CampaignPacingHelper.getJudgementColor(judgement);
        if (judgementColor) {
          return judgementColor;
        }
      }
    }
    return color;
  }

  function getGridXLines(categories, predictionKey) {
    const currDate = moment().format('YYYY-MM-DD');
    const lines = [];
    if (categories.indexOf(currDate) > -1) {
      const predictionData = (props.data[predictionKey] || []).find(function (o) { return o.date === currDate; });
      if (predictionData) {
        const judgement = _.get(predictionData, "value.judgement", "");
        const judgementClass = CampaignPacingHelper.getJudgementClass(judgement);
        lines.push({ value: currDate, text: 'today', position: 'middle', class: 'c3-gridline-' + judgementClass });
      }
    }
    const changeDates = getCampaignChangesDates(categories);
    const changeLines = changeDates.map(function (date) { return { value: date, class: 'c3-gridline-change' } });
    return lines.concat(changeLines);
  }

  function getCampaignChangesDates(categories) {
    let changeDates = [];
    if (props.data.campaignChanges) {
      _.forEach(props.data.campaignChanges, function (value, key) {
        changeDates = changeDates.concat(props.data.campaignChanges[key].map(function (o) { return o.date }));
      });
    }
    changeDates = changeDates.filter(function (d) { return categories.indexOf(d) > -1 });
    return _.uniq(changeDates);
  }

  function drawDateChanges(date) {
    const rows = [];
    if (props.data.campaignChanges) {
      _.forEach(props.data.campaignChanges, function (value, key) {
        const changes = value || [];
        const rowHtml = getChangeHtml(date, changes, key);
        if (rowHtml !== "") rows.push(getChangeHtml(date, changes, key));
      });
    }

    let html = "";
    if (rows.length > 0) {
      html = '<div class="card"><table class="table border-bottom-0"><thead><tr><th class="font-weight-bold border-top-0" colspan="3">' + date + '</th></tr></thead><tbody>';
      html += rows.join('');
      html += '</tbody></table></div>';
    }

    $("#" + props.id + "-changes").html(html);
  }

  function getChangeHtml(date, changeDates, type) {
    const dateItem = _.find(changeDates, function (o) { return o.date === date });
    if (dateItem) {
      const data = dateItem.value;
      const typeText = getChangeTypeText(type);
      const valueHtml = getValueChangeHtml(type, data.oldValue, data.newValue);
      const typeIcon = getChangeIcon(type, data.newValue);
      return `<tr>
                <td style="width:50px;text-align:right;font-weight: 500">${moment(data.changeTime).format("HH:mm")}</td>
                <td style="width:30px">${typeIcon}</td><td>${typeText} ${valueHtml}</td>
              </tr>`;
    }
    return "";
  }

  function getChangeTypeText(type) {
    switch (type) {
      case "budget": return "Budget";
      case "impressionCap": return "Max impressions";
      case "maxBid": return "Max bid";
      case "startTime": return "Start time";
      case "endTime": return "End time";
      default: return "";
    }
  }

  function getChangeIcon(type, newValue) {
    let typeIcon = "";
    if (type === "budget") {
      typeIcon = "euro";
    } else if (type === "impressionCap") {
      typeIcon = "users";
    } else if (type === "maxBid") {
      typeIcon = "gavel";
    } else if (type === "startTime") {
      typeIcon = "hourglass-start";
    } else if (type === "endTime") {
      typeIcon = "hourglass-end";
    } else if (type === "active") {
      if (newValue) {
        typeIcon = "play";
      } else {
        typeIcon = "pause";
      }
    } else if (type === "targeting") {
      typeIcon = "bullseye";
    }

    if (typeIcon !== "") {
      return '<i class="fa fa-' + typeIcon + '"></i>';
    }
    return "";
  }

  function getValueChangeHtml(type, oldValue, newValue) {
    switch (type) {
      case "budget": return getBudgetImpressionChangeText(oldValue, newValue);
      case "impressionCap": return getBudgetImpressionChangeText(oldValue, newValue);
      case "maxBid": return getMaxBidChangeText(oldValue, newValue);
      case "startTime": return getTimeChangeText(oldValue, newValue);
      case "endTime": return getTimeChangeText(oldValue, newValue);
      case "active": return getActiveChangeText(newValue);
      case "targeting": return "Campaign targeting updated";
      default: return "";
    }
  }

  function getBudgetImpressionChangeText(oldValue, newValue) {
    if (oldValue === null) {
      return "was set to <i>" + newValue.value + "</i> per " + newValue.type.toLowerCase();
    } else if (newValue === null) {
      return "<i>" + oldValue.value + "</i> per " + oldValue.type.toLowerCase() + " was unset";
    } else {
      return "was set from <i>" + oldValue.value + "</i> per " + oldValue.type.toLowerCase() + " to <i>" + newValue.value + "</i> per " + newValue.type.toLowerCase();
    }
  }

  function getMaxBidChangeText(oldValue, newValue) {
    if (oldValue === null) {
      return "was set to <i>" + newValue + "</i>";
    } else if (newValue === null) {
      return "<i>" + oldValue + "</i> was unset";
    } else {
      return "was set from <i>" + oldValue + "</i> to <i>" + newValue + "</i>";
    }
  }

  function getTimeChangeText(oldValue, newValue) {
    if (oldValue === null) {
      return "was set to <i>" + moment(newValue).format('YYYY-MM-DD HH:mm') + "</i>";
    } else if (newValue === null) {
      return "<i>" + moment(oldValue).format('YYYY-MM-DD HH:mm') + "</i> was unset";
    } else {
      return "was set from <i>" + moment(oldValue).format('YYYY-MM-DD HH:mm') + "</i> to <i>" + moment(newValue).format('YYYY-MM-DD HH:mm') + "</i>";
    }
  }

  function getActiveChangeText(newValue) {
    if (newValue) {
      return "Campaign was activated";
    } else {
      return "Campaign was deactivated";
    }
  }

  function getPredictionRegions(categories, predictionKey) {
    const currDate = moment().format('YYYY-MM-DD');
    const currIndex = _.findIndex(categories, function (c) { return c === currDate });

    const regions = [];
    for (let i = currIndex; i < categories.length; i++) {
      if (i < categories.length - 1) {
        const predictionData = (props.data[predictionKey] || []).find(function (o) { return o.date === categories[i + 1]; });
        if (predictionData) {
          const judgement = _.get(predictionData, "value.judgement", "");
          const judgementClass = CampaignPacingHelper.getJudgementClass(judgement);
          regions.push({ start: i, end: i + 1, class: 'c3-judgement-' + judgementClass });
        }
      }
    }
    return regions;
  }

  function getDateRegions(categories) {
    let points = categories.map(function (c, i) { return c === "" ? i : -1 }).filter(function (d) { return d !== -1 });
    points = [0].concat(points);
    points = points.concat(categories.length - 1);
    const regions = [];

    for (let i = 0; i < points.length - 1; i++) {
      const start = points[i];
      let end = points[i + 1] - 1;
      if (i === points.length - 2) {
        end = points[i + 1];
      }
      let label = "";
      if (start === 0 && end === 6) {
        label = "start";
      } else if (start === categories.length - 8 && end === categories.length - 1) {
        label = "end";
      }
      regions.push({ axis: 'x', start: start, end: end, class: 'c3-date-region', label: label });
    }
    return regions;
  }

  function mouseoverPoints(index, date, pastDates) {
    if (pastDates.indexOf(date) >= 0) {
      const lineColors = getLineColors();
      const ids = ["linear", "spent"];
      ids.forEach(function (id) {
        const dKey = id === "spent" ? "expectationToSpendTotal" : "aimToSpendDay";
        const data = (props.data[dKey] || []).find(function (o) { return o.date === date; });
        if (data) {
          const judgement = _.get(data, "value.judgement", "");
          const judgementColor = CampaignPacingHelper.getJudgementColor(judgement);
          $("#" + props.id + "-chart .c3-circles-" + id + " .c3-circle").css({ fill: lineColors[id] });
          $("#" + props.id + "-chart .c3-circles-" + id + " .c3-circle-" + index).css({ fill: judgementColor });
        }
      });
    }
  }

  function mouseoutPoints() {
    const lineColors = getLineColors();
    const ids = ["aim", "linear", "spent"];
    ids.forEach(function (id) {
      $("#" + props.id + "-chart .c3-circles-" + id + " .c3-circle").css({ fill: lineColors[id] });
    });
  }

  function getTooltip(d, dates, categories) {
    const index = d[0].index;
    const date = categories[index];
    const pastDates = dates.start.concat(dates.past);
    mouseoverPoints(index, date, pastDates);
    drawDateChanges(date);
    if (pastDates.indexOf(date) >= 0) {
      return getPastTooltip(date);
    } else {
      return getFutureTooltip(date);
    }
  }

  function getPastTooltip(date) {
    const lineColors = getLineColors();
    const spentLabel = props.type === "budget" ? "spent" : "impressions";
    const spentTotal = getPastTooltipValue("spentTotal", date);
    const spentDay = getPastTooltipValue("spentDay", date);

    const linearTotal = getPastTooltipValue("expectationToSpendTotal", date);
    const aimDay = getPastTooltipValue("aimToSpendDay", date);

    return `<table class="c3-tooltip">
    <tbody>
      <tr>
        <th colspan="3">${date}</th>
      </tr>
      <tr>
        <td></td>
        <td><strong>total</strong></td>
        <td><strong>day</strong></td>
      </tr>
      <tr class="c3-tooltip-name--spent">
        <td class="name"><span style="background-color:${lineColors.spent}"></span>${spentLabel}</td>
        <td class="value">${spentTotal}</td>
        <td class="value">${spentDay}</td>
      </tr>
      <tr>
        <td colspan="3">compared to</td>
      </tr>
      <tr class="c3-tooltip-name--linear">
        <td class="name"><span style="background-color:${lineColors.linear}"></span>goal</td>
        <td class="value">${linearTotal}</td>
        <td class="value"></td>
      </tr>
      <tr class="c3-tooltip-name--aim">
        <td class="name"><span style="background-color:${lineColors.aim}"></span>aim</td>
        <td class="value"></td>
        <td class="value">${aimDay}</td>
      </tr>
    </tbody>
  </table>`;
  }

  function getFutureTooltip(date) {
    const lineColors = getLineColors();
    const predictionKey = "expectationToPredicted" + props.predictionDays + "DayTotal";

    const predictTotal = getFutureTooltipValue(predictionKey, "predicted", date);
    const linearTotal = getFutureTooltipValue(predictionKey, "linear", date);

    return `<table class="c3-tooltip">
    <tbody>
      <tr>
        <th colspan="2">${date}</th>
      </tr>
      <tr>
        <td></td>
        <td><strong>total</strong></td>
      </tr>
      <tr class="c3-tooltip-name--prediction">
        <td class="name"><span style="background-color:${lineColors.prediction}"></span>predicted</td>
        <td class="value">${predictTotal}</td>
      </tr>
      <tr>
        <td colspan="2">compared to</td>
      </tr>
      <tr class="c3-tooltip-name--linear">
        <td class="name"><span style="background-color:${lineColors.linear}"></span>goal</td>
        <td class="value">${linearTotal}</td>
      </tr>
    </tbody>
  </table>`;
  }

  function getPastTooltipValue(key, date) {
    const data = (props.data[key] || []).find(function (o) { return o.date === date; });
    if (key === "spentTotal" || key === "spentDay") {
      return Utils.numberWithCommas(_.get(data, "value", ""));
    } else {
      const judgement = _.get(data, "value.judgement", "");
      const color = CampaignPacingHelper.getJudgementColor(judgement);
      const percentage = Utils.percentage(_.get(data, "value.percentage", ""));
      const needed = Utils.numberWithCommas(_.get(data, "value.needed", ""));

      return `${needed} (<span style="width: auto; color: ${color}">${percentage}</span>)`;
    }
  }

  function getFutureTooltipValue(key, field, date) {
    const data = _.find(props.data[key] || [], function (o) { return o.date === date; });
    const judgement = _.get(data, "value.judgement", "");
    const color = CampaignPacingHelper.getJudgementColor(judgement);
    const percentage = Utils.percentage(_.get(data, "value.percentage", ""));
    let actual = Utils.numberWithCommas(_.get(data, "value.actual", ""));
    let needed = Utils.numberWithCommas(_.get(data, "value.needed", ""));

    if (judgement === "UNKNOWN") {
      if (actual === "0") actual = "Not enough data";
      if (needed === "0") needed = "Not enough data";
    }

    if (field === "predicted") {
      return actual;
    } else {
      if (percentage === "0.00%") {
        return needed;
      } else {
        return needed + ' (<span style="width: auto;color: ' + color + '">' + percentage + '</span>)';
      }
    }
  }

  const options = getChartOptions();
  return <C3Chart id={`${props.id}-chart`} height="500px" options={options} />;
}

export default CampaignPacingChart;