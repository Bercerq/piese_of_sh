import React, { useState, useEffect, useRef, useContext } from "react";
import * as _ from "lodash";
import { ScopeDataContextType } from "../../../../../models/Common";
import ScopeDataContext from "../../../context/ScopeDataContext";
import { Campaign, CampaignEntity, Pacing } from "../../../../../models/data/Campaign";
import * as Api from "../../../../../client/Api";
import { TabProps } from "../../../../../models/Common";
import ErrorContainer from "../../../../UI/ErrorContainer";
import Loader from "../../../../UI/Loader";
import CampaignCompletionBar from "../../../shared/pacing/CampaignCompletionBar";
import CampaignPacing from "../../../shared/pacing/CampaignPacing";

const CampaignPacingContainer = (props: TabProps & { type: "budget_completion" | "impression_completion" }) => {
  let { data } = useContext<ScopeDataContextType>(ScopeDataContext);
  const campaign: CampaignEntity = _.get(data as Campaign, "campaign");
  const [pacingData, setPacingData] = useState<any>({});
  const [predictionDays, setPredictionDays] = useState<number>(1);
  const [showLoader, setShowLoader] = useState<boolean>(true);
  const [error, setError] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>("");

  const controller = useRef<AbortController>(null);

  useEffect(() => { return unload; }, []);
  useEffect(() => { loadData(); }, [JSON.stringify(props.options)]);

  async function loadData() {
    setShowLoader(true);
    const path = props.type === "budget_completion" ? "budget" : "impressions";
    try {
      unload();
      controller.current = new AbortController();
      const pacing = await Api.Get({ path: `/api/campaigns/${props.options.scopeId}/pacing/${path}`, signal: controller.current.signal });
      setPacingData(pacing);
    } catch (err) {
      if (err.name === "AbortError") {
        setError(false);
        setErrorMessage("");
      } else {
        setError(true);
        setErrorMessage(`Error loading ${path} data.`);
        setShowLoader(false);
      }
    }
    setShowLoader(false);
  }

  function unload() {
    if (controller.current) {
      controller.current.abort();
    }
  }

  const predictionDaysChange = (days: number) => {
    setPredictionDays(days);
  }

  function getTitle() {
    if (props.type === "budget_completion") {
      return "Budget pacing";
    } else {
      return "Impressions pacing";
    }
  }

  function getCampaignPacing(): Pacing & { percentageDone: number; } {
    if (props.type === "budget_completion") {
      return campaign.budgetPacing ? _.assign({}, campaign.budgetPacing, { percentageDone: campaign.percentageDone }) : campaign.budgetPacing;
    } else {
      return campaign.impressionPacing ? _.assign({}, campaign.impressionPacing, { percentageDone: campaign.percentageDone }) : campaign.impressionPacing;
    }
  }

  const title = getTitle();
  const campaignPacing = getCampaignPacing();
  if (!error) {
    const chartType = props.type === "budget_completion" ? "budget" : "impressions";
    const chartId = props.type === "budget_completion" ? "campaign-budget-pacing" : "campaign-impressions-pacing";
    return <div className="col-sm-12 mb-2">
      <div className="card">
        <div style={{ height: "35px" }}>
          <h2 className="pull-left">{title}</h2>
          <div className="pull-right" style={{ width: "250px" }}>
            <CampaignCompletionBar pacing={campaignPacing} type={props.type} />
          </div>
        </div>
        <hr />
        <Loader visible={showLoader} />
        {!showLoader &&
          <CampaignPacing
            id={chartId}
            type={chartType}
            data={pacingData}
            predictionDays={predictionDays}
            onPredictionChange={predictionDaysChange}
          />
        }
      </div>
    </div>;
  } else {
    return <div className="col-sm-12 mb-2">
      <div className="card">
        <h3><ErrorContainer message={errorMessage} /></h3>
      </div>
    </div>;
  }
}
export default CampaignPacingContainer;