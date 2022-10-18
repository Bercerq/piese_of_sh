export interface Segment {
  advertiserId?: number;
  campaignId?: number;
  count?: number;
  countTargetedUnique?: number;
  countUnique?: number;
  domain?: string;
  id?: number;
  lastEvent?: string;
  lastUpdated?: string;
  name: string;
  pages?: SegmentPage[];
  parameters?: any[];
  postClick?: number;
  postClickCount?: number;
  postClickCountUnique?: number;
  postView?: number;
  postViewCount?: number;
  postViewCountUnique?: number;
  segmentId?: number;
  segmentName?: number;
  segmentType?: string;
  thirdPartyPixel?: any[];
  type: string;
  uniqueTime?: number;
  untargetedCount?: number;
  untargetedCountUnique?: number;
  vars?: SegmentVar[];
}

export type SegmentConstraint = "Contains" | "MatchExactly" | "StartsWith" | "EndsWith";

export interface SegmentPage {
  constraint: SegmentConstraint;
  value: string;
}

export interface SegmentVar {
  name: string;
  constraint: SegmentConstraint;
  value: string;
}