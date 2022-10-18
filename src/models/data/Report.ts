import { ScopeInfo } from "../Common";

export interface Report {
  id: number;
  templateId: number;
  scope?: ScopeInfo;
  writeAccess: boolean;
  name: string;
  description: string;
  output: string;
  filters?: string[];
  dateRange: string;
  includeCurrentDay: boolean;
  scheduleEvery: string;
  scheduleStart: string;
  scheduleEnd: string;
  lastRun?: string;
  nextScheduled?: string;
  status: string;
  emailTo: string[];
  emailAttachments: boolean;
  needsRun: boolean;
  lastEdit?: string;
  creationDate?: string;
  scheduled: boolean;
}

export interface ReportTemplate {
  id: number;
  scope?: ScopeInfo;
  writeAccess: boolean;
  name: string;
  description: string;
  lastEdit?: string;
  creationDate?: string;
  template?: {
    title: string;
    tabs?: ReportTemplateTab[];
    frontPage: boolean;
    filters?: string[];
  }
}

export interface ReportTemplateTab {
  name: string;
  figures: ReportTabFigure[];
}

export interface ReportTabFigure {
  title: string;
  type?: ReportTabFigureType;
  dimensions?: string[];
  metrics?: string[];
  secondaryMetrics?: string[];
  includeTotal?: boolean;
  sort?: any;
  limit?: number;
  descending?: boolean;
  figureWidth?: number;
  figureHeight?: number;
}

export type ReportTabFigureType = "table" | "barchart" | "columnchart" | "linechart" | "piechart";

export interface ReportInstance {
  id: number;
  reportId: number;
  created: string;
  location: string;
  status: string;
}
