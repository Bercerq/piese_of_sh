import React from "react";
import * as Utils from "../../../../../client/Utils";
import { AttributeGraphProps } from "./AttributeGraph";

const AttributeTable = (props: AttributeGraphProps) => {
  const sorted = props.data.sort((a, b) => {
    return b[props.metric.col] - a[props.metric.col];
  });

  function getClassName() {
    if (props.png) {
      return "attribute-list png";
    }
    return "attribute-list";
  }

  const cssClass = getClassName();
  return <div className={cssClass} id={props.id}>
    <table className="table table-striped table-borderless">
      <tbody>
        {
          sorted.map((row, i) => <tr>
            <td className="text-left">{row.displayName}</td>
            <td className="text-right">{Utils.getFormat(row[props.metric.col], props.metric.type)}</td>
          </tr>)
        }
      </tbody>
    </table>
  </div>;
}
export default AttributeTable;