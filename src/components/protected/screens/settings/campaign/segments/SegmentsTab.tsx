import React, { useEffect, useState } from "react";
import * as _ from "lodash";
import * as SegmentsHelper from "./SegmentsHelper";
import { SegmentsBoxFormData, SegmentsTabFormData, SegmentsTabProps } from "../../../../../../client/campaignSchemas";
import SegmentsBox from "./SegmentsBox";

const SegmentsTab = (props: SegmentsTabProps) => {
  const [segmentsBox, setSegmentsBox] = useState<SegmentsBoxFormData>(null);

  const submitData = getSubmitData();

  useEffect(() => {
    const initialSubmitData = getInitialSubmitData();
    if (JSON.stringify(submitData) !== initialSubmitData) {
      props.onChange(submitData);
    }
  }, [JSON.stringify(submitData)]);

  function getSubmitData(): SegmentsTabFormData {
    return {
      segmentsBox
    }
  }

  function getInitialSubmitData() {
    return JSON.stringify({ segmentsBox: null });
  }

  const segmentsBoxChange = (segmentsBoxData: SegmentsBoxFormData) => {
    setSegmentsBox(segmentsBoxData);
  }

  const segmentsBoxProps = SegmentsHelper.getSegmentsBoxProps(props.data, props.maxBidPrice, props.rights, segmentsBoxChange);

  return <div className="row no-gutters">
    <div className="col-lg-12">
      <SegmentsBox {...segmentsBoxProps} />
    </div>
  </div>
}
export default SegmentsTab;