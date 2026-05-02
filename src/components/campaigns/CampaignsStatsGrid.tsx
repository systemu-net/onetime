import type { CSSProperties } from "react";

interface CampaignsStatsGridProps {
  totalCampaigns: number;
  activeCampaigns: number;
  governedLinks: number;
  totalClicks: number;
}

export function CampaignsStatsGrid({
  totalCampaigns,
  activeCampaigns,
  governedLinks,
  totalClicks,
}: CampaignsStatsGridProps) {
  const cards = [
    {
      label: "Total Campaigns",
      value: totalCampaigns,
      sub: `${activeCampaigns} active`,
      bar: "linear-gradient(90deg,#7c3aed,#a855f7)",
      corner: "◈",
    },
    {
      label: "Governed Links",
      value: governedLinks,
      sub: "across all campaigns",
      bar: "linear-gradient(90deg,#3b82f6,#60a5fa)",
      corner: "⊞",
    },
    {
      label: "Total Clicks",
      value: totalClicks.toLocaleString(),
      sub: "all-time",
      bar: "linear-gradient(90deg,#10b981,#34d399)",
      corner: "⇗",
    },
    {
      label: "Conversions",
      value: "—",
      sub: "not tracked",
      bar: "linear-gradient(90deg,#ec4899,#f472b6)",
      corner: "⊙",
    },
    {
      label: "Est. Revenue",
      value: "$—",
      sub: "not tracked",
      bar: "linear-gradient(90deg,#f59e0b,#fbbf24)",
      corner: "◎",
    },
  ];

  return (
    <div className="cc-stats-row">
      {cards.map((card) => (
        <div
          key={card.label}
          className="cc-stat-card"
          style={{ "--cc-bar": card.bar } as CSSProperties}
        >
          <div className="cc-stat-card-label">{card.label}</div>
          <div className="cc-stat-card-value">{card.value}</div>
          <div className="cc-stat-card-sub">{card.sub}</div>
          <div className="cc-stat-card-corner">{card.corner}</div>
        </div>
      ))}
    </div>
  );
}
