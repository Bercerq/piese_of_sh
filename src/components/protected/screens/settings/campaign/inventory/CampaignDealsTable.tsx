import React, { useState } from "react";
import BootstrapTable from "react-bootstrap-table-next";
import ToolkitProvider, { Search } from "react-bootstrap-table2-toolkit";
import paginationFactory from "react-bootstrap-table2-paginator";
import { Popover, OverlayTrigger } from "react-bootstrap";
import * as _ from "lodash";
import * as Helper from "../../../../../../client/Helper";
import * as TableHelper from "../../../../../../client/TableHelper";
import FontIcon from "../../../../../UI/FontIcon";
import { CampaignDeal } from "../../../../../../models/data/Campaign";

interface CampaignDealsTableProps {
  records: CampaignDeal[];
  writeAccess: boolean;
  deleteClick: (deleteId: number) => void;
}

const CampaignDealsTable = (props: CampaignDealsTableProps) => {
  const tableId: string = "campaign-deals-table";
  const [page, setPage] = useState<number>(1);
  const [sizePerPage, setSizePerPage] = useState<number | "all">(30);
  const [defaultSorted, setDefaultSorted] = useState<{ dataField: string; order: string; }>({ dataField: "id", order: 'desc' });

  const onSort = (dataField, order) => {
    setDefaultSorted({ dataField, order });
  }

  const onPageChange = (page, sizePerPage) => {
    setPage(page);
  };

  const onSizePerPageChange = (sizePerPage, page) => {
    setSizePerPage(sizePerPage);
  };

  const deleteFormatter = (cellContent, row) => {
    if (props.writeAccess) {
      return <a onClick={(e) => { e.preventDefault(); props.deleteClick(row.dealId) }} href="" className="table-btn"><FontIcon name="remove" /></a>
    }
    return null;
  }

  const nameFormatter = (cellContent, row, rowIndex) => {
    if (row.description) {
      const popperConfig = Helper.getPopperConfig();
      const popoverHover = <Popover id={`popover-campaign-deals-hover-${rowIndex}`}>
        <Popover.Content>{row.description}</Popover.Content>
      </Popover>;

      return <OverlayTrigger trigger="hover" placement="top" overlay={popoverHover} popperConfig={popperConfig}>
        <div>{cellContent}</div>
      </OverlayTrigger>;
    } else {
      return cellContent;
    }
  }

  function getColumns() {
    return [
      { dataField: 'id', text: '#', hidden: true },
      { dataField: 'dealId', text: '#', hidden: true },
      {
        dataField: 'df1',
        isDummyField: true,
        text: '',
        formatter: deleteFormatter,
        headerStyle: { width: "30px" }
      },
      {
        dataField: 'externalId',
        text: 'External id',
        sort: true,
        onSort,
        sortCaret: TableHelper.columnSort
      },
      {
        dataField: 'ssp',
        text: 'SSP',
        sort: true,
        onSort,
        sortCaret: TableHelper.columnSort
      },
      {
        dataField: 'name',
        text: 'Name',
        sort: true,
        onSort,
        sortCaret: TableHelper.columnSort,
        formatter: nameFormatter
      }
    ];
  }

  function getRows() {
    return props.records.map((o) => {
      return {
        id: o.id || null,
        dealId: _.get(o, "dealId", ""),
        externalId: _.get(o, "deal.externalId", ""),
        ssp: _.get(o, "deal.ssp", ""),
        name: _.get(o, "deal.name", ""),
        description: _.get(o, "deal.description", ""),
      }
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

  const { SearchBar } = Search;
  const columns = getColumns();
  const rows = getRows();

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
            classes="table-borderless"
            id={tableId}
            bordered={false}
            hover={true}
            striped
            keyField="dealId"
            data={rows}
            columns={columns}
            defaultSorted={[defaultSorted]}
            pagination={paginationFactory({
              page: getCurrentPage(),
              sizePerPage,
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
                text: 'all', value: 1000
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
export default CampaignDealsTable;