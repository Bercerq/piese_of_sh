import React, { useState, useEffect } from "react";
import { Popover, OverlayTrigger } from "react-bootstrap";
import * as _ from "lodash";
import moment from "moment";
import BootstrapTable from "react-bootstrap-table-next";
import filterFactory, { textFilter, selectFilter } from "react-bootstrap-table2-filter";
import paginationFactory from "react-bootstrap-table2-paginator";
import * as TableHelper from "../../../../client/TableHelper";
import FontIcon from "../../../UI/FontIcon";
import { LookUp } from "../../../../models/Common";
import { DealRow } from "../../../../models/data/Deal";
import { AppUser } from "../../../../models/AppUser";

let externalIdFilter;
let sspFilter;
let nameFilter;
let statusFilter;
let ownerFilter;

interface DealsTableProps {
  user: AppUser;
  records: DealRow[];
  filtersCounter: number;
  editClick: (editId: number) => void;
  deleteClick: (deleteId: number) => void;
  campaignsClick: (campaigns: LookUp[], row: DealRow) => void;
}

const DealsTable = (props: DealsTableProps) => {
  const tableId: string = "deals-table";
  const [page, setPage] = useState<number>(1);
  const [sizePerPage, setSizePerPage] = useState<number | "all">(TableHelper.getInitialSizePerPage(tableId, props.user));
  const [defaultSorted, setDefaultSorted] = useState<{ dataField: string; order: string; }>({ dataField: "id", order: 'desc' });
  const [defaultExternalIdFilter, setDefaultExternalIdFilter] = useState<string>("");
  const [defaultSspFilter, setDefaultSspFilter] = useState<string>("");
  const [defaultNameFilter, setDefaultNameFilter] = useState<string>("");
  const [defaultStatusFilter, setDefaultStatusFilter] = useState<string>("");
  const [defaultOwnerFilter, setDefaultOwnerFilter] = useState<string>("");

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

  const editFormatter = (cellContent, row) => {
    if (row.writeAccess) {
      return <a onClick={(e) => { e.preventDefault(); props.editClick(row.id) }} href="" className="table-btn"><FontIcon name="pencil" /></a>
    } else {
      return <a onClick={(e) => { e.preventDefault(); props.editClick(row.id) }} href="" className="table-btn"><FontIcon name="search-plus" /></a>
    }
  }

  const deleteFormatter = (cellContent, row) => {
    if (row.writeAccess) {
      return <a onClick={(e) => { e.preventDefault(); props.deleteClick(row.id) }} href="" className="table-btn"><FontIcon name="remove" /></a>
    }
    return null;
  }

  const nameFormatter = (cellContent, row, rowIndex) => {
    if (row.description) {
      const popoverHover = <Popover id={`popover-trigger-hover-${rowIndex}`}>
        <Popover.Content>{row.description}</Popover.Content>
      </Popover>;

      return <OverlayTrigger trigger="hover" placement="top" overlay={popoverHover}>
        <a onClick={(e) => { e.preventDefault(); props.editClick(row.id) }} href="">{cellContent}</a>
      </OverlayTrigger>;
    } else {
      return <a onClick={(e) => { e.preventDefault(); props.editClick(row.id) }} href="">{cellContent}</a>;
    }
  }

  const campaignsFormatter = (cellContent, row) => {
    if (cellContent && cellContent.length > 0) {
      return <a onClick={(e) => { e.preventDefault(); props.campaignsClick(cellContent, row) }} href="">{cellContent.length}</a>
    }
    return "0";
  }

  const dateFormatter = (cellContent) => {
    if (cellContent) {
      const d = moment(cellContent);
      if (d.hours() === 23 && d.minutes() === 59) {
        return d.format('YYYY-MM-DD');
      } else {
        return d.format('YYYY-MM-DD HH:mm:ss');
      }
    }
    return "";
  }

  const getColumns = () => {
    const statusOptions = {
      "okay": "okay",
      "pending": "pending",
      "inactive": "inactive",
      "rejected": "rejected"
    };

    return [
      { dataField: 'id', text: '#', hidden: true },
      {
        dataField: 'df1',
        isDummyField: true,
        text: '',
        formatter: editFormatter,
        headerStyle: { width: "30px" }
      },
      {
        dataField: 'df2',
        isDummyField: true,
        text: '',
        formatter: deleteFormatter,
        headerStyle: { width: "30px" }
      },
      {
        dataField: 'externalId',
        text: 'Id',
        sort: true,
        onSort,
        sortCaret: TableHelper.columnSort,
        filter: textFilter({
          placeholder: "Search id...",
          defaultValue: defaultExternalIdFilter,
          getFilter: (filter) => { externalIdFilter = filter; },
          onFilter: (filterVal) => { setDefaultExternalIdFilter(filterVal) }
        })
      },
      {
        dataField: 'ssp',
        text: 'SSP',
        sort: true,
        onSort,
        sortCaret: TableHelper.columnSort,
        filter: textFilter({
          placeholder: "Search SSP...",
          defaultValue: defaultSspFilter,
          getFilter: (filter) => { sspFilter = filter; },
          onFilter: (filterVal) => { setDefaultSspFilter(filterVal) }
        })
      },
      {
        dataField: 'name',
        text: 'Name',
        sort: true,
        onSort,
        sortCaret: TableHelper.columnSort,
        filter: textFilter({
          placeholder: "Search name...",
          defaultValue: defaultNameFilter,
          getFilter: (filter) => { nameFilter = filter; },
          onFilter: (filterVal) => { setDefaultNameFilter(filterVal) }
        }),
        formatter: nameFormatter
      },
      {
        dataField: 'status',
        text: 'Status',
        sort: true,
        onSort,
        sortCaret: TableHelper.columnSort,
        formatter: cell => statusOptions[cell],
        filter: selectFilter({
          options: statusOptions,
          defaultValue: defaultStatusFilter,
          getFilter: (filter) => { statusFilter = filter; },
          onFilter: (filterVal) => { setDefaultStatusFilter(filterVal) }
        })
      },
      {
        dataField: 'owner',
        text: 'Owner',
        sort: true,
        onSort,
        sortCaret: TableHelper.columnSort,
        filter: textFilter({
          placeholder: "Search owner...",
          defaultValue: defaultOwnerFilter,
          getFilter: (filter) => { ownerFilter = filter; },
          onFilter: (filterVal) => { setDefaultOwnerFilter(filterVal) }
        })
      },
      {
        dataField: 'activeCampaignIds',
        text: '# active campaigns',
        sort: true,
        onSort,
        sortCaret: TableHelper.columnSort,
        formatter: campaignsFormatter
      },
      {
        dataField: 'expirationDate',
        text: 'Expires',
        sort: true,
        onSort,
        sortCaret: TableHelper.columnSort,
        formatter: dateFormatter
      },
      {
        dataField: 'creationDate',
        text: 'Created',
        sort: true,
        onSort: onSort,
        sortCaret: TableHelper.columnSort,
        formatter: dateFormatter
      },
    ];
  }

  const getCurrentPage = () => {
    const lastPage = TableHelper.getLastPage(props.records, sizePerPage);
    if (page > lastPage) {
      return lastPage;
    } else {
      return page;
    }
  }

  function clearFilters() {
    externalIdFilter("");
    sspFilter("");
    nameFilter("");
    statusFilter("");
    ownerFilter("");
  }

  const columns = getColumns();
  const currentSizePerPage = TableHelper.getSizePerPage(sizePerPage, props.records.length);
  const currentLength = props.records.length || 30;

  return <BootstrapTable
    id={tableId}
    filter={filterFactory()}
    classes="table-borderless"
    bordered={false}
    hover={true}
    striped
    keyField="id"
    data={props.records}
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

export default DealsTable;