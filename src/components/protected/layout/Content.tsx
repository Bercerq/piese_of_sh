import React, { FunctionComponent } from "react";

interface ContentProps {
  open: boolean;
}

const Content: FunctionComponent<ContentProps> = (props) => {
  const openClass = props.open ? '' : ' mini';
  return <div className={"content" + openClass}>
    <div className="container-fluid">
      {props.children}
    </div>
  </div>;
}

export default Content;