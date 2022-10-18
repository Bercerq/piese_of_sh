import React, { Component } from "react";
import { Modal, Button, Form, InputGroup } from "react-bootstrap";
import Datetime from "react-datetime";
import momentPropTypes from "react-moment-proptypes";
import moment from "moment";
import FontIcon from "../../../../UI/FontIcon";

interface CampaignsArchiveModalProps {
  show: boolean;
  onClose: () => void;
  onSubmit: (date: string) => void;
}

interface CampaignsArchiveModalState {
  date: momentPropTypes.momentObj | null;
}

export default class CampaignsArchiveModal extends Component<CampaignsArchiveModalProps, CampaignsArchiveModalState> {
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
    this.props.onSubmit(this.state.date.format("YYYY-MM-DD"));
  }

  isValidDate = (current) => {
    return moment(current).isSameOrBefore();
  }

  render() {
    return <Modal show={this.props.show} onHide={this.props.onClose} onEntering={this.handleEntering} backdrop="static">
      <Modal.Header closeButton>
        <Modal.Title>Archive campaigns</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="row">
          <div className="col-sm-12">
            <Form.Label>Archive campaigns that ended before</Form.Label>
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
        <Button size="sm" variant="light" onClick={this.props.onClose}>CANCEL</Button>
        <Button size="sm" variant="primary" onClick={this.handleSubmit}>ARCHIVE</Button>
      </Modal.Footer>
    </Modal>
  }
}