import * as React from "react";
import { Form } from "react-bootstrap";
import Select from "react-select";
import FontIcon from "../../../UI/FontIcon";
import { SegmentPage, SegmentConstraint } from "../../../../models/data/Segment";
import * as Validation from "../../../../client/Validation";
import { ValidationError, SelectOption } from "../../../../client/schemas";

interface SegmentPageRowProps {
  index: number;
  page: SegmentPage & { key: string };
  writeAccess: boolean;
  onChange: (i: number, page: SegmentPage & { key: string }, isValid: boolean) => void;
  onDelete: (i: number) => void;
}

interface SegmentPageRowState {
  constraint: SegmentConstraint;
  value: string;
  valueValidation: ValidationError;
}

export default class SegmentPageRow extends React.Component<SegmentPageRowProps, SegmentPageRowState> {
  constructor(props, context) {
    super(props, context);
    this.state = {
      constraint: "Contains",
      value: "/",
      valueValidation: {
        error: false,
        message: ""
      },
    };
  }

  componentDidMount() {
    this.loadData(this.props);
  }

  componentWillReceiveProps(nextProps) {
    this.loadData(nextProps);
  }

  loadData(props: SegmentPageRowProps) {
    this.setState({
      constraint: props.page.constraint,
      value: props.page.value
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

  handleConstraintChange = (selected) => {
    this.setState({ constraint: selected.value }, () => {
      const page = { constraint: this.state.constraint, value: this.state.value, key: this.props.page.key };
      this.props.onChange(this.props.index, page, !this.state.valueValidation.error);
    });
  };

  handleValueChange = (e) => {
    const value = e.target.value;
    const valueValidation = Validation.required(e.target.value);

    this.setState({ value, valueValidation }, () => {
      const page = { constraint: this.state.constraint, value: this.state.value, key: this.props.page.key };
      this.props.onChange(this.props.index, page, !valueValidation.error);
    });
  }

  render() {
    const options = this.getOptions();

    return <div>
      <div className="array-row">
        <div className="row no-gutters">
          <div className="col-lg-4 px-1 pb-1">
            <Select
              isDisabled={!this.props.writeAccess}
              inputId={"react-select-page-constraint-" + this.props.page.key}
              className="react-select-container"
              classNamePrefix="react-select"
              onChange={this.handleConstraintChange}
              value={options.find((o) => { return o.value === this.state.constraint })}
              options={options}
            />
          </div>
          <div className="col-lg-8 px-1 pb-1">
            <Form.Control
              id={"page-value" + this.props.page.key}
              readOnly={!this.props.writeAccess}
              placeholder="e.g. /examplePage"
              type="text"
              isInvalid={this.state.valueValidation.error}
              value={this.state.value}
              onChange={this.handleValueChange}
            />
            {this.state.valueValidation.error && <Form.Control.Feedback type="invalid">{this.state.valueValidation.message}</Form.Control.Feedback>}
          </div>
        </div>
      </div>
      <div className="array-row-remove-btn">
        <a href="" className="table-btn" onClick={(e) => { e.preventDefault(); this.props.onDelete(this.props.index) }}><FontIcon name="remove" /></a>
      </div>
    </div>;
  }
}