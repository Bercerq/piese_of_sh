# Monitoring campaigns

Once you have set up and activated your first _Campaigns_ you will want to monitor their progression.

To quickly see if your _Campaigns_ are reaching their progression goals open up the _Campaigns_ tab. 

This can be done on any of the following levels:

* _Agency_
* _Advertiser_
* _Campaign group_, only if you have assigned your _Campaign_ to a _Campaign group_

The _Campaigns_ tab consists of 3 separate sections:

* _Recent campaigns_, this contains all Campaigns that have not ended yet.
* _Older campaigns_, all the campaigns that have already ended.
* _Archived campaigns_, contains all the Campaigns that are no longer useful and have been _archived_.

## Recent campaigns

In this table you can monitor the progression of your Campaigns very quickly.

[![][agency-campaigns]][agency-campaigns]

### Status

The current status of the Campaign. Possible values include:

* _Active_, the Campaign has been activated and the start and end date allow it to bid.
* _Paused_, the Campaign has not been activated – or has been deactivated – but the start and end date would allow it to bid.
* _Not scheduled_, the Campaign has not yet been activated (scheduled), but its start time is in the future.
* _Scheduled_, the Campaign has been activated (scheduled), but its start time is in the future.
* _Ended_, the end date of the Campaign has passed.
* _Archived_, the Campaign has been _Archived_.

### Ads

Shows the number of linked _Ads_ to the _Campaign_, if the number is 0, then the _Campaign_ cannot bid and you should link active _Ads_ to the _Campaign_.

### Impressions, clicks, conversions, costs
Several statistics aggregated over the selected time period.

### Budget 

The money spent compared to the budget.

* The dashed line indicates where the spent would be if the budget were spent entirely evenly over the entire _Campaign_ duration.
* The filled in portion of the bar indicates the portion of budget that was spent thus far.
* If the filled portion is behind the dashed line, then this indicates that the spent is behind the “expected” evenly spent schedule. If the filled portion exceeds the dashed line then the actual spent exceeds the expected spent.
* The color of the bar will typically indicate whether an action is required.
    * A red bar, typically means that something is wrong. The budget is likely very far behind schedule. For possible reasons you might want to check out the section ["Why is my campaign not running?"][campaign-not-running]. If the Campaign has only just started, or was started after the indicated Campaign _start time_, then nothing might be wrong but the _Campaign_ is simply still catching up.
    * An orange bar, indicates that the Campaign is slightly behind schedule. This is not necessarily a problem and you might simply want to wait to see if it improves. However if the problem persists without improvement then you might want to widen up targeting options or increase the _maximum bid price_.
    * A green bar, indicates that the Campaign is running just fine and you do not need to worry about anything.
* By hovering over the budget bar, the percentage of the current expected spent is displayed. To see whether a Campaign is improving and catching up you may want to keep track of whether this percentage is increasing or decreasing.
* If a Campaign is behind on its schedule, it will not attempt to get back on schedule right away by spending a lot at once. Instead, it will divide however much it is behind and distribute it over the entire _Campaign_ duration. This prevents inefficient bidding and overpaying to try to catch up quickly, but may have the appearance of the Campaign not being able to catch up.  If you feel like the _Campaign_ is not catching up quickly enough then you might want to consider turning on _Frontloading_ on the Campaign.

### Pacing

Shows the number of impressions the _Campaign_ has done. If the _max number impressions_ has been set within the _Campaign_, then the pacing column will behave the same way the Budget column does. In this case the number of done impressions will act as the spend, and the _max number impressions_ as the budget.

* If this is the case, then the behavior of the _budget_ column will be slightly modified. If the Campaign is limited by the set Budget in staying on track for the number of Impressions then the budget bar will be red. If the budget is however not restrictive, then the bar will be green. 

    !!! note
        Hovering over a Campaign’s name will show whatever is set under Campaign remarks within the Campaign settings. This can be used as a useful tool to monitor progress: add the date and the current % of budget or impressions to track progress. Or it can be used to communicate changes to your team or future self about the campaign.

### Pacing graphs
To get more detailed insights into the campaign progress, a graph can be opened for both the budget and pacing metrics by clicking the 'view chart'-icon next to the metrics bar.

[![][visual-pacing]][visual-pacing]

In this chart the 'spent' line shows the actual performance of the campaign in the past. For campaigns that have not finished yet, performance until the end of the campaign can be predicted based on performance of the campaign on the 1, 3, or 7 most recent days.

Additionally there is a 'goal' line, which indicates the performance required by the campaign to meet its goal. This line is based on the campaign configuration at the start of the campaign. When the campagin settings are updated, the goal line will change accordingly. The vertical lines in the graph mark changes in the campaign settings. Details of these changes will be shown when the mouse cursor is moved towards that date.

## Older campaigns

Under older _Campaigns_ you will see the _Campaigns_ that have ended. Campaigns in this section are  sorted by last ended.

* This allows you to quickly find the Campaigns that require a final report to your clients
* You can identify which Campaigns did not quite reach their goal and possibly extend their duration.
* Once you are completely done with the _Campaign_, you can choose to archive the _Campaign_. 
* In case of mistakenly archiving a _Campaign_ they can always be restored.

[![][agency-restore-campaign]][agency-restore-campaign]

[agency-campaigns]: ../img/agency/agency-campaigns.png
[agency-restore-campaign]: ../img/agency/agency-restore-campaign.png
[visual-pacing]: ../img/campaign/visual-pacing.png
[campaign-not-running]: /kb/getting-further/campaign-not-running/