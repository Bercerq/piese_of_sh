import React, { useState, useEffect, FunctionComponent, ReactNode } from 'react';
import { useParams } from "react-router-dom";
import * as Api from "../../../client/Api";
import { PageType, ScopeType, ValidationError } from "../../../client/schemas";
import { NavigationItem } from '../../../models/data/NavigationItem';
import BreadcrumbContext from './BreadcrumbContext';

const BreadcrumbProvider: FunctionComponent<ReactNode> = (props) => {
  let params: { page?, scope?, scopeId?} = useParams();
  let page = params.page as PageType;
  let scope = params.scope as ScopeType;
  let scopeId = params.scopeId;
  const [items, setItems] = useState<NavigationItem[]>([]);
  const [loadError, setLoadError] = useState<ValidationError>({ error: true, message: "" });

  useEffect(() => { loadData(); }, [page, scope, scopeId]);

  async function loadData() {
    try {
      if (scope === "root") {
        setItems([]);
      } else {
        const items = await Api.Get({ path: `/api/frontend/navigation/${page}/${scope}/${scopeId}` });
        setItems(items);
      }
      setLoadError({ error: false, message: "" });
    } catch (err) {
      console.log(err);
      setItems([]);
      setLoadError({ error: true, message: "Error loading data." });
    }
  }

  return <BreadcrumbContext.Provider value={{ items, loadError }}>
    {props.children}
  </BreadcrumbContext.Provider>;
}

export default BreadcrumbProvider;