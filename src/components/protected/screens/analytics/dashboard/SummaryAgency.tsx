import React, { Fragment } from "react";
import * as _ from "lodash";
import Loader from "../../../../UI/Loader";
import KPIContainer from "./KPIContainer";
import Funnel from "./Funnel";
import Financials from "./Financials";
import { TabProps } from "../../../../../models/Common";
import StatisticsCharts from "./StatisticsCharts";

const SummaryAgency = (props: { data: any; showLoader: boolean; tabProps: TabProps; }) => {
  const funnelColumnClass = props.tabProps.rights.VIEW_FINANCIALS ? "col-lg-3 mb-2" : "col-lg-6 mb-2";
  return <Fragment>
    <div className="col-sm-12 mb-2 mt-3">
      <div className="card">
        <Loader visible={props.showLoader} />
        {!props.showLoader &&
          <KPIContainer data={props.data} videoMode={props.tabProps.videoMode} />
        }
      </div>
    </div>
    <div className="col-sm-12">
      <div className="row no-gutters">
        <div className="col-lg-6 mb-2">
          <div className="card h-100">
            <h2>Statistics</h2>
            <hr />
            <StatisticsCharts {...props.tabProps} />
          </div>
        </div>
        <div className={funnelColumnClass}>
          <div className="card h-100">
            <h2>Funnel</h2>
            <hr />
            <Loader visible={props.showLoader} />
            {!props.showLoader &&
              <Funnel id="funnel" data={props.data} />
            }
          </div>
        </div>
        {props.tabProps.rights.VIEW_FINANCIALS &&
          <div className="col-lg-3 mb-2">
            <div className="card h-100">
              <h2>Financials</h2>
              <hr />
              <Loader visible={props.showLoader} />
              {!props.showLoader &&
                <Financials data={props.data} tabProps={props.tabProps} />
              }
            </div>
          </div>
        }
      </div>
    </div>
  </Fragment>;
}
export default SummaryAgency;