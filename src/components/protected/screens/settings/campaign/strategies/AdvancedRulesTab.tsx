import React, { useEffect, useState } from "react";
import * as StrategiesHelper from "./StrategiesHelper";
import { AdvancedRulesBoxFormData, AdvancedRulesTabFormData, AdvancedRulesTabProps } from "../../../../../../client/campaignSchemas";
import AdvancedRulesBox from "./AdvancedRulesBox";

const AdvancedRulesTab = (props: AdvancedRulesTabProps) => {
  const [advancedRulesBox, setAdvancedRulesBox] = useState<AdvancedRulesBoxFormData>(null);
  const [isAdvancedRulesBoxValid, setIsAdvancedRulesBoxValid] = useState<boolean>(true);

  const submitData = getSubmitData();
  const isValid = getIsValid();

  useEffect(() => {
    const initialSubmitData = getInitialSubmitData();
    if (JSON.stringify(submitData) !== initialSubmitData) {
      props.onChange(submitData);
    }
  }, [JSON.stringify(submitData)]);
  useEffect(() => { props.onValidate(isValid); }, [isValid]);

  function getSubmitData(): AdvancedRulesTabFormData {
    return {
      advancedRulesBox
    }
  }

  function getIsValid(): boolean {
    return isAdvancedRulesBoxValid;
  }

  function getInitialSubmitData() {
    return JSON.stringify({ advancedRulesBox: null });
  }

  const advancedRulesBoxChange = (advancedRulesData: AdvancedRulesBoxFormData, isValid: boolean) => {
    setAdvancedRulesBox(advancedRulesData);
    setIsAdvancedRulesBoxValid(isValid);
  }

  const advancedRulesBoxProps = StrategiesHelper.getAdvancedRulesBoxProps(props.data, props.maxBidPrice, props.rights, props.user, advancedRulesBoxChange);

  return <div className="row no-gutters">
    <div className="col-lg-12">
      <AdvancedRulesBox {...advancedRulesBoxProps} />
    </div>
  </div>
}
export default AdvancedRulesTab;