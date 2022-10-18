import * as React from "react";
import * as _ from "lodash";
import BootstrapTable from "react-bootstrap-table-next";
import PublisherAdslotsTable from "./PublisherAdslotsTable"
import { Button } from "react-bootstrap";
import CollapsingButton from "./CollapsingButton"
import { PublisherSite, IpToGeoConsent, PublisherSettings, PublisherAdslotCategory } from "../../../../models/data/PublisherAdslot";
import ToolkitProvider from "react-bootstrap-table2-toolkit";
import PublisherSiteModal from "./PublisherSiteModal"
import { OverwritableProperty, flattenAdslotSites } from "./OverwritableProperty"
import { ScopeDataContextType, Rights } from "../../../../models/Common"
import FontIcon from "../../../UI/FontIcon";

import * as Api from "../../../../client/Api";

interface PublisherAdSlotPageProps {
    adsite: PublisherSite;
    publisherId: Number;
    publisherSettings: PublisherSettings;
    adType: String;
    siteId: Number;
    rights: Rights;
    allowedCustoms: OverwritableProperty[];
    setCategoriesPerSite: (siteId: Number, categories: Number) => void
    setAdslotsPerSite: (siteId: Number, adslots: Number) => void
    setAdSlotNames: (name: Array<string>) => void,
    checkUniqueName: (name: string) => boolean,
    reloadSites: (boolean) => void
}

const PublisherSiteCard = (props: PublisherAdSlotPageProps) => {
    const [site, setSite] = React.useState<PublisherSite>(props.adsite)
    const [categories, setCategories] = React.useState<PublisherAdslotCategory[]>(props.adsite.adCategories)
    const [numberCategories, setNumberCategories] = React.useState<Number>(props.adsite.adCategories.length)
    const [numberAdslots, setNumberAdSlots] = React.useState<Number>(props.adsite.adCategories.reduce((a, b) => a + b.adslots.length, 0));
    const [collapsed, setCollapsed] = React.useState<Boolean>(false);
    const [adslotsCollapsed, setAdslotsCollapsed] = React.useState<Boolean>(false);
    const [showSite, setShowSite] = React.useState<boolean>(false);
    const [showRequestLoader, setShowRequestLoader] = React.useState<boolean>(false);
    const [showInherited, setShowInherited] = React.useState<boolean>(false)


    //if the number of adslots/categories changes within the site, update the "parent-all sites" count
    React.useEffect(() => props.setCategoriesPerSite(props.siteId, numberCategories), [numberCategories]);
    React.useEffect(() => { props.setAdslotsPerSite(props.siteId, numberAdslots) }, [numberAdslots]);

    React.useEffect(() => {
        if (showRequestLoader) {
            reloadSite();
        }
    }, [showRequestLoader]);

    async function reloadSite() {
        const sites: PublisherSite[] = await Api.Get({ path: `/api/adslots/publishers/` + props.publisherId + `/sites` });
        const rawCategories: PublisherAdslotCategory[] = await Api.Get({ path: `/api/adslots/publishers/` + props.publisherId + `/categories`, qs: { "siteId": props.siteId } });
        setSite(sites.find(a => a.id == props.siteId))
        setShowRequestLoader(() => false)
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
    const formatConsent = (consent: IpToGeoConsent, row: PublisherSite) => {
        const consent_pub = row?.publisherSettings?.consentSettings?.geoFromIpAllowed;
        if (consent !== undefined && consent != null && Object.values(consent).filter(a => a != null).length > 0) {
            return <p>
                {formatConsentIp(consent.truncateIpTo)}
                {formatMaxAccuracy(consent.maxAccuracy)}
                {formatFixedCountry(consent.fixedCountry)}
            </p>
        } else if (consent_pub &&
            Object.values(consent_pub).filter(a => a != null).length > 0) {
            return <p>
                <i>from publisher</i>
            </p>
        } else {
            return null;
        }
    }

    const categoryFormatter = (data, row, c, extra) => {
        return <CollapsingButton
            id={"button-site-" + site?.id}
            numberItems={extra[0]}
            labelName={extra[1]}
            buttonStyle={extra[2]}
            collapseState={extra[3]}
            setCollapseState={extra[4]}
            divId={"site-collapse-" + props.siteId}
        />
    }

    const editFormatter = (cellContent, row: PublisherSite) => {
        // if (row.writeAccess) {
        return <a onClick={(e) => { e.preventDefault(); setShowSite(true) }} href="" className="table-btn mr-10"><FontIcon name="pencil" /></a>
    }

    async function deleteClickFunction(row: PublisherSite) {
        await Api.Delete({ path: `/api/adslots/publishers/` + props.publisherId + `/sites/` + row.id });
        setShowRequestLoader(true)
    }

    const deleteFormatter = (cellContent, row: PublisherSite) => {
        //if (row.writeAccess) {
        return <a onClick={(e) => { e.preventDefault(); deleteClickFunction(row) }} href="" className="table-btn mr-10"><FontIcon name="remove" /></a>
        //  }
        //  return null
    }

    const setCollapsedAll = (data) => {
        setAdslotsCollapsed(() => data)
        setCollapsed(() => data)
    }

    const formatOverwritableProperties = (overwritableProperties: OverwritableProperty[], row: PublisherSite) => {
        return <p>{flattenAdslotSites("site", row, props.allowedCustoms).map((owp) => {
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

    const formatExampleUrls = (cellContent, row: PublisherSite) => {
        let setText = null
        let bestUrl = null
        if (row.exampleUrl) {
            bestUrl = row.exampleUrl
        } else if (row?.siteProperties?.domain) {
            bestUrl = row?.siteProperties?.domain
            setText = "From site domain:"
        }
        if (bestUrl) {
            if (!bestUrl.startsWith("http")) {
                bestUrl = "https://" + bestUrl
            }
        }
        return <div>
            {(setText) ? <div><i>{setText}</i></div> : null}
            {(bestUrl) ? <a href={bestUrl} target="_blank">{bestUrl}</a> : null}
        </div>
    }

    const getColumns = () => {
        return [
            {
                dataField: "id",
                hidden: true,
                text: "id",
                headerStyle: { width: "0%" },

            }, {
                dataField: "category",
                isDummyField: true,
                text: "ad groups",
                headerStyle: { width: "10%" },
                formatter: categoryFormatter,
                formatExtraData: [numberCategories, "groups", "primary", collapsed, setCollapsed]
            }, {
                dataField: "adslots",
                isDummyField: true,
                text: "ad slots",
                headerStyle: { width: "20%" },
                formatter: categoryFormatter,
                formatExtraData: [numberAdslots, "ad slots", "secondary", collapsed, setCollapsedAll]
            }, {
                dataField: "exampleUrl",
                text: "example url",
                headerStyle: { width: "15%" },
                formatter: formatExampleUrls
            }, {
                dataField: "consentSettings.geoFromIpAllowed",
                headerStyle: { width: "25%" },
                text: "ip to geo",
                formatter: formatConsent
            }, {
                dataField: "customFormat",

                text: "custom data",
                formatter: formatOverwritableProperties
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
            }
        ];
    }
    const getRows = () => {
        return [site];
    }

    const rows = getRows()
    const columns = getColumns();
    async function handleSubmitSite(id: Number, site: PublisherSite) {
        const body = {
            adType: props.adType,
            siteId: props.siteId,
        }
        if (id == null) {
            await Api.Post({ path: `/api/adslots/publishers/` + props.publisherId + `/sites`, body: _.assign(body, site) });
        } else {
            await Api.Put({ path: `/api/adslots/publishers/` + props.publisherId + `/sites/` + id, body: _.assign(body, site) });
        }
        setShowRequestLoader(true)
    }
    return (site) ? <React.Fragment>
        <div className="row mb-10" style={{ fontSize: "12px" }}>
            <div className="col-sm-12 pt-3">
                <div className="card">
                    <h3 className="pull-left"> Site {site?.siteProperties?.domain}</h3>
                    <div>
                        <div>
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
                                        bordered={false}
                                        striped
                                        hover
                                    />
                                    )
                                }
                            </ToolkitProvider>
                        </div>
                        <div id={"site-collapse-" + props.siteId} className="collapse">
                            <PublisherAdslotsTable
                                adCategories={categories}
                                site={site}
                                setReload={showRequestLoader}
                                setNumberCategories={setNumberCategories}
                                setNumberAdslots={setNumberAdSlots}
                                checkUniqueName={props.checkUniqueName}
                                setAdSlotNames={props.setAdSlotNames}
                                allowedCustoms={props.allowedCustoms}
                                adType={props.adType}
                                publisherId={props.publisherId}
                                siteId={props.siteId}
                                adslotsCollapsed={adslotsCollapsed}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <PublisherSiteModal
            site={site}
            publisherSettings={props.publisherSettings}
            allowedCustoms={props.allowedCustoms}
            show={showSite}
            writeAccess={true}
            handleClose={() => setShowSite(false)}
            handleSubmit={handleSubmitSite}
        />
    </React.Fragment>
        : null;

}
export default PublisherSiteCard;