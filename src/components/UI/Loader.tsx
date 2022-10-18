import * as React from "react";

const Loader = (props: { visible: boolean; loaderClass?: string }) => {
  if (props.visible) {
    return <div className={props.loaderClass || "loading"}></div>;
  }
  return null;
}
export default Loader;