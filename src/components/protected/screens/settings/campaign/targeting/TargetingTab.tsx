import React, { useEffect, useState } from "react";
import * as _ from "lodash";
import * as TargetingHelper from "./TargetingHelper";
import { BrowserBoxFormData, GeoTargetingBoxFormData, LanguageBoxFormData, OSBoxFormData, PositionBoxFormData, TargetingTabFormData, TargetingTabProps, VideoTargetingBoxFormData } from "../../../../../../client/campaignSchemas";
import PositionBox from "./PositionBox";
import VideoTargetingBox from "./VideoTargetingBox";
import GeoTargetingBox from "./GeoTargetingBox";
import BrowserBox from "./BrowserBox";
import OSBox from "./OSBox";
import LanguageBox from "./LanguageBox";

const TargetingTab = (props: TargetingTabProps) => {
  const videoCampaign = _.get(props.data, "campaign.videoCampaign");

  const [positionBox, setPositionBox] = useState<PositionBoxFormData>(null);
  const [videoTargetingBox, setVideoTargetingBox] = useState<VideoTargetingBoxFormData>(null);
  const [geoTargetingBox, setGeoTargetingBox] = useState<GeoTargetingBoxFormData>(null);
  const [browserBox, setBrowserBox] = useState<BrowserBoxFormData>(null);
  const [osBox, setOsBox] = useState<OSBoxFormData>(null);
  const [languageBox, setLanguageBox] = useState<LanguageBoxFormData>(null);
  const [isGeoTargetingBoxValid, setIsGeoTargetingBoxValid] = useState<boolean>(true);

  const submitData = getSubmitData();
  const isValid = getIsValid();

  useEffect(() => {
    const initialSubmitData = getInitialSubmitData();
    if (JSON.stringify(submitData) !== initialSubmitData) {
      props.onChange(submitData);
    }
  }, [JSON.stringify(submitData)]);
  useEffect(() => { props.onValidate(isValid); }, [isValid]);

  function getSubmitData(): TargetingTabFormData {
    return {
      positionBox,
      videoTargetingBox,
      geoTargetingBox,
      browserBox,
      osBox,
      languageBox
    }
  }

  function getIsValid() {
    return isGeoTargetingBoxValid;
  }

  function getInitialSubmitData() {
    return JSON.stringify({ positionBox: null, videoTargetingBox: null, geoTargetingBox: null, browserBox: null, osBox: null, languageBox: null });
  }

  const positionBoxChange = (positionBoxData: PositionBoxFormData) => {
    setPositionBox(positionBoxData);
  }

  const videoTargetingBoxChange = (videoTargetingBoxData: VideoTargetingBoxFormData) => {
    setVideoTargetingBox(videoTargetingBoxData);
  }

  const geoTargetingBoxChange = (geoTargetingBoxData: GeoTargetingBoxFormData, isValid: boolean) => {
    setGeoTargetingBox(geoTargetingBoxData);
    setIsGeoTargetingBoxValid(isValid);
  }

  const browserBoxChange = (browserBoxData: BrowserBoxFormData) => {
    setBrowserBox(browserBoxData);
  }

  const OSBoxChange = (osBoxData: OSBoxFormData) => {
    setOsBox(osBoxData);
  }

  const languageBoxChange = (languageBoxData: LanguageBoxFormData) => {
    setLanguageBox(languageBoxData);
  }

  const positionBoxProps = TargetingHelper.getPositionBoxProps(props.data, props.rights, positionBoxChange);
  const videoTargetingBoxProps = TargetingHelper.getVideoTargetingBoxProps(props.data, props.rights, videoTargetingBoxChange);
  const geoTargetingBoxProps = TargetingHelper.getGeoTargetingBoxProps(props.data, props.rights, geoTargetingBoxChange);
  const browserBoxProps = TargetingHelper.getBrowserBoxProps(props.data, props.rights, browserBoxChange);
  const osBoxProps = TargetingHelper.getOSBoxProps(props.data, props.rights, OSBoxChange);
  const languageBoxProps = TargetingHelper.getLanguageBoxProps(props.data, props.rights, languageBoxChange);

  return <div className="row no-gutters">
    <div className="col-lg-6">
      <PositionBox {...positionBoxProps} />
      {videoCampaign && <VideoTargetingBox {...videoTargetingBoxProps} />}
      <GeoTargetingBox {...geoTargetingBoxProps} />
    </div>
    <div className="col-lg-6">
      <BrowserBox {...browserBoxProps} />
      <OSBox {...osBoxProps} />
      <LanguageBox {...languageBoxProps} />
    </div>
  </div>
}
export default TargetingTab;