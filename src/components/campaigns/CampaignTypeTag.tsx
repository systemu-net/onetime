import type { CampaignType } from "@/types/campaigns";

const TYPE_STYLE: Record<CampaignType, string> = {
  launch: "gov-tag",
  sale: "gov-tag",
  event: "gov-tag",
  content: "gov-tag",
  retargeting: "gov-tag",
  affiliate: "gov-tag",
};

export function CampaignTypeTag({ type }: { type: CampaignType }) {
  return <span className={TYPE_STYLE[type]}>{type}</span>;
}
