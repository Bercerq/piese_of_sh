import React, { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";
import { Button } from "react-bootstrap";
import * as _ from "lodash";
import * as Api from "../../../../../../client/Api";
import { SegmentsBoxFormData, SegmentsBoxProps } from "../../../../../../client/campaignSchemas";
import FontIcon from "../../../../../UI/FontIcon";
import SettingsBox from "../shared/SettingsBox";
import { Segment } from "../../../../../../models/data/Segment";
import Loader from "../../../../../UI/Loader";
import SegmentRulesTable from "./SegmentRulesTable";
import { SegmentRule } from "../../../../../../models/data/Campaign";
import SegmentRuleModal from "./SegmentRuleModal";
import { DATargeting } from "../../../../../../models/data/Attribute";
import AudienceSegmentsTable from "./AudienceSegmentsTable";
import AudienceSegmentsModal from "./AudienceSegmentsModal";

const SegmentsBox = (props: SegmentsBoxProps) => {
  let history = useHistory();
  const [showSegmentModal, setShowSegmentModal] = useState<boolean>(false);
  const [advertiserSegments, setAdvertiserSegments] = useState<Segment[]>([]);
  const [daTargeting, setDaTargeting] = useState<DATargeting>(null);
  const [segmentRules, setSegmentRules] = useState<SegmentRule[]>(props.segmentRules);
  const [digitalAudienceValues, setDigitalAudienceValues] = useState<string[]>(_.get(props, "digitalAudience.values", []));
  const [editSegment, setEditSegment] = useState<SegmentRule>(null);
  const [editIndex, setEditIndex] = useState<number>(-1);
  const [showAudienceSegmentsModal, setShowAudienceSegmentsModal] = useState<boolean>(false);
  const [showSegmentRulesLoader, setShowSegmentRulesLoader] = useState<boolean>(true);

  const submitData = getSubmitData();

  useEffect(() => { loadForm(); }, [props.id]);

  useEffect(() => { props.onChange(submitData); }, [JSON.stringify(submitData)]);

  useEffect(() => { setShowSegmentRulesLoader(false); }, [JSON.stringify(segmentRules)]);

  async function loadForm() {
    const advertiserSegments: Segment[] = await Api.Get({ path: "/api/segments", qs: { advertiserId: props.advertiserId } });
    const daTargeting: DATargeting = await Api.Get({ path: "/api/attributes/da-targeting" });
    setAdvertiserSegments(advertiserSegments);
    setDaTargeting(daTargeting);
    setSegmentRules(props.segmentRules);
    setDigitalAudienceValues(_.get(props, "digitalAudience.values", []));
  }

  function getSubmitData(): SegmentsBoxFormData {
    return {
      segmentRules,
      digitalAudience: digitalAudienceValues
    }
  }

  const createSegmentClick = () => {
    history.push(`/segments/advertiser/${props.advertiserId}`);
  }

  const editClick = (i: number) => {
    setEditSegment(segmentRules[i]);
    setEditIndex(i);
    setShowSegmentModal(true);
  }

  const addRuleClick = () => {
    setShowSegmentModal(true);
    setEditSegment(null);
    setEditIndex(-1);
  }

  const deleteRuleClick = (i: number) => {
    setShowSegmentRulesLoader(true);
    const updatedRules = _.cloneDeep(segmentRules);
    updatedRules.splice(i, 1);
    setSegmentRules(updatedRules);
  }

  const segmentModalClose = () => {
    setShowSegmentModal(false);
    setEditSegment(null);
    setEditIndex(-1);
  }

  const segmentSubmit = (i: number, segmentRule: SegmentRule) => {
    let updatedRules = _.cloneDeep(segmentRules);
    if (i > -1) {
      if (JSON.stringify(updatedRules[i]) !== JSON.stringify(segmentRule)) {
        setShowSegmentRulesLoader(true);
        updatedRules[i] = segmentRule;
      }
    } else {
      setShowSegmentRulesLoader(true);
      updatedRules.push(segmentRule);
    }
    setSegmentRules(updatedRules);
    setShowSegmentModal(false);
    setEditSegment(null);
    setEditIndex(-1);
  }

  const audienceSegmentsSubmit = (values: string[]) => {
    setDigitalAudienceValues(values);
    setShowAudienceSegmentsModal(false);
  }

  const writeAccess = props.rights.MANAGE_CAMPAIGN && props.rights.MANAGE_SEGMENTS;

  return <SettingsBox>
    <div className="row no-gutters">
      <div className="col-lg-12 px-1">
        <h5 className="pull-left">Advertiser segments</h5>
        <div className="table-btn-container">
          <Button size="sm" variant="primary" disabled={!writeAccess} className="mr-2" onClick={addRuleClick}><FontIcon name="plus" /> ADD RULE</Button>
          {props.rights.MANAGE_SEGMENTS &&
            <button className="btn btn-linkbutton btn-sm mr-2" onClick={createSegmentClick}><FontIcon name="plus" /> CREATE NEW SEGMENT</button>}
        </div>
        <Loader visible={showSegmentRulesLoader} />
        {!showSegmentRulesLoader &&
          <SegmentRulesTable
            writeAccess={writeAccess}
            records={segmentRules}
            segments={advertiserSegments}
            deleteClick={deleteRuleClick}
            editClick={editClick}
          />
        }
        <SegmentRuleModal
          show={showSegmentModal}
          index={editIndex}
          segmentRule={editSegment}
          writeAccess={writeAccess}
          maxBidPrice={props.maxBidPrice}
          segments={advertiserSegments}
          onClose={segmentModalClose}
          onSubmit={segmentSubmit}
        />
      </div>
      <div className="col-lg-12 px-1 pt-2">
        <h5 className="pull-left">Audience segments</h5>
        <div className="table-btn-container">
          <Button size="sm" variant="primary" disabled={!writeAccess} className="mr-2" onClick={() => { setShowAudienceSegmentsModal(true) }}><FontIcon name="plus" /> UPDATE RULES</Button>
        </div>
        <AudienceSegmentsTable
          digitalAudienceValues={digitalAudienceValues}
          daTargeting={daTargeting}
        />
        <AudienceSegmentsModal
          show={showAudienceSegmentsModal}
          digitalAudienceValues={digitalAudienceValues}
          daTargeting={daTargeting}
          onClose={() => { setShowAudienceSegmentsModal(false); }}
          onSubmit={audienceSegmentsSubmit}
        />
      </div>
    </div>

  </SettingsBox>;
}
export default SegmentsBox;