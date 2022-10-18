import React, { useState } from "react";
import * as _ from "lodash";
import BootstrapTable from "react-bootstrap-table-next";
import ToolkitProvider, { Search } from "react-bootstrap-table2-toolkit";
import paginationFactory from "react-bootstrap-table2-paginator";
import * as TableHelper from "../../../../../client/TableHelper";
import { AppUser } from "../../../../../models/AppUser";
import FontIcon from "../../../../UI/FontIcon";
import { Segment } from "../../../../../models/data/Segment";
import { Metric } from "../../../../../client/schemas";

interface SegmentInsightsTablerops {
  records: Segment[];
  metrics: Metric[];
  user: AppUser;
}

const SegmentInsightsTable = (props: SegmentInsightsTablerops) => {
  const tableId: string = "segment-insights-table";
  const [page, setPage] = useState<number>(1);
  const [sizePerPage, setSizePerPage] = useState<number | "all">(TableHelper.getInitialSizePerPage(tableId, props.user));
  const [defaultSorted, setDefaultSorted] = useState<{ dataField: string; order: string; }>({ dataField: "id", order: 'asc' });

  function getColumns() {
    const metricCols: any[] = props.metrics.map((o) => {
      return {
        dataField: o.col,
        text: o.label || o.col,
        align: o.align || "left",
        headerAlign: o.align || "left",
        sort: true,
        onSort,
        sortCaret: TableHelper.columnSort,
        formatter: TableHelper.getFormatter(o.type)
      }
    });
    return metricCols;
  }

  function getRows() {
    const metricValues = props.metrics.map((o) => { return o.col; });
    return props.records.map((o) => {
      return _.pick(o, metricValues);
    });
  }

  function getCurrentPage() {
    const lastPage = TableHelper.getLastPage(getRows(), sizePerPage);
    if (page > lastPage) {
      return lastPage;
    } else {
      return page;
    }
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
export default SegmentInsightsTable;