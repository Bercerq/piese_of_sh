import * as React from "react";
import momentPropTypes from "react-moment-proptypes";
import * as moment from "moment";
import { Modal, Button, FormGroup, FormControl, FormLabel, Alert } from "react-bootstrap";
import * as _ from "lodash";
import * as Datetime from "react-datetime";
import * as Validation from "../../../../client/Validation";
import { ValidationError } from "../../../../client/schemas";
import { OverwritableProperty, flattenAdslotPublisher, flattenAdslotSites, overwritablePropertiesToMap } from "./OverwritableProperty"
import { PublisherAdslotCategory, PublisherSite, PublisherSettings, IpToGeoConsent } from "../../../../models/data/PublisherAdslot";
import CustomAttributeForm from "./customAttributes/CustomAttributeForm"
import GeoFromIpSettings from "./GeoFromIp"


interface PublisherSiteModalProps {
    site: PublisherSite;
    publisherSettings: PublisherSettings,
    allowedCustoms: OverwritableProperty[];
    show: boolean;
    writeAccess: boolean;
    handleClose: () => void;
    handleSubmit: (id: number, site: PublisherSite) => void;
}

const PublisherSiteModal = (props: PublisherSiteModalProps) => {
    const [saving, setSaving] = React.useState<boolean>(false);
    const [name, setName] = React.useState<string>("");
    const [exampleUrl, setExampleUrl] = React.useState<string>("");
    const [comments, setComments] = React.useState<string>("");
    const [nameValidation, setNameValidation] = React.useState<ValidationError>({ error: false, message: "" });
    const [unchangedCustoms, setUnchangedCustoms] = React.useState<OverwritableProperty[]>(
        getInitalCustoms());
    const [customs, setCustoms] = React.useState<OverwritableProperty[]>(
        unchangedCustoms);
    const [consentSettings, setConsentSettings] = React.useState<IpToGeoConsent>(
        props?.site?.consentSettings?.geoFromIpAllowed);

    function getInitalCustoms() {
        return (props.site) ? flattenAdslotSites("site", props.site, props.allowedCustoms)
            : ((props.publisherSettings) ? flattenAdslotPublisher("site", props.publisherSettings, props.allowedCustoms) : [])
    }

    const handleEntering = () => {
        const name = props?.site?.siteProperties?.domain as string || "";
        const exampleUrl = _.get(props, "site.exampleUrl") || "";
        const comments = _.get(props, "site.comments") || "";
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
            const publisherConsent = props?.publisherSettings?.consentSettings?.geoFromIpAllowed
            //null values?! messing up stringify comparison
            const compareObjectPub = _.assign({}, publisherConsent, consentSettings)
            const compareObjectNorm = _.assign({}, consentSettings, publisherConsent)
            const savedConsent: IpToGeoConsent = (JSON.stringify(compareObjectPub) == JSON.stringify(compareObjectNorm)) ? {} :
                consentSettings
            const id = _.get(props, "site.id");
            const submitEntry = {
                siteProperties: { domain: name },
                exampleUrl: exampleUrl,
                customProperties: Object.fromEntries(customAttributes),
                consentSettings: { geoFromIpAllowed: savedConsent }
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
            <Modal.Title>Site settings</Modal.Title>
        </Modal.Header>
        <Modal.Body>
            <div className="row">
                <div className="col-sm-12">
                    <FormGroup controlId="adslot-name" className={nameValidation.error ? "has-error" : ""}>
                        <FormLabel>Domain</FormLabel>
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
                    <div className="row">
                        <div className="col-sm-12">
                            <GeoFromIpSettings
                                publisherSettings={props?.publisherSettings?.consentSettings}
                                siteSettings={props?.site?.consentSettings}
                                handleConsentChange={setConsentSettings}
                                level="site"

                            ></GeoFromIpSettings>
                        </div>
                    </div>
                    {/* <FormGroup controlId="comments">
                        <ControlLabel>Comments</ControlLabel>
                        <FormControl
                            readOnly={!props.writeAccess}
                            type="text"
                            value={comments}
                            onChange={(e) => setComments(e.target.value)}
                        />
                    </FormGroup> */}
                    { (props.allowedCustoms && props.allowedCustoms.length > 0) ? <div className="row">
                            <div className="col-sm-12">
                                <CustomAttributeForm
                                    name={"Customs"}
                                    options={getInitalCustoms()}
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

export default PublisherSiteModal;