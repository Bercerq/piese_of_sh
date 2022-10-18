import { ScopeInfo } from "../Common";

export interface CreativeFeed {
  id: number;
  scope?: ScopeInfo;
  writeAccess: boolean;
  name: string;
  description?: string;
  numberEventsUsed?: number;
  rows?: CreativeFeedRow[]
  attribute: CreativeFeedType;
  updateSettings?: UpdateSettings;

}

export enum CreativeFeedType {
  RETAILBRANCH = "retail branch",
  PRODUCTS = "products",
  PRODUCTS_CATEGORY = "product category",
  PRODUCTS_SUBCATEGORY ="product subcategory"
}

export interface UpdateSettings {
  updateUrl?: string;
  itemName?: string;
  key?: AttributeMapping;
  custom1?: AttributeMapping;
  custom2?: AttributeMapping;
  custom3?: AttributeMapping;
  custom4?: AttributeMapping;
  custom5?: AttributeMapping;
  custom6?: AttributeMapping;
  custom7?: AttributeMapping;
  custom8?: AttributeMapping;
  custom9?: AttributeMapping;
  custom10?: AttributeMapping;
  custom11?: AttributeMapping;
  custom12?: AttributeMapping;
  custom13?: AttributeMapping;
  custom14?: AttributeMapping;
  custom15?: AttributeMapping;
  fieldOptions?: string[];
}

export interface AttributeMapping {
  externalName?: string;
  creativeName?: string;
  type?: string;
}

export interface CreativeFeedRow {
    key?: string;
    name?: string;
    landingPage?: string;
    custom1?: string;
    custom2?: string;
    custom3?: string;
    custom4?: string;
    custom5?: string;
    custom6?: string;
    custom7?: string;
    custom8?: string;
    custom9?: string;
  }