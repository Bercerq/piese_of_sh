import { ScopeType } from "../../client/schemas";

export interface NavigationItem {
  id: number;
  name: string;
  level: ScopeType;
  navigable: boolean;
}