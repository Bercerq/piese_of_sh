import React, { useState, useEffect } from "react";
import BootstrapTable from "react-bootstrap-table-next";
import ToolkitProvider, { Search } from "react-bootstrap-table2-toolkit";
import paginationFactory from "react-bootstrap-table2-paginator";
import * as _ from "lodash";
import { RetailBranch } from "../../../../../models/data/RetailBranch";
import * as TableHelper from "../../../../../client/TableHelper";
import FontIcon from "../../../../UI/FontIcon";

interface RetailBranchesSelectTableProps {
  records: RetailBranch[];
  onChange: (retailBranches: number[]) => void;
}

const RetailBranchesSelectTable = (props: RetailBranchesSelectTableProps) => {
  const tableId: string = `retailbranches-select-table`;
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

  function getColumns() {
    return [
      {
        dataField: 'id',
        hidden: true,
      },
      {
        dataField: 'branchId', //TODO if number sort function
        text: 'Id',
        sort: true,
        onSort,
        sortCaret: TableHelper.columnSort,
      }, {
        dataField: 'name',
        text: 'name',
        sort: true,
        onSort,
        sortCaret: TableHelper.columnSort,
      },
      {
        dataField: 'country',
        text: 'country',
        sort: true,
        onSort,
        sortCaret: TableHelper.columnSort,
      },
      {
        dataField: 'region',
        text: 'region',
        sort: true,
        onSort,
        sortCaret: TableHelper.columnSort,
      },
      {
        dataField: 'city',
        text: 'city',
        sort: true,
        onSort,
        sortCaret: TableHelper.columnSort,
      }
    ]
  }

  function getRows() {
    return props.records.map((o) => {
      return _.pick(o, ["id", "branchId", "name", "country", "region", "city"]);
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
export default RetailBranchesSelectTable;