import React, { useState, useEffect, useContext, useRef } from "react";
import NotificationSystem from "react-notification-system";
import * as NotificationOptions from "../../../../client/NotificationOptions";
import { AppUser } from "../../../../models/AppUser";
import UserContext from "../../context/UserContext";
import * as Api from "../../../../client/Api";
import Loader from "../../../UI/Loader";
import AdqueueTable from "./AdqueueTable";
import { Ad, AdqueueRow, AdqueueUpdateAction } from "../../../../models/data/Ads";
import ErrorContainer from "../../../UI/ErrorContainer";
import AdqueueCountContext from "../../context/AdqueueCountContext";
import { AdqueueCountContextType } from "../../../../models/Common";
import AdqueuePreviewModal from "./AdqueuePreviewModal";

const AdqueuePageBody = () => {
  let { updateAdqueueCount } = useContext<AdqueueCountContextType>(AdqueueCountContext);
  const user: AppUser = useContext<AppUser>(UserContext);
  const [ads, setAds] = useState<Ad[]>([]);
  const [showLoader, setShowLoader] = useState<boolean>(true);
  const [showAdPreviewModal, setShowAdPreviewModal] = useState<boolean>(false);
  const [previewAd, setPreviewAd] = useState<Ad>(null);
  const [error, setError] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>("");

  const notificationSystem = useRef<NotificationSystem.System>(null);

  useEffect(() => { loadData(); }, []);
  useEffect(() => { loadData(); }, [showLoader]);

  async function loadData() {
    if (showLoader) {
      try {
        const ads = await Api.Get({ path: "/api/ads/adqueue" });
        setAds(ads);
        updateAdqueueCount(ads.length);
      } catch (err) {
        console.log(err);
        setError(true);
        setErrorMessage("Error loading ads.");
      }
      setShowLoader(false);
    }
  }

  const update = async (ad: Ad | AdqueueRow, action: AdqueueUpdateAction, data: Partial<Ad>) => {
    try {
      await Api.Put({ path: `/api/ads/${ad.id}`, body: { advertiserId: ad.advertiserId, data } });
      const notificationMessage = getNotificationMessage(ad, action, true);
      notificationSystem.current.addNotification(NotificationOptions.success(notificationMessage, false));
      if (showAdPreviewModal) setShowAdPreviewModal(false);
      setShowLoader(true);
    } catch (err) {
      const notificationMessage = getNotificationMessage(ad, action, false);
      notificationSystem.current.addNotification(NotificationOptions.error(notificationMessage));
    }
  }

  const previewClick = (id: number) => {
    const previewAd = ads.find((o) => { return o.id === id }) || null;
    setPreviewAd(previewAd);
    setShowAdPreviewModal(true);
  }

  const previewClose = () => {
    setPreviewAd(null);
    setShowAdPreviewModal(false);
  }

  function getNotificationMessage(ad: Ad | AdqueueRow, action: AdqueueUpdateAction, success: boolean): JSX.Element {
    if (success) {
      switch (action) {
        case "approve": return <span>Ad <strong>{ad.name}</strong>  approved</span>;
        case "disapprove": return <span>Ad <strong>{ad.name}</strong>  disapproved</span>;
        case "enablecookieless": return <span>Enabled "Uses no data" for ad <strong>{ad.name}</strong></span>;
        case "disablecookieless": return <span>Disabled "Uses no data" for ad <strong>{ad.name}</strong></span>;
      }
    } else {
      switch (action) {
        case "approve": return <span>Failed to approve ad <strong>{ad.name}</strong></span>;
        case "disapprove": return <span>Failed to disapprove ad <strong>{ad.name}</strong></span>;
        case "enablecookieless": return <span>Failed to enable "Uses no data" for ad <strong>{ad.name}</strong></span>;
        case "disablecookieless": return <span>Failed to disable "Uses no data" for ad <strong>{ad.name}</strong></span>;
      }
    }
  }

  if (!error) {
    return <div className="row">
      <div className="col-sm-12 pt-3">
        <div className="card">
          <h3 className="pull-left">Ad queue</h3>
          <Loader visible={showLoader} />
          {!showLoader &&
            <AdqueueTable ads={ads} user={user} update={update} previewClick={previewClick} />
          }
          <AdqueuePreviewModal
            show={showAdPreviewModal}
            ad={previewAd}
            onClose={previewClose}
            update={update}
          />
          <NotificationSystem ref={notificationSystem} />
        </div>
      </div>
    </div>;
  } else {
    return <div className="row">
      <div className="col-sm-12 pt-3">
        <div className="card">
          <h3><ErrorContainer message={errorMessage} /></h3>
        </div>
      </div>
    </div>;
  }
}
export default AdqueuePageBody;