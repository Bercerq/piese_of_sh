import { Right } from "../Common";
import { Parents } from "./Parent";
import { CampaignEntity } from "./Campaign";

export interface CampaignGroup {
  campaignGroup: CampaignGroupEntity;
  rights: Right[];
  parents: Parents;
}

export interface CampaignGroupEntity {
  id?: number;
  metaAgencyId?: number;
  agencyId?: number;
  advertiserId?: number;
  theme?: string;
  name: string;
  remarks?: string;
  status?: string;
  campaigns?: CampaignEntity[];
  startTime?: number;
  endTime?: number;
  isRecent?: boolean;
  percentageDone?: number;
  budgetPacing?: Pacing;
  impressionPacing?: Pacing;
  startDate?: string;
  endDate?: string;
}

export interface Pacing {
  budget: number;
  actual: number;
  expected: number;
  percentage: number;
  actionType: number;
  action: string;
}