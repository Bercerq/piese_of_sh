import React, { useState } from "react";
import * as _ from "lodash";
import { Button } from "react-bootstrap";
import BootstrapTable from "react-bootstrap-table-next";
import ToolkitProvider, { Search } from "react-bootstrap-table2-toolkit";
import paginationFactory from "react-bootstrap-table2-paginator";
import * as TableHelper from "../../../../client/TableHelper";
import { PublisherDeal } from "../../../../models/data/PublisherDeal";
import { AppUser } from "../../../../models/AppUser";
import FontIcon from "../../../UI/FontIcon";

interface PublisherDealRequestsTableProps {
  deals: PublisherDeal[];
  user: AppUser;
  writeAccess: boolean;
  approveClick: (id: number, publisherId: number) => void;
  rejectClick: (id: number, publisherId: number) => void;
}

const PublisherDealRequestsTable = (props: PublisherDealRequestsTableProps) => {
  const tableId: string = "publisher-deal-requests-table";
  const [page, setPage] = useState<number>(1);
  const [sizePerPage, setSizePerPage] = useState<number | "all">(TableHelper.getInitialSizePerPage(tableId, props.user));
  const [defaultSorted, setDefaultSorted] = useState<{ dataField: string; order: string; }>({ dataField: "id", order: 'desc' });

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

  const approveClick = async (cellContent, row) => {
    props.approveClick(row.id, row.publisherId);
  }

  const approveFormatter = (cellContent, row) => {
    if (row.writeAccess) {
      return <Button size="sm" variant="primary" onClick={() => { approveClick(cellContent, row); }}>APPROVE</Button>
    }
    return null;
  }

  const rejectClick = async (cellContent, row) => {
    props.rejectClick(row.id, row.publisherId);
  }

  const rejectFormatter = (cellContent, row) => {
    if (row.writeAccess) {
      return <Button size="sm" variant="primary" onClick={() => { rejectClick(cellContent, row); }}>REJECT</Button>
    }
    return null;
  }

  const getColumns = () => {
    return [{
      dataField: "id",
      text: "#",
      sort: true,
      onSort,
      sortCaret: TableHelper.columnSort
    }, {
      dataField: "publisherId",
      text: "#",
      hidden: true
    }, {
      dataField: "adType",
      text: "Ad type",
      sort: true,
      onSort,
      sortCaret: TableHelper.columnSort,
      formatter: TableHelper.undefinedFormatter
    }, {
      dataField: "organizationName",
      text: "Organization",
      sort: true,
      onSort,
      sortCaret: TableHelper.columnSort,
      formatter: TableHelper.undefinedFormatter
    }, {
      dataField: "agencyName",
      text: "Agency",
      sort: true,
      onSort,
      sortCaret: TableHelper.columnSort,
      formatter: TableHelper.undefinedFormatter
    }, {
      dataField: "advertiserName",
      text: "Advertiser",
      sort: true,
      onSort,
      sortCaret: TableHelper.columnSort,
      formatter: TableHelper.undefinedFormatter
    }, {
      dataField: "df1",
      isDummyField: true,
      text: "",
      formatter: approveFormatter,
      sort: false,
      sortCaret: TableHelper.columnSort,
    },
    {
      dataField: "df2",
      isDummyField: true,
      text: "",
      formatter: rejectFormatter,
      sort: false,
      sortCaret: TableHelper.columnSort,
    }];
  }

  const getRows = () => {
    return props.deals.map((o) => {
      return _.assign({ writeAccess: props.writeAccess }, o);
    });
  }

  const getCurrentPage = () => {
    const lastPage = TableHelper.getLastPage(getRows(), sizePerPage);
    if (page > lastPage) {
      return lastPage;
    } else {
      return page;
    }
  }

  const { SearchBar } = Search;
  const rows = getRows();
  const columns = getColumns();
  const currentSizePerPage = TableHelper.getSizePerPage(sizePerPage, rows.length);
  const currentLength = rows.length || 30;

  return <ToolkitProvider
    keyField="id"
    data={rows}
    columns={columns}
    search
  >
    {
      props => (
        <div>
          <div className="search-label-container">
            <FontIcon name="search" />
            <SearchBar
              {...props.searchProps}
              tableId={tableId}
              placeholder="Filter records"
            />
          </div>
          <BootstrapTable
            {...props.baseProps}
            id={tableId}
            classes="table-borderless"
            bordered={false}
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
          />
        </div>
      )
    }
  </ToolkitProvider>;
}

export default PublisherDealRequestsTable;