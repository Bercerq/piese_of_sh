import React, { useState, useContext, FunctionComponent, ReactNode } from "react";
import moment from "moment";
import QsContext from "./QsContext";
import { useLocation } from "react-router-dom";
import { DateRange } from "../../../client/schemas";
import { AppUser } from "../../../models/AppUser";
import UserContext from "./UserContext";

const QsProvider: FunctionComponent<ReactNode> = (props) => {
  let location = useLocation();
  let query = new URLSearchParams(location.search);
  const user: AppUser = useContext<AppUser>(UserContext);
  const initialDaterange = getDateRange();
  const initialListattribute = getListattribute();

  const [daterange, setDaterange] = useState<DateRange>(initialDaterange);
  const [attributeId, setAttributeId] = useState<number>(parseInt(query.get("attributeId") || "0", 10));
  const [attributeId2, setAttributeId2] = useState<number>(parseInt(query.get("attributeId2") || "-1", 10));
  const [filters, setFilters] = useState<string[]>(query.getAll("filters[]") || []);
  const [opfilters, setOpfilters] = useState<string[]>(query.getAll("opfilters[]") || []);
  const [opgranularity, setOpGranularity] = useState<("P1D" | "PT1H")>(query.get("opgranularity") as ("P1D" | "PT1H") || "P1D");
  const [tgranularity, setTGranularity] = useState<("PT10M" | "PT1H")>(query.get("tgranularity") as ("PT10M" | "PT1H") || "PT10M");
  const [opmetric, setOpMetric] = useState<("impressions" | "mediaCost")>(query.get("opmetric") as ("impressions" | "mediaCost") || "impressions");
  const [tperiod, setTPeriod] = useState<("24h" | "3d" | "1w")>(query.get("tperiod") as ("24h" | "3d" | "1w") || "24h");
  const [listattribute, setListattribute] = useState<string>(initialListattribute);

  function getDateRange(): DateRange {
    const sd: string = query.get("sd");
    const ed: string = query.get("ed");

    if (sd && ed) {
      return { startDate: moment(sd), endDate: moment(ed) };
    }

    return { startDate: moment().startOf("month"), endDate: moment() };
  }

  function getListattribute(): string {
    let listattribute = query.get("listattribute");
    if (!listattribute) {
      const listKey = `${user.email}-listattribute`;
      try {
        listattribute = localStorage.getItem(listKey);
      } catch (err) {
        listattribute = "";
      }
    }
    return listattribute || "";
  }

  function updateDaterange(daterange: DateRange) {
    setDaterange(daterange);
  }

  function updateAttributeId(attributeId: number) {
    setAttributeId(attributeId);
  }

  function updateAttributeId2(attributeId2: number) {
    setAttributeId2(attributeId2);
  }

  function updateFilters(filters: string[]) {
    setFilters(filters);
  }

  function updateOpFilters(filters: string[]) {
    setOpfilters(filters);
  }

  function updateOpGranularity(granularity: ("P1D" | "PT1H")) {
    setOpGranularity(granularity);
  }

  function updateTGranularity(granularity: ("PT10M" | "PT1H")) {
    setTGranularity(granularity);
  }

  function updateOpMetric(metric: ("impressions" | "mediaCost")) {
    setOpMetric(metric);
  }

  function updateTPeriod(period: ("24h" | "3d" | "1w")) {
    setTPeriod(period);
  }

  function updateListattribute(listattribute: string) {
    setListattribute(listattribute);
    const listKey = `${user.email}-listattribute`;
    localStorage.setItem(listKey, listattribute);
  }

  const providerValue = {
    daterange,
    updateDaterange,
    attributeId,
    updateAttributeId,
    attributeId2,
    updateAttributeId2,
    filters,
    updateFilters,
    opfilters,
    updateOpFilters,
    opgranularity,
    updateOpGranularity,
    tgranularity,
    updateTGranularity,
    opmetric,
    updateOpMetric,
    tperiod,
    updateTPeriod,
    listattribute,
    updateListattribute 
  };

  return <QsContext.Provider value={providerValue}>
    {props.children}
  </QsContext.Provider>;
}

export default QsProvider;