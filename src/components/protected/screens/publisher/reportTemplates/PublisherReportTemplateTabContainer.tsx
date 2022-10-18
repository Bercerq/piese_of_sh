import React, { useState, useEffect } from "react";
import { Form, Button } from "react-bootstrap";
import * as _ from "lodash";
import * as Validation from "../../../../../client/Validation";
import PublisherReportTabFigureContainer from "../../reportTemplates/ReportTabFigureContainer";
import { ReportTabFigure, ReportTemplateTab } from "../../../../../models/data/Report";
import { GroupOption, SelectOption, ValidationError } from "../../../../../client/schemas";
import FontIcon from "../../../../UI/FontIcon";

interface ReportTemplateTabContainerProps {
  index: number;
  tab: ReportTemplateTab & { key: string };
  writeAccess: boolean;
  metricOptions: SelectOption[];
  dimensionOptions: (GroupOption | SelectOption)[];
  onChange: (i: number, tab: ReportTemplateTab & { key: string }, isValid: boolean) => void;
  onDelete: (i: number) => void;
}

const PublisherReportTemplateTabContainer = (props: ReportTemplateTabContainerProps) => {
  const [name, setName] = useState<string>(props.tab.name);
  const [nameValidation, setNameValidation] = useState<ValidationError>({ error: false, message: "" });
  const [figures, setFigures] = useState<ReportTabFigure[]>(props.tab.figures);
  const [figuresValidation, setFiguresValidation] = useState<boolean[]>((props.tab.figures || []).map((o) => { return true; }));

  useEffect(() => {
    const invalidFigures = hasInvalidFigures();
    props.onChange(props.index, { name, figures, key: props.tab.key }, !nameValidation.error && !invalidFigures);
  }, [name, figures]);

  useEffect(() => {
    setName(props.tab.name);
    setFigures(props.tab.figures);
  }, [JSON.stringify(props.tab)]);

  function hasInvalidFigures() {
    return figuresValidation.indexOf(false) > -1;
  }

  const handleNameChange = (e) => {
    const name = e.target.value;
    const nameValidation = Validation.required(name);
    setName(name);
    setNameValidation(nameValidation);
  }

  const addTableClick = () => {
    const newFigure: ReportTabFigure = { title: "", type: "table", dimensions: ["date"], metrics: [], limit: 50, includeTotal: true };
    setFigures([...figures, newFigure]);
  }

  const addChartClick = () => {
    const newFigure: ReportTabFigure = { title: "", type: "barchart", dimensions: ["date"], metrics: [], secondaryMetrics: [], limit: 50, figureWidth: 17, figureHeight: 17 };
    setFigures([...figures, newFigure]);
  }

  const handleFigureChange = (index: number, figure: ReportTabFigure, isValid: boolean) => {
    let updatedFigures = _.cloneDeep(figures);
    updatedFigures[index] = figure;
    setFigures(updatedFigures);

    let updatedFiguresValidation = figuresValidation.concat();
    updatedFiguresValidation[index] = isValid;
    setFiguresValidation(updatedFiguresValidation);
  }

  const handleFigureDelete = (index: number) => {
    const updatedFigures = _.cloneDeep(figures);
    if (updatedFigures.length > 0) {
      updatedFigures.splice(index, 1);
      setFigures(updatedFigures);

      const updatedFiguresValidation = figuresValidation.concat();
      updatedFiguresValidation.splice(index, 1);
      setFiguresValidation(updatedFiguresValidation);
    }
  }

  return <div className="card mb-3 mt-3">
    <div className="row template-tab-row">
      <div className="col-sm-12">
        <Form.Group controlId={`tab-name-${props.index}`}>
          <Form.Label>Name *</Form.Label>
          <Form.Control
            readOnly={!props.writeAccess}
            type="text"
            isInvalid={nameValidation.error}
            value={name}
            onChange={handleNameChange}
          />
          {
            nameValidation.error &&
            <Form.Control.Feedback type="invalid">{nameValidation.message}</Form.Control.Feedback>
          }
        </Form.Group>
      </div>
    </div>
    {
      figures.map((figure, i) => <PublisherReportTabFigureContainer
        tabIndex={props.index}
        index={i}
        type={figure.type === "table" ? "table" : "chart"}
        figure={figure}
        metricOptions={props.metricOptions}
        dimensionOptions={props.dimensionOptions}
        writeAccess={props.writeAccess}
        onChange={handleFigureChange}
        onDelete={handleFigureDelete}
      />)
    }
    <div className="row">
      <div className="col-lg-12 mt-2">
        <div className="pull-left">
          <button className="btn btn-secondary btn-xs" disabled={!props.writeAccess} onClick={() => { props.onDelete(props.index) }}><FontIcon name="remove" /> DELETE TAB</button>
        </div>
        <div className="pull-right">
          <button className="mr-2 btn btn-primary btn-xs" disabled={!props.writeAccess} onClick={addTableClick}><FontIcon name="plus" /> ADD TABLE</button>
          <button className="btn btn-primary btn-xs" disabled={!props.writeAccess} onClick={addChartClick}><FontIcon name="plus" /> ADD CHART</button>
        </div>
      </div>
    </div>
  </div>;
}
export default PublisherReportTemplateTabContainer;