import * as React from "react";
import BootstrapTable from "react-bootstrap-table-next";
import ToolkitProvider, { Search } from "react-bootstrap-table2-toolkit";
import paginationFactory from "react-bootstrap-table2-paginator";
import * as _ from "lodash";
import * as Utils from "../../../../../client/Utils";
import * as TableHelper from "../../../../../client/TableHelper";
import FontIcon from "../../../../UI/FontIcon";
import { Metric } from "../../../../../client/schemas";
import { Rights } from "../../../../../models/Common";
import { AppUser } from "../../../../../models/AppUser";
import { RetailBranch } from "../../../../../models/data/RetailBranch";

interface RetailBranchesTableProps {
  retailBranches: RetailBranch[];
  user: AppUser;
  rights: Rights;
  previewClick: (id: string | number) => void;
  editClick: (id: string | number) => void;
  deleteClick: (id: string | number) => void;
}

interface RetailBranchesTableState {
  page: number;
  sizePerPage: number | "all";
  defaultSorted: { dataField: string; order: string; };
}

export default class RetailBranchesTable extends React.Component<RetailBranchesTableProps, RetailBranchesTableState> {
  private tableId: string = "retailbranches-table";

  constructor(props, context) {
    super(props, context);

    this.state = {
      page: 1,
      sizePerPage: TableHelper.getInitialSizePerPage(this.tableId, this.props.user),
      defaultSorted: this.defaultSorted()
    };
  }

  metrics(): Metric[] {
    return [
      { col: 'branchId', label: 'id', align: 'left' },
      { col: 'name', label: 'name' },
      { col: 'country', label: 'country' },
      { col: 'region', label: 'region' },
      { col: 'city', label: 'city' }
    ];
  }

  getIsBranchIdNumeric() {
    const branchIds = this.props.retailBranches.map((o) => { return o.branchId });
    const numericIds = branchIds.filter((id) => { return Utils.isNumeric(id); });
    return branchIds.length === numericIds.length;
  }

  numericSort(a, b, order, dataField) {
    if (order === 'asc') {
      return parseInt(a) - parseInt(b);
    }
    return parseInt(b) - parseInt(a);
  }

  defaultSorted(): { dataField: string; order: string; } {
    return { dataField: 'branchId', order: 'asc' };
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
    const isBranchIdNumeric = this.getIsBranchIdNumeric();
    const metricCols: any[] = this.metrics().map((o) => {
      let metricCol: any = {
        dataField: o.col,
        text: o.label || o.col,
        align: o.align || "left",
        headerAlign: o.align || "left",
        sort: true,
        onSort: this.onSort,
        sortCaret: TableHelper.columnSort,
        formatter: TableHelper.getFormatter(o.type)
      };
      if (o.col === "branchId" && isBranchIdNumeric) {
        metricCol.sortFunc = this.numericSort;
      }
      return metricCol;
    });
    const editCols = [{
      dataField: 'df1',
      isDummyField: true,
      text: '',
      formatter: this.editFormatter,
      headerStyle: { width: "40px" }
    },
    {
      dataField: 'df2',
      isDummyField: true,
      text: '',
      formatter: this.deleteFormatter,
      headerStyle: { width: "40px" }
    },{
      dataField: 'df3',
      isDummyField: true,
      text: '',
      formatter: this.previewFormatter,
      headerStyle: { width: "40px" }
    }];
    return hiddenCols.concat(editCols, metricCols);
  }

  editFormatter = (cellContent, row) => {
    if (row.writeAccess) {
      return <a onClick={(e) => { e.preventDefault(); this.props.editClick(row.id) }} href="" className="table-btn mr-10"><FontIcon name="pencil" /></a>;
    } else {
      return "";
    }
  }

  previewFormatter = (cellContent, row) => {
   
      return <a onClick={(e) => { e.preventDefault(); this.props.previewClick(row.id) }} href="" className="table-btn mr-10"><FontIcon name="eye" /></a>;
  
  }

  deleteFormatter = (cellContent, row) => {
    if (row.writeAccess) {
      return <a onClick={(e) => { e.preventDefault(); this.props.deleteClick(row.id) }} href="" className="table-btn mr-10"><FontIcon name="remove" /></a>;
    }
    return null;
  }

  getRows() {
    const metricValues = this.metrics().map((o) => { return o.col; });
    const writeAccess = this.props.rights.MANAGE_ADVERTISER;
    return this.props.retailBranches.map((o) => {
      const row = _.pick(o, metricValues);
      const id = _.get(o, "id", -1);
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
                tableId={this.tableId}
                placeholder="Filter records"
              />
            </div>
            <BootstrapTable
              {...props.baseProps}
              classes="table-borderless"
              id={this.tableId}
              bordered={false}
              striped
              hover={true}
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
                  text: 'All', value: this.props.retailBranches.length
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