# Advanced rules

In cases where the normal targeting settings may not be enough to get the targeting you would like, the advanced rules step in.

[![][cs-advanced-rules]][cs-advanced-rules]

The advanced rules typically have 5 types of _actions_

* _Required for bid_, any of the specified attributes for the rule needs to be present in order for the _Campaign_ to bid. In case the same condition is present multiple times (e.g. two domain rules), the rules will be merged to make all listed values work (e.g. all specified domains are targeted).
* _No bid_, if any of the specified values for the rule is present, then the _Campaign_ will not bid.
* _Restrict bid range_, if any of the specified values is present, then the _Campaign_ will bid with a reduced bid value
* _Increase bid_, if any of the specified values is present, then the _Campaign_ will bid the set percentage higher.  


!!! note 
    This will still respect any maximum bid values set and not increase those.
* _Decrease bid_, if any of the specified values is present, then the _Campaign_ will bid the set percentage lower.

## Attributes

Rules can be created for any of the following attributes:

### Geo

* _City distance_. Anyone within a set radius of any of the specified cities.
* _Region_. Anyone in any of the specified Regions.
* _Country_. Anyone in any of the specified countries.
* _GPS location_. Anyone within a set radius of the given GPS coordinates. Cell phone GPS, or approximated location.
* _GPS location (hyper local)_. Anyone within a set radius of the given GPS coordinates. Cell phone GPS only.

[![][cs-city-rule]][cs-city-rule]

### User targeting

* _IP Address_. Matches the exact IP address to for example exclude the Advertiser itself from being targeted by its retargeting campaigns.
* _Segment rule_. Matches visitors of the segment in the past **X** days.
* _User interaction_. Matches previous campaign interaction with the visitor.  
    * Number of impressions the viewer has seen
    * Number of clicks the viewer has done
    * Number of conversions the viewer has done
  
    The time period needs to be specified in which this has happened, and the minimum number of events of the type that have happened within the period.  

    For example, to exclude people who have clicked on the ad in the past hour, select: _No Bid_, _Last X time_, 1 _hour_ and _Clicks_.

[![][cs-user-interaction]][cs-user-interaction]

### Device

* _Browser_
* _Device Type_
* _Operating System_

### Ad Selection

* _Ad_, only if a specific Ad is played, do something. Is often used in combination with **Substrategies** to only display specific ads in specific circumstances. See [**Substrategies**][sub-strategies] for more information. 

### Exchanges

* _SSP_, the _Supply Side Platform_ where the _Campaign_ is bidding

### Time

* _Day of Week_
* _Hour_
* _Day of week + Hour_

### Inventory

* _Application name_
* _Application name (Lists)_, uses pre-defined _Lists_ of Application names, see the [**Lists section**][lists] for more information.
* _Domain_
* _Domain (Lists)_, uses pre-defined Lists of Domains, see the [**Lists section**][lists] for more information.
* _Inventory type_, the type of the inventory, values include
    * _Desktop Web_
    * _Desktop inApp_
    * _Mobile Web_
    * _Mobile inApp_
* _Keyword targeting (domain)_, matches if the domain contains any of the specified values
* _Keyword targeting (URL)_, matches if the full page URL contains any of the specified values.
* _Language_, matches if the browser (or device) language has been set to any of the specified values.
* _Top level domain_. For example .com or .net.
* _User initiated_. Video only. The user interaction required for the video to play.
* _Video player size_. Video only. The size of the video player.








[cs-advanced-rules]: ../img/campaign-settings/cs-advanced-rules.png
[cs-user-interaction]: ../img/campaign-settings/cs-user-interaction.png
[cs-city-rule]: ../img/campaign-settings/cs-city-rule.png
[lists]: /kb/lists/
[sub-strategies]: ../getting-ahead/substrategies/