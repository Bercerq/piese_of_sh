import React, { FunctionComponent, ReactNode, Fragment } from "react";
import AdBlockAlert from "../shared/AdBlockAlert";

const PublicFormWrapper: FunctionComponent<ReactNode> = (props) => {
  return <Fragment>
    <div className="login-form-container">
      <div className="login-form">
        <div className="ortec-logo"></div>
        {props.children}
      </div>
      <div>
        
        <div className="ortec-adscience-logo"></div>
      </div>
    </div>
    <AdBlockAlert />
  </Fragment>;
}

export default PublicFormWrapper;