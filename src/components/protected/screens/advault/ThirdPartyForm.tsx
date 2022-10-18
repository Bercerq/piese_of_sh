import React, { useState, Fragment, useEffect, useRef } from "react";
import { Form } from "react-bootstrap";
import * as _ from "lodash";
import * as Validation from "../../../../client/Validation";
import { ValidationError } from "../../../../client/schemas";
import { AdFormProps } from "./AdForm";
import Checkbox from "../../../UI/Checkbox";
import { Ad } from "../../../../models/data/Ads";

const ThirdPartyForm = (props: AdFormProps) => {
  const id = _.get(props, "ad.id", -1);
  const [name, setName] = useState<string>("");
  const [nameValidation, setNameValidation] = useState<ValidationError>({ error: false, message: "" });
  const [submissionType, setSubmissionType] = useState<(0 | 1)>(1);
  const [approveChecked, setApproveChecked] = useState<boolean>(true);
  const [clickUrl, setClickUrl] = useState<string>("");
  const [clickUrlValidation, setClickUrlValidation] = useState<ValidationError>({ error: false, message: "" });
  const [tag, setTag] = useState<string>("");
  const [tagValidation, setTagValidation] = useState<ValidationError>({ error: false, message: "" });
  const [width, setWidth] = useState<string>("");
  const [widthValidation, setWidthValidation] = useState<ValidationError>({ error: false, message: "" });
  const [height, setHeight] = useState<string>("");
  const [heightValidation, setHeightValidation] = useState<ValidationError>({ error: false, message: "" });

  useEffect(loadData, [props.ad]);
  useEffect(submitForm, [props.submit]);

  function loadData() {
    if (props.ad) {
      const name = _.get(props, "ad.name", "");
      const clickUrl = _.get(props, "ad.clickUrl", "");
      const tag = _.get(props, "ad.tag", "");
      const width = _.get(props, "ad.width", "");
      const height = _.get(props, "ad.height", "");
      setName(name);
      setClickUrl(clickUrl);
      setTag(tag);
      setWidth(width);
      setHeight(height);
      setNameValidation({ error: false, message: "" });
      setClickUrlValidation({ error: false, message: "" });
      setTagValidation({ error: false, message: "" });
      setWidthValidation({ error: false, message: "" });
      setHeightValidation({ error: false, message: "" });
    }
  }

  function submitForm() {
    if (props.submit) {
      if (id > 0) {
        if (nameValidation.error || clickUrlValidation.error) {
          props.onSubmit(true, null);
        } else {
          props.onSubmit(false, { name, clickUrl });
        }
      } else {
        const nameValidation = Validation.required(name);
        const clickUrlValidation = Validation.url(clickUrl, false);
        const tagValidation = Validation.required(tag);
        const widthInput: HTMLInputElement = document.getElementById("thirdparty-width") as HTMLInputElement;
        widthInput.value = width;
        const widthValidation = Validation.native(widthInput);

        const heightInput: HTMLInputElement = document.getElementById("thirdparty-height") as HTMLInputElement;
        heightInput.value = height;
        const heightValidation = Validation.native(heightInput);
        const approved = approveChecked ? 0 : -2;

        setNameValidation(nameValidation);
        setClickUrlValidation(clickUrlValidation);
        setTagValidation(tagValidation);
        setWidthValidation(widthValidation);
        setHeightValidation(heightValidation);

        if (nameValidation.error || clickUrlValidation.error || tagValidation.error || widthValidation.error || heightValidation.error) {
          props.onCreate(true, []);
        } else {
          const ad: Partial<Ad> = {
            name,
            submissionType,
            approved,
            clickUrl,
            tag,
            width: parseInt(width, 10),
            height: parseInt(height, 10),
            active: 1,
            type: 4,
            local: false,
            tag_type: 1 //set default standard type
          };
          props.onCreate(false, [ad]);
        }
      }
    }
  }

  const handleNameChange = (e) => {
    const name = e.target.value;
    const nameValidation = Validation.required(name);
    setName(name);
    setNameValidation(nameValidation);
  }

  const handleTagChange = (e) => {
    const tag = e.target.value;
    const tagValidation = Validation.required(tag);
    setTag(tag);
    setTagValidation(tagValidation);

    const width: string = getDimensionFromTag(tag, "width");
    const height: string = getDimensionFromTag(tag, "height");

    const widthInput: HTMLInputElement = document.getElementById("thirdparty-width") as HTMLInputElement;
    widthInput.value = width;
    const widthValidation = Validation.native(widthInput);
    setWidth(width);
    setWidthValidation(widthValidation);

    const heightInput: HTMLInputElement = document.getElementById("thirdparty-height") as HTMLInputElement;
    heightInput.value = height;
    const heightValidation = Validation.native(heightInput);
    setHeight(height);
    setHeightValidation(heightValidation);
    if (tag !== "") {
      props.onPreviewChange(_.assign({}, props.ad, { previewTag: null, tag, width: parseInt(width, 10), height: parseInt(height, 10) }));
    }
  }

  function getDimensionFromTag(tag: string, dim: "width" | "height"): string {
    const regex = dim === "width" ? /\bwidth=["']?([0-9]+)["']?/i : /\height=["']?([0-9]+)["']?/i
    const arr = tag.match(regex);
    return arr && arr.length > 1 ? arr[1] : "";
  }

  const handleWidthChange = (e) => {
    const width = e.target.value;
    const widthValidation = Validation.native(e.target);
    setWidth(width);
    setWidthValidation(widthValidation);
  }

  const handleHeightChange = (e) => {
    const height = e.target.value;
    const heightValidation = Validation.native(e.target);
    setHeight(height);
    setHeightValidation(heightValidation);
  }

  const handleSubmissionChange = (e) => {
    if (e.target.checked) {
      const submissionType = e.target.value === "0" ? 0 : 1;
      setSubmissionType(submissionType);
    }
  }

  const handleApprovedChange = (checked: boolean) => {
    setApproveChecked(checked);
  }

  const handleClickUrlChange = (e) => {
    const clickUrl = e.target.value;
    const clickUrlValidation = Validation.url(clickUrl, false);
    setClickUrl(clickUrl);
    setClickUrlValidation(clickUrlValidation);
  }

  return <Fragment>
    <Form.Group controlId="thirdparty-name">
      <Form.Label>Name *</Form.Label>
      <Form.Control
        autoFocus
        type="text"
        value={name}
        isInvalid={nameValidation.error}
        onChange={handleNameChange}
      />
      {nameValidation.error && <Form.Control.Feedback type="invalid">{nameValidation.message}</Form.Control.Feedback>}
    </Form.Group>
    {id < 0 &&
      <Form.Group>
        <Checkbox id="thirdparty-approved" checked={approveChecked} onChange={handleApprovedChange}>Request approval immediately</Checkbox>
      </Form.Group>
    }
    <Form.Group controlId="thirdparty-clickurl">
      <Form.Label>Landing page</Form.Label>
      <Form.Control
        type="text"
        value={clickUrl}
        isInvalid={clickUrlValidation.error}
        onChange={handleClickUrlChange}
      />
      {clickUrlValidation.error && <Form.Control.Feedback type="invalid">{clickUrlValidation.message}</Form.Control.Feedback>}
    </Form.Group>
    <Form.Group controlId="thirdparty-tag">
      <Form.Label>Tag *</Form.Label>
      <Form.Control as="textarea"
        disabled={id > 0}
        type="text"
        value={tag}
        rows={6}
        isInvalid={tagValidation.error}
        onChange={handleTagChange}
      />
      {tagValidation.error && <Form.Control.Feedback type="invalid">{tagValidation.message}</Form.Control.Feedback>}
    </Form.Group>
    <Form.Group controlId="thirdparty-width">
      <Form.Label>Width *</Form.Label>
      <Form.Control
        disabled={id > 0}
        required
        type="number"
        min="0"
        value={width}
        isInvalid={widthValidation.error}
        onChange={handleWidthChange}
      />
      {widthValidation.error && <Form.Control.Feedback type="invalid">{widthValidation.message}</Form.Control.Feedback>}
    </Form.Group>
    <Form.Group controlId="thirdparty-height">
      <Form.Label>Height *</Form.Label>
      <Form.Control
        disabled={id > 0}
        required
        type="number"
        min="0"
        value={height}
        isInvalid={heightValidation.error}
        onChange={handleHeightChange}
      />
      {heightValidation.error && <Form.Control.Feedback type="invalid">{heightValidation.message}</Form.Control.Feedback>}
    </Form.Group>
  </Fragment>;
}
export default ThirdPartyForm;