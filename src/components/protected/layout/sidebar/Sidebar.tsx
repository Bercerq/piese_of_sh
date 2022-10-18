import React, { FunctionComponent } from "react";
import { Nav, Navbar } from "react-bootstrap";
import { MenuItem, MenuItemProps } from "./MenuItem";
import FontIcon from "../../../UI/FontIcon";

const LogoContainer = () => {
  return <a className="theme-adsciencelogo-container" href="">
    <div className="ortec-logo"></div>
    <div className="adscience-logo"></div>
  </a>;
}

interface SidebarProps {
  items: MenuItemProps[];
  open: boolean;
  onClick: () => void;
}

const Sidebar: FunctionComponent<SidebarProps> = (props) => {
  const openClass = props.open ? '' : ' mini';
  const expandClass = props.open ? 'fa fa-angle-double-left' : 'fa fa-angle-double-right';

  const sideBarClick = (e) => {
    const viewportWidth = window.innerWidth || document.documentElement.clientWidth;
    if (viewportWidth > 992 && !e.target.closest(".nav-link")) {
      props.onClick();
    }
  }

  return <div className={"sidebar clickable" + openClass} onClick={sideBarClick}>
    <Navbar expand="lg">
      <LogoContainer />
      <Navbar.Toggle aria-controls="basic-navbar-nav">
        <FontIcon names={["bars", "lg"]} />
      </Navbar.Toggle>
      <Navbar.Collapse id="basic-navbar-nav">
        <Nav as="ul">
          {
            props.items.map((item, i) => <Nav.Item key={i} as="li"><MenuItem {...item} /></Nav.Item>)
          }
        </Nav>
        <LogoContainer />
      </Navbar.Collapse>
      <div className="sidebar-expand" onClick={sideBarClick}>
        <i className={expandClass} aria-hidden="true"></i>
      </div>
    </Navbar>
  </div>
}

export default Sidebar;