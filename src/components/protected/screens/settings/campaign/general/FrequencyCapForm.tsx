import React from "react";
import { Button, Form } from "react-bootstrap";
import { v4 as uuidv4 } from "uuid";
import { FrequencyCapFormProps } from "../../../../../../client/campaignSchemas";
import { FrequencyCapItem, PeriodType } from "../../../../../../models/data/Campaign";
import FontIcon from "../../../../../UI/FontIcon";
import FrequencyCapRow from "./FrequencyCapRow";

const FrequencyCapForm = (props: FrequencyCapFormProps) => {
  const handleChange = (i: number, row: FrequencyCapItem & { key: string }, isValid: boolean) => {
    props.onChange(i, row, isValid);
  }

  const handleDelete = (i: number) => {
    props.onDelete(i);
  }

  const handleAdd = () => {
    if (props.options.length > 0) {
      props.onAdd({ maximum: null, sinceStartOf: props.options[0].value as PeriodType, key: uuidv4() });
    }
  }

  return <div className="row no-gutters">
    <div className="col-lg-12">
      <Form.Group>
        <Form.Label className="px-1">{props.label}</Form.Label>
        <div>
          {
            props.rows.map((row, i) => <FrequencyCapRow
              key={row.key}
              index={i}
              row={row}
              field={props.field}
              options={props.options}
              writeAccess={props.writeAccess}
              onChange={handleChange}
              onDelete={handleDelete}
            />)
          }
        </div>
        <Button size="sm" variant="primary" onClick={handleAdd} disabled={!props.writeAccess}><FontIcon name="plus" /> ADD</Button>
      </Form.Group>
    </div>
  </div>
}
export default FrequencyCapForm;