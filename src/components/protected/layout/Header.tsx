import * as React from "react";
import UserMenuContainer from "./userMenu/UserMenuContainer";
import Search from "./Search";
import AlertsPopoverContainer from "./alerts/AlertsPopoverContainer";
import KbLink from "./KbLink";

const Header = () => {
  return <header className="header">
    <div>
      <a className="theme-logo-container" href="/">
        <div className="theme-logo"></div>
      </a>
      <a className="adscience-logo-container" href="/">
        <div className="ortec-logo"></div>
        <div className="adscience-logo"></div>
      </a>
    </div>
    <div className="flex">
      <div className="header-search-container"><Search /></div>
      <KbLink />
      <AlertsPopoverContainer />
      <UserMenuContainer />
    </div>
  </header>;
}

export default Header;