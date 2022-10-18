# Uploading an ad

In the adscience system _Ads_ belong to Advertisers and can be used by _Campaigns_ by linking _Ads_ to them.

## Step 1: Set up an advertiser

If this has not been done yet, the first step when when uploading an _Ad_ is [setting up an _Advertiser_][setup-advertiser]

[setup-advertiser]: /kb/getting-started/setup-advertiser/

## Step 2: Create the ad

Navigate to the _Ads_ tab of the specific _Advertiser_ and select +Create Ad which opens a number of options for the Ad type

[![][advertiser-ads]][advertiser-ads]

* [**Banner**][banner] - Used if you have image files (.png, .gif, jpg) or HTML creatives for which you want Adscience to do the ad serving.
* [**Video**][video] - Used if you have video files, for which you want Adscience to do the ad serving.
* [**Third party creative**][third-party-creative] - Used if you have a (banner) creative tag hosted in an external system.
* [**VAST**][vast] - Used if you have a (video) VAST tag hosted in an external system.

### Banner

[![][advertiser-add-banner]][advertiser-add-banner]

* Select (or drag and drop) a folder or zip containing your ads into the _+Create ad_ section.
* This opens up previews to the uploaded Ads
* If you want to use the _Ad_ in a Campaign then the option “Submit to ad exchanges” should be checked
* Before an _Ad_ can be used, it requires approval from the AdScience team, for this the “request approval immediately” should be checked.
* To set where a user ends up after clicking the ads a url of the landing page needs to be set (for example https://www.example.com).

<!-- For more information about HTML creatives or trouble shooting visit the Creating HTML banners section //TODO -->

### Video

[![][advertiser-add-video]][advertiser-add-video]

* Only a single video file with a maximum size of 200 MB can be uploaded at a time.
* Typically video lengths of more than 30 seconds are discouraged.
* The video is transcoded by the ORTEC|adscience system to various formats of different quality levels to minimize incompatibility with many different viewers.
* To set where a user ends up after clicking the video a url of the landing page needs to be set (for example https://www.example.com).

### Third Party Creative

[![][advertiser-add-thirdparty]][advertiser-add-thirdparty]

If you have a Third Party Creative hosted in an external system that you would like to use within the ORTEC|adscience system.

* Paste the javascript or HTML tag into our system
* Set the _width_ and _height_ of the creative correctly
* Make sure to use _cachebuster_ and click tag _macros_ that belong to our system to make sure that the creative works properly and that click tracking is possible.
* Adscience macros are always contained in curly brackets like {this}.
* **{CACHEBUSTER}** for cache busting
* **{clickTag}** for the click tag.
* If you are unsure whether you’ve done things correctly contact [support@adscience.nl][support] for any help or validation.

### VAST

[![][advertiser-add-vast]][advertiser-add-vast]

If you have a video hosted by another party
* Paste a URL to the VAST tag into the tag section
    * Make sure to use the Adscience cache busting macro {CACHEBUSTER} if necessary
* Or paste a full VAST tag into the tag section

## Step 3: Link the ad

Link the Ad to 1 or more campaigns of the Advertiser.

* If you do not know how to create a Campaign yet, please follow [this link][setup-campaign]
* In the _Campaign Settings_ on the _Ads_ tab, select _+Link ads_ and select the freshly uploaded Ads, for more details please follow [this link][link-ads]


[advertiser-ads]: ../img/advertiser/advertiser-ads.png
[advertiser-add-banner]: ../img/advertiser/advertiser-add-banner.png
[advertiser-add-video]: ../img/advertiser/advertiser-add-video.png
[advertiser-add-thirdparty]: ../img/advertiser/advertiser-add-thirdparty.png
[advertiser-add-vast]: ../img/advertiser/advertiser-add-vast.png
[support]: mailto:support@adscience.nl
[banner]: #banner
[video]: #video
[third-party-creative]: #third-party-creative
[vast]: #vast
[setup-campaign]: /kb/getting-started/setup-campaign/
[link-ads]: /kb/getting-started/setup-campaign/#step-4-adding-ads-and-activating-the-campaign