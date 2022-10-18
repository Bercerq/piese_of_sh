import React, { useState, useRef, useEffect, Fragment } from "react";
import { ButtonGroup, Button } from "react-bootstrap";
import * as _ from "lodash";
import * as Api from "../../../../../client/Api";
import * as Enums from "../../../../../modules/Enums";
import Constants from "../../../../../modules/Constants";
import { TabProps } from "../../../../../models/Common";
import { StatisticsOptions } from "../../../../../models/data/Statistics";
import ErrorContainer from "../../../../UI/ErrorContainer";
import Loader from "../../../../UI/Loader";

declare var $;
declare var c3;

const StatisticsCharts = (props: TabProps) => {
  const chartId = "statistics-chart";
  const categories = getStatisticsCategories();
  const [showLoader, setShowLoader] = useState<boolean>(true);
  const [data, setData] = useState<any[]>([]);
  const [category, setCategory] = useState<any>(categories[0]);
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const [error, setError] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>("");

  const controller = useRef<AbortController>(null);

  useEffect(() => { return unload; }, []);
  useEffect(() => { loadData(); }, [JSON.stringify(props.options)]);
  useEffect(() => {
    if (data.length > 0 && !showLoader) {
      createGraph();
    }
  }, [data, category, showLoader]);

  async function loadData() {
    setShowLoader(true);
    try {
      unload();
      controller.current = new AbortController();
      const options = getOptions();
      const response = await Api.Get({ path: "/api/statistics", qs: options, signal: controller.current.signal });
      const data = getProcessedData(response);
      setData(data);
      setShowLoader(false);
    } catch (err) {
      console.log(err);
      if (err.name === "AbortError") {
        setError(false);
        setErrorMessage("");
      } else {
        setError(true);
        setErrorMessage("Error loading data.");
        setShowLoader(false);
      }
    }
  }

  function unload() {
    if (controller.current) {
      controller.current.abort();
    }
  }

  function getOptions() {
    let options: StatisticsOptions = {
      scope: props.options.scope,
      attributeId: Enums.Attributes.PER_DAY,
      startDate: props.options.startDate,
      endDate: props.options.endDate,
      limit: Constants.MAX_API_LIMIT,
      simple: "false",
      videoMetrics: "any",
      aggregator: 'name'
    };
    if (props.options.scopeId !== undefined) options.scopeId = props.options.scopeId;
    return options;
  }

  function getProcessedData(response: any) {
    let processedData = (response.statisticList || []).concat();
    processedData.forEach((row) => {
      row.winrate = (row.impressions / row.bids * 100).toFixed(2);
      row.media = row.expenses;
      row.nonUniqueClicks = row.clicks - row.uniqueClicks;
      row.impressionsNotWon = row.bids - row.impressions;

      _.forEach(row, (v, k) => {
        row[k] = fixDecimals(v);
      });
    });
    return processedData;
  }

  function getStatisticsCategories(): ({ label: string; config: any })[] {
    if (props.rights.VIEW_FINANCIALS) {
      if (props.options.scope == 'campaign') {
        return [
          { label: "impact", config: { data: { names: { 'impressions': 'imps won', 'clicks': 'total clicks' }, axes: { 'impressions': 'y2', 'clicks': 'y', 'conversions': 'y' }, types: { 'conversions': 'bar' }, keys: { value: ['impressions', 'clicks', 'conversions'] } }, axis: { y2: { show: true } }, padding: { left: 60, right: 60 } } },
          { label: "financials", config: { data: { keys: { value: ['revenue', 'profit', 'costs'] }, names: { 'costs': 'total cost' } }, padding: { left: 80, right: 40 } } },
          { label: "performance", config: { data: { type: 'line', keys: { value: ['cpc', 'cpo'] }, names: { 'cpc': 'cpc', 'cpo': 'cpa' }, axes: { 'cpc': 'y', 'cpo': 'y2' } }, axis: { y2: { show: true } }, padding: { left: 80, right: 40 } } },
          {
            label: "winrate",
            config: {
              data: {
                names: { 'impressions': 'imps won', 'impressionsNotWon': 'imps not won' },
                axes: { 'impressions': 'y2', 'impressionsNotWon': 'y2', 'winrate': 'y' },
                types: { 'winrate': 'line', 'impressions': 'bar', 'impressionsNotWon': 'bar' },
                groups: [
                  ['impressions', 'impressionsNotWon']
                ],
                keys: { value: ['impressions', 'impressionsNotWon', 'winrate'] },
                order: function (t1, t2) {
                  if (t1.id == 'impressions') return -1;
                  else return 1;
                }
              },
              axis: { y2: { show: true } },
              padding: { left: 40, right: 80 }
            }
          }, {
            label: "clicks",
            config: {
              data: {
                types: { 'uniqueClicks': 'bar', 'nonUniqueClicks': 'bar' },
                groups: [
                  ['uniqueClicks', 'nonUniqueClicks']
                ],
                keys: { value: ['uniqueClicks', 'nonUniqueClicks'] },
                names: { 'uniqueClicks': 'unique clicks', 'nonUniqueClicks': 'non unique clicks' },
                order: function (t1, t2) {
                  if (t1.id == 'uniqueClicks') return -1;
                  else return 1;
                }
              }
            }
          }, {
            label: "conversions",
            config: {
              data: {
                types: { 'postClickConversions': 'bar', 'postViewConversions': 'bar' },
                groups: [
                  ['postClickConversions', 'postViewConversions']
                ],
                keys: { value: ['postClickConversions', 'postViewConversions'] },
                names: { 'postClickConversions': 'post click conversions', 'postViewConversions': 'post view conversions' },
              }
            }
          },
        ];
      } else if (props.options.scope == 'metaAgency' || props.options.scope == 'agency' || props.options.scope == 'advertiser' || props.options.scope == 'cluster') {
        return [
          { label: "general", config: { data: { names: { 'clicks': 'total clicks', 'impressions': 'total imps' }, axes: { 'impressions': 'y2', 'clicks': 'y', 'conversions': 'y' }, types: { 'conversions': 'bar' }, keys: { value: ['impressions', 'clicks', 'conversions'] } }, axis: { y2: { show: true } }, padding: { left: 60, right: 60 } } },
          { label: "bids", config: { data: { names: { 'impressions': 'total imps', 'bids': 'bids' }, axes: { 'bids': 'y', 'impressions': 'y', 'winrate': 'y2' }, keys: { value: ['bids', 'impressions', 'winrate'] } }, axis: { y2: { show: true } }, padding: { left: 80, right: 40 } } },
          { label: "cost", config: { data: { names: { 'costs': 'total cost', 'expenses': 'media spend' }, types: { 'costs': 'area-step', 'expenses': 'area-step' }, keys: { value: ['expenses', 'costs'] } } } }, {
            label: "clicks",
            config: {
              data: {
                types: { 'uniqueClicks': 'bar', 'nonUniqueClicks': 'bar' },
                groups: [
                  ['uniqueClicks', 'nonUniqueClicks']
                ],
                keys: { value: ['uniqueClicks', 'nonUniqueClicks'] },
                names: { 'uniqueClicks': 'unique clicks', 'nonUniqueClicks': 'non unique clicks' },
                order: function (t1, t2) {
                  if (t1.id == 'uniqueClicks') return -1;
                  else return 1;
                }
              }
            }
          },
          { label: "impressions", config: { data: { names: { 'impressions': 'total imps' }, axes: { 'impressions': 'y' }, keys: { value: ['impressions'] } }, padding: { left: 60, right: 60 } } }, {
            label: "performance",
            config: {
              data: {
                types: { 'postClickConversions': 'bar', 'postViewConversions': 'bar' },
                groups: [
                  ['postClickConversions', 'postViewConversions']
                ],
                keys: { value: ['postClickConversions', 'postViewConversions'] }
              }
            }
          },
          { label: "revenue", config: { data: { names: { 'costs': 'total cost' }, keys: { value: ['revenue', 'profit', 'costs'] } }, padding: { left: 80, right: 40 } } },
        ];
      } else {
        return [
          { label: "general", config: { data: { names: { 'impressions': 'total imps', 'clicks': 'total clicks' }, axes: { 'impressions': 'y2', 'clicks': 'y', 'conversions': 'y' }, types: { 'conversions': 'bar' }, keys: { value: ['impressions', 'clicks', 'conversions'] } }, axis: { y2: { show: true } }, padding: { left: 60, right: 60 } } },
        ];
      }
    } else {
      if (props.options.scope == 'campaign') {
        return [
          { label: "impact", config: { data: { names: { 'impressions': 'imps won', 'clicks': 'total clicks' }, axes: { 'impressions': 'y2', 'clicks': 'y', 'conversions': 'y' }, types: { 'conversions': 'bar' }, keys: { value: ['impressions', 'clicks', 'conversions'] } }, axis: { y2: { show: true } }, padding: { left: 60, right: 60 } } },
          { label: "performance", config: { data: { type: 'line', keys: { value: ['cpc', 'cpo'] }, names: { 'cpc': 'cpc', 'cpo': 'cpa' }, axes: { 'cpc': 'y', 'cpo': 'y2' } }, axis: { y2: { show: true } }, padding: { left: 80, right: 40 } } },
          {
            label: "winrate",
            config: {
              data: {
                names: { 'impressions': 'imps won', 'impressionsNotWon': 'imps not won' },
                axes: { 'impressions': 'y2', 'impressionsNotWon': 'y2', 'winrate': 'y' },
                types: { 'winrate': 'line', 'impressions': 'bar', 'impressionsNotWon': 'bar' },
                groups: [
                  ['impressions', 'impressionsNotWon']
                ],
                keys: { value: ['impressions', 'impressionsNotWon', 'winrate'] },
                order: function (t1, t2) {
                  if (t1.id == 'impressions') return -1;
                  else return 1;
                }
              },
              axis: { y2: { show: true } },
              padding: { left: 40, right: 80 }
            }
          }, {
            label: "clicks",
            config: {
              data: {
                types: { 'uniqueClicks': 'bar', 'nonUniqueClicks': 'bar' },
                groups: [
                  ['uniqueClicks', 'nonUniqueClicks']
                ],
                keys: { value: ['uniqueClicks', 'nonUniqueClicks'] },
                names: { 'uniqueClicks': 'unique clicks', 'nonUniqueClicks': 'non unique clicks' },
                order: function (t1, t2) {
                  if (t1.id == 'uniqueClicks') return -1;
                  else return 1;
                }
              }
            }
          }, {
            label: "conversions",
            config: {
              data: {
                types: { 'postClickConversions': 'bar', 'postViewConversions': 'bar' },
                groups: [
                  ['postClickConversions', 'postViewConversions']
                ],
                keys: { value: ['postClickConversions', 'postViewConversions'] },
                names: { 'postClickConversions': 'post click conversions', 'postViewConversions': 'post view conversions' },
              }
            }
          },
        ];
      } else if (props.options.scope == 'agency' || props.options.scope == 'advertiser' || props.options.scope == 'cluster') {
        return [
          { label: "general", config: { data: { names: { 'clicks': 'total clicks', 'impressions': 'total imps' }, axes: { 'impressions': 'y2', 'clicks': 'y', 'conversions': 'y' }, types: { 'conversions': 'bar' }, keys: { value: ['impressions', 'clicks', 'conversions'] } }, axis: { y2: { show: true } }, padding: { left: 60, right: 60 } } },
          { label: "bids", config: { data: { names: { 'impressions': 'total imps', 'bids': 'bids' }, axes: { 'bids': 'y', 'impressions': 'y', 'winrate': 'y2' }, keys: { value: ['bids', 'impressions', 'winrate'] } }, axis: { y2: { show: true } }, padding: { left: 80, right: 40 } } },
          { label: "cost", config: { data: { names: { 'costs': 'total cost', 'expenses': 'media spend' }, types: { 'costs': 'area-step', 'expenses': 'area-step' }, keys: { value: ['expenses', 'costs'] } } } }, {
            label: "clicks",
            config: {
              data: {
                types: { 'uniqueClicks': 'bar', 'nonUniqueClicks': 'bar' },
                groups: [
                  ['uniqueClicks', 'nonUniqueClicks']
                ],
                keys: { value: ['uniqueClicks', 'nonUniqueClicks'] },
                names: { 'uniqueClicks': 'unique clicks', 'nonUniqueClicks': 'non unique clicks' },
                order: function (t1, t2) {
                  if (t1.id == 'uniqueClicks') return -1;
                  else return 1;
                }
              }
            }
          },
          { label: "impressions", config: { data: { names: { 'impressions': 'total imps' }, axes: { 'impressions': 'y' }, keys: { value: ['impressions'] } }, padding: { left: 60, right: 60 } } }, {
            label: "performance",
            config: {
              data: {
                types: { 'postClickConversions': 'bar', 'postViewConversions': 'bar' },
                groups: [
                  ['postClickConversions', 'postViewConversions']
                ],
                keys: { value: ['postClickConversions', 'postViewConversions'] }
              }
            }
          }
        ];
      } else {
        return [
          { label: "general", config: { data: { names: { 'impressions': 'total imps', 'clicks': 'total clicks' }, axes: { 'impressions': 'y2', 'clicks': 'y', 'conversions': 'y' }, types: { 'conversions': 'bar' }, keys: { value: ['impressions', 'clicks', 'conversions'] } }, axis: { y2: { show: true } }, padding: { left: 60, right: 60 } } },
        ];
      }
    }
  }

  function createGraph() {
    const default_graph = {
      size: { height: 320 },
      padding: { top: 0, right: 20, bottom: 0, left: 40 },
      color: { pattern: ['#089bc2', '#96c03d', '#f58129', '#a62174', '#1f3364', '#ccc'] },
      bindto: `#${chartId}`,
      data: { json: data, keys: { x: 'displayName' }, xFormat: '%Y-%m-%d' },
      axis: { x: { type: 'timeseries', tick: { format: '%Y-%m-%d', rotate: 60 } } },
      grid: { y: { show: false } },
      legend: { show: true },
      point: { show: true, r: 3.5, focus: { expand: { r: 4.5 } } }
    };

    const graph = $.extend(true, default_graph, category.config);
    c3.generate(graph);
  }

  function fixDecimals(n) {
    if (Number(n) === n && n % 1 !== 0) {
      return parseFloat(n.toFixed(2));
    }
    return n;
  }

  if (!error) {
    return <div className="text-center">
      <Loader visible={showLoader} />
      {!showLoader && <Fragment>
        <ButtonGroup size="sm">
          {
            categories.map((c, i) => <Button className={activeIndex === i ? "active" : ""} onClick={() => { setCategory(c); setActiveIndex(i); }} variant="outline-secondary">{c.label.toUpperCase()}</Button>)
          }
        </ButtonGroup>
        <div id={chartId}></div>
      </Fragment>
      }
    </div>;
  } else {
    return <h3><ErrorContainer message={errorMessage} /></h3>;
  }
}
export default StatisticsCharts;