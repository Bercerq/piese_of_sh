import React, { useState, useEffect } from "react";
import * as _ from "lodash";
import VideoPreview from "../../../advault/VideoPreview";
import BannerPreview from "../../../advault/BannerPreview";
import * as Api from "../../../../../../client/Api";
import * as AdsHelper from "../../../../../../client/AdsHelper";
import { Ad, AdPreview } from "../../../../../../models/data/Ads";
import Loader from "../../../../../UI/Loader";
import ErrorContainer from "../../../../../UI/ErrorContainer";
import { CampaignBanner, RetailStrategy } from "../../../../../../models/data/Campaign";
import { CreativeFeed } from "../../../../../../models/data/CreativeFeed";
import { Modal, Form, Button, Row } from "react-bootstrap";
import Select from "react-select";

interface CampaignAdPreviewModalProps {
  show: boolean;
  ad: CampaignBanner;
  dataFeeds: CreativeFeed[]
  branches: RetailStrategy[];
  isNewOrUpdated: boolean;
  onClose: () => void;
}

const CampaignAdPreviewModal = (props: CampaignAdPreviewModalProps) => {
  const bannerId = _.get(props, "ad.banner.id");
  const id = _.get(props, "ad.id");
  let filteredBranches = filterBranches(props.branches)

  const [advertiserAd, setAdvertiserAd] = useState<Ad>(null);
  const [showLoader, setShowLoader] = useState<boolean>(true);
  const [showPreview, setShowPreview] = useState<boolean>(false);
  const [error, setError] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [selectedBranch, setSelectedBranch] = useState<number>((filteredBranches.length > 0) ? filteredBranches[0].retailBranch.id : 0);

  useEffect(() => { onEntering() }, [selectedBranch]);

  const handleClose = () => {
    setShowPreview(false);
    setAdvertiserAd(null);
    setShowLoader(false);
    setError(false);
    setErrorMessage("");
    props.onClose();
  }

  const onEntering = async () => {
    setShowLoader(true);
    setShowPreview(false);
    try {
      let previewLink = `/api/ads/preview/${props.ad.banner.advertiserId}/ad/${props.ad.banner.id}/campaign/${props.ad.campaignId}`
      if (selectedBranch > 0) {
        previewLink += `/branch/${selectedBranch}`;
      }
      previewLink += `/campaignbanner/${id}`

      const previewAd: AdPreview = await Api.Get({ path: previewLink });
      const advertiserAd: Ad = await Api.Get({ path: `/api/ads/${bannerId}` });
      advertiserAd.previewTag = previewAd.preview;
      setAdvertiserAd(advertiserAd);
      setShowLoader(false);
      setShowPreview(true);
      setError(false);
      setErrorMessage("");
    } catch (err) {
      setShowLoader(false);
      setError(true);
      setErrorMessage("Error loading advertiser ad.");
      setAdvertiserAd(null);
    }
  }

  function filterBranches(branches: RetailStrategy[]) {
    let filteredbranches = branches
    if (props.ad) {
      var dataFeed = props.dataFeeds.find((feed) => feed.id == props.ad.dataFeedId);
      if (dataFeed) {
        filteredbranches = filteredbranches.filter((branch) =>
          (dataFeed.rows) ?
            dataFeed.rows.findIndex(row => row.key == branch.branchId) >= 0
            : false
        );
      }
    }
    return filteredbranches;
  }
  function getTagSelectOptions() {
    return filterBranches(props.branches || [])
      .map((branch) => { return { value: branch.retailBranch.id, label: branch.retailBranch.name } })
  }
  const tagOptions = getTagSelectOptions();

  const isVideoAd = advertiserAd ? AdsHelper.isVideoAd(advertiserAd.type) : false;
  return <Modal dialogClassName="modal-xxl" show={props.show} onEntering={onEntering} onHide={handleClose} backdrop="static">
    <Modal.Header closeButton>
      <Modal.Title>Ad preview - id: {id}</Modal.Title>
    </Modal.Header>
    <Modal.Body>
      {id > 0 &&
        <div className="row">
          <Loader visible={showLoader} />
          {!showLoader && !error &&
            <div className="col-lg-12">
              {props.isNewOrUpdated &&
                <div className="text-danger mb-2">
                  Preview is possibly outdated; please save the campaign
                </div>
              }
              {tagOptions.length > 0 && <span> Branch:
                <Form.Group>
                  <Select
                    inputId={`preview-from-branch`}
                    className="react-select-container"
                    classNamePrefix="react-select"
                    clearable={false}
                    value={tagOptions.find((o) => { return o.value === selectedBranch })}
                    onChange={a => setSelectedBranch(a.value)}
                    options={tagOptions}
                  /></Form.Group>
              </span>}
              {showPreview && isVideoAd && <VideoPreview id="video-preview-player" ad={advertiserAd} />}
              {showPreview && !isVideoAd && <BannerPreview id="banner-preview" ad={advertiserAd} />}
            </div>
          }
          {!showLoader && error &&
            <div className="col-lg-12">
              <ErrorContainer message={errorMessage} />
            </div>
          }
        </div>
      }
    </Modal.Body>
    <Modal.Footer>
      <Button variant="light" size="sm" onClick={handleClose}>CANCEL</Button>
    </Modal.Footer>
  </Modal>;
}
export default CampaignAdPreviewModal;