import React, { useState, useEffect } from "react";
import * as _ from "lodash";
import { v4 as uuidv4 } from "uuid";
import * as CampaignHelper from "../../../../../../client/CampaignHelper";
import { FrequencyCapBoxFormData, FrequencyCapBoxProps, FrequencyCapFormProps } from "../../../../../../client/campaignSchemas";
import { FrequencyCapItem, PeriodType } from "../../../../../../models/data/Campaign";
import SettingsBox from "../shared/SettingsBox";
import FrequencyCapForm from "./FrequencyCapForm";

const FrequencyCapBox = (props: FrequencyCapBoxProps) => {
  const initialImpressions = assignKeys(_.get(props, "frequencyCaps.impressions") || []);
  const initialClicks = assignKeys(_.get(props, "frequencyCaps.clicks") || []);
  const initialConversions = assignKeys(_.get(props, "frequencyCaps.conversions") || []);
  const writeAccess = props.rights.MANAGE_CAMPAIGN || false;

  const initialImpressionsValidation = initialImpressions.map((o) => { return true });
  const initialClicksValidation = initialClicks.map((o) => { return true });
  const initialConversionsValidation = initialConversions.map((o) => { return true });

  const [impressions, setImpressions] = useState<(FrequencyCapItem & { key: string })[]>(initialImpressions);
  const [clicks, setClicks] = useState<(FrequencyCapItem & { key: string })[]>(initialClicks);
  const [conversions, setConversions] = useState<(FrequencyCapItem & { key: string })[]>(initialConversions);
  const [impressionsValidation, setImpressionsValidation] = useState<boolean[]>(initialImpressionsValidation);
  const [clicksValidation, setClicksValidation] = useState<boolean[]>(initialClicksValidation);
  const [conversionsValidation, setConversionsValidation] = useState<boolean[]>(initialConversionsValidation);

  const submitData = getSubmitData();
  const isValid = getIsValid();

  useEffect(loadForm, [props.id]);

  useEffect(() => { props.onChange(submitData, isValid); }, [JSON.stringify(submitData), isValid]);

  function loadForm() {
    setImpressions(initialImpressions);
    setClicks(initialClicks);
    setConversions(initialConversions);
    setImpressionsValidation(initialImpressionsValidation);
    setClicksValidation(initialClicksValidation);
    setConversionsValidation(initialConversionsValidation);
  }

  function getSubmitData(): FrequencyCapBoxFormData {
    return {
      impressions: removeKeys(impressions),
      clicks: removeKeys(clicks),
      conversions: removeKeys(conversions)
    }
  }

  function getIsValid() {
    return !(impressionsValidation.indexOf(false) > -1 || clicksValidation.indexOf(false) > -1 || conversionsValidation.indexOf(false) > -1);
  }

  function assignKeys(items: FrequencyCapItem[]): (FrequencyCapItem & { key: string })[] {
    return items.map((o) => { return _.assign({}, o, { key: uuidv4() }); });
  }

  function removeKeys(items: (FrequencyCapItem & { key: string })[]): FrequencyCapItem[] {
    return items.map((o) => { return _.omit(o, "key") });
  }

  function getItemsOnChange(items: (FrequencyCapItem & { key: string })[], itemsValidation: boolean[], i: number, row: FrequencyCapItem & { key: string }, isValid: boolean): { rows: (FrequencyCapItem & { key: string })[], validations: boolean[] } {
    let rows = _.cloneDeep(items);
    rows[i] = row;
    let validations = _.cloneDeep(itemsValidation);
    validations[i] = isValid;
    return { rows, validations };
  }

  function getItemsOnDelete(items: (FrequencyCapItem & { key: string })[], itemsValidation: boolean[], i: number): { rows: (FrequencyCapItem & { key: string })[], validations: boolean[] } {
    const rows = _.cloneDeep(items);
    const validations = _.cloneDeep(itemsValidation);
    if (rows.length > 0 && validations.length > 0) {
      rows.splice(i, 1);
      validations.splice(i, 1);
    }
    return { rows, validations };
  }

  function getItemsOnAdd(items: (FrequencyCapItem & { key: string })[], itemsValidation: boolean[], row: FrequencyCapItem & { key: string }): { rows: (FrequencyCapItem & { key: string })[], validations: boolean[] } {
    const rows = _.cloneDeep(items);
    const validations = _.cloneDeep(itemsValidation);
    rows.push(row);
    validations.push(true);
    return { rows, validations };
  }

  function getFields(): FrequencyCapFormProps[] {
    return [{
      label: "Max impressions",
      field: "impressions",
      rows: impressions,
      options: getPeriodOptions(impressions),
      writeAccess,
      onChange: (i: number, row: FrequencyCapItem & { key: string }, isValid: boolean) => {
        const updatedItems = getItemsOnChange(impressions, impressionsValidation, i, row, isValid);
        setImpressions(updatedItems.rows);
        setImpressionsValidation(updatedItems.validations);
      },
      onDelete: (i: number) => {
        const updatedItems = getItemsOnDelete(impressions, impressionsValidation, i);
        setImpressions(updatedItems.rows);
        setImpressionsValidation(updatedItems.validations);
      },
      onAdd: (row: FrequencyCapItem & { key: string }) => {
        const updatedItems = getItemsOnAdd(impressions, impressionsValidation, row);
        setImpressions(updatedItems.rows);
        setImpressionsValidation(updatedItems.validations);
      }
    }, {
      label: "Max clicks",
      field: "clicks",
      rows: clicks,
      options: getPeriodOptions(clicks),
      writeAccess,
      onChange: (i: number, row: FrequencyCapItem & { key: string }, isValid: boolean) => {
        const updatedItems = getItemsOnChange(clicks, clicksValidation, i, row, isValid);
        setClicks(updatedItems.rows);
        setClicksValidation(updatedItems.validations);
      },
      onDelete: (i: number) => {
        const updatedItems = getItemsOnDelete(clicks, clicksValidation, i);
        setClicks(updatedItems.rows);
        setClicksValidation(updatedItems.validations);
      },
      onAdd: (row: FrequencyCapItem & { key: string }) => {
        const updatedItems = getItemsOnAdd(clicks, clicksValidation, row);
        setClicks(updatedItems.rows);
        setClicksValidation(updatedItems.validations);
      }
    }, {
      label: "Max conversions",
      field: "conversions",
      rows: conversions,
      options: getPeriodOptions(conversions),
      writeAccess,
      onChange: (i: number, row: FrequencyCapItem & { key: string }, isValid: boolean) => {
        const updatedItems = getItemsOnChange(conversions, conversionsValidation, i, row, isValid);
        setConversions(updatedItems.rows);
        setConversionsValidation(updatedItems.validations);
      },
      onDelete: (i: number) => {
        const updatedItems = getItemsOnDelete(conversions, conversionsValidation, i);
        setConversions(updatedItems.rows);
        setConversionsValidation(updatedItems.validations);
      },
      onAdd: (row: FrequencyCapItem & { key: string }) => {
        const updatedItems = getItemsOnAdd(conversions, conversionsValidation, row);
        setConversions(updatedItems.rows);
        setConversionsValidation(updatedItems.validations);
      }
    }];
  }

  function getPeriodOptions(items: FrequencyCapItem[]) {
    const periodOptions = CampaignHelper.frequencyCapsPeriodOptions();
    const taken = items.map((item) => { return item.sinceStartOf });
    return periodOptions.filter((option) => { return taken.indexOf(option.value as PeriodType) === -1 });
  }

  const fields = getFields();
  return <SettingsBox title="User Frequency Capping">
    {
      fields.map((fieldProps, i) => <FrequencyCapForm {...fieldProps} />)
    }
  </SettingsBox>
}
export default FrequencyCapBox;