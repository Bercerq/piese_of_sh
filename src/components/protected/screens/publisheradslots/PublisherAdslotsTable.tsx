import * as React from "react";
import * as _ from "lodash";
import { Button } from "react-bootstrap";
import BootstrapTable from "react-bootstrap-table-next";
import Loader from "../../../UI/Loader";
import ToolkitProvider, { Search } from "react-bootstrap-table2-toolkit";
import * as moment from "moment";
import * as TableHelper from "../../../../client/TableHelper";
import CollapsingButton from "./CollapsingButton"
import { OverwritableProperty, flattenAdslotCategories, flattenAdslotCustoms } from "./OverwritableProperty"
import PublisherAdslotModal from "./PublisherAdslotModal"
import PublisherCategoryModal from "./PublisherCategoryModal"
import { PlacementProperties, PublisherAdslot, PublisherAdslotCategory, PublisherSite, SiteProperties } from "../../../../models/data/PublisherAdslot";
import * as Api from "../../../../client/Api";
import FontIcon from "../../../UI/FontIcon";


interface PublisherAdSlotTableProps {
  adCategories: Array<PublisherAdslotCategory>;
  site: PublisherSite,
  setNumberCategories: (Number) => void;
  setNumberAdslots: (Number) => void;
  setAdSlotNames: (adslot: Array<string>) => void;
  checkUniqueName: (name: string) => boolean;
  setReload: boolean;
  allowedCustoms: OverwritableProperty[];
  adType: String;
  publisherId: Number;
  siteId: Number;
  adslotsCollapsed: Boolean;
}

interface PublisherSiteRow {
  name: string,
  rowId: string,
  custom: Map<String, String[]>,
  categorySettings?: PublisherAdslotCategory,
  siteSettings?: PublisherSite
  placementData?: PlacementProperties,
  exampleUrl?: String,
  divId?: String,
  numChildren?: Number,
  customFormat: OverwritableProperty[],
  originalId: Number,
}


const PublisheAdslotsTable = (props: PublisherAdSlotTableProps) => {


  const tableId: string = "publisher-adslots-table";
  const [adCategories, setAdCategories] = React.useState<Array<PublisherAdslotCategory>>(props.adCategories)
  const [adSlots, setAdSlots] = React.useState<Array<PublisherAdslot>>(props.adCategories.flatMap(a  => a.adslots))
  const [rows, setRows] = React.useState<PublisherSiteRow[]>([])
  const [defaultSorted, setDefaultSorted] = React.useState<{ dataField: string; order: string; }>({ dataField: "id", order: 'desc' });
  const [showRequestsLoader, setShowRequestsLoader] = React.useState<boolean>(false);
  const [expanded, setExpanded] = React.useState<Array<string>>([])
  const [hidden, setHidden] = React.useState<Array<string>>([])
  const [editCategory, setEditCategory] = React.useState<PublisherAdslotCategory>()
  const [showEditCategoryModal, setShowEditCategoryModal] = React.useState<boolean>(false)
  const [editAdslot, setEditAdslot] = React.useState<PublisherAdslot>()
  const [showEditAdslotModal, setShowEditAdslotModal] = React.useState<boolean>(false)
  const [showInherited, setShowInherited] = React.useState<boolean>(false)


  React.useEffect(() => {
    setExpandState(rows, [], () => props.adslotsCollapsed)
  }, [props.adslotsCollapsed])

  React.useEffect(() => {
    if (props.setReload) {
      setShowRequestsLoader(true)
    }
  }, [props.setReload])

  React.useEffect(() => {
    if (showRequestsLoader) {
      loadAdslots();
    }
  }, [showRequestsLoader]);


  const setExpandState = (newRows: PublisherSiteRow[], excludedRows: PublisherSiteRow[], checkExpandState: (PublisherSite) => Boolean) => {
    //check the non excluded rows on whether they need to be expanded
    const excludedSet = new Set(excludedRows.map(a => a.rowId));
    const expandedRowsInExcludedRows = expanded.filter(id => excludedSet.has(id as string))
    const expanding = newRows
      .filter(a => !excludedSet.has(a.rowId))
      .filter(a => checkIfExpandingRow(a))
      .filter(a => checkExpandState(a))
      .map(a => a?.rowId)
      .concat(expandedRowsInExcludedRows)
    setExpanded(() => {
      //set the children of all not-expanded rows to hidden
      const expandingSet = new Set(expanding);
      const hidden = newRows
        .filter(a => !checkIfExpandingRow(a))
        .filter(a => !expandingSet.has(getParentRowId(a).toString()))
        .map(a => a.rowId);
      setHidden(hidden);
      return expanding;
    });
  }

  React.useEffect(() => {
    setRows(() => {
      //load the current rows and check for new rows that  have been added since last load
      //which need to be expanded by default.
      const oldRows = rows
      const newRows = getRows();
      setExpandState(newRows, oldRows, () => props.adslotsCollapsed)
      return newRows;
    });
  }, [adCategories]);


  const checkIfExpandingRow = (row: PublisherSiteRow) => {
    return (row.numChildren !== undefined);
  }

  const getParentRowId = (row: PublisherSiteRow) => {
    return row?.categorySettings.id
  }

  const transformPublisherCategoryToRow = (publisherCategory: PublisherAdslotCategory, defaultOverwritableProperties: OverwritableProperty[]): PublisherSiteRow => {
    return {
      name: publisherCategory.name as string,
      custom: publisherCategory.customProperties,
      rowId: publisherCategory.id.toString(),
      exampleUrl: publisherCategory.exampleUrl,
      siteSettings: publisherCategory.siteSettings,
      numChildren: publisherCategory.adslots?.length,
      customFormat: flattenAdslotCategories("category", publisherCategory, defaultOverwritableProperties),
      originalId: publisherCategory.id,
    }
  }

  const transformPublisherAdslotToRow = (publisherAdslot: PublisherAdslot, defaultOverwritableProperties: OverwritableProperty[],
    parent: PublisherAdslotCategory, parentId: Number, rowNumber: Number): PublisherSiteRow => {
    return {
      name: publisherAdslot.name as string,
      custom: publisherAdslot.customProperties,
      rowId: parentId + "." + rowNumber,
      exampleUrl: publisherAdslot.exampleUrl,
      divId: publisherAdslot?.placementProperties?.divId,
      categorySettings: parent,
      siteSettings: parent?.siteSettings,
      customFormat: flattenAdslotCustoms(publisherAdslot, defaultOverwritableProperties),
      placementData: publisherAdslot?.placementProperties,
      originalId: publisherAdslot.id,
    }
  }

  const getRows = (): PublisherSiteRow[] => {
    let x = adCategories.flatMap((adslotCategory) => {
      let parent = transformPublisherCategoryToRow(adslotCategory, props.allowedCustoms);
      let rowNumber = 0;
      return [parent, ...adslotCategory.adslots.map(adslot => {
        rowNumber = rowNumber + 1;
        return transformPublisherAdslotToRow(adslot, props.allowedCustoms, adslotCategory, adslotCategory.id, rowNumber)
      })
      ];
    });
    return x;
  }

  const formatDeviceSize = (placementProperties: PlacementProperties) => {
    if (placementProperties) {
      return <p>
        {(placementProperties?.anyDeviceSizes) ?
          <p><b>All devices: </b>{placementProperties?.anyDeviceSizes?.map(a => a.width + "x" + a.height).join(", ")}</p>
          : null
        }
        {(placementProperties?.desktopSizes) ?
          <p><b>Desktop: </b>{placementProperties?.desktopSizes?.map(a => a.width + "x" + a.height).join(", ")}</p>
          : null
        }
        {(placementProperties?.tabletSizes) ?
          <p><b>Tablet: </b>{placementProperties?.tabletSizes?.map(a => a.width + "x" + a.height).join(", ")}</p>
          : null
        }
        {(placementProperties?.phoneSizes) ?
          <p><b>Phone: </b>{placementProperties?.phoneSizes?.map(a => a.width + "x" + a.height).join(", ")}</p>
          : null
        }
      </p>
    } else {
      return null;
    }

  }

  const formatOverwritableProperties = (overwritableProperties: OverwritableProperty[]) => {
    return <p>{overwritableProperties.map((owp) => {
      return (owp.current != "" || showInherited) ?
        <p><b>{owp.propertyName}: </b>
          {(owp.overwritten != "") ? <><s>{owp.overwritten}</s>, </> : ""}
          {(showInherited && owp.original != "") ? <i>{owp.original}</i> : ""}
          {owp.current}
        </p> : null
    }
    )}
    </p>
  }

  const formatExampleUrls = (cellContent, row: PublisherSiteRow) => {
    let setText = null
    let bestUrl = null
  
    if (row.exampleUrl ) {
      bestUrl = row.exampleUrl
    } 
    else if (row?.categorySettings?.exampleUrl) {
      bestUrl = row.categorySettings.exampleUrl
      setText = "From group:"
    } else if (row?.siteSettings?.exampleUrl) {
      bestUrl = row.siteSettings.exampleUrl
      setText = "From site:"
    } else if (row?.siteSettings?.siteProperties.domain) {
      bestUrl = row.siteSettings.siteProperties.domain
      setText = "From site domain:"
    } 
    if (bestUrl) {
        if (!bestUrl.startsWith("http")) {
            bestUrl = "https://" + bestUrl
        }
    }
    return <div>
        {(setText) ? <div><i>{setText}</i></div> : null}
        {(bestUrl) ? <a href={bestUrl + ((row.divId) ? "#"+ row.divId : "") } target="_blank">{bestUrl }</a> : null}
    </div>
  }

  const onSort = (dataField, order) => {
    setDefaultSorted({ dataField, order });
  }

  async function loadAdslots() {
    const rawCategories: PublisherAdslotCategory[] = await Api.Get({ path: `/api/adslots/publishers/` + props.publisherId + `/categories`, qs: { "siteId": props.siteId } });
    const rawAdslots: PublisherAdslot[] = await Api.Get({ path: `/api/adslots/publishers/` + props.publisherId + `/adslots`, qs: { "siteId": props.siteId } });
    const categories = addAdSlotsToCategories(rawAdslots, rawCategories)
    setAdCategories(() => {
      //note sets State in the parent necessary for rendering a button label
      props.setNumberCategories(categories.length);
      return categories;
    })
    setAdSlots(() => {
      props.setNumberAdslots(rawAdslots.length)
      props.setAdSlotNames(rawAdslots.map(a => a.name))
      return rawAdslots
    })
    setShowRequestsLoader(() => false)
  }

  function addAdSlotsToCategories(adslots: Array<PublisherAdslot>, categories: Array<PublisherAdslotCategory>) {
    const categoryMap = new Map();
    categories.forEach(category => categoryMap.set(category.id, []))
    adslots.forEach(adslot => {
      if (categoryMap.has(adslot?.categoryId)) {
        categoryMap.set(adslot.categorySettings.id, [...categoryMap.get(adslot.categoryId), adslot]);
      }
    })
    return categories.map(category => {
      category.adslots = categoryMap.get(category.id);
      return category;
    })
  }




  const editFormatter = (cellContent, row: PublisherSiteRow) => {
    // if (row.writeAccess) {
    const editClickFunction = ((checkIfExpandingRow(row))
      ? () => { editCategoryClick(row.originalId) }
      : () => { editAdSlotClick(row.originalId) });

    return <a onClick={(e) => { e.preventDefault(); editClickFunction() }} href="" className="table-btn mr-10"><FontIcon name="pencil" /></a>

    //}
    //return null;
    //  if (row.writeAccess) {
    //  return <a onClick={(e) => { e.preventDefault(); props.editClick(row.id); }} href="" className="table-btn mr-10"><Glyphicon glyph="pencil" /></a>
    //   }
    //  return <a onClick={(e) => { e.preventDefault(); props.editClick(row.id); }} href="" className="table-btn mr-10"><Glyphicon glyph="zoom-in" /></a>
  }

  async function deleteCategoryClick(id: Number) {
    await Api.Delete({ path: `/api/adslots/publishers/` + props.publisherId + `/categories/` + id });
    setShowRequestsLoader(true);
  }

  async function deleteAdSlotClick(id: Number) {
    await Api.Delete({ path: `/api/adslots/publishers/` + props.publisherId + `/adslots/` + id });
    setShowRequestsLoader(true);
  }

  const editAdSlotClick = (id: Number) => {
    const adslot = adSlots.find((a) => a.id == id)
    if (adslot !== undefined) {
      setEditAdslot(adslot)
      setShowEditAdslotModal(true);
    }
  }

  const editCategoryClick = (id: Number) => {
    const adcategory = adCategories.find((a) => a.id == id)
    if (adcategory !== undefined) {
      setEditCategory(adcategory)
      setShowEditCategoryModal(true);
    }
  }
  async function deleteClickFunction(row: PublisherSiteRow) {
    ((checkIfExpandingRow(row))
      ? await deleteCategoryClick(row.originalId)
      : await deleteAdSlotClick(row.originalId));
  }
  const deleteFormatter = (cellContent, row: PublisherSiteRow) => {
    // if (row.writeAccess) {

    return <a onClick={(e) => { e.preventDefault(); deleteClickFunction(row) }} href="" className="table-btn mr-10"><FontIcon name="remove" /></a>

    //}
    //return null;
  }



  const expandRows = (row: PublisherSiteRow) => {
    setExpanded((expanded) => {
      //if parent is expanded, make sure children are filtered from hidden
      if (expanded.findIndex(a => a == row?.rowId) === -1) {
        const childIds = _.range(row.numChildren).map(index => row.rowId + "." + (index + 1));
        setHidden((hidden2) => hidden2.filter(hiddenRowId => {
          return childIds.findIndex(childId => childId === hiddenRowId) === -1;
        }));
        return [...expanded, row.rowId]
      } else {
        //if parent is not expanded, add its children to hidden
        const childIds = _.range(row.numChildren).map(index => row.rowId + "." + (index + 1));
        setHidden((hidden2) => hidden2.concat(childIds));
        return expanded.filter(x => x !== row?.rowId)
      }
    });
  }

  const sortAsc = (a, b, order, dataField, rowA, rowB) => {
    //if a parent is defined get the parents datafield, else (no parent) get its own datafield
    const x = (rowA.categorySettings) ? rowA.categorySettings[dataField] : rowA[dataField];
    const y = (rowB.categorySettings) ? rowB.categorySettings[dataField] : rowB[dataField];

    if (x == y) {
      return 0;
    }
    return x > y ? 1 : -1;
  }

  const sortFuncKeepGrouped = (a, b, order, dataField, rowA, rowB) => {
    if (order == "asc") {
      return sortAsc(a, b, order, dataField, rowA, rowB);
    } else {
      return -1 * sortAsc(a, b, order, dataField, rowA, rowB);
    }
  }

  const expandFormatter = (currentValue, row, c, extra) => {
    if (row.numChildren !== undefined) {
      return <CollapsingButton
        id={"button"+"-site-"+props.siteId+"-slot-"+row.rowId}
        numberItems={row.numChildren}
        labelName={extra[0]}
        buttonStyle={extra[1]}
        collapseState={extra[2].find(id => id == row.rowId) !== undefined}
        setCollapseState={() => { expandRows(row) }}
        divId={null}
      />
    } else {
      return null;
    }
  }
  const nameFormatter = (name, row) => {
    if (row.numChildren !== undefined) {
      return <div><b>{name}</b></div>
    } else {
      return <div>{name}</div>
    }
  }

  const getColumns = () => {
    return [
      {
        dataField: 'expand',
        isDummyField: true,
        text: '',
        formatter: expandFormatter,
        formatExtraData: ["ad slots", "secondary", expanded],
        headerStyle: { width: "10%" },

      },
      {
        dataField: "rowId",
        text: "#",
        sort: true,
        hidden: true,
        onSort,
        sortFunc: sortFuncKeepGrouped,
        sortCaret: TableHelper.columnSort
      }, {
        dataField: "publisherId",
        text: "#",
        hidden: true
      }, {
        dataField: "name",
        headerStyle: { width: "20%" },
        text: "Name",
        sortFunc: sortFuncKeepGrouped,
        sort: true,
        onSort,
        sortCaret: TableHelper.columnSort,
        formatter: nameFormatter,

      }, {
        dataField: "exampleUrl",
        headerStyle: { width: "15%" },
        text: "example url",
        sort: true,
        onSort,
        sortCaret: TableHelper.columnSort,
        formatter: formatExampleUrls
      }, {
        dataField: "placementData",
        text: "Allowed sizes",
        headerStyle: { width: "25%" },
        sortFunc: sortFuncKeepGrouped,
        sort: true,
        onSort,
        sortCaret: TableHelper.columnSort,
        formatter: formatDeviceSize
      }, {
        dataField: "customFormat",
        text: "custom data",
        sortFunc: sortFuncKeepGrouped,
        sort: true,
        onSort,
        sortCaret: TableHelper.columnSort,
        formatter: formatOverwritableProperties
      }, {
        dataField: "floorPrice",
        text: "Floor price",
        sort: true,
        hidden: true,
        onSort,
        sortCaret: TableHelper.columnSort,
        formatter: TableHelper.currencyFormatter
      }, {
        dataField: 'df1',
        isDummyField: true,
        text: '',
        formatter: editFormatter,
        headerStyle: { width: "40px" }
      },
      {
        dataField: 'df2',
        isDummyField: true,
        text: '',
        formatter: deleteFormatter,
        headerStyle: { width: "40px" }
      }];
  }

  const columns = getColumns();

  async function handleSubmitCategory(id: Number, category: PublisherAdslotCategory) {
    const body = {
      adType: props.adType,
      siteId: props.siteId,
    }
    if (id == null) {
      await Api.Post({ path: `/api/adslots/publishers/` + props.publisherId + `/categories`, body: _.assign(body, category) });
    } else {
      await Api.Put({ path: `/api/adslots/publishers/` + props.publisherId + `/categories/` + id, body: _.assign(body, category) });
    }
    setShowRequestsLoader(true);
  }


  async function handleSubmitAdslot(id: Number, adslot: PublisherAdslot) {
    const body = {
      adType: props.adType,
      siteId: props.siteId,
    }
    if (id == null) {
      await Api.Post({ path: `/api/adslots/publishers/` + props.publisherId + `/adslots`, body: _.assign(body, adslot) });
    } else {
      await Api.Put({ path: `/api/adslots/publishers/` + props.publisherId + `/adslots/` + id, body: _.assign(body, adslot) });
    }
    setShowRequestsLoader(true);
  }

  return <React.Fragment>
    <Loader visible={showRequestsLoader} />
    {!showRequestsLoader && <ToolkitProvider
      keyField="rowId"
      data={rows}
      columns={columns}
    >
      {
        props2 => (
          <div>
            <div style={{ margin: "2px" }}>
            <Button variant="secondary"
              className="pull-right mr-3 mt-3 mb-3"
              disabled={!adCategories || adCategories.length == 0}
              onClick={() => {
                setEditAdslot(null)
                setShowEditAdslotModal(() => true)
              }
              }>
              <FontIcon name="plus" /> Ad Slot
            </Button>
            </div>
            <div style={{ margin: "2px" }}>
            <Button variant="primary"
              className="pull-right mr-3 mt-3 mb-3"
              onClick={() => {
                setEditCategory(null)
                setShowEditCategoryModal(() => true);
              }
              }>
              <FontIcon name="plus" /> Group
            </Button>
            </div>
            <BootstrapTable
              {...props2.baseProps}
              id={tableId}
              bordered={false}
              striped
              hover
              hiddenRows={hidden}
              classes="table-fixed"
              keyField="rowId"
              data={rows}
              columns={columns}
              defaultSorted={[defaultSorted]}
            />
          </div>
        )
      }
    </ToolkitProvider>
    }
    <PublisherCategoryModal
      category={editCategory}
      site={props.site}
      allowedCustoms={props.allowedCustoms}
      show={showEditCategoryModal}
      writeAccess={true}
      handleClose={() => setShowEditCategoryModal(false)}
      handleSubmit={handleSubmitCategory}
    />
    <PublisherAdslotModal
      adslot={editAdslot}
      adslotCategories={adCategories}
      allowedCustoms={props.allowedCustoms}
      show={showEditAdslotModal}
      checkUniqueName={props.checkUniqueName}
      writeAccess={true}
      handleClose={() => setShowEditAdslotModal(false)}
      handleSubmit={handleSubmitAdslot}
    />

  </React.Fragment>
}

export default PublisheAdslotsTable;