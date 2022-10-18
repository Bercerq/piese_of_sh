import React, { useState, useRef, useContext, useEffect } from "react";
import { useParams, useHistory } from "react-router-dom";
import { Button } from "react-bootstrap";
import Select from "react-select";
import * as _ from "lodash";
import NotificationSystem from "react-notification-system";
import * as NotificationOptions from "../../../../client/NotificationOptions";
import * as Api from "../../../../client/Api";
import * as Helper from "../../../../client/Helper";
import * as Roles from "../../../../modules/Roles";
import { ScopeDataContextType, Rights, LookUp, QsContextType, BreadcrumbContextType } from "../../../../models/Common";
import { AppUser } from "../../../../models/AppUser";
import UserContext from "../../context/UserContext";
import ScopeDataContext from "../../context/ScopeDataContext";
import FontIcon from "../../../UI/FontIcon";
import Loader from "../../../UI/Loader";
import ErrorContainer from "../../../UI/ErrorContainer";
import { ScopeType, GroupOption } from "../../../../client/schemas";
import ListsTable from "./ListsTable";
import { List, ListRow } from "../../../../models/data/List";
import CampaignLinksModal from "../../shared/CampaignLinksModal";
import Confirm from "../../../UI/Confirm";
import ListModal from "./ListModal";
import QsContext from "../../context/QsContext";
import BreadcrumbContext from "../../context/BreadcrumbContext";

const ListsPageBody = () => {
  let history = useHistory();
  let query = new URLSearchParams(location.search);
  let params: { scope?, scopeId?} = useParams();
  let scope = params.scope as ScopeType;
  let scopeId = params.scopeId;
  let { data } = useContext<ScopeDataContextType>(ScopeDataContext);
  const rights: Rights = Roles.getRights(data.rights);
  const user: AppUser = useContext<AppUser>(UserContext);
  let { items } = useContext<BreadcrumbContextType>(BreadcrumbContext);
  let { listattribute, updateListattribute } = useContext<QsContextType>(QsContext);

  const [lists, setLists] = useState<List[]>([]);
  const [attributeOptions, setAttributeOptions] = useState<GroupOption[]>([]);
  const [attributeDisplayName, setAttributeDisplayName] = useState<string>("");
  const [acceptAnyValue, setAcceptAnyValue] = useState<boolean>(false);
  const [showEditModal, setShowEditModal] = useState<boolean>(false);
  const [editList, setEditList] = useState<List>(null);
  const [showLoader, setShowLoader] = useState<boolean>(false);
  const [campaignsModalTitle, setCampaignsModalTitle] = useState<string>("");
  const [showCampaignsModal, setShowCampaignsModal] = useState<boolean>(false);
  const [campaigns, setCampaigns] = useState<LookUp[]>([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<boolean>(false);
  const [deleteId, setDeleteId] = useState<number>(-1);
  const [filtersCounter, setFiltersCounter] = useState<number>(0);
  const [error, setError] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>("");

  const notificationSystem = useRef<NotificationSystem.System>(null);
  const controller = useRef<AbortController>(null);

  useEffect(() => {
    if (!query.get("listattribute")) {
      history.push(`/lists/${scope}/${scopeId}?listattribute=${listattribute}`);
    }
  }, []);
  useEffect(() => { loadAttributes() }, []);
  useEffect(() => { setShowLoader(true); }, [scope, scopeId]);
  useEffect(() => { loadData() }, [showLoader, listattribute]);

  async function loadData() {
    if (showLoader && listattribute !== "") {
      try {
        unload();
        controller.current = new AbortController();
        const scopedParam = Helper.scopedParam({ scope, scopeId });
        const qs = _.assign({}, scopedParam, { attribute: listattribute });
        const lists: List[] = await Api.Get({ path: "/api/lists", qs, signal: controller.current.signal });
        setLists(lists);
        setError(false);
        setErrorMessage("");
      } catch (err) {
        if (err.name === "AbortError") {
          setError(false);
          setErrorMessage("");
        } else {
          setError(true);
          setErrorMessage("Error loading lists.");
        }
      }
      setShowLoader(false);
    }
  }

  function unload() {
    if (controller.current) {
      controller.current.abort();
    }
  }

  async function loadAttributes() {
    try {
      const attributesObj = await Api.Get({ path: "/api/attributes/lists" });
      const attributeOptions = Helper.attributeOptions(attributesObj);
      if (listattribute === "") {
        const attribute = Helper.firstGroupSelectOption(attributeOptions);
        const attributeDisplayName = attribute.label;
        const attributeName = attribute.value as string;
        const acceptAnyValue = attribute.acceptAnyValue as boolean;

        updateAttribute(attributeName);
        setAttributeOptions(attributeOptions);
        setAttributeDisplayName(attributeDisplayName);
        setAcceptAnyValue(acceptAnyValue);
      } else {
        const attribute = Helper.findGroupSelectOption(attributeOptions, listattribute);
        const attributeDisplayName = attribute.label;
        const acceptAnyValue = attribute.acceptAnyValue as boolean;

        setAttributeOptions(attributeOptions);
        setAttributeDisplayName(attributeDisplayName);
        setAcceptAnyValue(acceptAnyValue);
      }
    } catch (err) {
      console.log(err);
    }
  }

  function updateAttribute(attribute: string) {
    query.set("listattribute", attribute);
    updateListattribute(attribute);
    history.push(`${location.pathname}?${query.toString()}`);
  }

  const addClick = () => {
    setShowEditModal(true);
    setEditList(null);
  }

  const editClick = (editId: number) => {
    const editList = lists.find((o) => { return o.id === editId });
    setEditList(editList);
    setShowEditModal(true);
  }

  const deleteClick = (deleteId: number) => {
    setDeleteId(deleteId);
    setShowDeleteConfirm(true);
  }

  const campaignsClick = (campaigns: LookUp[], row: ListRow) => {
    setShowCampaignsModal(true);
    setCampaignsModalTitle(`Campaigns using list: ${row.name}`);
    setCampaigns(campaigns);
  }

  const campaignsModalClose = () => {
    setShowCampaignsModal(false);
    setCampaignsModalTitle("");
    setCampaigns([]);
  }

  const attributeChange = async (selected) => {
    const attributeDisplayName = selected.label;
    const attributeName = selected.value;
    const acceptAnyValue = selected.acceptAnyValue as boolean;

    updateAttribute(attributeName);
    setAttributeDisplayName(attributeDisplayName);
    setAcceptAnyValue(acceptAnyValue);
    setShowLoader(true);
  }

  const deleteList = async () => {
    try {
      await Api.Delete({ path: `/api/lists/${deleteId}` });
      setShowDeleteConfirm(false);
      setShowLoader(true);
      notificationSystem.current.addNotification(NotificationOptions.success("List deleted", false));
    } catch (err) {
      setShowDeleteConfirm(false);
      setShowLoader(false);
      notificationSystem.current.addNotification(NotificationOptions.error("Error deleting list."));
    }
  }

  const handleSubmit = async (id: number, list: List) => {
    if (id > 0) {
      await updateList(id, list);
    } else {
      await addList(list);
    }
  }

  async function addList(list: List) {
    try {
      const newList: List = _.pick(list, "scope", "name", "description", "attributeValues", "attribute");
      await Api.Post({ path: "/api/lists", body: newList });
      setShowEditModal(false);
      setShowLoader(true);
      notificationSystem.current.addNotification(NotificationOptions.success(<span>List <strong>{list.name}</strong> created.</span>, false));
    } catch (err) {
      setShowEditModal(false);
      notificationSystem.current.addNotification(NotificationOptions.error("Error creating list."));
    }
  }

  async function updateList(id: number, list: List) {
    try {
      await Api.Put({ path: `/api/lists/${id}`, body: list });
      setShowEditModal(false);
      setEditList(null);
      setShowLoader(true);
      notificationSystem.current.addNotification(NotificationOptions.success(<span>List <strong>{list.name}</strong> saved.</span>, false));
    } catch (err) {
      setShowEditModal(false);
      setEditList(null);
      notificationSystem.current.addNotification(NotificationOptions.error("Error updating list."));
    }
  }

  function renderDeleteConfirmBody() {
    const listRows = getListRows();
    const list = listRows.find((l) => { return l.id === deleteId });
    const activeCampaigns = _.get(list, "activeCampaignIds", []);
    if (activeCampaigns.length === 1) {
      return <div>Deleting this list also removes it from <b><u><a onClick={(e) => { e.preventDefault(); campaignsClick(activeCampaigns, list) }} href="">1 campaign </a></u></b>.</div>;
    } else if (activeCampaigns.length > 1) {
      return <div>Deleting this list also removes it from <b><u><a onClick={(e) => { e.preventDefault(); campaignsClick(activeCampaigns, list) }} href="">{activeCampaigns.length} campaigns</a></u></b>.</div>;
    }
    return null;
  }

  function getListRows(): ListRow[] {
    return lists.map((o) => {
      const listRow = _.pick(o, ["id", "name", "description", "writeAccess", "activeCampaignIds", "inactiveCampaignIds", "creationDate", "lastEdit"]);
      return _.assign({}, listRow, { owner: _.get(o, "scope.owner") });
    });
  }

  if (!error) {
    const attributeValue = Helper.findGroupSelectOption(attributeOptions, listattribute) as any;
    const listRows = getListRows();
    const maxLevel = Helper.getMaxLevel(user, items);
    return <div className="row">
      <div className="col-sm-12 pt-3">
        <div className="card mb-2">
          <h3 className="pull-left">Lists</h3>
          <Button size="sm" variant="primary" className="pull-right" onClick={() => { setFiltersCounter(filtersCounter + 1) }}><FontIcon name="remove" /> CLEAR FILTERS</Button>
          {rights.MANAGE_LISTS &&
            <Button size="sm" variant="primary" className="pull-right mr-2" onClick={addClick}><FontIcon name="plus" /> ADD LIST</Button>}
          <div className="pull-right width-200 mr-2" style={{ marginTop: "-3px" }}>
            <Select
              inputId="react-select-list-attribute"
              className="react-select-container"
              classNamePrefix="react-select"
              name="attribute-select"
              value={attributeValue}
              clearable={false}
              onChange={attributeChange}
              options={attributeOptions}
            />
          </div>
          <Loader visible={showLoader} />
          {!showLoader &&
            <ListsTable
              records={listRows}
              user={user}
              writeAccess={rights.MANAGE_LISTS}
              filtersCounter={filtersCounter}
              editClick={editClick}
              deleteClick={deleteClick}
              campaignsClick={campaignsClick}
            />
          }
          <CampaignLinksModal
            title={campaignsModalTitle}
            show={showCampaignsModal}
            campaigns={campaigns}
            tab="general"
            onClose={campaignsModalClose}
          />
          <ListModal
            show={showEditModal}
            list={editList}
            attribute={listattribute}
            attributeDisplayName={attributeDisplayName}
            acceptAnyValue={acceptAnyValue}
            rights={rights}
            scope={scope}
            scopeId={scopeId}
            maxLevel={maxLevel}
            onClose={() => { setShowEditModal(false) }}
            onSubmit={handleSubmit}
          />
          <Confirm
            message="Are you sure you want to delete this list?"
            show={showDeleteConfirm}
            onClose={() => setShowDeleteConfirm(false)}
            onConfirm={deleteList}
          >{renderDeleteConfirmBody()}</Confirm>
          <NotificationSystem ref={notificationSystem} />
        </div>
      </div>
    </div>;
  } else {
    return <div className="row">
      <div className="col-sm-12 pt-3">
        <div className="card">
          <h3><ErrorContainer message={errorMessage} /></h3>
        </div>
      </div>
    </div>;
  }
}
export default ListsPageBody;