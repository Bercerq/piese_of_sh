import React, { useState, useEffect, FunctionComponent, ReactNode } from "react";
import { useParams } from "react-router-dom";
import * as Api from "../../../client/Api";
import * as Helper from "../../../client/Helper";
import PresetsContext from "./PresetsContext";
import { PageType, ScopeType } from "../../../client/schemas";
import { Preset } from '../../../models/data/Preset';
import { Scope } from '../../../models/Common';

const PresetsProvider: FunctionComponent<ReactNode> = (props) => {
  let params: { page?, scope?, scopeId?} = useParams();
  let page = params.page as PageType;
  let scope = params.scope as ScopeType;
  let scopeId = params.scopeId;
  const [presets, setPresets] = useState<Preset[]>([]);

  useEffect(() => { loadData(); }, [page, scope, scopeId]);

  async function loadData() {
    if (page === "settings" || page === "analytics") {
      try {
        let options: { scope: Scope, scopeId?: number } = { scope: Helper.getSourceScope(scope) };
        if (scope !== "root") options.scopeId = parseInt(scopeId, 10);

        const presets = await Api.Get({ path: "/api/presets", qs: options });
        setPresets(presets);
      } catch (err) {
        console.log(err);
        setPresets([]);
      }
    }
  }

  return <PresetsContext.Provider value={presets}>
    {props.children}
  </PresetsContext.Provider>;
}

export default PresetsProvider;