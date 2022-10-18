import React, { useEffect } from "react";
import moment from "moment";
import * as _ from "lodash";
import * as Utils from "../../../../client/Utils";
import { Ad } from "../../../../models/data/Ads";

declare var videojs: any;

interface VideoPreviewProps {
  id: string;
  ad: Partial<Ad>;
}

const VideoPreview = (props: VideoPreviewProps) => {

  useEffect(() => {
    loadPreview();
    return unloadPreview;
  }, []);

  function loadPreview() {
    //T0D0 - improve to fix tag change
    let vp;
    const id = props.id;
    let previewUrl = _.get(props, "ad.vastURL", "");
    if (previewUrl) {
      previewUrl = previewUrl.replace(new RegExp("{CACHEBUSTER}", "g"), moment().unix());
      previewUrl = Utils.removeLineBreaks(previewUrl);
      vp = videojs(id, {
        fluid: true,
        plugins: {
          vastClient: {
            adTagUrl: previewUrl,
            adCancelTimeout: 5000,
            adsEnabled: true,
            vpaidFlashLoaderPath: '/components/videojs-vast-vpaid/bin/VPAIDFlash.swf'
          }
        }
      });
    } else {
      const tag = props.ad.vastXML || props.ad.previewTag || props.ad.tag;
      vp = videojs(id, {
        fluid: true,
        plugins: {
          vastClient: {
            adTagXML: function (callback) {
              setTimeout(function () {
                callback(null, tag);
              }, 0);
            },
            adCancelTimeout: 5000,
            adsEnabled: true,
            vpaidFlashLoaderPath: '/components/videojs-vast-vpaid/bin/VPAIDFlash.swf'
          }
        }
      });
    }
  }

  function unloadPreview() {
    const player = document.getElementById(props.id);
    if (player) videojs(player).dispose();
  }

  return <div>
    <video id={props.id} className="video-js vjs-default-skin" controls preload="auto" poster="/images/empty.png"><source src="/videos/sample.mp4" type="video/mp4" /></video>
  </div>;
}
export default VideoPreview;
