import React, { useState, useEffect, Fragment } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import Select from "react-select";
import * as _ from "lodash";
import AdForm from "./AdForm";
import * as Api from "../../../../client/Api";
import * as Helper from "../../../../client/Helper";
import { Ad, AdType, LocalBanner, LocalBannerData, ThirdPartyHost } from "../../../../models/data/Ads";
import { SelectOption, ScopeType } from "../../../../client/schemas";
import BannerPreviewList from "./BannerPreviewList";
import LocalBannerPreview from "./LocalBannerPreview";
import BannerPreview from "./BannerPreview";
import FontIcon from "../../../UI/FontIcon";
import VideoPreview from "./VideoPreview";
import { ScopeData } from "../../../../models/Common";
import { Advertiser } from "../../../../models/data/Advertiser";

interface AdsCreateModalProps {
  show: boolean;
  videoMode: boolean;
  scope: ScopeType;
  scopeId: number;
  data: ScopeData;
  onClose: (toDelete: string[]) => void;
  onSubmit: (advertiserId: number, ads: Partial<Ad>[], toDelete: string[]) => void;
}

const AdsCreateModal = (props: AdsCreateModalProps) => {
  const [adType, setAdType] = useState<(AdType | "")>("");
  const [adTypeOptions, setAdTypeOptions] = useState<SelectOption[]>([]);
  const [advertisers, setAdvertisers] = useState<SelectOption[]>([]);
  const [advertiserId, setAdvertiserId] = useState<number>(-1);
  const [isSter, setIsSter] = useState<boolean>(false);
  const [thirdPartyHosts, setThirdPartyHosts] = useState<ThirdPartyHost[]>([]);
  const [banners, setBanners] = useState<LocalBanner[]>([]);
  const [activeTabIndex, setActiveTabIndex] = useState<number>(0);
  const [dirsToDelete, setDirsToDelete] = useState<string[]>([]);
  const [videoUploaded, setVideoUploaded] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);
  const [ads, setAds] = useState<Partial<Ad>[]>([]);
  const [previewAd, setPreviewAd] = useState<Partial<Ad>>(null);
  const [validationError, setValidationError] = useState<boolean>(false);

  useEffect(save, [validationError, ads]);
  useEffect(() => { loadThirdPartyHosts() }, [advertiserId]);

  function save() {
    if (!validationError && ads.length > 0) {
      props.onSubmit(advertiserId, ads, dirsToDelete);
    }
  }

  const handleEntering = async () => {
    clearForm();
    const adTypeOptions = getAdTypeOptions();
    setAdTypeOptions(adTypeOptions);
    setAdType(adTypeOptions[0].value as AdType);
    if (props.scope === "advertiser") {
      setAdvertiserId(props.scopeId);
      const agencyId = (props.data as Advertiser).advertiser.agencyId;
      setIsSter(Helper.isSter(agencyId));
    } else {
      const advertisers = await getAdvertisers();
      const advertiserId = advertisers.length > 0 ? advertisers[0].advertiser.id : -1;
      const advertiserOptions = getAdvertiserOptions(advertisers);
      setAdvertisers(advertiserOptions);
      setAdvertiserId(advertiserId);
      if (props.scope === "agency") {
        setIsSter(Helper.isSter(props.scopeId));
      } else {
        if (advertisers.length > 0) {
          const agencyId = advertisers[0].advertiser.agencyId;
          setIsSter(Helper.isSter(agencyId));
        } else {
          setIsSter(false);
        }
      }
    }
  }

  const handleClose = () => {
    clearForm();
    props.onClose(dirsToDelete);
  }

  const handleSubmit = () => {
    setSaving(true);
  }

  const handleAdvertiserChange = (selected) => {
    const advertiserId = selected.value as number;
    setAdvertiserId(advertiserId);
  }

  const handleTypeChange = (selected) => {
    const adType = selected.value as AdType;
    setAdType(adType);
    clearForm();
  }

  const uploadBanners = (data: LocalBannerData) => {
    setActiveTabIndex(0);
    setBanners(data.banners);
    setDirsToDelete(dirsToDelete.concat(data.toDelete));
  }

  const uploadVideo = (videoUploaded: boolean) => {
    setVideoUploaded(videoUploaded);
  }

  const bannerDelete = (i: number) => {
    const items = banners.concat();
    if (items.length > 0) {
      items.splice(i, 1);
      setBanners(items);
      if (activeTabIndex > 0 && activeTabIndex === i) {
        setActiveTabIndex(activeTabIndex - 1);
      }
    }
  }

  const bannerTabClick = (i: number) => {
    setActiveTabIndex(i);
  }

  const adFormCreate = (error: boolean, ads: Partial<Ad>[]) => {
    setValidationError(error);
    setAds(ads);
    if (error) {
      setSaving(false);
    }
  }

  const adPreviewChange = (ad: Partial<Ad>) => {
    setPreviewAd(ad);
  }

  function getAdTypeOptions(): SelectOption[] {
    if (props.videoMode) {
      return [
        { value: "vast", label: "VAST" },
        { value: "video", label: "Video" },
        { value: "banner", label: "Banner" },
        { value: "thirdparty", label: "3rd Party Creative" }
      ]
    } else {
      return [
        { value: "banner", label: "Banner" },
        { value: "thirdparty", label: "3rd Party Creative" },
        { value: "vast", label: "VAST" },
        { value: "video", label: "Video" }
      ]
    }
  }

  async function getAdvertisers() {
    try {
      const qs = Helper.scopedParam({ scope: props.scope, scopeId: props.scopeId });
      const rslt = await Api.Get({ path: "/api/advertisers", qs });
      return _.get(rslt, "advertisers", []);
    } catch (err) {
      console.log(err);
      return [];
    }
  }

  function getAdvertiserOptions(advertisers: Advertiser[]) {
    return advertisers.map((o) => { return { value: o.advertiser.id, label: o.advertiser.name } });
  }

  async function loadThirdPartyHosts() {
    if (advertiserId > 0) {
      try {
        const thirdPartyHosts = await Api.Get({ path: `/api/advertisers/${advertiserId}/banners/thirdpartyhosts` });
        setThirdPartyHosts(thirdPartyHosts);
      } catch (err) {
        console.log(err);
        setThirdPartyHosts([]);
      }
    }
  }

  function clearForm() {
    setBanners([]);
    setActiveTabIndex(0);
    setPreviewAd(null);
    setVideoUploaded(false);
  }

  const showAdvertiserSelect = ["root", "organization", "agency"].indexOf(props.scope) > -1;
  const currentBanner: LocalBanner = banners[activeTabIndex] || null;
  return <Modal dialogClassName="modal-xxl" show={props.show} onHide={handleClose} onEntering={handleEntering} backdrop="static">
    <Modal.Header closeButton>
      <Modal.Title>Create ads</Modal.Title>
    </Modal.Header>
    <Modal.Body>
      <div className="row">
        <div className="col-lg-5">
          {showAdvertiserSelect &&
            <Form.Group controlId="ad-advertiser">
              <Form.Label>Advertiser * </Form.Label>
              <Select
                inputId="react-select-ad-advertiser"
                className="react-select-container"
                classNamePrefix="react-select"
                clearable={false}
                value={advertisers.find((o) => { return o.value === advertiserId })}
                onChange={handleAdvertiserChange}
                options={advertisers}
              />
            </Form.Group>
          }
          <Form.Group controlId="ad-type">
            <Form.Label>Ad Type</Form.Label>
            <Select
              inputId="react-select-adtype"
              className="react-select-container"
              classNamePrefix="react-select"
              onChange={handleTypeChange}
              value={adTypeOptions.find((o) => { return o.value === adType })}
              options={adTypeOptions}
            />
          </Form.Group>
          <AdForm
            adType={adType}
            submit={saving}
            localBanners={banners}
            thirdPartyHosts={thirdPartyHosts}
            isSter={isSter}
            onPreviewChange={adPreviewChange}
            onCreate={adFormCreate}
            onUploadBanners={uploadBanners}
            onUploadVideo={uploadVideo} />
        </div>
        <div className="col-lg-7">
          {adType === "banner" && <Fragment>
            <BannerPreviewList activeIndex={activeTabIndex} banners={banners} onTabClick={bannerTabClick} onDelete={bannerDelete} />
            <LocalBannerPreview id={`banner-preview-${activeTabIndex}`} banner={currentBanner} />
          </Fragment>
          }
          {previewAd && adType === "thirdparty" &&
            <BannerPreview id="create-banner-preview" ad={previewAd} />
          }
          {previewAd && adType === "vast" &&
            <VideoPreview id="create-video-preview" ad={previewAd} />
          }
          {videoUploaded && adType === "video" &&
            <div>Preview for this video is not possible until the ad is saved.</div>
          }
        </div>
      </div>
    </Modal.Body>
    <Modal.Footer>
      <Button size="sm" variant="light" onClick={handleClose}>CANCEL</Button>
      <Button size="sm" variant="primary" onClick={handleSubmit} disabled={saving}>
        {!saving && <Fragment>SAVE</Fragment>}
        {saving && <Fragment><FontIcon names={["refresh", "spin"]} /> SAVING</Fragment>}
      </Button>
    </Modal.Footer>
  </Modal>;
}
export default AdsCreateModal;