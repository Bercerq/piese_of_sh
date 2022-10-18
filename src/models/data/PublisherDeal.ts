export interface PublisherDeal {
  id?: number;
  name?: string;
  sspName?: string;
  publisherId?: number;
  description?: string;
  approvalStatus?: "approved" | "suspended",
  floorPrice?: number;
  expirationDate?: string;
  adType?: "display" | "video";
  organizationName?: string;
  agencyName?: string;
  advertiserName?: string;
}