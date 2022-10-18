import { User, UserRole } from "./data/User";

export interface AppUser extends User {
  username: string;
  password?: string;
  authenticated: boolean;
  isRootAdmin: boolean;
  rolesInfo?: UserRoleInfo[];
  pages?: UserRoleInfo[]; //for multiple roles with same level and entityId a comma separated roleName is needed
}

export interface UserRoleInfo extends UserRole {
  roleName: string;
  entityName: string;
}