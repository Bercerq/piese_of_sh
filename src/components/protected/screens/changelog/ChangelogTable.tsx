import React, { Component } from "react";
import { Link } from "react-router-dom";
import BootstrapTable from "react-bootstrap-table-next";
import ToolkitProvider, { Search } from "react-bootstrap-table2-toolkit";
import paginationFactory from "react-bootstrap-table2-paginator";
import * as _ from "lodash";
import * as TableHelper from "../../../../client/TableHelper";
import * as Helper from "../../../../client/Helper";
import { ActionMessage } from "./ActionMessage";
import { Metric, MetricType } from "../../../../client/schemas";
import { ChangelogLevel, Rights } from "../../../../models/Common";
import ActionExpand from "./ActionExpand";
import { AppUser } from "../../../../models/AppUser";
import FontIcon from "../../../UI/FontIcon";

interface ChangelogTableProps {
  records: any[];
  user: AppUser;
  rights: Rights;
  level: ChangelogLevel;
}

interface ChangelogTableState {
  page: number;
  sizePerPage: number | "all";
  defaultSorted: { dataField: string; order: string; };
}

export default class ChangelogTable extends Component<ChangelogTableProps, ChangelogTableState> {
  private tableId: string = "changelog-table";

  constructor(props, context) {
    super(props, context);

    this.state = {
      page: 1,
      sizePerPage: TableHelper.getInitialSizePerPage(this.tableId, this.props.user),
      defaultSorted: {
        dataField: 'timestamp',
        order: 'desc'
      },
    };
  }

  metrics(): Metric[] {
    if (this.props.level === "adscience" || this.props.level === "metaAgency") {
      return [
        { col: 'timestamp', label: 'date' },
        { col: 'user', label: 'user' },
        { col: 'agencyName', label: 'agency', type: 'agency' },
        { col: 'advertiserName', label: 'advertiser', type: 'advertiser' },
        { col: 'campaignName', label: 'campaign', type: 'campaign' },
        { col: 'tableName', label: 'action', type: 'historyAction' }
      ];
    } else if (this.props.level === "customer") {
      return [
        { col: 'timestamp', label: 'date' },
        { col: 'user', label: 'user' },
        { col: 'advertiserName', label: 'advertiser', type: 'advertiser' },
        { col: 'campaignName', label: 'campaign', type: 'campaign' },
        { col: 'tableName', label: 'action', type: 'historyAction' }
      ];
    } else {
      return [
        { col: 'timestamp', label: 'date' },
        { col: 'user', label: 'user' },
        { col: 'campaignName', label: 'campaign', type: 'campaign' },
        { col: 'tableName', label: 'action', type: 'historyAction' }
      ];
    }
  }

  hiddenMetrics(): Metric[] {
    return [{ col: 'id' }, { col: 'agencyId' }, { col: 'advertiserId' }, { col: 'campaignId' }];
  }

  onSort = (dataField, order) => {
    this.setState({ defaultSorted: { dataField, order } });
  }

  onSizePerPageChange = (sizePerPage, page) => {
    TableHelper.storeSizePerPage(sizePerPage, this.tableId, this.props.user);
    this.setState({ sizePerPage });
  }

  getColumns() {
    const hiddenCols: any[] = this.hiddenMetrics().map((o) => {
      return {
        dataField: o.col,
        text: '#',
        hidden: true
      }
    });

    const metricCols: any[] = this.metrics().map((o) => {
      return {
        dataField: o.col,
        text: o.label || o.col,
        align: o.align || "left",
        headerAlign: o.align || "left",
        sort: true,
        onSort: this.onSort,
        sortCaret: TableHelper.columnSort,
        formatter: this.getFormatter(o.type)
      }
    });
    return hiddenCols.concat(metricCols);
  }

  getRows() {
    const metrics = this.hiddenMetrics().concat(this.metrics());
    const metricValues = metrics.map((o) => { return o.col; });
    return this.props.records.map((o) => {
      return _.pick(o, metricValues);
    });
  }

  getNonExpandableRows() {
    return this.props.records.filter((o) => { return ["TargetingRules", "AttributeValueLists"].indexOf(o.tableName) < 0; }).map((o) => { return o.id; });
  }

  getCurrentPage() {
    const lastPage = TableHelper.getLastPage(this.getRows(), this.state.sizePerPage);
    if (this.state.page > lastPage) {
      return lastPage;
    } else {
      return this.state.page;
    }
  }

  getFormatter = (type: MetricType): ((cellContent: any, row: any) => JSX.Element | string) => {
    switch (type) {
      case "agency": return this.agencyFormatter;
      case "advertiser": return this.advertiserFormatter;
      case "campaign": return this.campaignFormatter;
      case "historyAction": return this.actionFormatter;
      default: return TableHelper.undefinedFormatter;
    }
  }

  agencyFormatter = (cellContent: any, row: any): JSX.Element | string => {
    if (row.agencyId && this.props.rights.VIEW_AGENCY) {
      return <Link to={`/settings/agency/${row.agencyId}`}>{cellContent}</Link>;
    }
    return cellContent;
  }

  advertiserFormatter = (cellContent: any, row: any): JSX.Element | string => {
    if (row.advertiserId && this.props.rights.VIEW_ADVERTISER) {
      return <Link to={`/settings/advertiser/${row.advertiserId}`}>{cellContent}</Link>;
    }
    return cellContent;
  }

  campaignFormatter = (cellContent: any, row: any): JSX.Element | string => {
    if (row.campaignId && this.props.rights.VIEW_CAMPAIGN) {
      const to = Helper.campaignSettingsLink(`/settings/campaign/${row.campaignId}/general`);
      return <Link to={to}>{cellContent}</Link>;
    }
    return cellContent;
  }

  actionFormatter = (cellContent: any, row: any): JSX.Element | string => {
    const record = this.props.records.find((o) => { return o.id === row.id });
    if (record && record.tableName) {
      return ActionMessage(record);
    }
    return "-";
  }

  expandRowRenderer = (row) => {
    const record = this.props.records.find((o) => { return o.id === row.id });
    return <ActionExpand record={record} />
  }

  getExpandRow() {
    const nonExpandable = this.getNonExpandableRows();
    return {
      renderer: this.expandRowRenderer,
      showExpandColumn: true,
      expandColumnPosition: 'right',
      expandColumnRenderer: ({ expanded, rowKey, expandable }) => {
        if (expandable) {
          if (expanded) {
            return (
              <FontIcon name="chevron-up" />
            );
          }
          return (
            <FontIcon name="chevron-down" />
          );
        } else {
          return null;
        }
      },
      nonExpandable
    };
  }

  render() {
    const { SearchBar } = Search;
    const rows = this.getRows();
    const columns = this.getColumns();
    const sizePerPage = TableHelper.getSizePerPage(this.state.sizePerPage, rows.length);
    const expandRow = this.getExpandRow();

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
              id={this.tableId}
              classes="table-borderless"
              bordered={false}
              hover={true}
              striped
              keyField="id"
              data={rows}
              columns={columns}
              expandRow={expandRow}
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
                  text: 'All', value: this.props.records.length
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