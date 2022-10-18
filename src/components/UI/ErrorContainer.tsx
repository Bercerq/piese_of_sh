import * as React from "react";

interface ErrorContainerProps {
  message: string;
}

const ErrorContainer = (props: ErrorContainerProps) => {
  return <h2 className="text-danger pt-4">{props.message}</h2>
}

export default ErrorContainer;