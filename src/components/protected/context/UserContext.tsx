import { Context, createContext } from "react";
import { AppUser } from "../../../models/AppUser";

const UserContext: Context<AppUser> = createContext({ username: "Guest", authenticated: true, isRootAdmin: false } as AppUser);
export default UserContext;