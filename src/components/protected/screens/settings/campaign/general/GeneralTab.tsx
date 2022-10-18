import React, { useEffect, useState } from "react";
import * as _ from "lodash";
import { BudgetBoxFormData, CommercialBoxFormData, FrequencyCapBoxFormData, GeneralBoxFormData, GeneralTabFormData, GeneralTabProps, TargetsBoxFormData } from "../../../../../../client/campaignSchemas";
import * as GeneralHelper from "./GeneralHelper";
import BudgetBox from "./BudgetBox";
import CommercialBox from "./CommercialBox";
import FrequencyCapBox from "./FrequencyCapBox";
import GeneralBox from "./GeneralBox";
import TargetsBox from "./TargetsBox";

const GeneralTab = (props: GeneralTabProps) => {
  const [generalBox, setGeneralBox] = useState<GeneralBoxFormData>(null);
  const [budgetBox, setBudgetBox] = useState<BudgetBoxFormData>(null);
  const [targetsBox, setTargetsBox] = useState<TargetsBoxFormData>(null);
  const [frequencyCapBox, setFrequencyCapBox] = useState<FrequencyCapBoxFormData>(null);
  const [commercialBox, setCommercialBox] = useState<CommercialBoxFormData>(null);
  const [isGeneralBoxValid, setIsGeneralBoxValid] = useState<boolean>(true);
  const [isBudgetBoxValid, setIsBudgetBoxValid] = useState<boolean>(true);
  const [isTargetsBoxValid, setIsTargetsBoxValid] = useState<boolean>(true);
  const [isFrequencyCapBoxValid, setIsFrequencyCapBoxValid] = useState<boolean>(true);
  const [isCommercialBoxValid, setIsCommercialBoxValid] = useState<boolean>(true);

  const submitData = getSubmitData();
  const isValid = getIsValid();

  useEffect(() => {
    const initialSubmitData = getInitialSubmitData();
    if (JSON.stringify(submitData) !== initialSubmitData) {
      props.onChange(submitData);
    }
  }, [JSON.stringify(submitData)]);
  useEffect(() => { props.onValidate(isValid); }, [isValid]);

  function getSubmitData(): GeneralTabFormData {
    return {
      generalBox,
      budgetBox,
      targetsBox,
      frequencyCapBox,
      commercialBox
    }
  }

  function getInitialSubmitData() {
    return JSON.stringify({ generalBox: null, budgetBox: null, targetsBox: null, frequencyCapBox: null, commercialBox: null });
  }

  function getIsValid() {
    return isGeneralBoxValid && isBudgetBoxValid && isTargetsBoxValid && isFrequencyCapBoxValid && isCommercialBoxValid;
  }

  const generalBoxChange = (generalBoxData: GeneralBoxFormData, isValid: boolean) => {
    setGeneralBox(generalBoxData);
    setIsGeneralBoxValid(isValid);
  }

  const budgetBoxChange = (budgetBoxData: BudgetBoxFormData, isValid: boolean) => {
    setBudgetBox(budgetBoxData);
    setIsBudgetBoxValid(isValid);
  }

  const targetsBoxChange = (targetsBoxData: TargetsBoxFormData, isValid: boolean) => {
    setTargetsBox(targetsBoxData);
    setIsTargetsBoxValid(isValid);
  }

  const frequencyCapBoxChange = (frequencyCapBoxData: FrequencyCapBoxFormData, isValid: boolean) => {
    setFrequencyCapBox(frequencyCapBoxData);
    setIsFrequencyCapBoxValid(isValid);
  }

  const commercialBoxChange = (commercialBoxData: CommercialBoxFormData, isValid: boolean) => {
    setCommercialBox(commercialBoxData);
    setIsCommercialBoxValid(isValid);
  }

  const generalBoxProps = GeneralHelper.getGeneralBoxProps(props.data, props.rights, generalBoxChange);
  const budgetBoxProps = GeneralHelper.getBudgetBoxProps(props.data, props.rights, budgetBoxChange);
  const targetsBoxProps = GeneralHelper.getTargetsBoxProps(props.data, props.rights, targetsBoxChange);
  const frequencyCapBoxProps = GeneralHelper.getFrequencyCapBoxProps(props.data, props.rights, frequencyCapBoxChange);
  const commercialBoxProps = props.rights.MANAGE_CAMPAIGN ? GeneralHelper.getCommercialBoxProps(props.data, props.rights, commercialBoxChange) : null;

  return <div className="row no-gutters">
    <div className="col-lg-6">
      <GeneralBox {...generalBoxProps} />
    </div>
    <div className="col-lg-6">
      {!props.isRetail && <BudgetBox {...budgetBoxProps} />}
      <TargetsBox {...targetsBoxProps} />
      <FrequencyCapBox {...frequencyCapBoxProps} />
      {props.rights.MANAGE_CAMPAIGN && <CommercialBox {...commercialBoxProps} />}
    </div>
  </div>
}
export default GeneralTab;