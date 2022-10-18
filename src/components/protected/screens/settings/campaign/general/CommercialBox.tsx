import React, { useState, useEffect } from "react";
import { Form, InputGroup } from "react-bootstrap";
import NumberFormat from "react-number-format";
import * as _ from "lodash";
import * as Validation from "../../../../../../client/Validation";
import * as CampaignHelper from "../../../../../../client/CampaignHelper";
import { CommercialBoxFormData, CommercialBoxProps } from "../../../../../../client/campaignSchemas";
import { ValidationError } from "../../../../../../client/schemas";
import SettingsBox from "../shared/SettingsBox";
import { MediaAgencyRevenueModelType } from "../../../../../../models/data/Campaign";

const CommercialBox = (props: CommercialBoxProps) => {
  const [mediaAgencyRevenueModel, setMediaAgencyRevenueModel] = useState<MediaAgencyRevenueModelType>(props.mediaAgencyRevenueModel);
  const [commercialValue, setCommercialValue] = useState<number>(props.commercialValue);
  const [percentValueValidation, setPercentValueValidation] = useState<ValidationError>({ error: false, message: "" });
  const [currencyValueValidation, setCurrencyValueValidation] = useState<ValidationError>({ error: false, message: "" });

  const submitData = getSubmitData();
  const isValid = getIsValid();

  useEffect(loadForm, [props.id]);

  useEffect(() => { props.onChange(submitData, isValid); }, [JSON.stringify(submitData), isValid]);

  function loadForm() {
    setMediaAgencyRevenueModel(props.mediaAgencyRevenueModel);
    setCommercialValue(props.commercialValue);
    setPercentValueValidation({ error: false, message: "" });
    setCurrencyValueValidation({ error: false, message: "" });
  }

  function getSubmitData(): CommercialBoxFormData {
    return {
      mediaAgencyRevenueModel,
      commercialValue
    }
  }

  function getIsValid() {
    return !(percentValueValidation.error || currencyValueValidation.error);
  }

  const handleMediaAgencyRevenueModelChange = (e) => {
    if (e.target.checked) {
      const mediaAgencyRevenueModel = parseInt(e.target.value, 10) as MediaAgencyRevenueModelType;
      setMediaAgencyRevenueModel(mediaAgencyRevenueModel);
    }
  }

  const handlePercentValueChange = (e) => {
    const commercialValue = e.target.value.trim() !== "" ? parseFloat(e.target.value) : null;
    const percentValueValidation = Validation.native(e.target);
    setCommercialValue(commercialValue);
    setPercentValueValidation(percentValueValidation);
  }

  const handleCurrencyValueChange = (values) => {
    const commercialValue = _.get(values, "floatValue") as number;
    if (_.isNil(commercialValue)) {
      setCurrencyValueValidation({ error: true, message: "Please fill out this field." });
    } else {
      setCurrencyValueValidation({ error: false, message: "" });
    }
    setCommercialValue(commercialValue);
  }

  const commercialTypeOptions = CampaignHelper.commercialTypeOptions();
  const isCurrency = [1, 2, 3].indexOf(mediaAgencyRevenueModel) > -1;
  const currencyInputClass = currencyValueValidation.error ? "form-control is-invalid" : "form-control";
  const writeAccess = props.rights.MANAGE_CAMPAIGN || false;

  return <SettingsBox title="Commercial Agreements">
    <div className="row no-gutters">
      <div className="col-lg-8 px-1">
        <Form.Group className="pt-1">
          <Form.Label className="width-100">Type</Form.Label>
          {
            commercialTypeOptions.map((o, i) => <Form.Check inline
              disabled={!writeAccess}
              id={`settings-commercial-commercialtype-${o.value}`}
              type="radio"
              value={o.value}
              name="settings-commercial-commercialtype"
              checked={o.value === mediaAgencyRevenueModel.toString()}
              onChange={handleMediaAgencyRevenueModelChange}
              label={o.label} />)
          }
        </Form.Group>
      </div>
      <div className="col-lg-4 px-1">
        {mediaAgencyRevenueModel === 5 && <InputGroup>
          <InputGroup.Prepend>
            <InputGroup.Text>%</InputGroup.Text>
          </InputGroup.Prepend>
          <Form.Control
            disabled={!writeAccess}
            id="settings-commercial-percentvalue"
            required
            type="number"
            min="0"
            max="100"
            step="0.01"
            isInvalid={percentValueValidation.error}
            value={_.toString(commercialValue)}
            onChange={handlePercentValueChange}
          />
          {percentValueValidation.error && <Form.Control.Feedback type="invalid">{percentValueValidation.message}</Form.Control.Feedback>}
        </InputGroup>}
        {isCurrency &&
          <InputGroup>
            <InputGroup.Prepend>
              <InputGroup.Text>€</InputGroup.Text>
            </InputGroup.Prepend>
            <NumberFormat
              disabled={!writeAccess}
              id="settings-commercial-currencyvalue"
              className={currencyInputClass}
              value={commercialValue}
              thousandSeparator={true}
              allowNegative={false}
              allowLeadingZeros={false}
              decimalScale={2}
              fixedDecimalScale={true}
              onValueChange={handleCurrencyValueChange}
            />
            {currencyValueValidation.error && <Form.Control.Feedback type="invalid">{currencyValueValidation.message}</Form.Control.Feedback>}
          </InputGroup>
        }
      </div>
    </div>
  </SettingsBox>
}
export default CommercialBox;