import React, { useState } from "react";
import * as _ from "lodash";
import moment from "moment";
import { Button } from "react-bootstrap";
import BootstrapTable from "react-bootstrap-table-next";
import ToolkitProvider, { Search } from "react-bootstrap-table2-toolkit";
import paginationFactory from "react-bootstrap-table2-paginator";
import FontIcon from "../../../UI/FontIcon";
import * as TableHelper from "../../../../client/TableHelper";
import { PublisherDeal } from "../../../../models/data/PublisherDeal";
import { AppUser } from "../../../../models/AppUser";

interface PublisherDealsTableProps {
  deals: PublisherDeal[];
  user: AppUser;
  writeAccess: boolean;
  editClick: (id: number) => void;
  deleteClick: (id: number) => void;
  approvalStatusClick: (id: number, deal: PublisherDeal) => void;
}

const PublisherDealsTable = (props: PublisherDealsTableProps) => {
  const tableId: string = "publisher-deals-table";
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

  const approvalStatusClick = (cellContent, row) => {
    const approvalStatus = cellContent === "approved" ? "suspended" : "approved";
    props.approvalStatusClick(row.id, { name: row.name, approvalStatus, expirationDate: row.expirationDate, floorPrice: row.floorPrice });
  }

  const approvalStatusFormatter = (cellContent, row) => {
    if (row.writeAccess) {
      const buttonText = cellContent === "approved" ? "SUSPEND" : "APPROVE";
      return <Button size="sm" variant="primary" onClick={() => { approvalStatusClick(cellContent, row); }}>{buttonText}</Button>
    }
    return cellContent;
  }

  const editFormatter = (cellContent, row) => {
    if (row.writeAccess) {
      return <a onClick={(e) => { e.preventDefault(); props.editClick(row.id); }} href="" className="table-btn"><FontIcon name="pencil" /></a>
    }
    return <a onClick={(e) => { e.preventDefault(); props.editClick(row.id); }} href="" className="table-btn"><FontIcon name="search-plus" /></a>
  }

  const deleteFormatter = (cellContent, row) => {
    if (row.writeAccess) {
      return <a onClick={(e) => { e.preventDefault(); props.deleteClick(row.id); }} href="" className="table-btn"><FontIcon name="remove" /></a>
    }
    return null;
  }

  const getColumns = () => {
    return [{
      dataField: 'df1',
      isDummyField: true,
      text: '',
      formatter: editFormatter,
      headerStyle: { width: "30px" }
    }, {
      dataField: 'df2',
      isDummyField: true,
      text: '',
      formatter: deleteFormatter,
      headerStyle: { width: "30px" }
    }, {
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
      dataField: "name",
      text: "Name",
      sort: true,
      onSort,
      sortCaret: TableHelper.columnSort,
      formatter: TableHelper.undefinedFormatter
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
      dataField: "floorPrice",
      text: "Floor price",
      sort: true,
      onSort,
      sortCaret: TableHelper.columnSort,
      formatter: TableHelper.currencyFormatter
    }, {
      dataField: 'expirationDate',
      text: 'Expires',
      sort: true,
      onSort,
      sortCaret: TableHelper.columnSort,
      formatter: dateFormatter
    }, {
      dataField: "approvalStatus",
      text: "Approval status",
      sort: true,
      onSort,
      sortCaret: TableHelper.columnSort,
      formatter: approvalStatusFormatter
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

export default PublisherDealsTable;