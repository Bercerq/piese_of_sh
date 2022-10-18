import React, { useEffect, useState } from "react";
import * as _ from "lodash";
import * as InventoryHelper from "./InventoryHelper";
import { DealsBoxFormData, InventoryRulesBoxFormData, InventoryTabFormData, InventoryTabProps, PublishersAndExchangesBoxFormData } from "../../../../../../client/campaignSchemas";
import DealsBox from "./DealsBox";
import InventoryRulesBox from "./InventoryRulesBox";
import PublishersAndExchangesBox from "./PublishersAndExchangesBox";

const InventoryTab = (props: InventoryTabProps) => {
  const [publishersAndExchangesBox, setPublishersAndExchangesBox] = useState<PublishersAndExchangesBoxFormData>(null);
  const [dealsBox, setDealsBox] = useState<DealsBoxFormData>(null);
  const [inventoryRulesBox, setInventoryRulesBox] = useState<InventoryRulesBoxFormData>(null);
  const [isInventoryRulesBoxValid, setIsInventoryRulesBoxValid] = useState<boolean>(true);

  const submitData = getSubmitData();
  const isValid = getIsValid();

  useEffect(() => {
    const initialSubmitData = getInitialSubmitData();
    if (JSON.stringify(submitData) !== initialSubmitData) {
      props.onChange(submitData);
    }
  }, [JSON.stringify(submitData)]);
  useEffect(() => { props.onValidate(isValid); }, [isValid]);

  function getSubmitData(): InventoryTabFormData {
    return {
      publishersAndExchangesBox,
      dealsBox,
      inventoryRulesBox
    }
  }

  function getIsValid() {
    return isInventoryRulesBoxValid;
  }

  function getInitialSubmitData() {
    return JSON.stringify({ publishersAndExchangesBox: null, dealsBox: null, inventoryRulesBox: null });
  }

  const publishersAndExchangesBoxChange = (publishersAndExchangesBoxData: PublishersAndExchangesBoxFormData) => {
    setPublishersAndExchangesBox(publishersAndExchangesBoxData);
  }

  const dealsBoxChange = (dealsBoxData: DealsBoxFormData) => {
    setDealsBox(dealsBoxData);
  }

  const inventoryRulesBoxChange = (inventoryRulesBoxData: InventoryRulesBoxFormData, isValid: boolean) => {
    setInventoryRulesBox(inventoryRulesBoxData);
    setIsInventoryRulesBoxValid(isValid);
  }

  const publishersAndExchangesBoxProps = InventoryHelper.getPublishersAndExchangesBoxProps(props.data, props.rights, props.isAdserving, publishersAndExchangesBoxChange);
  const dealsBoxProps = props.rights.VIEW_DEALS ? InventoryHelper.getDealsBoxProps(props.data, props.rights, dealsBoxChange) : null;
  const inventoryRulesBoxProps = InventoryHelper.getInventoryRulesBoxProps(props.data, props.maxBidPrice, props.rights, props.user, inventoryRulesBoxChange);

  return <div className="row no-gutters">
    <div className="col-lg-6">
      <PublishersAndExchangesBox {...publishersAndExchangesBoxProps} />
      {props.rights.VIEW_DEALS && <DealsBox {...dealsBoxProps} />}
    </div>
    <div className="col-lg-6">
      <InventoryRulesBox {...inventoryRulesBoxProps} />
    </div>
  </div>
}
export default InventoryTab;