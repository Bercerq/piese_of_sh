import React, { useState, useEffect } from "react";
import { Form } from "react-bootstrap";
import Select from "react-select";
import * as Api from "../../../../../../client/Api";
import { BrowserBoxFormData, BrowserBoxProps } from "../../../../../../client/campaignSchemas";
import { SelectOption } from "../../../../../../client/schemas";
import Loader from "../../../../../UI/Loader";
import SettingsBox from "../shared/SettingsBox";

const BrowserBox = (props: BrowserBoxProps) => {
  const [browsers, setBrowsers] = useState<string[]>(props.browsers);
  const [options, setOptions] = useState<SelectOption[]>([]);
  const [showLoader, setShowLoader] = useState<boolean>(true);

  const submitData = getSubmitData();

  useEffect(() => { loadForm(); }, [props.id]);

  useEffect(() => { props.onChange(submitData); }, [JSON.stringify(submitData)]);

  async function loadForm() {
    setShowLoader(true);
    setBrowsers(props.browsers);
    try {
      const options = await Api.Get({ path: "/api/targeting/suggestion/basic/device/browser" });
      setOptions(options);
    } catch (err) {
      console.log(err);
    }
    setShowLoader(false);
  }

  function getSubmitData(): BrowserBoxFormData {
    return {
      browsers
    };
  }

  function getValues() {
    return options.filter((o) => { return browsers.indexOf(o.value as string) > -1 });
  }

  const handleValuesChange = (selected, { action }) => {
    if (action === "select-option" && selected.length > 0) {
      if (selected[selected.length - 1].value === "-1") {
        const values = options.filter((o) => { return o.value !== "-1" }).map((s) => { return s.value });
        setBrowsers(values as string[]);
      } else {
        const values = (selected || []).map((s) => { return s.value });
        setBrowsers(values as string[]);
      }
    } else {
      const values = (selected || []).map((s) => { return s.value });
      setBrowsers(values as string[]);
    }
  }

  const writeAccess = props.rights.MANAGE_CAMPAIGN || false;

  return <SettingsBox title="Browser">
    <div className="row no-gutters">
      <div className="col-lg-12 px-1">
        <Loader visible={showLoader} loaderClass="loading-input" />
        {!showLoader &&
          <Form.Group>
            <Form.Label>Browsers</Form.Label>
            <Select
              isDisabled={!writeAccess}
              inputId="settings-targeting-browsers"
              className="react-select-container multiple"
              classNamePrefix="react-select"
              name="settings-targeting-browsers-name"
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
export default BrowserBox;