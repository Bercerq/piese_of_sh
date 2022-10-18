import * as React from "react";
import { useHistory } from "react-router-dom";
import * as Api from "../../../client/Api";
import AsyncSelect from "react-select/async";
import { components } from "react-select";
import { GroupOption, SelectOption } from "../../../client/schemas";
import FontIcon from "../../UI/FontIcon";

const getSearchOptions = (results): GroupOption[] => {
  const searchOptions = results.filter((o) => { return o.entries.length > 0 });
  const optionTypes = optionTypeMap();
  const groupLabels = groupLabelMap();
  return searchOptions.map((group) => {
    const options = group.entries.map((entry) => {
      return { value: entry.id, label: entry.name, type: optionTypes[group.level] };
    });
    return {
      label: groupLabels[group.level],
      options
    };
  });
}

const optionTypeMap = () => {
  return {
    Organization: "organization",
    Agency: "agency",
    Advertiser: "advertiser",
    CampaignGroup: "campaigngroup",
    Campaign: "campaign"
  };
}

const groupLabelMap = () => {
  return {
    Organization: "Organizations",
    Agency: "Agencies",
    Advertiser: "Advertisers",
    CampaignGroup: "Campaign groups",
    Campaign: "Campaigns"
  };
}

const DropdownIndicator = props => {
  return (
    components.DropdownIndicator && (
      <components.DropdownIndicator {...props}>
        <FontIcon name="search" />
      </components.DropdownIndicator>
    )
  );
};

const Search = () => {
  let history = useHistory();

  const handleChange = (selected: SelectOption) => {
    history.push(`/settings/${selected.type}/${selected.value}`);
  }

  const searchOptions = async (inputValue) => {
    try {
      const results = await Api.Get({ path: "/api/names/search", qs: { search: inputValue } });
      return getSearchOptions(results);
    } catch (err) {
      return [];
    }
  }

  return <AsyncSelect
    inputId="react-select-search-entities"
    className="react-search-select-container"
    classNamePrefix="react-search-select"
    components={{ DropdownIndicator }}
    placeholder="Search..."
    noOptionsMessage={({ inputValue }) => { return "No results found"; }}
    controlShouldRenderValue={false}
    cacheOptions
    loadOptions={searchOptions}
    onChange={handleChange}
  />
}

export default Search;