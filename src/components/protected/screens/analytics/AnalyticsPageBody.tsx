import React from "react";
import { useParams } from "react-router-dom";
import AnalyticsPublisher from "./AnalyticsPublisher";
import Analytics from "./Analytics";

const AnalyticsPageBody = (props: { videoMode: boolean }) => {
  let { scope }: any = useParams();

  if (scope === "publisher") {
    return <AnalyticsPublisher {...props} />
  } else {
    return <Analytics {...props} />
  }
}
export default AnalyticsPageBody;