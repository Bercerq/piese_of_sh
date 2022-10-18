
import * as React from "react";
import { NavLink } from "react-router-dom";
import { OverlayTrigger, Tooltip } from "react-bootstrap";

export interface MenuItemProps {
  id?: string,
  name: string;
  href: string;
  icon: string;
  child?: JSX.Element;
  showtooltip?: boolean;
}

export const MenuItem = (props: MenuItemProps) => {
  const navLink = <NavLink activeClassName="active" className="nav-link ripple" to={props.href} >
    <i className={props.icon} aria-hidden="true"></i>
    {props.child}
    {props.name}
  </NavLink>;

  if (props.showtooltip) {
    return <OverlayTrigger placement="right" overlay={<Tooltip id={`tooltip-${props.id}`}>{props.name}</Tooltip>}>{navLink}</OverlayTrigger>;
  } else {
    return navLink;
  }
}