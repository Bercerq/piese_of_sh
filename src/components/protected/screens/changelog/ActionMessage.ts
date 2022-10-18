import moment from "moment";

export const ActionMessage = (record): string => {
  switch (record.tableName) {
    case "TargetingRules": return TargetingRulesMessage(record);
    case "Banners": return BannersMessage(record);
    case "Campaigns": return CampaignMessages(record);
    case "OptimizationStrategies": return OptimizationStrategiesMessages(record);
    case "CampaignSegments": return CampaignSegmentsMessages(record);
    case "Segments": return CampaignSegmentsMessages(record);//both tablenames are used
    case "Constraints": return ConstraintsMessages(record);
    case "Qualifications": return QualificationsMessages(record);
    case "AttributeValueLists": return AttributeValueListsMessages(record);
    case "Deals": return DealsMessages(record);
  }
  return "";
}

const TargetingRulesMessage = (record): string => {
  switch (record.type) {
    case "create": return ruleActionMessage(record, "created");
    case "update": return ruleActionMessage(record, "updated");
    case "delete": return ruleActionMessage(record, "deleted");
  }
  return "";
}

const BannersMessage = (record): string => {
  switch (record.type) {
    case "create": return actionMessage(record, 'Ad', 'created');
    case "delete": return actionMessage(record, 'Ad', 'deleted');
    case "field_changed": return bannerFieldChange(record);
    case "field_set": return bannerFieldSet(record);
  }
  return "";
}

const CampaignMessages = (record): string => {
  switch (record.type) {
    case "create": return actionMessage(record, 'Campaign', 'created');
    case "delete": return actionMessage(record, 'Campaign', 'archived');
    case "restore": return actionMessage(record, 'Campaign', 'restored');
    case "field_set": return fieldSet(record, 'campaign');
    case "field_unset": return fieldUnset(record, 'campaign');
    case "field_changed": return fieldChanged(record, 'campaign');
    case "activate": return 'Campaign activated';
    case "deactivate": return 'Campaign deactivated';
  }
  return "";
};

const OptimizationStrategiesMessages = (record): string => {
  switch (record.type) {
    case "create": return strategyActionMessage(record, "created");
    case "update": return strategyActionMessage(record, "updated");
    case "delete": return strategyActionMessage(record, "deleted");
  }
  return "";
};

const CampaignSegmentsMessages = (record): string => {
  switch (record.type) {
    case "create": return actionMessage(record, 'Segment', 'created');
    case "delete": return actionMessage(record, 'Segment', 'deleted');
    case "field_set": return fieldSet(record, 'segment');
    case "field_unset": return fieldUnset(record, 'segment');
    case "field_changed": return fieldChanged(record, 'segment');
  }
  return "";
};

const ConstraintsMessages = (record): string => {
  switch (record.type) {
    case "field_set": return fieldSet(record, 'constraint');
    case "field_unset": return fieldUnset(record, 'constraint');
    case "field_changed": return fieldChanged(record, 'constraint');
  }
  return "";
};

const QualificationsMessages = (record): string => {
  switch (record.type) {
    case "field_set": return fieldSet(record, 'qualification');
    case "field_changed": return fieldChanged(record, 'qualification');
  }
  return "";
};

const AttributeValueListsMessages = (record): string => {
  switch (record.type) {
    case "create": return actionMessage(record, 'List', 'created');
    case "update": return actionMessage(record, 'List', 'updated');
    case "delete": return actionMessage(record, 'List', 'deleted');
  }
  return "";
};

const DealsMessages = (record): string => {
  switch (record.type) {
    case "create": return actionMessage(record, 'Deal', 'created');
    case "update": return actionMessage(record, 'Deal', 'updated');
    case "delete": return actionMessage(record, 'Deal', 'deleted');
  }
  return "";
};

const ruleActionMessage = (record, typeMsg) => {
  const rules = {
    entity: {
      "-1": "Advanced rule",
      "-2": "Rule",
      other: "Substrategy rule"
    },
    attribute: "for attribute"
  };

  let msgs = [];
  if (record.data.optimizationStrategyId == -10) {
    return '';
  } else {
    msgs.push(record.data.optimizationStrategyId == -1 || record.data.optimizationStrategyId == -2 ? rules.entity[record.data.optimizationStrategyId] : rules.entity.other);
    msgs.push(rules.attribute);
    msgs.push(record.data.attributeName);
    msgs.push(typeMsg);
  }
  return msgs.join(' ');
}

const actionMessage = (record, entity, type) => {
  let msgs = [];
  msgs.push(entity);
  msgs.push(record.objectName);
  msgs.push(type);
  return msgs.join(' ');
}

const strategyActionMessage = (item, type) => {
  const msgs = [];
  msgs.push('Strategy');
  msgs.push(item.objectName);
  msgs.push(type);
  msgs.push('applying to');
  msgs.push(item.data.percentage);
  msgs.push('% of remaining bids');
  return msgs.join(' ');
}


const bannerFieldChange = (record) => {
  let field_changed = '';
  if (record.data.name == 'approved') field_changed = record.data.value == "0" ? "rejected" : "approved";
  else if (record.data.name == 'active') field_changed = record.data.value == "0" ? "activated" : "deactivated";
  else if (record.data.name == 'tag') {
    if (typeof record.data.oldValue !== "undefined") {
      field_changed = "field " + record.data.name + " changed from " + record.data.oldValue + " to " + record.data.value;
    } else field_changed = "field " + record.data.name + " changed to " + record.data.value;
  }
  else {
    if (typeof record.data.oldValue !== "undefined") {
      field_changed = "field " + record.data.name + " changed from " + record.data.oldValue + " to " + record.data.value;
    } else field_changed = "field " + record.data.name + " changed to " + record.data.value;
  }
  return actionMessage(record, 'Ad', field_changed);
}

const bannerFieldSet = (record) => {
  let field_set = '';
  if (record.data.name == 'approved') field_set = record.data.value == "0" ? "rejected" : "approved";
  else if (record.data.name == 'active') field_set = record.data.value == "0" ? "activated" : "deactivated";
  else if (record.data.name == 'tag') field_set = "field " + record.data.name + " set to " + record.data.value;
  else field_set = "field " + record.data.name + " set to " + record.data.value;
  return actionMessage(record, 'Ad', field_set);
}

const fieldSet = (record, entity) => {
  const property = getPropName(record['data'].name);
  const newValue = checkProperty[entity](record['data'].name, record['data'].value); // check for possible conversion of value     
  const field_set = property + ' is set to ' + newValue;
  return actionMessage(record, entity, field_set);
}

const fieldUnset = (item, entity) => {
  let field_unset = '';
  const property = getPropName(item['data'].name);
  if (item['data'].oldValue === undefined) field_unset = property + ' was unset';
  const oldValue = checkProperty[entity](item['data'].name, item['data'].oldValue);
  field_unset = property + ' with value ' + oldValue + ' was unset';
  return actionMessage(item, entity, field_unset);
}

const fieldChanged = (item, entity) => {
  const property = getPropName(item['data'].name);
  const newValue = checkProperty[entity](item['data'].name, item['data'].value);
  const oldValue = checkProperty[entity](item['data'].name, item['data'].oldValue);
  const field_changed = property + ' changed from ' + oldValue + ' to ' + newValue;
  return actionMessage(item, entity, field_changed)
}

const revenueType = {
  1: 'CPM',
  2: 'CPC',
  3: 'CPA',
  4: 'Percentage of Ad spent'
};

const bannerType = {
  1: 'Image',
  3: 'Flash',
  4: 'HTML5',
  5: 'Video',
  6: 'VAST',
  7: 'VAST'
};

const pixelType = {
  8: 'Conversion',
  9: 'Subscription Page',
  10: 'Ad Retargeting',
  11: 'Home Page',
  12: 'Landing Page',
  13: 'Site Retargeting'
};

var optMetric = {
  0: 'impressions',
  1: 'clicks',
  2: 'conversions',
  3: 'completion cost',
  4: 'viewable impressions',
};


const checkProperty = {
  campaign: function (property, value) {
    switch (property) {
      case 'mediaAgencyRevenueModel':
      case 'revenueType':
        value = revenueType[value];
        break;
      case 'startTime':
      case 'endTime':
        value = moment.unix(value).format('DD/MM/YYYY HH:mm:ss');
        break;
      case 'isRetargeting':
        value = (value === '0' ? 'Prospecting' : 'Retargeting');
        break;
      case 'bid':
        value = (value === '1' ? 'Bid on everything' : "Don't bid on anything");
      default:
        value = getValueSigned(property, value);
        break;
    }

    return this.checkifempty(value);
  },

  banner: function (property, value) {
    switch (property) {
      case 'approved':
        value = (value === '1' ? 'approved' : 'rejected');
        break;
      case 'active':
        value = (value === '1' ? 'activated' : 'deactivated');
        break;
      case 'type':
        value = bannerType[value];
        break;
      default:
        value = getValueSigned(property, value);
        break;
    }

    return this.checkifempty(value);
  },

  pixel: function (property, value) {
    switch (property) {
      case 'type':
        value = pixelType[value];
        break;
      default:
        value = getValueSigned(property, value);
        break;
    }

    return this.checkifempty(value);
  },

  segment: function (property, value) {
    return this.checkifempty(value);
  },

  constraint: function (property, value) {
    value = getValueSigned(property, value);
    return this.checkifempty(value);
  },

  qualification: function (property, value) {
    switch (property) {
      case 'optimizationMetric':
        value = optMetric[value];
        break;
      default:
        value = getValueSigned(property, value);
        break;
    }
    return this.checkifempty(value);
  },

  goal: function (property, value) {
    value = getValueSigned(property, value);
    return this.checkifempty(value);
  },

  //helper method
  checkifempty: function (value) {
    return value === '' || value === '[]' ? '-' : value;
  }
};

//check if the var needs to be signed with € or % based on property
const getValueSigned = function (property, value) {
  const euroVars = {
    dailyBudget: true,
    mediaAgencyRevenuePerClick: true,
    mediaAgencyRevenuePerImpression: true,
    mediaAgencyRevenuePerSale: true,
    mediaAgencyRevenuePerLead: true,
    maxBidPrice: true,
    minBidPrice: true,
    minBudgetPerDay: true,
    minBudgetPerCampaign: true,
    maxBudgetPerDay: true,
    maxBudgetPerWeek: true,
    maxBudgetPerMonth: true,
    maxBudgetPerCampaign: true,
    minRevenue: true,
    minProfit: true,
    maxCpm: true,
    maxCpc: true,
    maxCpo: true
  };

  const percentVars = {
    mediaAgencyFee: true,
    mediaAgencyMargin: true,
    minCtr: true,
    minConversionRate: true
  };

  const dayVars = {
    conversionsPostView: true,
    conversionsPostClick: true,
  };

  const minVars = {
    minAgoAlreadyConverted: true
  };

  let signedValue = value;
  if (euroVars[property] === true) { signedValue = '€' + (Math.round(value * 1000 / 10) / 100); }; //rounded to two decimals (val * 1000/10) instead of (val*100) done due to floating point issue eg. for 1.275 rounds to 1.27 instead of 1.28
  if (percentVars[property] === true) { signedValue = value + '%'; };
  if (dayVars[property] === true) { signedValue = value + ' days'; };
  if (minVars[property] === true) { signedValue = minutesHumanize(value); };
  return signedValue;
};

const minutesHumanize = (time) => {
  const days = Math.floor(time / (24 * 60));
  const rest = time % (24 * 60);
  const hours = Math.floor(rest / 60);
  const mins = rest % 60;
  return days + " days " + hours + " hours " + mins + " minutes";
}

const getPropName = (str) => {
  const propertyName = {
    conversionsPostClick: 'conversions post click window',
    conversionsPostView: 'conversions post view window',
    minImpressions: 'impressions',
    minClicks: 'clicks',
    minConversions: 'conversions',
    minRevenue: 'revenue',
    minProfit: 'profit',
    maxCpm: 'average CPM',
    maxCpc: 'average CPC',
    minCtr: 'average CTR',
    minConversionRate: 'average Conversion rate',
    maxCpo: 'average CPO',
    minAgoAlreadyConverted: 'unique conversions window',
    bid: 'default action',
    isRetargeting: 'campaign type'
  };
  let propName = propertyName[str];
  if (propName === undefined) {
    propName = str.replace(/([A-Z])/g, ' $1').toLowerCase();
  }
  return propName;
}