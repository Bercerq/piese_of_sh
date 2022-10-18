import * as React from "react";
import momentPropTypes from "react-moment-proptypes";
import * as moment from "moment";
import { Modal, Button, FormGroup, FormControl, FormLabel, Alert } from "react-bootstrap";
import * as _ from "lodash";
import * as Validation from "../../../../client/Validation";
import { ValidationError } from "../../../../client/schemas";
import { PlacementProperties, PublisherAdslot, PublisherAdslotCategory } from "../../../../models/data/PublisherAdslot";
import CustomAttributeForm from "./customAttributes/CustomAttributeForm"
import { OverwritableProperty, flattenAdslotCategories, flattenAdslotCustoms, overwritablePropertiesToMap } from "./OverwritableProperty"
import SizeEditorForm from "./sizeEditor/SizeEditor";
import Select from "react-select";

interface PublisherAdslotModalProps {
    adslotCategories: PublisherAdslotCategory[];
    adslot: PublisherAdslot;
    allowedCustoms: OverwritableProperty[];
    show: boolean;
    writeAccess: boolean;
    handleClose: () => void;
    handleSubmit: (id: number, adslot: PublisherAdslot) => void;
    checkUniqueName: (name: string) => boolean;
}

const PublisherAdslotModal = (props: PublisherAdslotModalProps) => {
    const [category, setCategory] = React.useState<Number>(props?.adslot?.categoryId)
    const [saving, setSaving] = React.useState<boolean>(false);
    const [name, setName] = React.useState<string>("");
    const [exampleUrl, setExampleUrl] = React.useState<string>("");
    const [divId, setDivId] = React.useState<string>("");
    const [comments, setComments] = React.useState<string>("");
    const [nameValidation, setNameValidation] = React.useState<ValidationError>({ error: false, message: "" });
    const [unchangedCustoms, setUnchangedCustoms] = React.useState<OverwritableProperty[]>(
        getInitalCustoms(category));
    const [customs, setCustoms] = React.useState<OverwritableProperty[]>(
        unchangedCustoms);
    const [sizes, setSizes] = React.useState<PlacementProperties>(props?.adslot?.placementProperties || {});

    React.useEffect(() => {
        setCategory(props?.adslot?.categoryId)
    }, [props.adslot]);

    function getInitalCustoms(category: Number) {
        return (props.adslot) ? flattenAdslotCustoms(props.adslot, props.allowedCustoms) :
            ((category && props.adslotCategories.find(a => a.id == category)) ?
                flattenAdslotCategories("adslot", props.adslotCategories.find(a => a.id == category), props.allowedCustoms)
                : [])
    }

    const handleEntering = () => {

        const name = _.get(props, "adslot.name") || "";
        const divId = props?.adslot?.placementProperties?.divId as string || "";
        const exampleUrl = _.get(props, "adslot.exampleUrl") || "";
        const comments = _.get(props, "adslot.comments") || "";
        setName(name);
        setDivId(divId)
        setUnchangedCustoms(getInitalCustoms(props?.adslot?.categoryId))
        setExampleUrl(exampleUrl);
        setComments(comments);
        setSaving(false);
    };

    const handleNameChange = (e) => {
        const name = e.target.value;
        const nameValidation = Validation.required(name);
        setName(name);
        setNameValidation(nameValidation);
    }

    const handleCustomChange = (values: OverwritableProperty[]) => {
        setCustoms(values)
    }

    const handleSizesChange = (sizes: PlacementProperties) => {
        setSizes(sizes)
    }

    if (!Object.entries)
        Object.entries = function (obj) {
            return Object.keys(obj).reduce(function (arr, key) {
                arr.push([key, obj[key]]);
                return arr;
            }, []);
        }

    const handleSubmit = () => {
        const nameValidation = Validation.required(name);
        if (nameValidation.error) {
            setNameValidation(nameValidation);
        } else if (name != props?.adslot?.name && !props.checkUniqueName(name)) {
            setNameValidation({ error: true, message: "Adslot name must be unique!" });
        } else if (!category) {
            setNameValidation({ error: true, message: "category id" });
        } else {
            setSaving(true);
            const customAttributes = overwritablePropertiesToMap(customs)
            const id = _.get(props, "adslot.id");
            const placement = _.assign({}, sizes, { divId: divId })
            props.handleSubmit(id, {
                name: name,
                exampleUrl: exampleUrl,
                categoryId: category,
                customProperties: Object.fromEntries(customAttributes),
                placementProperties: placement
            });
            clearState();
            props.handleClose();
        }
    }

    function clearState() {
        setName("");
        setExampleUrl("");
        setComments("");
        setUnchangedCustoms([])
        setDivId("")
        setNameValidation({ error: false, message: "" });
        setSaving(false);
        setSizes({})
        setCategory(null)
        setUnchangedCustoms([])
    }

    return <Modal show={props.show} onHide={() => { props.handleClose(); clearState() }} onEntering={handleEntering} backdrop="static">
        <Modal.Header closeButton>
            <Modal.Title>Adslot settings</Modal.Title>
        </Modal.Header>
        <Modal.Body>
            <div className="row">
                <div className="col-sm-12">
                    <FormGroup controlId="adslot-name" className={nameValidation.error ? "has-error" : ""}>
                        <FormLabel>Name</FormLabel>
                        <FormControl
                            autoFocus
                            readOnly={!props.writeAccess}
                            type="text"
                            value={name}
                            onChange={handleNameChange}
                        />
                        {
                            nameValidation.error &&
                            <Alert >{nameValidation.message}</Alert >
                        }
                    </FormGroup>
                    <FormGroup controlId="adslot-name" className={nameValidation.error ? "has-error" : ""}>
                        <FormLabel>Adslot group</FormLabel>
                        <Select options={props.adslotCategories.map(c => { return { label: c.name, value: c.id }; })}
                            defaultValue={(props?.adslot?.categorySettings) ?
                                { label: props.adslot.categorySettings.name, value: props.adslot.categorySettings.id }
                                : null}
                            onChange={(a: { label: String, value: Number }) => setCategory(a.value)}
                        >
                        </Select>
                    </FormGroup>
                    <FormGroup controlId="exampleUrl">
                        <FormLabel>example url</FormLabel>
                        <FormControl
                            readOnly={!props.writeAccess}
                            type="text"
                            value={exampleUrl}
                            onChange={(e) => setExampleUrl(e.target.value)}
                        />
                    </FormGroup>
                    <FormGroup controlId="divId">
                        <FormLabel>Ad div id</FormLabel>
                        <FormControl
                            readOnly={!props.writeAccess}
                            type="text"
                            value={divId}
                            onChange={(e) => setDivId(e.target.value)}
                        />
                    </FormGroup>
                    {/* <FormGroup controlId="comments">
                        <ControlLabel>Comments</ControlLabel>
                        <FormControl
                            readOnly={!props.writeAccess}
                            type="text"
                            value={comments}
                            onChange={(e) => setComments(e.target.value)}
                        />
                            </FormGroup>*/}
                    <div className="row">
                        <div className="col-sm-12">
                            <SizeEditorForm
                                adslot={props.adslot}
                                writeAccess={true}
                                handleSizesChange={handleSizesChange}
                            ></SizeEditorForm>
                        </div>
                    </div>
                    {(props.allowedCustoms && props.allowedCustoms.length > 0) ?<div className="row">
                        <div className="col-sm-12">
                            <CustomAttributeForm
                                name={"Customs"}
                                options={getInitalCustoms(category)}
                                writeAccess={true}
                                handleCustomAttributeUpdate={handleCustomChange}
                            />
                        </div>
                    </div> : null
                    }
                </div>
            </div>
        </Modal.Body>
        <Modal.Footer>
            <Button onClick={props.handleClose}>CANCEL</Button>
            <Button variant="primary" onClick={handleSubmit} disabled={saving || !props.writeAccess}>SAVE</Button>
        </Modal.Footer>
    </Modal>;
}

export default PublisherAdslotModal;