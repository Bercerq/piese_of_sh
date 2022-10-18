import * as _ from "lodash";
import { Credentials } from "./api/Api";
import { User, UserRole, Role, Level } from "../models/data/User";
import { AppUser, UserRoleInfo } from "../models/AppUser";
import { NOAX } from "./api/NOAX";

export default class AuthorizationService {
  constructor(private API: NOAX) { }

  public async authorize(credentials: Credentials): Promise<AppUser> {
    const user = await this.authenticate(credentials);
    if (user.suspended) {
      throw Error("User is suspended.");
    }
    if (user.roles && user.roles.length > 0) {
      const appUser: AppUser = await this.createApplicationUser(user, credentials);
      return appUser;
    }
  }

  public async getRolesInfo(credentials: Credentials, roles: UserRole[]): Promise<UserRoleInfo[]> {
    return Promise.all(roles.map(async (userRole: UserRole): Promise<UserRoleInfo> => {
      const options = { id: userRole.entityId };
      const roleName = this.getRoleName(userRole.role);
      let info = { entityName: "", roleName };
      if (userRole.level === "root") {
        info = { entityName: "Overview", roleName };
      } else if (userRole.level === "organization") {
        const entity = await this.API.getOrganization(credentials, options);
        info = { entityName: entity.organization.name, roleName };
      } else if (userRole.level === "agency") {
        const entity = await this.API.getAgency(credentials, options);
        info = { entityName: entity.agency.name, roleName };
      } else if (userRole.level === "advertiser") {
        const entity = await this.API.getAdvertiser(credentials, options);
        info = { entityName: entity.advertiser.name, roleName };
      }
      return _.assign({}, userRole, info);
    }));
  }

  public static findRole(user: AppUser, level: Level, entityId?: number) {
    const roles = user.roles;
    if (level === "root") {
      return roles.find((r) => { return r.level === "root" });
    } else {
      return roles.find((r) => { return r.level === level && r.entityId === entityId });
    }
  }

  private async authenticate(credentials: Credentials): Promise<User> {
    const res = await this.API.getUser(credentials);
    if (res.ok) {
      return res.json();
    }
    if (res.status === 401) {
      throw Error("Incorrect email or password.");
    }
    throw Error("An error occured while login. Try again.");
  }

  private async createApplicationUser(user: User, credentials: Credentials) {
    const rolesInfo: UserRoleInfo[] = await this.getRolesInfo(credentials, user.roles);
    const pages: UserRoleInfo[] = this.getPages(rolesInfo);
    const appUser: AppUser = _.assign({}, user, {
      username: credentials.username,
      password: credentials.password,
      authenticated: true,
      isRootAdmin: this.isRootAdmin(user),
      rolesInfo,
      pages
    });
    return appUser;
  }

  private isRootAdmin = (user: User): boolean => {
    const roles = user.roles || [];
    const rootRoleIndex = roles.findIndex((o) => { return o.role === "admin" && o.level === "root"; });
    return rootRoleIndex > -1;
  }

  private getPages = (rolesInfo: UserRoleInfo[]): UserRoleInfo[] => {
    const pages = [];
    rolesInfo.forEach((role) => {
      let page = pages.find((page) => {
        return role.level === page.level && role.entityId === page.entityId;
      });
      if (page) {
        page.roleName += ", " + role.roleName;
      } else {
        pages.push(role);
      }
    });
    return pages;
  }

  private getRoleName(role: Role): string {
    switch (role) {
      case "campaignmanager": return "campaign manager";
      case "campaignoptimizer": return "campaign optimizer"
      case "aduploader": return "ad uploader";
      case "tagmanager": return "tag manager";
      default: return role;
    }
  }
}