import React, { useState } from "react";
import { Button } from "react-bootstrap";
import moment from "moment";
import momentPropTypes from "react-moment-proptypes";
import "react-dates/initialize";
import { DateRangePicker, DateRangePickerShape } from "react-dates";
import { DateRange, DateRangePreset } from "../../client/schemas";

type DateRangePickerWrapperShape = Partial<DateRangePickerShape>;

interface PresetDateRangePickerProps {
  daterange: DateRange;
  startDateId: string;
  endDateId: string;
  presets: DateRangePreset[];
  onDatesChange: (daterange: DateRange) => void;
}

const PresetDateRangePicker = (props: PresetDateRangePickerProps & DateRangePickerWrapperShape) => {
  const [focusedInput, setFocusedInput] = useState(null);

  const onDatesChange = ({ startDate, endDate }) => {
    setFocusedInput(false);
    props.onDatesChange({ startDate, endDate })
  }

  const renderDatePresets = () => {
    const { startDate, endDate } = props.daterange;
    return <div>
      {
        props.presets.map(({ text, start, end }) => {
          const isSelected = moment(startDate).isSame(start, "day") && moment(endDate).isSame(end, "day");
          const variant = isSelected ? "primary" : "light";
          return <Button key={text} variant={variant} size="sm" onClick={() => onDatesChange({ startDate: start, endDate: end })}>
            {text}
          </Button>;
        })}
    </div>;
  }

  return <DateRangePicker
    {...props}
    startDateId={props.startDateId}
    endDateId={props.endDateId}
    renderCalendarInfo={renderDatePresets}
    minimumNights={0}
    startDate={props.daterange.startDate}
    endDate={props.daterange.endDate}
    onDatesChange={onDatesChange}
    focusedInput={focusedInput} // PropTypes.oneOf([START_DATE, END_DATE]) or null,
    onFocusChange={focusedInput => setFocusedInput(focusedInput)}
  />
}

export default PresetDateRangePicker;