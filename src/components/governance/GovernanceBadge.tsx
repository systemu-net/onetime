import type { LinkState } from "@/types/governance";
import { STATE_CONFIG } from "@/types/governance";

interface GovernanceBadgeProps {
  state: LinkState;
}

export function GovernanceBadge({ state }: GovernanceBadgeProps) {
  const cfg = STATE_CONFIG[state] ?? {
    label: state,
    color: "#9090aa",
    emoji: "◌",
  };
  return <span className={`gov-badge gov-badge-${state}`}>{cfg.label}</span>;
}
