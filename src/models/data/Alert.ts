export interface Alert {
  id: number;
  campaignId: number;
  alertType: string;
  campaignName: string;
  startTime: number;
  endTime: number;
  warningLevel: number;
}