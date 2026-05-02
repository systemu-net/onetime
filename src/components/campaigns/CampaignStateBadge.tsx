import type { CampaignState } from "@/types/campaigns";

const STATE_STYLE: Record<CampaignState, string> = {
  active: "gov-badge gov-badge-active",
  paused: "gov-badge gov-badge-paused",
  archived: "gov-badge",
  expired: "gov-badge gov-badge-expired",
};

export function CampaignStateBadge({ state }: { state: CampaignState }) {
  const label = state.charAt(0).toUpperCase() + state.slice(1);
  return <span className={STATE_STYLE[state]}>{label}</span>;
}
