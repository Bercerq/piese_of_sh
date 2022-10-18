
import React, { FunctionComponent } from "react";
import { Dropdown } from "react-bootstrap";
import { UserRoleInfo } from "../../../../models/AppUser";
import FontIcon from "../../../UI/FontIcon";

const AToggle = (props) => {
  const handleClick = (e) => {
    e.preventDefault();
    props.onClick(e);
  }

  return <a className="dropdown-toggle" href="" onClick={handleClick}>{props.children}</a>
}

interface UserMenuProps {
  pages: UserRoleInfo[];
  email: string;
  onSelect: (eventKey, event) => void;
}

const UserMenu: FunctionComponent<UserMenuProps> = (props) => {
  const getText = (page: UserRoleInfo) => {
    if (page.level === "root") {
      return "Overview";
    } else {
      return `${page.level} : ${page.entityName} ( ${page.roleName} )`;
    }
  }

  return <Dropdown alignRight className="user-menu" onSelect={props.onSelect}>
    <Dropdown.Toggle as={AToggle} variant="success" id="dropdown-basic">
      <img className="user-image" src="/images/profile.jpg" alt="profile image" /> {props.email}
    </Dropdown.Toggle>
    <Dropdown.Menu>
      {
        props.pages.map((page, i) => <Dropdown.Item key={`dropdown-item-${i}`} eventKey={i.toString()}>{getText(page)}</Dropdown.Item>)
      }
      <Dropdown.Divider />
      <Dropdown.Item eventKey="change-password"><FontIcon name="lock" /> Change password</Dropdown.Item>
      <Dropdown.Item eventKey="add-2fa"><FontIcon name="mobile" /> Two Factor Authentication</Dropdown.Item>
      <a className="dropdown-item" href="/logout"><FontIcon name="sign-out" /> Logout</a>
    </Dropdown.Menu>
  </Dropdown>;
}

export default UserMenu;