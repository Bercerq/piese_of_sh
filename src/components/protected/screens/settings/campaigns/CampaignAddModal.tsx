import React, { useState, useEffect, useContext, Fragment } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import * as _ from "lodash";
import * as Api from "../../../../../client/Api";
import * as Helper from "../../../../../client/Helper";
import { Advertiser, AdvertiserEntity } from "../../../../../models/data/Advertiser";
import { Parent } from "../../../../../models/data/Parent";
import { ScopeType, SelectOption } from "../../../../../client/schemas";
import CampaignExistingForm from "./CampaignExistingForm";
import CampaignNewForm from "./CampaignNewForm";
import { ScopeData, ScopeDataContextType } from "../../../../../models/Common";
import ScopeDataContext from "../../../context/ScopeDataContext";
import { CampaignGroup } from "../../../../../models/data/CampaignGroup";
import FontIcon from "../../../../UI/FontIcon";
import { ExistingCampaign, NewCampaign } from "../../../../../client/campaignSchemas";

interface CampaignAddModalProps {
  scope: ScopeType;
  scopeId: number;
  videoMode: boolean;
  show: boolean;
  onClose: () => void;
  onNewSubmit: (data: NewCampaign) => void;
  onExistingSubmit: (data: ExistingCampaign) => void;
}

const CampaignAddModal = (props: CampaignAddModalProps) => {
  let { data } = useContext<ScopeDataContextType>(ScopeDataContext);
  const [setupType, setSetupType] = useState<"new" | "existing">("new");
  const [advertisers, setAdvertisers] = useState<SelectOption[]>([]);
  const [newData, setNewData] = useState<NewCampaign>(null);
  const [existingData, setExistingData] = useState<ExistingCampaign>(null);
  const [saving, setSaving] = useState<boolean>(false);
  const [validationError, setValidationError] = useState<boolean>(false);

  useEffect(save, [validationError, JSON.stringify(newData), JSON.stringify(existingData)]);

  function save() {
    if (!validationError && saving) {
      if (setupType === "new") {
        props.onNewSubmit(newData);
      } else {
        props.onExistingSubmit(existingData);
      }
    }
  }

  const handleClose = () => {
    props.onClose();
  }

  const handleExited = () => {
    setSaving(false);
  }

  const handleEntering = async () => {
    setSaving(false);
    const advertisers = await getAdvertisers();
    setAdvertisers(advertisers);
  }

  const handleSetupTypeChange = (e) => {
    if (e.target.checked) {
      setSetupType(e.target.value);
    }
  }

  const handleSubmit = () => {
    setSaving(true);
  }

  const campaignNewCreate = (error: boolean, data: NewCampaign) => {
    setValidationError(error);
    setNewData(data);
    if (error) {
      setSaving(false);
    }
  }

  const campaignClone = (error: boolean, data: ExistingCampaign) => {
    setValidationError(error);
    setExistingData(data);
    if (error) {
      setSaving(false);
    }
  }

  async function getAdvertisers(): Promise<SelectOption[]> {
    try {
      if (props.scope === "advertiser") {
        const advertiser: AdvertiserEntity = (data as Advertiser).advertiser;
        return [{ value: advertiser.id, label: advertiser.name }];
      } else if (props.scope === "campaigngroup") {
        const advertiser: Parent = _.get((data as CampaignGroup), "parents.advertiser");
        return [{ value: advertiser.parentId, label: advertiser.name }];
      } else {
        const qs = Helper.scopedParam({ scope: props.scope, scopeId: props.scopeId });
        const rslt = await Api.Get({ path: "/api/advertisers", qs });
        return _.get(rslt, "advertisers", []).map((o) => { return { value: o.advertiser.id, label: o.advertiser.name } });
      }
    } catch (err) {
      console.log(err);
      return [];
    }
  }

  return <Modal size="lg" show={props.show} onHide={handleClose} onEnter={handleEntering} onExited={handleExited} backdrop="static">
    <Modal.Header closeButton>
      <Modal.Title>Quick campaign setup</Modal.Title>
    </Modal.Header>
    <Modal.Body>
      <div className="row">
        <div className="col-sm-12">
          <div>
            <Form.Check inline
              id="setup-type-new"
              type="radio"
              name="setup-type"
              value="new"
              checked={setupType === "new"}
              onChange={handleSetupTypeChange}
              label="New settings"
            />
            <Form.Check inline
              id="setup-type-existing"
              type="radio"
              name="setup-type"
              value="existing"
              checked={setupType === "existing"}
              onChange={handleSetupTypeChange}
              label="From existing campaign"
            />
          </div>
        </div>
      </div>
      {setupType === "new" &&
        <CampaignNewForm
          videoMode={props.videoMode}
          advertisers={advertisers}
          scope={props.scope}
          data={data as ScopeData}
          submit={saving}
          onCreate={campaignNewCreate}
        />
      }
      {setupType === "existing" &&
        <CampaignExistingForm
          advertisers={advertisers}
          scope={props.scope}
          data={data as ScopeData}
          submit={saving}
          onClone={campaignClone}
        />
      }
    </Modal.Body>
    <Modal.Footer>
      <Button size="sm" variant="light" onClick={handleClose}>CANCEL</Button>
      <Button size="sm" variant="primary" onClick={handleSubmit} disabled={saving}>
        {!saving && <Fragment>SAVE</Fragment>}
        {saving && <Fragment><FontIcon names={["refresh", "spin"]} /> SAVING</Fragment>}
      </Button>
    </Modal.Footer>
  </Modal>;
}
export default CampaignAddModal;