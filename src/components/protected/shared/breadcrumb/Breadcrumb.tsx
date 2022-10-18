import React, { useContext, useState } from "react";
import { useParams, useHistory } from "react-router-dom";
import * as Api from "../../../../client/Api";
import * as breadcrumbHelper from "./breadcrumbHelper";
import * as Helper from "../../../../client/Helper";
import { BreadcrumbItem, BreadcrumbDropdownItem, PageType, ScopeType } from "../../../../client/schemas";
import BreadcrumbChild from "./BreadcrumbChild";
import UserContext from "../../context/UserContext";
import { BreadcrumbContextType } from "../../../../models/Common";
import { AppUser } from "../../../../models/AppUser";
import BreadcrumbContext from "../../context/BreadcrumbContext";

interface BreadcrumbProps {
  id: string;
  minScope: ScopeType;
}

const Breadcrumb = (props: BreadcrumbProps) => {
  const user: AppUser = useContext<AppUser>(UserContext);
  let { items } = useContext<BreadcrumbContextType>(BreadcrumbContext);
  let { page, scope, scopeId }: any = useParams();

  let history = useHistory();
  const breadcrumbItems = breadcrumbHelper.getItems(user, { page: page as PageType, scope: scope as ScopeType, scopeId: parseInt(scopeId, 10), minScope: props.minScope }, items);

  const [openIndex, setOpenIndex] = useState<number>(-1);
  const [loadingIndex, setLoadingIndex] = useState<number>(-1);
  const [dropdownItems, setDropdownItems] = useState<BreadcrumbDropdownItem[]>([]);

  const childClick = async (i: number) => {
    if (openIndex === i) {
      setOpenIndex(-1);
    } else {
      const item = breadcrumbItems[i];
      setOpenIndex(i);
      setLoadingIndex(i);
      const dropdownItems = await getDropdownItems(item);
      setLoadingIndex(-1);
      setDropdownItems(dropdownItems);
    }
  }

  const itemClick = (href: string) => {
    setOpenIndex(-1);
    history.push(href);
  }

  async function getDropdownItems(item: BreadcrumbItem): Promise<BreadcrumbDropdownItem[]> {
    try {
      const results = await Api.Get({ path: `/api/frontend/navigation/${page}/${scope}/${scopeId}/dropdown/${item.type}` });
      return results.map((o) => { return { id: o.id, label: o.name, type: item.type } });
    } catch (err) {
      return [];
    }
  }

  return <ol className="breadcrumb" id={props.id}>
    {
      breadcrumbItems.map((item, i) => <BreadcrumbChild
        key={i}
        user={user}
        page={page as PageType}
        scope={scope as ScopeType}
        item={item}
        open={openIndex === i}
        loading={loadingIndex === i}
        onClick={() => { childClick(i) }}
        itemClick={itemClick}
        outsideClick={() => setOpenIndex(-1)}
        dropdownItems={dropdownItems} />)
    }
  </ol>
}
export default Breadcrumb;