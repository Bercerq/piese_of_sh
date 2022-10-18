import React, { Fragment, useEffect, useState } from "react";
import { Form } from "react-bootstrap";
import CreatableSelect from "react-select/creatable";
import * as _ from "lodash";
import * as Validation from "../../../../../../client/Validation";
import * as CampaignHelper from "../../../../../../client/CampaignHelper";
import { StrategyRuleConditionProps } from "./StrategyRuleCondition";
import { ValidationError } from "../../../../../../client/schemas";
import { GPSLocation } from "../../../../../../models/data/Campaign";

const GPS = (props: StrategyRuleConditionProps) => {
  const [gpsValidation, setGpsValidation] = useState<ValidationError>({ error: false, message: "" });
  const [radiusValidation, setRadiusValidation] = useState<ValidationError>({ error: false, message: "" });
  const locations = _.get(props, "condition.locations", []);
  const locationOptions = CampaignHelper.gpsLocationsSelectOptions(locations);
  const radius = _.get(props, "condition.radius", 0);

  useEffect(() => {
    const gpsValidation = locations.length > 0 ? { error: false, message: "" } : { error: true, message: "Please fill out this field." };
    setGpsValidation(gpsValidation);
    props.onChange(props.condition, !gpsValidation.error);
  }, []);

  function getValidCoordinates(values: string[]): GPSLocation[] {
    const valid = [];
    values.forEach((value) => {
      let isValid = false;
      const coordinates = value.split(",");

      if (coordinates.length === 2) {
        isValid = coordinates.every((c) => { return !isNaN(parseFloat(c)); });
      }

      if (isValid) {
        const location = {
          latitude: _.round(parseFloat(coordinates[0]), 6),
          longitude: _.round(parseFloat(coordinates[1]), 6)
        }
        valid.push(location);
      }
    });
    return valid;
  }

  const handleValuesChange = (inputValues: any, actionMeta: any) => {
    if (actionMeta.action === "create-option") {
      if (inputValues.length > 0) {
        const latestValue = inputValues[inputValues.length - 1].value;
        const newValues = latestValue.split(/[\s]+/);
        const valid = getValidCoordinates(newValues);
        const newLocations = locations.concat(valid);
        const gpsValidation = newLocations.length > 0 ? { error: false, message: "" } : { error: true, message: "Please fill out this field." };
        if (valid.length > 0) {
          const condition = _.assign({}, props.condition, { locations: newLocations });
          props.onChange(condition, !(radiusValidation.error || gpsValidation.error));
        }
        setGpsValidation(gpsValidation);
      }
    } else {
      const selectedValues = (inputValues || []).map((s) => { return s.value; });
      const gpsValidation = Validation.required(selectedValues);
      const newLocations = getValidCoordinates(selectedValues);
      const condition = _.assign({}, props.condition, { locations: newLocations });
      props.onChange(condition, !(radiusValidation.error || gpsValidation.error));
      setGpsValidation(gpsValidation);
    }
  }

  const handleRadiusChange = (e) => {
    const radius = e.target.value.trim() !== "" ? parseFloat(e.target.value) : 0;
    const radiusValidation = Validation.native(e.target);
    const condition = _.assign({}, props.condition, { radius });
    props.onChange(condition, !(gpsValidation.error || radiusValidation.error));
    setRadiusValidation(radiusValidation);
  }

  return <Fragment>
    <Form.Group style={{ marginTop: "26px" }}>
      <CreatableSelect
        className="react-select-container"
        inputId={`strategy-rule-condition-gps-${props.strategyId}-${props.index}`}
        classNamePrefix="react-select"
        placeholder="latitude,longitude"
        isClearable
        isDisabled={!props.writeAccess}
        isMulti
        value={locationOptions}
        onChange={handleValuesChange}
      />
      {gpsValidation.error && <Form.Control.Feedback type="invalid" style={{ display: "block" }}>{gpsValidation.message}</Form.Control.Feedback>}
    </Form.Group>
    <Form.Group>
      <Form.Label>Radius (km)</Form.Label>
      <Form.Control
        id={`strategy-rule-condition-gps-radius-${props.strategyId}-${props.index}`}
        type="number"
        min="0"
        step="0.01"
        disabled={!props.writeAccess}
        isInvalid={radiusValidation.error}
        value={_.toString(radius)}
        onChange={handleRadiusChange}
      />
      {radiusValidation.error && <Form.Control.Feedback type="invalid">{radiusValidation.message}</Form.Control.Feedback>}
    </Form.Group>
  </Fragment>
}
export default GPS;