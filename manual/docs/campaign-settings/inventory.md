# Inventory

[![][cs-inventory]][cs-inventory]

## Exchanges and Publishers

Select the _exchanges_ and _publishers_ where you would like to bid. By default all connected _exchanges_ and _publishers_ are used. Note that the connected exchanges and publishers are different for _Video_ and _Display_ Campaigns

## Deals
Here you can select external [**Deals**][deals] that should be linked to the Campaign. If no Deals are selected, then the Campaign will bid exclusively on open auctions. 

If any deal is selected, then the Campaign will bid exclusively on the selected deals.

!!! note
     To bid both on deals and on the open auction, select the option "open auction" from your list of available Deals. 

## Domain

By selecting _+Create Rule From_ either _white_ - (for targeting) or _black_ - (for exclusion) _Lists_ can be created.

* By using the option _Existing lists_, a _List_ that was previously defined can be used. For more information see the [**Lists section**][lists].
* By using the option _Values_, any new values can be typed in. In addition it is possible to paste in a list, for example from excel, by selecting _edit as text_. If you would like to make the _List_ available to be used in other places then you can choose to select the option _Create list like this_. For more information on using Lists see the [**Lists section**][lists].

It is possible to create multiple rules for _Domain_, where each can have a different _action_

* _Bid_, this makes the rule a _targeting rule_
* _Bid no more than_, this makes the rule a _targeting rule_, but restricts the _maximum bid price_ to the set amount.
* _No bid_, makes the rule an _exclusion rule_, which prevents targeting the domains

!!! note
    Domain is primarily Website based. To target Applications use the [Application name section][application-name]

## Domain category

Rather than selecting _Domains_ directly, selecting _Domain Categories_ is also possible. Note, not every  domain is categorized, which in some cases may not lead to the desired result.

## Top level domain

Target or exclude _top level domains_ like .com or .net.

## Channel

Target specific buying channels within sales houses like _JustPremium_.

## Application Name

The _application_ counter part of the _website_ based _Domain_.

* By using the option _Existing lists_, a _List_ that was previously defined can be used. For more information see the [**Lists section**][lists].
* By using the option _Values_, any new values can be typed in. In addition it is possible to paste in a list, for example from excel, by selecting _edit as text_. If you would like to make the _List_ available to be used in other places then you can choose to select the option _Create list like this_. For more information on using Lists see the [**Lists section**][lists].

[cs-inventory]: ../img/campaign-settings/cs-inventory.png
[deals]: /kb/deals/
[lists]: /kb/lists/
[application-name]: #application-name