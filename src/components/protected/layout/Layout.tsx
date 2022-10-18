import React, { useContext, useEffect, useState, Fragment } from "react";
import { useParams } from "react-router-dom";
import * as _ from "lodash";
import * as Roles from "../../../modules/Roles";
import Header from "./Header";
import Content from "./Content";
import Page from "./Page";
import { Rights, ScopeDataContextType, AdqueueCountContextType } from "../../../models/Common";
import ScopeDataContext from "../context/ScopeDataContext";
import AdqueueCountContext from "../context/AdqueueCountContext";
import { Organization } from "../../../models/data/Organization";
import { Agency } from "../../../models/data/Agency";
import { Advertiser } from "../../../models/data/Advertiser";
import { CampaignGroup } from "../../../models/data/CampaignGroup";
import { Campaign } from "../../../models/data/Campaign";
import { AppUser } from "../../../models/AppUser";
import UserContext from "../context/UserContext";
import { MenuItemProps } from "./sidebar/MenuItem";
import Sidebar from "./sidebar/Sidebar";
import Loader from "../../UI/Loader";
import AdBlockAlert from "../../shared/AdBlockAlert";
import { Publisher } from "../../../models/data/Publisher";

const Layout = () => {
  let { scope, scopeId }: any = useParams();
  let { data, loadError } = useContext<ScopeDataContextType>(ScopeDataContext);
  let { adqueueCount } = useContext<AdqueueCountContextType>(AdqueueCountContext);
  const theme = getTheme();
  const user: AppUser = useContext<AppUser>(UserContext);
  const rights: Rights = Roles.getRights(data.rights);
  const sidebarLocalStorageKey = user.email + "-sidebaropen";
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(true);
  const [showLoader, setShowLoader] = useState<boolean>(true);

  useEffect(loadTheme, [theme]);
  useEffect(initSidebar, []);
  useEffect(() => { setShowLoader(false); }, [loadError.error]);

  function getTheme() {
    let theme;
    if (scope === "root") {
      theme = "optout";
    } else if (scope === "organization") {
      theme = _.get(data as Organization, "organization.theme");
    } else if (scope === "publisher") {
      theme = _.get(data as Publisher, "publisher.theme");
    } else if (scope === "agency") {
      theme = _.get(data as Agency, "agency.theme");
    } else if (scope === "advertiser") {
      theme = _.get(data as Advertiser, "advertiser.theme");
    } else if (scope === "campaigngroup") {
      theme = _.get(data as CampaignGroup, "campaignGroup.theme");
    } else if (scope === "campaign") {
      theme = _.get(data as Campaign, "campaign.theme");
    }
    return theme;
  }

  function loadTheme() {
    if (theme) {
      document.getElementById("theme-css").setAttribute("href", `/css/main-${theme}.css`);
      setShowLoader(false);
    } else {
      setShowLoader(true);
    }
  }

  function initSidebar() {
    let sidebarOpen: boolean = true;
    try { sidebarOpen = JSON.parse(localStorage.getItem(sidebarLocalStorageKey)); } catch (ex) { sidebarOpen = true };
    setSidebarOpen(sidebarOpen);
  }

  const toggleSidebar = () => {
    const so = !sidebarOpen;
    setSidebarOpen(so);
    localStorage.setItem(sidebarLocalStorageKey, so.toString());
    setTimeout(() => {
      let resizeEvent: any = window.document.createEvent('UIEvents');
      resizeEvent.initUIEvent('resize', true, false, window, 0);
      window.dispatchEvent(resizeEvent);
    }, 200);
  }

  function getSidebarItems() {
    const showtooltip = !sidebarOpen;
    const showSettingsItem = showSettings();
    let minScope = scope;
    let minScopeId = scopeId;

    if (["campaigngroup", "campaign"].indexOf(scope) > -1) {
      minScope = "advertiser";
      minScopeId = _.get(data, "parents.advertiser.parentId");
    }

    let sidebarItems: MenuItemProps[] = [];

    if (showSettingsItem) {
      sidebarItems.push({
        id: "campaigns",
        name: "Campaigns",
        href: `/settings/${scope}/${scopeId}`,
        icon: "fa fa-bullhorn",
        showtooltip
      });
    }

    if (rights.VIEW_STATISTICS) {
      sidebarItems.push({
        id: "analytics",
        name: "Analytics",
        href: `/analytics/${scope}/${scopeId}`,
        icon: "fa fa-line-chart",
        showtooltip
      });
    }

    if (rights.VIEW_ADS) {
      sidebarItems.push({
        id: "advault",
        name: "Ad vault",
        href: `/advault/${minScope}/${minScopeId}`,
        icon: "fa fa-picture-o",
        showtooltip
      });
    }

    if (rights.VIEW_SEGMENTS) {
      sidebarItems.push({
        id: "segments",
        name: "Segments",
        href: `/segments/${minScope}/${minScopeId}`,
        icon: "fa fa-group",
        showtooltip
      });
    }

    if (rights.VIEW_LISTS) {
      sidebarItems.push({
        id: "lists",
        name: "Lists",
        href: `/lists/${minScope}/${minScopeId}`,
        icon: "fa fa-list",
        showtooltip
      });
    }

    if (rights.VIEW_DEALS) {
      sidebarItems.push({
        id: "deals",
        name: "Deals",
        href: `/deals/${minScope}/${minScopeId}`,
        icon: "fa fa-handshake-o",
        showtooltip
      });
    }
    if (rights.VIEW_FEEDS) {
      sidebarItems.push({
        id: "data-feeds",
        name: "Data Feeds",
        href: `/data-feeds/${minScope}/${minScopeId}`,
        icon: "fa fa-newspaper-o",
        showtooltip
      });
    }
    if (rights.VIEW_PUBLISHER_AD_SLOTS) {
      sidebarItems.push({
        id: "publisheradtags",
        name: "Ad slots",
        href: `/adslottags/${minScope}/${minScopeId}`,
        icon: "fa fa-outdent",
        showtooltip
      });
    }
    
    if (rights.VIEW_PUBLISHER_DEALS) {
      sidebarItems.push({
        id: "publisherdeals",
        name: "Publisher deals",
        href: `/publisherdeals/${minScope}/${minScopeId}`,
        icon: "fa fa-handshake-o",
        showtooltip
      });
    }

    if (rights.VIEW_REPORTS && scope !== "publisher" ) {
      sidebarItems.push({
        id: "reports",
        name: "Reports",
        href: `/reports/${scope}/${scopeId}`,
        icon: "fa fa-file-text-o",
        showtooltip
      });
    }

    if (rights.VIEW_REPORTS && scope === "publisher") {
      sidebarItems.push({
        id: "publisher-reports",
        name: "Reports",
        href: `/publisherreports/${minScope}/${minScopeId}`,
        icon: "fa fa-file-text-o",
        showtooltip
      });
    }

    if (rights.VIEW_REPORT_TEMPLATES  && scope !== "publisher") {
      sidebarItems.push({
        id: "report-templates",
        name: "Report templates",
        href: `/report-templates/${minScope}/${minScopeId}`,
        icon: "fa fa-file-o",
        child: <span className="menu-item-report-templates">T</span>,
        showtooltip
      });
    }

    if (rights.VIEW_REPORT_TEMPLATES && scope === "publisher") {
      sidebarItems.push({
        id: "publisher-reportTemplates",
        name: "Report templates",
        href: `/publisherreporttemplates/${minScope}/${minScopeId}`,
        icon: "fa fa-file-o",
        showtooltip
      });
    }

    if (rights.VIEW_USERS) {
      sidebarItems.push({
        id: "users",
        name: "Users",
        href: `/users/${minScope}/${minScopeId}`,
        icon: "fa fa-user",
        showtooltip
      });
    }

    if (scope !== "publisher") {
      sidebarItems.push({
        id: "changelog",
        name: "Change log",
        href: `/changelog/${scope}/${scopeId}`,
        icon: "fa fa-history",
        showtooltip
      });
    }

    if (user.isRootAdmin) {
      sidebarItems.push({
        id: "adqueue",
        name: "Ad queue",
        href: `/adqueue/${minScope}/${minScopeId}`,
        icon: "fa fa-sort-amount-asc",
        child: <span className="menu-item-badge">{adqueueCount.toString()}</span>,
        showtooltip
      });
    }

    return sidebarItems;
  }

  function showSettings() {
    if (scope === "root") {
      return rights.VIEW_CAMPAIGN || rights.VIEW_CAMPAIGNGROUP || rights.VIEW_ADVERTISER || rights.VIEW_AGENCY || rights.VIEW_PUBLISHER;
    } else if (scope === "organization") {
      return rights.VIEW_CAMPAIGN || rights.VIEW_CAMPAIGNGROUP || rights.VIEW_ADVERTISER || rights.VIEW_AGENCY;
    } else if (scope === "agency") {
      return rights.VIEW_CAMPAIGN || rights.VIEW_CAMPAIGNGROUP || rights.VIEW_ADVERTISER;
    } else if (scope === "advertiser") {
      return rights.VIEW_CAMPAIGN || rights.VIEW_CAMPAIGNGROUP;
    } else {
      return rights.VIEW_CAMPAIGN;
    }
  }

  return <Fragment>
    <Loader visible={showLoader} loaderClass="page-loading" />
    {!showLoader && <Fragment>
      <Header />
      <Sidebar open={sidebarOpen} onClick={toggleSidebar} items={getSidebarItems()} />
      <Content open={sidebarOpen}>
        <Page />
      </Content>
    </Fragment>
    }
    <AdBlockAlert />
  </Fragment>
}

export default Layout;