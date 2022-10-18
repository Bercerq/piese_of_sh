import React, { useState } from "react";
import * as _ from "lodash";

interface ValuesMessageProps {
  values: string[];
}

const ValuesMessage = (props: ValuesMessageProps) => {
  const [moreVisible, setMoreVisible] = useState<boolean>(false);

  const getValuesArrays = () => {
    const visibleValues = props.values.slice(0, 3);
    const hiddenValues = props.values.slice(3);
    return { visibleValues, hiddenValues };
  }

  const showHideMoreClick = (e) => {
    e.preventDefault();
    setMoreVisible(!moreVisible);
  }

  const { visibleValues, hiddenValues } = getValuesArrays();
  return <td>
    {
      visibleValues.map((v, i) => <p key={i}>{v}</p>)
    }
    {props.values.length > 3 && !moreVisible &&
      <a href="" onClick={showHideMoreClick}>...</a>
    }
    {props.values.length > 3 && moreVisible &&
      <div>
        {
          hiddenValues.map((v, i) => <p key={i}>{v}</p>)
        }
        <a href="" onClick={showHideMoreClick}>Show less</a>
      </div>
    }
  </td>;
}
export default ValuesMessage;
