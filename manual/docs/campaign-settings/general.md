# General settings

The general settings include the most coarse settings that define a _Campaign_.

## General

[![][cs-general-section]][cs-general-section]

### Name
The _Name_ of the _Campaign_

### Period

The _start_ and _end date_ (with an optional addition of time)

It also includes a number of settings which have not been set just yet:

### Delivery

The way the _Campaign_ should distribute the set budget over the chosen budget period. _Campaigns_ automatically increase and decrease the height of their bids to spend the budget as evenly as possible over the selected budget period.

* _Evenly_: the budget is distributed as evenly as possible.
* _Frontloaded_: the _Campaign_ tries to spend a little more earlier during the period, reducing the chance of under delivery of the budget if issues arise later during the period.
* _As fast as possible_: the _Campaign_ has no regard for the length of the budget period, but simply tries to spent the entire budget as fast as possible.  

    !!! note
        As fast as possible is not a recommended setting. It will usually disable machine learning optimizations and lead to a higher CPM price than needed. Using As fast as possible will not fix issues where a campaign is behind on its schedule due to a lack of available inventory; in these cases expanding the targeted inventory or the maximum allowed bid price is necessary. 

### Day parting

Allows the exclusion of bidding during days or parts of days.

### Campaign group

Allows assigning the _Campaign_ to a group of campaigns that share similarities.

### Campaign remarks

Allows you to set notes about the campaign. This can be particularly helpful to keep track of adjustments during the campaign especially if you work in a team.

* _Campaign remarks_ are also shown on “mouse over” of the campaign name in any tab that is called _Campaigns_.


## Budget

[![][cs-budget-section]][cs-budget-section]

### Campaign budget

Set for a daily, weekly, monthly period, or even the entire campaign duration. The set budget covers the media costs and any additional fees paid to adscience.

### Max bid price

While the machine learning algorithm determines the exact value of each bid, which will typically be lower than your maximum bid, limiting the maximum bid price is done here. The maximum bid price covers the cost of the media, plus any additional fees paid to adscience.

* If you’ve made a _Deal_ with an external party for a fixed deal price checking _On deals bid external floor price_ may be useful. This is especially the case if the fixed price was made in another currency than Euros where changes in currency exchange rates may drop your maximum bid price below the Deal floor price. If you use this option it is recommended to set your maximum bid price in euros high enough to cover any changes in exchange rate as well as any of the regular fees paid to adscience.
* Checking _Fixed bid price only_ instead, disables the machine learning algorithm’s ability to modify the height of bids and is therefore **not recommended**. It also does not increase the likelihood of winning campaigns; if a campaign is behind on the intended schedule, bids are already increased to the maximum bid price.

### Max impressions

Limits the campaign to a maximum number of impressions. This can either be a daily limit or a limit on the entire campaign duration.

* Just like for the budget, the setting of _Delivery_ affects how the impressions are distributed over the selected period.

## User Frequency Capping

Controls how often an ad is allowed to be served to a single viewer.

[![][cs-user-capping]][cs-user-capping]

* This can be set on number of _impressions_, _clicks_ or _conversions_
* This can be set per day, per week, per month or for the entire campaign period.
    * Multiple constraints are allowed; each constraint is respected.
    * In case the entire campaign is selected, in practice the period will be limited to e.g. 90 days due to GDPR data retention constraints.

## Commercial Agreements

[![][cs-commercial-agreements]][cs-commercial-agreements]

Allows you to set your commercial agreement with an _Advertiser_. If filled in, allows the dashboard to calculate the generated _revenue_ and _profit_ for this _Campaign_.

* Supports several payment plans, per impression (CPM), per click (CPC), per conversion (CPA) or a percentage of the total spend (Including any fees paid for the adscience system).


[segments]: /kb/segments/
[cs-general-section]: ../img/campaign-settings/cs-general-section.png
[cs-budget-section]: ../img/campaign-settings/cs-budget-section.png
[cs-commercial-agreements]: ../img/campaign-settings/cs-commercial-agreements.png
[cs-user-capping]: ../img/campaign-settings/cs-user-capping.png