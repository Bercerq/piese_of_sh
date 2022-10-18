# Retail

If your Advertiser has a large number of stores or *Branches* and you would like each *Branch* to target customers near it with a tailored message, then you will want to use the *Retail* options.

## Setting up Branches
*Branches* are added to the *Retail* tab of the *Advertiser*. 

[![][advertiser-retail]][advertiser-retail]

* To make it easier to handle a large number of *Branches* it is recommended that you download the template excel using the
"export" button.
* In the excel sheet a number of attributes needs to be defined for each *Branch*.
* Mandatory attributes, these attributes have to do with the Ad targeting of the branch:
     * **id**, an identifier for the branch. You can choose any id as long as it's unique. Simply using the numbers 1 to 'your number of branches' is also allowed.
     * **name**, the name of the branch.
     * **landing page**, the default website of the *Branch*. Ads bought for the *Branch* will redirect the potential customer to this landing page on clicks. If the *Branch* does not have it's own website, then you may simply use the website of the *Advertiser*
* Attributes required for GPS-based targeting
     * **latitude** and **longitude**, the gps location of the *Branch*. This is used to identify around which location potential customers can be targeted.
     * **radius**, the targeting radius around the *Branch* where potential customers can be targeted.
* Attributes required for postal code based targeting
     * **Targeting postal codes**, A list of postal codes that should be used for postal code based targeting. For the Netherlands, a postal code could be both in the PC4 (_1000_) and PC6 (_1000AA_) format.
* Optional attributes. These are not used for targeting, but can still be used as **dynamic data** in ads bought by the branch, they are therefore preferably filled in the *Advertiser's* native language:
     * **country**
     * **region**
     * **city**
     * **postal code**
     * **address line 1**
     * **address line 2**
     * **custom <1-9>**
* Once you've filled in your excel, you can reupload it into the system using the "import" button.


## Setting up Campaigns
Once you've uploaded the *Advertiser's Retail Branches* you can link them to *Campaigns* by creating a new *Campaign* of the type **Retail - GPS based** or **Retail - postal code based**. 

* Click *add Campaign* at the *Campaigns* within the *Advertiser*
* Select the total budget over all *Branches*, initially this will evenly be split over the individual *Branches*.
* For **Campaign type** select one of the *Retail* campaign types
* Select the *Retail branches* for which the *Campaign* needs to show *Ads*
* Once the *Campaign* has been created you can enter the *Campaign settings* and modify budgets for individual *Branches*

[![][advertiser-add-retail-campaign]][advertiser-add-retail-campaign]

## Linking Ads
Just like for non-Retail campaigns, you can link any *Ad* to a *Retail Campaign*. 
 

!!! note
    By default these ads refer the user to the **landing page** specified in the *Branch*, not in the *Ad*.


If you would like to use extra information about the *Branch*, like the **name** or **address**, within the *Ad*. Then you should create a **Dynamic banner**.

This is easily done by using the banner creation tool [BannerWise][bannerwise], where you can upload your *Branch information* into the system to specify where you want to use your *branch* information, and automatically import the created ads back into the adscience system.

[bannerwise]: https://bannerwise.io/

[advertiser-retail]: ../img/advertiser/advertiser-retail.png
[advertiser-add-retail-campaign]: ../img/advertiser/advertiser-add-retail-campaign.png