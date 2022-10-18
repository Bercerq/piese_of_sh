import React, { useContext, useState } from "react";
import { useParams, useLocation, useHistory } from "react-router-dom";
import * as _ from "lodash";
import moment from "moment";
import PresetDateRangePicker from "../../UI/PresetDateRangePicker";
import { DateRange, DateRangePreset, ScopeType } from "../../../client/schemas";
import * as Helper from "../../../client/Helper";
import QsContext from "../context/QsContext";
import { QsContextType, ScopeDataContextType } from "../../../models/Common";
import ScopeDataContext from "../context/ScopeDataContext";
import { Campaign } from "../../../models/data/Campaign";
import { start } from "repl";

const StatisticsDateRangePicker = () => {
  let { scope }: any = useParams();
  let location = useLocation();
  let query = new URLSearchParams(location.search);
  let history = useHistory();
  let { daterange, updateDaterange } = useContext<QsContextType>(QsContext);
  let { data } = useContext<ScopeDataContextType>(ScopeDataContext);
  //NOTE: hack to make sure 'clicks for the start date, set after the end date' are handled correctly
  const [lastClickComplete, setLastClickComplete] = useState<moment.Moment>(null);

  const presets: DateRangePreset[] = getPresets();

  const onDatesChange = ({ startDate, endDate }) => {
    if (startDate && endDate) {
      let actual_start = startDate
      if (lastClickComplete) {
        actual_start = moment(lastClickComplete);
        setLastClickComplete(null)
      }
      const sd = actual_start.format("YYYY-MM-DD");
      const ed = endDate.format("YYYY-MM-DD");
      query.set("sd", sd);
      query.set("ed", ed);
      updateDaterange({ startDate: actual_start, endDate });
      history.push(`${location.pathname}?${query.toString()}`);
    } else if (startDate &&  daterange.endDate) {
      if (startDate > daterange.endDate ) {
        setLastClickComplete(moment(startDate))
        const sd = daterange.endDate.format("YYYY-MM-DD");
        const ed =  startDate.format("YYYY-MM-DD");
        query.set("sd", sd);
        query.set("ed", ed);
        updateDaterange({ startDate:  moment(daterange.endDate),  endDate: startDate });
        history.push(`${location.pathname}?${query.toString()}`);
      } 
    }
  }

  function getPresets() {
    const presets: DateRangePreset[] = Helper.getDateRangePresets();
    if (scope as ScopeType === "campaign") {
      const startTime = _.get(data as Campaign, "campaign.startTime");
      const endTime = _.get(data as Campaign, "campaign.endTime");

      presets.push({
        text: "Campaign",
        start: moment.unix(startTime),
        end: moment.unix(endTime).add(1, 'days')
      });
    }
    return presets;
  }

  return <PresetDateRangePicker
    daterange={daterange}
    presets={presets}
    onDatesChange={onDatesChange}
    small={true}
    daySize={30}
    hideKeyboardShortcutsPanel
    anchorDirection="right"
    calendarInfoPosition="after"
    noBorder={true}
    showDefaultInputIcon={true}
    isOutsideRange={() => false}
    displayFormat="YYYY-MM-DD"
    inputIconPosition="before"
    startDateId="statistics-start-date"
    endDateId="statistics-end-date"
  />
}

export default StatisticsDateRangePicker;