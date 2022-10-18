import React, { Fragment, useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import { Button } from "react-bootstrap";
import * as _ from "lodash";
import { AdsBoxFormData, AdsBoxProps } from "../../../../../../client/campaignSchemas";
import { CampaignBanner, CampaignTag } from "../../../../../../models/data/Campaign";
import { CreativeFeed }  from "../../../../../../models/data/CreativeFeed";
import FontIcon from "../../../../../UI/FontIcon";
import SettingsBox from "../shared/SettingsBox";
import CampaignAdsTable from "./CampaignAdsTable";
import CampaignTagsTable from "./CampaignTagsTable";
import LinkAdsModal, { LinkAdsFields } from "./LinkAdsModal";
import TagModal from "./TagModal";
import CampaignAdModal from "./CampaignAdModal";
import TagPreviewModal from "./TagPreviewModal";
import CampaignAdPreviewModal from "./CampaignAdPreviewModal";
import AdShareModal from "../../../advault/AdShareModal";
import Loader from "../../../../../UI/Loader";

const AdsBox = (props: AdsBoxProps) => {
  let history = useHistory();
  const [ads, setAds] = useState<CampaignBanner[]>(props.ads || []);//ads used for the table
  const [tags, setTags] = useState<CampaignTag[]>(props.tags || []);//tags used for the table
  const [dataFeeds, setDataFeeds] = useState<CreativeFeed[]>(props.dataFeeds || []);//tags used for the table
  const [showAdsLoader, setShowAdsLoader] = useState<boolean>(true);
  const [showTagsLoader, setShowTagsLoader] = useState<boolean>(true);
  const [editTag, setEditTag] = useState<CampaignTag>(null);
  const [editAd, setEditAd] = useState<CampaignBanner>(null);
  const [previewAd, setPreviewAd] = useState<CampaignBanner>(null);
  const [previewTag, setPreviewTag] = useState<CampaignTag>(null);
  const [showLinkAdsModal, setShowLinkAdsModal] = useState<boolean>(false);
  const [showTagModal, setShowTagModal] = useState<boolean>(false);
  const [showAdModal, setShowAdModal] = useState<boolean>(false);
  const [showAdPreviewModal, setShowAdPreviewModal] = useState<boolean>(false);
  const [showAdShareModal, setShowAdShareModal] = useState<boolean>(false);
  const [shareId, setShareId] = useState<number>(-1);
  const [showTagPreviewModal, setShowTagPreviewModal] = useState<boolean>(false);
  const [adsToSave, setAdsToSave] = useState<CampaignBanner[]>([]); //ads for submit
  const [tagsToSave, setTagsToSave] = useState<CampaignTag[]>([]); //tags for submit
  const [adsToDelete, setAdsToDelete] = useState<number[]>([]);
  const [newTagIdCounter, setNewTagIdCounter] = useState<number>(-1);
  const [newAdIdCounter, setNewAdIdCounter] = useState<number>(-1);

  const submitData = getSubmitData();

  useEffect(loadForm, [props.id]);

  useEffect(() => { props.onChange(submitData); }, [JSON.stringify(submitData)]);

  useEffect(() => { setShowAdsLoader(false); }, [JSON.stringify(ads)]);
  useEffect(() => { setShowTagsLoader(false); }, [JSON.stringify(tags)]);

  function loadForm() {
    setAds(props.ads || []);
    setTags(props.tags || []);
  }

  function getSubmitData(): AdsBoxFormData {
    const [adsToUpdate, adsToCreate] = _.partition(adsToSave, (ad) => { return ad.id > 0; });
    if (props.isAdserving) {
      const [tagsToUpdate, tagsToCreate] = _.partition(tagsToSave, (tag) => { return tag.id > 0; });
      return {
        adsToUpdate,
        adsToCreate,
        adsToDelete,
        tagsToUpdate,
        tagsToCreate
      }
    } else {
      return {
        adsToUpdate,
        adsToCreate,
        adsToDelete,
        tagsToUpdate: [],
        tagsToCreate: []
      }
    }
  }

  const editClick = (id) => {
    const editAd = ads.find((ad) => { return ad.id === id });
    setEditAd(editAd);
    setShowAdModal(true);
  }

  const previewClick = (id) => {
    const previewAd = ads.find((ad) => { return ad.id === id });
    setPreviewAd(previewAd);
    setShowAdPreviewModal(true);
  }

  const shareClick = (id) => {
    setShareId(id);
    setShowAdShareModal(true);
  }

  const deleteClick = (id: number) => {
    setShowAdsLoader(true);
    if (id > 0) {
      const updatedAdsToDelete = adsToDelete.concat();
      updatedAdsToDelete.push(id);
      setAdsToDelete(updatedAdsToDelete);
    }
    const updatedAds = ads.filter((ad) => { return ad.id !== id });
    setAds(updatedAds);
    const updatedAdsToSave = adsToSave.filter((ad) => { return ad.id !== id });
    setAdsToSave(updatedAdsToSave);
  }

  const tagEditClick = (id) => {
    const editTag = tags.find((t) => { return t.id === id });
    setEditTag(editTag);
    setShowTagModal(true);
  }

  const tagPreviewClick = (id) => {
    const previewTag = tags.find((t) => { return t.id === id });
    setPreviewTag(previewTag);
    setShowTagPreviewModal(true)
  }

  const tagModalClose = () => {
    setShowTagModal(false);
    setEditTag(null);
  }

  const adPreviewModalClose = () => {
    setShowAdPreviewModal(false);
    setPreviewAd(null);
  }

  const tagPreviewModalClose = () => {
    setShowTagPreviewModal(false);
    setPreviewTag(null);
  }

  const tagSubmit = (tag: CampaignTag) => {
    //setShowTagsLoader(true);
    if (tag.id) {
      updateTag(tag);
    } else {
      addTag(tag);
    }
    setShowTagModal(false);
  }

  const adModalClose = () => {
    setShowAdModal(false);
    setEditAd(null);
  }

  const adShareModalClose = () => {
    setShowAdShareModal(false);
    setShareId(-1);
  }

  const adSubmit = (ad: CampaignBanner) => {
    let updatedAds = _.cloneDeep(ads);
    let updatedAdsToSave = _.cloneDeep(adsToSave);

    const updatedAdsIndex = updatedAds.findIndex((o) => { return o.id === ad.id });
    if (JSON.stringify(updatedAds[updatedAdsIndex]) !== JSON.stringify(ad)) {
      setShowAdsLoader(true);
      if (updatedAdsIndex > -1) {
        updatedAds[updatedAdsIndex] = ad;
        setAds(updatedAds);
      }

      var adToSave = _.omit(ad, ["banner"]);
      const updatedAdsToSaveIndex = updatedAdsToSave.findIndex((o) => { return o.id === ad.id });
      if (updatedAdsToSaveIndex > -1) {
        updatedAdsToSave[updatedAdsToSaveIndex] = adToSave;
      } else {
        updatedAdsToSave.push(adToSave);
      }
      setAdsToSave(updatedAdsToSave);

      if (props.isAdserving && ad.id < 0) {
        updateDefaultCampaignBanner(ad);
      }
    }
    setShowAdModal(false);
    setEditAd(null);
  }

  const linkAdsSubmit = (linkAdsFields: LinkAdsFields) => {
    setShowAdsLoader(true);
    setShowTagsLoader(true);
    let newAdId = newAdIdCounter;
    let newTagId = newTagIdCounter;
    const updatedAds = _.cloneDeep(ads);
    const updatedAdsToSave = _.cloneDeep(adsToSave);

    let updatedTags = _.cloneDeep(tags);
    let updatedTagsToSave = _.cloneDeep(tagsToSave);

    linkAdsFields.ads.forEach((ad) => {
      let newAdToSave: CampaignBanner = {
        id: newAdId,
        campaignId: props.id,
        bannerId: ad.id,
        clickUrl: linkAdsFields.clickUrl,
        startTime: linkAdsFields.startTime,
        endTime: linkAdsFields.endTime,
        name: ad.name,
        active: 1
      };

      if (props.isAdserving) {
        if (linkAdsFields.tagId) {
          newAdToSave.tagId = linkAdsFields.tagId;
          const tagIndex = updatedTags.findIndex((t) => { return t.id === linkAdsFields.tagId });
          if (updatedTags[tagIndex] && !updatedTags[tagIndex].defaultCampaignBannerId) {
            updatedTags[tagIndex].defaultCampaignBannerId = newAdId;
            updatedTags[tagIndex].finalized = true;

            const tagToSaveIndex = updatedTagsToSave.findIndex((t) => { return t.id === linkAdsFields.tagId });
            if (updatedTagsToSave[tagToSaveIndex]) {
              updatedTagsToSave[tagToSaveIndex] = updatedTags[tagIndex];
            } else {
              updatedTagsToSave.push(updatedTags[tagIndex]);
            }
          }
        } else {
          const newTag: CampaignTag = {
            id: newTagId,
            name: `Tag: ${ad.name}`,
            campaignId: props.id,
            supportedSizes: [`${ad.width}x${ad.height}`],
            iframe: true,
            javascript: true,
            tracking: true,
            finalized: true,
            defaultCampaignBannerId: newAdId
          };
          newAdToSave.tagId = newTagId;
          updatedTags.push(newTag);
          updatedTagsToSave.push(newTag);
          newTagId--;
        }
      }
      const newAd = _.assign({}, newAdToSave, { banner: ad });
      updatedAdsToSave.push(newAdToSave);
      updatedAds.push(newAd);
      newAdId--;
    });
    setAds(updatedAds);
    setAdsToSave(updatedAdsToSave);
    setNewAdIdCounter(newAdId);
    if (props.isAdserving) {
      setTags(updatedTags);
      setTagsToSave(updatedTagsToSave);
      setNewTagIdCounter(newTagIdCounter);
    }
    setShowLinkAdsModal(false);
  }

  const uploadNewAdsClick = () => {
    history.push(`/advault/advertiser/${props.advertiserId}`);
  }

  function updateTag(tag: CampaignTag) {
    const tagIndex = tags.findIndex((t) => { return t.id === tag.id });
    if (tagIndex > -1 && JSON.stringify(tags[tagIndex]) !== JSON.stringify(tag)) {
      setShowTagsLoader(true);
      let updatedTags = _.cloneDeep(tags);
      updatedTags[tagIndex] = tag;
      setTags(updatedTags);

      const tagToSaveIndex = tagsToSave.findIndex((t) => { return t.id === tag.id });
      if (tagToSaveIndex > -1) {
        let updatedTagsToSave = _.cloneDeep(tagsToSave);
        updatedTagsToSave[tagToSaveIndex] = tag;
        setTagsToSave(updatedTagsToSave);
      } else {
        const updatedTagsToSave = _.cloneDeep(tagsToSave);
        updatedTagsToSave.push(tag);
        setTagsToSave(updatedTagsToSave);
      }
    }
  }

  function addTag(tag: CampaignTag) {
    setShowTagsLoader(true);
    const newTag = _.assign({}, tag, { id: newTagIdCounter });
    const updatedTags = _.cloneDeep(tags);
    updatedTags.push(newTag);
    setTags(updatedTags);
    const updatedTagsToSave = _.cloneDeep(tagsToSave);
    updatedTagsToSave.push(newTag);
    setTagsToSave(updatedTagsToSave);
    setNewTagIdCounter(newTagIdCounter - 1);
  }

  function updateDefaultCampaignBanner(ad: CampaignBanner) {
    let bannerTag = tags.find((t) => { return t.defaultCampaignBannerId === ad.id });
    if (bannerTag && bannerTag.id !== ad.tagId) {
      //find another banner with this tag id 
      const newDefaultBanner = ads.find((o) => { return o.tagId === bannerTag.id && o.id !== ad.id });
      if (newDefaultBanner) {
        //if found set as default
        bannerTag.defaultCampaignBannerId = newDefaultBanner.id;
        bannerTag.finalized = true;
      } else {
        bannerTag.defaultCampaignBannerId = null;
        bannerTag.finalized = false;
      }
      updateTag(bannerTag);
    } else {
      const tag = tags.find((t) => { return t.id === ad.tagId });
      if (tag && !tag.defaultCampaignBannerId) {
        const updatedTag = _.assign({}, tag, { defaultCampaignBannerId: ad.id, finalized: true });
        updateTag(updatedTag);
      }
    }
  }

  function isNewOrUpdated(campaignAd: CampaignBanner): boolean {
    if (campaignAd) {
      return adsToSave.findIndex((ad) => { return ad.id === campaignAd.id }) > -1;
    }
    return false;
  }

  const writeAccess = props.rights.MANAGE_CAMPAIGN && props.rights.MANAGE_ADS;

  return <SettingsBox>
    <div className="row no-gutters">
      {false && props.isAdserving &&     //disabled showing tags for now, was too advanced and not helping
        <div className="col-lg-12 px-1">
          <h5 className="pull-left">Tags</h5>
          <div className="table-btn-container">
            <Button size="sm" variant="primary" disabled={!writeAccess} className="mr-2" onClick={() => { setShowTagModal(true); setEditTag(null); }}><FontIcon name="plus" /> ADD TAG</Button>
          </div>
          <Loader visible={showTagsLoader} />
          {!showTagsLoader &&
            <CampaignTagsTable
              writeAccess={writeAccess}
              records={tags}
              campaignBanners={ads}
              editClick={tagEditClick}
              previewClick={tagPreviewClick}
            />
          }
        </div>}
      <div className="col-lg-12 px-1">
        <h5 className="pull-left">Ads</h5>
        <div className="table-btn-container">
          <Button size="sm" variant="primary" className="mr-2" disabled={!writeAccess} onClick={() => { setShowLinkAdsModal(true); }}><FontIcon name="plus" /> LINK ADS</Button>
          {props.rights.MANAGE_ADS &&
            <button className="btn btn-linkbutton btn-sm mr-2" onClick={uploadNewAdsClick}><FontIcon name="upload" /> UPLOAD NEW ADS</button>}
        </div>
        <Loader visible={showAdsLoader} />
        {!showAdsLoader &&
          <CampaignAdsTable
            writeAccess={writeAccess}
            isAdserving={props.isAdserving}
            videoCampaign={props.videoCampaign}
            records={ads}
            tags={tags}
            editClick={editClick}
            previewClick={previewClick}
            shareClick={shareClick}
            deleteClick={deleteClick}
          />
        }
      </div>
    </div>
    <LinkAdsModal
      isAdserving={props.isAdserving}
      videoCampaign={props.videoCampaign}
      tags={tags}
      ads={ads}
      advertiserId={props.advertiserId}
      show={showLinkAdsModal}
      onClose={() => { setShowLinkAdsModal(false) }}
      onSubmit={linkAdsSubmit}
    />
    <CampaignAdModal
      show={showAdModal}
      ad={editAd}
      isAdserving={props.isAdserving}
      dataFeedAllowed={props.dataFeedAllowed}
      tags={tags}
      dataFeeds={dataFeeds}
      isNewOrUpdated={isNewOrUpdated(editAd)}
      writeAccess={writeAccess}
      onClose={adModalClose}
      onSubmit={adSubmit}
    />
    <CampaignAdPreviewModal
      show={showAdPreviewModal}
      ad={previewAd}
      dataFeeds={props.dataFeeds}
      branches={(props.branches)? props.branches : [] }
      isNewOrUpdated={isNewOrUpdated(previewAd)}
      onClose={adPreviewModalClose}
    />
    {props.videoCampaign &&
      <AdShareModal
        id={shareId}
        show={showAdShareModal}
        onClose={adShareModalClose}
      />
    }
    {props.isAdserving && <Fragment>
      <TagModal
        show={showTagModal}
        tag={editTag}
        campaignId={props.id}
        ads={ads}
        writeAccess={writeAccess}
        onClose={tagModalClose}
        onSubmit={tagSubmit}
      />
      <TagPreviewModal
        show={showTagPreviewModal}
        tag={previewTag}
        onClose={tagPreviewModalClose}
      />
    </Fragment>
    }
  </SettingsBox>;
}
export default AdsBox;