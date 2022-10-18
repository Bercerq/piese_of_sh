import React, { Fragment } from "react";
import { Form } from "react-bootstrap";
import moment from "moment";
import * as Utils from "../../../../client/Utils";
import * as CampaignPacingHelper from "./CampaignPacingHelper";
import { CampaignPacingProps } from "./CampaignPacing";

const CampaignPacingPredictions = (props: CampaignPacingProps) => {

  const handlePredictionChange = (e) => {
    if (e.target.checked) {
      const days = parseInt(e.target.value, 10);
      props.onPredictionChange(days);
    }
  }

  function getPrediction(days: number) {
    const today = moment().format('YYYY-MM-DD');
    if (moment(props.data.endDate) >= moment(today)) {
      const predictionData = props.data[`expectationToPredicted${days}DayTotal`];
      if (predictionData.length > 0) {
        const lastValueData = predictionData[predictionData.length - 1].value;
        const actual = Utils.numberWithCommas(lastValueData.actual);
        const percentage = Utils.percentage(lastValueData.percentage);
        const judgement = lastValueData.judgement;

        if (judgement === "UNKNOWN") {
          if (actual === "0") {
            return "Not enough data";
          } else {
            if (percentage !== "0.00%") {
              return <Fragment>{actual} (<span>{percentage}</span>)</Fragment>
            } else {
              return actual;
            }
          }
        } else {
          const color = CampaignPacingHelper.getJudgementColor(judgement);
          return <Fragment>{actual} (<span style={{ color }}>{percentage}</span>)</Fragment>
        }
      }
    }
    return null;
  }

  return <div className="pacing-predictions card mb-2">
    <table>
      <thead>
        <tr>
          <th className="pr-3 font-weight-bold">Prediction using data of</th>
          <th className="font-weight-bold">at the end of the campaign</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td className="pt-2 pb-2">
            <Form.Check
              id={`${props.type}-pacing-prediction-1`}
              type="radio"
              name={`${props.type}-pacing-prediction`}
              value="1"
              checked={props.predictionDays === 1}
              onChange={handlePredictionChange}
              label="1 day"
            />
          </td>
          <td className="pt-2 pb-2">
            <div>{getPrediction(1)}</div>
          </td>
        </tr>
        <tr>
          <td className="pt-2 pb-2">
            <Form.Check
              id={`${props.type}-pacing-prediction-3`}
              type="radio"
              name={`${props.type}-pacing-prediction`}
              value="3"
              checked={props.predictionDays === 3}
              onChange={handlePredictionChange}
              label="3 days"
            />
          </td>
          <td className="pt-2 pb-2">
            <div>{getPrediction(3)}</div>
          </td>
        </tr>
        <tr>
          <td className="pt-2 pb-2">
            <Form.Check
              id={`${props.type}-pacing-prediction-7`}
              type="radio"
              name={`${props.type}-pacing-prediction`}
              value="7"
              checked={props.predictionDays === 7}
              onChange={handlePredictionChange}
              label="7 days"
            />
          </td>
          <td className="pt-2 pb-2">
            <div>{getPrediction(7)}</div>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
}
export default CampaignPacingPredictions;