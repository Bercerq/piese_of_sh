import { Context, createContext } from "react";
import moment from "moment";
import { QsContextType } from "../../../models/Common";

const QsContext: Context<QsContextType> = createContext({
  daterange: { startDate: moment().startOf("month"), endDate: moment() },
  attributeId: 0,
  attributeId2: -1,
  filters: [],
  opfilters: [],
  opgranularity: "P1D" as ("P1D" | "PT1H"),
  tgranularity: "PT10M" as ("PT10M" | "PT1H"),
  opmetric: "impressions" as ("impressions" | "mediaCost"),
  tperiod: "24h" as ("24h" | "3d" | "1w"),
  listattribute: ""
});
export default QsContext;