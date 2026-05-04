export type CampaignState = "active" | "paused" | "archived" | "expired";

export type CampaignLinkState =
  | "draft"
  | "active"
  | "paused"
  | "expired"
  | "archived";

export type CampaignType =
  | "launch"
  | "sale"
  | "event"
  | "content"
  | "retargeting"
  | "affiliate";

export interface CampaignLink {
  id: number;
  lookupCode: string;
  originalUrl: string;
  title?: string;
  state: CampaignLinkState;
  clicksCount: number;
}

export interface Campaign {
  id: number;
  name: string;
  description: string;
  state: CampaignState;
  accentColor: string;
  isDefault: boolean;
  linksCount: number;
  totalClicks: number;
  createdAt: string;
  updatedAt: string;
  links: CampaignLink[];
}

export interface CampaignCreatePayload {
  name: string;
  description?: string;
  state?: CampaignState;
  type?: CampaignType;
  icon?: string;
  color?: string;
  startDate?: string;
  endDate?: string;
}

export interface CampaignUpdatePayload {
  name?: string;
  description?: string;
  state?: CampaignState;
  color?: string;
}
