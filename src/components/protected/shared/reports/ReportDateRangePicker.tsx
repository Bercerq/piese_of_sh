import React, { useContext } from "react";
import PresetDateRangePicker from "../../../UI/PresetDateRangePicker";
import { DateRange, DateRangePreset } from "../../../../client/schemas";
import * as Helper from "../../../../client/Helper";

interface ReportDateRangePickerProps {
  id: string;
  daterange: DateRange;
  onChange: (daterange: DateRange) => void;
}

const ReportDateRangePicker = (props: ReportDateRangePickerProps) => {
  const presets: DateRangePreset[] = Helper.getDateRangePresets();

  return <PresetDateRangePicker
    daterange={props.daterange}
    presets={presets}
    onDatesChange={props.onChange}
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
    startDateId={`${props.id}-start-date`}
    endDateId={`${props.id}-end-date`}
  />
}

export default ReportDateRangePicker;