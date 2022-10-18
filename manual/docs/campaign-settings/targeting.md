# Targeting

The targeting tab within the _Campaign Settings_ allows you to set who you would like to target.

[![][cs-targeting]][cs-targeting]

## Inventory Type and positioning

* _Device_, The device types that are allowed to be targeted:
    * _Phone_
    * _Tablet_
    * _Desktop_ (also includes Laptops)
    * _Set Top Box_ (**only available for Video Campaigns**)
    * _Connected TV_ (**only available for Video Campaigns**)
    * _Unknown_, this could possibly include any of the device types above
* _Inventory type_, a deeper specification of the _device type_
    * _Mobile web_, includes websites visited on _Tablet_ or _Phone_
    * _Mobile inApp_, includes apps visited on _Tablet_ or _Phone_
    * _Desktop web_, includes websites visited on Desktop
    * _Desktop inApp_, includes apps visited on Desktop (like Skype), Set Top Box or Connected TV
* _Position_
    * _Above the Fold_, above the line where no scrolling is necessary to see the ad
    * _Below the Fold_, below the line where scrolling is necessary to see the ad
    * _Not Specified_, the attribute is not specified and we cannot know the position where it is placed

[![][cs-inventory-type]][cs-inventory-type]

## Video Targeting (only available for Video Campaigns)

* _Video Player Size_
    * _Small_, the video player has a width of less than 300 pixels
    * _Medium_, the video player has a width of 301 to 600 pixels
    * _Large_, the video player has a width of more than 600 pixels
    * _Not specified_, the video player size was not stated.
* _User Initiation Type_, specifies what action a user needs to take to start playing the video ad
    * _User initiated_, the user has to take some action before the ad is started
    * _User click_, the user has to perform a click to start the ad.
    * _Auto initiated_, the video ad automatically starts playing without user interaction
    * _Mixed_, a combination of the above options
    * _Not specified_, the user imitation type was not stated.

[![][cs-video-targeting]][cs-video-targeting]

## Geo targeting

By setting up geo targeting you can limit where people are reached

* _Country_
* _Region_
* _City_
    * _City_ also allows the option to target in a radius around the specified cities.

In case both _regions_ and _cities_ are specified, the targeting is on everybody that falls in one of the regions or in one of the cities. In case a _country_ is selected, and _cities_ or _regions_ that are not inside the _country_ are selected, these _cities_ and _regions_ are seen as mistakes and are not actually targeted. In this case, only _cities_ and _regions_ inside the selected _countries_ are targeted.

For more advanced geo targeting – for example gps based, see the [**Advanced Rules section**][advanced-rules] of the _Campaign Settings_.

[![][cs-geotargeting]][cs-geotargeting]

## Browser

Limits viewers only to certain type of browsers. 

!!! note
    in App users are listed as the browsers _Mobile InApp_ and _Desktop InApp_

## Operating System
Limits viewers only to certain types of _Operating Systems_

## Language
Limits viewers to only browsers and apps set to a specific _Language_

[cs-targeting]: ../img/campaign-settings/cs-targeting.png
[cs-video-targeting]: ../img/campaign-settings/cs-video-targeting.png
[cs-inventory-type]: ../img/campaign-settings/cs-inventory-type.png
[cs-geotargeting]: ../img/campaign-settings/cs-geotargeting.png
[advanced-rules]: /kb/campaign-settings/advanced-rules/