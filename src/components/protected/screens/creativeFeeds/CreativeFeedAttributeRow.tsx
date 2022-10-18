

import React, { useState, Fragment, useEffect } from "react";
import { Modal, Button, Form, Alert, InputGroup } from "react-bootstrap";
import Select from "react-select";



export interface CreativeFeedAttributeDataRowProps {
    internal_name: string;
    field_name: string;
    external_name: string;
    type: string;
}
export interface CreativeFeedAttributeRowProps {
    data: CreativeFeedAttributeDataRowProps
    name_options_method: string[];
    show: boolean;
    writeAccess: boolean;
    updateAttribute: (CreativeFeedAttributeRowProps) => void
}

const CreativeFeedAttributeRow = (props: CreativeFeedAttributeRowProps) => {

    const select_options = props.name_options_method.map(name => { return { value: name, label: name } })
    const type_options = [{ value: props.data.type, label: props.data.type }]

    const [externalName, setExternalName] = useState<string>(props.data.field_name);
    const [type, setType] = useState<string>(props.data.type);
    const [creativeName, setCreativeName] = useState<string>(props.data.external_name);

    useEffect(() => {
        props.updateAttribute(getProps())
    }, [externalName, type, creativeName]);

    const fieldChange = (e) => {
        setExternalName(a => {
            setCreativeName(e.value)
            return e.value
        })

    }

    const typeChange = (e) => {
        setType(e.value)
    }

    const creativeNameChange = (e) => {
        const name = e.target.value;
        setCreativeName(name);

    }
    const getProps: () => CreativeFeedAttributeDataRowProps = () => {
        return {
            internal_name: props.data.internal_name,
            field_name: externalName,
            external_name: creativeName,
            type: type,
            writeAccess: props.writeAccess,
        }
    }
    return (props.show)?<div className="row no-gutters">
        <div className="col-lg-1">
            <Form.Label>{props.data.internal_name}:</Form.Label>
        </div>
        <div className="col-lg-4">
            <Select
                inputId={`attribute-creative-feed-${props.data.internal_name}`}
                isDisabled={!props.writeAccess}
                className="react-select-container"
                classNamePrefix="react-select"
                name="data-feed-select"
                value={select_options.find((o) => { return o.value === externalName })}
                clearable={false}
                options={select_options}
                onChange={fieldChange}
            />
        </div>
        <div className="col-lg-1">
            <Form.Label>data:</Form.Label>
        </div>
        <div className="col-lg-2">
            <Select
                inputId={`attribute-creative-feed-${props.data.internal_name}-type`}
                isDisabled={!props.writeAccess}
                className="react-select-container"
                classNamePrefix="react-select"
                name="data-feed-select"
                value={type_options.find((o) => { return o.value === type})}
                clearable={false}
                options={type_options}
                onChange={typeChange}
            />
        </div>
        <div className="col-lg-1">
            <Form.Label>name:</Form.Label>
        </div>
        <div className="col-lg-3">
            <Form.Control
                
                readOnly={!props.writeAccess}
                type="text"
                value={creativeName}
                onChange={creativeNameChange}
            />
        </div>
    </div> : null
}
export default CreativeFeedAttributeRow;