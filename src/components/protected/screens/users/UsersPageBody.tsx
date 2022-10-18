import React, { useState, useEffect, useContext, useRef } from "react";
import { useParams } from "react-router-dom";
import { Button } from "react-bootstrap";
import NotificationSystem from "react-notification-system";
import * as NotificationOptions from "../../../../client/NotificationOptions";
import * as _ from "lodash";
import * as Roles from "../../../../modules/Roles";
import { ScopeDataContextType, Rights, BreadcrumbContextType } from "../../../../models/Common";
import ScopeDataContext from "../../context/ScopeDataContext";
import ErrorContainer from "../../../UI/ErrorContainer";
import UsersTable from "./UsersTable";
import { AppUser } from "../../../../models/AppUser";
import UserContext from "../../context/UserContext";
import { UserBan, UserRow, UserInvite } from "../../../../models/data/User";
import Loader from "../../../UI/Loader";
import * as Api from "../../../../client/Api";
import * as Helper from "../../../../client/Helper";
import FontIcon from "../../../UI/FontIcon";
import UserModal from "./UserModal";
import { ScopeType } from "../../../../client/schemas";
import Confirm from "../../../UI/Confirm";
import BreadcrumbContext from "../../context/BreadcrumbContext";

const UsersPageBody = () => {
  let params: { scope?, scopeId?} = useParams();
  let scope = params.scope as ScopeType;
  let scopeId = params.scopeId;
  let { data } = useContext<ScopeDataContextType>(ScopeDataContext);
  const rights: Rights = Roles.getRights(data.rights);
  const user: AppUser = useContext<AppUser>(UserContext);
  let { items } = useContext<BreadcrumbContextType>(BreadcrumbContext);

  const [users, setUsers] = useState<UserRow[]>([]);
  const [userEmails, setUserEmails] = useState<string[]>([]);
  const [showLoader, setShowLoader] = useState<boolean>(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<boolean>(false);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [userBan, setUserBan] = useState<UserBan>(null);
  const [filtersCounter, setFiltersCounter] = useState<number>(0);
  const [error, setError] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>("");

  const notificationSystem = useRef<NotificationSystem.System>(null);
  const controller = useRef<AbortController>(null);

  useEffect(() => { loadData(); }, []);
  useEffect(() => { setShowLoader(true); }, [scope, scopeId]);
  useEffect(() => { loadData(); }, [showLoader]);

  async function loadData() {
    if (showLoader) {
      try {
        unload();
        controller.current = new AbortController();
        const qs = Helper.scopedParam({ scope, scopeId });
        const users: UserRow[] = await Api.Get({ path: "/api/users/roles", qs, signal: controller.current.signal });
        const userEmails: string[] = getUserEmails(users);
        setUsers(users);
        setUserEmails(userEmails);
      } catch (err) {
        if (err.name === "AbortError") {
          setError(false);
          setErrorMessage("");
        } else {
          setError(true);
          setErrorMessage("Error loading users.")
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

  function getUserEmails(userRoles: UserRow[]): string[] {
    return _.uniq(userRoles.map((role) => { return role.email }));
  }

  const inviteUser = async (userRole: UserInvite) => {
    try {
      await Api.Post({ path: "/api/users/invite", body: userRole });
      setShowModal(false);
      setShowLoader(true);
      notificationSystem.current.addNotification(NotificationOptions.success("User role added, the user will be notified by email", false));
    } catch (err) {
      setShowModal(false);
      notificationSystem.current.addNotification(NotificationOptions.error("Error adding user role."));
    }
  }

  const deleteClick = (userBan: UserBan) => {
    setShowDeleteConfirm(true);
    setUserBan(userBan);
  }

  const deleteRole = async () => {
    try {
      await Api.Post({ path: "/api/users/ban", body: userBan });
      setShowDeleteConfirm(false);
      setShowLoader(true);
      notificationSystem.current.addNotification(NotificationOptions.success("User role deleted", false));
    } catch (err) {
      setShowDeleteConfirm(false);
      notificationSystem.current.addNotification(NotificationOptions.error("Error deleting user role."));
    }
  }

  const confirmClose = () => {
    setShowDeleteConfirm(false);
    setUserBan(null);
  }

  if (!error) {
    const maxLevel = Helper.getMaxLevel(user, items);
    return <div className="row">
      <div className="col-sm-12 pt-3">
        <div className="card mb-2">
          <h3 className="pull-left">Users</h3>
          <div className="pull-right">
            {rights.MANAGE_USERS && <Button size="sm" variant="primary" className="mr-2" onClick={() => { setShowModal(true) }}><FontIcon name="plus" /> INVITE USER</Button>}
            <Button size="sm" variant="primary" onClick={() => { setFiltersCounter(filtersCounter + 1) }}><FontIcon name="remove" /> CLEAR FILTERS</Button>
          </div>
          <Loader visible={showLoader} />
          {!showLoader &&
            <UsersTable users={users} writeAccess={rights.MANAGE_USERS} user={user} deleteClick={deleteClick} filtersCounter={filtersCounter} />
          }
          <UserModal
            userEmails={userEmails}
            data={data}
            rights={rights}
            show={showModal}
            scope={scope}
            scopeId={scopeId}
            maxLevel={maxLevel}
            onClose={() => { setShowModal(false) }}
            onSubmit={inviteUser}
          />
          <Confirm
            message="Are you sure you want to delete this user?"
            show={showDeleteConfirm}
            onClose={confirmClose}
            onConfirm={deleteRole}
          />
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
export default UsersPageBody;