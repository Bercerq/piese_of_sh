import React, { useState, useEffect, useRef, useContext } from "react";
import { useHistory } from "react-router-dom";
import { Button } from "react-bootstrap";
import Select from "react-select";
import moment from "moment";
import * as Api from "../../../../../client/Api";
import * as Helper from "../../../../../client/Helper";
import * as FiltersHelper from "../../../shared/filters/FiltersHelper";
import { QsContextType, TabProps } from "../../../../../models/Common";
import { GroupOption, SelectOption, StatisticFilter } from "../../../../../client/schemas";
import { AttributeCollection } from "../../../../../models/data/Attribute";
import StatisticFilterRow from "../../../shared/filters/StatisticFilterRow";
import FontIcon from "../../../../UI/FontIcon";
import Loader from "../../../../UI/Loader";
import OperationalAdvertisersChart from "./OperationalAdvertisersChart";
import OperationalChartsRow from "./OperationalChartsRow";
import ErrorContainer from "../../../../UI/ErrorContainer";
import QsContext from "../../../context/QsContext";

const OperationalDashboardTab = (props: TabProps) => {
  let history = useHistory();
  let query = new URLSearchParams(location.search);
  let {
    opfilters,
    updateOpFilters,
    opgranularity,
    updateOpGranularity,
    opmetric,
    updateOpMetric
  } = useContext<QsContextType>(QsContext);
  const initialFilters = FiltersHelper.getStatisticFilters(opfilters);

  const [agenciesData, setAgenciesData] = useState<any[]>([]);
  const [advertisersData, setAdvertisersData] = useState<any[]>([]);
  const [showAgenciesLoader, setShowAgenciesLoader] = useState<boolean>(true);
  const [showAdvertisersLoader, setShowAdvertisersLoader] = useState<boolean>(true);
  const [statisticFilters, setStatisticFilters] = useState<StatisticFilter[]>(initialFilters);
  const [filterAttributeCollection, setFilterAttributeCollection] = useState<AttributeCollection>({});
  const [error, setError] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>("");

  const agenciesController = useRef<AbortController>(null);
  const advertisersController = useRef<AbortController>(null);

  useEffect(() => {
    loadFilterAttributes();
    return () => {
      unload(agenciesController.current);
      unload(advertisersController.current);
    };
  }, []);

  useEffect(() => {
    loadAgenciesData();
    loadAdvertisersData();
  }, [JSON.stringify({ options: props.options, opfilters, opgranularity })]);

  async function loadAgenciesData() {
    setShowAgenciesLoader(true);
    try {
      unload(agenciesController.current);
      agenciesController.current = new AbortController();
      const qs = getAgenciesOptions();
      const response = await Api.Get({ path: `/api/statistics/timeseries`, qs, signal: agenciesController.current.signal });
      const data = transformAgenciesData(response);
      setAgenciesData(data);
      setShowAgenciesLoader(false);
    } catch (err) {
      if (err.name === "AbortError") {
        setError(false);
        setErrorMessage("");
      } else {
        setError(true);
        setErrorMessage("Error loading data");
        setShowAgenciesLoader(false);
      }
    }
  }

  async function loadAdvertisersData() {
    setShowAdvertisersLoader(true);
    try {
      unload(advertisersController.current);
      advertisersController.current = new AbortController();
      const qs = getAdvertisersOptions();
      const response = await Api.Get({ path: `/api/statistics/timeseries`, qs, signal: advertisersController.current.signal });
      const data = transformAdvertisersData(response);
      setAdvertisersData(data);
      setShowAdvertisersLoader(false);
    } catch (err) {
      if (err.name === "AbortError") {
        setError(false);
        setErrorMessage("");
      } else {
        setError(true);
        setErrorMessage("Error loading data");
        setShowAdvertisersLoader(false);
      }
    }
  }

  async function loadFilterAttributes() {
    try {
      const attributeCollection = await FiltersHelper.getFilterAttributes({ scope: props.options.scope, scopeId: props.options.scopeId });
      setFilterAttributeCollection(attributeCollection);
    } catch (err) {
      console.log(err);
    }
  }

  function unload(controller: AbortController) {
    if (controller) {
      controller.abort();
    }
  }

  function getAgenciesOptions() {
    const start = moment(props.options.startDate).startOf('day').format("YYYY-MM-DDTHH:mm:ss");
    const end = moment(props.options.endDate).endOf('day').format("YYYY-MM-DDTHH:mm:ss");
    const qs = {
      attributeId: 101,
      scope: props.options.scope,
      scopeId: props.options.scopeId,
      granularity: opgranularity,
      start,
      end,
      metrics: ["maxAdpodSpots", "impressions", "bidsInternal", "avgBid", "winning_cpm"],
      sortMetric: "impressions",
      filter: opfilters || []
    };
    return qs;
  }

  function getAdvertisersOptions() {
    const start = moment(props.options.startDate).startOf('day').format("YYYY-MM-DDTHH:mm:ss");
    const end = moment(props.options.endDate).endOf('day').format("YYYY-MM-DDTHH:mm:ss");
    const qs = {
      attributeId: 102,
      scope: props.options.scope,
      scopeId: props.options.scopeId,
      granularity: opgranularity,
      start,
      end,
      metrics: ["impressions", "mediaCost"],
      sortMetric: "impressions",
      limit: 9,
      filter: opfilters || []
    }
    return qs;
  }



  function transformAgenciesData(response: any) {
    let total = response.total;
    total.name = "All";
    const data = [total];
    const agenciesData = response.resultsPerValue.filter((o) => { return o.name !== null });
    return data.concat(agenciesData);
  }

  function transformAdvertisersData(response: any) {
    return response.resultsPerValue.filter((o) => { return o.name !== null });
  }

  function getGranularityOptions(): SelectOption[] {
    return [
      { value: "P1D", label: "per day" },
      { value: "PT1H", label: "per hour" }
    ];
  }

  function getAdvertisersMetricOptions(): SelectOption[] {
    return [
      { value: "impressions", label: "impressions" },
      { value: "mediaCost", label: "costs" }
    ];
  }

  const addFilterClick = () => {
    const newStatisticFilter: StatisticFilter = { attributeId: -1, condition: "in", values: [] };
    setStatisticFilters([...statisticFilters, newStatisticFilter]);
  }

  const statisticFilterChange = (i: number, filter: StatisticFilter) => {
    let updated = statisticFilters.concat();
    updated[i] = filter;
    setStatisticFilters(updated);
  }

  const statisticFilterDelete = (i: number) => {
    const updated = statisticFilters.concat();
    if (updated.length > 0) {
      updated.splice(i, 1);
      setStatisticFilters(updated);
    }
    if (updated.length === 0) {
      query.delete("opfilters[]");
      updateOpFilters([]);
      history.push(`${location.pathname}?${query.toString()}`);
    }
  }

  const applyFiltersClick = () => {
    const filters = FiltersHelper.getFilters(statisticFilters);
    updateOpFilters(filters);
    query.delete("opfilters[]");
    filters.forEach((filter) => {
      query.append("opfilters[]", filter);
    });
    history.push(`${location.pathname}?${query.toString()}`);
  }

  const clearFiltersClick = () => {
    updateOpFilters([]);
    query.delete("opfilters[]");
    setStatisticFilters([]);
    history.push(`${location.pathname}?${query.toString()}`);
  }

  const handleGranularityChange = (selected: SelectOption) => {
    const opgranularity = selected.value as ("P1D" | "PT1H");
    query.set("opgranularity", opgranularity);
    updateOpGranularity(opgranularity);
    history.push(`${location.pathname}?${query.toString()}`);
  }

  const handleAdvertisersMetricChange = (selected: SelectOption) => {
    const opmetric = selected.value as ("impressions" | "mediaCost");
    query.set("opmetric", opmetric);
    updateOpMetric(opmetric);
    history.push(`${location.pathname}?${query.toString()}`);
  }


  if (!error) {
    const granularityOptions = getGranularityOptions();
    const advertisersMetricOptions = getAdvertisersMetricOptions();
    const filterOptions: (GroupOption | SelectOption)[] = ([{ value: -1, label: "Select dimension" }] as (GroupOption | SelectOption)[]).concat(Helper.attributeIdOptions(filterAttributeCollection));
    return <div className="col-sm-12 pt-3 mb-2">
      <div className="row no-gutters mb-2">
        <div className="col-lg-8">
          <Button size="sm" variant="primary" onClick={addFilterClick}><FontIcon name="plus" /> ADD FILTER</Button>
          <div>
            {
              statisticFilters.map((statisticFilter, i) => <StatisticFilterRow
                key={`filter-${i}`}
                index={i}
                filter={statisticFilter}
                attributes={filterOptions}
                writeAccess={true}
                onChange={statisticFilterChange}
                onDelete={statisticFilterDelete}
              />)
            }
          </div>
          {statisticFilters.length > 0 && <button className="mr-2 btn btn-primary btn-xs" onClick={applyFiltersClick}><FontIcon name="search" /> APPLY FILTERS</button>}
          {statisticFilters.length > 0 && <button className="mr-2 btn btn-primary btn-xs" onClick={clearFiltersClick}><FontIcon name="remove" /> CLEAR FILTERS</button>}
        </div>
        <div className="col-lg-4">
          <div className="width-100 pull-right" style={{ marginRight: "10px" }}>
            <Select
              inputId="react-select-granularity"
              className="react-select-container"
              classNamePrefix="react-select"
              clearable={false}
              isSearchable={false}
              value={granularityOptions.find((o) => { return o.value === opgranularity })}
              onChange={handleGranularityChange}
              options={granularityOptions}
            />
          </div>
        </div>
      </div>
      <Loader visible={showAdvertisersLoader} />
      {!showAdvertisersLoader && advertisersData.length > 0 &&
        <div className="row mb-2">
          <div className="col-lg-12">
            <div className="card" style={{ height: "550px" }}>
              <div>
                <h3 className="pull-left">Advertisers</h3>
                <div className="width-150 pull-right">
                  <Select
                    inputId="react-select-advertisers-metric"
                    className="react-select-container"
                    classNamePrefix="react-select"
                    clearable={false}
                    isSearchable={false}
                    value={advertisersMetricOptions.find((o) => { return o.value === opmetric })}
                    onChange={handleAdvertisersMetricChange}
                    options={advertisersMetricOptions}
                  />
                </div>
              </div>
              <OperationalAdvertisersChart data={advertisersData} granularity={opgranularity} metric={opmetric} />
            </div>
          </div>
        </div>
      }
      <Loader visible={showAgenciesLoader} />
      {!showAgenciesLoader && agenciesData.length > 0 &&
        agenciesData.map((row, i) => <div key={`chart-row-${i}`} className="row mb-2">
          <div className="col-lg-12">
            <div className="card">
              <h3>{row.name}</h3>
              <OperationalChartsRow data={row} granularity={opgranularity} />
            </div>
          </div>
        </div>)
      }
    </div>;
  } else {
    return <div className="col-sm-12 pt-3">
      <div className="card mb-2">
        <h3><ErrorContainer message={errorMessage} /></h3>
      </div>
    </div>;
  }
}
export default OperationalDashboardTab;