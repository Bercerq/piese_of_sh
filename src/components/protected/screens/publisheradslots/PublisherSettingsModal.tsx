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


interface PublisherSettingModalProps {
    publisherSettings: PublisherSettings,
    allowedCustoms: OverwritableProperty[];
    show: boolean;
    writeAccess: boolean;
    handleClose: () => void;
    handleSubmit: (settings: PublisherSettings) => void;
}

const PublisherSettingsModal = (props: PublisherSettingModalProps) => {
    const [saving, setSaving] = React.useState<boolean>(false);
    const [comments, setComments] = React.useState<string>("");
    const [nameValidation, setNameValidation] = React.useState<ValidationError>({ error: false, message: "" });
    const [unchangedCustoms, setUnchangedCustoms] = React.useState<OverwritableProperty[]>(
        getInitalCustoms());
    const [customs, setCustoms] = React.useState<OverwritableProperty[]>(
        unchangedCustoms);
    const [consentSettings, setConsentSettings] = React.useState<IpToGeoConsent>(
        props?.publisherSettings?.consentSettings?.geoFromIpAllowed);

    function getInitalCustoms() {
        return (props.publisherSettings) ? flattenAdslotPublisher("publisher", props.publisherSettings, props.allowedCustoms) : []
    }

    const handleEntering = () => {

        setUnchangedCustoms(getInitalCustoms())
        setComments(comments);
        setSaving(false);
    };


    const handleCustomChange = (values: OverwritableProperty[]) => {
        setCustoms(values)
    }

    const handleSubmit = () => {
        setSaving(true);
        const customAttributes = overwritablePropertiesToMap(customs)
        const publisherConsent = props?.publisherSettings?.consentSettings?.geoFromIpAllowed
        const consent = _.assign({}, publisherConsent, consentSettings)
        const id = _.get(props, "publisherSettings.id");
        const submitEntry = {
            customProperties: Object.fromEntries(customAttributes),
            consentSettings: { geoFromIpAllowed: consent }
        };
        props.handleSubmit(submitEntry);
        clearState();
        props.handleClose();

    }

    function clearState() {
        setComments("");
        setUnchangedCustoms([])
        setNameValidation({ error: false, message: "" });
        setSaving(false);
        setUnchangedCustoms([])
    }

    return <Modal show={props.show} onHide={() => { props.handleClose(); clearState() }} onEntering={handleEntering} backdrop="static">
        <Modal.Header closeButton>
            <Modal.Title>Publisher settings</Modal.Title>
        </Modal.Header>
        <Modal.Body>
            <div className="row">
                <div className="col-sm-12">
                    <div className="row">
                        <div className="col-sm-12">
                            <GeoFromIpSettings
                                publisherSettings={props?.publisherSettings?.consentSettings}
                                siteSettings={null}
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

                    {(props.allowedCustoms && props.allowedCustoms.length > 0) ? <div className="row">
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

export default PublisherSettingsModal;