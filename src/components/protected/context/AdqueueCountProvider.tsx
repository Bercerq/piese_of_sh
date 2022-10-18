import React, { useState, useEffect, useContext, FunctionComponent, ReactNode } from 'react';
import { useParams } from "react-router-dom";
import * as Api from "../../../client/Api";
import { AppUser } from "../../../models/AppUser";
import UserContext from "../context/UserContext";
import AdqueueCountContext from "./AdqueueCountContext";
import { PageType, ScopeType } from "../../../client/schemas";

const AdqueueCountProvider: FunctionComponent<ReactNode> = (props) => {
  let params: { page?, scope?, scopeId?} = useParams();
  let page = params.page as PageType;
  let scope = params.scope as ScopeType;
  let scopeId = params.scopeId;
  const user: AppUser = useContext<AppUser>(UserContext);
  const [adqueueCount, setAdqueueCount] = useState<number>(0);

  useEffect(() => { loadAdqueue(); }, [page, scope, scopeId]);

  async function loadAdqueue() {
    if (user.isRootAdmin) {
      try {
        const res = await Api.Get({ path: "/api/ads/adqueue-count" });
        setAdqueueCount(res.count);
      } catch (err) {
        console.log(err);
        setAdqueueCount(0);
      }
    }
  }

  function updateAdqueueCount(count: number) {
    setAdqueueCount(count);
  }

  return <AdqueueCountContext.Provider value={{ adqueueCount, updateAdqueueCount }}>
    {props.children}
  </AdqueueCountContext.Provider>;
}

export default AdqueueCountProvider;