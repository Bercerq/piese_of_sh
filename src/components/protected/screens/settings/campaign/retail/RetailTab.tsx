import React, { useEffect, useState } from "react";
import * as RetailHelper from "./RetailHelper";
import { RetailBoxFormData, RetailTabFormData, RetailTabProps } from "../../../../../../client/campaignSchemas";
import RetailBox from "./RetailBox";
import { json } from "body-parser";

const RetailTab = (props: RetailTabProps) => {
  const [retailBox, setRetailBox] = useState<RetailBoxFormData>(null);
  const [isRetailBoxValid, setIsRetailBoxValid] = useState<boolean>(true);
  const [initialState, setInitialState] = useState<RetailBoxFormData>(null);

  const submitData = getSubmitData();
  const isValid = getIsValid();


  useEffect(() => {
      props.onChange(submitData);
    
  }, [JSON.stringify(submitData)]);
  useEffect(() => { props.onValidate(isValid); }, [isValid]);

  function getSubmitData(): RetailTabFormData {
    return {
      retailBox
    };
  }

  function getIsValid(): boolean {
    return isRetailBoxValid;
  }

  const retailBoxChange = (retailBoxData: RetailBoxFormData, isValid: boolean) => {
    setRetailBox(retailBoxData);
    setIsRetailBoxValid(isValid);
  }

  const retailBoxProps = RetailHelper.getRetailBoxProps(props.data, props.rights, retailBoxChange);

  return <div className="row no-gutters">
    <div className="col-lg-12">
      <RetailBox {...retailBoxProps} />
    </div>
  </div>
}
export default RetailTab;