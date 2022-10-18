import React, { Component } from "react";
import BootstrapTable from "react-bootstrap-table-next";
import ToolkitProvider, { Search } from "react-bootstrap-table2-toolkit";
import paginationFactory from "react-bootstrap-table2-paginator";
import * as _ from "lodash";
import FontIcon from "../../../../UI/FontIcon";
import * as TableHelper from "../../../../../client/TableHelper";
import { Metric } from "../../../../../client/schemas";
import { Rights } from "../../../../../models/Common";
import { AppUser } from "../../../../../models/AppUser";

interface AgenciesTableProps {
  agencies: any[];
  user: AppUser;
  rights: Rights;
  videoMode: boolean;
  editClick: (id: string | number, writeAccess: boolean) => void;
  deleteClick: (id: string | number) => void;
}

interface AgenciesTableState {
  page: number;
  sizePerPage: number | "all";
  defaultSorted: { dataField: string; order: string; };
}

export default class AgenciesTable extends Component<AgenciesTableProps, AgenciesTableState> {
  private tableId: string = "agencies-table";

  constructor(props, context) {
    super(props, context);

    this.state = {
      page: 1,
      sizePerPage: TableHelper.getInitialSizePerPage(this.tableId, this.props.user),
      defaultSorted: this.defaultSorted()
    };
  }

  defaultSorted(): { dataField: string; order: string; } {
    if (this.props.rights.VIEW_STATISTICS) {
      return { dataField: "costs", order: "desc" };
    } else {
      return { dataField: "displayName", order: "asc" };
    }
  }

  metrics(): Metric[] {
    if (this.props.rights.VIEW_STATISTICS) {
      if (this.props.videoMode) {
        if (this.props.rights.VIEW_FINANCIALS) {
          return [
            { col: 'displayName', label: 'name', type: 'agency', align: 'left' },
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
            { col: 'displayName', label: 'name', type: 'agency', align: 'left' },
            { col: 'impressions', label: 'impressions', align: 'right', type: 'number' },
            { col: 'completions', label: 'completions', align: 'right', type: 'number' },
            { col: 'clicks', label: 'clicks', align: 'right', type: 'number' },
            { col: 'conversions', label: 'conversions', align: 'right', type: 'number' },
            { col: 'costs', label: 'costs', type: 'money', align: 'right' }
          ];
        }

      } else {
        if (this.props.rights.VIEW_FINANCIALS) {
          return [
            { col: 'displayName', label: 'name', type: 'agency', align: 'left' },
            { col: 'impressions', label: 'impressions', align: 'right', type: 'number' },
            { col: 'clicks', label: 'clicks', align: 'right', type: 'number' },
            { col: 'conversions', label: 'conversions', align: 'right', type: 'number' },
            { col: 'revenue', label: 'revenue', type: 'money', align: 'right' },
            { col: 'costs', label: 'costs', type: 'money', align: 'right' },
            { col: 'profit', label: 'profit', type: 'money', align: 'right' }
          ];
        } else {
          return [
            { col: 'displayName', label: 'name', type: 'agency', align: 'left' },
            { col: 'impressions', label: 'impressions', align: 'right', type: 'number' },
            { col: 'clicks', label: 'clicks', align: 'right', type: 'number' },
            { col: 'conversions', label: 'conversions', align: 'right', type: 'number' },
            { col: 'costs', label: 'costs', type: 'money', align: 'right' }
          ];
        }
      }
    } else {
      return [
        { col: 'displayName', label: 'name', type: 'agency', align: 'left' }
      ];
    }
  }

  onSort = (dataField, order) => {
    this.setState({ defaultSorted: { dataField, order } });
  }

  onSizePerPageChange = (sizePerPage, page) => {
    TableHelper.storeSizePerPage(sizePerPage, this.tableId, this.props.user);
    this.setState({ sizePerPage });
  }

  getColumns() {
    const hiddenCols: any[] = [{ dataField: 'id', text: '#', hidden: true }, { dataField: 'writeAccess', text: '#', hidden: true }];
    const metricCols: any[] = this.metrics().map((o) => {
      return {
        dataField: o.col,
        text: o.label || o.col,
        align: o.align || "left",
        headerAlign: o.align || "left",
        sort: true,
        onSort: this.onSort,
        sortCaret: TableHelper.columnSort,
        formatter: TableHelper.getFormatter(o.type)
      }
    });
    const editCols = [{
      dataField: 'df1',
      isDummyField: true,
      text: '',
      formatter: this.editFormatter,
      headerStyle: { width: "30px" }
    },
    {
      dataField: 'df2',
      isDummyField: true,
      text: '',
      formatter: this.deleteFormatter,
      headerStyle: { width: "30px" }
    }]
    return hiddenCols.concat(editCols, metricCols);
  }

  editFormatter = (cellContent, row) => {
    if (row.writeAccess) {
      return <a onClick={(e) => { e.preventDefault(); this.props.editClick(row.id, row.writeAccess) }} href="" className="table-btn"><FontIcon name="pencil" /></a>
    } else {
      return <a onClick={(e) => { e.preventDefault(); this.props.editClick(row.id, row.writeAccess) }} href="" className="table-btn"><FontIcon name="search-plus" /></a>
    }
  }

  deleteFormatter = (cellContent, row) => {
    if (row.writeAccess) {
      return <a onClick={(e) => { e.preventDefault(); this.props.deleteClick(row.id) }} href="" className="table-btn"><FontIcon name="remove" /></a>
    }
    return null;
  }

  getRows() {
    const metricValues = this.metrics().map((o) => { return o.col; });
    return this.props.agencies.map((o) => {
      const row = _.pick(o, metricValues);
      const id = _.get(o, "agency.id", -1);
      const writeAccess = o.rights.MANAGE_AGENCY;
      return _.assign({ id, writeAccess }, row);
    });
  }

  getCurrentPage() {
    const lastPage = TableHelper.getLastPage(this.getRows(), this.state.sizePerPage);
    if (this.state.page > lastPage) {
      return lastPage;
    } else {
      return this.state.page;
    }
  }

  render() {
    const { SearchBar } = Search;
    const rows = this.getRows();
    const columns = this.getColumns();
    const sizePerPage = TableHelper.getSizePerPage(this.state.sizePerPage, rows.length);

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
                tableId={this.tableId}
              />
            </div>
            <BootstrapTable
              {...props.baseProps}
              classes="agencies-table table-borderless"
              id={this.tableId}
              bordered={false}
              hover={true}
              striped
              keyField="id"
              data={rows}
              columns={columns}
              defaultSorted={[this.state.defaultSorted]}
              pagination={paginationFactory({
                page: this.getCurrentPage(),
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
                  text: 'All', value: this.props.agencies.length
                }],
                onPageChange: (page, sizePerPage) => {
                  this.setState({ page });
                },
                onSizePerPageChange: this.onSizePerPageChange,
              })}
            />
          </div>
        )
      }
    </ToolkitProvider>;
  }
}