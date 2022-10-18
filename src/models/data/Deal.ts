import { LookUp, ScopeInfo } from "../Common";

export type DealAdType = "display" | "video";
export type DealStatus = "okay" | "pending" | "inactive" | "rejected";

export interface Deal {
  id?: number;
  writeAccess?: boolean;
  scope?: ScopeInfo;
  ssp: string;
  externalId?: string;
  name: string;
  description: string;
  escalationDeal?: string | null;
  status?: DealStatus,
  creationDate?: string;
  expirationDate?: string;
  activeCampaignIds?: LookUp[];
  inactiveCampaignIds?: LookUp[];
}

export interface DealRequest {
  sspName: string;
  description: string;
  adType: DealAdType,
  buyerSideDeal: Deal;
}

export interface DealRow {
  id: number;
  externalId: string;
  ssp: string;
  name: string;
  description: string;
  owner: string;
  writeAccess: boolean;
  activeCampaignIds?: LookUp[];
  creationDate: string | number;
  expirationDate: string | null;
}