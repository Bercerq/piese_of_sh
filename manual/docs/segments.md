# Segments and retargeting

To target an _Advertiser’s_ website visitors a small piece of code called a _segment pixel_ needs to be present on the _Advertiser_ website.

A segment is a group of people that share some attribute. An example of a segment would be “All visitors of the adscience page”, or “all people who bought the product”.

Once the adscience _segment pixel_ has been placed on the _Advertiser’s_ website creating and targeting (or excluding) new segments is very easy.

## Step 1: Navigate to segments

Click on _segments_ tab within the specific _Advertiser_

## Step 2: Copy segment pixel

 Copy the specific _segment pixel code_ from the bottom of the page and make sure it is placed on any page where you would want to retarget its visitors.

!!! note
    The advertiser is responsible for obtaining the consent of visitors to place cookies and retarget the person (for example through a cookie consent module).

[![][advertiser-segments]][advertiser-segments]

## Step 3: Create a first segment.

At the _Segments_ tab for the specific _Advertiser_ click the _+Create segment_ button:

* A _name_ for the specific segment (For example “All visitors”)
* The _domain_ for which visitors need to be added to the segment. (In most cases the “advertiser domain”).
* Something in the _page_ URL which is specific for visitors that should belong to this segment. Some examples could be “thankyou”,“orderbasket” or “/” (in case any visitor of the website needs to be added).
* A segment could also be set up to measure conversions, for example a visitor buying a product. Which allows campaign reports to include the number of visitors that bought a product after seeing or clicking on an ad. For this the _type_ of segment needs to be set to _conversion_.
* Once a segment has been created the _active_ column will display (on mouse over) when the segment was last triggered. If the segment is not triggered even though the _segment pixel code_ was placed on the _Advertiser_ page and the _Segment_ was set up correctly, please contact [support@adscience.nl][support].

[![][advertiser-add-segment]][advertiser-add-segment]

## Step 4: Using a Segment in a Campaign

* To use a _Segment_ open the tab _Segments_ on the _Campaign settings_ of the _Campaign_.

[![][cs-segments]][cs-segments]

* Press +Add rule
* Select the _Segment_.
* Select the action “bid” to target the segment or “no bid” to exclude the segment.
* Choose how long ago the visitor came in contact with the _Segment_.  
  For example selecting the segment “All visitors”, bid and 30 minutes, will target “All visitors” who visited the advertiser domain in the past 30 minutes.  
  Whereas selecting “bought product” no bid and 4 weeks, makes sure that someone who bought a product in the past 30 days is not targeted.

[![][cs-add-segment]][cs-add-segment]

[advertiser-segments]: img/advertiser/advertiser-segments.png
[advertiser-add-segment]: img/advertiser/advertiser-add-segment.png
[cs-segments]: img/campaign-settings/cs-segments.png
[cs-add-segment]: img/campaign-settings/cs-add-segment.png
[support]: mailto:support@adscience.nl