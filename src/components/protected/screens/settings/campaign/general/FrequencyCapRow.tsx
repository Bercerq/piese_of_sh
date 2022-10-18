import React, { useEffect, useState } from "react";
import { Form } from "react-bootstrap";
import Select from "react-select";
import * as _ from "lodash";
import * as Validation from "../../../../../../client/Validation";
import * as CampaignHelper from "../../../../../../client/CampaignHelper";
import { FrequencyCapRowProps } from "../../../../../../client/campaignSchemas";
import FontIcon from "../../../../../UI/FontIcon";
import { PeriodType } from "../../../../../../models/data/Campaign";
import { SelectOption, ValidationError } from "../../../../../../client/schemas";

const FrequencyCapRow = (props: FrequencyCapRowProps) => {
  const [maximumValidation, setMaximumValidation] = useState<ValidationError>({ error: false, message: "" });

  useEffect(() => {
    const maximumValidation = Validation.native(document.getElementById(`${props.field}-${props.row.key}-maximum`) as HTMLInputElement);
    setMaximumValidation(maximumValidation);
    props.onChange(props.index, { maximum: props.row.maximum, sinceStartOf: props.row.sinceStartOf, key: props.row.key }, !maximumValidation.error);
  }, []);

  function getOptions(): SelectOption[] {
    const periodOptions = CampaignHelper.frequencyCapsPeriodOptions();
    return periodOptions.filter((option) => {
      return option.value === props.row.sinceStartOf || _.findIndex(props.options, (o) => { return o.value === option.value }) > -1
    });
  }

  const handleMaximumChange = (e) => {
    const maximum = e.target.value !== "" ? parseInt(e.target.value, 10) : null;
    const maximumValidation = Validation.native(e.target);
    props.onChange(props.index, { maximum, sinceStartOf: props.row.sinceStartOf, key: props.row.key }, !maximumValidation.error);
    setMaximumValidation(maximumValidation);
  }

  const handlePeriodChange = (selected) => {
    const sinceStartOf = selected.value as PeriodType;
    props.onChange(props.index, { maximum: props.row.maximum, sinceStartOf, key: props.row.key }, !maximumValidation.error);
  }

  const removeClick = (e) => {
    e.preventDefault();
    if (props.writeAccess) {
      props.onDelete(props.index);
    }
  }

  const options = getOptions();
  return <div>
    <div className="array-row">
      <div className="row no-gutters">
        <div className="col-lg-6 px-1 pb-1">
          <Form.Control
            required
            disabled={!props.writeAccess}
            id={`${props.field}-${props.row.key}-maximum`}
            type="number"
            min="0"
            isInvalid={maximumValidation.error}
            value={_.toString(props.row.maximum)}
            onChange={handleMaximumChange}
          />
          {maximumValidation.error && <Form.Control.Feedback type="invalid">{maximumValidation.message}</Form.Control.Feedback>}
        </div>
        <div className="col-lg-6 px-1 pb-1">
          <Select
            isDisabled={!props.writeAccess}
            inputId={`${props.field}-${props.row.key}-period`}
            className="react-select-container"
            classNamePrefix="react-select"
            onChange={handlePeriodChange}
            value={options.find((o) => { return o.value === props.row.sinceStartOf })}
            options={options}
          />
        </div>
      </div>
    </div>
    <div className="array-row-remove-btn">
      <a href="" className="table-btn" onClick={removeClick}><FontIcon name="remove" /></a>
    </div>
  </div>;
}
export default FrequencyCapRow;