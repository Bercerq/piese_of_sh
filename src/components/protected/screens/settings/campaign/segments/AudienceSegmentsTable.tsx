import React, { useState } from "react";
import BootstrapTable from "react-bootstrap-table-next";
import ToolkitProvider, { Search } from "react-bootstrap-table2-toolkit";
import paginationFactory from "react-bootstrap-table2-paginator";
import * as _ from "lodash";
import * as TableHelper from "../../../../../../client/TableHelper";
import { DATargeting } from "../../../../../../models/data/Attribute";
import { AttributeValueName } from "../../../../../../models/data/Campaign";
import FontIcon from "../../../../../UI/FontIcon";

interface AudienceSegmentsTableProps {
  digitalAudienceValues: string[];
  daTargeting: DATargeting;
}

const AudienceSegmentsTable = (props: AudienceSegmentsTableProps) => {
  const tableId: string = "campaign-dasegments-table";
  const [page, setPage] = useState<number>(1);
  const [sizePerPage, setSizePerPage] = useState<number | "all">(30);
  const [defaultSorted, setDefaultSorted] = useState<{ dataField: string; order: string; }>({ dataField: "id", order: 'desc' });

  const columns = getColumns();
  const rows = getRows();

  const onSort = (dataField, order) => {
    setDefaultSorted({ dataField, order });
  }

  const onPageChange = (page, sizePerPage) => {
    setPage(page);
  };

  const onSizePerPageChange = (sizePerPage, page) => {
    setSizePerPage(sizePerPage);
  };

  function getColumns() {
    return [
      {
        dataField: 'name',
        text: 'Name',
        sort: true,
        onSort,
        sortCaret: TableHelper.columnSort,
      },
      {
        dataField: 'cpm',
        text: 'CPM price (cents)',
        sort: true,
        onSort,
        sortCaret: TableHelper.columnSort,
      },
      {
        dataField: 'action',
        text: 'Action',
        sort: true,
        onSort,
        sortCaret: TableHelper.columnSort,
      },
      {
        dataField: 'selected',
        text: 'Selected segments',
        sort: true,
        onSort,
        sortCaret: TableHelper.columnSort,
      },
    ];
  }

  function getRows(): { name: string, cpm: number, action: string, selected: string }[] {
    const segmentIds = _.get(props, "digitalAudienceValues", []);
    const nodes = getLeafNodes(_.get(props, "daTargeting.children", []), []);
    const selectedNodes = nodes.filter((n) => {
      const segmentId = _.get(n, "segmentId") || -1;
      return segmentIds.indexOf(segmentId.toString()) > -1 
    });
    const selectedData = _.groupBy(selectedNodes, 'attributeName');
    const rows = [];
    _.forEach(selectedData, (segments, parent) => {
      const cpmData = _.maxBy(segments, 'cpmPriceCents');
      const selected = segments.map((s) => { return s.name; }).join(", ");
      rows.push({
        name: parent,
        cpm: _.get(cpmData, "cpmPriceCents"),
        action: "bid",
        selected
      })
    });

    return rows;
  }

  function getLeafNodes(nodes, result) {
    nodes.forEach((el) => {
      if (el.children && el.children.length > 0) {
        getLeafNodes(el.children, result);
      } else {
        result.push(el);
      }
    });
    return result;
  }

  const getCurrentPage = () => {
    const lastPage = TableHelper.getLastPage(rows, sizePerPage);
    if (page > lastPage) {
      return lastPage;
    } else {
      return page;
    }
  }

  const { SearchBar } = Search;
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
export default AudienceSegmentsTable;