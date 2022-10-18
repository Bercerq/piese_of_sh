import * as React from "react";
import { Modal, Button, Form } from "react-bootstrap";
import Select from "react-select";
import * as _ from "lodash";
import { v4 as uuidv4 } from "uuid";
import { Segment, SegmentPage, SegmentConstraint, SegmentVar } from "../../../../models/data/Segment";
import * as Validation from "../../../../client/Validation";
import * as Api from "../../../../client/Api";
import * as Utils from "../../../../client/Utils";
import * as Helper from "../../../../client/Helper";
import { ValidationError, SelectOption, ScopeType, KeyBoolean } from "../../../../client/schemas";
import SegmentPageRow from "./SegmentPageRow";
import SegmentVarRow from "./SegmentVarRow";
import FontIcon from "../../../UI/FontIcon";

interface SegmentModalProps {
  segment: Segment;
  scope: ScopeType;
  scopeId: number;
  writeAccess: boolean;
  show: boolean;
  advertiserDomain: string;
  onClose: () => void;
  onSubmit: (id: number, segment: Segment) => void;
}

interface SegmentModalState {
  name: string;
  advertisers: SelectOption[];
  advertiserId: number;
  type: string;
  typeReadonly: string;
  postView: string;
  postViewPeriod: string;
  postClick: string;
  postClickPeriod: string;
  uniqueTime: string;
  uniqueTimePeriod: string;
  domain: string;
  pages: (SegmentPage & { key: string })[];
  vars: SegmentVar[];
  pagesValidation: boolean[];
  nameValidation: ValidationError;
  postViewValidation: ValidationError;
  postClickValidation: ValidationError;
  uniqueTimeValidation: ValidationError;
  saving: boolean;
}

export default class SegmentModal extends React.Component<SegmentModalProps, SegmentModalState> {
  constructor(props, context) {
    super(props, context);
    this.state = this.initialState(props);
  }

  async loadData(props: SegmentModalProps) {
    if (props.segment) {
      const name = props.segment.name;
      const typeReadonly = props.segment.type;
      const postViewObj = Utils.getValuePeriod(props.segment.postView);
      const postClickObj = Utils.getValuePeriod(props.segment.postClick);
      const uniqueTimeObj = Utils.getValuePeriod(props.segment.uniqueTime);
      const domain = props.segment.domain;
      const pages = (props.segment.pages && props.segment.pages.length > 0) ? this.assignKeys(props.segment.pages) : [{ constraint: "Contains" as SegmentConstraint, value: "/", key: uuidv4() }];
      const vars = (props.segment.vars && props.segment.vars.length > 0) ? props.segment.vars : [{ name: "", constraint: "Contains" as SegmentConstraint, value: "" }];
      const pagesValidation = (props.segment.pages && props.segment.pages.length > 0) ? props.segment.pages.map((s) => { return true }) : [true];
      this.setState({
        name,
        advertiserId: props.segment.advertiserId,
        typeReadonly,
        postView: postViewObj.value,
        postViewPeriod: postViewObj.period,
        postClick: postClickObj.value,
        postClickPeriod: postClickObj.period,
        uniqueTime: uniqueTimeObj.value,
        uniqueTimePeriod: uniqueTimeObj.period,
        domain,
        pages,
        vars,
        pagesValidation,
        saving: false
      });
    } else {
      if (props.scope === "advertiser") {
        const advertiserId = props.scopeId;
        const state = _.assign({}, this.initialState(props), { advertisers: [], advertiserId });
        this.setState(state);
      } else {
        const qs = Helper.scopedParam({ scope: this.props.scope, scopeId: this.props.scopeId });
        const rslt = await Api.Get({ path: "/api/advertisers", qs });
        const advertisers = _.get(rslt, "advertisers", []).map((o) => { return { value: o.advertiser.id, label: o.advertiser.name } });
        const advertiserId = advertisers.length > 0 ? advertisers[0].value : -1;
        const state = _.assign({}, this.initialState(props), { advertisers, advertiserId });
        this.setState(state);
      }
    }
  }

  initialState(props) {
    return {
      name: "",
      advertisers: [],
      advertiserId: -1,
      type: this.segmentTypes()[0].value as string,
      typeReadonly: "",
      postView: "30",
      postViewPeriod: "2",
      postClick: "30",
      postClickPeriod: "2",
      uniqueTime: "1",
      uniqueTimePeriod: "2",
      domain: props.advertiserDomain,
      pages: [{ constraint: "Contains" as SegmentConstraint, value: "/", key: uuidv4() }],
      vars: [{ name: "", constraint: "Contains" as SegmentConstraint, value: "" }],
      pagesValidation: [true],
      nameValidation: {
        error: false,
        message: ""
      },
      postViewValidation: {
        error: false,
        message: ""
      },
      postClickValidation: {
        error: false,
        message: ""
      },
      uniqueTimeValidation: {
        error: false,
        message: ""
      },
      saving: false
    }
  }

  assignKeys(pages: SegmentPage[]): (SegmentPage & { key: string })[] {
    return pages.map((o) => { return _.assign(o, { key: uuidv4() }); });
  }

  removeKeys(pages: (SegmentPage & { key: string })[]): SegmentPage[] {
    return pages.map((o) => { return _.omit(o, "key") });
  }

  segmentTypes(): SelectOption[] {
    return [{ value: "Segment", label: "Segment" }, { value: "Orderbasket", label: "Orderbasket" }, { value: "Conversion", label: "Conversion" }];
  }

  periodOptions(includeNever: boolean): SelectOption[] {
    if (includeNever) {
      return [{ value: "0", label: "Minutes" }, { value: "1", label: "Hours" }, { value: "2", label: "Days" }, { value: "3", label: "Never" }];
    }
    return [{ value: "0", label: "Minutes" }, { value: "1", label: "Hours" }, { value: "2", label: "Days" }];
  }

  hasInvalidPages() {
    return this.state.pagesValidation.indexOf(false) > -1;
  }

  handleEntering = async () => {
    await this.loadData(this.props);
  }

  handleClose = () => {
    const state = this.initialState(this.props);
    this.setState(state, () => { this.props.onClose() });
  }

  handleAdvertiserChange = (selected) => {
    this.setState({ advertiserId: selected.value });
  }

  handleNameChange = (e) => {
    const name = e.target.value;
    const nameValidation = Validation.required(e.target.value);
    this.setState({ name, nameValidation });
  }

  handleSegmentTypeChange = (selected) => {
    this.setState({ type: selected.value as string });
  }

  handlePostViewChange = (e) => {
    const postView = e.target.value;
    const postViewValidation = Validation.native(e.target);
    this.setState({ postView, postViewValidation });
  }

  handlePostViewPeriodChange = (selected) => {
    this.setState({ postViewPeriod: selected.value as string });
  }

  handlePostClickChange = (e) => {
    const postClick = e.target.value;
    const postClickValidation = Validation.native(e.target);
    this.setState({ postClick, postClickValidation });
  }

  handlePostClickPeriodChange = (selected) => {
    this.setState({ postClickPeriod: selected.value as string });
  }

  handleUniqueTimeChange = (e) => {
    const uniqueTime = e.target.value;
    const uniqueTimeValidation = Validation.native(e.target);
    this.setState({ uniqueTime, uniqueTimeValidation });
  }

  handleUniqueTimePeriodChange = (selected) => {
    const uniqueTimePeriod = selected.value as string;
    if (uniqueTimePeriod === "3") {
      const uniqueTimeValidation = {
        error: false,
        message: ""
      }
      this.setState({ uniqueTime: "", uniqueTimePeriod, uniqueTimeValidation });
    } else {
      this.setState({ uniqueTimePeriod });
    }
  }

  handlePagesChange = (i: number, page: SegmentPage & { key: string }, isValid: boolean) => {
    let pages = _.cloneDeep(this.state.pages);
    pages[i] = page;
    const pagesValidation = this.state.pagesValidation.concat();
    pagesValidation[i] = isValid;
    this.setState({ pages, pagesValidation });
  }

  handlePageDelete = (i: number) => {
    const pages = _.cloneDeep(this.state.pages);
    const pagesValidation = this.state.pagesValidation.concat();
    if (pages.length > 1) {
      pages.splice(i, 1);
      pagesValidation.splice(i, 1);
      this.setState({ pages, pagesValidation });
    }
  }

  handlePageAdd = () => {
    const newPage = { constraint: "Contains" as SegmentConstraint, value: "/", key: uuidv4() };
    this.setState(prevState => ({ pages: [...prevState.pages, newPage], pagesValidation: [...prevState.pagesValidation, true] }));
  }

  handleVarsChange = (i: number, segmentVar: SegmentVar) => {
    let vars = this.state.vars.concat();
    vars[i] = segmentVar;
    this.setState({ vars });
  }

  handleVarDelete = (i: number) => {
    const vars = this.state.vars.concat();
    if (vars.length > 1) {
      vars.splice(i, 1);
      this.setState({ vars });
    }
  }

  handleVarAdd = () => {
    const newVar = { name: "", constraint: "Contains" as SegmentConstraint, value: "" };
    this.setState(prevState => ({ vars: [...prevState.vars, newVar] }));
  }

  handleSubmit = () => {
    const id = _.get(this.props, "segment.id", -1);
    const nameValidation = Validation.required(this.state.name);
    const hasInvalidPages = this.hasInvalidPages();
    const hasErrors = [nameValidation.error, this.state.postViewValidation.error, this.state.postClickValidation.error, this.state.uniqueTimeValidation.error, hasInvalidPages].indexOf(true) > -1;

    if (hasErrors) {
      this.setState({ nameValidation });
    } else {
      this.setState({ saving: true }, () => {
        const postView = Utils.getValueInMinutes({ value: this.state.postView, period: this.state.postViewPeriod });
        const postClick = Utils.getValueInMinutes({ value: this.state.postClick, period: this.state.postClickPeriod });
        const uniqueTime = Utils.getValueInMinutes({ value: this.state.uniqueTime, period: this.state.uniqueTimePeriod });
        const vars = this.state.vars.filter((o) => { return o.name.trim() !== "" && o.value.trim() !== ""; });

        const segment = {
          name: this.state.name,
          advertiserId: this.state.advertiserId,
          type: this.state.type,
          domain: this.state.domain,
          postView,
          postClick,
          uniqueTime,
          pages: this.removeKeys(this.state.pages),
          vars
        };
        this.props.onSubmit(id, segment);
      });
    }
  }

  render() {
    const showAdvertiserSelect = ["root", "organization", "agency"].indexOf(this.props.scope) > -1 && !this.props.segment;
    const segmentTypeOptions = this.segmentTypes();
    return <Modal size="lg" onEntering={this.handleEntering} show={this.props.show} onHide={this.handleClose} backdrop="static">
      <Modal.Header closeButton>
        <Modal.Title>Segment settings</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          {showAdvertiserSelect &&
            <div className="row no-gutters">
              <div className="col-lg-6 px-1">
                <Form.Group controlId="segment-advertiser">
                  <Form.Label>Advertiser * </Form.Label>
                  <Select
                    inputId="react-select-segment-advertiser"
                    className="react-select-container"
                    classNamePrefix="react-select"
                    clearable={false}
                    value={this.state.advertisers.find((o) => { return o.value === this.state.advertiserId })}
                    onChange={this.handleAdvertiserChange}
                    options={this.state.advertisers}
                  />
                </Form.Group>
              </div>
            </div>
          }
          <div className="row no-gutters">
            <div className="col-lg-6 px-1">
              <Form.Group controlId="segment-name">
                <Form.Label>Name *</Form.Label>
                <Form.Control
                  readOnly={!this.props.writeAccess}
                  type="text"
                  isInvalid={this.state.nameValidation.error}
                  value={this.state.name}
                  onChange={this.handleNameChange}
                />
                {this.state.nameValidation.error && <Form.Control.Feedback type="invalid">{this.state.nameValidation.message}</Form.Control.Feedback>}
              </Form.Group>
            </div>
            <div className="col-lg-6 px-1">
              <Form.Group controlId="segment-type">
                <Form.Label>Type</Form.Label>
                {!this.props.segment &&
                  <Select
                    isDisabled={!this.props.writeAccess}
                    inputId="react-select-segment-type"
                    className="react-select-container"
                    classNamePrefix="react-select"
                    onChange={this.handleSegmentTypeChange}
                    value={segmentTypeOptions.find((o) => { return o.value === this.state.type })}
                    options={segmentTypeOptions}
                  />
                }
                {this.props.segment &&
                  <Form.Control
                    readOnly={true}
                    type="text"
                    value={this.state.typeReadonly}
                  />}
              </Form.Group>
            </div>
          </div>
          <div className="row no-gutters">
            <div className="col-lg-4">
              <Form.Group>
                <Form.Label style={{ height: "32px" }}>Count viewer as post view up till</Form.Label>
                <div className="row no-gutters">
                  <div className="col-lg-6 px-1 pb-1">
                    <Form.Control
                      id="segment-postview"
                      readOnly={!this.props.writeAccess}
                      required
                      type="number"
                      min="0"
                      value={this.state.postView}
                      onChange={this.handlePostViewChange}
                    />
                  </div>
                  <div className="col-lg-6 px-1 pb-1">
                    <Select
                      inputId="react-select-postview"
                      isDisabled={!this.props.writeAccess}
                      className="react-select-container"
                      classNamePrefix="react-select"
                      onChange={this.handlePostViewPeriodChange}
                      isInvalid={this.state.postViewValidation.error}
                      value={this.periodOptions(false).find((o) => { return o.value === this.state.postViewPeriod })}
                      options={this.periodOptions(false)}
                    />
                  </div>
                </div>
                {this.state.postViewValidation.error && <Form.Control.Feedback type="invalid">{this.state.postViewValidation.message}</Form.Control.Feedback>}
              </Form.Group>
            </div>
            <div className="col-lg-4">
              <Form.Group>
                <Form.Label style={{ height: "32px" }}>Count viewer as post click up till</Form.Label>
                <div className="row no-gutters">
                  <div className="col-lg-6 px-1 pb-1">
                    <Form.Control
                      id="segment-postclick"
                      readOnly={!this.props.writeAccess}
                      required
                      type="number"
                      min="0"
                      value={this.state.postClick}
                      onChange={this.handlePostClickChange}
                    />
                  </div>
                  <div className="col-lg-6 px-1 pb-1">
                    <Select
                      inputId="react-select-postclick"
                      isDisabled={!this.props.writeAccess}
                      className="react-select-container"
                      classNamePrefix="react-select"
                      onChange={this.handlePostClickPeriodChange}
                      value={this.periodOptions(false).find((o) => { return o.value === this.state.postClickPeriod })}
                      options={this.periodOptions(false)}
                    />
                  </div>
                </div>
                {this.state.postClickValidation.error && <Form.Control.Feedback type="invalid">{this.state.postClickValidation.message}</Form.Control.Feedback>}
              </Form.Group>
            </div>
            <div className="col-lg-4">
              <Form.Group>
                <Form.Label style={{ height: "34px" }}>Treat repeated event by viewer as new event after</Form.Label>
                <div className="row no-gutters">
                  <div className="col-lg-6 px-1 pb-1">
                    <Form.Control
                      id="segment-uniquetime"
                      readOnly={!this.props.writeAccess || this.state.uniqueTimePeriod === "3"}
                      required
                      type="number"
                      min="0"
                      value={this.state.uniqueTime}
                      onChange={this.handleUniqueTimeChange}
                    />
                  </div>
                  <div className="col-lg-6 px-1 pb-1">
                    <Select
                      inputId="react-select-uniquetime"
                      isDisabled={!this.props.writeAccess}
                      className="react-select-container"
                      classNamePrefix="react-select"
                      onChange={this.handleUniqueTimePeriodChange}
                      value={this.periodOptions(true).find((o) => { return o.value === this.state.uniqueTimePeriod })}
                      options={this.periodOptions(true)}
                    />
                  </div>
                </div>
                {this.state.uniqueTimeValidation.error && <Form.Control.Feedback type="invalid">{this.state.uniqueTimeValidation.message}</Form.Control.Feedback>}
              </Form.Group>
            </div>
          </div>
          <div className="row no-gutters">
            <div className="col-lg-12 px-1">
              <Form.Group controlId="segment-domain">
                <Form.Label>Domain</Form.Label>
                <Form.Control
                  readOnly={!this.props.writeAccess}
                  type="text"
                  placeholder="e.g. domain.nl (without http://, https://, www.)"
                  value={this.state.domain}
                  onChange={(e) => { this.setState({ domain: e.target.value }) }}
                />
              </Form.Group>
            </div>
          </div>
          <div className="row no-gutters">
            <div className="col-lg-12">
              <Form.Group>
                <Form.Label className="px-1">Pages</Form.Label>
                <div>
                  {
                    this.state.pages.map((page, i) => <SegmentPageRow
                      key={page.key}
                      index={i}
                      page={page}
                      writeAccess={this.props.writeAccess}
                      onChange={this.handlePagesChange}
                      onDelete={this.handlePageDelete}
                    />)
                  }
                </div>
                <Button size="sm" variant="primary" onClick={this.handlePageAdd} disabled={!this.props.writeAccess}><FontIcon name="plus" /> ADD PAGE</Button>
              </Form.Group>
            </div>
          </div>
          <div className="row no-gutters">
            <div className="col-lg-12">
              <Form.Group>
                <Form.Label className="px-1">Variables</Form.Label>
                <div>
                  {
                    this.state.vars.map((segmentVar, i) => <SegmentVarRow
                      index={i}
                      var={segmentVar}
                      writeAccess={this.props.writeAccess}
                      onChange={this.handleVarsChange}
                      onDelete={this.handleVarDelete}
                    />)
                  }
                </div>
                <Button size="sm" variant="primary" onClick={this.handleVarAdd} disabled={!this.props.writeAccess}><FontIcon name="plus" /> ADD VARIABLE</Button>
              </Form.Group>
            </div>
          </div>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button size="sm" variant="light" onClick={this.handleClose}>CANCEL</Button>
        <Button size="sm" variant="primary" onClick={this.handleSubmit} disabled={this.state.saving || !this.props.writeAccess}>SAVE</Button>
      </Modal.Footer>
    </Modal>;
  }
}