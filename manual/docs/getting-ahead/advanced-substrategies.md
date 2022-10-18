# Advanced substrategy ideas

In most cases where you need to set up a complex targeting scenario, Substrategies are the easiest way to set it up. Below we have listed a few of these scenarios:

## Using different Ad sets. 
If you would like to use different Ads or different sets of Ads within a specific *Campaign* where each Ad (set) gets a specific part of the budget.

* For each set a substrategy is created. 
* By adding a "required for bid" rule on the attribute Ad and selecting each of the intended ads, a substrategy bidding only for that set of Ads is created.
* Using the *Substrategy's* percentage, you can control how often a specific Ad (set) is shown.

## Using different Ad sets for different attributes.
The previous scenario can further be expanded to dedicate specific Ad (sets) to specific geographic regions, websites, or any other targeting attribute you may wish to use.

* Create a *Substrategy* as described above
* Add an additional "required for bid" rule on an additional attribute, for example "Region" to match a specific region to a specific Ad (set)
* This makes sure that the *Substrategy* only bids for that region with the chosen ads.

    !!! note
        For geographic targeting around a potentially large number of stores the ORTEC | adscience system contains the Retail module (MAKE LINK), which is designed for the specific purpose of showing different ads for specific areas.

## Performance versus cost management.

In some cases you might have your inventory grouped in different sets of comparable quality. 

* One set is high in quality, but costly. 
* Another is lower in quality, but cheaper.

Ideally, you may want to balance between the two, to get overal performance for a reasonable cost. By using substrategies you can easily reevaluate and adjust the percentage of both sets while the *Campaign* is running.

* If the *Campaign* is not performing well enough, then you can increase the amount of high quality inventory.
* If the *Campaign* is overperforming at the cost of margin, then you might want to decreate the amount of high quality inventory.

## Story telling

If you're interested in showing your viewers specific ads based on which ads they have seen before then *Substrategies* can be very useful.

* Create a *Substrategy* for each specific *Ad*
* Add a "required for bid" *Ad* rule for each *Substrategy*
* Add a "required for bid **User interaction** rule set to **impressions**
    * Choose how much time may have passed since the viewer saw the **impressions**
    * Choose how many **impressions** the viewer must have seen before seeing this ad.
* Add a "no bid" **User interaction** rule set to **impressions**, where you choose from how many **Impressions** the viewer is not allowed to be targeted anymore

For example:
A campaign may be created with 3 *Substrategies*

* Substrategy 1, has some linked Ad which introduces the viewer to a problem.
     * It has a "required for bid" **User interaction** rule set to 0 impressions
     * It has a "no bid" **User interaction** rule set to 1 impressions.
     * It will therefore only target people who have not seen any ads.
* Substrategy 2, has a different Ad which shows the viewer a solution to the problem (the Advertiser's product).
     * It has a "required for bid" **User interaction** rule set to 1 impressions
     * It has a "no bid" **User interaction** rule set to 4 impressions.
     * it will therefore only target people who have seen 1, 2 or 3 ads.
     * Since it can only target people who have already seen an ad, this also means that they must have seen the first Ad already.
* Substrategy 3, has a final Ad which shows the viewer satisfied customers of Advertiser's products.
     * It has a "required for bid" **User interaction** rule set to 4 impressions.
     * It has no "no bid" **User interaction** rule
     * As it can only target people who have seen 4 ads, this means that it must target people who have seen the first ad once and the second ad 3 times.
     * it will not stop targeting them up until the *Campaign* user frequency cap.