import { Button, FormGroup, FormControl, FormLabel } from "react-bootstrap";
import * as React from "react";
import FontIcon from "../../../../UI/FontIcon";
import * as _ from "lodash";
import { OverwritableProperty } from "../OverwritableProperty";
import Select from "react-select";
import { BannerSize, PlacementProperties, PublisherAdslot } from "../../../../../models/data/PublisherAdslot";
import Creatable, { makeCreatableSelect } from 'react-select/creatable';

import { numberFormatter } from "../../../../../client/TableHelper";

interface SizeEditorProps {
    adslot: PublisherAdslot,
    writeAccess: boolean,
    handleSizesChange: (sizes: PlacementProperties) => void,
}


const SizeEditorForm = (props: SizeEditorProps) => {
    const exampleSizes = [{ width: 300, height: 250 },
    { width: 336, height: 280 },
    { width: 728, height: 90 },
    { width: 970, height: 250 },
    { width: 300, height: 600 },
    { width: 160, height: 600 },
    { width: 120, height: 600 },
    { width: 320, height: 240 },
    { width: 320, height: 480 },
    { width: 300, height: 50 },
    { width: 300, height: 100 },
    { width: 320, height: 100 },
    ]
    const [stateAll, setStateAll] = React.useState<{ label: string, value: string }[]>(
        props?.adslot?.placementProperties?.anyDeviceSizes?.map(a => bannerSizeToOption(a)) || []
    );
    const [stateDesktop, setStateDesktop] = React.useState<{ label: string, value: string }[]>(
        props?.adslot?.placementProperties?.desktopSizes?.map(a => bannerSizeToOption(a)) || []
    );
    const [stateTablet, setStateTablet] = React.useState<{ label: string, value: string }[]>(
        props?.adslot?.placementProperties?.tabletSizes?.map(a => bannerSizeToOption(a)) || []
    );
    const [stateMobile, setStateMobile] = React.useState<{ label: string, value: string }[]>(
        props?.adslot?.placementProperties?.phoneSizes?.map(a => bannerSizeToOption(a)) || []
    );
    const [possibleSizes, setPossibleSizes] = React.useState<BannerSize[]>(allSizesList());

    React.useEffect(() => {
        const stateToBannerSize = (state: { label: string, value: string }) => {
            const dims = state.value.split("x")
            return { width: Number(dims[0]), height: Number(dims[1]) }
        }
        const p: PlacementProperties = {
            anyDeviceSizes: stateAll.map(a => stateToBannerSize(a)),
            desktopSizes: stateDesktop.map(a => stateToBannerSize(a)),
            tabletSizes: stateTablet.map(a => stateToBannerSize(a)),
            phoneSizes: stateMobile.map(a => stateToBannerSize(a))
        }
        props.handleSizesChange(p)
    }, [stateAll, stateDesktop, stateTablet, stateMobile]);

    function bannerSizeToStringLabel(bannerSize: BannerSize) {
        return bannerSize.width + "x" + bannerSize.height;
    }

    function bannerSizeToOption(bannerSize: BannerSize): { label: string, value: string } {
        const value = bannerSizeToStringLabel(bannerSize);
        return { label: value, value: value };
    }

    function allSizesList(): Array<BannerSize> {
        const set = new Set<string>()
        const exampleSizesSet = new Set<string>()
        exampleSizes.forEach(a => exampleSizesSet.add(JSON.stringify(a)))
        props?.adslot?.placementProperties?.anyDeviceSizes?.forEach(a => set.add(JSON.stringify(a)));
        props?.adslot?.placementProperties?.desktopSizes?.forEach(a => set.add(JSON.stringify(a)))
        props?.adslot?.placementProperties?.phoneSizes?.forEach(a => set.add(JSON.stringify(a)))
        props?.adslot?.placementProperties?.tabletSizes?.forEach(a => set.add(JSON.stringify(a)))
        //set provides no reliable ordering => keep the example sizes first
        return [...exampleSizes,
        ...Array.from(set).filter(a => !exampleSizesSet.has(a)).map(a => JSON.parse(a) as BannerSize)]
    }

    const handleOnChange = (value: string, setState, state) => {
        const values = value.split("x");
        if (values.length == 2) {
            const width = Number(values[0])
            const height = Number(values[1])
            if (!isNaN(width) && !isNaN(height)) {
                setPossibleSizes([...possibleSizes, { width: width, height: height }])
                setState([...state, { label: value, value: value }])
            }
        }
    }
    return <FormGroup className="row">
        <FormLabel className="col-sm-12">Allowed ad sizes</FormLabel>
        <div className="col-sm-11 col-sm-mr-auto">
            <FormGroup className="row">
                <div className="col-sm-12 ">
                    <FormLabel>  all devices:   </FormLabel>
                    <Creatable
                        options={possibleSizes.map((size) => {
                            return {
                                value: size.width + "x" + size.height,
                                label: size.width + "x" + size.height
                            }
                        })}
                        isClearable
                        isMulti={true}
                        closeMenuOnSelect={false}
                        onCreateOption={(a) => handleOnChange(a, setStateAll, stateAll)}
                        onChange={(a: { label: string, value: string }[]) => {
                            setStateAll((a)?a : [])
                        }}
                        value={stateAll}
                    />
                </div>
                <div className="col-sm-12 ">
                    <FormLabel> desktop only:</FormLabel>
                    <Creatable
                        options={possibleSizes.map((size) => {
                            return {
                                value: size.width + "x" + size.height,
                                label: size.width + "x" + size.height
                            }
                        })}
                        isClearable
                        closeMenuOnSelect={false}
                        isMulti={true}
                        onCreateOption={(a) => handleOnChange(a, setStateDesktop, stateDesktop)}
                        onChange={(a: { label: string, value: string }[]) => {
                            setStateDesktop((a)?a : [])
                        }}
                        value={stateDesktop}
                    />
                </div>
                <div className="col-sm-12 ">
                    <FormLabel> tablet only:</FormLabel>
                    <Creatable
                        options={possibleSizes.map((size) => {
                            return {
                                value: size.width + "x" + size.height,
                                label: size.width + "x" + size.height
                            }
                        })}
                        isClearable
                        closeMenuOnSelect={false}
                        isMulti={true}
                        onCreateOption={(a) => handleOnChange(a, setStateTablet, stateTablet)}
                        onChange={(a: { label: string, value: string }[]) => {
                            setStateTablet((a)?a : [])
                        }}
                        value={stateTablet}
                    />
                </div>
                <div className="col-sm-12 ">
                    <FormLabel> mobile only:</FormLabel>
                    <Creatable
                        options={possibleSizes.map((size) => {
                            return {
                                value: size.width + "x" + size.height,
                                label: size.width + "x" + size.height
                            }
                        })}
                        isClearable
                        closeMenuOnSelect={false}
                        isMulti={true}
                        onCreateOption={(a) => handleOnChange(a, setStateMobile, stateMobile)}
                        onChange={(a: { label: string, value: string }[]) => {
                            setStateMobile((a)?a : [])
                        }}
                        value={stateMobile}
                    />
                </div>
            </FormGroup>

        </div>
    </FormGroup>
}
export default SizeEditorForm;