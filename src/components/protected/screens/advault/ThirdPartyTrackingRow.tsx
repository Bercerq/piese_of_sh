import React, { useState, useEffect } from "react";
import { Form } from "react-bootstrap";
import Select from "react-select";
import FontIcon from "../../../UI/FontIcon";
import * as Validation from "../../../../client/Validation";
import { ValidationError } from "../../../../client/schemas";

export type ThirdPartyTrackingEventType = "impression" | "click" | "start" | "firstQuartile" | "midpoint" | "thirdQuartile" | "complete";

export interface ThirdPartyTrackingEvent {
  type: ThirdPartyTrackingEventType;
  url: string;
}

interface ThirdPartyTrackingRowProps {
  index: number;
  item: ThirdPartyTrackingEvent & { key: string };
  onChange: (i: number, item: ThirdPartyTrackingEvent & { key: string }, isValid: boolean) => void;
  onDelete: (i: number) => void;
}

const ThirdPartyTrackingRow = (props: ThirdPartyTrackingRowProps) => {
  const [type, setType] = useState<ThirdPartyTrackingEventType>("impression");
  const [url, setUrl] = useState<string>("");
  const [urlValidation, setUrlValidation] = useState<ValidationError>({ error: false, message: "" });

  useEffect(loadData, [props.item]);

  function loadData() {
    if (props.item) {
      const type = props.item.type;
      const url = props.item.url;
      setType(type);
      setUrl(url);
    }
  }

  const options = [{
    value: "impression",
    label: "Impression"
  }, {
    value: "click",
    label: "Click"
  }, {
    value: "start",
    label: "Start"
  }, {
    value: "firstQuartile",
    label: "25% video complete"
  }, {
    value: "midpoint",
    label: "50% video complete"
  }, {
    value: "thirdQuartile",
    label: "75% video complete"
  }, {
    value: "complete",
    label: "Video complete"
  }];

  const handleTypeChange = (selected) => {
    const type = selected.value as ThirdPartyTrackingEventType;
    setType(type);
    props.onChange(props.index, { type, url, key: props.item.key }, !urlValidation.error);
  }

  const handleUrlChange = (e) => {
    const url = e.target.value;
    const urlValidation = Validation.url(url, true);
    setUrl(url);
    setUrlValidation(urlValidation);
    props.onChange(props.index, { type, url, key: props.item.key }, !urlValidation.error);
  }

  const handleRemove = (e) => {
    e.preventDefault();
    props.onDelete(props.index);
  }

  return <div>
    <div className="array-row">
      <div className="row no-gutters">
        <div className="col-lg-4 px-1">
          <Form.Group>
            <Form.Label>Event type</Form.Label>
            <Select
              inputId={`react-select-tracking-type-${props.index}`}
              className="react-select-container"
              classNamePrefix="react-select"
              onChange={handleTypeChange}
              value={options.find((o) => { return o.value === type })}
              options={options}
            />
          </Form.Group>
        </div>
        <div className="col-lg-8 px-1">
          <Form.Group>
            <Form.Label>Tracking url</Form.Label>
            <Form.Control
              id={`react-select-tracking-url-${props.index}`}
              type="text"
              isInvalid={urlValidation.error}
              value={url}
              onChange={handleUrlChange}
            />
            {urlValidation.error && <Form.Control.Feedback type="invalid">{urlValidation.message}</Form.Control.Feedback>}
          </Form.Group>
        </div>
      </div>
    </div>
    <div className="array-row-remove-btn" style={{ marginTop: "28px" }}>
      <a href="" className="table-btn" onClick={handleRemove}><FontIcon name="remove" /></a>
    </div>
  </div>;
}
export default ThirdPartyTrackingRow;