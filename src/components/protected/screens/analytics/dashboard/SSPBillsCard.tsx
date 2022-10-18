import React, { useState, useEffect, useRef } from "react";
import * as _ from "lodash";
import ErrorContainer from "../../../../UI/ErrorContainer";
import Loader from "../../../../UI/Loader";
import SSPBillsTable from "./SSPBillsTable";
import { Options } from "../../../../../models/Common";
import * as Api from "../../../../../client/Api";
import { AppUser } from "../../../../../models/AppUser";

interface SSPBillsCardProps {
  options: Options;
  user: AppUser;
}

const SSPBillsCard = (props: SSPBillsCardProps) => {
  const [showLoader, setShowLoader] = useState<boolean>(true);
  const [records, setRecords] = useState<any[]>([]);
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
      const data: any = await Api.Get({ path: "/api/reporting/ssp", qs: props.options, signal: controller.current.signal });
      const records = _.get(data, "statisticList", []);
      setShowLoader(false);
      setRecords(records);
    } catch (err) {
      console.log(err);
      if (err.name === "AbortError") {
        setError(false);
        setErrorMessage("");
      } else {
        setError(true);
        setErrorMessage("Error loading ssp bills.");
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
    return <div className="card mb-2">
      <h3 className="pull-left">SSP Bills</h3>
      <Loader visible={showLoader} />
      {!showLoader &&
        <SSPBillsTable records={records} user={props.user} />
      }
    </div>;
  } else {
    return <div className="card mb-2">
      <h3><ErrorContainer message={errorMessage} /></h3>
    </div>;
  }
}
export default SSPBillsCard;