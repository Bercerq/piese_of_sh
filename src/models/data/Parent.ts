export interface Parent {
  parentId: number;
  name: string;
}

export interface Parents {
  organization?: Parent;
  agency?: Parent;
  advertiser?: Parent;
  campaignGroup?: Parent;
}