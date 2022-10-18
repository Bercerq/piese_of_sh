import { Context, createContext } from "react";
import { Variables } from "../../../models/Common";

const VariablesContext: Context<Variables> = createContext({ adServerUrl: "" });
export default VariablesContext;