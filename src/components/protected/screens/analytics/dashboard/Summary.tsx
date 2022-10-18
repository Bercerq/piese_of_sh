import React, { useState, useRef, useEffect } from "react";
import * as _ from "lodash";
import * as Api from "../../../../../client/Api";
import { TabProps } from "../../../../../models/Common";
import ErrorContainer from "../../../../UI/ErrorContainer";
import SummaryRoot from "./SummaryRoot";
import SummaryAgency from "./SummaryAgency";

const Summary = (props: TabProps) => {
  const [showLoader, setShowLoader] = useState<boolean>(true);
  const [data, setData] = useState<any>({});
  const [error, setError] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>("");

  const controller = useRef<AbortController>(null);

  useEffect(() => { return unload; }, []);
  useEffect(() => { loadData(); }, [JSON.stringify(props.options)]);

  async function loadData() {
    setShowLoader(true);
    try {
      unload();
      controller.current = new AbortController();
      const data = await Api.Get({ path: "/api/statistics/summary", qs: props.options, signal: controller.current.signal });
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

  if (!error) {
    if (props.options.scope === "all") {
      return <SummaryRoot showLoader={showLoader} data={data} tabProps={props} />
    } else {
      return <SummaryAgency showLoader={showLoader} data={data} tabProps={props} />
    }
  } else {
    return <div className="col-sm-12 pt-3 mb-2">
      <div className="card">
        <h3><ErrorContainer message={errorMessage} /></h3>
      </div>
    </div>;
  }
}
export default Summary;