import React, { Component } from "react";
import { Modal, Button, Form, InputGroup } from "react-bootstrap";
import Datetime from "react-datetime";
import momentPropTypes from "react-moment-proptypes";
import moment from "moment";
import FontIcon from "../../../../UI/FontIcon";

interface CampaignGroupsArchiveModalProps {
  show: boolean;
  handleClose: () => void;
  handleSubmit: (date: string) => void;
}

interface CampaignGroupsArchiveModalState {
  date: momentPropTypes.momentObj | null;
}

export default class CampaignGroupsArchiveModal extends Component<CampaignGroupsArchiveModalProps, CampaignGroupsArchiveModalState> {
  constructor(props, context) {
    super(props, context);
    this.state = {
      date: moment()
    }
  }

  handleEntering = () => {
    this.setState({ date: moment() });
  }

  handleDateChange = (date) => {
    this.setState({ date });
  }

  handleSubmit = () => {
    this.props.handleSubmit(this.state.date.format("YYYY-MM-DD"));
  }

  isValidDate = (current) => {
    return moment(current).isSameOrBefore();
  }

  render() {
    return <Modal show={this.props.show} onHide={this.props.handleClose} onEntering={this.handleEntering} backdrop="static">
      <Modal.Header closeButton>
        <Modal.Title>Archive campaign groups</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="row">
          <div className="col-sm-12">
            <Form.Label>Archive campaign groups that ended before</Form.Label>
            <InputGroup>
              <InputGroup.Prepend>
                <InputGroup.Text><FontIcon name="calendar" /></InputGroup.Text>
              </InputGroup.Prepend>
              <Datetime
                dateFormat="YYYY-MM-DD"
                timeFormat={false}
                onChange={this.handleDateChange}
                value={this.state.date}
                isValidDate={this.isValidDate}
              />
            </InputGroup>
          </div>
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button size="sm" variant="light" onClick={this.props.handleClose}>CANCEL</Button>
        <Button size="sm" variant="primary" onClick={this.handleSubmit}>ARCHIVE</Button>
      </Modal.Footer>
    </Modal>
  }
}