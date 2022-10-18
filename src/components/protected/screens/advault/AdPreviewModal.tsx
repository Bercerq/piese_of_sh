import React, { useRef, useState, useEffect } from "react";
import { Modal, Button } from "react-bootstrap";
import * as _ from "lodash";
import BannerPreview from "./BannerPreview";
import VideoPreview from "./VideoPreview";
import * as Api from "../../../../client/Api";
import * as AdsHelper from "../../../../client/AdsHelper";
import { Ad } from "../../../../models/data/Ads";
import Loader from "../../../UI/Loader";
import ErrorContainer from "../../../UI/ErrorContainer";
import * as Helper from "../../../../client/Helper";
import { ScopeType } from "../../../../client/schemas";
import { useParams } from "react-router-dom";
import { CreativeFeed, CreativeFeedRow } from "../../../../models/data/CreativeFeed";
import Select, { NonceProvider } from "react-select";
interface AdPreviewModalProps {
  show: boolean;
  id: number;
  advertiserId: number
  onClose: () => void;
}

const AdPreviewModal = (props: AdPreviewModalProps) => {
  const id = _.get(props, "id", -1);
  let params: { scope?, scopeId?} = useParams();
  let scope = params.scope as ScopeType;
  let scopeId = params.scopeId;

  const [feeds, setFeeds] = useState<CreativeFeed[]>();
  const [ad, setAd] = useState<Ad>(null);
  const [showLoader, setShowLoader] = useState<boolean>(true);
  const [showPreview, setShowPreview] = useState<boolean>(false);
  const [error, setError] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [chosenFeed, setChosenFeed] = useState<CreativeFeed>(null);
  const [feedRows, setFeedRows] = useState<CreativeFeedRow[]>([]);
  const [keyOptions, setKeyOptions] = useState<Array<{ label: string, value: string }>>([]);
  const [selectedKeys, setSelectedKeys] = useState<Array<String>>([])

  useEffect(() => {
    setKeyOptions([{ label: "None", value: "NONE" }, ...feedRows.map(row => { return { label: row.key, value: row.key }; })]);
    if (id > 0) {
      let qs = selectedKeysToCallParameters();
      if (chosenFeed) {
        Api.Get({ path: `/api/ads/preview/${props.advertiserId}/ad/${props.id}/datafeed/${chosenFeed.id}`, qs: qs })
          .then(dynamicAd => {
            setAd(Object.assign({}, ad, { previewTag: dynamicAd.preview }));
          })
      }
    }

  }, [feedRows, selectedKeys]);



  const selectedKeysToCallParameters = () => {
    let qs = Object.assign({}, ...(selectedKeys.map((key, index) => {
      let obj = {};
      if (key != "NONE") {
        obj["key" + (index + 1)] = key;
      }
      return obj;
    }).filter(object => Object.keys(object).length != 0)));
    return qs;
  }
  const handleClose = () => {
    setShowPreview(false);
    setAd(null);
    setShowLoader(false);
    setError(false);

    setChosenFeed(null);
    setFeedRows([])
    setErrorMessage("");
    props.onClose();
  }
  const feedChange = async (option: { label: string, value: string }) => {
    if (option.value != 'NONE') {
      const chosenFeed = feeds.find(feed => feed.id.toString() == option.value)
      setFeedRows((!chosenFeed?.rows) ? [] : chosenFeed.rows);
      setChosenFeed(chosenFeed)
      setSelectedKeys(Array.from(Array(chosenFeed.numberEventsUsed)).map(() => { return "NONE" }))

      const ad: Ad = await Api.Get({ path: `/api/ads/${id}` });
      setAd(ad);
    } else {
      setFeedRows([]);
      setSelectedKeys([]);
      setChosenFeed(null)
    }
  };

  const keySelectChange = (index: number, select: { value: string, label: string }) => {
    if (select) {
      setSelectedKeys(() => {
        let array = [...selectedKeys];
        array[index] = select.value;
        return array;
      })
    }


  }

  const onEntering = async () => {
    setShowLoader(true);
    if (id > 0) {
      try {
        const qs = Helper.scopedParam({ scope, scopeId });
        const feeds = await Api.Get({ path: `/api/creativefeed`, qs });
        setFeeds(feeds);
        const ad: Ad = await Api.Get({ path: `/api/ads/${id}` });
        setAd(ad);
        setShowPreview(true);
        setShowLoader(false);
        setError(false);
        setErrorMessage("");
      } catch (err) {
        console.log(err)
        setShowLoader(false);
        setError(true);
        setErrorMessage("Error loading ad.");
        setAd(null);
      }
    }
  }

  const isVideoAd = ad ? AdsHelper.isVideoAd(ad.type) : false;
  return <Modal dialogClassName="modal-xxl" show={props.show} onEntering={onEntering} onHide={handleClose} backdrop="static">
    <Modal.Header closeButton>
      <Modal.Title>Ad preview - id: {id}</Modal.Title>
    </Modal.Header>
    <Modal.Body>
      {id > 0 &&
        <div> <div className="row">
          <Loader visible={showLoader} />

          {showPreview && isVideoAd && <div className="col-lg-12"><VideoPreview id="video-preview-player" ad={ad} /> </div>}
          {showPreview && !isVideoAd && <div className="col-lg-12"><BannerPreview id="banner-preview" ad={ad} /> </div>}
        </div>

      
          <div className="row">
            <div className="col-lg-12">
              <div className="row">
              <hr></hr>
              </div>
            </div>
            {!showLoader && !error && feeds.length > 0 &&
              <div className="col-lg-12">
                {showPreview && !isVideoAd && <div className="row">
                  <div className="col-lg-4"> Datafeed:
                    <Select
                      inputId={`attribute-creative-feed-${props.id}-banner`}
                      className="react-select-container"
                      classNamePrefix="react-select"
                      name="data-feed-select"
                      clearable={false}
                      options={[{ value: "NONE", label: 'none' }, ...feeds.map(feed => { return { value: feed.id.toString(), label: feed.name } })]}
                      defaultValue={{ value: "NONE", label: 'none' }}
                      onChange={feedChange}
                    /></div></div>}
                {showPreview && !isVideoAd && chosenFeed && selectedKeys.map((key, index) => {
                  return <div className="row"><div className="col-lg-4"> key {index + 1}:
                    <Select
                      inputId={`attribute-creative-feed-options-${props.id}-banner-${index}`}
                      className="react-select-container"
                      classNamePrefix="react-select"
                      name="data-feed-key-select"
                      clearable={false}
                      options={keyOptions}
                      value={keyOptions.find((option) => { return option.value == key })}
                      onChange={(select) => { keySelectChange(index, select) }}
                    /> </div></div>
                })
                }
              </div>
            }
            {!showLoader && error &&
              <div className="col-lg-12">
                <ErrorContainer message={errorMessage} />
              </div>
            }
          </div></div>
      }
    </Modal.Body>
    <Modal.Footer>
      <Button variant="light" size="sm" onClick={handleClose}>CANCEL</Button>
    </Modal.Footer>
  </Modal>;
}
export default AdPreviewModal;