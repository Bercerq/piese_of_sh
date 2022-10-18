import React from "react";
import * as _ from "lodash";
import ValuesMessage from "./ValuesMessage";

interface ActionExpandProps {
  record: any;
}

const ActionExpand = (props: ActionExpandProps) => {

  const getConsequenceMsg = (data) => {
    switch (data.consequence) {
      case '0': return 'No bid';
      case '1': return 'Set bid at €' + data.minBidPrice;
      case '2': return 'Increase bid by ' + data.increaseBidBy + '%';
      case '3': return 'Set bid range €' + data.minBidPrice + ' to €' + data.maxBidPrice;
      case '4': return 'Decrease bid by ' + Math.abs(data.increaseBidBy) + '%';
      case '5': return 'Required for  Bid';
    }
    return "";
  }

  const data = props.record.data;
  const attributeValues = _.get(props.record, "data.attributeValues", []);
  const addedValues = _.get(props.record, "data.addedValues", []);
  const removedValues = _.get(props.record, "data.removedValues", []);
  
  return <table className="action-details-table">
    {attributeValues.length > 0 &&
      <tr>
        <td>Values</td>
        <ValuesMessage values={attributeValues} />
      </tr>
    }
    {addedValues.length > 0 &&
      <tr>
        <td>Added values</td>
        <ValuesMessage values={addedValues} />
      </tr>
    }
    {removedValues.length > 0 &&
      <tr>
        <td>Removed values</td>
        <ValuesMessage values={removedValues} />
      </tr>
    }
    {data && data.consequence &&
      <tr>
        <td>Consequence</td>
        <td>{getConsequenceMsg(data)}</td>
      </tr>
    }
  </table>
}
export default ActionExpand;
