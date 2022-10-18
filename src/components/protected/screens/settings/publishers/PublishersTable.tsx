import React, { useState } from "react";
import BootstrapTable from "react-bootstrap-table-next";
import ToolkitProvider, { Search } from "react-bootstrap-table2-toolkit";
import paginationFactory from "react-bootstrap-table2-paginator";
import * as _ from "lodash";
import * as TableHelper from "../../../../../client/TableHelper";
import { Metric } from "../../../../../client/schemas";
import { Rights } from "../../../../../models/Common";
import FontIcon from "../../../../UI/FontIcon";
import { AppUser } from "../../../../../models/AppUser";

interface PublishersTableProps {
  publishers: any[];
  user: AppUser;
  rights: Rights;
  videoMode: boolean;
  editClick: (id: string | number, writeAccess: boolean) => void;
}

const PublishersTable = (props: PublishersTableProps) => {
  const tableId: string = "publishers-table";
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

  const editFormatter = (cellContent, row) => {
    if (row.writeAccess) {
      return <a onClick={(e) => { e.preventDefault(); props.editClick(row.id, row.writeAccess) }} href="" className="table-btn"><FontIcon name="pencil" /></a>
    } else {
      return <a onClick={(e) => { e.preventDefault(); props.editClick(row.id, row.writeAccess) }} href="" className="table-btn"><FontIcon name="search-plus" /></a>
    }
  }

  const getColumns = () => {
    const hiddenCols: any[] = [{ dataField: 'id', text: '#', hidden: true }, { dataField: 'writeAccess', text: '#', hidden: true }];
    const metricCols: any[] = metrics().map((o) => {
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
    const editCols = [{
      dataField: 'df1',
      isDummyField: true,
      text: '',
      formatter: editFormatter,
      headerStyle: { width: "30px" }
    }];
    return hiddenCols.concat(editCols, metricCols);
  }

  const getRows = () => {
    const metricValues = metrics().map((o) => { return o.col; });
    return props.publishers.map((o) => {
      const row = _.pick(o, metricValues);
      const id = _.get(o, "publisher.id", -1);
      const writeAccess = o.rights.MANAGE_PUBLISHER;
      return _.assign({ id, writeAccess }, row);
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

  function metrics(): Metric[] {
    if (props.rights.VIEW_STATISTICS) {
      if (props.videoMode) {
        if (props.rights.VIEW_FINANCIALS) {
          return [
            { col: 'displayName', label: 'name', type: 'publisher', align: 'left' },
            { col: 'impressions', label: 'impressions', align: 'right', type: 'number' },
            { col: 'completions', label: 'completions', align: 'right', type: 'number' },
            { col: 'clicks', label: 'clicks', align: 'right', type: 'number' },
            { col: 'conversions', label: 'conversions', align: 'right', type: 'number' },
            { col: 'revenue', label: 'revenue', type: 'money', align: 'right' },
            { col: 'costs', label: 'costs', type: 'money', align: 'right' },
            { col: 'profit', label: 'profit', type: 'money', align: 'right' }
          ];
        } else {
          return [
            { col: 'displayName', label: 'name', type: 'publisher', align: 'left' },
            { col: 'impressions', label: 'impressions', align: 'right', type: 'number' },
            { col: 'completions', label: 'completions', align: 'right', type: 'number' },
            { col: 'clicks', label: 'clicks', align: 'right', type: 'number' },
            { col: 'conversions', label: 'conversions', align: 'right', type: 'number' },
            { col: 'costs', label: 'costs', type: 'money', align: 'right' }
          ];
        }

      } else {
        if (props.rights.VIEW_FINANCIALS) {
          return [
            { col: 'displayName', label: 'name', type: 'publisher', align: 'left' },
            { col: 'impressions', label: 'impressions', align: 'right', type: 'number' },
            { col: 'clicks', label: 'clicks', align: 'right', type: 'number' },
            { col: 'conversions', label: 'conversions', align: 'right', type: 'number' },
            { col: 'revenue', label: 'revenue', type: 'money', align: 'right' },
            { col: 'costs', label: 'costs', type: 'money', align: 'right' },
            { col: 'profit', label: 'profit', type: 'money', align: 'right' }
          ];
        } else {
          return [
            { col: 'displayName', label: 'name', type: 'publisher', align: 'left' },
            { col: 'impressions', label: 'impressions', align: 'right', type: 'number' },
            { col: 'clicks', label: 'clicks', align: 'right', type: 'number' },
            { col: 'conversions', label: 'conversions', align: 'right', type: 'number' },
            { col: 'costs', label: 'costs', type: 'money', align: 'right' }
          ];
        }
      }
    } else {
      return [
        { col: 'displayName', label: 'name', type: 'publisher', align: 'left' }
      ];
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
            bordered={false}
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
export default PublishersTable;