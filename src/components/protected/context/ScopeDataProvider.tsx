import React, { useState, useEffect, FunctionComponent, ReactNode, useRef, useContext } from 'react';
import { useParams } from "react-router-dom";
import * as Api from "../../../client/Api";
import { ScopeData } from "../../../models/Common";
import ScopeDataContext from "./ScopeDataContext";
import { PageType, ScopeType, ValidationError } from "../../../client/schemas";
import { AppUser } from '../../../models/AppUser';
import UserContext from './UserContext';

const ScopeDataProvider: FunctionComponent<ReactNode> = (props) => {
  let params: { page?, scope?, scopeId?} = useParams();
  let page = params.page as PageType;
  let scope = params.scope as ScopeType;
  let scopeId = params.scopeId;
  const user: AppUser = useContext<AppUser>(UserContext);
  
  const [data, setData] = useState<ScopeData>({ rights: [] });
  const [loading, setLoading] = useState<boolean>(true);
  const [reload, setReload] = useState<boolean>(false);
  const [loadError, setLoadError] = useState<ValidationError>({ error: true, message: "" });

  const controller = useRef<AbortController>(null);

  useEffect(() => { return unload; }, []);
  useEffect(() => { loadData(); }, [page, scope, scopeId]);
  useEffect(() => {
    if (reload) {
      loadData();
    }
  }, [reload]);

  async function loadData() {
    setLoading(true);
    try {
      unload();
      controller.current = new AbortController();
      let data: ScopeData = { rights: [] };
      if (scope === "root") {
        if (user.isRootAdmin) {
          data = {
            rights: [
              "VIEW_PUBLISHER",
              "MANAGE_PUBLISHER",
              "VIEW_ORGANIZATION",
              "MANAGE_ORGANIZATION",
              "VIEW_AGENCY",
              "MANAGE_AGENCY",
              "CREATE_ADVERTISER",
              "VIEW_ADVERTISER",
              "MANAGE_ADVERTISER",
              "VIEW_CAMPAIGNGROUP",
              "MANAGE_CAMPAIGNGROUP",
              "VIEW_CAMPAIGN",
              "MANAGE_CAMPAIGN",
              "VIEW_FINANCIALS",
              "VIEW_STATISTICS",
              "VIEW_USERS",
              "MANAGE_USERS",
              "VIEW_LISTS",
              "MANAGE_LISTS",
              "VIEW_DEALS",
              "MANAGE_DEALS",
              "VIEW_ADS",
              "MANAGE_ADS",
              "VIEW_SEGMENTS",
              "MANAGE_SEGMENTS",
              "SEARCH_NAMES",
              "MANAGE_PRESETS",
              "VIEW_PRESETS",
              "VIEW_REPORTS",
              "MANAGE_REPORTS",
              "VIEW_REPORT_TEMPLATES",
              "MANAGE_REPORT_TEMPLATES",
              "VIEW_FEEDS",
              "MANAGE_FEEDS",
            ]
          };
        } else {
          throw new Error("Error loading data.");
        }
      } else if (scope === "organization") {
        data = await Api.Get({ path: `/api/organizations/${scopeId}`, signal: controller.current.signal });
      } else if (scope === "publisher") {
        data = await Api.Get({ path: `/api/publishers/${scopeId}`, signal: controller.current.signal });
      } else if (scope === "agency") {
        data = await Api.Get({ path: `/api/agencies/${scopeId}`, signal: controller.current.signal });
      } else if (scope === "advertiser") {
        data = await Api.Get({ path: `/api/advertisers/${scopeId}`, signal: controller.current.signal });
      } else if (scope === "campaigngroup") {
        data = await Api.Get({ path: `/api/campaigngroups/${scopeId}`, signal: controller.current.signal });
      } else if (scope === "campaign" && page !== "settings") {
        data = await Api.Get({ path: `/api/campaigns/${scopeId}`, signal: controller.current.signal });
      } else if (scope === "campaign" && page === "settings") {
        data = await Api.Get({ path: `/api/campaigns/${scopeId}/settings`, signal: controller.current.signal });
      }
      setData(data);
      setLoadError({ error: false, message: "" });
    } catch (err) {
      if (err.name === "AbortError") {
        setLoadError({ error: false, message: "" });
      } else {
        setData({ rights: [] });
        setLoadError({ error: true, message: "Error loading data." });
      }
    }
    setLoading(false);
    setReload(false);
  }

  function unload() {
    if (controller.current) {
      controller.current.abort();
    }
  }

  function updateLoading(loading: boolean) {
    setLoading(loading);
  }

  function updateReload(reload: boolean) {
    setReload(reload);
  }

  return <ScopeDataContext.Provider value={{ data, loadError, loading, updateLoading, updateReload }}>
    {props.children}
  </ScopeDataContext.Provider>;
}

export default ScopeDataProvider;