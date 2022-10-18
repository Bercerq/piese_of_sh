import React, { useState, useEffect } from "react";
import * as AdsHelper from "../../../../client/AdsHelper";
import { LocalBanner } from "../../../../models/data/Ads";

declare var $: any;

interface LocalBannerPreviewProps {
  id: string;
  banner: LocalBanner;
}

const LocalBannerPreview = (props: LocalBannerPreviewProps) => {
  const [containerWidth, setContainerWidth] = useState<number>($("#" + props.id).parent().width());

  useEffect(() => {
    loadPreview();
    return unloadPreview;
  }, [props.banner]);

  function previewStyle(width: number, height: number, scale: number) {
    return {
      width: width + "px",
      height: height + "px",
      transform: `scale(${scale})`,
      transformOrigin: "top left"
    }
  }

  function loadPreview() {
    window.addEventListener("resize", resizeHandler);
  }

  function unloadPreview() {
    return window.removeEventListener("resize", resizeHandler);
  }

  function resizeHandler() {
    setContainerWidth($("#" + props.id).parent().width());
  }

  if (props.banner) {
    const scale = AdsHelper.previewScale(props.banner.width, containerWidth);
    const style = previewStyle(props.banner.width, props.banner.height, scale);
    if (props.banner.type === 1) {
      return <div id={props.id}>
        <img style={style} src={props.banner.preview} />
      </div>;
    } else {
      return <div id={props.id}>
        <iframe style={style} src={props.banner.preview} frameBorder="0" scrolling="no"></iframe>
      </div>;
    }
  }
  return null;
}
export default LocalBannerPreview;