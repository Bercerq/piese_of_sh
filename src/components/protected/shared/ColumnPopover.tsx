import React from "react";
import { Popover, OverlayTrigger } from "react-bootstrap";

const ColumnPopover = (props: { id: string; cellContent: string; }) => {
  const popoverHover = (
    <Popover id={props.id}>
      <Popover.Content>
        {props.cellContent}
      </Popover.Content>
    </Popover>
  );

  return <OverlayTrigger trigger="hover" placement="top" overlay={popoverHover}>
    <span className="text-ellipsis">{props.cellContent}</span>
  </OverlayTrigger>;
}

export default ColumnPopover;