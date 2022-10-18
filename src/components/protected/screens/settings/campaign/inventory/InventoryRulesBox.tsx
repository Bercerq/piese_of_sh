import React, { Fragment, useEffect, useState } from "react";
import * as _ from "lodash";
import * as CampaignHelper from "../../../../../../client/CampaignHelper";
import { InventoryRulesBoxFormData, InventoryRulesBoxProps } from "../../../../../../client/campaignSchemas";
import { ScopeType } from "../../../../../../client/schemas";
import { InventoryRule } from "../../../../../../models/data/Campaign";
import InventoryAttributeCard, { InventoryAttributeCardProps } from "./InventoryAttributeCard";

const InventoryRulesBox = (props: InventoryRulesBoxProps) => {
  const initialDomainsValidation = props.domains.map((v) => { return true; });
  const initialDomainListsValidation = props.domainLists.map((v) => { return true; });
  const initialTopLevelDomainsValidation = props.topLevelDomains.map((v) => { return true; });
  const initialApplicationsValidation = props.applications.map((v) => { return true; });
  const initialApplicationListsValidation = props.applicationLists.map((v) => { return true; });

  const [domains, setDomains] = useState<InventoryRule[]>(props.domains);
  const [domainLists, setDomainLists] = useState<InventoryRule[]>(props.domainLists);
  const [topLevelDomains, setTopLevelDomains] = useState<InventoryRule[]>(props.topLevelDomains);
  const [applications, setApplications] = useState<InventoryRule[]>(props.applications);
  const [applicationLists, setApplicationLists] = useState<InventoryRule[]>(props.applicationLists);
  const [domainsValidation, setDomainsValidation] = useState<boolean[]>([]);
  const [domainListsValidation, setDomainListsValidation] = useState<boolean[]>([]);
  const [topLevelDomainsValidation, setTopLevelDomainsValidation] = useState<boolean[]>([]);
  const [applicationsValidation, setApplicationsValidation] = useState<boolean[]>([]);
  const [applicationListsValidation, setApplicationListsValidation] = useState<boolean[]>([]);
  const [listModalMaxLevel, setListModalMaxLevel] = useState<ScopeType>("advertiser");
  const [listModalScope, setListModalScope] = useState<ScopeType>("advertiser");
  const [listModalScopeId, setListModalScopeId] = useState<number>(props.advertiserId);

  const submitData = getSubmitData();
  const isValid = getIsValid();

  useEffect(() => { loadForm() }, [props.id]);

  useEffect(() => { props.onChange(submitData, isValid); }, [JSON.stringify(submitData), isValid]);

  async function loadForm() {
    setDomains(props.domains);
    setDomainLists(props.domainLists);
    setTopLevelDomains(props.topLevelDomains);
    setApplications(props.applications);
    setApplicationLists(props.applicationLists);
    setDomainsValidation(initialDomainsValidation);
    setDomainListsValidation(initialDomainListsValidation);
    setTopLevelDomainsValidation(initialTopLevelDomainsValidation);
    setApplicationsValidation(initialApplicationsValidation);
    setApplicationListsValidation(initialApplicationListsValidation);
    if (props.rights.MANAGE_LISTS) {
      const listModalMaxLevel = await CampaignHelper.getListModalMaxLevel(props.user, props.advertiserId);
      setListModalMaxLevel(listModalMaxLevel);
      setListModalScope("advertiser");
      setListModalScopeId(props.advertiserId);
    }
  }

  function getSubmitData(): InventoryRulesBoxFormData {
    return {
      domains: setNullIds(domains),
      domainLists: setNullIds(domainLists),
      topLevelDomains: setNullIds(topLevelDomains),
      applications: setNullIds(applications),
      applicationLists: setNullIds(applicationLists)
    }
  }

  function setNullIds(rules: InventoryRule[]) {
    return rules.map((rule) => {
      if (rule.id < 0) {
        return _.assign({}, rule, { id: null });
      } else {
        return rule;
      }
    });
  }

  function getIsValid(): boolean {
    return !(domainsValidation.indexOf(false) > -1 || domainListsValidation.indexOf(false) > -1 || topLevelDomainsValidation.indexOf(false) > -1 || applicationsValidation.indexOf(false) > -1 || applicationListsValidation.indexOf(false) > -1);
  }

  function getRulesOnChange(items: InventoryRule[], itemsValidation: boolean[], i: number, row: InventoryRule, isValid: boolean): { rules: InventoryRule[], validations: boolean[] } {
    let rules = _.cloneDeep(items);
    rules[i] = row;
    let validations = _.cloneDeep(itemsValidation);
    validations[i] = isValid;
    return { rules, validations };
  }

  function getRulesOnDelete(items: InventoryRule[], itemsValidation: boolean[], i: number): { rules: InventoryRule[], validations: boolean[] } {
    const rules = _.cloneDeep(items);
    const validations = _.cloneDeep(itemsValidation);
    if (rules.length > 0 && validations.length > 0) {
      rules.splice(i, 1);
      validations.splice(i, 1);
    }
    return { rules, validations };
  }

  function getRulesOnAdd(items: InventoryRule[], itemsValidation: boolean[], row: InventoryRule): { rules: InventoryRule[], validations: boolean[] } {
    const rules = _.cloneDeep(items);
    const validations = _.cloneDeep(itemsValidation);
    rules.push(row);
    validations.push(true);
    return { rules, validations };
  }

  const cards: InventoryAttributeCardProps[] = [{
    title: "Domain",
    rules: domains,
    listRules: domainLists,
    attribute: "domain",
    listAttribute: "domain(Lists)",
    creatable: true,
    campaignId: props.id,
    editAsText: true,
    createLists: props.rights.MANAGE_LISTS,
    rights: props.rights,
    listModalScope,
    listModalScopeId,
    listModalMaxLevel,
    maxBidPrice: props.maxBidPrice,
    onListRuleChange: (index: number, rule: InventoryRule, isValid: boolean) => {
      const updatedItems = getRulesOnChange(domainLists, domainListsValidation, index, rule, isValid);
      setDomainLists(updatedItems.rules);
      setDomainListsValidation(updatedItems.validations);
    },
    onListRuleDelete: (index: number) => {
      const updatedItems = getRulesOnDelete(domainLists, domainListsValidation, index);
      setDomainLists(updatedItems.rules);
      setDomainListsValidation(updatedItems.validations);
    },
    onListRuleAdd: (rule: InventoryRule) => {
      const updatedItems = getRulesOnAdd(domainLists, domainListsValidation, rule);
      setDomainLists(updatedItems.rules);
      setDomainListsValidation(updatedItems.validations);
    },
    onRuleChange: (index: number, rule: InventoryRule, isValid: boolean) => {
      const updatedItems = getRulesOnChange(domains, domainsValidation, index, rule, isValid);
      setDomains(updatedItems.rules);
      setDomainsValidation(updatedItems.validations);
    },
    onRuleDelete: (index: number) => {
      const updatedItems = getRulesOnDelete(domains, domainsValidation, index);
      setDomains(updatedItems.rules);
      setDomainsValidation(updatedItems.validations);
    },
    onRuleAdd: (rule: InventoryRule) => {
      const updatedItems = getRulesOnAdd(domains, domainsValidation, rule);
      setDomains(updatedItems.rules);
      setDomainsValidation(updatedItems.validations);
    }
  }, {
    title: "Top level domain",
    rules: topLevelDomains,
    attribute: "topLevelDomain",
    creatable: false,
    campaignId: props.id,
    editAsText: false,
    createLists: false,
    rights: props.rights,
    maxBidPrice: props.maxBidPrice,
    onRuleChange: (index: number, rule: InventoryRule, isValid: boolean) => {
      const updatedItems = getRulesOnChange(topLevelDomains, topLevelDomainsValidation, index, rule, isValid);
      setTopLevelDomains(updatedItems.rules);
      setTopLevelDomainsValidation(updatedItems.validations);
    },
    onRuleDelete: (index: number) => {
      const updatedItems = getRulesOnDelete(topLevelDomains, topLevelDomainsValidation, index);
      setTopLevelDomains(updatedItems.rules);
      setTopLevelDomainsValidation(updatedItems.validations);
    },
    onRuleAdd: (rule: InventoryRule) => {
      const updatedItems = getRulesOnAdd(topLevelDomains, topLevelDomainsValidation, rule);
      setTopLevelDomains(updatedItems.rules);
      setTopLevelDomainsValidation(updatedItems.validations);
    }
  }, {
    title: "Application name",
    rules: applications,
    listRules: applicationLists,
    attribute: "application",
    listAttribute: "application(Lists)",
    creatable: true,
    campaignId: props.id,
    editAsText: true,
    createLists: props.rights.MANAGE_LISTS,
    rights: props.rights,
    listModalScope,
    listModalScopeId,
    listModalMaxLevel,
    maxBidPrice: props.maxBidPrice,
    onListRuleChange: (index: number, rule: InventoryRule, isValid: boolean) => {
      const updatedItems = getRulesOnChange(applicationLists, applicationListsValidation, index, rule, isValid);
      setApplicationLists(updatedItems.rules);
      setApplicationListsValidation(updatedItems.validations);
    },
    onListRuleDelete: (index: number) => {
      const updatedItems = getRulesOnDelete(applicationLists, applicationListsValidation, index);
      setApplicationLists(updatedItems.rules);
      setApplicationListsValidation(updatedItems.validations);
    },
    onListRuleAdd: (rule: InventoryRule) => {
      const updatedItems = getRulesOnAdd(applicationLists, applicationListsValidation, rule);
      setApplicationLists(updatedItems.rules);
      setApplicationListsValidation(updatedItems.validations);
    },
    onRuleChange: (index: number, rule: InventoryRule, isValid: boolean) => {
      const updatedItems = getRulesOnChange(applications, applicationsValidation, index, rule, isValid);
      setApplications(updatedItems.rules);
      setApplicationsValidation(updatedItems.validations);
    },
    onRuleDelete: (index: number) => {
      const updatedItems = getRulesOnDelete(applications, applicationsValidation, index);
      setApplications(updatedItems.rules);
      setApplicationsValidation(updatedItems.validations);
    },
    onRuleAdd: (rule: InventoryRule) => {
      const updatedItems = getRulesOnAdd(applications, applicationsValidation, rule);
      setApplications(updatedItems.rules);
      setApplicationsValidation(updatedItems.validations);
    }
  }];

  return <Fragment>
    {
      cards.map((cardProps, i) => <InventoryAttributeCard {...cardProps} />)
    }
  </Fragment>
}
export default InventoryRulesBox;