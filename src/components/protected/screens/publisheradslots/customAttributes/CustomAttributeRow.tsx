
import * as React from "react";
import { FormGroup, FormLabel , FormControl } from "react-bootstrap";
import Select from "react-select";
import { OverwritableProperty } from "../OverwritableProperty";
import FontIcon from "../../../../UI/FontIcon";

export interface CustomAttributeRowProps {
  property: OverwritableProperty
  writeAccess: boolean;
  value:  string
  getOptions: () => { label: String, value: string }[]
  handleTextChange: (label: String, value: string) => void;
  handleDelete: (label: string) => void;
  handleOptionChange: (oldLabel: String, newLabel: String, newValue: String) => void;
}

const CustomRowAttributes = (props: CustomAttributeRowProps) => {
  const removeClick = (event) => {
    event.preventDefault();
    if (props.writeAccess) {
      props.handleDelete(props.property.propertyName);
    }
  }
  const onTextChange = (event) => {
    props.handleTextChange(props.property.propertyName, event.target.value)
  }

  const onSelectChange = (event) => {
    props.handleOptionChange(props.property.propertyName, event.label, event.value)
  }

  return <div className="row">
    <div className="col-sm-5">
      <Select
        isDisabled={!props.writeAccess}
        inputId={`${props.property.propertyName}-attributeName`}
        className="react-select-container"
        classNamePrefix="react-select"
        onChange={onSelectChange}
        value={{ label: props.property.propertyName, value: props.property.propertyName }}
        options={props.getOptions()}
      />
    </div>
    <div className="col-sm-6">
      <FormControl
        required
        disabled={!props.writeAccess}
        id={`${props.property.propertyName}`}
        value={props.value}
        placeholder={(props?.property?.level) ? "Set at "+props.property.level+ ": "+ props.property.original : ""}
        onChange={onTextChange}
      /></div>
    <div className="col-sm-1  align-self-end">
      <a href="" className="table-btn" onClick={removeClick}><FontIcon name="remove" />
      </a>
    </div>
  </div>
  {/* <Select 
        className="col"
        isDisabled={!props.writeAccess}
        inputId={`${props.property.propertyName}-attributeName`}
        classNamePrefix="react-select"
        onChange={onSelectChange}
        value={{ label: props.property.propertyName, value: props.property.propertyName }}
        options={props.getOptions()}
      />
      <FormControl className="col"
        required
        disabled={!props.writeAccess}
        id={`${props.property.propertyName}`}
        value={props.property.current}
        placeholder={props.property.original}
        onChange={onTextChange}
      />

    <div className="col">
      <a href="" className="table-btn" onClick={removeClick}><Glyphicon glyph="pencil" /></a>
    </div>
*/}

}
export default CustomRowAttributes;