import React, { useState, useRef, useContext, useEffect, Fragment } from "react";
import { useParams } from "react-router-dom";
import { Button } from "react-bootstrap";
import * as _ from "lodash";
import NotificationSystem from "react-notification-system";
import * as NotificationOptions from "../../../../client/NotificationOptions";
import * as Api from "../../../../client/Api";
import * as Helper from "../../../../client/Helper";
import * as Roles from "../../../../modules/Roles";
import { ScopeDataContextType, Rights, LookUp, BreadcrumbContextType } from "../../../../models/Common";
import { AppUser } from "../../../../models/AppUser";
import UserContext from "../../context/UserContext";
import ScopeDataContext from "../../context/ScopeDataContext";
import FontIcon from "../../../UI/FontIcon";
import Loader from "../../../UI/Loader";
import ErrorContainer from "../../../UI/ErrorContainer";
import { ScopeType, SelectOption } from "../../../../client/schemas";
import DealsTable from "./DealsTable";
import { Deal, DealRow, DealRequest } from "../../../../models/data/Deal";
import CampaignLinksModal from "../../shared/CampaignLinksModal";
import Confirm from "../../../UI/Confirm";
import DealModal from "./DealModal";
import DealRequestModal from "./DealRequestModal";
import { Attributes } from "../../../../modules/Enums";
import BreadcrumbContext from "../../context/BreadcrumbContext";

const DealsPageBody = () => {
  let params: { scope?, scopeId?} = useParams();
  let scope = params.scope as ScopeType;
  let scopeId = params.scopeId;
  let { data } = useContext<ScopeDataContextType>(ScopeDataContext);
  const rights: Rights = Roles.getRights(data.rights);
  const user: AppUser = useContext<AppUser>(UserContext);
  let { items } = useContext<BreadcrumbContextType>(BreadcrumbContext);

  const [deals, setDeals] = useState<Deal[]>([]);
  const [showEditModal, setShowEditModal] = useState<boolean>(false);
  const [showRequestModal, setShowRequestModal] = useState<boolean>(false);
  const [sspOptions, setSspOptions] = useState<SelectOption[]>([]);
  const [requestSspOptions, setRequestSspOptions] = useState<SelectOption[]>([]);
  const [editDeal, setEditDeal] = useState<Deal>(null);
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

  useEffect(() => { return unload; }, []);
  useEffect(() => { loadSspOptions(); loadRequestSspOptions(); }, []);
  useEffect(() => { setShowLoader(true); }, [scope, scopeId]);
  useEffect(() => { loadData() }, [showLoader]);

  async function loadData() {
    if (showLoader) {
      try {
        unload();
        controller.current = new AbortController();
        const qs = Helper.scopedParam({ scope, scopeId });
        const deals: Deal[] = await Api.Get({ path: "/api/deals", qs, signal: controller.current.signal });
        setDeals(deals);
        setError(false);
        setErrorMessage("");
      } catch (err) {
        setError(true);
        setErrorMessage("Error loading deals.");
      }
      setShowLoader(false);
    }
  }

  function unload() {
    if (controller.current) {
      controller.current.abort();
    }
  }

  async function loadSspOptions() {
    try {
      const options = {
        substrings: "",
        start: 0,
        count: 5000
      };

      const ssps = await Api.Get({ path: `/api/attributes/${Attributes.SSP}/values`, qs: options });
      const sspOptions = ssps.map((o) => { return { value: o.value, label: o.name } });
      setSspOptions(sspOptions);
    } catch (err) {
      console.log(err);
    }
  }

  async function loadRequestSspOptions() {
    try {
      const requestSsps = await Api.Get({ path: "/api/publishers/names" });
      const requestSspOptions = requestSsps.map((o) => { return { value: o.sspName, label: o.name } });
      setRequestSspOptions(requestSspOptions);
    } catch (err) {
      console.log(err);
    }
  }

  async function addDeal(deal: Deal) {
    try {
      const newDeal: Deal = _.pick(deal, "scope", "externalId", "name", "ssp", "description", "expirationDate", "escalationDeal");
      await Api.Post({ path: "/api/deals", body: newDeal });
      setShowEditModal(false);
      setShowLoader(true);
      notificationSystem.current.addNotification(NotificationOptions.success(<span>Deal <strong>{deal.name}</strong> created.</span>, false));
    } catch (err) {
      setShowEditModal(false);
      notificationSystem.current.addNotification(NotificationOptions.error("Error creating deal."));
    }
  }

  async function updateDeal(id: number, deal: Deal) {
    try {
      await Api.Put({ path: "/api/deals/" + id, body: deal });
      setShowEditModal(false);
      setShowLoader(true);
      setEditDeal(null);
      notificationSystem.current.addNotification(NotificationOptions.success(<span>Deal <strong>{deal.name}</strong> saved.</span>, false));
    } catch (err) {
      setShowEditModal(false);
      setShowLoader(false);
      setEditDeal(null);
      notificationSystem.current.addNotification(NotificationOptions.error("Error updating deal."));
    }
  }

  function getDealRows(deals: Deal[]): DealRow[] {
    return deals.map((o) => {
      const dealRow = _.pick(o, ["id", "name", "status", "description", "writeAccess", "activeCampaignIds", "creationDate", "expirationDate"]);
      const sspOption = sspOptions.find((option) => { return option.value === o.ssp });
      const ssp = _.get(sspOption, "label", o.ssp);
      const externalId = o.escalationDeal ? [o.externalId, o.escalationDeal].join(" / ") : o.externalId;
      const owner = _.get(o, "scope.owner");
      return _.assign({}, dealRow, { owner, externalId, ssp });
    });
  }

  const editClick = (editId: number) => {
    const editDeal = deals.find((o) => { return o.id === editId });
    setEditDeal(editDeal);
    setShowEditModal(true);
  }

  const deleteClick = (deleteId: number) => {
    setDeleteId(deleteId);
    setShowDeleteConfirm(true);
  }

  const campaignsClick = (campaigns: LookUp[], row: DealRow) => {
    setShowCampaignsModal(true);
    setCampaignsModalTitle(`Campaigns using deal: ${row.name}`);
    setCampaigns(campaigns);
  }

  const campaignsModalClose = () => {
    setShowCampaignsModal(false);
    setCampaignsModalTitle("");
    setCampaigns([]);
  }

  const handleSubmit = async (id: number, deal: Deal) => {
    if (id > 0) {
      await updateDeal(id, deal);
    } else {
      await addDeal(deal);
    }
  }

  const handleRequestSubmit = async (dealRequest: DealRequest) => {
    try {
      await Api.Post({ path: "/api/deals/request", body: dealRequest });
      setShowRequestModal(false);
      setShowLoader(true);
      const dealRequestName = _.get(dealRequest, "buyerSideDeal.name", "");
      notificationSystem.current.addNotification(NotificationOptions.success(<span>Deal <strong>{dealRequestName}</strong> requested.</span>, false));
    } catch (err) {
      setShowRequestModal(false);
      setShowLoader(false);
      notificationSystem.current.addNotification(NotificationOptions.error("Error requesting deal."));
    }
  }

  const deleteDeal = async () => {
    try {
      await Api.Delete({ path: `/api/deals/${deleteId}` });
      setShowDeleteConfirm(false);
      setShowLoader(true);
      notificationSystem.current.addNotification(NotificationOptions.success("Deal deleted.", false));
    } catch (err) {
      setShowDeleteConfirm(false);
      setShowLoader(false);
      notificationSystem.current.addNotification(NotificationOptions.error("Error deleting deal."));
    }
  }

  function renderDeleteConfirmBody() {
    const dealRows = getDealRows(deals);
    const deal = dealRows.find((deal) => { return deal.id === deleteId });
    const activeCampaigns = _.get(deal, "activeCampaignIds", []);
    if (activeCampaigns.length === 1) {
      return <div>Deleting this deal also removes it from <b><u><a onClick={(e) => { e.preventDefault(); campaignsClick(activeCampaigns, deal) }} href="">1 active</a></u></b> campaign. If this campaign has no other deals linked to it then it will start bidding on the open auction.</div>;
    } else if (activeCampaigns.length > 1) {
      return <div>Deleting this deal also removes it from <b><u><a onClick={(e) => { e.preventDefault(); campaignsClick(activeCampaigns, deal) }} href="">{activeCampaigns.length} active</a></u></b> campaigns. If these campaigns have no other deals linked to them then they will start bidding on the open auction.</div>;
    }
    return null;
  }

  if (!error) {
    const dealRows = getDealRows(deals);
    const maxLevel = Helper.getMaxLevel(user, items);
    return <div className="row">
      <div className="col-sm-12 pt-3">
        <div className="card mb-2">
          <h3 className="pull-left">Deals</h3>
          <div className="pull-right">
            {rights.MANAGE_DEALS && <Fragment>
              <Button size="sm" variant="primary" className="mr-2" onClick={() => { setShowEditModal(true); setEditDeal(null); }}><FontIcon name="plus" /> ADD DEAL</Button>
              <Button size="sm" variant="primary" className="mr-2" onClick={() => { setShowRequestModal(true); }}><FontIcon name="plus" /> REQUEST DEAL</Button>
            </Fragment>}
            <Button size="sm" variant="primary" onClick={() => { setFiltersCounter(filtersCounter + 1) }}><FontIcon name="remove" /> CLEAR FILTERS</Button>
          </div>
          <Loader visible={showLoader} />
          {!showLoader &&
            <DealsTable
              records={dealRows}
              user={user}
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
            tab="inventory"
            onClose={campaignsModalClose}
          />
          <DealModal
            show={showEditModal}
            deal={editDeal}
            sspOptions={sspOptions}
            rights={rights}
            scope={scope}
            scopeId={scopeId}
            maxLevel={maxLevel}
            onClose={() => { setShowEditModal(false) }}
            onSubmit={handleSubmit}
          />
          <DealRequestModal
            show={showRequestModal}
            sspOptions={requestSspOptions}
            rights={rights}
            scope={scope}
            scopeId={scopeId}
            maxLevel={maxLevel}
            onClose={() => { setShowRequestModal(false) }}
            onSubmit={handleRequestSubmit}
          />
          <Confirm
            message="Are you sure you want to delete this deal?"
            show={showDeleteConfirm}
            onClose={() => setShowDeleteConfirm(false)}
            onConfirm={deleteDeal}
          >
            {renderDeleteConfirmBody()}
          </Confirm>
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
export default DealsPageBody;