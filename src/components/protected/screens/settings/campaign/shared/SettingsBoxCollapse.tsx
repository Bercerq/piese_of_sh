import React, { FunctionComponent, useState } from "react";
import { Collapse } from "react-bootstrap";
import FontIcon from "../../../../../UI/FontIcon";

interface SettingsBoxCollapseProps {
  title: string;
  open: boolean;
  onClick: () => void;
}

const SettingsBoxCollapse: FunctionComponent<SettingsBoxCollapseProps> = (props) => {
  const collapseHeaderClick = (e) => {
    e.preventDefault();
    props.onClick();
  }

  return <div className="card mb-2">
    <a className="collapse-header" href="" onClick={collapseHeaderClick} aria-expanded={props.open}><FontIcon name={props.open ? "chevron-up" : "chevron-down"} />
      <h5 className="px-1">{props.title}</h5>
    </a>
    <Collapse in={props.open}>
      <div>
        {props.children}
      </div>
    </Collapse>
  </div>;
}

export default SettingsBoxCollapse;