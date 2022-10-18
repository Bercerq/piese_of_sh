import React, { useState, useEffect } from "react";
import BootstrapTable from "react-bootstrap-table-next";
import ToolkitProvider, { Search } from "react-bootstrap-table2-toolkit";
import paginationFactory from "react-bootstrap-table2-paginator";
import { Popover, OverlayTrigger } from "react-bootstrap";
import * as _ from "lodash";
import * as Helper from "../../../../../../client/Helper";
import * as TableHelper from "../../../../../../client/TableHelper";
import FontIcon from "../../../../../UI/FontIcon";
import { Deal } from "../../../../../../models/data/Deal";

interface DealsSelectTableProps {
  records: Deal[];
  onChange: (dealIds: number[]) => void;
}

const DealsSelectTable = (props: DealsSelectTableProps) => {
  const tableId: string = `deals-select-table`;
  const [page, setPage] = useState<number>(1);
  const [sizePerPage, setSizePerPage] = useState<number>(10);
  const [defaultSorted, setDefaultSorted] = useState<{ dataField: string; order: string; }>({ dataField: "id", order: 'desc' });
  const [selected, setSelected] = useState<number[]>([]);

  const { SearchBar } = Search;
  const columns = getColumns();
  const rows = getRows();

  useEffect(() => {
    props.onChange(selected);
  }, [JSON.stringify(selected)]);

  const onSort = (dataField, order) => {
    setDefaultSorted({ dataField, order });
  }

  const onPageChange = (page, sizePerPage) => {
    setPage(page);
  };

  const onSizePerPageChange = (sizePerPage, page) => {
    setSizePerPage(sizePerPage);
  };

  const handleOnSelect = (row, isSelect) => {
    if (isSelect) {
      setSelected([...selected, row.id]);
    } else {
      setSelected(selected.filter((id) => { return id !== row.id; }));
    }
  }

  const handleOnSelectAll = (isSelect) => {
    const selected = rows.map((r) => { return r.id; });
    if (isSelect) {
      setSelected(selected);
    } else {
      setSelected([]);
    }
  }

  function getCurrentPage() {
    const lastPage = TableHelper.getLastPage(props.records, sizePerPage);
    if (page > lastPage) {
      return lastPage;
    } else {
      return page;
    }
  }

  const nameFormatter = (cellContent, row, rowIndex) => {
    if (row.description) {
      const popperConfig = Helper.getPopperConfig();
      const popoverHover = <Popover id={`popover-deals-hover-${rowIndex}`}>
        <Popover.Content>{row.description}</Popover.Content>
      </Popover>;

      return <OverlayTrigger trigger="hover" placement="top" overlay={popoverHover} popperConfig={popperConfig}>
        <div>{cellContent}</div>
      </OverlayTrigger>;
    } else {
      return cellContent;
    }
  }

  function getColumns() {
    return [
      { dataField: 'id', text: '#', hidden: true },
      {
        dataField: 'externalId',
        text: 'External id',
        sort: true,
        onSort,
        sortCaret: TableHelper.columnSort
      },
      {
        dataField: 'ssp',
        text: 'SSP',
        sort: true,
        onSort,
        sortCaret: TableHelper.columnSort
      },
      {
        dataField: 'name',
        text: 'Name',
        sort: true,
        onSort,
        sortCaret: TableHelper.columnSort,
        formatter: nameFormatter
      },
      {
        dataField: 'owner',
        text: 'Owner',
        sort: true,
        onSort,
        sortCaret: TableHelper.columnSort
      },
    ];
  }

  function getRows() {
    return props.records.map((o) => {
      let row: any = _.pick(o, ["id", "externalId", "ssp", "name", "description"]);
      row.owner = _.get(o, "scope.owner");
      return row;
    });
  }

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
            selectRow={{
              mode: "checkbox",
              clickToSelect: true,
              classes: "selected",
              selected,
              onSelect: handleOnSelect,
              onSelectAll: handleOnSelectAll
            }}
            defaultSorted={[defaultSorted]}
            pagination={paginationFactory({
              page: getCurrentPage(),
              sizePerPage,
              showTotal: true,
              prePageText: "Previous",
              nextPageText: "Next",
              sizePerPageList: [{
                text: '10', value: 10
              }, {
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
export default DealsSelectTable;