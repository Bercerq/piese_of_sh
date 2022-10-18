import * as React from "react";

const FontIcon = (props: { name?: string; names?: string[] }) => {
  if (props.name) {
    return <i className={`fa fa-${props.name}`} aria-hidden="true"></i>;
  } else if (props.names) {
    const classNames = props.names.map((name) => { return `fa-${name}` }).join(" ");
    return <i className={`fa ${classNames}`} aria-hidden="true"></i>
  }
  return null;
}

export default FontIcon;