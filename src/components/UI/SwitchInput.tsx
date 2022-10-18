import React from "react";

interface SwitchInputProps {
  id: string;
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

const SwitchInput = (props: SwitchInputProps) => {
  return <div className="switch-input-group">
    <input
      type="checkbox"
      className="switch-input"
      id={props.id}
      name={props.id}
      checked={props.checked}
      onChange={(e) => { props.onChange(e.target.checked) }}
    />
    <label htmlFor={props.id} className="switch-label">
      {props.label} <span className="toggle--on">on</span><span className="toggle--off">off</span>
    </label>
  </div>;
}
export default SwitchInput;