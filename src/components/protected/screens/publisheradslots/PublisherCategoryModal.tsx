import * as React from "react";
import momentPropTypes from "react-moment-proptypes";
import * as moment from "moment";
import { Modal, Button, FormGroup, FormControl, FormLabel, Alert } from "react-bootstrap";
import * as _ from "lodash";
import * as Datetime from "react-datetime";
import * as Validation from "../../../../client/Validation";
import { ValidationError } from "../../../../client/schemas";
import { OverwritableProperty, flattenAdslotCategories, flattenAdslotSites, overwritablePropertiesToMap } from "./OverwritableProperty"
import { PublisherAdslotCategory, PublisherSite, SiteProperties } from "../../../../models/data/PublisherAdslot";
import CustomAttributeForm from "./customAttributes/CustomAttributeForm"


interface PublisherAdCategoryModalProps {
    category: PublisherAdslotCategory;
    site: PublisherSite,
    allowedCustoms: OverwritableProperty[];
    show: boolean;
    writeAccess: boolean;
    handleClose: () => void;
    handleSubmit: (id: number, adCategory: PublisherAdslotCategory) => void;
}

const PublisherAdCategoryModal = (props: PublisherAdCategoryModalProps) => {
    const [saving, setSaving] = React.useState<boolean>(false);
    const [name, setName] = React.useState<string>("");
    const [site, setSite] = React.useState<PublisherSite>(props.site)
    const [exampleUrl, setExampleUrl] = React.useState<string>("");
    const [comments, setComments] = React.useState<string>("");
    const [nameValidation, setNameValidation] = React.useState<ValidationError>({ error: false, message: "" });
    const [unchangedCustoms, setUnchangedCustoms] = React.useState<OverwritableProperty[]>(
        getInitalCustoms());
    const [customs, setCustoms] = React.useState<OverwritableProperty[]>(
        unchangedCustoms);


    function getInitalCustoms() {
        return (props.category) ? flattenAdslotCategories("category", props.category, props.allowedCustoms)
            : ((props.site) ? flattenAdslotSites("category", props.site, props.allowedCustoms) : [])
    }

    const handleEntering = () => {
        const name = _.get(props, "category.name") || "";
        const exampleUrl = _.get(props, "category.exampleUrl") || "";
        const comments = _.get(props, "category.comments") || "";
        setName(name);
        setUnchangedCustoms(getInitalCustoms())
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

    const handleSubmit = () => {
        const nameValidation = Validation.required(name);
        if (nameValidation.error) {
            setNameValidation(nameValidation);
        } else {
            setSaving(true);
            const customAttributes = overwritablePropertiesToMap(customs)
            const id = _.get(props, "category.id");
            const submitEntry = {
                name: name,
                exampleUrl: exampleUrl,
                customProperties: Object.fromEntries(customAttributes),
            };
            props.handleSubmit(id, submitEntry);
            clearState();
            props.handleClose();
        }
    }

    function clearState() {
        setName("");
        setExampleUrl("");
        setComments("");
        setUnchangedCustoms([])
        setNameValidation({ error: false, message: "" });
        setSaving(false);
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
                            <Alert>{nameValidation.message}</Alert>
                        }
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
                    {/*
                    <FormGroup controlId="comments">
                        <ControlLabel>Comments</ControlLabel>
                        <FormControl
                            readOnly={!props.writeAccess}
                            type="text"
                            value={comments}
                            onChange={(e) => setComments(e.target.value)}
                        />
                    </FormGroup>*/}

                    {(props.allowedCustoms && props.allowedCustoms.length > 0) ? <div className="row">
                        <div className="col-sm-12">
                            <CustomAttributeForm
                                name={"Customs"}
                                options={getInitalCustoms()}
                                writeAccess={true}
                                handleCustomAttributeUpdate={handleCustomChange}
                            />
                        </div>
                    </div>
                        : null
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

export default PublisherAdCategoryModal;