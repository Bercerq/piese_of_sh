import React, { useEffect, useState } from "react";
import * as StrategiesHelper from "./StrategiesHelper";
import { SubstrategiesBoxFormData, SubstrategiesTabFormData, SubstrategiesTabProps } from "../../../../../../client/campaignSchemas";
import SubstrategiesBox from "./SubstrategiesBox";

const SubstrategiesTab = (props: SubstrategiesTabProps) => {
  const [substrategiesBox, setSubstrategiesBox] = useState<SubstrategiesBoxFormData>(null);
  const [isSubstrategiesBoxValid, setIsSubstrategiesBoxValid] = useState<boolean>(true);
  const submitData = getSubmitData();
  const isValid = getIsValid();

  useEffect(() => {
    const initialSubmitData = getInitialSubmitData();
    if (JSON.stringify(submitData) !== initialSubmitData) {
      props.onChange(submitData);
    }
  }, [JSON.stringify(submitData)]);
  useEffect(() => { props.onValidate(isValid); }, [isValid]);

  function getSubmitData(): SubstrategiesTabFormData {
    return {
      substrategiesBox
    }
  }

  function getIsValid(): boolean {
    return isSubstrategiesBoxValid;
  }

  function getInitialSubmitData() {
    return JSON.stringify({ substrategiesBox: null });
  }

  const substrategiesBoxChange = (substrategiesData: SubstrategiesBoxFormData, isValid: boolean) => {
    setSubstrategiesBox(substrategiesData);
    setIsSubstrategiesBoxValid(isValid);
  }

  const substrategiesBoxProps = StrategiesHelper.getSubstrategiesBoxProps(props.data, props.maxBidPrice, props.rights, props.user, substrategiesBoxChange);

  return <div className="row no-gutters">
    <SubstrategiesBox {...substrategiesBoxProps} />
  </div>
}
export default SubstrategiesTab;