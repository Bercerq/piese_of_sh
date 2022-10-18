import * as React from "react";
import { useContext } from "react";
import * as _ from "lodash";
import { useParams } from "react-router-dom";
import { ScopeDataContextType, Rights } from "../../../../models/Common"
import * as NotificationSystem from "react-notification-system";
import { Button } from "react-bootstrap";
import { OverwritableProperty, flattenAdslotPublisher, flattenAdslotSites, overwritablePropertiesToMap } from "./OverwritableProperty"
import * as Api from "../../../../client/Api";
import ScopeDataContext from "../../context/ScopeDataContext";
import Loader from "../../../UI/Loader";
import Confirm from "../../../UI/Confirm";
import * as ExcelHelper from "../../../../client/ExcelHelper";
import FontIcon from "../../../UI/FontIcon";
import * as Roles from "../../../../modules/Roles";
import PublisherSiteCard from "./PublisherSiteCard"
import { PublisherAdslot, PublisherAdslotCategory, PublisherSite, PublisherSettings, IpToGeoConsent, BannerSize } from "../../../../models/data/PublisherAdslot";
import BootstrapTable from "react-bootstrap-table-next";
import ToolkitProvider from "react-bootstrap-table2-toolkit";
import PublisherSiteModal from "./PublisherSiteModal"
import PublisherSettingsModal from "./PublisherSettingsModal"
import { ScopeType } from "../../../../client/schemas";


interface PublisherAdSlotPageProps {

}

const PublisherAdSlotPageBody = (props: PublisherAdSlotPageProps) => {
  let { data } = useContext<ScopeDataContextType>(ScopeDataContext);
  let params: { scope?, scopeId?} = useParams();
  let scope = params.scope as ScopeType;
  let scopeId = parseInt(params.scopeId);
  const rights: Rights = Roles.getRights(data.rights);
  const [publisherSettings, setPublisherSettings] = React.useState<PublisherSettings>(null);
  const [adsites, setAdsites] = React.useState<PublisherSite[]>([]);
  const [numCategories, setNumCategories] = React.useState<Number>(0);
  const [numAdSlots, setNumAdSlots] = React.useState<Number>(0);
  const [numCategoriesPerSite, setCategoriesPerSite] = React.useState<Map<Number, Number>>(new Map())
  const [numAdslotsPerSite, setAdslotsPerSite] = React.useState<Map<Number, Number>>(new Map())
  const [showRequestsLoader, setShowRequestsLoader] = React.useState<boolean>(true);
  const [uniqueNames, setUniqueNames] = React.useState<Set<string>>(new Set());
  const [showSite, setShowSite] = React.useState<boolean>(false);
  const [showSettings, setShowSettings] = React.useState<boolean>(false);
  const [allowedCustoms, setAllowedCustoms] = React.useState<Array<OverwritableProperty>>([]);


  const adType = "DISPLAY"
  React.useEffect(() => { setShowRequestsLoader(true); }, [scope, scopeId]);
  React.useEffect(() => { loadRequests(); }, [showRequestsLoader]);

  const sumMapValues = (map: Map<Number, Number>) => {
    let x = 0;
    map.forEach((value, key) => {
      x = x + value.valueOf();
    })
    return x;
  }

  React.useEffect(() => { setNumCategories(() => sumMapValues(numCategoriesPerSite)) }, [numCategoriesPerSite])
  React.useEffect(() => { setNumAdSlots(() => sumMapValues(numAdslotsPerSite)) }, [numAdslotsPerSite])

  async function loadRequests() {
    if (showRequestsLoader) {
      try {
        const allowedCustoms: Array<{ displayName: string }> = await Api.Get({
          path: `/api/attributes/customs`,
          qs: { scope: "publisher", video: false, scopeId }
        });
        const rawSettings = await Api.Get({ path: `/api/adslots/publishers/` + scopeId + `/adslotSettings` });
        const rawSites = await Api.Get({ path: `/api/adslots/publishers/` + scopeId + `/sites` });
        const rawCategories = await Api.Get({ path: `/api/adslots/publishers/` + scopeId + `/categories` });
        const rawAdslots: Array<PublisherAdslot> = await Api.Get({ path: `/api/adslots/publishers/` + scopeId + `/adslots` });
        const categories = addAdSlotsToCategories(rawAdslots, rawCategories)
        const sites = addCategoriesToSites(categories, rawSites);
        rawAdslots.forEach(a => uniqueNames.add(a.name))
        setAllowedCustoms(allowedCustoms.map(a => { return { propertyName: a.displayName } as OverwritableProperty }))
        setPublisherSettings(() => rawSettings)
        setAdsites(() => sites);
        setNumCategories(() => rawCategories.length)
        setNumAdSlots(() => rawAdslots.length)
        setShowRequestsLoader(() => false);
      } catch (err) {
        console.log(err);
      }
    }
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

  function addCategoriesToSites(categories: Array<PublisherAdslotCategory>, sites: Array<PublisherSite>) {
    const sitesMap = new Map();
    sites.forEach(site => sitesMap.set(site.id, []))
    categories.forEach(category => {
      if (sitesMap.has(category.siteId)) {
        sitesMap.set(category.siteSettings.id, [...sitesMap.get(category.siteId), category]);
      }
    })
    return sites.map(site => {
      site.adCategories = sitesMap.get(site.id);
      return site;
    })
  }

  const jsonToString = (data, row) => {
    return <span>{JSON.stringify(data)}</span>
  }

  const formatCount = (a, b, c, count) => {
    return <span>{count}</span>;
  }

  const formatConsentIp = (ip) => {
    if (ip !== undefined && ip != null) {
      let ipAllowed = "Allowed";
      if (ip == 24) {
        ipAllowed = "Truncated"
      } else if (ip == 0) {
        ipAllowed = "Not allowed"
      }
      return <div><b>IP: </b>{ipAllowed}</div>
    } else {
      null
    }
  }

  const formatFixedCountry = (country) => {
    if (country) {
      return <div><b>Fixed country: </b>{country}</div>
    } else {
      null
    }
  }

  const formatMaxAccuracy = (maxAccuracy) => {
    if (maxAccuracy) {
      return <div><b>Max ip2geo accuracy: </b>{maxAccuracy}</div>
    } else {
      null
    }
  }

  const formatConsent = (consent: IpToGeoConsent) => {
    if (consent !== undefined && consent != null) {
      return <p>
        {formatConsentIp(consent.truncateIpTo)}
        {formatMaxAccuracy(consent.maxAccuracy)}
        {formatFixedCountry(consent.fixedCountry)}
      </p>
    } else {
      return null;
    }
  }

  const formatOverwritableProperties = (overwritableProperties: OverwritableProperty[], row: PublisherSettings) => {
    return <p>{flattenAdslotPublisher("publisher", row, allowedCustoms).map((owp) => {
      return (owp.current != "") ?
        <p><b>{owp.propertyName}: </b>
          {(owp.overwritten != "") ? <><s>{owp.overwritten}</s>, </> : ""}
          {(owp.original != "") ? <i>{owp.original}</i> : ""}
          {owp.current}
        </p> : null
    }
    )}
    </p>
  }
  const editFormatter = (cellContent, row: PublisherSettings) => {
    // if (row.writeAccess) {
    return <a onClick={(e) => { e.preventDefault(); setShowSettings(true) }} href="" className="table-btn mr-10"><FontIcon name="pencil" /></a>
  }

  const getColumns = () => {
    return [
      {
        dataField: "siteCount",
        isDummyField: true,
        text: "sites",
        headerStyle: { width: "10%" },
        formatter: formatCount,
        formatExtraData: adsites.length
      }, {
        dataField: "categoryCount",
        isDummyField: true,
        text: "ad groups",
        headerStyle: { width: "10%" },
        formatter: formatCount,
        formatExtraData: numCategories
      }, {
        dataField: "adslotCount",
        isDummyField: true,
        text: "adslots",
        headerStyle: { width: "10%" },
        formatter: formatCount,
        formatExtraData: numAdSlots
      }, {
        dataField: "",
        isDummyField: true,
        headerStyle: { width: "15%" },
        text: "",
      }, {
        dataField: "consentSettings.geoFromIpAllowed",
        headerStyle: { width: "25%" },
        text: "ip to geo",
        formatter: formatConsent
      }, {
        dataField: "customProperties",
        text: "custom data",
        formatter: formatOverwritableProperties,
      }, {
        dataField: 'df1',
        isDummyField: true,
        text: '',
        formatter: editFormatter,
        headerStyle: { width: "40px" }
      }
    ];
  }

  const getRows = () => {
    return (publisherSettings) ? [publisherSettings] : []
  }

  const setSiteCategories = (siteId: Number, categories: Number) => {
    setCategoriesPerSite(() => new Map(numCategoriesPerSite.set(siteId, categories)));
  }

  const setSiteAdslots = (siteId: Number, adslots: Number) => {
    setAdslotsPerSite(() => new Map(numCategoriesPerSite.set(siteId, adslots)));
  }


  function compare(a: PublisherAdslot, b: PublisherAdslot) {
    if (a.siteId < b.siteId) {
      return -1;
    }
    if (a.siteId > b.siteId) {
      return 1;
    }
    if (a.categoryId < b.categoryId) {
      return -1;
    }
    if (a.categoryId > b.categoryId) {
      return 1;
    }
    if (a.id < b.id) {
      return -1;
    }
    if (a.id > b.id) {
      return 1;
    }
    return 0;
  }

  function fillDivIdTemplate(a: PublisherAdslot): string {
    return (a.placementProperties?.divId)
      ? '<script type="text/javascript">\
ootag.queue.push(function () {\
ootag.defineSlot({\
adSlot: "'+ a.name + '",\
targetId: "'+ a.placementProperties.divId + '"\
});\
});\
</script>'
      : "Fill div id in the dashboard!"
  }

  function deviceSizeToStringArray(sizes: Array<BannerSize>) {
    if (sizes) {
      return "[" + sizes.map(size => "[" + size.width + "," + size.height + "]").join(",") + "]"
    } else {
      return "[]"
    }
  }

  function cleanDivIdSizes(divId: String) {
    return divId.replace(/\W/g, '') + "_sizes"
  }
  function fillPrebidTemplate(a: PublisherAdslot): string {
    return (a.placementProperties?.divId)
      ? '<script type="text/javascript">\
var '+ cleanDivIdSizes(a.placementProperties.divId) + ' = ' + deviceSizeToStringArray(a?.placementProperties?.anyDeviceSizes) + ';\
var adUnits = [\
{\
code: "'+ a.placementProperties.divId + '",\
mediaTypes: {\
banner: {\
sizes: '+ cleanDivIdSizes(a.placementProperties.divId) + '\
}\
},\
bids: [  '+ bidderOnly(a) + ',]\
}\
];\
</script>\
'
      : "Fill div id in the dashboard!"
  }

  function bidderOnly(a: PublisherAdslot): string {
    return '{\
bidder: "optout",\
params: {\
publisher: "'+ scopeId + '",\
adslot: "'+ a.name + '"\
}\
}'
  }

  function setPageScript(): string {
    return '<script src="https://cdn.optoutadvertising.com/script/ootag.min.js"></script>\
<script>\
var ootag = ootag || {}; \
ootag.queue = ootag.queue || [];\
ootag.queue.push(function () { ootag.initializeOo({ publisher:  '+ scopeId + ' });});\
</script>'
  }

  async function exportExcel() {
    const data: Array<PublisherAdslot> = await Api.Get({ path: `/api/adslots/publishers/` + scopeId + `/adslots` });
    const dataSorted = data.sort(compare)
    const fields = ["site", "group", "ad slot", "example url", "div id", "div code", "prebid bidder","header code", "prebid page"];
    const header = fields.map((value) => { return ExcelHelper.getBoldCell(value); });
    const rows = data.map((o) => {
      return [
        ExcelHelper.getCell(o.categorySettings?.siteSettings?.siteProperties?.domain ? o.categorySettings.siteSettings.siteProperties.domain as string : ""),
        ExcelHelper.getCell(o.categorySettings?.name ? o.categorySettings.name as string : ""),
        ExcelHelper.getCell((o.name ? o.name : "")),
        ExcelHelper.getCell((o.exampleUrl ? o.exampleUrl as string : "")),
        ExcelHelper.getCell((o.placementProperties?.divId ? o.placementProperties.divId as string : "")),
        ExcelHelper.getCell(fillDivIdTemplate(o)),
        ExcelHelper.getCell(bidderOnly(o)),
        ExcelHelper.getCell(setPageScript()),
        ExcelHelper.getCell(fillPrebidTemplate(o)),
      ];
    });
    const exportData = [header].concat(rows);
    ExcelHelper.save(exportData, "Adslots", `Adslots_${name}`);
  }

  async function handleSubmitPublisher(settings: PublisherSettings) {
    const body = {
      adType: adType,
    }
    await Api.Put({ path: `/api/adslots/publishers/` + scopeId + `/adslotsettings`, body: _.assign(body, settings) });

    setShowRequestsLoader(true)
  }

  async function handleSubmitSite(id: Number, site: PublisherSite) {
    const body = {
      adType: adType,
    }
    if (id == null) {
      await Api.Post({ path: `/api/adslots/publishers/` + scopeId + `/sites`, body: _.assign(body, site) });
    } else {
      await Api.Put({ path: `/api/adslots/publishers/` + scopeId + `/sites/` + id, body: _.assign(body, site) });
    }
    setShowRequestsLoader(true)
  }

  const rows = getRows()
  const columns = getColumns();
  return <React.Fragment >
    <div className="row mb-10" style={{ fontSize: "12px" }}>
      <div className="col-sm-12 pt-3">
        <div className="card">
          <h3 className="pull-left">Display slot settings</h3>
          <div>
            <div style={{ margin: "2px" }}>
              <Button variant="secondary"
                className="pull-right mr-3 mt-3 mb-3"
                onClick={() => {
                  exportExcel()
                }
                }>
                <FontIcon name="download" /> Download ad tags
              </Button>
            </div>
            <div style={{ margin: "2px" }}>
              <Button variant="primary"

                className="pull-right mr-3 mt-3 mb-3"
                onClick={() => {
                  setShowSite(true)
                }
                }>
                <FontIcon name="plus" /> Site
              </Button>
            </div>
            <ToolkitProvider
              keyField="id"
              data={rows}
              columns={columns}
            >
              {
                props => (<BootstrapTable
                  {...props.baseProps}
                  keyField="id"
                  rows={rows}
                  columns={columns}

                />
                )
              }
            </ToolkitProvider>
          </div>
        </div>

        <Loader visible={showRequestsLoader} />
        {(!showRequestsLoader) ?
          adsites.map(site =>
            <PublisherSiteCard
              rights={rights}
              publisherSettings={publisherSettings}
              adsite={site}
              allowedCustoms={allowedCustoms}
              checkUniqueName={(name: string) => {
                return !uniqueNames.has(name)
              }}
              setAdSlotNames={(names: Array<string>) => {
                names.forEach(name => uniqueNames.add(name))
              }}
              adType={adType}
              publisherId={scopeId}
              siteId={site.id}
              reloadSites={(setShowRequestsLoader)}
              setCategoriesPerSite={setSiteCategories}
              setAdslotsPerSite={setSiteAdslots}
            />
          )
          : null
        }
        <PublisherSettingsModal
          publisherSettings={publisherSettings}
          allowedCustoms={allowedCustoms}
          show={showSettings}
          writeAccess={true}
          handleClose={() => setShowSettings(false)}
          handleSubmit={handleSubmitPublisher}
        />
        <PublisherSiteModal
          site={null}
          publisherSettings={publisherSettings}
          allowedCustoms={allowedCustoms}
          show={showSite}
          writeAccess={true}
          handleClose={() => setShowSite(false)}
          handleSubmit={handleSubmitSite}
        />
      </div>
    </div>
  </React.Fragment >;
}
export default PublisherAdSlotPageBody;