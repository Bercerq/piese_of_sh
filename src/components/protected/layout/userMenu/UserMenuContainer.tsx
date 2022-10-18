import React, { useContext, useState, useRef, Fragment } from "react";
import { useHistory } from "react-router-dom";
import * as Api from "../../../../client/Api";
import { AppUser, UserRoleInfo } from "../../../../models/AppUser";
import UserMenu from "./UserMenu";
import ChangePasswordModal from "./ChangePasswordModal";
import Add2FAModal from "./Add2FAModal";
import UserContext from "../../context/UserContext";
import NotificationSystem from "react-notification-system";
import * as NotificationOptions from "../../../../client/NotificationOptions";

const UserMenuContainer = () => {
  const user: AppUser = useContext<AppUser>(UserContext);
  const userRoleKey = user.email + "-role";
  const pages: UserRoleInfo[] = user.pages || [];
  let history = useHistory();

  const [show, setShow] = useState<boolean>(false);
  const [show2fa, setShow2fa] = useState<boolean>(false);


  const notificationSystem = useRef<NotificationSystem.System>(null);

  const handleSelect = async (eventKey, event) => {
    console.log(user);
    if (eventKey === "change-password") {
      setShow(true);
    } else if (eventKey === "add-2fa") {
      setShow2fa(true);
    }
      else {
      const index: number = parseInt(eventKey, 10);
      const page = pages[index];
      const mainRole = user.roles.find((r) => { return r.level === page.level && r.entityId === page.entityId });
      if (mainRole) {
        localStorage.setItem(userRoleKey, JSON.stringify(mainRole));
        const body = { key: userRoleKey, value: mainRole };
        await Api.Post({ path: "/session", body });
      }
      history.push(getHref(page));
    }
  }

  const handleSubmit = async (body) => {
    try {
      await Api.Post({ path: "/api/users/password", body });
      setShow(false);
      notificationSystem.current.addNotification(NotificationOptions.success("User's password changed.", false));
    } catch (err) {
      console.log(err);
      notificationSystem.current.addNotification(NotificationOptions.error("Error updating user's password."));
    }
  }
  const handle2FASubmit = async (body) => {
    try {
      await Api.Post({path: "/api/users/twofactor", body});
      setShow2fa(false);
      notificationSystem.current.addNotification(NotificationOptions.success("Two factor authentication added to your account", false));
    } catch (err) {
      console.log(err);
      notificationSystem.current.addNotification(NotificationOptions.error("Error setting two factor authentication for user"));
    }
    console.log(body);
  }

  const getHref = (page: UserRoleInfo) => {
    if (page.level === "publisher") {
      return `/analytics/${page.level}/${page.entityId}`;
    } else {
      return `/settings/${page.level}/${page.entityId}`;
    }
  }

  const handleClose = () => { setShow(false); }

  const handle2FAClose = () => { setShow2fa(false); }

  return <Fragment>
    <UserMenu email={user.email} pages={pages} onSelect={handleSelect} />
    <ChangePasswordModal show={show} onClose={handleClose} onSubmit={handleSubmit} />
    <Add2FAModal email={user.email} show={show2fa} twoFactorEnabled={user.twoFactorEnabled} onClose={handle2FAClose} onSubmit={handle2FASubmit} />
    <NotificationSystem ref={notificationSystem} />
  </Fragment>;
}

export default UserMenuContainer;