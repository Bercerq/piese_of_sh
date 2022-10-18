import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import BootstrapTable from "react-bootstrap-table-next";
import filterFactory, { textFilter, selectFilter } from "react-bootstrap-table2-filter";
import paginationFactory from "react-bootstrap-table2-paginator";
import { Popover, OverlayTrigger } from "react-bootstrap";
import * as _ from "lodash";
import moment from "moment";
import * as TableHelper from "../../../../../client/TableHelper";
import { ReportTemplate } from "../../../../../models/data/Report";
import { AppUser } from "../../../../../models/AppUser";
import FontIcon from "../../../../UI/FontIcon";
import { ScopeType } from "../../../../../client/schemas";

interface ReportTemplatesTableProps {
  records: ReportTemplate[];
  filtersCounter: number;
  user: AppUser;
  scope: ScopeType;
  scopeId: number;
  deleteClick: (deleteId: number) => void;
}

const ReportTemplatesTable = (props: ReportTemplatesTableProps) => {
  const tableId: string = `report-templates-table`;
  const [page, setPage] = useState<number>(1);
  const [sizePerPage, setSizePerPage] = useState<number | "all">(TableHelper.getInitialSizePerPage(tableId, props.user));
  const [defaultSorted, setDefaultSorted] = useState<{ dataField: string; order: string; }>({ dataField: "id", order: 'desc' });
  const [defaultNameFilter, setDefaultNameFilter] = useState<string>("");
  const [defaultLevelFilter, setDefaultLevelFilter] = useState<string>("");
  const [defaultOwnerFilter, setDefaultOwnerFilter] = useState<string>("");

  const nameFilter = useRef(null);
  const levelFilter = useRef(null);
  const ownerFilter = useRef(null);

  useEffect(clearFilters, [props.filtersCounter]);

  function clearFilters() {
    nameFilter.current("");
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
      return <Link to={`/publisherreporttemplates/${props.scope}/${props.scopeId}/${row.id}`}><FontIcon name="pencil" /></Link>;
    } else {
      return <Link to={`/publisherreporttemplates/${props.scope}/${props.scopeId}/${row.id}`}><FontIcon name="search-plus" /></Link>;
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
        <Link to={`/publisherreporttemplates/${props.scope}/${props.scopeId}/${row.id}`}>{cellContent}</Link>
      </OverlayTrigger>;
    } else {
      return <Link to={`/publisherreporttemplates/${props.scope}/${props.scopeId}/${row.id}`}>{cellContent}</Link>;
    }
  }

  const dateFormatter = (cellContent) => {
    if (cellContent) {
      const d = moment(cellContent);
      return d.format('YYYY-MM-DD HH:mm:ss');
    }
    return "";
  }

  const getColumns = () => {
    const levelOptions = {
      "publisher": "publisher"
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
          id: "name-filter",
          placeholder: "Search name...",
          defaultValue: defaultNameFilter,
          getFilter: (filter) => { nameFilter.current = filter; },
          onFilter: (filterVal) => { setDefaultNameFilter(filterVal) }
        }),
        formatter: nameFormatter
      },
      {
        dataField: 'level',
        text: 'Level',
        sort: true,
        onSort,
        sortCaret: TableHelper.columnSort,
        formatter: cell => levelOptions[cell],
        filter: selectFilter({
          id: "level-filter",
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
          id: "owner-filter",
          placeholder: "Search entity...",
          defaultValue: defaultOwnerFilter,
          getFilter: (filter) => { ownerFilter.current = filter; },
          onFilter: (filterVal) => { setDefaultOwnerFilter(filterVal) }
        })
      },
      {
        dataField: 'creationDate',
        text: 'Created',
        sort: true,
        onSort,
        sortCaret: TableHelper.columnSort,
        formatter: dateFormatter
      },
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
    ];
  }

  const getRows = () => {
    return props.records.map((o) => {
      const row = _.pick(o, ["id", "name", "description", "writeAccess", "creationDate"]);
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
export default ReportTemplatesTable;