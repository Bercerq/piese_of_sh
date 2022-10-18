import React, { FunctionComponent } from "react";

interface CheckboxProps {
  id: string;
  checked: boolean;
  disabled?: boolean;
  classes?: string;
  onChange: (checked: boolean) => void;
}

const Checkbox: FunctionComponent<CheckboxProps> = (props) => {
  const classNames = props.classes ? props.classes + " checkbox" : "checkbox";
  return <div className={classNames}>
    <label>
      <input type="checkbox" id={props.id} checked={props.checked} disabled={!!props.disabled} onChange={(e) => { props.onChange(e.target.checked) }} />
      <span></span> {props.children}
    </label>
  </div>;
}
export default Checkbox;