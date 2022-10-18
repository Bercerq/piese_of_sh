export type Role = "admin" | "campaignmanager" | "campaignoptimizer" | "aduploader" | "tagmanager" | "guest";
export type Level = "root" | "organization" | "agency" | "advertiser" | "publisher";

export interface User {
  id: number;
  name: string;
  email: string;
  roles: UserRole[];
  lastLogin?: string;
  viewMode: 0 | 1;
  theme?: string;
  suspended: boolean;
  rights: UserRights;
  twoFactorEnabled: boolean;
}

export interface UserRole {
  role: Role;
  level: Level;
  entityId?: number;
}

export interface UserBan {
  userId: number;
  role: UserRole;
}

export interface UserInvite {
  email: string;
  role: UserRole;
}

export interface UserRights {
  VIEW_LISTS?: Level;
  MANAGE_LISTS?: Level;
  VIEW_USERS?: Level;
  MANAGE_USERS?: Level;
  VIEW_DEALS?: Level;
  MANAGE_DEALS?: Level;
}

export interface UserRow {
  id?: number;
  userId: number;
  role: Role;
  level: Level;
  entityId: number;
  entityName?: string;
  email: string;
  lastLogin: string;
}