import React, { Component } from "react";
import { Link } from "react-router-dom";
import * as _ from "lodash";
import moment from "moment";
import { Tooltip, OverlayTrigger } from "react-bootstrap";
import BootstrapTable from "react-bootstrap-table-next";
import ToolkitProvider, { Search } from "react-bootstrap-table2-toolkit";
import paginationFactory from "react-bootstrap-table2-paginator";
import FontIcon from "../../../UI/FontIcon";
import * as TableHelper from "../../../../client/TableHelper";
import { AppUser } from "../../../../models/AppUser";
import { Segment } from "../../../../models/data/Segment";
import { Rights } from "../../../../models/Common";
import { Metric } from "../../../../client/schemas";
import { AdvertiserEntity } from "../../../../models/data/Advertiser";

interface SegmentsTableProps {
  records: Segment[];
  advertisers: AdvertiserEntity[];
  showAdvertiserCol: boolean;
  user: AppUser;
  rights: Rights;
  metrics: Metric[];
  editClick: (id: string | number, writeAccess: boolean) => void;
  deleteClick: (id: string | number) => void;
  codeClick: (id: string | number) => void;
}

interface SegmentsTableState {
  page: number;
  sizePerPage: number | "all";
  defaultSorted: { dataField: string; order: string; };
}

export default class SegmentsTable extends Component<SegmentsTableProps, SegmentsTableState> {
  private tableId: string = "segments-table";

  constructor(props, context) {
    super(props, context);

    this.state = {
      page: 1,
      sizePerPage: TableHelper.getInitialSizePerPage(this.tableId, this.props.user),
      defaultSorted: {
        dataField: 'segmentName',
        order: 'asc'
      },
    };
  }

  onSort = (dataField, order) => {
    this.setState({ defaultSorted: { dataField, order } });
  }

  onSizePerPageChange = (sizePerPage, page) => {
    TableHelper.storeSizePerPage(sizePerPage, this.tableId, this.props.user);
    this.setState({ sizePerPage });
  }

  getColumns() {
    const hiddenCols: any[] = [{
      dataField: 'id',
      hidden: true
    }, {
      dataField: 'writeAccess',
      hidden: true
    }, {
      dataField: 'advertiserId',
      hidden: true,
    },];
    const cols = [{
      dataField: 'segmentName',
      text: 'name',
      sort: true,
      onSort: this.onSort,
      sortCaret: TableHelper.columnSort
    }, {
      dataField: 'advertiserName',
      text: 'advertiser',
      sort: true,
      hidden: !this.props.showAdvertiserCol,
      onSort: this.onSort,
      sortCaret: TableHelper.columnSort,
      formatter: this.advertiserFormatter
    }];

    const metricCols: any[] = this.props.metrics.map((o) => {
      let formatter = TableHelper.getFormatter(o.type);
      if (o.col === "lastEvent") {
        formatter = TableHelper.segmentActiveFormatter;
      }
      return {
        dataField: o.col,
        text: o.label || o.col,
        align: o.align || "left",
        headerAlign: o.align || "left",
        sort: true,
        onSort: this.onSort,
        sortCaret: TableHelper.columnSort,
        formatter
      }
    });
    const editCols = [{
      dataField: 'df1',
      isDummyField: true,
      text: '',
      formatter: this.editFormatter,
      headerStyle: { width: "30px" }
    }, {
      dataField: 'df2',
      isDummyField: true,
      text: '',
      formatter: this.deleteFormatter,
      headerStyle: { width: "30px" }
    }, {
      dataField: 'df3',
      isDummyField: true,
      text: '',
      formatter: this.codeFormatter,
      headerStyle: { width: "30px" }
    }];
    return hiddenCols.concat(editCols, cols, metricCols);
  }

  advertiserFormatter = (cellContent, row) => {
    if (!_.isNil(cellContent)) {
      return <Link to={`/segments/advertiser/${row.advertiserId}`}>{cellContent}</Link>;
    }
    return "-";
  }

  codeFormatter = (cellContent, row, rowIndex) => {
    const rowTooltip = <Tooltip id={"segment-code-tooltip-" + rowIndex}>{"Get individual segment code"}</Tooltip>;
    return <OverlayTrigger placement="top" overlay={rowTooltip}>
      <a onClick={(e) => { e.preventDefault(); this.props.codeClick(row.id) }} href="" className="table-btn"><span className="fa fa-code segment-code-btn"></span></a>
    </OverlayTrigger>;
  }

  editFormatter = (cellContent, row) => {
    const writeAccess = this.props.rights.MANAGE_SEGMENTS;
    if (writeAccess) {
      return <a onClick={(e) => { e.preventDefault(); this.props.editClick(row.id, writeAccess) }} href="" className="table-btn"><FontIcon name="pencil" /></a>
    } else {
      return <a onClick={(e) => { e.preventDefault(); this.props.editClick(row.id, writeAccess) }} href="" className="table-btn"><FontIcon name="search-plus" /></a>
    }
  }

  deleteFormatter = (cellContent, row) => {
    if (this.props.rights.MANAGE_SEGMENTS) {
      return <a onClick={(e) => { e.preventDefault(); this.props.deleteClick(row.id) }} href="" className="table-btn"><FontIcon name="remove" /></a>
    }
    return null;
  }

  getRows() {
    const metricValues = this.props.metrics.map((o) => { return o.col; });
    const advertisersMap = _.keyBy(this.props.advertisers, "id");
    metricValues.unshift("id");
    return this.props.records.map((o) => {
      let row = _.pick(o, metricValues);
      row.segmentName = o.segmentName;
      row.advertiserId = o.advertiserId;
      row.advertiserName = advertisersMap[o.advertiserId] ? advertisersMap[o.advertiserId].name : "";
      return row;
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
              id={this.tableId}
              bordered={false}
              classes="table-borderless"
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