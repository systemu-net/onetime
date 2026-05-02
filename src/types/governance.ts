// ── Governance domain types ────────────────────────────────────────────────────

export type LinkState = "active" | "paused" | "expired" | "draft" | "archived";

export type RuleType = "geo" | "device" | "time" | "split";

export interface RoutingRule {
  id: number;
  type: RuleType;
  dest: string;
  desc: string;
  weight?: number;
}

export interface AuditLogEntry {
  id: number;
  action: string;
  detail: string;
  time: string;
  color: string;
}

export interface GovernanceLink {
  /** lookup_code is used as the stable public id */
  id: string;
  lookup_code: string;
  name: string;
  dest: string;
  short: string;
  state: LinkState;
  clicks: number;
  cap: number | null;
  governance: boolean;
  activatesAt: string | null;
  expiresAt: string | null;
  pausedRedirectUrl: string | null;
  expiredRedirectUrl: string | null;
  campaign: string | null;
  linkCampaignId: number | null;
  linkCampaignColor: string | null;
  qrImageUrl: string | null;
  /** Routing rules – populated lazily on drawer open */
  rules: RoutingRule[];
}

export interface CreateGovernedLinkPayload {
  originalUrl: string;
  title?: string;
  state: LinkState;
  clickCap?: number;
  activatesAt?: string;
  expiresAt?: string;
  linkCampaignId?: number | null;
}

export const STATE_CONFIG: Record<
  LinkState,
  { label: string; color: string; emoji: string }
> = {
  active: { label: "Active", color: "#10b981", emoji: "◉" },
  paused: { label: "Paused", color: "#f59e0b", emoji: "⏸" },
  expired: { label: "Expired", color: "#ef4444", emoji: "⊘" },
  draft: { label: "Draft", color: "#6b7280", emoji: "◌" },
  archived: { label: "Archived", color: "#3b82f6", emoji: "⬡" },
};
