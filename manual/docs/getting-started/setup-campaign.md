# Setting up a campaign

In the adscience system each _Campaign_ belongs to an _Advertiser_, and each _Advertiser_ belongs to an _Agency_.

## Step 1: Create an Advertiser

Because _Campaigns_ belong to *Advertisers* if this was not done yet, the first step is to [set up an _Advertiser_][setup-advertiser].

## Step 2: Create the campaign

This can be done by navigating to the _Campaigns_ tab

* This can either be done on the _Agency_ level (which contains all of the agency’s campaigns) 
* Or from within a specific _Advertiser_ (which contains only the campaigns of this advertiser)

[![][agency-campaigns]][agency-campaigns]

Pressing the +Add button

* You will need to specify the campaign’s name
* The campaign’s start and end date (time is optional)
* The _budget_. Setting a campaign’s budget is mandatory and will include any fees paid towards ORTEC|adscience. The budget can be set on a daily, weekly, monthly, or entire campaign period. 
* The ad type:
    * _Banners_. The campaign will use ads of the banner type, which gives the campaign targeting options and reporting metrics related to the Banner campaign type.
    * _Video_. The campaign uses ads of the video type, which gives the campaign targeting options and reporting metrics related to the Video campaign type.
* The bidding type:
    * _Real time bidding_. In almost every case you will want to select _Real time bidding_, which allows the _Campaign_ to bid on online ad inventory.
    * _Adserving only_. Alternatively if you already have an arrangement with an external party to show ads, and you only need hosting or even only the tracking of the ads, then you can choose _adserving only_
* The campaign type
    * _prospecting_ (the targeted audience of the campaign usually has not visited the advertiser’s website before)
    * _retargeting_. Retargeting campaigns exclusively target people who have visited the advertiser’s website before. This requires some additional setup which can be found in the [Segments and retargeting section][segments].
    * _retail_. If your _Advertiser_ has multiple stores with audiences in different geographic areas then this will help you target them. This requires you to first set up _Branches_ in the _Advertiser_. More information can be found in the [retail section][retail].
* The metric the machine learning algorithm should optimize.  
  Several options are available. The system will modify bids based on the specific advertisement spot and several attributes of the potential viewer.

[![][agency-add-campaign]][agency-add-campaign]

[![][agency-add-campaign-existing]][agency-add-campaign-existing]

## Step 3: Adding (targeting) details to the campaign

This can be done from the _Campaign Settings_ of a campaign
* The Campaign settings can be accessed by either selecting _Edit Campaign_ from within a campaign.
* Or by selecting the pencil in the _Campaigns_ tab on any level

A detailed version of all Campaign Settings can be found in the [Campaign Settings section][campaign-settings], here only some of the most used settings are covered.

* Day parting: By _selecting_ and _clearing_ parts of the day,  (parts of) certain days can be targeted. Only green periods will be targeted.

[![][cs-day-parting]][cs-day-parting]

* _Max bid price_: The maximum bid price a campaign is allowed to do. In most cases the actual bid price is  controlled by our machine learning algorithm and will typically be much lower than the maximum price set.

[![][cs-budget]][cs-budget]

* _Targeting_: The targeting tab provides several options to target or exclude types of devices (mobile, tablet, desktop) as well as options to set up geographic targeting on users.

[![][cs-targeting]][cs-targeting]

* _Inventory_: The inventory tab provides options to target specific domains or exchanges where inventory is sold. By opening up the _Domain_ section and +Creating a rule from values, a number of specifically chosen domains can be targeted, or excluded.

[![][cs-inventory]][cs-inventory]

## Step 4: Adding Ads and activating the Campaign

If you have already uploaded _Ads_ to the _Advertiser_ then linking ads is done within the _Campaign Settings_ on the _Ads_ tab. Simply select +Link ads, to link the ads to the Campaign.

[![][cs-adlinks]][cs-adlinks]

[![][cs-link-ads]][cs-link-ads]

If you have not uploaded _Ads_ to the Advertiser then you can follow the steps in [this section][upload-ad].

Once _Ads_ have been added the _Campaign_ can be started by either selecting:

* _Activate_, if the campaign has a start date that allows the campaign to start right away.
* Or _schedule_, if the campaign has a start date somewhere in the future.

[agency-campaigns]: ../img/agency/agency-campaigns.png
[agency-add-campaign]: ../img/agency/agency-add-campaign.png
[agency-add-campaign-existing]: ../img/agency/agency-add-campaign-existing.png
[cs-day-parting]: ../img/campaign-settings/cs-day-parting.png
[cs-budget]: ../img/campaign-settings/cs-budget.png
[cs-targeting]: ../img/campaign-settings/cs-targeting.png
[cs-inventory]: ../img/campaign-settings/cs-inventory.png
[cs-adlinks]: ../img/campaign-settings/cs-adlinks.png
[cs-link-ads]: ../img/campaign-settings/cs-link-ads.png
[upload-ad]: /kb/getting-started/upload-ad/
[campaign-settings]: /kb/campaign-settings/general/
[segments]: /kb/segments/
[setup-advertiser]: /kb/getting-started/setup-advertiser/
[retail]: /kb/getting-ahead/retail/