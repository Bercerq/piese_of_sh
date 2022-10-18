import { Context, createContext } from "react";
import { BreadcrumbContextType } from "../../../models/Common";

const BreadcrumbContext: Context<BreadcrumbContextType> = createContext({ items: [] });
export default BreadcrumbContext;