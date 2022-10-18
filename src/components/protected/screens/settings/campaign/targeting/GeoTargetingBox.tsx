import React, { useEffect, useState } from "react";
import { Form } from "react-bootstrap";
import Select from "react-select";
import CreatableSelect from "react-select/creatable";
import * as _ from "lodash";
import * as Utils from "../../../../../../client/Utils";
import * as Validation from "../../../../../../client/Validation";
import * as CampaignHelper from "../../../../../../client/CampaignHelper";
import { GeoTargetingBoxFormData, GeoTargetingBoxProps } from "../../../../../../client/campaignSchemas";
import { SelectOption, ValidationError } from "../../../../../../client/schemas";
import SettingsBox from "../shared/SettingsBox";
import AsyncSelectList from "../../../../../UI/AsyncSelectList";

const GeoTargetingBox = (props: GeoTargetingBoxProps) => {
  const postalCodeCountries = Utils.countries();
  const [geotargetingRadioValue, setGeotargetingRadioValue] = useState<"country-region-city-form" | "postalcode-form">(getGeotargetingRadioValue());
  const [countries, setCountries] = useState<SelectOption[]>(CampaignHelper.attributeValueNameSelectOptions(props.countries));
  const [regions, setRegions] = useState<SelectOption[]>(CampaignHelper.attributeValueNameSelectOptions(props.regions));
  const [cities, setCities] = useState<SelectOption[]>(CampaignHelper.attributeValueNameSelectOptions(props.cities));
  const [radius, setRadius] = useState<number>(_.get(props, "cities.radius", null));
  const [postalCodes, setPostalCodes] = useState<SelectOption[]>(CampaignHelper.attributeValueNameSelectOptions(props.postalCodes));
  const [countryCode, setCountryCode] = useState<string>(_.get(props, "postalCodes.countryCode", ""));
  const [radiusValidation, setRadiusValidation] = useState<ValidationError>({ error: false, message: "" });

  const submitData = getSubmitData();
  const isValid = getIsValid();

  useEffect(loadForm, [props.id]);

  useEffect(() => { props.onChange(submitData, isValid); }, [JSON.stringify(submitData), isValid]);

  function loadForm() {
    const geotargetingRadioValue = getGeotargetingRadioValue();
    setGeotargetingRadioValue(geotargetingRadioValue);
    setCountries(CampaignHelper.attributeValueNameSelectOptions(props.countries));
    setRegions(CampaignHelper.attributeValueNameSelectOptions(props.regions));
    setCities(CampaignHelper.attributeValueNameSelectOptions(props.cities));
    setRadius(_.get(props, "cities.radius", null));
    setPostalCodes(CampaignHelper.attributeValueNameSelectOptions(props.postalCodes));
    setCountryCode(_.get(props, "postalCodes.countryCode", "NL"));
    setRadiusValidation({ error: false, message: "" });
  }

  function getSubmitData(): GeoTargetingBoxFormData {
    if (geotargetingRadioValue === "country-region-city-form") {
      return {
        countries: countries.map((o) => { return o.value as string }),
        regions: regions.map((o) => { return o.value as string }),
        cities: cities.map((o) => { return o.value as string }),
        radius
      }
    } else {
      return {
        countryCode,
        postalCodes: postalCodes.map((o) => { return o.value as string })
      }
    }
  }

  function getIsValid(): boolean {
    if (geotargetingRadioValue === "country-region-city-form") {
      return !radiusValidation.error;
    } else {
      return true;
    }
  }

  function getGeotargetingRadioValue() {
    const postalCodes = _.get(props, "postalCodes.values") || [];
    if (postalCodes.length > 0) {
      return "postalcode-form";
    } else {
      return "country-region-city-form";
    }
  }

  function getGeoTargetingRadioOptions(): SelectOption[] {
    return [
      {
        value: "country-region-city-form",
        label: "Country / Region / City"
      },
      {
        value: "postalcode-form",
        label: "Postal codes"
      }
    ];
  }

  const handleGeotargetingRadioChange = (e) => {
    if (e.target.checked) {
      setGeotargetingRadioValue(e.target.value);
    }
  }

  const handleRadiusChange = (e) => {
    const radius = e.target.value.trim() !== "" ? parseFloat(e.target.value) : null;
    const radiusValidation = Validation.native(e.target);
    setRadius(radius);
    setRadiusValidation(radiusValidation);
  }

  const handlePostalCodeCountryChange = (selected) => {
    setCountryCode(selected.value);
  }

  const handlePostalCodesChange = (inputValues: any, actionMeta: any) => {
    if (actionMeta.action === "create-option") {
      if (inputValues.length > 0) {
        const latestValue = inputValues[inputValues.length - 1].value;
        const newValues = latestValue.split(/[\s]+/).map((v) => { return { value: v, label: v } });
        const newPostalCodes = postalCodes.concat(newValues);
        setPostalCodes(newPostalCodes);
      }
    } else {
      setPostalCodes(inputValues);
    }
  }

  const geoTargetingRadioOptions = getGeoTargetingRadioOptions();
  const writeAccess = props.rights.MANAGE_CAMPAIGN || false;

  return <SettingsBox title="Geo targeting">
    <div className="row no-gutters">
      <div className="col-lg-12 px-1">
        <Form.Group>
          {
            geoTargetingRadioOptions.map((o, i) => <Form.Check inline
              disabled={!writeAccess}
              id={`geotargeting-radio-${o.value}`}
              type="radio"
              value={o.value}
              name="geotargeting-radio"
              checked={o.value === geotargetingRadioValue}
              onChange={handleGeotargetingRadioChange}
              label={o.label} />)
          }
        </Form.Group>
      </div>
    </div>
    {geotargetingRadioValue === "country-region-city-form" &&
      <div className="row no-gutters">
        <div className="col-lg-12 px-1">
          <Form.Group>
            <Form.Label>Country</Form.Label>
            <AsyncSelectList
              id="settings-targeting-country"
              writeAccess={writeAccess}
              url="/api/targeting/suggestion/basic/device/geo/country"
              placeholder="all"
              values={countries}
              onChange={setCountries}
            />
          </Form.Group>
          <Form.Group>
            <Form.Label>Region</Form.Label>
            <AsyncSelectList
              id="settings-targeting-region"
              writeAccess={writeAccess}
              url="/api/targeting/suggestion/basic/device/geo/region"
              placeholder="all"
              values={regions}
              onChange={setRegions}
            />
          </Form.Group>
          <Form.Group>
            <Form.Label>City</Form.Label>
            <AsyncSelectList
              id="settings-targeting-city"
              writeAccess={writeAccess}
              url="/api/targeting/suggestion/basic/device/geo/city"
              placeholder="all"
              values={cities}
              onChange={setCities}
            />
          </Form.Group>
          <Form.Group>
            <Form.Label>Target around these cities (radius in km)</Form.Label>
            <Form.Control
              disabled={!writeAccess}
              id="settings-targeting-radius"
              type="number"
              min="0"
              step="0.01"
              isInvalid={radiusValidation.error}
              value={_.toString(radius)}
              onChange={handleRadiusChange}
            />
            {radiusValidation.error && <Form.Control.Feedback type="invalid">{radiusValidation.message}</Form.Control.Feedback>}
          </Form.Group>
        </div>
      </div>
    }
    {geotargetingRadioValue === "postalcode-form" &&
      <div className="row no-gutters">
        <div className="col-lg-4 px-1">
          <Form.Group>
            <Form.Label>Country</Form.Label>
            <Select
              isDisabled={!writeAccess}
              inputId="settings-targeting-postalcode-country"
              className="react-select-container"
              classNamePrefix="react-select"
              onChange={handlePostalCodeCountryChange}
              value={postalCodeCountries.find((o) => { return o.value === countryCode })}
              options={postalCodeCountries}
            />
          </Form.Group>
        </div>
        <div className="col-lg-8 px-1">
          <Form.Group>
            <Form.Label>Postal codes</Form.Label>
            <CreatableSelect
              isDisabled={!writeAccess}
              className="react-select-container"
              inputId="settings-targeting-postalcodes"
              classNamePrefix="react-select"
              placeholder=" "
              isClearable
              isMulti
              value={postalCodes}
              onChange={handlePostalCodesChange}
            />
          </Form.Group>
        </div>
      </div>
    }
  </SettingsBox >
}
export default GeoTargetingBox;