# Substrategies and AB testing

When running campaigns you may frequently run into problems where you want to use or test small variations of a _Campaign_.

For example:

* You're running a campaign that targets people on desktop web
* Within a specific city
* Between 9 and 5 
* With a specific set of ads.
* For a total campaign budget of 10.000 euros

You also suspect that the targeted audience of the _Advertiser_ is interested in **business**, **sports** and **food** and you've made three domain white _Lists_, each corresponding to one of these interests.

##Using a single campaign

The easiest option is to simply make a single _Campaign_ that targets each of the _Lists_. 

By setting it up as a single campaign means that the machine learning algorithm will determine how well each domain performs for the campaign and that it will target the domains that perform better.

This however also means that you have no choice but to accept the outcome; if the algorithm decides that there is only a single domain that is optimal, then it will ignore the others and there is little you can do there.

##Using multiple campaigns
If you would therefore like to have more control over how the budget is divided over each of the three interest _Lists_, another option would be to duplicate the original campaign three times and assign each duplicate campaign a budget and a single interest list.

This however has some downsides:

* If you now want to make any generic changes to the targeting of the campaign, for example, to bid from 9 to 6 rather than from 9 to 5. Then you will have to repeat this change three times for each of the duplicates.
* If it turns out that 1 of the 3 interest lists has very little inventory available and it is simply impossible to spend the intended budget, then you will have to make manual adjustments to distribute this budget to the other duplicate campaigns.
* With just three variations this might still be managable, but issues rapidly become worse with more variations.

Luckily there is another option:

## Substrategies
_Substrategies_ are created within a _Campaign_ and act like mini-campaigns that follow all the targeting settings of the _Campaign_. 

For each _Substrategy_ additional targeting rules on top of the _Campaign_ settings can be specified, plus an intended percentage of the total campaign budget that it is supposed to spend.

Using *Substrategies* has a number of advantages:

* You only have to specify the "generic" settings once within the _Campaign_, and any subsequent updates to them automatically affect all *Substrategies* linked to the *Campaign*
* In case you later decide to give one strategy a larger or smaller portion of the budget, redistributing budget is very easy. Simply adjust the percentage assigned to the _Substrategy_ without having to think how this affects the total campaign budget.
* You have the option to choose what should happen in case a _Substrategy_ is not able to spend its designated part of the budget in case its inventory is too limited. Either the unspent budget is automatically redistributed over the other substrategies, or it is not spent at all.

    !!! note
        If your _Campaign_ has a total impressions limit, then this is limit is also divided over the _Substrategies_ using the assigned percentage. Just like for _Campaigns_, both constraints are always respected and neither will be broken.


## How to set up Substrategies
_Substrategies_ are created within the _campaign settings_ at the tab _substrategies_. 

* You can start by creating at least 2 substrategies.
* Each _Substrategy_ should at least have a name and a dedicated percentage of the budget 
* Typically each _Substrategy_ is assigned at least 1 "required for bid" rule, which sets it apart from the other _Substrategies_
    * In the case of our example, we would use a **domain (List)** "required for bid" rule with as a chosen value one of the three interest _Lists_, forcing the _Substrategy_ to only bid on domains on this _List_

For more information how to create Substrategies check the [Campaign settings ][settings-substrategies] section.

For additional ideas about what to do with Substrategies check [Advanced substrategy ideas][ideas-substrategies].

[settings-substrategies]: /kb/campaign-settings/substrategies/
[ideas-substrategies]: /kb/getting-ahead/advanced-substrategies/



