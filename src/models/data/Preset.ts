export interface Preset {
  id: number;
  presetName: string;
  groupName: string;
  metrics: PresetMetric[];
}

export interface PresetMetric {
  fieldName: string;
  format: "string" | "custom" | "number" | "euro" | "percentage",
  displayName: string;
  source: "Campaign" | "Statistic"
}