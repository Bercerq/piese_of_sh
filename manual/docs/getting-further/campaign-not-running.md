# Why is my campaign not running?

If your campaign is getting fewer impressions than expected, a number of things could be wrong:

## The Campaign is not registering bids

If your campaign is not doing any bids please check the following things:

* The campaign has been _activated_. If the status of the campaign is _paused_, activate the campaign.
* The _start date_ and _end date_ of the _Campaign_ have been set correctly.
* Check if the _Campaign type_ is set to _Retargeting_
    * If this is the case check whether any Segments have been linked (at the Segments tab of the _Campaign_).
    * If this is the case check whether any of the linked Segments is _active_
* Check whether any active Ads have been linked to the Campaign
    * Make sure any of the linked Ads are marked as “okay”, if not correct the problems.
    * Make sure some of the linked Ads are currently active (if the optional start and end date of the linked Ad has been set, make sure it includes today)
* If the Campaign bids using deals
    * Make sure that you used the correct deal id
    * Make sure that the deal is still active in the external system that manages the deal.
    * Make sure that the _max bid price_ of the campaign is not below the minimum deal floor price. If the external system manages floor prices in a different currency, it is possible that exchange rates are the problem. It is therefore recommended to always set the max bid price a bit above the deal floor price.

## The Campaign is registering bids but not impressions

* If the Campaign activated within the past day then it may be possible that some of the Ad exchanges to which the ad was submitted have not approved the ad just yet and are not accepting our bids.
* If the Campaign was activated longer ago but no impressions are won
    * It is possible that the max bid price is simply too low
    * Some of the ad exchanges where we bid have rejected the _Ad_.

## The Campaign is registering bids and impressions, but I expected way more impressions

* If your number of bids is much bigger than your number of impressions then the most likely reason is that your max bid price is simply too low. If possible try to increase your bid price.
* If your number of bids is quite close to your number of impressions then the most likely reason is that you’re targeting too specific. See if you can expand your targeting (either geographically, the number of domains the _Campaign_ is allowed to bid on, or the targeted (audience) segments).

