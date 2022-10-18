# Sub-strategies

To offer both flexible AB testing as well as reusability of most _Campaign settings_ the adscience system offers something called _Sub-strategies_. Sub-strategies allow you to allocate a percentage of the budget and - if set - the maximum number of impressions.

For more information about when to use *Substrategies* you can check the [Advanced Substrategy section][AdvancedSubstrategy]

## Creating a Sub-strategy

* To create a _sub-strategy_, click the +Create sub-strategies button
* This opens up 2 new sub-strategies.
    * For each you can specify a name
    * And a percentage of the budget and - if set - the maximum number of impressions.  

    !!! note
            The percentages do not have to sum up to 100%, if they sum up to some other number, then they will be used as _weights_ rather than as percentages. 

            **For example:** 

            * A _Campaign_ has 2 strategies: 
            * Strategy A is assigned 10% of the budget
            * Strategy B is assigned 10% of the budget
            * This effectively means that both strategies get 50% of the campaign budget. 

            This also means that the entire budget will be spent, and not just 20% of it. If the total percentage exceeds 100%, then the same thing will happen, as the campaign budget will be respected.  

* Each strategy should be assigned 1 _splitting_ targeting rule which makes the strategy "different". Typically all sub-strategies will have at least 1 targeting rule of the same attribute.
    * For example each sub-strategy has a targeting rule _required for bid, domain_. Where strategy 1, targets a number of domains related to sports, and strategy 2, targets a number of domains related to finance.
    * Initially both strategies get equal parts of the budget (50%)
    * However after studying the results, it turns out that the "sports strategy" performs much better. 
    * The sports strategy is therefore given a larger portion of the budget by increasing the set percentage.
* In addition, it may be interesting to add _Ads_ specifically for each _Sub-strategy_, this can be accomplished by creating a _required for bid_ rule on the attribute _Ad_ (in addition any other _splitting_ targeting rules). This can for example be used to do story telling, by combining rules based on the number of User interactions (impressions) with certain Ads.

[![][cs-substrategies]][cs-substrategies]

## Sub-strategy options

* _A/B testing (distribute users using percentages)_, if you want to run a scientific A/B test, then using this option might be useful. Each potential _Viewer_ is pre-assigned to a sub-strategy, which makes it impossible for other sub-strategies to target that _Viewer_. This prevents contamination within your results where 1 sub-strategy first "warms up" a _Viewer_ by serving a number of _Ads_ to him and then strategy 2 comes in and swoops in the viewer with a _click_ and follow up _conversion_.  

    !!! note
        by selecting this option, you limit the number of viewers each strategy can target, it is therefore typically not recommended.  

* _Do not redistribute unspent budget between sub-strategies_, quite often when distributing the budget between strategies it happens that 1 strategy targets a very specific group for which it is not possible to spend the entire budget, given within the _Campaign's_ targeting parameters. In these cases the default behavior is to redistribute the unspent budget by this _sub-strategy_ back into the campaign, allowing other _sub-strategies_ to try to spend it. To prevent this behavior check this option.

[![][cs-substrategies-options]][cs-substrategies-options]

[cs-substrategies]: ../img/campaign-settings/cs-substrategies.png
[cs-substrategies-options]: ../img/campaign-settings/cs-substrategies-options.png
[AdvancedSubstrategy]: ../../getting-ahead/advanced-substrategies/