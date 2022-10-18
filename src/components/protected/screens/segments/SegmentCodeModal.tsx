import React, { Component } from "react";
import { findDOMNode } from "react-dom";
import { Modal, Button, Form, Overlay, Tooltip } from "react-bootstrap";
import { CopyToClipboard } from "react-copy-to-clipboard/lib";
import * as _ from "lodash";
import FontIcon from "../../../UI/FontIcon";

interface SegmentCodeModalProps {
  id: number;
  advertiserId: number;
  show: boolean;
  handleClose: () => void;
}

interface SegmentCodeModalState {
  imgCopied: boolean;
  jsCopied: boolean;
  time: number;
}

export default class SegmentCodeModal extends Component<SegmentCodeModalProps, SegmentCodeModalState> {
  private imgCopyBtn;
  private jsCopyBtn;

  constructor(props, context) {
    super(props, context);
    this.imgCopyBtn = null;
    this.jsCopyBtn = null;

    this.state = {
      time: 0,
      imgCopied: false,
      jsCopied: false
    }
  }

  handleEntering = () => {
    const time = Math.floor(Math.random() * 1000000);
    this.setState({ time });
  }

  handleImgCopy = () => {
    this.setState({ imgCopied: true }, () => {
      setTimeout(() => { this.setState({ imgCopied: false }) }, 2000);
    })
  }

  handleJsCopy = () => {
    this.setState({ jsCopied: true }, () => {
      setTimeout(() => { this.setState({ jsCopied: false }) }, 2000);
    })
  }

  getSrc(): string {
    return `https://segments.optinadserving.com/cgi-bin/sgmnt.fcgi?advertiser_id=${this.props.advertiserId}&consent=LI&segment_ids=${this.props.id}`;
  }

  getImgCode(src: string): string {
    return `<img width="0" height="0" src="${src}" />`;
  }

  getJsCode(src: string): string {
    return `<script>var image = new Image();image.src="${src}&adsciencetime=${this.state.time}"</script>`;
  }

  getClassNames(copied: boolean) {
    return copied ? "gray-box mb-2 highlight-box" : "gray-box mb-2";
  }

  render() {
    const src = this.getSrc();
    const imgCode = this.getImgCode(src);
    const jsCode = this.getJsCode(src);
    const imgClassNames = this.getClassNames(this.state.imgCopied);
    const jsClassNames = this.getClassNames(this.state.jsCopied);

    return <Modal size="lg" onEntering={this.handleEntering} show={this.props.show} onHide={this.props.handleClose} backdrop="static">
      <Modal.Header closeButton>
        <Modal.Title>Get individual segment code</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="row">
          <div className="col-sm-12">
            <Form.Group className="clearfix">
              <Form.Label>Image pixel</Form.Label>
              <div className={imgClassNames}>{imgCode}</div>
              <CopyToClipboard text={imgCode} onCopy={this.handleImgCopy}>
                <button ref={(button) => { this.imgCopyBtn = button; }} className="btn btn-primary btn-sm pull-right"><FontIcon name="files-o" /> GET CODE</button>
              </CopyToClipboard>
              <Overlay target={findDOMNode(this.imgCopyBtn) as any} show={this.state.imgCopied} placement="bottom">
                <Tooltip id="copy-image-tooltip">Copied!</Tooltip>
              </Overlay>
            </Form.Group>
            <Form.Group>
              <Form.Label>Javascript pixel</Form.Label>
              <div className={jsClassNames}>{jsCode}</div>
              <CopyToClipboard text={jsCode} onCopy={this.handleJsCopy}>
                <button ref={(button) => { this.jsCopyBtn = button; }} className="btn btn-primary btn-sm pull-right"><FontIcon name="files-o" /> GET CODE</button>
              </CopyToClipboard>
              <Overlay target={findDOMNode(this.jsCopyBtn) as any} show={this.state.jsCopied} placement="bottom">
                <Tooltip id="copy-js-tooltip">Copied!</Tooltip>
              </Overlay>
            </Form.Group>
          </div>
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button size="sm" variant="light" onClick={this.props.handleClose}>CANCEL</Button>
      </Modal.Footer>
    </Modal>;
  }
}