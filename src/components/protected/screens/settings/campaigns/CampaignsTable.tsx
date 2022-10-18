import React, { useState } from "react";
import { Link } from "react-router-dom";
import BootstrapTable from "react-bootstrap-table-next";
import ToolkitProvider, { Search } from "react-bootstrap-table2-toolkit";
import paginationFactory from "react-bootstrap-table2-paginator";
import { Tooltip, OverlayTrigger } from "react-bootstrap";
import FontIcon from "../../../../UI/FontIcon";
import * as _ from "lodash";
import * as Helper from "../../../../../client/Helper";
import * as TableHelper from "../../../../../client/TableHelper";
import { Metric } from "../../../../../client/schemas";
import { AppUser } from "../../../../../models/AppUser";
import { Rights } from "../../../../../models/Common";

interface CampaignsTableProps {
  records: any[];
  metrics: Metric[];
  user: AppUser;
  rights: Rights;
  type: "recent" | "older" | "archived";
  archiveClick?: (id: string | number) => void;
  restoreClick?: (id: string | number) => void;
  chartClick?: (id: number, type: "budget_completion" | "impression_completion") => void;
}

const CampaignsTable = (props: CampaignsTableProps) => {
  const tableId: string = `campaigns-table-${props.type}`;
  const [page, setPage] = useState<number>(1);
  const [sizePerPage, setSizePerPage] = useState<number | "all">(TableHelper.getInitialSizePerPage(tableId, props.user));
  const [defaultSorted, setDefaultSorted] = useState<{ dataField: string; order: string; }>(getDefaultSorted());

  function getDefaultSorted(): { dataField: string; order: string; } {
    if (props.type === "recent") {
      return { dataField: "endDate", order: "asc" };
    } else {
      return { dataField: "endDate", order: "desc" };
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

  const editFormatter = (cellContent, row) => {
    const to = Helper.campaignSettingsLink(`/settings/campaign/${row.id}/general`);
    if (row.writeAccess) {
      return <Link to={to}><FontIcon name="pencil" /></Link>
    } else {
      return <Link to={to}><FontIcon name="search-plus" /></Link>
    }
  }

  const archiveFormatter = (cellContent, row) => {
    if (row.writeAccess) {
      const rowTooltip = <Tooltip id={"archive-tooltip-" + row.id}>{"archive"}</Tooltip>;
      return <OverlayTrigger placement="top" overlay={rowTooltip}>
        <a onClick={(e) => { e.preventDefault(); props.archiveClick(row.id) }} href="" className="table-btn"><FontIcon name="archive" /></a>
      </OverlayTrigger>;
    }
    return null;
  }

  const restoreFormatter = (cellContent, row) => {
    if (row.writeAccess) {
      const rowTooltip = <Tooltip id={"restore-tooltip-" + row.id}>{"restore"}</Tooltip>;
      return <OverlayTrigger placement="top" overlay={rowTooltip}>
        <a onClick={(e) => { e.preventDefault(); props.restoreClick(row.id) }} href="" className="table-btn"><FontIcon name="repeat" /></a>
      </OverlayTrigger>;
    }
    return null;
  }

  const getHiddenCols = () => {
    return [{ dataField: 'writeAccess', text: '', hidden: true }, { dataField: 'remarks', text: '', hidden: true }];
  }

  const getEditCols = () => {
    if (props.type === "archived") {
      return [{
        dataField: 'df3',
        isDummyField: true,
        text: '',
        formatter: restoreFormatter,
        headerStyle: { width: "30px" }
      }];
    } else {
      return [{
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
        formatter: archiveFormatter,
        headerStyle: { width: "30px" }
      }];
    }
  }

  const getColumns = () => {
    const hiddenCols: any[] = getHiddenCols();
    const editCols = getEditCols();
    const metricCols: any[] = props.metrics.map((o) => {
      return {
        dataField: o.col,
        text: o.label || o.col,
        align: o.align || "left",
        headerAlign: o.align || "left",
        sort: true,
        onSort: onSort,
        sortCaret: TableHelper.columnSort,
        formatter: TableHelper.getFormatter(o.type, props.chartClick)
      }
    });
    return hiddenCols.concat(editCols, metricCols);
  }

  const getRows = () => {
    const metricValues = props.metrics.map((o) => { return o.col; });
    return props.records.map((o) => {
      const row = _.pick(o, metricValues);
      const id = _.get(o, "id", -1);
      const writeAccess = o.rights.MANAGE_CAMPAIGN;
      const remarks = (o.remarks || "").trim();
      return _.assign({ id, writeAccess, advertiserId: o.advertiserId, remarks }, row);
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
export default CampaignsTable;