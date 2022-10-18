import { Right } from "../Common";

export interface Organization {
  organization: OrganizationEntity;
  rights: Right[];
}

export interface OrganizationEntity {
  id?: number;
  name: string;
  fee?: number;
  theme?: string;
}