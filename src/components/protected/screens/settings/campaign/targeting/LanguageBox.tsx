import React, { useState, useEffect } from "react";
import { Form } from "react-bootstrap";
import Select from "react-select";
import * as Api from "../../../../../../client/Api";
import { LanguageBoxFormData, LanguageBoxProps } from "../../../../../../client/campaignSchemas";
import { SelectOption } from "../../../../../../client/schemas";
import Loader from "../../../../../UI/Loader";
import SettingsBox from "../shared/SettingsBox";

const LanguageBox = (props: LanguageBoxProps) => {
  const [languages, setLanguages] = useState<string[]>(props.languages);
  const [options, setOptions] = useState<SelectOption[]>([]);
  const [showLoader, setShowLoader] = useState<boolean>(true);

  const submitData = getSubmitData();

  useEffect(() => { loadForm(); }, [props.id]);

  useEffect(() => { props.onChange(submitData); }, [JSON.stringify(submitData)]);

  async function loadForm() {
    setShowLoader(true);
    setLanguages(props.languages);
    try {
      const options = await Api.Get({ path: "/api/targeting/suggestion/basic/device/language" });
      setOptions(options);
    } catch (err) {
      console.log(err);
    }
    setShowLoader(false);
  }

  function getSubmitData(): LanguageBoxFormData {
    return {
      languages
    }
  }

  function getValues() {
    return options.filter((o) => { return languages.indexOf(o.value as string) > -1 });
  }

  const handleValuesChange = (selected, { action }) => {
    if (action === "select-option" && selected.length > 0) {
      if (selected[selected.length - 1].value === "-1") {
        const values = options.filter((o) => { return o.value !== "-1" }).map((s) => { return s.value });
        setLanguages(values as string[]);
      } else {
        const values = (selected || []).map((s) => { return s.value });
        setLanguages(values as string[]);
      }
    } else {
      const values = (selected || []).map((s) => { return s.value });
      setLanguages(values as string[]);
    }
  }

  const writeAccess = props.rights.MANAGE_CAMPAIGN || false;

  return <SettingsBox title="Language">
    <div className="row no-gutters">
      <div className="col-lg-12 px-1">
        <Loader visible={showLoader} loaderClass="loading-input" />
        {!showLoader &&
          <Form.Group>
            <Form.Label>Language</Form.Label>
            <Select
              isDisabled={!writeAccess}
              inputId="settings-targeting-language"
              className="react-select-container multiple"
              classNamePrefix="react-select"
              name="settings-targeting-language-name"
              placeholder="all"
              isMulti
              value={getValues()}
              clearable={true}
              closeMenuOnSelect={false}
              onChange={handleValuesChange}
              options={options}
            />
          </Form.Group>
        }
      </div>
    </div>
  </SettingsBox>
}
export default LanguageBox;