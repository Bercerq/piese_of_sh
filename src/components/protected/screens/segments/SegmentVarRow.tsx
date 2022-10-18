import * as React from "react";
import { Form } from "react-bootstrap";
import Select from "react-select";
import { SegmentVar } from "../../../../models/data/Segment";
import { SelectOption } from "../../../../client/schemas";
import FontIcon from "../../../UI/FontIcon";

interface SegmentVarRowProps {
  index: number;
  var: SegmentVar;
  writeAccess: boolean;
  onChange: (i: number, segmentVar: SegmentVar) => void;
  onDelete: (i: number) => void;
}

export default class SegmentVarRow extends React.Component<SegmentVarRowProps, SegmentVar> {
  constructor(props, context) {
    super(props, context);
    this.state = {
      name: "",
      constraint: "Contains",
      value: ""
    };
  }

  componentDidMount() {
    this.loadData(this.props);
  }

  componentWillReceiveProps(nextProps) {
    this.loadData(nextProps);
  }

  loadData(props: SegmentVarRowProps) {
    this.setState({
      name: props.var.name,
      constraint: props.var.constraint,
      value: props.var.value
    });
  }

  getOptions(): SelectOption[] {
    return [
      { value: "Contains", label: "Contains" },
      { value: "MatchExactly", label: "Match exactly" },
      { value: "StartsWith", label: "Starts with" },
      { value: "EndsWith", label: "Ends with" }
    ]
  }

  handleNameChange = (e) => {
    this.setState({ name: e.target.value }, () => {
      this.props.onChange(this.props.index, this.state);
    });
  }

  handleConstraintChange = (selected) => {
    this.setState({ constraint: selected.value }, () => {
      this.props.onChange(this.props.index, this.state);
    });
  };

  handleValueChange = (e) => {
    this.setState({ value: e.target.value }, () => {
      this.props.onChange(this.props.index, this.state);
    });
  }

  render() {
    const options = this.getOptions();
    return <div>
      <div className="array-row">
        <div className="row no-gutters">
          <div className="col-lg-4 px-1 pb-1">
            <Form.Control
              id={"var-name-" + this.props.index}
              readOnly={!this.props.writeAccess}
              type="text"
              placeholder="variable name"
              value={this.state.name}
              onChange={this.handleNameChange}
            />
          </div>
          <div className="col-lg-4 px-1 pb-1">
            <Select
              isDisabled={!this.props.writeAccess}
              inputId={"react-select-var-constraint-" + this.props.index}
              className="react-select-container"
              classNamePrefix="react-select"
              onChange={this.handleConstraintChange}
              value={options.find((o) => { return o.value === this.state.constraint })}
              options={options}
            />
          </div>
          <div className="col-lg-4 px-1 pb-1">
            <Form.Control
              id={"var-value-" + this.props.index}
              readOnly={!this.props.writeAccess}
              type="text"
              value={this.state.value}
              placeholder="value"
              onChange={this.handleValueChange}
            />
          </div>
        </div>
      </div>
      <div className="array-row-remove-btn">
        <a href="" className="table-btn" onClick={(e) => { e.preventDefault(); this.props.onDelete(this.props.index) }}><FontIcon name="remove" /></a>
      </div>
    </div>;
  }
}