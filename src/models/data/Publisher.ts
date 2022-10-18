import { Right } from "../Common";

export interface Publisher {
  publisher: PublisherEntity;
  rights: Right[];
}

export interface PublisherEntity {
  id: number;
  sspName: string;
  theme: string;
  settings: PublisherSettings;
  financials: PublisherFinancials;
}

export interface PublisherSettings {
  name: string;
  defaultDealFloorPrice: number;
}

export interface PublisherFinancials {
  fee: number;
  cpmFee: number;
}