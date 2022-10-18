import { Context, createContext } from "react";
import { ScopeData, ScopeDataContextType } from "../../../models/Common";

const ScopeDataContext: Context<ScopeDataContextType> = createContext({ data: {} as ScopeData });
export default ScopeDataContext;