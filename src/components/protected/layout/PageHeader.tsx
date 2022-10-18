import React, { FunctionComponent, ReactNode } from "react";

const PageHeader: FunctionComponent<ReactNode> = (props) => {
  return <div className="row page-header">
    {props.children}
  </div>;
}

export default PageHeader;