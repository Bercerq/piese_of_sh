import React, { useState, useEffect, Fragment } from "react";
import { Form } from "react-bootstrap";
import * as Api from "../../../../../../client/Api";
import { VideoTargetingBoxFormData, VideoTargetingBoxProps } from "../../../../../../client/campaignSchemas";
import SettingsBox from "../shared/SettingsBox";
import CheckboxList from "../../../../../UI/CheckboxList";
import { SelectOption } from "../../../../../../client/schemas";
import Loader from "../../../../../UI/Loader";

const VideoTargetingBox = (props: VideoTargetingBoxProps) => {
  const [playerSizes, setPlayerSizes] = useState<string[]>(props.playerSizes);
  const [initiationTypes, setInitiationTypes] = useState<string[]>(props.initiationTypes);
  const [playerSizeOptions, setPlayerSizeOptions] = useState<SelectOption[]>([]);
  const [initiationTypeOptions, setInitiationTypeOptions] = useState<SelectOption[]>([]);
  const [showLoader, setShowLoader] = useState<boolean>(true);

  const submitData = getSubmitData();

  useEffect(() => { loadForm(); }, [props.id]);

  useEffect(() => { props.onChange(submitData); }, [JSON.stringify(submitData)]);

  async function loadForm() {
    setShowLoader(true);
    setPlayerSizes(props.playerSizes);
    setInitiationTypes(props.initiationTypes);

    try {
      const playerSizeP = Api.Get({ path: "/api/targeting/suggestion/basic/inventory/playerSize", qs: { all: "false" } });
      const initiationTypeP = Api.Get({ path: "/api/targeting/suggestion/basic/inventory/initiationType", qs: { all: "false" } });

      const [playerSizeOptions, initiationTypeOptions] = await Promise.all([playerSizeP, initiationTypeP]);

      setPlayerSizeOptions(playerSizeOptions);
      setInitiationTypeOptions(initiationTypeOptions);
    } catch (err) {
      console.log(err);
    }

    setShowLoader(false);
  }

  function getSubmitData(): VideoTargetingBoxFormData {
    return {
      playerSizes,
      initiationTypes
    }
  }

  const handlePlayerSizesChange = (checked: string[]) => {
    setPlayerSizes(checked);
  }

  const handleInitiationTypesChange = (checked: string[]) => {
    setInitiationTypes(checked);
  }

  const writeAccess = props.rights.MANAGE_CAMPAIGN || false;

  return <SettingsBox title="Video targeting">
    <div className="row no-gutters">
      <Loader visible={showLoader} />
      {!showLoader && <Fragment>
        <div className="col-lg-4 px-1">
          <Form.Group>
            <Form.Label>Video player size</Form.Label>
            {playerSizeOptions.length > 0 &&
              <CheckboxList
                disabled={!writeAccess}
                id="settings-targeting-playersizes"
                options={playerSizeOptions}
                checked={playerSizes}
                onChange={handlePlayerSizesChange}
              />
            }
          </Form.Group>
        </div>
        <div className="col-lg-4 px-1">
          <Form.Group>
            <Form.Label>User initiation type</Form.Label>
            {initiationTypeOptions.length > 0 &&
              <CheckboxList
                disabled={!writeAccess}
                id="settings-targeting-initiationtypes"
                options={initiationTypeOptions}
                checked={initiationTypes}
                onChange={handleInitiationTypesChange}
              />
            }
          </Form.Group>
        </div>
      </Fragment>}
    </div>
  </SettingsBox>
}
export default VideoTargetingBox;