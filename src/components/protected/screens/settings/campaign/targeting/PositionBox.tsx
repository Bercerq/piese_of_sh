import React, { useState, useEffect, Fragment } from "react";
import { Form } from "react-bootstrap";
import * as Api from "../../../../../../client/Api";
import { PositionBoxFormData, PositionBoxProps } from "../../../../../../client/campaignSchemas";
import { SelectOption } from "../../../../../../client/schemas";
import CheckboxList from "../../../../../UI/CheckboxList";
import Loader from "../../../../../UI/Loader";
import SettingsBox from "../shared/SettingsBox";

const PositionBox = (props: PositionBoxProps) => {
  const [deviceTypes, setDeviceTypes] = useState<string[]>(props.deviceTypes);
  const [inventoryTypes, setInventoryTypes] = useState<string[]>(props.inventoryTypes);
  const [positionTypes, setPositionTypes] = useState<string[]>(props.positionTypes);
  const [deviceTypeOptions, setDeviceTypeOptions] = useState<SelectOption[]>([]);
  const [inventoryTypeOptions, setInventoryTypeOptions] = useState<SelectOption[]>([]);
  const [positionTypeOptions, setPositionTypeOptions] = useState<SelectOption[]>([]);
  const [showLoader, setShowLoader] = useState<boolean>(true);

  const submitData = getSubmitData();

  useEffect(() => { loadForm(); }, [props.id]);

  useEffect(() => { props.onChange(submitData); }, [JSON.stringify(submitData)]);

  async function loadForm() {
    setShowLoader(true);
    setDeviceTypes(props.deviceTypes);
    setInventoryTypes(props.inventoryTypes);
    setPositionTypes(props.positionTypes);

    try {
      const deviceTypeP = Api.Get({ path: "/api/targeting/suggestion/basic/device/deviceType", qs: { campaignId: props.id, all: "false" } });
      const inventoryTypeP = Api.Get({ path: "/api/targeting/suggestion/basic/inventory/inventoryType", qs: { all: "false" } });
      const positionTypeP = Api.Get({ path: "/api/targeting/suggestion/basic/inventory/positionOnPage", qs: { all: "false" } });

      const [deviceTypeOptions, inventoryTypeOptions, positionTypeOptions] = await Promise.all([deviceTypeP, inventoryTypeP, positionTypeP]);

      setDeviceTypeOptions(deviceTypeOptions);
      setInventoryTypeOptions(inventoryTypeOptions);
      setPositionTypeOptions(positionTypeOptions);
    } catch (err) {
      console.log(err);
    }

    setShowLoader(false);
  }

  function getSubmitData(): PositionBoxFormData {
    return {
      deviceTypes,
      inventoryTypes,
      positionTypes
    };
  }

  const handleDeviceTypesChange = (checked: string[]) => {
    setDeviceTypes(checked);
  }

  const handleInventoryTypesChange = (checked: string[]) => {
    setInventoryTypes(checked);
  }

  const handlePositionTypesChange = (checked: string[]) => {
    setPositionTypes(checked);
  }

  const writeAccess = props.rights.MANAGE_CAMPAIGN || false;

  return <SettingsBox title="Inventory type & Positioning">
    <div className="row no-gutters">
      <Loader visible={showLoader} />
      {!showLoader && <Fragment>
        <div className="col-lg-4 px-1">
          <Form.Group>
            <Form.Label>Device</Form.Label>
            {deviceTypeOptions.length > 0 &&
              <CheckboxList
                disabled={!writeAccess}
                id="settings-targeting-devicetypes"
                options={deviceTypeOptions}
                checked={deviceTypes}
                onChange={handleDeviceTypesChange}
              />
            }
          </Form.Group>
        </div>
        <div className="col-lg-4 px-1">
          <Form.Group>
            <Form.Label>Inventory type</Form.Label>
            {inventoryTypeOptions.length > 0 &&
              <CheckboxList
                disabled={!writeAccess}
                id="settings-targeting-inventorytypes"
                options={inventoryTypeOptions}
                checked={inventoryTypes}
                onChange={handleInventoryTypesChange}
              />
            }
          </Form.Group>
        </div>
        <div className="col-lg-4 px-1">
          <Form.Group>
            <Form.Label>Position on page</Form.Label>
            {positionTypeOptions.length > 0 &&
              <CheckboxList
                disabled={!writeAccess}
                id="settings-targeting-positiontypes"
                options={positionTypeOptions}
                checked={positionTypes}
                onChange={handlePositionTypesChange}
              />
            }
          </Form.Group>
        </div>
      </Fragment>}
    </div>
  </SettingsBox>
}
export default PositionBox;