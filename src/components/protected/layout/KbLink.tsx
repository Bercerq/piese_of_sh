import * as React from "react";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import FontIcon from "../../UI/FontIcon";

const KbLink = () => {
  return <OverlayTrigger placement="bottom" overlay={<Tooltip id={`tooltip-kb`}>Knowledge base</Tooltip>}>
    <a className="kb-link" href="/kb" target="_blank"><FontIcon name="book" /></a>
  </OverlayTrigger>;
}

export default KbLink;