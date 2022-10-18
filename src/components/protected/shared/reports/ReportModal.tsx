import React, { useState, useEffect, useContext, Fragment } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import FontIcon from "../../../UI/FontIcon";
import * as Validation from "../../../../client/Validation";
import { Metric, DateRange, SelectOption, ValidationError } from "../../../../client/schemas";
import ReportDateRangePicker from "./ReportDateRangePicker";
import CheckboxList from "../../../UI/CheckboxList";
import QsContext from "../../context/QsContext";
import { QsContextType } from "../../../../models/Common";

interface ReportModalProps {
  id: string;
  show: boolean;
  downloading: boolean;
  metrics: Metric[];
  selectedMetrics?: string[];
  onClose: () => void;
  onSubmit: (data: { daterange: DateRange, selectedMetrics: Metric[] }) => void;
}

const ReportModal = (props: ReportModalProps) => {
  const metricsOptions: SelectOption[] = props.metrics.map((o) => { return { value: o.col, label: o.label || o.col } });
  let daterangeContext = useContext<QsContextType>(QsContext);
  let initialDaterange: DateRange = daterangeContext.daterange;
  const initialChecked = props.selectedMetrics ? props.selectedMetrics : props.metrics.map((o) => { return o.col });
  const [daterange, setDaterange] = useState<DateRange>(initialDaterange);
  const [checked, setChecked] = useState<string[]>(initialChecked);
  const [downloading, setDownloading] = useState<boolean>(false);
  const [daterangeValidation, setDaterangeValidation] = useState<ValidationError>({ error: false, message: "" });

  useEffect(() => { setDownloading(props.downloading) }, [props.downloading]);
  
  const handleEntering = () => {
    setDaterange(initialDaterange);
    setDaterangeValidation({ error: false, message: "" });
    setChecked(initialChecked);
  }

  const handleSubmit = () => {
    const selectedMetrics = props.metrics.filter((o) => { return checked.indexOf(o.col) > -1 });
    const daterangeValidation = Validation.daterange(daterange);
    setDaterangeValidation(daterangeValidation);
    if (!daterangeValidation.error) {
      props.onSubmit({ daterange, selectedMetrics });
    }
  }

  const onDateRangeChange = (daterange: DateRange) => {
    const daterangeValidation = Validation.daterange(daterange);
    setDaterange(daterange);
    setDaterangeValidation(daterangeValidation);
  }

  const onMetricsChange = (checked: string[]) => {
    setChecked(checked);
  }

  return <Modal show={props.show} onHide={props.onClose} backdrop="static" onEntering={handleEntering}>
    <Modal.Header closeButton>
      <Modal.Title>Customize report</Modal.Title>
    </Modal.Header>
    <Modal.Body>
      <Form.Group>
        <Form.Label>Period</Form.Label>
        <div>
          <ReportDateRangePicker id={props.id} daterange={daterange} onChange={onDateRangeChange}></ReportDateRangePicker>
          {daterangeValidation.error && <Form.Control.Feedback type="invalid" style={{ display: "block" }}>{daterangeValidation.message}</Form.Control.Feedback>}
        </div>
      </Form.Group>
      <Form.Group>
        <Form.Label>Metrics</Form.Label>
        <CheckboxList
          id={`${props.id}-cb-list`}
          listClassNames="metrics-list"
          options={metricsOptions}
          selectAll={true}
          checked={checked}
          onChange={onMetricsChange}
        />
      </Form.Group>
    </Modal.Body>
    <Modal.Footer>
      <Button variant="light" size="sm" onClick={props.onClose}>CANCEL</Button>
      <Button variant="primary" size="sm" onClick={handleSubmit} disabled={downloading}>
        {!downloading && <Fragment><FontIcon name="download" /> DOWNLOAD</Fragment>}
        {downloading && <Fragment><FontIcon names={["refresh", "spin"]} /> DOWNLOADING</Fragment>}
      </Button>
    </Modal.Footer>
  </Modal>;
}
export default ReportModal;