import { Right } from "../Common";
import { Parents } from "./Parent";

export interface Advertiser {
  advertiser: AdvertiserEntity;
  rights: Right[];
  parents: Parents;
}

export interface AdvertiserEntity {
  id?: number;
  agencyId: number;
  name: string;
  advertiserDomain: string;
  productCategory?: string;
  contactPerson?: string;
  email?: string;
  street?: string;
  number?: string;
  zipcode?: string;
  city?: string;
  country?: string;
  logo?: string;
  theme?: string;
  advertiserFee: number;
  digitalAudience?: boolean;
  metaAgencyId?: number;
}