import React, { FunctionComponent } from "react";

interface SettingsBoxProps {
  title?: string;
}

const SettingsBox: FunctionComponent<SettingsBoxProps> = (props) => {
  return <div className="card mb-2">
    {props.title && <h5 className="px-1">{props.title}</h5>}
    {props.children}
  </div>;
}

export default SettingsBox;