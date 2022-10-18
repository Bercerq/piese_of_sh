import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Button, Tooltip, OverlayTrigger } from "react-bootstrap";
import * as _ from "lodash";
import BootstrapTable from "react-bootstrap-table-next";
import ToolkitProvider, { Search } from "react-bootstrap-table2-toolkit";
import paginationFactory from "react-bootstrap-table2-paginator";
import * as TableHelper from "../../../../client/TableHelper";
import * as Helper from "../../../../client/Helper";
import * as AdsHelper from "../../../../client/AdsHelper";
import { AppUser } from "../../../../models/AppUser";
import { Ad, AdRow, AdUpdateAction } from "../../../../models/data/Ads";
import { LookUp, Rights } from "../../../../models/Common";
import FontIcon from "../../../UI/FontIcon";
import { AdvertiserEntity } from "../../../../models/data/Advertiser";

interface AdsTableProps {
  ads: Ad[];
  advertisers: AdvertiserEntity[];
  showAdvertiserCol: boolean;
  user: AppUser;
  rights: Rights;
  type: "active" | "inactive";
  update: (row: AdRow, action: AdUpdateAction, data: Partial<Ad>) => void;
  previewClick: (id: number, advertiserId: number) => void;
  shareClick: (id: number) => void;
  editClick: (id: number) => void;
  deleteClick: (id: number) => void;
  campaignsClick: (campaigns: LookUp[], row: AdRow) => void;
}

const AdsTable = (props: AdsTableProps) => {
  const tableId: string = `ads-table-${props.type}`;
  const [page, setPage] = useState<number>(1);
  const [sizePerPage, setSizePerPage] = useState<number | "all">(TableHelper.getInitialSizePerPage(tableId, props.user));
  const [defaultSorted, setDefaultSorted] = useState<{ dataField: string; order: string; }>({ dataField: "id", order: 'desc' });

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

  const getRows = (): AdRow[] => {
    const advertisersMap = _.keyBy(props.advertisers, "id");

    return props.ads.map((o) => {
      let row = _.pick(o, ["id", "name", "activeCampaigns", "type", "adType", "advertiserId", "cookieLess", "approved", "active"]);
      row.advertiserName = advertisersMap[o.advertiserId] ? advertisersMap[o.advertiserId].name : "";
      row.dimension = AdsHelper.dimensionDurationColumn(o);
      row.status = AdsHelper.statusColumn(o);
      row.fileSize = o.bannerMemSize;
      row.rehostStatus = o.requestRehost;
      return row;
    });
  }

  const advertiserFormatter = (cellContent, row) => {
    if (!_.isNil(cellContent)) {
      return <Link to={`/advault/advertiser/${row.advertiserId}`}>{cellContent}</Link>;
    }
    return "-";
  }

  const activateFormatter = (cellContent, row) => {
    const disabled = !props.rights.MANAGE_ADS;
    if (cellContent) {
      return <Button size="sm" variant="warning" onClick={() => { props.update(row, "deactivate", { active: 0 }); }} disabled={disabled}>DEACTIVATE</Button>;
    } else {
      return <Button size="sm" variant="success" onClick={() => { props.update(row, "activate", { active: 1 }); }} disabled={disabled}>ACTIVATE</Button>;
    }
  }

  const approveFormatter = (cellContent, row) => {
    const disabled = !props.rights.MANAGE_ADS;
    if (props.user.isRootAdmin) {
      if (cellContent === 1) {
        return <Button size="sm" variant="primary" onClick={() => { props.update(row, "disapprove", { approved: -1 }); }} disabled={disabled}>APPROVED</Button>;
      } else if (cellContent === -1) {
        return <Button size="sm" variant="primary" onClick={() => { props.update(row, "approve", { approved: 1 }); }} disabled={disabled}>DISAPPROVED</Button>;
      } else if (cellContent === -2) {
        return <Button size="sm" variant="primary" onClick={() => { props.update(row, "approve", { approved: 1 }); }} disabled={disabled}>NOT REQUESTED</Button>;
      } else if (cellContent === 0) {
        return <Button size="sm" variant="primary" onClick={() => { props.update(row, "approve", { approved: 1 }); }} disabled={disabled}>REQUESTED</Button>;
      }
    } else {
      if (cellContent === 1) {
        return <span className="text-success font-weight-bold">Approved</span>
      } else if (cellContent === -1) {
        return <span className="text-danger font-weight-bold">Disapproved</span>
      } else if (cellContent === -2) {
        return <Button size="sm" variant="primary" onClick={() => { props.update(row, "request", { approved: 0 }); }} disabled={disabled}>REQUEST</Button>;
      } else if (cellContent === 0) {
        return <Button size="sm" variant="primary" onClick={() => { props.update(row, "withdrawrequest", { approved: -2 }); }} disabled={disabled}>WITHDRAW REQUEST</Button>;
      }
    }
  }

  const editFormatter = (cellContent, row) => {
    const rowTooltip = <Tooltip id={"edit-tooltip-" + row.id}>edit</Tooltip>;
    const popperConfig = Helper.getPopperConfig();
    return <OverlayTrigger placement="top" overlay={rowTooltip} popperConfig={popperConfig}>
      <a onClick={(e) => { e.preventDefault(); props.editClick(row.id) }} href="" className="table-btn"><FontIcon name="pencil" /></a>
    </OverlayTrigger>;
  }

  const previewFormatter = (cellContent, row) => {
    const rowTooltip = <Tooltip id={"preview-tooltip-" + row.id}>preview</Tooltip>;
    const popperConfig = Helper.getPopperConfig();
    return <OverlayTrigger placement="top" overlay={rowTooltip} popperConfig={popperConfig}>
      <a onClick={(e) => { e.preventDefault(); props.previewClick(row.id, props.ads.find(ad => ad.id == row.id).advertiserId) }} href="" className="table-btn"><FontIcon name="eye" /></a>
    </OverlayTrigger>;
  }

  const shareFormatter = (cellContent, row) => {
    const isVideoAd = AdsHelper.isVideoAd(row.type);
    if (isVideoAd) {
      const rowTooltip = <Tooltip id={"share-tooltip-" + row.id}>share</Tooltip>;
      const popperConfig = Helper.getPopperConfig();
      return <OverlayTrigger placement="top" overlay={rowTooltip} popperConfig={popperConfig}>
        <a onClick={(e) => { e.preventDefault(); props.shareClick(row.id) }} href="" className="table-btn"><FontIcon name="share-alt" /></a>
      </OverlayTrigger>;
    }
    return null;
  }

  const deleteFormatter = (cellContent, row) => {
    if (props.rights.MANAGE_ADS) {
      const rowTooltip = <Tooltip id={"delete-tooltip-" + row.id}>remove</Tooltip>;
      const popperConfig = Helper.getPopperConfig();
      return <OverlayTrigger placement="top" overlay={rowTooltip} popperConfig={popperConfig}>
        <a onClick={(e) => { e.preventDefault(); props.deleteClick(row.id) }} href="" className="table-btn"><FontIcon name="remove" /></a>
      </OverlayTrigger>;
    }
    return null;
  }

  const campaignsFormatter = (cellContent, row) => {
    if (cellContent && cellContent.length > 0) {
      return <a onClick={(e) => { e.preventDefault(); props.campaignsClick(cellContent, row) }} href="">{cellContent.length}</a>
    }
    return "0";
  }

  const cookielessFormatter = (cellContent: any, row: any): JSX.Element | string => {
    if (cellContent) {
      return <span className="text-success"><FontIcon names={["check", "lg"]} /></span>;
    } else {
      if (props.user.isRootAdmin && row.adType == "Display (HTML)" || row.adType =="Display (3rd Party)") {
        const disabled = !props.rights.MANAGE_ADS;
        switch (row.rehostStatus ) {
          case 0: { return <Button size="sm" variant="info" onClick={() => 
            { props.update(row, "requestrehost", { requestRehost: 1 }); }}
             disabled={disabled}> <FontIcon names={["remove", "lg"]} /> REHOST</Button>;
          }
          case 1: {
            return <span className="rehost-status"><FontIcon names={["spinner", "pulse"]}/> rehosting</span>;
          }
          case 2 || 3: {
            return <span className="rehost-status"><FontIcon names={["remove", "lg"]}/> rehosted</span>;
          } 
          
        }
      } else {
        return <span className="text-danger"><FontIcon names={["remove", "lg"]} /></span>;
      }
    }
  }

  const getColumns = () => {
    const activeText = props.type === "active" ? "deactivate" : "activate";
    return [
      {
        dataField: 'df1',
        isDummyField: true,
        text: '',
        formatter: editFormatter,
        headerStyle: { width: "30px" }
      }, {
        dataField: 'df2',
        isDummyField: true,
        text: '',
        formatter: deleteFormatter,
        headerStyle: { width: "30px" }
      }, {
        dataField: 'df3',
        isDummyField: true,
        text: '',
        formatter: previewFormatter,
        headerStyle: { width: "30px" }
      }, {
        dataField: 'df4',
        isDummyField: true,
        text: '',
        formatter: shareFormatter,
      }, {
        dataField: 'id',
        text: '#',
        sort: true,
        onSort,
        sortCaret: TableHelper.columnSort,
      }, {
        dataField: 'advertiserId',
        hidden: true,
      }, {
        dataField: 'type',
        hidden: true,
      }, {
        dataField: 'name',
        text: 'name',
        sort: true,
        onSort,
        sortCaret: TableHelper.columnSort,
      }, {
        dataField: 'activeCampaigns',
        text: 'active campaigns',
        sort: true,
        onSort,
        sortCaret: TableHelper.columnSort,
        formatter: campaignsFormatter
      }, {
        dataField: 'advertiserName',
        text: 'advertiser',
        sort: true,
        hidden: !props.showAdvertiserCol,
        onSort,
        sortCaret: TableHelper.columnSort,
        formatter: advertiserFormatter
      }, {
        dataField: 'status',
        text: 'status',
        sort: true,
        onSort,
        sortFunc: AdsHelper.statusSort,
        sortCaret: TableHelper.columnSort,
        formatter: AdsHelper.statusFormatter
      }, {
        dataField: 'cookieLess',
        text: 'cookieless',
        sort: true,
        onSort,
        sortCaret: TableHelper.columnSort,
        formatter: cookielessFormatter
      }, {
        dataField: 'adType',
        text: 'ad type',
        sort: true,
        onSort,
        sortCaret: TableHelper.columnSort,
      }, {
        dataField: 'dimension',
        text: 'dimensions/duration',
        sort: true,
        onSort,
        sortCaret: TableHelper.columnSort,
      }, {
        dataField: 'fileSize',
        text: 'file size',
        sort: true,
        onSort,
        sortCaret: TableHelper.columnSort,
      }, {
        dataField: 'active',
        text: activeText,
        sort: true,
        onSort,
        sortCaret: TableHelper.columnSort,
        formatter: activateFormatter
      }, {
        dataField: 'approved',
        text: 'approval',
        sort: true,
        onSort,
        sortCaret: TableHelper.columnSort,
        formatter: approveFormatter
      },
    ];
  }

  const getCurrentPage = () => {
    const lastPage = TableHelper.getLastPage(props.ads, sizePerPage);
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
export default AdsTable;