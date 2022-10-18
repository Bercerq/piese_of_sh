import React, { useContext } from "react";
import * as _ from "lodash";
import { Preset, PresetMetric } from "../../../../../models/data/Preset";
import PresetsContext from "../../../context/PresetsContext";
import { AlignType, Metric, MetricType } from "../../../../../client/schemas";
import KPI from "./KPI";

interface KPIContainerProps {
  videoMode: boolean;
  data: any;
}

const KPIContainer = (props: KPIContainerProps) => {
  let presets = useContext<Preset[]>(PresetsContext);
  const preset = getPreset();

  function getPreset() {
    const groupName = props.videoMode ? "VideoKPIs" : "DisplayKPIs";
    const preset = presets.find((p) => {
      return p.presetName === "Default" && p.groupName === groupName;
    });
    return preset;
  }

  function getMetrics(): Metric[] {
    return _.get(preset, "metrics", []).map(getMetric);
  }

  function getMetric(pm: PresetMetric): Metric {
    const col = pm.fieldName;
    const label = pm.displayName;
    let align = ["number", "euro"].indexOf(pm.format) > -1 ? "right" : "left";
    let type: string = pm.format;
    if (type === "euro") type = "money";
    if (type === "percentage") type = "perc";
    return { col, label, align: align as AlignType, type: type as MetricType };
  }
  const metrics = getMetrics();
  return <KPI data={props.data} metrics={metrics} />
}
export default KPIContainer;