import React from "react";
import { ReportTabFigure } from "../../../../models/data/Report";
import { GroupOption, SelectOption } from "../../../../client/schemas";
import ReportTabTable from "./ReportTabTable";
import ReportTabChart from "./ReportTabChart";

interface ReportTabFigureContainerProps {
  tabIndex: number;
  index: number;
  figure: ReportTabFigure;
  metricOptions: SelectOption[];
  dimensionOptions: (GroupOption | SelectOption)[];
  type: "table" | "chart";
  writeAccess: boolean;
  onChange: (index: number, figure: ReportTabFigure, isValid: boolean) => void;
  onDelete: (index: number) => void;
}

const ReportTabFigureContainer = (props: ReportTabFigureContainerProps) => {
  if (props.type === "table") {
    return <ReportTabTable
      index={props.index}
      tabIndex={props.tabIndex}
      figure={props.figure}
      metricOptions={props.metricOptions}
      dimensionOptions={props.dimensionOptions}
      writeAccess={props.writeAccess}
      onChange={props.onChange}
      onDelete={props.onDelete}
    />
  } else {
    return <ReportTabChart
      index={props.index}
      tabIndex={props.tabIndex}
      figure={props.figure}
      metricOptions={props.metricOptions}
      dimensionOptions={props.dimensionOptions}
      writeAccess={props.writeAccess}
      onChange={props.onChange}
      onDelete={props.onDelete}
    />
  }
}
export default ReportTabFigureContainer;