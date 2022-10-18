import React, { useState } from "react";
import AsyncSelect from "react-select/async";
import AsyncCreatableSelect from "react-select/async-creatable";
import * as _ from "lodash";
import * as Api from "../../client/Api";
import { SelectOption } from "../../client/schemas";

interface AsyncSelectListProps {
  id: string;
  writeAccess: boolean;
  url: string;
  placeholder?: string;
  creatable?: boolean;
  values: SelectOption[];
  classNames?: string;
  onChange: (values: SelectOption[]) => void;
}

const AsyncSelectList = (props: AsyncSelectListProps) => {
  const [inputValue, setInputValue] = useState<string>("");
  const [defaultOptions, setDefaultOptions] = useState<SelectOption[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  async function loadDefaultOptions() {
    const defaultOptions = await valuesOptions(inputValue);
    setDefaultOptions(defaultOptions);
    setIsLoading(false);
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
    try {
      return Api.Get({ path: props.url, qs: { search: inputValue } });
    } catch (err) {
      console.log("err", err);
      return new Promise((resolve) => { resolve([]) });
    }
  }

  const valuesChange = async (selected, { action }) => {
    if (action === "select-option" && selected.length > 0) {
      if (selected[selected.length - 1].value === -1) {
        const newValues = await valuesOptions(inputValue) || [];
        if (newValues.length > 0) newValues.shift(); //remove select all from returned values
        const oldValues = selected.concat();
        oldValues.pop(); //remove select all from previous selected values
        props.onChange(_.unionBy(oldValues, newValues, "value"));
      } else {
        props.onChange(selected || []);
      }
    } else {
      props.onChange(selected || []);
    }
    setInputValue("");
  }

  const menuOpen = () => {
    setIsLoading(true);
    loadDefaultOptions();
  }

  if (props.creatable) {
    return <AsyncCreatableSelect
      inputId={props.id}
      isMulti
      isDisabled={!props.writeAccess}
      className={props.classNames || "react-select-container multiple"}
      classNamePrefix="react-select"
      placeholder={props.placeholder || "Type to search or create values"}
      noOptionsMessage={({ inputValue }) => { return ""; }}
      value={props.values}
      inputValue={inputValue}
      onInputChange={inputChange}
      closeMenuOnSelect={false}
      onMenuClose={() => setInputValue("")}
      onMenuOpen={menuOpen}
      createOptionPosition="first"
      defaultOptions={defaultOptions}
      loadOptions={valuesOptions}
      isLoading={isLoading}
      onChange={valuesChange}
    />;
  } else {
    return <AsyncSelect
      inputId={props.id}
      isMulti
      isDisabled={!props.writeAccess}
      className={props.classNames || "react-select-container multiple"}
      classNamePrefix="react-select"
      placeholder={props.placeholder || "Search..."}
      noOptionsMessage={({ inputValue }) => { return ""; }}
      value={props.values}
      inputValue={inputValue}
      onInputChange={inputChange}
      closeMenuOnSelect={false}
      onMenuClose={() => setInputValue("")}
      onMenuOpen={menuOpen}
      defaultOptions={defaultOptions}
      loadOptions={valuesOptions}
      isLoading={isLoading}
      onChange={valuesChange}
    />;
  }
}
export default AsyncSelectList;