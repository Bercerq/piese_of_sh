export interface RetailBranch {
  id?: number;
  branchId: string;
  name: string;
  urlTag: string;
  country?: string;
  region?: string;
  city?: string;
  latitude: number;
  longitude: number;
  radius: number;
  postalCode?: string;
  address1?: string;
  address2?: string;
  targetingZipCodes?: string[];
  custom1?:string;
  custom2?:string;
  custom3?:string;
  custom4?:string;
  custom5?:string;
  custom6?:string;
  custom7?:string;
  custom8?:string;
  custom9?:string;
}