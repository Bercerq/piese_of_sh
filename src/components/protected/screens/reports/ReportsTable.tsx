import React, { useState, useEffect, useRef } from "react";
import BootstrapTable from "react-bootstrap-table-next";
import filterFactory, { textFilter, selectFilter } from "react-bootstrap-table2-filter";
import paginationFactory from "react-bootstrap-table2-paginator";
import { Popover, OverlayTrigger } from "react-bootstrap";
import * as _ from "lodash";
import moment from "moment";
import * as TableHelper from "../../../../client/TableHelper";
import { Report } from "../../../../models/data/Report";
import { AppUser } from "../../../../models/AppUser";
import FontIcon from "../../../UI/FontIcon";

interface ReportsTableProps {
  type: string;
  records: Report[];
  filtersCounter: number;
  user: AppUser;
  shareClick: (shareId: number) => void;
  editClick: (editId: number, writeAccess: boolean) => void;
  deleteClick: (deleteId: number) => void;
  downloadClick: (downloadId: number) => void;
}

const ReportsTable = (props: ReportsTableProps) => {
  const tableId: string = `reports-table-${props.type}`;
  const [page, setPage] = useState<number>(1);
  const [sizePerPage, setSizePerPage] = useState<number | "all">(TableHelper.getInitialSizePerPage(tableId, props.user));
  const [defaultSorted, setDefaultSorted] = useState<{ dataField: string; order: string; }>({ dataField: "id", order: 'desc' });
  const [defaultNameFilter, setDefaultNameFilter] = useState<string>("");
  const [defaultStatusFilter, setDefaultStatusFilter] = useState<string>("");
  const [defaultLevelFilter, setDefaultLevelFilter] = useState<string>("");
  const [defaultOwnerFilter, setDefaultOwnerFilter] = useState<string>("");

  const nameFilter = useRef(null);
  const statusFilter = useRef(null);
  const levelFilter = useRef(null);
  const ownerFilter = useRef(null);

  useEffect(clearFilters, [props.filtersCounter]);

  function clearFilters() {
    nameFilter.current("");
    statusFilter.current("");
    levelFilter.current("");
    ownerFilter.current("");
  }

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
      return <a onClick={(e) => { e.preventDefault(); props.editClick(row.id, row.writeAccess) }} href="" className="table-btn"><FontIcon name="pencil" /></a>
    } else {
      return <a onClick={(e) => { e.preventDefault(); props.editClick(row.id, row.writeAccess) }} href="" className="table-btn"><FontIcon name="search-plus" /></a>
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
      const popoverHover = (
        <Popover id={"popover-trigger-hover" + rowIndex}>
          <Popover.Content>
            {row.description}
          </Popover.Content>
        </Popover>
      );

      return <OverlayTrigger trigger="hover" placement="top" overlay={popoverHover}>
        <a onClick={(e) => { e.preventDefault(); props.editClick(row.id, row.writeAccess) }} href="">{cellContent}</a>
      </OverlayTrigger>;
    } else {
      return <a onClick={(e) => { e.preventDefault(); props.editClick(row.id, row.writeAccess) }} href="">{cellContent}</a>;
    }
  }

  const dateFormatter = (cellContent) => {
    if (cellContent) {
      const d = moment(cellContent);
      return d.format('YYYY-MM-DD HH:mm:ss');
    }
    return "";
  }

  const downloadFormatter = (cellContent, row) => {
    if (row.lastRun) {
      return <a onClick={(e) => { e.preventDefault(); props.downloadClick(row.id) }} href="" className="table-btn mr-10"><FontIcon name="download" /></a>
    }
  }

  const shareFormatter = (cellContent, row) => {
      return <a onClick={(e) => { e.preventDefault(); props.shareClick(row.id) }} href="" className="table-btn mr-10"><FontIcon name="share" /></a>
  }

  const getColumns = () => {
    const levelOptions = {
      "all": "root",
      "metaAgency": "organization",
      "agency": "agency",
      "advertiser": "advertiser",
      "cluster": "campaign group",
      "campaign": "campaign"
    };

    return [
      { dataField: 'id', text: '#', hidden: true },
      { dataField: 'writeAccess', text: '#', hidden: true },
      {
        dataField: 'name',
        text: 'Name',
        sort: true,
        onSort,
        sortCaret: TableHelper.columnSort,
        filter: textFilter({
          id: props.type + "-name-filter",
          placeholder: "Search name...",
          defaultValue: defaultNameFilter,
          getFilter: (filter) => { nameFilter.current = filter; },
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
        filter: textFilter({
          id: props.type + "-status-filter",
          placeholder: "Search status...",
          defaultValue: defaultStatusFilter,
          getFilter: (filter) => { statusFilter.current = filter; },
          onFilter: (filterVal) => { setDefaultStatusFilter(filterVal) }
        })
      },
      {
        dataField: 'level',
        text: 'Level',
        sort: true,
        onSort,
        sortCaret: TableHelper.columnSort,
        formatter: cell => levelOptions[cell],
        filter: selectFilter({
          id: props.type + "-level-filter",
          options: levelOptions,
          defaultValue: defaultLevelFilter,
          getFilter: (filter) => { levelFilter.current = filter; },
          onFilter: (filterVal) => { setDefaultLevelFilter(filterVal) }
        })
      },
      {
        dataField: 'owner',
        text: 'Entity',
        sort: true,
        onSort,
        sortCaret: TableHelper.columnSort,
        filter: textFilter({
          id: props.type + "-owner-filter",
          placeholder: "Search entity...",
          defaultValue: defaultOwnerFilter,
          getFilter: (filter) => { ownerFilter.current = filter; },
          onFilter: (filterVal) => { setDefaultOwnerFilter(filterVal) }
        })
      },
      {
        dataField: 'lastRun',
        text: 'Latest run',
        sort: true,
        onSort,
        sortCaret: TableHelper.columnSort,
        formatter: dateFormatter
      },
      {
        dataField: 'df1',
        isDummyField: true,
        text: '',
        formatter: downloadFormatter,
        headerStyle: { width: "30px" }
      }, 
      {
        dataField: 'df2',
        isDummyField: true,
        text: '',
        formatter: shareFormatter,
        headerStyle: { width: "30px" }
      },
      {
        dataField: 'df3',
        isDummyField: true,
        text: '',
        formatter: editFormatter,
        headerStyle: { width: "30px" }
      },
      {
        dataField: 'df4',
        isDummyField: true,
        text: '',
        formatter: deleteFormatter,
        headerStyle: { width: "30px" }
      },
    ];
  }

  const getRows = () => {
    return props.records.map((o) => {
      const row = _.pick(o, ["id", "name", "status", "description", "writeAccess", "lastRun"]);
      const level = _.get(o, "scope.scope");
      const owner = _.get(o, "scope.owner");
      return _.assign(row, { level, owner });
    });
  }

  const getCurrentPage = () => {
    const lastPage = TableHelper.getLastPage(props.records, sizePerPage);
    if (page > lastPage) {
      return lastPage;
    } else {
      return page;
    }
  }

  const columns = getColumns();
  const rows = getRows();
  const currentSizePerPage = TableHelper.getSizePerPage(sizePerPage, rows.length);
  const currentLength = props.records.length || 30;

  return <BootstrapTable
    id={tableId}
    filter={filterFactory()}
    classes="table-borderless"
    bordered={false}
    hover={true}
    striped
    keyField="id"
    data={rows}
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
export default ReportsTable;