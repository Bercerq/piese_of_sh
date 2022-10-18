import React, { useState, useEffect } from "react";
import { Form } from "react-bootstrap";
import Select from "react-select";
import * as Api from "../../../../../../client/Api";
import { OSBoxFormData, OSBoxProps } from "../../../../../../client/campaignSchemas";
import { SelectOption } from "../../../../../../client/schemas";
import Loader from "../../../../../UI/Loader";
import SettingsBox from "../shared/SettingsBox";

const OSBox = (props: OSBoxProps) => {
  const [os, setOs] = useState<string[]>(props.os);
  const [options, setOptions] = useState<SelectOption[]>([]);
  const [showLoader, setShowLoader] = useState<boolean>(true);

  const submitData = getSubmitData();

  useEffect(() => { loadForm(); }, [props.id]);

  useEffect(() => { props.onChange(submitData); }, [JSON.stringify(submitData)]);

  async function loadForm() {
    setShowLoader(true);
    setOs(props.os);
    try {
      const options = await Api.Get({ path: "/api/targeting/suggestion/basic/device/os" });
      setOptions(options);
    } catch (err) {
      console.log(err);
    }
    setShowLoader(false);
  }

  function getSubmitData(): OSBoxFormData {
    return {
      os
    };
  }

  function getValues() {
    return options.filter((o) => { return os.indexOf(o.value as string) > -1 });
  }

  const handleValuesChange = (selected, { action }) => {
    if (action === "select-option" && selected.length > 0) {
      if (selected[selected.length - 1].value === "-1") {
        const values = options.filter((o) => { return o.value !== "-1" }).map((s) => { return s.value });
        setOs(values as string[]);
      } else {
        const values = (selected || []).map((s) => { return s.value });
        setOs(values as string[]);
      }
    } else {
      const values = (selected || []).map((s) => { return s.value });
      setOs(values as string[]);
    }
  }

  const writeAccess = props.rights.MANAGE_CAMPAIGN || false;

  return <SettingsBox title="OS">
    <div className="row no-gutters">
      <div className="col-lg-12 px-1">
        <Loader visible={showLoader} loaderClass="loading-input" />
        {!showLoader &&
          <Form.Group>
            <Form.Label>OS</Form.Label>
            <Select
              isDisabled={!writeAccess}
              inputId="settings-targeting-os"
              className="react-select-container multiple"
              classNamePrefix="react-select"
              name="settings-targeting-os-name"
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
export default OSBox;