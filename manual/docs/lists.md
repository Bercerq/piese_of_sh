# Lists

To make it easier to repeat common settings, adscience provides _List_ functionality.

For several attributes like domain, application name and custom attributes - that are possibly available to your account - _Lists_ can be defined

## Create a List

A List can be created in 2 ways:

* The _List_ is predefined from the _Lists_ option in the side bar
* The _List_ is created from an existing targeting rule in a campaign, which should be used in another campaign.

## Using Lists

* In the _Campaign Settings_ of a _Campaign_, _Lists_ can be added to targeting rules related to the attribute the _List_ contains (For a targeting rule related to _domains_, a _List_ of the _domain_ attribute can be used)

[![][lists-create-rule]][lists-create-rule]

* Alternatively they can be used in the _Advanced rules_ section of the _Campaign settings_ where  _Lists_ can be used for the attributes that are followed by “(lists)” for example domain (lists).

## Editing Lists

Depending on your _User_ level and the access level at which a _List_ was created you may be able to

* Only use the _List_ in targeting rules (your _User_ level is lower than the level it was created on)
* Use, edit and delete the _List_

To edit a List

* click _Lists_ in the left side bar
* Select the attribute in the top right that the _List_ belongs to (for example _domain_)
* Check whether you indeed have _write_ access in the row of the list
    * If you do have write access to the _List_ you can now edit the List. **Editing the List affects every campaign that the List is attached to. You can check which campaigns are affected under #active campaigns and #inactive campaigns.** 
    * If you do **not** have _write_ access you cannot edit the _List_, you can however make a copy of the _List_ and add or remove any of the values that you would like to have changed. You will then need to link the new _List_ to Campaigns that you would like to use the _List_.

[![][lists-table]][lists-table]

### List in campaign settings

Creating a List in the campaign settings can be done in the following way:

* If a targeting rule attribute supports being turned into a list, then simply select the option _Create list like this_

This opens up a pop up where the following information needs to be specified:

* The _name_ of the list
* (Optional) a _description_ of the list
* The access _level_ of the list
    * The list may be made available to the entire _Agency_
    * Or only to a specific _Advertiser_

[![][cs-create-list-level]][cs-create-list-level]

[![][cs-create-list]][cs-create-list]

* The values that are contained in the list
    * These can either be typed in directly into the input field, where the auto complete function will help you find values that are recognized by the system
    * The _edit as text_ can be used to copy and paste a list of values from for example an existing excel file.

[![][cs-edit-as-text]][cs-edit-as-text]


### List section in the sidebar

Creating a _List_ from the _List section_ is done in the following way

* At the top right select the attribute you want to create a _List_ for (for example _domain_ or _application name_)
* Click _+Add_ next to it

[![][lists-select-attribute]][lists-select-attribute]

In the pop up the following information needs to be specified:

* The _name_ of the list
* (Optional) a _description_ of the list
* The access _level_ of the list
    * The list may be made available to the entire _Agency_
    * Or only to a specific _Advertiser_

[![][cs-create-list-level]][cs-create-list-level]

[![][cs-create-list]][cs-create-list]

* The values that are contained in the list
    * These can either be typed in directly into the input field, where the auto complete function will help you find values that are recognized by the system
    * The _edit as text_ can be used to copy and paste a list of values from for example an existing excel file.

[![][cs-edit-as-text]][cs-edit-as-text]

[lists-create-rule]: img/lists/lists-create-rule.png
[lists-table]: img/lists/lists-table.png
[cs-create-list]: img/lists/cs-create-list.png
[cs-edit-as-text]: img/lists/cs-edit-as-text.png
[cs-create-list-level]: img/lists/cs-create-list-level.png
[lists-select-attribute]: img/lists/lists-select-attribute.png