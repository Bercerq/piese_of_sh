import React, { useState, useEffect } from "react";
import Select from "react-select";
import AsyncSelect from "react-select/async";
import CreatableSelect from "react-select/creatable";
import * as _ from "lodash";
import * as Api from "../../../../client/Api";
import { GroupOption, SelectOption, StatisticFilter } from "../../../../client/schemas";
import FontIcon from "../../../UI/FontIcon";

interface StatisticFilterRowProps {
  index: number;
  filter: StatisticFilter;
  attributes: (GroupOption | SelectOption)[];
  writeAccess: boolean;
  onChange: (i: number, filter: StatisticFilter) => void;
  onDelete: (i: number) => void;
}

const StatisticFilterRow = (props: StatisticFilterRowProps) => {
  const [attributeId, setAttributeId] = useState<number>(props.filter.attributeId);
  const [condition, setCondition] = useState<"in" | "notin">(props.filter.condition);
  const [values, setValues] = useState<string[]>(props.filter.values);
  const [defaultOptions, setDefaultOptions] = useState<SelectOption[]>([]);
  const [inputValue, setInputValue] = useState<string>("");

  useEffect(() => {
    setAttributeId(props.filter.attributeId);
    setCondition(props.filter.condition);
    setValues(props.filter.values);
  }, [props.filter.attributeId, props.filter.condition, props.filter.values]);

  useEffect(() => {
    props.onChange(props.index, { attributeId, condition, values });
  }, [attributeId, condition, values]);

  useEffect(() => { loadDefaultOptions() }, [attributeId, inputValue]);

  function getAttributeValue() {
    if (attributeId === -1) {
      return { value: -1, label: "Select dimension" };
    } else {
      const groupOptions = props.attributes.concat();
      groupOptions.shift();
      const options: SelectOption[] = _.flatMap(groupOptions, (g: GroupOption) => { return g.options });
      const selected = options.find((o) => { return o.value === attributeId })
      return selected;
    }
  }

  function getConditionOptions() {
    return [
      { value: "in", label: "in" },
      { value: "notin", label: "not in" }
    ];
  }

  async function loadDefaultOptions() {
    const defaultOptions = await valuesOptions(inputValue);
    setDefaultOptions(defaultOptions);
  }

  const attributeChange = (selected) => {
    setAttributeId(selected.value);
    setValues([]);
  }

  const conditionChange = (selected) => {
    setCondition(selected.value);
  }

  const valuesChange = async (selected, { action }) => {
    if (action === "select-option" && selected.length > 0) {
      if (selected[selected.length - 1].value === -1) {
        const defaultOptions = await valuesOptions(inputValue);
        const values = (defaultOptions || []).map((s) => { return s.value });
        if (values.length > 0) values.shift();
        setValues(values);
      } else {
        const values = (selected || []).map((s) => { return s.value });
        setValues(values);
      }
    } else {
      const values = (selected || []).map((s) => { return s.value });
      setValues(values);
    }
  }

  const creatableValuesChange = (selected) => {
    const values = (selected || []).map((s) => { return s.value });
    setValues(values);
  }

  const inputChange = (inputValue, { action }) => {
    switch (action) {
      case 'input-change':
        setInputValue(inputValue);
        return;
      default:
        return;
    }
  }

  const valuesOptions = (iv): Promise<any[]> => {
    if (attributeId !== -1) {
      try {
        return Api.Get({ path: `/api/attributes/${attributeId}/values/filter`, qs: { substrings: inputValue } });
      } catch (err) {
        console.log("err", err);
        return new Promise((resolve) => { resolve([]) });
      }
    } else {
      return new Promise((resolve) => { resolve([]) });
    }
  }

  const attributeValue = getAttributeValue();
  const acceptAnyValue = _.get(attributeValue, "acceptAnyValue", false);
  const conditionOptions = getConditionOptions();
  const selectedValues = values.map((v) => { return { value: v, label: v } });
  return <div style={{ width: "100%" }}>
    <div className="array-row">
      <div className="row no-gutters">
        <div className="col-lg-4 px-1">
          <Select
            inputId={`react-select-filter-attribute-${props.index}`}
            className="react-select-container"
            classNamePrefix="react-select"
            name="attribute-select"
            isDisabled={!props.writeAccess}
            value={attributeValue}
            clearable={false}
            onChange={attributeChange}
            options={props.attributes}
          />
        </div>
        <div className="col-lg-2 px-1">
          <Select
            inputId={`react-select-filter-condition-${props.index}`}
            className="react-select-container"
            classNamePrefix="react-select"
            name="condition-select"
            isDisabled={!props.writeAccess}
            value={conditionOptions.find((o) => { return o.value === condition })}
            clearable={false}
            onChange={conditionChange}
            options={conditionOptions}
          />
        </div>
        <div className="col-lg-6 px-1">
          {!acceptAnyValue &&
            <AsyncSelect
              inputId={`react-select-filter-values-${props.index}`}
              isMulti
              isDisabled={!props.writeAccess}
              className="react-select-container"
              classNamePrefix="react-select"
              placeholder="Search..."
              noOptionsMessage={({ inputValue }) => { return ""; }}
              value={selectedValues}
              inputValue={inputValue}
              onInputChange={inputChange}
              closeMenuOnSelect={false}
              onMenuClose={() => setInputValue("")}
              cacheOptions
              defaultOptions={defaultOptions}
              loadOptions={valuesOptions}
              onChange={valuesChange}
            />
          }
          {acceptAnyValue &&
            <CreatableSelect
              className="react-select-container"
              inputId={`react-select-filter-tag-values-${props.index}`}
              classNamePrefix="react-select"
              isClearable
              isMulti
              isDisabled={!props.writeAccess}
              value={selectedValues}
              onChange={creatableValuesChange}
            />}
        </div>
      </div>
    </div>
    {props.writeAccess &&
      <div className="array-row-remove-btn">
        <a href="" className="table-btn" onClick={(e) => { e.preventDefault(); props.onDelete(props.index) }}><FontIcon name="remove" /></a>
      </div>
    }
  </div>;
}
export default StatisticFilterRow;