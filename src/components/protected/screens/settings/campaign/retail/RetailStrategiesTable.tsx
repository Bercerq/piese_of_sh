import React, { useState } from "react";
import BootstrapTable from "react-bootstrap-table-next";
import ToolkitProvider, { Search } from "react-bootstrap-table2-toolkit";
import paginationFactory from "react-bootstrap-table2-paginator";
import { Popover, Tooltip, OverlayTrigger } from "react-bootstrap";
import * as _ from "lodash";
import * as Helper from "../../../../../../client/Helper";
import * as TableHelper from "../../../../../../client/TableHelper";
import FontIcon from "../../../../../UI/FontIcon";
import { RetailStrategy, StructureType } from "../../../../../../models/data/Campaign";

interface RetailStrategiesTableProps {
  records: RetailStrategy[];
  structure: StructureType;
  writeAccess: boolean;
  editClick: (editId: number) => void;
  deleteClick: (deleteId: number) => void;
}

interface RetailStrategyRow {
  branchId: string;
  name: string;
  budget: number;
  impressionCap: number;
  maxBid: number;
  radius: number;
  targetingZipCodes: string[];
}

const RetailStrategiesTable = (props: RetailStrategiesTableProps) => {
  const tableId: string = "retail-strategies-table";
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

  const deleteFormatter = (cellContent, row, rowIndex) => {
    if (props.writeAccess) {
      const rowTooltip = <Tooltip id={`retailstrategy-delete-tooltip-${rowIndex}`}>unlink</Tooltip>;
      const popperConfig = Helper.getPopperConfig();
      return <OverlayTrigger placement="top" overlay={rowTooltip} popperConfig={popperConfig}>
        <a onClick={(e) => { e.preventDefault(); props.deleteClick(row.retailBranchId) }} href="" className="table-btn"><FontIcon name="remove" /></a>
      </OverlayTrigger>;
    }
    return null;
  }

  const editFormatter = (cellContent, row, rowIndex) => {
    const editText = props.writeAccess ? "edit" : "view";
    const editIcon = props.writeAccess ? "pencil" : "search-plus";
    const rowTooltip = <Tooltip id={`retailstrategy-edit-tooltip-${rowIndex}`}>{editText}</Tooltip>;
    const popperConfig = Helper.getPopperConfig();
    return <OverlayTrigger placement="top" overlay={rowTooltip} popperConfig={popperConfig}>
      <a onClick={(e) => { e.preventDefault(); props.editClick(row.retailBranchId) }} href="" className="table-btn"><FontIcon name={editIcon} /></a>
    </OverlayTrigger>;
  }

  const targetingZipCodesFormatter = (cellContent, row, rowIndex) => {
    if (cellContent && cellContent.length > 0) {
      if (cellContent.length > 5) {
        const targetingZipCodes = cellContent.join(", ");
        const popoverHover = <Popover id={`retail-strategy-zip-${rowIndex}`}>
          <Popover.Content>{targetingZipCodes}</Popover.Content>
        </Popover>;
        const popperConfig = Helper.getPopperConfig();
        const targetingText = `${cellContent.slice(0, 5).join(", ")} and ${cellContent.length - 5} more`;
        return <OverlayTrigger trigger="hover" placement="right" overlay={popoverHover} popperConfig={popperConfig}>
          <span className="pointer">{targetingText}</span>
        </OverlayTrigger>;
      } else {
        return cellContent.join(", ");
      }
    }
    return "-";
  }

  function getColumns() {
    return [
      {
        dataField: 'df1',
        isDummyField: true,
        text: '',
        formatter: editFormatter,
        headerStyle: { width: "30px" }
      },
      {
        dataField: 'df2',
        isDummyField: true,
        text: '',
        formatter: deleteFormatter,
        headerStyle: { width: "30px" }
      },
      {
        dataField: 'retailBranchId',
        hidden: true,
      },
      {
        dataField: 'branchId',
        text: '#',
        sort: true,
        onSort,
        sortCaret: TableHelper.columnSort
      },
      {
        dataField: 'name',
        text: 'Name',
        sort: true,
        onSort,
        sortCaret: TableHelper.columnSort
      },
      {
        dataField: "budget",
        text: "Budget",
        sort: true,
        onSort,
        sortCaret: TableHelper.columnSort,
        formatter: TableHelper.currencyFormatter
      },
      {
        dataField: "impressionCap",
        text: "Impressions",
        sort: true,
        onSort,
        sortCaret: TableHelper.columnSort,
        formatter: TableHelper.numberFormatter
      },
      {
        dataField: "maxBid",
        text: "Max bid",
        sort: true,
        onSort,
        sortCaret: TableHelper.columnSort,
        formatter: TableHelper.currencyFormatter
      },
      getTargetingCol()
    ];
  }

  function getTargetingCol() {
    if (props.structure === "RETAIL_GPS") {
      return {
        dataField: "radius",
        text: "Radius",
        sort: true,
        onSort,
        sortCaret: TableHelper.columnSort,
        formatter: TableHelper.numberFormatter
      };
    } else {
      return {
        dataField: "targetingZipCodes",
        text: "Postal codes",
        sort: true,
        onSort,
        sortCaret: TableHelper.columnSort,
        formatter: targetingZipCodesFormatter
      };
    }
  }

  function getRows(): RetailStrategyRow[] {
    return props.records.map((retailStrategy) => {
      const branchId = _.get(retailStrategy, "retailBranch.branchId");
      const retailBranchId = _.get(retailStrategy, "retailBranchId");
      const name = _.get(retailStrategy, "retailBranch.name");
      const budget = _.get(retailStrategy, "campaignConstraints.budget");
      const impressionCap = _.get(retailStrategy, "campaignConstraints.impressionCap");
      const maxBid = _.get(retailStrategy, "campaignConstraints.maxBid");
      const radius = _.get(retailStrategy, "geoTargeting.radius") || _.get(retailStrategy, "retailBranch.radius");
      const targetingZipCodes = _.get(retailStrategy, "geoTargeting.targetingZipCodes") || _.get(retailStrategy, "retailBranch.targetingZipCodes") || [];
      return {
        branchId,
        retailBranchId,
        name,
        budget,
        impressionCap,
        maxBid,
        radius,
        targetingZipCodes
      }
    })
  }

  function getCurrentPage() {
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
            keyField="id"
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
export default RetailStrategiesTable;