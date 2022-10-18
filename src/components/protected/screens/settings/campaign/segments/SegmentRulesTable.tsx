import React, { useState } from "react";
import BootstrapTable from "react-bootstrap-table-next";
import ToolkitProvider, { Search } from "react-bootstrap-table2-toolkit";
import paginationFactory from "react-bootstrap-table2-paginator";
import { Tooltip, OverlayTrigger } from "react-bootstrap";
import * as _ from "lodash";
import * as Helper from "../../../../../../client/Helper";
import * as TableHelper from "../../../../../../client/TableHelper";
import FontIcon from "../../../../../UI/FontIcon";
import { SegmentRule, RulePeriodType } from "../../../../../../models/data/Campaign";
import { Segment } from "../../../../../../models/data/Segment";

interface SegmentRulesTableProps {
  records: SegmentRule[];
  segments: Segment[];
  writeAccess: boolean;
  deleteClick: (deleteId: number) => void;
  editClick: (editId: number) => void;
}

const SegmentRulesTable = (props: SegmentRulesTableProps) => {
  const tableId: string = "campaign-segments-table";
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
      const rowTooltip = <Tooltip id={`segment-delete-tooltip-${row.id}`}>delete</Tooltip>;
      const popperConfig = Helper.getPopperConfig();
      return <OverlayTrigger placement="top" overlay={rowTooltip} popperConfig={popperConfig}>
        <a onClick={(e) => { e.preventDefault(); props.deleteClick(row.id) }} href="" className="table-btn"><FontIcon name="remove" /></a>
      </OverlayTrigger>;
    }
    return null;
  }

  const editFormatter = (cellContent, row, rowIndex) => {
    const editText = props.writeAccess ? "edit" : "view";
    const editIcon = props.writeAccess ? "pencil" : "search-plus";
    const rowTooltip = <Tooltip id={`segment-edit-tooltip-${row.id}`}>{editText}</Tooltip>;
    const popperConfig = Helper.getPopperConfig();
    return <OverlayTrigger placement="top" overlay={rowTooltip} popperConfig={popperConfig}>
      <a onClick={(e) => { e.preventDefault(); props.editClick(row.id) }} href="" className="table-btn"><FontIcon name={editIcon} /></a>
    </OverlayTrigger>;
  }

  function getColumns() {
    return [
      { dataField: 'segmentId', text: '#', hidden: true },
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
        dataField: 'displayName',
        text: 'Name',
        sort: true,
        onSort,
        sortCaret: TableHelper.columnSort,
      },
      {
        dataField: 'type',
        text: 'Type',
        sort: true,
        onSort,
        sortCaret: TableHelper.columnSort
      },
      {
        dataField: 'lastEvent',
        text: 'Active',
        sort: true,
        onSort,
        sortCaret: TableHelper.columnSort,
        formatter: TableHelper.segmentActiveFormatter,
      },
      {
        dataField: 'targeting',
        text: 'Targeting',
        sort: true,
        onSort,
        sortCaret: TableHelper.columnSort
      },
      {
        dataField: 'period',
        text: 'Period',
        sort: true,
        onSort,
        sortCaret: TableHelper.columnSort
      },
    ];
  }

  function getTargetingField(rule: SegmentRule) {
    const action = _.get(rule, "consequence.action");
    switch (action) {
      case "REQUIRED": return "bid";
      case "LIMIT_BID": return `bid no more than ${_.get(rule, "consequence.limitBid")}€`;
      case "NO_BID": return "no bid";
    }
  }

  function getPeriodField(rule: SegmentRule) {
    const unit: RulePeriodType = _.get(rule, "addedInPast.timeUnit", "");
    const time: number = _.get(rule, "addedInPast.time");
    let unitText = unit.toLowerCase();
    if (time > 1) {
      unitText += "s";
    }
    return `${time} ${unitText}`;
  }

  function getRows() {
    const segmentsMap: { [key: number]: Segment; } = props.segments.reduce((acc, segment) => {
      acc[segment.id] = segment;
      return acc;
    }, {});
    return props.records.map((o, i) => {
      const segment = segmentsMap[o.segmentId];
      return {
        id: i,
        segmentId: o.segmentId,
        displayName: o.displayName,
        type: _.get(segment, "type", ""),
        lastEvent: _.get(segment, "lastEvent"),
        targeting: getTargetingField(o),
        period: getPeriodField(o)
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
              }, {
                text: 'All', value: (props.records || []).length
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
export default SegmentRulesTable;