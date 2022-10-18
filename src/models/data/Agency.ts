import { Right } from "../Common";
import { Parents } from "./Parent";

export interface Agency {
  agency: AgencyEntity;
  rights: Right[];
  parents: Parents;
}

export interface AgencyEntity {
  id?: number;
  metaAgencyId: number;
  name: string;
  contactPerson?: string;
  email?: string;
  street?: string;
  number?: string;
  zipcode?: string;
  city?: string;
  country?: string;
  revenueModel?: number;
  fee?: number;
  logo?: string;
  agencyFee?: number;
  SpotXSeat?: string;
  digitalAudience?: boolean;
  defaultAdvertiserFee?: number;
  theme?: string;
}