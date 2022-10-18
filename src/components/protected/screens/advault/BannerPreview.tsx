import React, { useState, useEffect, useContext } from "react";
import { Button } from "react-bootstrap";
import moment from "moment";
import * as AdsHelper from "../../../../client/AdsHelper";
import { Ad } from "../../../../models/data/Ads";
import FontIcon from "../../../UI/FontIcon";
import * as Api from "../../../../client/Api";
import { Variables } from "../../../../models/Common";
import VariablesContext from "../../context/VariablesContext";

declare var $: any;

interface BannerPreviewProps {
  id: string;
  ad: Partial<Ad>;
}

const BannerPreview = (props: BannerPreviewProps) => {
  const variables = useContext<Variables>(VariablesContext);
  const [src, setSrc] = useState<string>("");
  const [error, setError] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>("");

  useEffect(() => {
    loadPreview();
    return unloadPreview;
  }, [props.ad]);

  async function loadPreview() {
    await bannerPreview();
    window.addEventListener("resize", resizeHandler);
  }

  function unloadPreview() {
    return window.removeEventListener("resize", resizeHandler);
  }

  function resizeHandler() {
    const width = props.ad.width;
    const height = props.ad.height;
    const $iframe = $("#" + props.id);

    resizePreview($iframe, width, height);
  }

  async function bannerPreview(): Promise<void> {
    if (props.ad) {
      const tag = props.ad.previewTag || props.ad.tag || "";
      if (tag) {
        if (props.ad.local) {
          await localBannerPreview(tag);
        } else {
          await setIframeSrc(tag);
        }
      } else if (props.ad.preview) {
        setSrc(props.ad.preview);
        setError(false);
      }

      const width = props.ad.width;
      const height = props.ad.height;
      const $iframe = $("#" + props.id);

      resizePreview($iframe, width, height);
    }
  }

  async function localBannerPreview(tag) {
    const id = props.ad.bannerId || props.ad.id;
    const tagIframeSrc = $(tag).attr("src");

    try {
      // first check if tag iframe src returns not found
      const tagIframeRes = await Api.Post({ path: "/api/ads/file-exists", body: { url: tagIframeSrc } });
      if (tagIframeRes.fileExists) {
        await setIframeSrc(tag);
      } else {
        const previewErrorMessage = "File not found. If you uploaded the ad in the past 10 seconds, then the file is likely still being distributed through our ad serving network. Click reload in a few seconds.";
        setError(true);
        setErrorMessage(previewErrorMessage);
      }
    } catch (err) {
      await setIframeSrc(tag);
    }
  }

  async function setIframeSrc(tag) {
    await Api.Post({ path: "/api/ads/banner-session", body: { tag } });
    setSrc(`${location.origin}/api/ads/banner-preview?cachebuster=${moment().unix()}`);
    setError(false);
  }

  function resizePreview($elem, width, height) {
    const containerWidth = $elem.parent().width();
    const scale = AdsHelper.previewScale(width, containerWidth);
    const style = AdsHelper.previewStyle(width, height, scale);
    $elem.attr("style", style);
    $elem.parent().height(height * scale);
  }
  
  const reloadClick = async () => {
    await bannerPreview();
  }

  if (error) {
    return <div className="col-lg-12">
      <span>{errorMessage}</span>
      <Button variant="light" size="sm" onClick={reloadClick}><span className="text-success"><FontIcon name="repeat" /></span></Button>
    </div>;
  } else {
    return <div className="col-lg-12">
      <div className="banner-container">
        <iframe id={props.id} src={src} frameBorder="0" scrolling="no" width={props.ad.width} height={props.ad.height}></iframe>
      </div>
    </div>;
  }
}
export default BannerPreview;