import React, { useState } from "react";
import { Link } from "react-router-dom";
import * as _ from "lodash";
import BootstrapTable from "react-bootstrap-table-next";
import ToolkitProvider, { Search } from "react-bootstrap-table2-toolkit";
import paginationFactory from "react-bootstrap-table2-paginator";
import { Button } from "react-bootstrap";
import * as TableHelper from "../../../../client/TableHelper";
import * as AdsHelper from "../../../../client/AdsHelper";
import { AppUser } from "../../../../models/AppUser";
import { AdqueueRow, AdqueueUpdateAction, Ad } from "../../../../models/data/Ads";
import FontIcon from "../../../UI/FontIcon";

interface AdqueueTableProps {
  ads: Ad[];
  user: AppUser;
  update: (row: AdqueueRow, action: AdqueueUpdateAction, data: Partial<Ad>) => void;
  previewClick: (id: number) => void;
}

const AdqueueTable = (props: AdqueueTableProps) => {
  const tableId: string = "adqueue-table";
  const [page, setPage] = useState<number>(1);
  const [sizePerPage, setSizePerPage] = useState<number | "all">(TableHelper.getInitialSizePerPage(tableId, props.user));
  const [defaultSorted, setDefaultSorted] = useState<{ dataField: string; order: string; }>({ dataField: "id", order: 'asc' });

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

  const cookieLessFormatter = (cellContent, row) => {
    const buttonText = cellContent === 1 ? "DISABLE" : "ENABLE";
    const cookieLess = cellContent === 1 ? 0 : 1;
    const action = cellContent === 1 ? "disablecookieless" : "enablecookieless";

    return <Button size="sm" variant="primary" onClick={() => { props.update(row, action, { cookieLess }); }}>{buttonText}</Button>;
  }

  const approveFormatter = (cellContent, row) => {
    return <Button size="sm" variant="primary" onClick={() => { props.update(row, "approve", { approved: 1 }); }}>APPROVE</Button>
  }

  const disapproveFormatter = (cellContent, row) => {
    return <Button size="sm" variant="primary" onClick={() => { props.update(row, "disapprove", { approved: -1 }); }}>DISAPPROVE</Button>
  }

  const agencyFormatter = (cellContent: any, row: any): JSX.Element | string => {
    if (row.agencyId) {
      return <Link to={`/settings/agency/${row.agencyId}`}>{cellContent}</Link>;
    }
    return cellContent;
  }

  const advertiserFormatter = (cellContent: any, row: any): JSX.Element | string => {
    if (row.advertiserId) {
      return <Link to={`/settings/advertiser/${row.advertiserId}`}>{cellContent}</Link>;
    }
    return cellContent;
  }

  const previewFormatter = (cellContent, row) => {
    return <a onClick={(e) => { e.preventDefault(); props.previewClick(row.id) }} href="" className="table-btn"><FontIcon name="eye" /></a>
  }

  const getRows = (): AdqueueRow[] => {
    return props.ads.map((o) => {
      let adqueueRow: AdqueueRow = _.pick(o, ["id", "advertiserId", "agencyId", "name", "adType", "cookieLess", "agencyName", "advertiserName"]);
      adqueueRow.dimension = AdsHelper.dimensionDurationColumn(o);
      adqueueRow.fileSize = o.bannerMemSize;
      return adqueueRow;
    });
  }

  const getColumns = () => {
    return [
      {
        dataField: 'id',
        text: '#',
        sort: true,
        onSort,
        sortCaret: TableHelper.columnSort,
      },
      {
        dataField: 'advertiserId',
        hidden: true,
      },
      {
        dataField: 'agencyId',
        hidden: true,
      },
      {
        dataField: 'name',
        text: 'Name',
        sort: true,
        onSort,
        sortCaret: TableHelper.columnSort,
      },
      {
        dataField: 'adType',
        text: 'Ad Type',
        sort: true,
        onSort,
        sortCaret: TableHelper.columnSort,
      },
      {
        dataField: 'dimension',
        text: 'Dimensions/Duration',
        sort: true,
        onSort,
        sortCaret: TableHelper.columnSort,
      },
      {
        dataField: 'fileSize',
        text: 'File Size',
        sort: true,
        onSort,
        sortCaret: TableHelper.columnSort,
      },
      {
        dataField: 'cookieLess',
        text: 'Uses no data',
        formatter: cookieLessFormatter,
        sort: true,
        onSort,
        sortCaret: TableHelper.columnSort,
      },
      {
        dataField: 'df1',
        isDummyField: true,
        text: 'Approve',
        formatter: approveFormatter,
        sort: true,
        onSort,
        sortCaret: TableHelper.columnSort,
      },
      {
        dataField: 'df2',
        isDummyField: true,
        text: 'Disapprove',
        formatter: disapproveFormatter,
        sort: true,
        onSort,
        sortCaret: TableHelper.columnSort,
      },
      {
        dataField: 'df3',
        isDummyField: true,
        text: 'Preview',
        formatter: previewFormatter,
      },
      {
        dataField: 'agencyName',
        text: 'Agency',
        formatter: agencyFormatter,
        sort: true,
        onSort,
        sortCaret: TableHelper.columnSort,
      },
      {
        dataField: 'advertiserName',
        text: 'Advertiser',
        formatter: advertiserFormatter,
        sort: true,
        onSort,
        sortCaret: TableHelper.columnSort,
      }
    ];
  }

  const getCurrentPage = () => {
    const lastPage = TableHelper.getLastPage(props.ads, sizePerPage);
    if (page > lastPage) {
      return lastPage;
    } else {
      return page;
    }
  }

  const { SearchBar } = Search;
  const columns = getColumns();
  const rows = getRows();
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
              placeholder="Filter records"
              tableId={tableId}
            />
          </div>
          <BootstrapTable
            {...props.baseProps}
            id={tableId}
            bordered={false}
            hover={true}
            classes="table-borderless"
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
export default AdqueueTable;