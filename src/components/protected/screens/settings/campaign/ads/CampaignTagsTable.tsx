import React, { useState } from "react";
import BootstrapTable from "react-bootstrap-table-next";
import ToolkitProvider, { Search } from "react-bootstrap-table2-toolkit";
import paginationFactory from "react-bootstrap-table2-paginator";
import { Tooltip, OverlayTrigger } from "react-bootstrap";
import * as _ from "lodash";
import * as Helper from "../../../../../../client/Helper";
import * as TableHelper from "../../../../../../client/TableHelper";
import * as AdsHelper from "../../../../../../client/AdsHelper";
import FontIcon from "../../../../../UI/FontIcon";
import { CampaignBanner, CampaignTag } from "../../../../../../models/data/Campaign";

interface CampaignTagsTableProps {
  records: CampaignTag[];
  writeAccess: boolean;
  campaignBanners: CampaignBanner[];
  editClick: (editId: number) => void;
  previewClick: (previewId: number) => void;
}

const CampaignTagsTable = (props: CampaignTagsTableProps) => {
  const tableId: string = "campaign-tags-table";
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

  const previewFormatter = (cellContent, row, rowIndex) => {
    if(row.id > 0 && row.finalized && row.iframeTag) {
      const rowTooltip = <Tooltip id={`campaigntag-preview-tooltip-${rowIndex}`}>preview</Tooltip>;
      const popperConfig = Helper.getPopperConfig();
      return <OverlayTrigger placement="top" overlay={rowTooltip} popperConfig={popperConfig}>
        <a onClick={(e) => { e.preventDefault(); props.previewClick(row.id) }} href="" className="table-btn"><FontIcon name="eye" /></a>
      </OverlayTrigger>;
    }
    return null;
  }

  const editFormatter = (cellContent, row, rowIndex) => {
    const editText = props.writeAccess ? "edit" : "view";
    const editIcon = props.writeAccess ? "pencil" : "search-plus";
    const rowTooltip = <Tooltip id={`campaigntag-edit-tooltip-${rowIndex}`}>{editText}</Tooltip>;
    const popperConfig = Helper.getPopperConfig();
    return <OverlayTrigger placement="top" overlay={rowTooltip} popperConfig={popperConfig}>
      <a onClick={(e) => { e.preventDefault(); props.editClick(row.id) }} href="" className="table-btn"><FontIcon name={editIcon} /></a>
    </OverlayTrigger>;
  }

  const supportedSizesFormatter = (cellContent, row, rowIndex) => {
    return (cellContent as Array<string>).map((o, i) => <span className="ad-tag-size">{o}</span>);
  }

  function getColumns() {
    return [
      {
        dataField: "df1",
        isDummyField: true,
        text: '',
        formatter: editFormatter,
        headerStyle: { width: "30px" }
      },
      {
        dataField: "df2",
        isDummyField: true,
        text: '',
        formatter: previewFormatter,
        headerStyle: { width: "30px" }
      },
      {
        dataField: "id",
        text: "#",
        sort: true,
        onSort,
        sortCaret: TableHelper.columnSort,
        formatter: AdsHelper.idFormatter
      },
      {
        dataField: "name",
        text: "Name",
        sort: true,
        onSort,
        sortCaret: TableHelper.columnSort
      },
      {
        dataField: 'status',
        text: 'status',
        sort: true,
        onSort,
        sortFunc: AdsHelper.statusSort,
        sortCaret: TableHelper.columnSort,
        formatter: AdsHelper.statusFormatter
      },
      {
        dataField: 'supportedSizes',
        text: 'Supported sizes',
        sort: true,
        onSort,
        sortCaret: TableHelper.columnSort,
        formatter: supportedSizesFormatter
      },
      {
        dataField: 'iframe',
        text: 'IFrame',
        sort: true,
        onSort,
        sortCaret: TableHelper.columnSort,
        formatter: TableHelper.booleanFormatter
      },
      {
        dataField: 'javascript',
        text: 'Javascript',
        sort: true,
        onSort,
        sortCaret: TableHelper.columnSort,
        formatter: TableHelper.booleanFormatter
      },
      {
        dataField: 'tracking',
        text: 'Tracking',
        sort: true,
        onSort,
        sortCaret: TableHelper.columnSort,
        formatter: TableHelper.booleanFormatter
      },
      {
        dataField: "defaultBanner",
        text: "Default ad",
        sort: true,
        onSort,
        sortCaret: TableHelper.columnSort
      }
    ];
  }

  const statusColumn = (tag: CampaignTag): { color: string; title: string; } => {
    const color = tag.finalized ? 'green' : 'orange';
    const title = tag.finalized ? 'Tag is finalized and okay' : 'Tag not finalized yet; assign a default creative';

    return { color, title };
  }

  function getRows() {
    return props.records.map((o) => {
      const status = statusColumn(o);
      let defaultBanner = "";
      if (o.defaultCampaignBannerId) {
        const banner = props.campaignBanners.find((b) => { return b.id === o.defaultCampaignBannerId });
        if (banner) defaultBanner = banner.name;
      }
      return _.assign({}, o, { status, defaultBanner });
    });
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
export default CampaignTagsTable;