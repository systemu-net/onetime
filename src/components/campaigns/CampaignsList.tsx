import { getCampaignType } from "@/apis/campaigns";
import type { Campaign } from "@/types/campaigns";
import { Pin, PinOff, Trash2 } from "lucide-react";
import React, { memo, useCallback, useState, type CSSProperties } from "react";
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

function makeSpark(id: number): number[] {
  return Array.from({ length: 8 }, (_, i) => {
    const v = ((id * (i + 3) * 7) % 89) + 11;
    return Math.min(100, v);
  });
}

// ── CampaignCard ──────────────────────────────────────────────────────────────
// Scalar props so React.memo can skip re-renders when nothing changed.

interface CampaignCardProps {
  campaign: Campaign;
  isSelected: boolean;
  isChecked: boolean;
  isPinned: boolean;
  maxClicks: number;
  showDivider: boolean;
  onSelect: (campaign: Campaign) => void;
  onPauseToggle: (campaign: Campaign) => void;
  onToggleCheck: (id: number) => void;
  onTogglePin: (id: number) => void;
  onDelete: (campaignId: number) => Promise<void>;
}

const CampaignCard = memo(function CampaignCard({
  campaign,
  isSelected,
  isChecked,
  isPinned,
  maxClicks,
  showDivider,
  onSelect,
  onPauseToggle,
  onToggleCheck,
  onTogglePin,
  onDelete,
}: CampaignCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const campaignType = getCampaignType(campaign.name);
  const accent = campaign.accentColor || "#7c3aed";
  const totalClicks = campaign.totalClicks;
  const pct = Math.min(100, (totalClicks / Math.max(maxClicks, 1)) * 100);
  const spark = makeSpark(campaign.id);
  const sparkPeak = Math.max(...spark, 1);
  const iconBg = `${accent}26`;
  const iconBorder = `${accent}40`;
  const startDate = new Date(campaign.createdAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  const handleDelete = useCallback(
    async (e: React.MouseEvent) => {
      e.stopPropagation();
      if (!window.confirm(`Delete "${campaign.name}"? This cannot be undone.`))
        return;
      setIsDeleting(true);
      try {
        await onDelete(campaign.id);
      } finally {
        setIsDeleting(false);
      }
    },
    [campaign.id, campaign.name, onDelete],
  );

  const handleSelect = useCallback(
    () => onSelect(campaign),
    [campaign, onSelect],
  );
  const handlePauseToggle = useCallback(
    () => onPauseToggle(campaign),
    [campaign, onPauseToggle],
  );
  const handleCheck = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onToggleCheck(campaign.id);
    },
    [campaign.id, onToggleCheck],
  );
  const handlePin = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onTogglePin(campaign.id);
    },
    [campaign.id, onTogglePin],
  );

  return (
    <React.Fragment>
      <article
        className={`cc-campaign-card${isSelected ? " cc-campaign-card--selected" : ""}${isPinned ? " cc-campaign-card--pinned" : ""}`}
        style={{ "--cc-accent": accent } as CSSProperties}
        onClick={handleSelect}
      >
        {/* Header */}
        <div className="cc-header">
          <div
            className={`cc-check-box${isChecked ? " cc-checked" : ""}`}
            onClick={handleCheck}
          >
            {isChecked && "✓"}
          </div>

          <div
            className="cc-icon"
            style={{ background: iconBg, border: `1px solid ${iconBorder}` }}
          >
            {TYPE_ICONS[campaignType] ?? "🚀"}
          </div>

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
              {campaign.isDefault && (
                <span
                  className="cc-pin-inline-badge"
                  title="This is the default campaign. New links are assigned here automatically."
                  style={{
                    background: "#ede9fe",
                    color: "#6d28d9",
                    borderColor: "#c4b5fd",
                  }}
                >
                  ⚑ Default
                </span>
              )}
              {isPinned && (
                <span className="cc-pin-inline-badge">
                  <Pin size={9} strokeWidth={2.5} />
                  Pinned
                </span>
              )}
            </div>
          </div>

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

          <button
            title={isPinned ? "Unpin campaign" : "Pin to top"}
            onClick={handlePin}
            className={`cc-pin-btn${isPinned ? " cc-pin-btn--active" : ""}`}
          >
            {isPinned ? (
              <PinOff size={14} strokeWidth={2} />
            ) : (
              <Pin size={14} strokeWidth={2} />
            )}
          </button>
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
            <button className="cc-btn cc-btn-ghost" onClick={handleSelect}>
              Manage →
            </button>
            <button
              className={`cc-btn ${campaign.state === "paused" ? "cc-btn-green" : "cc-btn-amber"}`}
              onClick={handlePauseToggle}
            >
              {campaign.state === "paused" ? "▶ Resume" : "⏸ Pause"}
            </button>
            {!campaign.isDefault && (
              <button
                className="cc-btn cc-btn-danger"
                title="Delete campaign"
                disabled={isDeleting}
                onClick={handleDelete}
              >
                <Trash2 size={13} strokeWidth={2} />
              </button>
            )}
          </div>
        </div>
      </article>

      {showDivider && (
        <div className="cc-pin-divider">
          <span>Other campaigns</span>
        </div>
      )}
    </React.Fragment>
  );
});

// ── CampaignsList ─────────────────────────────────────────────────────────────

interface CampaignsListProps {
  campaigns: Campaign[];
  selectedId: number | null;
  maxClicks: number;
  checkedIds: Set<number>;
  pinnedIds: Set<number>;
  onSelect: (campaign: Campaign) => void;
  onPauseToggle: (campaign: Campaign) => void;
  onToggleCheck: (id: number) => void;
  onTogglePin: (id: number) => void;
  onDelete: (campaignId: number) => Promise<void>;
}

export function CampaignsList({
  campaigns,
  selectedId,
  maxClicks,
  checkedIds,
  pinnedIds,
  onSelect,
  onPauseToggle,
  onToggleCheck,
  onTogglePin,
  onDelete,
}: CampaignsListProps) {
  const pinnedCount = campaigns.filter((c) => pinnedIds.has(c.id)).length;

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
      {campaigns.map((campaign, index) => (
        <CampaignCard
          key={campaign.id}
          campaign={campaign}
          isSelected={selectedId === campaign.id}
          isChecked={checkedIds.has(campaign.id)}
          isPinned={pinnedIds.has(campaign.id)}
          maxClicks={maxClicks}
          showDivider={
            index === pinnedCount - 1 &&
            pinnedCount > 0 &&
            pinnedCount < campaigns.length
          }
          onSelect={onSelect}
          onPauseToggle={onPauseToggle}
          onToggleCheck={onToggleCheck}
          onTogglePin={onTogglePin}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
