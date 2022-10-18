import { LookUp, ScopeInfo } from "../Common";

export interface List {
  id?: number;
  scope?: ScopeInfo;
  writeAccess?: boolean;
  name: string;
  description: string | null;
  listAttributeId?: number;
  attributeId?: number;
  attribute?: string;
  listAttribute?: string;
  attributeValues?: string[];
  lastEdit?: number;
  creationDate?: number;
  activeCampaignIds?: LookUp[];
  inactiveCampaignIds?: LookUp[];
}

export interface ListRow {
  id: number;
  name: string;
  description: string;
  owner: string;
  writeAccess: boolean;
  activeCampaignIds?: LookUp[];
  inactiveCampaignIds?: LookUp[];
  creationDate: number | null;
  lastEdit: number | null;
}