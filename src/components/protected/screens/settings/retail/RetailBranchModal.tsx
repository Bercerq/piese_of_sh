import React from "react";
import * as _ from "lodash";
import { Modal, Button, Form } from "react-bootstrap";
import CreatableSelect from "react-select/creatable";
import * as Validation from "../../../../../client/Validation";
import { RetailBranch } from "../../../../../models/data/RetailBranch";
import { SelectOption, ValidationError } from "../../../../../client/schemas";

interface RetailBranchModalProps {
  retailBranch: RetailBranch;
  show: boolean;
  writeAccess: boolean;
  handleClose: () => void;
  handleSubmit: (id: number, retailBranch: RetailBranch) => void;
}

interface RetailBranchModalState {
  id: number;
  branchId: string;
  name: string;
  urlTag: string;
  country: string;
  region: string;
  city: string;
  postalCode: string;
  location: string;
  radius: string;
  address1: string;
  address2: string;
  targetingZipCodes: SelectOption[];
  custom1?: string;
  custom2?: string;
  custom3?: string;
  custom4?: string;
  custom5?: string;
  custom6?: string;
  custom7?: string;
  custom8?: string;
  custom9?: string;
  branchIdValidation: ValidationError;
  nameValidation: ValidationError;
  urlTagValidation: ValidationError;
  saving: boolean;
}

export default class RetailBranchModal extends React.Component<RetailBranchModalProps, RetailBranchModalState> {
  constructor(props, context) {
    super(props, context);
    this.state = this.initialState();
  }

  loadData(props: RetailBranchModalProps) {
    if (props.retailBranch) {
      const id = _.get(props, "retailBranch.id", -1);
      const branchId = _.get(props, "retailBranch.branchId", "");
      const name = _.get(props, "retailBranch.name", "");
      const urlTag = _.get(props, "retailBranch.urlTag", "");
      const country = _.get(props, "retailBranch.country", "");
      const region = _.get(props, "retailBranch.region", "");
      const city = _.get(props, "retailBranch.city", "");
      const postalCode = _.get(props, "retailBranch.postalCode", "");
      const address1 = _.get(props, "retailBranch.address1", "");
      const address2 = _.get(props, "retailBranch.address2", "");
      const location = [_.get(props, "retailBranch.latitude", ""), _.get(props, "retailBranch.longitude", "")].join(",");
      const radius = (_.get(props, "retailBranch.radius") || "").toString();
      const targetingZipCodes = (_.get(props, "retailBranch.targetingZipCodes") || []).map((v) => { return { value: v, label: v } });
      const custom1 = _.get(props, "retailBranch.custom1", "");
      const custom2 = _.get(props, "retailBranch.custom2", "");
      const custom3 = _.get(props, "retailBranch.custom3", "");
      const custom4 = _.get(props, "retailBranch.custom4", "");
      const custom5 = _.get(props, "retailBranch.custom5", "");
      const custom6 = _.get(props, "retailBranch.custom6", "");
      const custom7 = _.get(props, "retailBranch.custom7", "");
      const custom8 = _.get(props, "retailBranch.custom8", "");
      const custom9 = _.get(props, "retailBranch.custom9", "");
      this.setState({
        id,
        branchId,
        name,
        urlTag,
        country,
        region,
        city,
        postalCode,
        location,
        radius,
        address1,
        address2,
        targetingZipCodes,
        custom1,
        custom2,
        custom3,
        custom4,
        custom5,
        custom6,
        custom7,
        custom8,
        custom9,
        saving: false
      });
    } else {
      this.setState(this.initialState());
    }
  }

  initialState() {
    return {
      id: -1,
      branchId: "",
      name: "",
      urlTag: "",
      country: "",
      region: "",
      city: "",
      postalCode: "",
      location: "",
      radius: "",
      address1: "",
      address2: "",
      targetingZipCodes: [],
      custom1: "",
      custom2: "",
      custom3: "",
      custom4: "",
      custom5: "",
      custom6: "",
      custom7: "",
      custom8: "",
      custom9: "",
      branchIdValidation: {
        error: false,
        message: ""
      },
      nameValidation: {
        error: false,
        message: ""
      },
      urlTagValidation: {
        error: false,
        message: ""
      },
      saving: false
    };
  }

  handleEntering = () => {
    this.loadData(this.props);
  }

  handleClose = () => {
    const state = this.initialState();
    this.setState(state, () => { this.props.handleClose() });
  }

  handleBranchIdChange = (e) => {
    const branchId = e.target.value;
    const branchIdValidation = Validation.required(branchId);
    this.setState({ branchId, branchIdValidation });
  }

  handleNameChange = (e) => {
    const name = e.target.value;
    const nameValidation = Validation.required(name);
    this.setState({ name, nameValidation });
  }

  handleUrlTagChange = (e) => {
    const urlTag = e.target.value;
    const urlTagValidation = Validation.required(urlTag);
    this.setState({ urlTag, urlTagValidation });
  }

  handleTargetingZipCodesChange = (values: any, actionMeta: any) => {
    let targetingZipCodes = values;
    if (values.length > 0) {
      const latestValue = values[values.length - 1].value;
      const newValues = latestValue.split(/[\s,]+/).map((v) => { return { value: v, label: v } });
      if (newValues.length > 1) {
        targetingZipCodes = values.slice(0, values.length - 1).concat(newValues);
      }
    }
    this.setState({ targetingZipCodes });
  }

  handleSubmit = () => {
    const branchId = this.state.branchId;
    const branchIdValidation = Validation.required(branchId);
    const name = this.state.name;
    const nameValidation = Validation.required(name);
    const urlTag = this.state.urlTag;
    const urlTagValidation = Validation.required(urlTag);
    const radiusInput: HTMLInputElement = document.getElementById("retailbranch-radius") as HTMLInputElement;
    radiusInput.value = this.state.radius;
    const targetingZipCodes = this.state.targetingZipCodes.map((o) => { return o.value.toString() });

    const hasErrors = [branchIdValidation.error, nameValidation.error, urlTagValidation.error].indexOf(true) > -1;

    if (hasErrors) {
      this.setState({ branchIdValidation, nameValidation, urlTagValidation });
    } else {
      this.setState({ saving: true }, () => {
        const coordinates = this.state.location.split(",");
        const retailBranch: RetailBranch = {
          branchId: this.state.branchId,
          name: this.state.name,
          urlTag: this.state.urlTag,
          country: this.state.country,
          region: this.state.region,
          city: this.state.city,
          latitude: parseFloat(coordinates[0]),
          longitude: parseFloat(coordinates[1]),
          radius: parseFloat(this.state.radius),
          postalCode: this.state.postalCode,
          address1: this.state.address1,
          address2: this.state.address2,
          targetingZipCodes,
          custom1: this.state.custom1,
          custom2: this.state.custom2,
          custom3: this.state.custom3,
          custom4: this.state.custom4,
          custom5: this.state.custom5,
          custom6: this.state.custom6,
          custom7: this.state.custom7,
          custom8: this.state.custom8,
          custom9: this.state.custom9
        };
        this.props.handleSubmit(this.state.id, retailBranch);
      });
    }
  }

  render() {
    return <Modal className="retailbranch-modal" size="lg" show={this.props.show} onHide={this.handleClose} onEntering={this.handleEntering} backdrop="static">
      <Modal.Header closeButton>
        <Modal.Title>Retail branch setup</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="row no-gutters">
          <div className="col-lg-6 px-1">
            <Form.Group controlId="retailbranch-branchid">
              <Form.Label>Id *</Form.Label>
              <Form.Control
                autoFocus
                disabled={!this.props.writeAccess || this.state.id > 0}
                type="text"
                value={this.state.branchId}
                isInvalid={this.state.branchIdValidation.error}
                onChange={this.handleBranchIdChange}
              />
              {
                this.state.branchIdValidation.error &&
                <Form.Control.Feedback type="invalid">{this.state.branchIdValidation.message}</Form.Control.Feedback>
              }
            </Form.Group>
          </div>
          <div className="col-lg-6 px-1">
            <Form.Group controlId="retailbranch-name">
              <Form.Label>Name *</Form.Label>
              <Form.Control
                readOnly={!this.props.writeAccess}
                isInvalid={this.state.nameValidation.error}
                type="text"
                value={this.state.name}
                onChange={this.handleNameChange}
              />
              {
                this.state.nameValidation.error &&
                <Form.Control.Feedback type="invalid">{this.state.nameValidation.message}</Form.Control.Feedback>
              }
            </Form.Group>
          </div>
        </div>
        <div className="row no-gutters">
          <div className="col-lg-12 px-1">
            <Form.Group controlId="retailbranch-urltag">
              <Form.Label>Landing page *</Form.Label>
              <Form.Control
                readOnly={!this.props.writeAccess}
                isInvalid={this.state.urlTagValidation.error}
                type="text"
                value={this.state.urlTag}
                onChange={this.handleUrlTagChange}
              />
              {
                this.state.urlTagValidation.error &&
                <Form.Control.Feedback type="invalid">{this.state.urlTagValidation.message}</Form.Control.Feedback>
              }
            </Form.Group>
          </div>
        </div>
        <div className="row no-gutters">
          <div className="col-lg-6 px-1">
            <Form.Group controlId="retailbranch-country">
              <Form.Label>Country</Form.Label>
              <Form.Control
                readOnly={!this.props.writeAccess}
                type="text"
                value={this.state.country}
                onChange={(e) => { this.setState({ country: e.target.value }) }}
              />
            </Form.Group>
          </div>
          <div className="col-lg-6 px-1">
            <Form.Group controlId="retailbranch-region">
              <Form.Label>Region</Form.Label>
              <Form.Control
                readOnly={!this.props.writeAccess}
                type="text"
                value={this.state.region}
                onChange={(e) => { this.setState({ region: e.target.value }) }}
              />
            </Form.Group>
          </div>
        </div>
        <div className="row no-gutters">
          <div className="col-lg-6 px-1">
            <Form.Group controlId="retailbranch-city">
              <Form.Label>City</Form.Label>
              <Form.Control
                readOnly={!this.props.writeAccess}
                type="text"
                value={this.state.city}
                onChange={(e) => { this.setState({ city: e.target.value }) }}
              />
            </Form.Group>
          </div>
          <div className="col-lg-6 px-1">
            <Form.Group controlId="retailbranch-postalcode">
              <Form.Label>Postal code</Form.Label>
              <Form.Control
                readOnly={!this.props.writeAccess}
                type="text"
                value={this.state.postalCode}
                onChange={(e) => { this.setState({ postalCode: e.target.value }) }}
              />
            </Form.Group>
          </div>
        </div>
        <div className="row no-gutters">
          <div className="col-lg-6 px-1">
            <Form.Group controlId="retailbranch-location">
              <Form.Label>Location</Form.Label>
              <Form.Control
                disabled={!this.props.writeAccess}
                type="text"
                placeholder="latitude,longitude"
                value={this.state.location}
                onChange={(e) => { this.setState({ location: e.target.value }) }}
              />
            </Form.Group>
          </div>
          <div className="col-lg-6 px-1">
            <Form.Group controlId="retailbranch-radius">
              <Form.Label>Radius</Form.Label>
              <Form.Control
                readOnly={!this.props.writeAccess}
                required
                type="number"
                min="0"
                value={this.state.radius}
                onChange={(e) => { this.setState({ radius: e.target.value }) }}
              />
            </Form.Group>
          </div>
        </div>
        <div className="row no-gutters">
          <div className="col-lg-12 px-1">
            <Form.Group controlId="retailbranch-targetingzipcodes">
              <Form.Label>Targeting postal codes</Form.Label>
              <CreatableSelect
                className="react-select-container multiple"
                classNamePrefix="react-select"
                isClearable
                isMulti
                onChange={this.handleTargetingZipCodesChange}
                value={this.state.targetingZipCodes}
              />
            </Form.Group>
          </div>
        </div>
        <div className="row no-gutters">
          <div className="col-lg-6 px-1">
            <Form.Group controlId="retailbranch-address1">
              <Form.Label>Address line 1</Form.Label>
              <Form.Control
                readOnly={!this.props.writeAccess}
                type="text"
                value={this.state.address1}
                onChange={(e) => { this.setState({ address1: e.target.value }) }}
              />
            </Form.Group>
          </div>
          <div className="col-lg-6 px-1">
            <Form.Group controlId="retailbranch-address2">
              <Form.Label>Address line 2</Form.Label>
              <Form.Control
                readOnly={!this.props.writeAccess}
                type="text"
                value={this.state.address2}
                onChange={(e) => { this.setState({ address2: e.target.value }) }}
              />
            </Form.Group>
          </div>
        </div>
        <div className="row no-gutters">
          <div className="col-lg-6 px-1">
            <Form.Group controlId="retailbranch-custom1">
              <Form.Label>Custom 1</Form.Label>
              <Form.Control
                readOnly={!this.props.writeAccess}
                type="text"
                value={this.state.custom1}
                onChange={(e) => { this.setState({ custom1: e.target.value }) }}
              />
            </Form.Group>
          </div>
          <div className="col-lg-6 px-1">
            <Form.Group controlId="retailbranch-custom2">
              <Form.Label>Custom 2</Form.Label>
              <Form.Control
                readOnly={!this.props.writeAccess}
                type="text"
                value={this.state.custom2}
                onChange={(e) => { this.setState({ custom2: e.target.value }) }}
              />
            </Form.Group>
          </div>
        </div>
        <div className="row no-gutters">
          <div className="col-lg-6 px-1">
            <Form.Group controlId="retailbranch-custom3">
              <Form.Label>Custom 3</Form.Label>
              <Form.Control
                readOnly={!this.props.writeAccess}
                type="text"
                value={this.state.custom3}
                onChange={(e) => { this.setState({ custom3: e.target.value }) }}
              />
            </Form.Group>
          </div>
          <div className="col-lg-6 px-1">
            <Form.Group controlId="retailbranch-custom4">
              <Form.Label>Custom 4</Form.Label>
              <Form.Control
                readOnly={!this.props.writeAccess}
                type="text"
                value={this.state.custom4}
                onChange={(e) => { this.setState({ custom4: e.target.value }) }}
              />
            </Form.Group>
          </div>
        </div>
        <div className="row no-gutters">
          <div className="col-lg-6 px-1">
            <Form.Group controlId="retailbranch-custom5">
              <Form.Label>Custom 5</Form.Label>
              <Form.Control
                readOnly={!this.props.writeAccess}
                type="text"
                value={this.state.custom5}
                onChange={(e) => { this.setState({ custom5: e.target.value }) }}
              />
            </Form.Group>
          </div>
          <div className="col-lg-6 px-1">
            <Form.Group controlId="retailbranch-custom6">
              <Form.Label>Custom 6</Form.Label>
              <Form.Control
                readOnly={!this.props.writeAccess}
                type="text"
                value={this.state.custom6}
                onChange={(e) => { this.setState({ custom6: e.target.value }) }}
              />
            </Form.Group>
          </div>
        </div>
        <div className="row no-gutters">
          <div className="col-lg-6 px-1">
            <Form.Group controlId="retailbranch-custom7">
              <Form.Label>Custom 7</Form.Label>
              <Form.Control
                readOnly={!this.props.writeAccess}
                type="text"
                value={this.state.custom7}
                onChange={(e) => { this.setState({ custom7: e.target.value }) }}
              />
            </Form.Group>
          </div>
          <div className="col-lg-6 px-1">
            <Form.Group controlId="retailbranch-custom8">
              <Form.Label>Custom 8</Form.Label>
              <Form.Control
                readOnly={!this.props.writeAccess}
                type="text"
                value={this.state.custom8}
                onChange={(e) => { this.setState({ custom8: e.target.value }) }}
              />
            </Form.Group>
          </div>
        </div>
        <div className="row no-gutters">
          <div className="col-lg-6 px-1">
            <Form.Group controlId="retailbranch-custom9">
              <Form.Label>Custom 9</Form.Label>
              <Form.Control
                readOnly={!this.props.writeAccess}
                type="text"
                value={this.state.custom9}
                onChange={(e) => { this.setState({ custom9: e.target.value }) }}
              />
            </Form.Group>
          </div>
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="light" size="sm" onClick={this.handleClose}>CANCEL</Button>
        <Button variant="primary" size="sm" onClick={this.handleSubmit} disabled={this.state.saving}>SAVE</Button>
      </Modal.Footer>
    </Modal>
  }
}