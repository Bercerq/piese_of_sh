import React, { useState, useEffect } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import Select from "react-select";
import CreatableSelect from "react-select/creatable";
import * as _ from "lodash";
import * as Helper from "../../../../client/Helper";
import * as Validation from "../../../../client/Validation";
import { ValidationError, SelectOption, ScopeType } from "../../../../client/schemas";
import { UserInvite, Level, Role } from "../../../../models/data/User";
import { Rights, ScopeData } from "../../../../models/Common";
import { Publisher } from "../../../../models/data/Publisher";

interface UserModalProps {
  show: boolean;
  userEmails: string[];
  data: ScopeData;
  rights: Rights;
  scope: ScopeType;
  scopeId: number;
  maxLevel: ScopeType;
  onClose: () => void;
  onSubmit: (userRole: UserInvite) => void;
}

const UserModal = (props: UserModalProps) => {
  const levelOptions = Helper.getLevelOptions(props.maxLevel);
  const [email, setEmail] = useState<string>("");
  const [level, setLevel] = useState<Level>(props.scope as Level);
  const [role, setRole] = useState<Role>("admin");
  const [entityOptions, setEntityOptions] = useState<SelectOption[]>([{ value: -1, label: "" }]);
  const [entityId, setEntityId] = useState<number>(-1);
  const [emailValidation, setEmailValidation] = useState<ValidationError>({ error: false, message: "" });

  const handleEntering = async () => {
    const level = props.scope as Level;
    const entityOptions = await getEntityOptions(level);
    const entityId = entityOptions.length > 0 ? parseInt(entityOptions[0].value as string, 10) : -1;
    setEntityOptions(entityOptions);
    setEntityId(entityId);
    setLevel(level);
  }

  function getRoleOptions(level: Level): SelectOption[] {
    if (level === "root" || level === "publisher") {
      return [
        { value: "admin", label: "admin" }
      ];
    } else {
      return [
        { value: "admin", label: "admin" },
        { value: "campaignmanager", label: "campaign manager" },
        { value: "campaignoptimizer", label: "campaign optimizer" },
        { value: "aduploader", label: "ad uploader" },
        { value: "tagmanager", label: "tag manager" },
        { value: "guest", label: "guest" }
      ];
    }
  }

  async function getEntityOptions(level: Level): Promise<SelectOption[]> {
    if (level === "root") {
      return [];
    } else if (level === "publisher") {
      return [{ value: (props.data as Publisher).publisher.id, label: (props.data as Publisher).publisher.settings.name }];
    } else {
      return await Helper.getEntityOptions("users", props.scope, props.scopeId, level);
    }
  }

  const handleSubmit = () => {
    const emailValidation = Validation.email(email.trim());
    if (!emailValidation.error) {
      let userRole: UserInvite = {
        email,
        role: { level, role }
      };
      if (level !== "root") {
        userRole.role.entityId = entityId;
      }
      props.onSubmit(userRole);
    } else {
      setEmailValidation(emailValidation);
    }
  }

  const handleClose = () => {
    setEmail("");
    setLevel(props.scope as Level);
    setRole("admin");
    setEntityOptions([{ value: -1, label: "" }]);
    setEntityId(-1);
    setEmailValidation({ error: false, message: "" });
    props.onClose();
  }

  const handleEmailChange = (newValue: SelectOption, actionMeta: any) => {
    const email = _.get(newValue, "value", "");
    const emailValidation = Validation.email(email);
    setEmail(email);
    setEmailValidation(emailValidation);
  }

  const handleLevelChange = async (selected) => {
    if (selected.value === "root") {
      setLevel(selected.value as Level);
      setRole("admin");
    } else {
      const entityOptions = await getEntityOptions(selected.value as Level);
      const entityId = entityOptions.length > 0 ? parseInt(entityOptions[0].value as string, 10) : -1;
      setLevel(selected.value as Level);
      setEntityOptions(entityOptions);
      setEntityId(entityId);
    }
  }

  const handleRoleChange = (selected) => {
    setRole(selected.value as Role);
  }

  const handleEntityChange = (selected) => {
    setEntityId(parseInt(selected.value, 10));
  }

  const emailOptions: SelectOption[] = props.userEmails.map((email) => { return { value: email, label: email } });
  const roleOptions: SelectOption[] = getRoleOptions(level);
  return <Modal show={props.show} onHide={handleClose} backdrop="static" onEntering={handleEntering}>
    <Modal.Header closeButton>
      <Modal.Title>Invite user</Modal.Title>
    </Modal.Header>
    <Modal.Body>
      <div className="row">
        <div className="col-sm-12">
          <Form.Group controlId="user-email">
            <Form.Label>Search for an email or add a new one:</Form.Label>
            <CreatableSelect
              className="react-select-container"
              classNamePrefix="react-select"
              isClearable
              onChange={handleEmailChange}
              options={emailOptions}
            />
            {emailValidation.error && <Form.Control.Feedback style={{ display: "block" }} type="invalid">{emailValidation.message}</Form.Control.Feedback>}
          </Form.Group>
          <Form.Group controlId="user-role">
            <Form.Label>Role:</Form.Label>
            <Select
              inputId="react-select-user-role"
              className="react-select-container"
              classNamePrefix="react-select"
              clearable={false}
              value={roleOptions.find((o) => { return o.value === role })}
              onChange={handleRoleChange}
              options={roleOptions}
            />
          </Form.Group>
          <Form.Group controlId="user-level">
            <Form.Label>Level:</Form.Label>
            <Select
              inputId="react-select-user-level"
              className="react-select-container"
              classNamePrefix="react-select"
              clearable={false}
              value={levelOptions.find((o) => { return o.value === level })}
              onChange={handleLevelChange}
              options={levelOptions}
            />
          </Form.Group>
          {level !== "root" &&
            <Form.Group controlId="user-entity">
              <Form.Label>{Helper.getLabelByScopeType(level)}:</Form.Label>
              <Select
                inputId="react-select-user-entity"
                className="react-select-container"
                classNamePrefix="react-select"
                value={entityOptions.find((o) => { return o.value === entityId })}
                clearable={false}
                onChange={handleEntityChange}
                options={entityOptions}
              />
            </Form.Group>
          }
        </div>
      </div>
    </Modal.Body>
    <Modal.Footer>
      <Button size="sm" variant="light" onClick={handleClose}>CANCEL</Button>
      <Button size="sm" variant="primary" onClick={handleSubmit}>SAVE</Button>
    </Modal.Footer>
  </Modal>;
}
export default UserModal;