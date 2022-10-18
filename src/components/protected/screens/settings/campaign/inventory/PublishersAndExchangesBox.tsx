import React, { useState, useEffect, Fragment } from "react";
import * as _ from "lodash";
import * as Helper from "../../../../../../client/Helper";
import { PublishersAndExchangesBoxFormData, PublishersAndExchangesBoxProps } from "../../../../../../client/campaignSchemas";
import SettingsBox from "../shared/SettingsBox";
import ImageCheckboxList from "../../../../../UI/ImageCheckboxList";

const PublishersAndExchangesBox = (props: PublishersAndExchangesBoxProps) => {
  const [publishersAndExchanges, setPublishersAndExchanges] = useState<string[]>(_.get(props, "publishersAndExchanges.values", []));
  const publisherAdservingSSP =  ["ORTEC_IFRAME", "ORTEC_JS", "ORTEC_TRK_CLK", "ORTEC_TRK_IMP"]

  const submitData = getSubmitData();

  useEffect(loadForm, [props.id]);

  useEffect(() => { props.onChange(submitData); }, [JSON.stringify(submitData)]);

  function loadForm() {
    setPublishersAndExchanges(_.get(props, "publishersAndExchanges.values", []));
  }

  function getSubmitData(): PublishersAndExchangesBoxFormData {
    return  (!props.isAdserving) ? { publishersAndExchanges } : {publishersAndExchanges :publisherAdservingSSP };
  }

  function getSspLogos() {
    const ster = Helper.isSter(props.agencyId);
    const abovo = Helper.isAbovo(props.agencyId);
    if (props.videoCampaign) {
      if (ster) {
        return [
          { value: 'video_cookieless', path: '/images/ssp-logos/Ster-cookieless.png', style: { maxHeight: "60px", marginTop: "-15px" } }
        ];
      } else {
        return [
          { value: 'SpotX', path: '/images/ssp-logos/SpotX.png', style: { height: "30px" } },
          { value: 'video', path: '/images/ssp-logos/OptOutRev.png', style: { height: "30px" } },
          { value: 'video_cookieless', path: '/images/ssp-logos/OptOutNoCookie.png', style: { height: "30px" } },
          { value: 'smartclip', path: '/images/ssp-logos/smartclip.png', style: { maxHeight: "30px" } },
          { value: 'FreeWheel', path: '/images/ssp-logos/freewheel.png', style: { marginTop: "3px" } }
        ];
      }
    } else {
      if (ster) {
        return [
          { value: 'STER_ADHESE', path: '/images/ssp-logos/Ster-cookieless.png', style: { maxHeight: "60px", marginTop: "-15px" } },
          { value: 'display_cookieless', path: '/images/ssp-logos/Ster-cookieless-dev.png', style: { maxHeight: "60px", marginTop: "-15px" } }
        ];
      } else {
        const sspLogos = [
          { value: 'AppNexus', path: '/images/ssp-logos/xandr.svg', style: { height: "30px",  marginTop: "-2px" } },
          { value: 'display', path: '/images/ssp-logos/OptOutRev.png', style: { height: "30px", marginTop: "3px" } },
          { value: 'display_cookieless', path: '/images/ssp-logos/OptOutNoCookie.png', style: { height: "30px", marginTop: "3px" } },
          { value: 'Google AdX', path: '/images/ssp-logos/GoogleAdX.png' },
          { value: 'Improve', path: '/images/ssp-logos/Improve.png', style: {  margin: "-4px" } },
          { value: 'JustPremium', path: '/images/ssp-logos/JustPremium.png' },
          { value: 'Microsoft', path: '/images/ssp-logos/Microsoft.png' },
          { value: 'OpenX', path: '/images/ssp-logos/OpenX.png' },
          { value: 'Pubmatic', path: '/images/ssp-logos/Pubmatic.png' },
          { value: 'Rubicon', path: '/images/ssp-logos/Rubicon.png' },
          { value: 'Semilo', path: '/images/ssp-logos/Semilo.png' },
          { value: 'WebAdsNL', path: '/images/ssp-logos/WebAdsNL.png' }
        ];
        return sspLogos;
      }
    }
  }

  const handlePublishersAndExchangesChange = (checked: string[]) => {
    setPublishersAndExchanges(checked);
  }

  const options = getSspLogos();
  const writeAccess = props.rights.MANAGE_CAMPAIGN || false;

  return <SettingsBox title="Exchanges & Publishers">
    <div className="row no-gutters">
      <div className="col-lg-12 px-1">
        {!props.isAdserving && <Fragment>
          <ImageCheckboxList
            id="settings-inventory-publishersandexchanges"
            disabled={!writeAccess}
            checked={publishersAndExchanges}
            options={options}
            selectAll={true}
            listClassNames="publishers-exchanges-list"
            onChange={handlePublishersAndExchangesChange}
          />
          <a download style={{ fontSize: "1.1em" }} className="pull-right clearfix" href="/files/inventory.xlsx">Inventory per week</a>
        </Fragment>}
        {props.isAdserving && <img src="/images/ssp-logos/OptOutRev.png" alt="Adserving" style={{   height: "40px", paddingTop: "10px" }} />}
      </div>
    </div>
  </SettingsBox>;
}
export default PublishersAndExchangesBox;