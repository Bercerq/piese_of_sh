import { Context, createContext } from "react";
import { AdqueueCountContextType } from "../../../models/Common";

const AdqueueCountContext: Context<AdqueueCountContextType> = createContext({ adqueueCount: 0 });
export default AdqueueCountContext;