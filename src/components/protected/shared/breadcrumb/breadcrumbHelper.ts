import * as _ from "lodash";
import { BreadcrumbItem, ScopeType, BreadcrumbType, PageType } from "../../../../client/schemas";
import { Scope } from "../../../../models/Common";
import { AppUser } from "../../../../models/AppUser";
import { NavigationItem } from "../../../../models/data/NavigationItem";


export const getItems = (user: AppUser, params: { page?: PageType; scope?: ScopeType; scopeId?: number, minScope?: ScopeType }, data: NavigationItem[]): BreadcrumbItem[] => {
  switch (params.scope) {
    case "root": return getRootItems();
    case "organization": return getOrganizationItems(user, params, data);
    case "publisher": return getPublisherItems(user, params, data);
    case "agency": return getAgencyItems(user, params, data);
    case "advertiser": return getAdvertiserItems(user, params, data);
    case "campaigngroup": return getCampaigngroupItems(user, params, data);
    case "campaign": return getCampaignItems(user, params, data);
    default: return [];
  }
}

const getRootItems = (): BreadcrumbItem[] => {
  return [{
    label: "Overview",
    active: true,
    current: true,
    parent: -1
  }, {
    label: "Select organization",
    active: true,
    current: false,
    parent: -1,
    type: "organization"
  }];
}

const getOrganizationItems = (user: AppUser, params: { page?: PageType; scope?: ScopeType; scopeId?: number }, data: NavigationItem[]): BreadcrumbItem[] => {
  let items: BreadcrumbItem[] = [];
  if (user.isRootAdmin) {
    items.push({
      href: `/${params.page}/root/0`,
      label: "Overview",
      active: false,
      current: false
    });
  }

  const organizationItem = data.find((o) => {
    return o.level === "organization" && o.navigable === true;
  });

  if (organizationItem !== undefined) {
    items = items.concat([{
      label: organizationItem.name,
      active: true,
      current: true,
      parent: -1,
      type: "organization"
    }, {
      label: "Select agency",
      active: true,
      current: false,
      parent: organizationItem.id,
      type: "agency"
    }]);
  }

  return items;
}

const getPublisherItems = (user: AppUser, params: { page?: PageType; scope?: ScopeType; scopeId?: number }, data: NavigationItem[]): BreadcrumbItem[] => {
  let items: BreadcrumbItem[] = [];
  if (user.isRootAdmin) {
    items.push({
      href: `/${params.page}/root/0`,
      label: "Overview",
      active: false,
      current: false
    });
  }

  const publisherItem = data.find((o) => {
    return o.level === "publisher" && o.navigable === true;
  });

  if (publisherItem !== undefined) {
    items.push({
      label: publisherItem.name,
      active: true,
      current: true,
      parent: -1,
      type: "publisher"
    });
  }

  return items;
}

const getAgencyItems = (user: AppUser, params: { page?: PageType; scope?: ScopeType; scopeId?: number }, data: NavigationItem[]): BreadcrumbItem[] => {
  let items: BreadcrumbItem[] = [];

  if (user.isRootAdmin) {
    items.push({
      href: `/${params.page}/root/0`,
      label: "Overview",
      active: false,
      current: false
    })
  }

  const organizationItem = data.find((o) => {
    return o.level === "organization" && o.navigable === true;
  });

  const agencyItem = data.find((o) => {
    return o.level === "agency" && o.navigable === true;
  });

  if (agencyItem !== undefined) {
    if (organizationItem !== undefined) {
      items = items.concat([{
        label: organizationItem.name,
        active: false,
        current: false,
        href: `/${params.page}/organization/${organizationItem.id}`,
        parent: -1,
        type: "organization"
      }, {
        label: agencyItem.name,
        active: true,
        current: true,
        parent: organizationItem.id,
        type: "agency"
      }, {
        label: "Select advertiser",
        active: true,
        current: false,
        parent: agencyItem.id,
        type: "advertiser"
      }]);
    } else {
      items = items.concat([{
        label: agencyItem.name,
        active: true,
        current: true,
        parent: -1,
        type: "agency"
      }, {
        label: "Select advertiser",
        active: true,
        current: false,
        parent: agencyItem.id,
        type: "advertiser"
      }]);
    }
  }

  return items;
}

const getAdvertiserItems = (user: AppUser, params: { page?: PageType; scope?: ScopeType; scopeId?: number, minScope?: ScopeType }, data: NavigationItem[]): BreadcrumbItem[] => {
  let items: BreadcrumbItem[] = [];

  if (user.isRootAdmin) {
    items.push({
      href: `/${params.page}/root/0`,
      label: "Overview",
      active: false,
      current: false
    })
  }

  const organizationItem = data.find((o) => {
    return o.level === "organization" && o.navigable === true;
  });

  const agencyItem = data.find((o) => {
    return o.level === "agency" && o.navigable === true;
  });

  const advertiserItem = data.find((o) => {
    return o.level === "advertiser" && o.navigable === true;
  });

  if (advertiserItem !== undefined) {
    if (organizationItem !== undefined && agencyItem !== undefined) {
      items = items.concat([{
        label: organizationItem.name,
        active: false,
        current: false,
        href: `/${params.page}/organization/${organizationItem.id}`,
        parent: -1,
        type: "organization"
      }, {
        label: agencyItem.name,
        active: false,
        current: false,
        href: `/${params.page}/agency/${agencyItem.id}`,
        parent: organizationItem.id,
        type: "agency"
      }, {
        label: advertiserItem.name,
        active: true,
        current: true,
        parent: agencyItem.id,
        type: "advertiser"
      }]);
    } else if (agencyItem !== undefined) {
      items = items.concat([{
        label: agencyItem.name,
        active: false,
        current: false,
        href: `/${params.page}/agency/${agencyItem.id}`,
        parent: -1,
        type: "agency"
      }, {
        label: advertiserItem.name,
        active: true,
        current: true,
        parent: agencyItem.id,
        type: "advertiser"
      }]);
    } else if (advertiserItem !== undefined) {
      items = items.concat([{
        label: advertiserItem.name,
        active: true,
        current: true,
        parent: -1,
        type: "advertiser"
      }]);
    }

    if (params.minScope === "campaign") {
      items = items.concat([{
        label: "Select campaign group",
        active: true,
        current: false,
        parent: advertiserItem.id,
        type: "campaigngroup"
      }, {
        label: "Select campaign",
        active: true,
        current: false,
        parent: advertiserItem.id,
        type: "campaign"
      }]);
    }
  }

  return items;
}

const getCampaigngroupItems = (user: AppUser, params: { page?: PageType; scope?: ScopeType; scopeId?: number }, data: NavigationItem[]): BreadcrumbItem[] => {
  let items: BreadcrumbItem[] = [];

  if (user.isRootAdmin) {
    items.push({
      href: `/${params.page}/root/0`,
      label: "Overview",
      active: false,
      current: false
    })
  }

  const organizationItem = data.find((o) => {
    return o.level === "organization" && o.navigable === true;
  });

  const agencyItem = data.find((o) => {
    return o.level === "agency" && o.navigable === true;
  });

  const advertiserItem = data.find((o) => {
    return o.level === "advertiser" && o.navigable === true;
  });

  const campaigngroupItem = data.find((o) => {
    return o.level === "campaigngroup" && o.navigable === true;
  });

  if (campaigngroupItem !== undefined) {
    if (organizationItem !== undefined && agencyItem !== undefined && advertiserItem !== undefined) {
      items = items.concat([{
        label: organizationItem.name,
        active: false,
        current: false,
        href: `/${params.page}/organization/${organizationItem.id}`,
        parent: -1,
        type: "organization"
      }, {
        label: agencyItem.name,
        active: false,
        current: false,
        href: `/${params.page}/agency/${agencyItem.id}`,
        parent: organizationItem.id,
        type: "agency"
      }, {
        label: advertiserItem.name,
        active: false,
        current: false,
        href: `/${params.page}/advertiser/${advertiserItem.id}`,
        parent: agencyItem.id,
        type: "advertiser"
      }, {
        label: campaigngroupItem.name,
        active: true,
        current: true,
        parent: advertiserItem.id,
        type: "campaigngroup"
      }, {
        label: "Select campaign",
        active: true,
        current: false,
        parent: campaigngroupItem.id,
        type: "campaign"
      }]);
    } else if (agencyItem !== undefined && advertiserItem !== undefined) {
      items = items.concat([{
        label: agencyItem.name,
        active: false,
        current: false,
        href: `/${params.page}/agency/${agencyItem.id}`,
        parent: -1,
        type: "agency"
      }, {
        label: advertiserItem.name,
        active: false,
        current: false,
        href: `/${params.page}/advertiser/${advertiserItem.id}`,
        parent: agencyItem.id,
        type: "advertiser"
      }, {
        label: campaigngroupItem.name,
        active: true,
        current: true,
        parent: advertiserItem.id,
        type: "campaigngroup"
      }, {
        label: "Select campaign",
        active: true,
        current: false,
        parent: campaigngroupItem.id,
        type: "campaign"
      }]);
    } else if (advertiserItem !== undefined) {
      items = items.concat([{
        label: advertiserItem.name,
        active: false,
        current: false,
        href: `/${params.page}/advertiser/${advertiserItem.id}`,
        parent: -1,
        type: "advertiser"
      }, {
        label: campaigngroupItem.name,
        active: true,
        current: true,
        parent: advertiserItem.id,
        type: "campaigngroup"
      }, {
        label: "Select campaign",
        active: true,
        current: false,
        parent: campaigngroupItem.id,
        type: "campaign"
      }]);
    }
  }

  return items;
}

const getCampaignItems = (user: AppUser, params: { page?: PageType; scope?: ScopeType; scopeId?: number }, data: NavigationItem[]): BreadcrumbItem[] => {
  let items: BreadcrumbItem[] = [];

  if (user.isRootAdmin) {
    items.push({
      href: `/${params.page}/root/0`,
      label: "Overview",
      active: false,
      current: false
    })
  }

  const organizationItem = data.find((o) => {
    return o.level === "organization" && o.navigable === true;
  });

  const agencyItem = data.find((o) => {
    return o.level === "agency" && o.navigable === true;
  });

  const advertiserItem = data.find((o) => {
    return o.level === "advertiser" && o.navigable === true;
  });

  const campaigngroupItem = data.find((o) => {
    return o.level === "campaigngroup" && o.navigable === true;
  });

  const campaignItem = data.find((o) => {
    return o.level === "campaign" && o.navigable === true;
  });

  if (campaignItem !== undefined) {
    if (organizationItem !== undefined && agencyItem !== undefined && advertiserItem !== undefined) {
      items = items.concat([{
        label: organizationItem.name,
        active: false,
        current: false,
        href: `/${params.page}/organization/${organizationItem.id}`,
        parent: -1,
        type: "organization"
      }, {
        label: agencyItem.name,
        active: false,
        current: false,
        href: `/${params.page}/agency/${agencyItem.id}`,
        parent: organizationItem.id,
        type: "agency"
      }, {
        label: advertiserItem.name,
        active: false,
        current: false,
        href: `/${params.page}/advertiser/${advertiserItem.id}`,
        parent: agencyItem.id,
        type: "advertiser"
      }]);
    } else if (agencyItem !== undefined && advertiserItem !== undefined) {
      items = items.concat([{
        label: agencyItem.name,
        active: false,
        current: false,
        href: `/${params.page}/agency/${agencyItem.id}`,
        parent: -1,
        type: "agency"
      }, {
        label: advertiserItem.name,
        active: false,
        current: false,
        href: `/${params.page}/advertiser/${advertiserItem.id}`,
        parent: agencyItem.id,
        type: "advertiser"
      }]);
    } else if (advertiserItem !== undefined) {
      items = items.concat([{
        label: advertiserItem.name,
        active: false,
        current: false,
        href: `/${params.page}/advertiser/${advertiserItem.id}`,
        parent: -1,
        type: "advertiser"
      }]);
    }

    if (advertiserItem !== undefined && campaigngroupItem !== undefined) {
      items = items.concat([{
        label: campaigngroupItem.name,
        active: false,
        current: false,
        href: `/${params.page}/campaigngroup/${campaigngroupItem.id}`,
        parent: advertiserItem.id,
        type: "campaigngroup"
      }, {
        label: campaignItem.name,
        active: true,
        current: true,
        parent: campaigngroupItem.id,
        type: "campaign",
        parentType: "campaigngroup"
      }]);
    } else if (advertiserItem !== undefined) {
      items.push({
        label: campaignItem.name,
        active: true,
        current: true,
        parent: advertiserItem.id,
        type: "campaign",
        parentType: "advertiser"
      });
    }
  }

  return items;
}