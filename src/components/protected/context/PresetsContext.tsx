import { Context, createContext } from "react";
import { Preset } from "../../../models/data/Preset";

const PresetsContext: Context<Preset[]> = createContext([]);
export default PresetsContext;