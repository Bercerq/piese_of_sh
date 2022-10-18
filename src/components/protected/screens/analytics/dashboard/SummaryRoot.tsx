import React from "react";
import * as _ from "lodash";
import Loader from "../../../../UI/Loader";
import KPIContainer from "./KPIContainer";
import { TabProps } from "../../../../../models/Common";

const SummaryRoot = (props: { showLoader: boolean; data: any; tabProps: TabProps; }) => {
  return <div className="col-sm-12 pt-3">
    <div className="card mb-2">
      <Loader visible={props.showLoader} />
      {!props.showLoader &&
        <KPIContainer data={props.data} videoMode={props.tabProps.videoMode} />
      }
    </div>
  </div>;
}
export default SummaryRoot;