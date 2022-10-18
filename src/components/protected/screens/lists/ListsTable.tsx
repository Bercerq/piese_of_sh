import React, { useState, useEffect } from "react";
import * as _ from "lodash";
import moment from "moment";
import BootstrapTable from "react-bootstrap-table-next";
import filterFactory, { textFilter } from "react-bootstrap-table2-filter";
import paginationFactory from "react-bootstrap-table2-paginator";
import * as TableHelper from "../../../../client/TableHelper";
import FontIcon from "../../../UI/FontIcon";
import ColumnPopover from "../../shared/ColumnPopover";
import { LookUp } from "../../../../models/Common";
import { ListRow } from "../../../../models/data/List";
import { AppUser } from "../../../../models/AppUser";

let nameFilter;
let descriptionFilter;
let ownerFilter;

interface ListsTableProps {
  user: AppUser;
  records: ListRow[];
  writeAccess: boolean;
  filtersCounter: number;
  editClick: (editId: number, writeAccess: boolean) => void;
  deleteClick: (deleteId: number) => void;
  campaignsClick: (campaigns: LookUp[], row: ListRow) => void;
}

const ListsTable = (props: ListsTableProps) => {
  const tableId: string = "lists-table";
  const [page, setPage] = useState<number>(1);
  const [sizePerPage, setSizePerPage] = useState<number | "all">(TableHelper.getInitialSizePerPage(tableId, props.user));
  const [defaultSorted, setDefaultSorted] = useState<{ dataField: string; order: string; }>({ dataField: "id", order: 'desc' });
  const [defaultNameFilter, setDefaultNameFilter] = useState<string>("");
  const [defaultDescriptionFilter, setDefaultDescriptionFilter] = useState<string>("");
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

  const nameFormatter = (cellContent, row) => {
    return <a onClick={(e) => { e.preventDefault(); props.editClick(row.id, row.writeAccess) }} href="">{cellContent}</a>
  }

  const descriptionFormatter = (cellContent, row, rowIndex) => {
    return <ColumnPopover id={"popover-trigger-hover" + rowIndex} cellContent={cellContent} />;
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
    const writeAccessOptions = {
      true: "Yes",
      false: "No"
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
        dataField: 'description',
        text: 'Description',
        sort: true,
        sortCaret: TableHelper.columnSort,
        onSort,
        formatter: descriptionFormatter,
        filter: textFilter({
          placeholder: "Search description...",
          defaultValue: defaultDescriptionFilter,
          getFilter: (filter) => { descriptionFilter = filter; },
          onFilter: (filterVal) => { setDefaultDescriptionFilter(filterVal) }
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
        dataField: 'inactiveCampaignIds',
        text: '# inactive campaigns',
        sort: true,
        onSort,
        sortCaret: TableHelper.columnSort,
        formatter: campaignsFormatter
      },
      {
        dataField: 'writeAccess',
        text: 'Write access',
        sort: true,
        onSort,
        sortCaret: TableHelper.columnSort,
        formatter: cell => writeAccessOptions[cell]
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
        dataField: 'lastEdit',
        text: 'Last edit',
        sort: true,
        onSort,
        sortCaret: TableHelper.columnSort,
        formatter: dateFormatter
      }
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
    nameFilter("");
    descriptionFilter("");
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

export default ListsTable;