import React, { useState } from "react";
import BootstrapTable from "react-bootstrap-table-next";
import ToolkitProvider, { Search } from "react-bootstrap-table2-toolkit";
import paginationFactory from "react-bootstrap-table2-paginator";
import { Tooltip, OverlayTrigger } from "react-bootstrap";
import * as _ from "lodash";
import moment from "moment";
import * as Utils from "../../../../../../client/Utils";
import * as Helper from "../../../../../../client/Helper";
import * as TableHelper from "../../../../../../client/TableHelper";
import * as AdsHelper from "../../../../../../client/AdsHelper";
import FontIcon from "../../../../../UI/FontIcon";
import { CampaignBanner, CampaignTag } from "../../../../../../models/data/Campaign";

interface CampaignAdsTableProps {
  records: CampaignBanner[];
  writeAccess: boolean;
  isAdserving: boolean;
  videoCampaign: boolean;
  tags?: CampaignTag[];
  editClick: (editId: number) => void;
  previewClick: (previewId: number) => void;
  shareClick?: (shareId: number) => void;
  deleteClick: (deleteId: number) => void;
}

export interface CampaignBannerRow {
  id?: number;
  bannerId: number;
  campaignId: number;
  name: string;
  active: 0 | 1;
  status: { color: string; title: string; };
  dimension: string;
  fileSize: number;
  cookieLess: 0 | 1;
  adWorking: boolean;
  hostAt3rdParty?: string;
  approved?: -1 | 1 | 0 | -2;
  startTime: number;
  endTime: number;
  adType: string;
  previewTag?: string;
  clickUrl?: string;
  tagId?: number;
  tagName?: string;
  defaultForTag?: boolean;
}

const CampaignAdsTable = (props: CampaignAdsTableProps) => {
  const tableId: string = "campaign-ads-table";
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
    if (props.writeAccess && !row.defaultForTag) {
      const rowTooltip = <Tooltip id={`campaignad-delete-tooltip-${rowIndex}`}>unlink</Tooltip>;
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
    const rowTooltip = <Tooltip id={`campaignad-edit-tooltip-${rowIndex}`}>{editText}</Tooltip>;
    const popperConfig = Helper.getPopperConfig();
    return <OverlayTrigger placement="top" overlay={rowTooltip} popperConfig={popperConfig}>
      <a onClick={(e) => { e.preventDefault(); props.editClick(row.id) }} href="" className="table-btn"><FontIcon name={editIcon} /></a>
    </OverlayTrigger>;
  }

  const previewFormatter = (cellContent, row, rowIndex) => {
    const rowTooltip = <Tooltip id={`campaignad-preview-tooltip-${rowIndex}`}>preview</Tooltip>;
    const popperConfig = Helper.getPopperConfig();
    return <OverlayTrigger placement="top" overlay={rowTooltip} popperConfig={popperConfig}>
      <a onClick={(e) => { e.preventDefault(); props.previewClick(row.id) }} href="" className="table-btn"><FontIcon name="eye" /></a>
    </OverlayTrigger>;
  }

  const shareFormatter = (cellContent, row, rowIndex) => {
    const bannerId = _.get(row, "bannerId");
    if (props.videoCampaign && bannerId > 0) {
      const rowTooltip = <Tooltip id={`campaignad-share-tooltip-${rowIndex}`}>share</Tooltip>;
      const popperConfig = Helper.getPopperConfig();
      return <OverlayTrigger placement="top" overlay={rowTooltip} popperConfig={popperConfig}>
        <a onClick={(e) => { e.preventDefault(); props.shareClick(bannerId) }} href="" className="table-btn"><FontIcon name="share-alt" /></a>
      </OverlayTrigger>;
    }
    return null;
  }

  const startDateFormatter = (cellContent: any, row: any): JSX.Element | string => {
    if (!_.isNil(cellContent)) {
      const momentDt = moment.unix(cellContent);
      return Utils.getStartDate(momentDt);
    }
    return "Campaign";
  }

  const endDateFormatter = (cellContent: any, row: any): JSX.Element | string => {
    if (!_.isNil(cellContent)) {
      const momentDt = moment.unix(cellContent);
      return Utils.getEndDate(momentDt);
    }
    return "Campaign";
  }

  function getFieldColumn(field, text) {
    return {
      dataField: field,
      text,
      sort: true,
      onSort,
      sortCaret: TableHelper.columnSort
    };
  }

  function getDummyFieldColumn(field, formatter) {
    return {
      dataField: field,
      isDummyField: true,
      text: '',
      formatter,
      headerStyle: { width: "30px" }
    };
  }

  function getIdColumn() {
    return {
      dataField: "bannerId",
      text: "#",
      sort: true,
      onSort,
      sortCaret: TableHelper.columnSort,
      formatter: AdsHelper.idFormatter
    };
  }

  function getStatusColumn() {
    return {
      dataField: 'status',
      text: 'status',
      sort: true,
      onSort,
      sortFunc: AdsHelper.statusSort,
      sortCaret: TableHelper.columnSort,
      formatter: AdsHelper.statusFormatter
    }
  }

  function getCookielessColumn() {
    return {
      dataField: 'cookieLess',
      text: 'cookieless',
      sort: true,
      onSort,
      sortCaret: TableHelper.columnSort,
      formatter: TableHelper.booleanFormatter
    };
  }

  function getStartDateColumn() {
    return {
      dataField: 'startTime',
      text: 'Start date',
      sort: true,
      onSort,
      sortCaret: TableHelper.columnSort,
      formatter: startDateFormatter
    };
  }

  function getEndDateColumn() {
    return {
      dataField: 'endTime',
      text: 'End date',
      sort: true,
      onSort,
      sortCaret: TableHelper.columnSort,
      formatter: endDateFormatter
    };
  }

  function getDefaultForTagColumn() {
    return {
      dataField: 'defaultForTag',
      text: 'Default for tag',
      sort: true,
      onSort,
      sortCaret: TableHelper.columnSort,
      formatter: TableHelper.booleanFormatter
    };
  }


  function getColumns() {
    const editCol = getDummyFieldColumn("df1", editFormatter);
    const deleteCol = getDummyFieldColumn("df2", deleteFormatter);
    const previewCol = getDummyFieldColumn("df3", previewFormatter);
    const idCol = getIdColumn();
    const nameCol = getFieldColumn("name", "Name");
    const statusCol = getStatusColumn();
    const cookielessCol = getCookielessColumn();
    const startDateCol = getStartDateColumn();
    const endDateCol = getEndDateColumn();
    const adTypeCol = getFieldColumn("adType", "Ad type");
    const dimensionCol = props.videoCampaign ? getFieldColumn("dimension", "Duration") : getFieldColumn("dimension", "Banner dimensions");
    const fileSizeCol = getFieldColumn("fileSize", "File size");

    if (props.videoCampaign) {
      const shareCol = getDummyFieldColumn("df4", shareFormatter);
      return [editCol, deleteCol, previewCol, shareCol, idCol, nameCol, statusCol, cookielessCol, startDateCol, endDateCol, adTypeCol, dimensionCol, fileSizeCol];
    } else if (props.isAdserving) {
      const tagCol = getFieldColumn("tagName", "Tag");
      const defaultForTagCol = getDefaultForTagColumn();
      return [editCol, deleteCol, previewCol, idCol, tagCol, defaultForTagCol, nameCol, statusCol, cookielessCol, startDateCol, endDateCol, adTypeCol, dimensionCol, fileSizeCol];
    } else {
      return [editCol, deleteCol, previewCol, idCol, nameCol, statusCol, cookielessCol, startDateCol, endDateCol, adTypeCol, dimensionCol, fileSizeCol];
    }
  }

  function getRows(): CampaignBannerRow[] {
    return props.records.map((o) => {
      let row: CampaignBannerRow = {
        id: o.id,
        bannerId: o.bannerId,
        active: o.active,
        clickUrl: o.clickUrl,
        campaignId: o.campaignId,
        name: o.name,
        previewTag: o.banner.previewTag,
        dimension: AdsHelper.dimensionDurationColumn(o.banner),
        status: AdsHelper.statusColumn(o.banner),
        fileSize: _.get(o.banner, "bannerMemSize", 0),
        adType: o.banner.adType,
        startTime: o.startTime,
        endTime: o.endTime,
        cookieLess: o.banner.cookieLess,
        adWorking: o.banner.adWorking,
        hostAt3rdParty: o.banner.hostAt3rdParty,
        approved: o.banner.approved
      };
      if (props.isAdserving) {
        const tag = props.tags.find((t) => { return t.id === o.tagId });
        row.tagId = o.tagId;
        row.tagName = _.get(tag, "name", "");
        row.defaultForTag = tag ? tag.defaultCampaignBannerId === o.id : false;
      }
      return row;
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
export default CampaignAdsTable;