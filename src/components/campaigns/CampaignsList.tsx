import { getCampaignType } from "@/apis/campaigns";
import type { Campaign } from "@/types/campaigns";
import type { CSSProperties } from "react";
import { CampaignStateBadge } from "./CampaignStateBadge";
import { CampaignTypeTag } from "./CampaignTypeTag";

const TYPE_ICONS: Record<string, string> = {
  launch: "🚀",
  sale: "⚡",
  event: "🎯",
  content: "💡",
  retargeting: "🎬",
  affiliate: "💎",
};

/** Generate a deterministic sparkline from the campaign id */
function makeSpark(id: number): number[] {
  return Array.from({ length: 8 }, (_, i) => {
    const v = ((id * (i + 3) * 7) % 89) + 11;
    return Math.min(100, v);
  });
}

interface CampaignsListProps {
  campaigns: Campaign[];
  selectedId: number | null;
  maxClicks: number;
  checkedIds: Set<number>;
  onSelect: (campaign: Campaign) => void;
  onPauseToggle: (campaign: Campaign) => void;
  onToggleCheck: (id: number) => void;
}

export function CampaignsList({
  campaigns,
  selectedId,
  maxClicks,
  checkedIds,
  onSelect,
  onPauseToggle,
  onToggleCheck,
}: CampaignsListProps) {
  if (campaigns.length === 0) {
    return (
      <div className="cc-empty">
        <div className="cc-empty-icon">◈</div>
        <p>No campaigns match your filters.</p>
      </div>
    );
  }

  return (
    <div className="cc-campaigns-grid">
      {campaigns.map((campaign) => {
        const campaignType = getCampaignType(campaign.name);
        const accent = campaign.accentColor || "#7c3aed";
        const totalClicks = campaign.totalClicks;
        const pct = Math.min(100, (totalClicks / Math.max(maxClicks, 1)) * 100);
        const spark = makeSpark(campaign.id);
        const sparkPeak = Math.max(...spark, 1);
        const checked = checkedIds.has(campaign.id);
        const isSelected = selectedId === campaign.id;

        // Derive a subtle icon background from the accent color
        const iconBg = `${accent}26`; // 15% opacity
        const iconBorder = `${accent}40`;

        const startDate = new Date(campaign.createdAt).toLocaleDateString(
          "en-US",
          { month: "short", day: "numeric", year: "numeric" },
        );

        return (
          <article
            key={campaign.id}
            className={`cc-campaign-card${isSelected ? " cc-campaign-card--selected" : ""}`}
            style={{ "--cc-accent": accent } as CSSProperties}
            onClick={() => onSelect(campaign)}
          >
            {/* Header */}
            <div className="cc-header">
              {/* Checkbox */}
              <div
                className={`cc-check-box${checked ? " cc-checked" : ""}`}
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleCheck(campaign.id);
                }}
              >
                {checked && "✓"}
              </div>

              {/* Icon avatar */}
              <div
                className="cc-icon"
                style={{
                  background: iconBg,
                  border: `1px solid ${iconBorder}`,
                }}
              >
                {TYPE_ICONS[campaignType] ?? "🚀"}
              </div>

              {/* Meta */}
              <div className="cc-meta">
                <div className="cc-name">{campaign.name}</div>
                <div className="cc-desc">
                  {campaign.description || "No description yet"}
                </div>
                <div className="cc-quick-metrics">
                  <div className="cc-quick-metric">
                    <span>Links</span>
                    <strong>{campaign.linksCount.toLocaleString()}</strong>
                  </div>
                </div>
                <div className="cc-badges">
                  <CampaignStateBadge state={campaign.state} />
                  <CampaignTypeTag type={campaignType} />
                </div>
              </div>

              {/* Mini sparkline */}
              <div className="cc-mini-spark" aria-hidden>
                <div className="cc-mini-spark-bars">
                  {spark.map((v, i) => (
                    <div
                      key={i}
                      className="cc-mini-spark-bar"
                      style={{
                        height: `${(v / sparkPeak) * 100}%`,
                        background: accent,
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Stats row */}
            <div className="cc-stats">
              {[
                {
                  label: "Total Clicks",
                  value: totalClicks.toLocaleString(),
                  sub: `${pct.toFixed(0)}% of peak`,
                  primary: true,
                },
                {
                  label: "CTR",
                  value: "—",
                  sub: "avg per link",
                  color: "#10b981",
                  primary: false,
                },
                {
                  label: "Conversions",
                  value: "—",
                  sub: "total",
                  color: "#a855f7",
                  primary: false,
                },
                {
                  label: "Revenue",
                  value: "—",
                  sub: "estimated",
                  color: "#f59e0b",
                  primary: false,
                },
              ].map((s) => (
                <div key={s.label} className="cc-stat">
                  <div className="cc-stat-label">{s.label}</div>
                  <div
                    className={`cc-stat-value${s.primary ? " cc-stat-value-primary" : ""}`}
                    style={s.primary ? undefined : { color: s.color }}
                  >
                    {s.value}
                  </div>
                  <div className="cc-stat-sub">{s.sub}</div>
                </div>
              ))}
            </div>

            {/* Progress bar */}
            <div className="cc-progress-wrap">
              <div className="cc-progress-track">
                <div
                  className="cc-progress-fill"
                  style={{
                    width: `${pct}%`,
                    background: `linear-gradient(90deg, ${accent}, ${accent}88)`,
                  }}
                />
              </div>
            </div>

            {/* Footer */}
            <div className="cc-footer" onClick={(e) => e.stopPropagation()}>
              <span className="cc-footer-date">{startDate} → ongoing</span>
              <div className="cc-footer-right">
                <button
                  className="cc-btn cc-btn-ghost"
                  onClick={() => onSelect(campaign)}
                >
                  Manage →
                </button>
                <button
                  className={`cc-btn ${campaign.state === "paused" ? "cc-btn-green" : "cc-btn-amber"}`}
                  onClick={() => onPauseToggle(campaign)}
                >
                  {campaign.state === "paused" ? "▶ Resume" : "⏸ Pause"}
                </button>
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}
