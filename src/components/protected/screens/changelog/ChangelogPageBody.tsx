import React, { useContext, useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import * as _ from "lodash";
import * as Roles from "../../../../modules/Roles";
import * as Api from "../../../../client/Api";
import { ScopeType } from "../../../../client/schemas";
import { AppUser } from "../../../../models/AppUser";
import { QsContextType, Rights, ScopeDataContextType, ChangelogOptions, ChangelogLevel } from "../../../../models/Common";
import QsContext from "../../context/QsContext";
import ScopeDataContext from "../../context/ScopeDataContext";
import UserContext from "../../context/UserContext";
import ErrorContainer from "../../../UI/ErrorContainer";
import Loader from "../../../UI/Loader";
import ChangelogTable from "./ChangelogTable";

const ChangelogPageBody = () => {
  let params: { scope?, scopeId?} = useParams();
  let scope = params.scope as ScopeType;
  let scopeId = params.scopeId;
  let { data } = useContext<ScopeDataContextType>(ScopeDataContext);
  const rights: Rights = Roles.getRights(data.rights);
  const user: AppUser = useContext<AppUser>(UserContext);
  let { daterange } = useContext<QsContextType>(QsContext);
  const startDate: string = daterange.startDate.format("YYYY-MM-DD");
  const endDate: string = daterange.endDate.format("YYYY-MM-DD");

  const options: ChangelogOptions = getOptions();

  const [records, setRecords] = useState<any[]>([]);
  const [showLoader, setShowLoader] = useState<boolean>(false);
  const [error, setError] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>("");

  const controller = useRef<AbortController>(null);

  useEffect(() => { return unload; }, []);
  useEffect(() => { loadData(); }, [JSON.stringify(options)]);

  async function loadData() {
    setShowLoader(true);
    try {
      unload();
      controller.current = new AbortController();
      const data: any = await Api.Get({ path: "/api/campaigns/history", qs: options, signal: controller.current.signal });
      const tableNames = ["TargetingRules", "Banners", "Campaigns", "OptimizationStrategies", "CampaignSegments", "Segments", "Constraints", "Qualifications", "AttributeValueLists", "Deals"];
      const records: any[] = _.get(data, "changes", []).filter((o) => { return tableNames.indexOf(o.tableName) > -1 });
      setRecords(records);
      setError(false);
      setErrorMessage("");
      setShowLoader(false);
    } catch (err) {
      console.log(err);
      if (err.name === "AbortError") {
        setError(false);
        setErrorMessage("");
      } else {
        setError(true);
        setErrorMessage("Error loading change log.");
        setShowLoader(false);
      }
    }
  }

  function unload() {
    if (controller.current) {
      controller.current.abort();
    }
  }

  function getOptions(): ChangelogOptions {
    let options: ChangelogOptions = {
      level: getChangelogLevel(),
      startDate,
      endDate
    };
    if (scope !== "root") {
      options.id = parseInt(scopeId, 10);
    }
    return options;
  }

  function getChangelogLevel(): ChangelogLevel {
    switch (scope) {
      case "root": return "adscience";
      case "organization": return "metaAgency";
      case "agency": return "customer";
      case "advertiser": return "advertiser";
      case "campaigngroup": return "cluster";
      case "campaign": return "campaign";
    }
  }

  if (!error) {
    return <div className="row">
      <div className="col-sm-12 pt-3">
        <div className="card mb-2">
          <h3>Change log</h3>
          <Loader visible={showLoader} />
          {!showLoader &&
            <ChangelogTable
              user={user}
              rights={rights}
              records={records}
              level={options.level}
            />
          }
        </div>
      </div>
    </div>;
  } else {
    return <div className="row">
      <div className="col-sm-12 pt-3">
        <div className="card">
          <h3><ErrorContainer message={errorMessage} /></h3>
        </div>
      </div>
    </div>;
  }
}
export default ChangelogPageBody;