# Ads

In the _Ads_ section of the _Campaign Settings_ you can link uploaded _Advertiser Ads_ to a _Campaign_. If you have not uploaded any _Ads_ for the _Advertiser_ yet click the _Upload new ads_ button. For additional notes on uploading _Ads_ see the [**Upload an ad section**][upload-ad].

[![][cs-adlinks]][cs-adlinks]


## Real time bidding

If you already have uploaded _Ads_ click the _+Link ads_ button.

[![][cs-link-ads]][cs-link-ads]

* _Selected ads_, select 1 or more _Ads_ to link to this _Campaign_
* _Landing page_, If you want to use a different _Landing page_ than the one you specified when you uploaded the _Ad_ - for example because you want to add specific UTM parameters for your Google Analytics - then you can specify the page here.
* _Deal_, if you’ve made 1 or more external _Deals_ with publishers about targeting or billing options and you would like to have these _Deals_ apply to these _Ads_, then you can link them here.  
For more information about adding _Deals_, visit the [**Deal section**][deals].
* _Start time_ and _End time_, optionally you can specify a specific _start_ or _end time_ for each _Ad_ within the _Campaign_. This is for example useful for _Campaigns_ promoting movies, where Ad1 advertises when the movie will be in theaters until that specific date, and Ad2 advertises that it is now in theaters, from that date onwards.


## Ad serving only

If you've made your _Campaign_ of the type _Adserving only_ then you will also need to create a _Tag_ within the _Campaign_. The _Tag_ acts as a link for an external party to an *Ad* within the adscience system.

A _Tag_ contains at least one, but can possibly contain multiple _Ads_, of which only a single _Ad_ is served at a time. A _Tag_ also has a default Ad, which is also used if no Ads match a particular _Viewer_.
To create a _Tag_ you have 2 options:

* Either create each _Tag_ individually by clicking "+add Tag"
* Or select "Link ads" with the option "create Tag", which creates a new individual *Tag* for each linked *Ad*

Deleting _Tags_ is not possible because they are used by external parties. Deleting the _Tag_ at the adscience side could potentially result in the external party still trying to use the _Tag_, but not receiving an Ad,  something for which you may still be charged by the external party.


###Tags with multiple ads
To add additional _Ads_ to a _Tag_ select "Link ads" and choose the option "select Tag". If a _Tag_ is used that has multiple _Ads_ then any of the Ads can possibly be served when the _Tag_ is used.

If the _Campaign_ was given targeting settings which are not satisfied by the Viewer of the *Tag*, then the selected default *Ad* is shown.


###Exporting tags

To make the _Tags_ available to the external party, click the "Export Tags" button at the top right. This will download an excel file containing all the _Tags_ of the _Campaign_.

* Each _Tag_ contains the parameter **clickTag** with a default value of **{replaceByEscapedPublisherClickTag}**, to allow the publisher to also measure clicks. you can optionally replace the value by the escaped click tag of the publisher that will run the tags.
* If you do not have an escaped publisher click tag, then you can simply leave the value at **{replaceByEscapedPublisherClickTag}**
For example if the publisher uses DoubleClick for Publishers this means that the **{replaceByEscapedPublisherClickTag}** can be replaced by the DoubleClick for Publishers macro **%%CLICK_URL_ESC%%**.

!!! Note
    Replacing **{replaceByEscapedPublisherClickTag}** by something that is not an escaped click tag can completely break the *Tag*, if you are not sure whether you've correctly replaced the macro, please contact support.
               
 

[cs-adlinks]: ../img/campaign-settings/cs-adlinks.png
[cs-edit-adlink]: ../img/campaign-settings/cs-edit-adlink.png
[cs-link-ads]: ../img/campaign-settings/cs-link-ads.png
[upload-ad]: /kb/getting-started/upload-ad/
[deals]: /kb/deals/