import { Button, FormGroup, FormControl, FormLabel } from "react-bootstrap";
import * as React from "react";
import FontIcon from "../../../UI/FontIcon";
import * as _ from "lodash";
import Select from "react-select";
import { BannerSize, IpToGeoConsent, PlacementProperties, PublisherAdslot } from "../../../../models/data/PublisherAdslot";
import Creatable, { makeCreatableSelect } from 'react-select/creatable';
import { ConsentSettings, PublisherSettings, PublisherSite } from "../../../../models/data/PublisherAdslot";

interface GeoFromIpProps {
    publisherSettings: ConsentSettings,
    siteSettings: ConsentSettings,
    level: string,
    handleConsentChange: (IpToGeo: IpToGeoConsent) => void,
}


const GeoFromIpSettings = (props: GeoFromIpProps) => {
   const currentConsent = (props?.siteSettings?.geoFromIpAllowed  &&
     Object.values(props?.siteSettings?.geoFromIpAllowed).filter(a => a != null).length > 0) 
     ? props?.siteSettings?.geoFromIpAllowed
     : props.publisherSettings.geoFromIpAllowed
    const [ipBitsAllowed, setIpBitsAllowed] = React.useState<Number>(typeof currentConsent.truncateIpTo !== "undefined" ?
    currentConsent.truncateIpTo
        : 32);
    const [fixedCountry, setFixedCountry] = React.useState<String>(typeof currentConsent.fixedCountry !== "undefined"?
    currentConsent.fixedCountry
        : "None");

    const truncateIpOptions = [{ label: "Allow", value: 32 },
    { label: "Truncate last octet", value: 24 },
    { label: "Do not allow", value: 0 }
    ]
    const countryOptions: { label: String, value: String }[] = [{ label: "Netherlands", value: "Netherlands" },
    {label: "None", value: "None"}]


    return <FormGroup className="row">
        <div className="col-sm-11 col-sm-mr-auto">
            <FormGroup className="row">
                <div className="col-sm-12 ">
                    <FormLabel> Ip to geo</FormLabel>
                    <Select
                        options={truncateIpOptions}
                        isClearable
                        isMulti={false}
                        defaultValue={truncateIpOptions.find(a => a.value == ipBitsAllowed)}
                        onChange={(a: { label: string, value: number }) => {
                            setIpBitsAllowed(a.value)
                            props.handleConsentChange({truncateIpTo:a.value, fixedCountry: (a.value == 0) ? fixedCountry: null })
                        }}
                        value={truncateIpOptions.find(a => a.value == ipBitsAllowed)}
                    />
                </div>
                {(ipBitsAllowed == 0) ? <div className="col-sm-12 ">
                    <FormLabel> Set fixed country:</FormLabel>
                    <Select
                        show={false}
                        options={countryOptions}
                        isClearable
                        isMulti={false}
                        defaultValue={countryOptions.find(a => a.value == fixedCountry)}
                        onChange={(a: { label: string, value: string }) => {
                            setFixedCountry(a.value)
                            props.handleConsentChange({truncateIpTo:ipBitsAllowed, fixedCountry: a.value})
                        }}

                        value={countryOptions.find(a => a.value == fixedCountry)}
                    />
                </div>
                    : null
                }
            </FormGroup>

        </div>
    </FormGroup>
}
export default GeoFromIpSettings;