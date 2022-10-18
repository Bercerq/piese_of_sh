import React, { useState, useEffect } from "react";
import * as _ from "lodash";
import BootstrapTable from "react-bootstrap-table-next";
import filterFactory, { textFilter, selectFilter } from "react-bootstrap-table2-filter";
import paginationFactory from "react-bootstrap-table2-paginator";
import * as TableHelper from "../../../../client/TableHelper";
import { UserRow, UserBan } from "../../../../models/data/User";
import { AppUser } from "../../../../models/AppUser";
import FontIcon from "../../../UI/FontIcon";

let emailFilter;
let entityFilter;
let roleFilter;
let levelFilter;

interface UsersTableProps {
  user: AppUser;
  users: UserRow[];
  writeAccess: boolean;
  filtersCounter: number;
  deleteClick: (userBan: UserBan) => void;
}

const UsersTable = (props: UsersTableProps) => {
  const tableId: string = "users-table";
  const [page, setPage] = useState<number>(1);
  const [sizePerPage, setSizePerPage] = useState<number | "all">(TableHelper.getInitialSizePerPage(tableId, props.user));
  const [defaultSorted, setDefaultSorted] = useState<{ dataField: string; order: string; }>({ dataField: "id", order: 'desc' });
  const [defaultEmailFilter, setDefaultEmailFilter] = useState<string>("");
  const [defaultEntityFilter, setDefaultEntityFilter] = useState<string>("");
  const [defaultRoleFilter, setDefaultRoleFilter] = useState<string>("");
  const [defaultLevelFilter, setDefaultLevelFilter] = useState<string>("");

  useEffect(clearFilters, [props.filtersCounter]);

  const onSort = (dataField, order) => {
    setDefaultSorted({ dataField, order });
  }

  const onPageChange = (page, sizePerPage) => {
    setPage(page);
  };

  const onSizePerPageChange = (sizePerPage, page) => {
    TableHelper.storeSizePerPage(sizePerPage, tableId, props.user);
    setSizePerPage(sizePerPage);
  };

  const deleteFormatter = (cellContent, row) => {
    if (props.writeAccess) {
      const userBan: UserBan = {
        userId: row.userId,
        role: {
          role: row.role,
          level: row.level,
          entityId: row.entityId
        }
      }
      return <a onClick={(e) => { e.preventDefault(); props.deleteClick(userBan) }} href="" className="table-btn"><FontIcon name="remove" /></a>
    }
    return null;
  }

  const getColumns = () => {
    const roleOptions = {
      "admin": "admin",
      "campaignmanager": "campaign manager",
      "campaignoptimizer": "campaign optimizer",
      "aduploader": "ad uploader",
      "tagmanager": "tag manager",
      "guest": "guest"
    };
    const levelOptions = {
      "root": "root",
      "organization": "organization",
      "agency": "agency",
      "advertiser": "advertiser",
      "publisher": "publisher"
    };
    return [
      { dataField: 'id', text: '#', hidden: true },
      {
        dataField: 'df1',
        isDummyField: true,
        text: '',
        formatter: deleteFormatter,
        headerStyle: { width: "30px" }
      },
      {
        dataField: 'email',
        text: 'Email',
        sort: true,
        sortCaret: TableHelper.columnSort,
        onSort,
        filter: textFilter({
          placeholder: "Search email...",
          defaultValue: defaultEmailFilter,
          getFilter: (filter) => { emailFilter = filter; },
          onFilter: (filterVal) => { setDefaultEmailFilter(filterVal); }
        })
      },
      {
        dataField: 'role',
        text: 'Role',
        sort: true,
        sortCaret: TableHelper.columnSort,
        onSort,
        formatter: cell => roleOptions[cell],
        filter: selectFilter({
          options: roleOptions,
          defaultValue: defaultRoleFilter,
          getFilter: (filter) => { roleFilter = filter; },
          onFilter: (filterVal) => { setDefaultRoleFilter(filterVal) }
        })
      },
      {
        dataField: 'level',
        text: 'Level',
        sort: true,
        sortCaret: TableHelper.columnSort,
        onSort,
        formatter: cell => levelOptions[cell],
        filter: selectFilter({
          options: levelOptions,
          defaultValue: defaultLevelFilter,
          getFilter: (filter) => { levelFilter = filter; },
          onFilter: (filterVal) => { setDefaultLevelFilter(filterVal) }
        })
      },
      {
        dataField: 'entityName',
        text: 'Entity',
        sort: true,
        onSort,
        sortCaret: TableHelper.columnSort,
        filter: textFilter({
          placeholder: "Search entity...",
          defaultValue: defaultEntityFilter,
          getFilter: (filter) => { entityFilter = filter; },
          onFilter: (filterVal) => { setDefaultEntityFilter(filterVal) }
        })
      }
    ];
  }

  const getCurrentPage = () => {
    const lastPage = TableHelper.getLastPage(props.users, sizePerPage);
    if (page > lastPage) {
      return lastPage;
    } else {
      return page;
    }
  }

  function clearFilters() {
    emailFilter("");
    roleFilter("");
    levelFilter("");
    entityFilter("");
  }

  const columns = getColumns();
  const currentSizePerPage = TableHelper.getSizePerPage(sizePerPage, props.users.length);
  const currentLength = props.users.length || 30;

  return <BootstrapTable
    id={tableId}
    filter={filterFactory()}
    classes="table-borderless"
    bordered={false}
    hover={true}
    striped
    keyField="id"
    data={props.users}
    columns={columns}
    defaultSorted={[defaultSorted]}
    pagination={paginationFactory({
      page: getCurrentPage(),
      sizePerPage: currentSizePerPage,
      showTotal: true,
      prePageText: "Previous",
      nextPageText: "Next",
      sizePerPageList: [{
        text: '30', value: 30
      }, {
        text: '50', value: 50
      }, {
        text: '100', value: 100
      }, {
        text: 'All', value: currentLength
      }],
      onPageChange,
      onSizePerPageChange,
    })}
  />;
}

export default UsersTable;