import type { Campaign } from "@/types/campaigns";

interface CampaignsInsightsPanelProps {
  campaigns: Campaign[];
}

const ACTIVITY = [
  {
    text: "Campaign state updated from dashboard",
    time: "8m ago",
    color: "#f59e0b",
  },
  {
    text: "Bulk pause executed for active campaigns",
    time: "1h ago",
    color: "#7c3aed",
  },
  {
    text: "New campaign created and awaiting links",
    time: "3h ago",
    color: "#10b981",
  },
  {
    text: "Campaign scheduled — activates soon",
    time: "6h ago",
    color: "#3b82f6",
  },
  {
    text: "Routing rules updated on governed link",
    time: "1d ago",
    color: "#06b6d4",
  },
];

/** SVG donut chart matching the reference design */
function Donut({
  segments,
  size = 80,
}: {
  segments: { pct: number; color: string }[];
  size?: number;
}) {
  const r = 28;
  const cx = size / 2;
  const cy = size / 2;
  const circ = 2 * Math.PI * r;
  let offset = 0;
  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      style={{ transform: "rotate(-90deg)", flexShrink: 0 }}
    >
      <circle
        cx={cx}
        cy={cy}
        r={r}
        fill="none"
        stroke="rgba(82,82,100,0.4)"
        strokeWidth={8}
      />
      {segments.map((seg, i) => {
        const dash = (seg.pct / 100) * circ;
        const el = (
          <circle
            key={i}
            cx={cx}
            cy={cy}
            r={r}
            fill="none"
            stroke={seg.color}
            strokeWidth={8}
            strokeDasharray={`${dash} ${circ}`}
            strokeDashoffset={-offset}
            strokeLinecap="butt"
          />
        );
        offset += dash;
        return el;
      })}
    </svg>
  );
}

export function CampaignsInsightsPanel({
  campaigns,
}: CampaignsInsightsPanelProps) {
  // Flatten links across all campaigns, sorted by clicks descending
  const topLinks = campaigns
    .flatMap((campaign) =>
      campaign.links.map((link) => ({
        ...link,
        campaignName: campaign.name,
        campaignColor: campaign.accentColor || "#7c3aed",
      })),
    )
    .sort((a, b) => b.clicksCount - a.clicksCount)
    .slice(0, 6);

  const topLinksPeak = topLinks.reduce((m, l) => Math.max(m, l.clicksCount), 1);

  // Health donut segments
  const counts = campaigns.reduce(
    (acc, c) => {
      if (c.state === "active") acc.active++;
      else if (c.state === "paused") acc.paused++;
      else if (c.state === "archived") acc.archived++;
      else if (c.state === "expired") acc.expired++;
      return acc;
    },
    { active: 0, paused: 0, archived: 0, expired: 0 },
  );
  const total = Math.max(campaigns.length, 1);
  const healthItems = [
    { label: "Active", value: counts.active, color: "#10b981" },
    { label: "Paused", value: counts.paused, color: "#f59e0b" },
    { label: "Archived", value: counts.archived, color: "#3b82f6" },
    { label: "Expired", value: counts.expired, color: "#ef4444" },
  ].filter((item) => item.value > 0);
  const donutSegs = healthItems.map((item) => ({
    pct: Math.round((item.value / total) * 100),
    color: item.color,
  }));

  return (
    <div className="cc-right-panel">
      {/* Top Performing Links */}
      <div className="cc-panel-card">
        <div className="cc-panel-head">
          <span className="cc-panel-head-title">Top Performing Links</span>
        </div>
        <div className="cc-panel-body">
          {topLinks.length === 0 ? (
            <p style={{ fontSize: 12, color: "#a3a3b2" }}>No links yet.</p>
          ) : (
            topLinks.map((link, i) => (
              <div key={link.id} className="cc-mini-link">
                <div className="cc-mini-link-rank">{i + 1}</div>
                <div
                  className="cc-mini-link-dot"
                  style={{ background: link.campaignColor }}
                />
                <div className="cc-mini-link-info">
                  <div className="cc-mini-link-name">
                    {link.title || link.lookupCode}
                  </div>
                  <div className="cc-mini-link-campaign">
                    {link.campaignName}
                  </div>
                </div>
                <div style={{ textAlign: "right", flexShrink: 0 }}>
                  <div className="cc-mini-link-clicks">
                    {link.clicksCount.toLocaleString()}
                  </div>
                  <div className="cc-mini-link-bar">
                    <div
                      className="cc-mini-link-fill"
                      style={{
                        width: `${(link.clicksCount / topLinksPeak) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Health Overview */}
      <div className="cc-panel-card">
        <div className="cc-panel-head">
          <span className="cc-panel-head-title">Health Overview</span>
        </div>
        <div className="cc-panel-body">
          {campaigns.length === 0 ? (
            <p style={{ fontSize: 12, color: "#a3a3b2" }}>No campaigns yet.</p>
          ) : (
            <div className="cc-donut-wrap">
              <Donut
                segments={
                  donutSegs.length
                    ? donutSegs
                    : [{ pct: 100, color: "rgba(82,82,100,0.5)" }]
                }
              />
              <div className="cc-donut-legend">
                {healthItems.map((item) => (
                  <div key={item.label} className="cc-donut-leg-item">
                    <div
                      className="cc-donut-leg-dot"
                      style={{ background: item.color }}
                    />
                    <div className="cc-donut-leg-label">{item.label}</div>
                    <div className="cc-donut-leg-val">{item.value}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="cc-panel-card">
        <div className="cc-panel-head">
          <span className="cc-panel-head-title">Recent Activity</span>
        </div>
        <div className="cc-panel-body" style={{ padding: "8px 16px" }}>
          {ACTIVITY.map((a, i) => (
            <div key={i} className="cc-activity-item">
              <div className="cc-act-dot" style={{ background: a.color }} />
              <div className="cc-act-text">{a.text}</div>
              <div className="cc-act-time">{a.time}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
