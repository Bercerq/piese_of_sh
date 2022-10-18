import { SelectOption } from "../../../../../client/schemas";

export interface AudienceCategory {
  category: string;
  config?: any;
  data: any[];
  width: number;
  height?: number;
  pngHeight?: number;
  png: boolean;
  title: string;
  type: string;
}

export interface AudienceChartProps {
  audienceCategory: AudienceCategory;
  property: SelectOption;
}