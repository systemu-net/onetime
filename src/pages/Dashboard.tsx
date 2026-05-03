import { fetchCampaigns } from "@/apis/campaigns";
import { fetchGovernanceLinks } from "@/apis/governance";
import type { Campaign } from "@/types/campaigns";
import { ClicksIcon } from "@/components/icons/ClicksIcon";
import { useEffect, useRef, useState } from "react";
import { useCookies } from "react-cookie";
import { Link } from "react-router-dom";
import "../components/campaigns/campaigns.css";
import { pageBase64Image } from "../components/images/pageBase64Image";
import { qrCodeBase64Image } from "../components/images/qrCodeBase64Image";
import { shortenBase64Image } from "../components/images/shortenBase64Image";
import MainLayout from "../components/layouts/MainLayout";
import {
  CAMPAIGNS_ROUTE,
  GOVERNANCE_ROUTE,
  LINKS_ROUTE,
  PAGES_ROUTE,
  PLANS_ROUTE,
  QR_ROUTE,
} from "../routes";

// ── Types ─────────────────────────────────────────────────────────────────────

interface DashStats {
  total: number;
  active: number;
  paused: number;
  totalClicks: number;
}

// ── Tool cards ────────────────────────────────────────────────────────────────

const TOOLS: {
  href: string;
  label: string;
  descr: string;
  accent: string;
  featured?: boolean;
  image?: string;
  icon?: string;
}[] = [
  {
    href: GOVERNANCE_ROUTE,
    label: "Link Governance",
    descr: "Lifecycle control, routing rules, campaigns",
    accent: "#7c3aed",
    featured: true,
    image: shortenBase64Image,
  },
  {
    href: CAMPAIGNS_ROUTE,
    icon: "📣",
    label: "Campaigns",
    descr: "Group links, track performance by campaign",
    accent: "#a855f7",
  },
  {
    href: LINKS_ROUTE,
    icon: "🔗",
    label: "Short Links",
    descr: "Create and manage shortened URLs",
    accent: "#3b82f6",
  },
  {
    href: QR_ROUTE,
    label: "QR Codes",
    descr: "Generate scannable QR codes instantly",
    accent: "#10b981",
    image: qrCodeBase64Image,
  },
  {
    href: PAGES_ROUTE,
    label: "Landing Pages",
    descr: "Build branded link-in-bio pages",
    accent: "#f59e0b",
    image: pageBase64Image,
  },
];

// ── Stat card ─────────────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  sub,
  accent,
  href,
  loading,
  delay,
}: {
  label: string;
  value: number;
  sub: string;
  accent: string;
  href: string;
  loading: boolean;
  delay: number;
}) {
  return (
    <Link
      to={href}
      className="dash-stat-card"
      style={{ "--stat-accent": accent, animationDelay: `${delay}ms` } as React.CSSProperties}
    >
      {loading ? (
        <div className="dash-shimmer" style={{ height: 64 }} />
      ) : (
        <>
          <div className="dash-stat-label">{label}</div>
          <div className="dash-stat-value" style={{ color: accent }}>{value.toLocaleString()}</div>
          <div className="dash-stat-sub">{sub}</div>
        </>
      )}
    </Link>
  );
}

// ── Plan feature bar ──────────────────────────────────────────────────────────

function FeatureBar({ name, used, limit }: { name: string; used: number; limit: number }) {
  const pct = limit > 0 ? Math.min((used / limit) * 100, 100) : 0;
  const color = pct > 90 ? "#ef4444" : pct > 70 ? "#f59e0b" : "#7c3aed";
  return (
    <div className="dash-feat-row">
      <div className="dash-feat-header">
        <span className="dash-feat-name">{name}</span>
        <span className="dash-feat-count" style={{ color }}>
          {used.toLocaleString()} / {limit.toLocaleString()}
        </span>
      </div>
      <div className="dash-feat-track">
        <div
          className="dash-feat-fill"
          style={{ width: `${pct}%`, background: color }}
        />
      </div>
    </div>
  );
}


// ── Main component ────────────────────────────────────────────────────────────

const DashboardPage = () => {
  const [cookies] = useCookies(["plan", "token", "email"]);
  const [stats, setStats] = useState<DashStats | null>(null);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [statsLoading, setStatsLoading] = useState(true);
  const [visible, setVisible] = useState(false);
  const pageRef = useRef<HTMLDivElement>(null);

  // entrance animation trigger
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 60);
    return () => clearTimeout(t);
  }, []);

  // fetch live stats
  useEffect(() => {
    if (!cookies.token) { setStatsLoading(false); return; }
    Promise.all([
      fetchGovernanceLinks(cookies.token, {}).catch(() => null),
      fetchCampaigns(cookies.token).catch(() => [] as Campaign[]),
    ]).then(([govPage, camps]) => {
      if (govPage) setStats(govPage.stats);
      setCampaigns(camps ?? []);
      setStatsLoading(false);
    });
  }, [cookies.token]);

  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
  })();

  const firstName = cookies.email?.split("@")[0] ?? "there";

  // Top 6 campaigns by totalClicks
  const topCampaigns = [...campaigns].sort((a, b) => b.totalClicks - a.totalClicks).slice(0, 6);

  return (
    <MainLayout>
      <style>{DASH_CSS}</style>

      <div ref={pageRef} className={`dash-page ${visible ? "dash-page--visible" : ""}`}>

        {/* ── Greeting ──────────────────────────────────────────────── */}
        <div className="dash-greeting">
          <div>
            <h1 className="dash-greeting-title">{greeting}, {firstName}</h1>
            <p className="dash-greeting-sub">
              {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
            </p>
          </div>
          <Link to={GOVERNANCE_ROUTE} className="dash-cta-btn">
            Open Governance →
          </Link>
        </div>

        {/* ── Stats strip ───────────────────────────────────────────── */}
        <div className="dash-stats-grid">
          <StatCard label="Total Links" value={stats?.total ?? 0} sub="across all states" accent="#7c3aed" href={GOVERNANCE_ROUTE} loading={statsLoading} delay={0} />
          <StatCard label="Active Links" value={stats?.active ?? 0} sub="currently live" accent="#10b981" href={GOVERNANCE_ROUTE + "?state=active"} loading={statsLoading} delay={60} />
          <StatCard label="Paused Links" value={stats?.paused ?? 0} sub="traffic suspended" accent="#f59e0b" href={GOVERNANCE_ROUTE + "?state=paused"} loading={statsLoading} delay={120} />
          <StatCard label="Total Clicks" value={stats?.totalClicks ?? 0} sub="all-time traffic" accent="#3b82f6" href={GOVERNANCE_ROUTE} loading={statsLoading} delay={180} />
        </div>

        {/* ── Tools ─────────────────────────────────────────────────── */}
        <h2 className="dash-section-title">Tools</h2>
        <div className="dash-tools-grid">
          {TOOLS.map((t, i) => (
            <Link
              key={t.href}
              to={t.href}
              className={`dash-tool-card ${t.featured ? "dash-tool-card--featured" : ""}`}
              style={{ "--tool-accent": t.accent } as React.CSSProperties}
            >
              {t.image ? (
                /* Authentic image card — original split layout */
                <div className="dash-tool-image-inner">
                  <div className="dash-tool-image-text">
                    <div className="dash-tool-label">{t.label}</div>
                    <div className="dash-tool-descr">{t.descr}</div>
                  </div>
                  <div
                    className="dash-tool-image-thumb"
                    style={{ backgroundImage: `url(${t.image})` }}
                  />
                </div>
              ) : (
                /* Icon card */
                <>
                  <span className="dash-tool-icon" style={{ background: `color-mix(in srgb, ${t.accent} 14%, transparent)`, color: t.accent }}>
                    {t.icon}
                  </span>
                  <div className="dash-tool-text">
                    <div className="dash-tool-label">{t.label}</div>
                    <div className="dash-tool-descr">{t.descr}</div>
                  </div>
                  <span className="dash-tool-arrow">→</span>
                </>
              )}
            </Link>
          ))}
        </div>

        {/* ── Bottom two-col ────────────────────────────────────────── */}
        <div className="dash-bottom-grid">

          {/* Plan details — cc-panel style */}
          <div className="cc-panel-card">
            <div className="cc-panel-head">
              <span className="cc-panel-head-title">Current Plan</span>
            </div>
            <div className="cc-panel-body">
              <div className="dash-plan-name-row">
                <span className="dash-plan-name">{cookies.plan?.name ?? "Free"}</span>
                <Link to={PLANS_ROUTE} className="dash-upgrade-btn">Upgrade plan</Link>
              </div>

              {cookies.plan?.features?.length > 0 ? (
                <div className="dash-feats">
                  {cookies.plan.features.map((f: { name: string; used: number; limit: number }, i: number) => (
                    <FeatureBar key={i} name={f.name} used={f.used} limit={f.limit} />
                  ))}
                </div>
              ) : (
                <p style={{ fontSize: 12, color: "#a3a3b2", marginTop: 8 }}>No feature data available.</p>
              )}
            </div>
          </div>

          {/* Top Performing Campaigns — cc-panel style */}
          <div className="cc-panel-card">
            <div className="cc-panel-head">
              <span className="cc-panel-head-title">Top Performing Campaigns</span>
              <Link to={CAMPAIGNS_ROUTE} style={{ fontSize: 11, color: "#7c3aed", textDecoration: "none", fontFamily: "'DM Mono', monospace" }}>
                View all →
              </Link>
            </div>
            <div className="cc-panel-body">
              {statsLoading ? (
                <>
                  {[0,1,2,3].map((i) => <div key={i} className="dash-shimmer" style={{ height: 36, marginBottom: 8, borderRadius: 6 }} />)}
                </>
              ) : topCampaigns.length === 0 ? (
                <p style={{ fontSize: 12, color: "#a3a3b2" }}>No campaigns yet.</p>
              ) : (
                topCampaigns.map((camp, i) => (
                  <Link key={camp.id} to={CAMPAIGNS_ROUTE} className="cc-mini-link cc-mini-link-button" style={{ display: "flex", textDecoration: "none" }}>
                    <div className="cc-mini-link-rank">{i + 1}</div>
                    <div className="cc-mini-link-dot" style={{ background: camp.accentColor ?? "#7c3aed" }} />
                    <div className="cc-mini-link-info">
                      <div className="cc-mini-link-name">{camp.name}</div>
                      <div className="cc-mini-link-campaign">
                        {camp.linksCount} link{camp.linksCount !== 1 ? "s" : ""} · {camp.state}
                      </div>
                    </div>
                    <div className="dash-clicks-pill">
                      <ClicksIcon className="h-3.5 w-3.5 shrink-0 text-blue-500" />
                      <span>{camp.totalClicks.toLocaleString()} {camp.totalClicks === 1 ? "click" : "clicks"}</span>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </div>
        </div>

      </div>
    </MainLayout>
  );
};

// ── Scoped CSS ────────────────────────────────────────────────────────────────

const DASH_CSS = `
.dash-page {
  padding-bottom: 48px;
  opacity: 0;
  transform: translateY(10px);
  transition: opacity 0.4s ease, transform 0.4s ease;
}
.dash-page--visible {
  opacity: 1;
  transform: translateY(0);
}

/* Greeting */
.dash-greeting {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 28px;
  flex-wrap: wrap;
}
.dash-greeting-title {
  font-size: 22px;
  font-weight: 700;
  color: #18181b;
  letter-spacing: -0.4px;
  margin: 0;
}
.dark .dash-greeting-title { color: #f4f4f5; }
.dash-greeting-sub {
  font-size: 13px;
  color: #71717a;
  margin: 4px 0 0;
}
.dash-cta-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 9px 20px;
  border-radius: 10px;
  background: linear-gradient(135deg, #7c3aed, #a855f7);
  color: #fff;
  font-size: 13.5px;
  font-weight: 600;
  text-decoration: none;
  box-shadow: 0 0 24px rgba(124,58,237,0.25);
  transition: opacity 0.15s, transform 0.15s;
  white-space: nowrap;
}
.dash-cta-btn:hover { opacity: 0.9; transform: translateY(-1px); }

/* Stats grid */
.dash-stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
  margin-bottom: 28px;
}
@media (max-width: 900px) { .dash-stats-grid { grid-template-columns: repeat(2, 1fr); } }
@media (max-width: 480px) { .dash-stats-grid { grid-template-columns: 1fr 1fr; } }

.dash-stat-card {
  background: #fff;
  border: 1px solid #e4e4e7;
  border-radius: 12px;
  padding: 16px 18px;
  text-decoration: none;
  display: block;
  transition: border-color 0.15s, box-shadow 0.15s, transform 0.15s;
  position: relative;
  overflow: hidden;
}
.dash-stat-card::before {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 2px;
  background: var(--stat-accent, #7c3aed);
  opacity: 0;
  transition: opacity 0.15s;
}
.dash-stat-card:hover { border-color: rgba(124,58,237,0.3); box-shadow: 0 4px 20px rgba(124,58,237,0.1); transform: translateY(-2px); }
.dash-stat-card:hover::before { opacity: 1; }
.dark .dash-stat-card { background: #18181b; border-color: rgba(255,255,255,0.08); }
.dark .dash-stat-card:hover { border-color: rgba(124,58,237,0.4); }

.dash-stat-label {
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #a1a1aa;
  margin-bottom: 8px;
}
.dash-stat-value {
  font-size: 28px;
  font-weight: 800;
  letter-spacing: -1px;
  line-height: 1;
  margin-bottom: 4px;
}
.dash-stat-sub {
  font-size: 11px;
  color: #a1a1aa;
}

/* Section title */
.dash-section-title {
  font-size: 14px;
  font-weight: 700;
  color: #18181b;
  letter-spacing: -0.2px;
  margin: 0 0 12px;
}
.dark .dash-section-title { color: #f4f4f5; }

/* Tools grid */
.dash-tools-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 10px;
  margin-bottom: 28px;
}
@media (max-width: 1100px) { .dash-tools-grid { grid-template-columns: repeat(3, 1fr); } }
@media (max-width: 640px)  { .dash-tools-grid { grid-template-columns: 1fr 1fr; } }

.dash-tool-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  background: #fff;
  border: 1px solid #e4e4e7;
  border-radius: 12px;
  text-decoration: none;
  transition: border-color 0.15s, box-shadow 0.15s, transform 0.15s;
  position: relative;
  overflow: hidden;
  min-height: 80px;
}
/* Image cards — remove gap/padding so the inner div fills edge-to-edge */
.dash-tool-card:has(.dash-tool-image-inner) {
  gap: 0;
  padding: 0;
}
.dash-tool-card:hover {
  border-color: color-mix(in srgb, var(--tool-accent, #7c3aed) 40%, transparent);
  box-shadow: 0 4px 20px color-mix(in srgb, var(--tool-accent, #7c3aed) 12%, transparent);
  transform: translateY(-2px);
}
.dash-tool-card--featured {
  border-color: rgba(124,58,237,0.3);
  background: linear-gradient(135deg, rgba(124,58,237,0.04), rgba(168,85,247,0.02));
  box-shadow: 0 0 0 1px rgba(124,58,237,0.1);
}
.dark .dash-tool-card { background: #18181b; border-color: rgba(255,255,255,0.08); }
.dark .dash-tool-card--featured { background: linear-gradient(135deg, rgba(124,58,237,0.1), rgba(168,85,247,0.05)); border-color: rgba(124,58,237,0.35); }

.dash-tool-icon {
  width: 38px;
  height: 38px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 17px;
  flex-shrink: 0;
}
.dash-tool-text { flex: 1; min-width: 0; }
.dash-tool-label {
  font-size: 13px;
  font-weight: 700;
  color: #18181b;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.dark .dash-tool-label { color: #f4f4f5; }
.dash-tool-descr {
  font-size: 11px;
  color: #71717a;
  margin-top: 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.dash-tool-arrow {
  font-size: 14px;
  color: #a1a1aa;
  flex-shrink: 0;
  transition: transform 0.15s, color 0.15s;
}
.dash-tool-card:hover .dash-tool-arrow {
  transform: translateX(3px);
  color: var(--tool-accent, #7c3aed);
}

/* Bottom two-col */
.dash-bottom-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}
@media (max-width: 800px) { .dash-bottom-grid { grid-template-columns: 1fr; } }

/* Panel */
.dash-panel {
  background: #fff;
  border: 1px solid #e4e4e7;
  border-radius: 14px;
  padding: 20px 22px;
}
.dark .dash-panel { background: #18181b; border-color: rgba(255,255,255,0.08); }

/* Plan name row */
.dash-plan-name-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 18px;
  padding-bottom: 14px;
  border-bottom: 1px solid rgba(115,115,130,0.2);
}
.dash-plan-name {
  font-size: 20px;
  font-weight: 800;
  color: #f4f4f5;
  letter-spacing: -0.5px;
}
html:not(.dark) .dash-plan-name { color: #18181b; }

/* Upgrade button — sleek dark pill */
.dash-upgrade-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 9px 22px;
  border-radius: 999px;
  background: #09090b;
  color: #fafafa;
  font-size: 13px;
  font-weight: 600;
  letter-spacing: -0.1px;
  text-decoration: none;
  white-space: nowrap;
  border: 1px solid rgba(255,255,255,0.08);
  box-shadow: 0 1px 3px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.04) inset;
  transition: background 0.15s, box-shadow 0.15s, transform 0.15s;
}
.dash-upgrade-btn:hover {
  background: #1c1c1e;
  box-shadow: 0 3px 12px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.06) inset;
  transform: translateY(-1px);
}
html:not(.dark) .dash-upgrade-btn {
  background: #09090b;
  color: #fafafa;
  border-color: transparent;
  box-shadow: 0 2px 8px rgba(0,0,0,0.25);
}
html:not(.dark) .dash-upgrade-btn:hover {
  background: #18181b;
  box-shadow: 0 4px 14px rgba(0,0,0,0.3);
}

/* Feature bars */
.dash-feats { display: flex; flex-direction: column; gap: 14px; }
.dash-feat-row {}
.dash-feat-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
}
.dash-feat-name { font-size: 12.5px; font-weight: 500; color: #a3a3b2; }
html:not(.dark) .dash-feat-name { color: #52525b; }
.dash-feat-count { font-size: 12px; font-weight: 600; font-variant-numeric: tabular-nums; }
.dash-feat-track {
  height: 5px;
  background: rgba(115,115,130,0.25);
  border-radius: 999px;
  overflow: hidden;
}
html:not(.dark) .dash-feat-track { background: #e4e4e7; }
.dash-feat-fill {
  height: 100%;
  border-radius: 999px;
  transition: width 0.6s ease;
}

/* Clicks pill — matches old links page style */
.dash-clicks-pill {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 8px;
  border-radius: 6px;
  border: 1px solid rgba(115,115,130,0.25);
  background: rgba(17,17,24,0.5);
  font-size: 11.5px;
  color: #d4d4df;
  font-family: "DM Mono", monospace;
  white-space: nowrap;
}
html:not(.dark) .dash-clicks-pill {
  background: #f5f5f7;
  border-color: #e4e4e7;
  color: #52525b;
}

/* Image tool card — original split layout */
.dash-tool-image-inner {
  display: flex;
  width: 100%;
  height: 100%;
  min-height: 80px;
}
.dash-tool-image-text {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-width: 0;
  padding: 14px 16px;
}
.dash-tool-image-thumb {
  width: 38%;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  flex-shrink: 0;
  border-radius: 0 10px 10px 0;
}

.dash-view-all {
  display: block;
  text-align: center;
  font-size: 12.5px;
  font-weight: 600;
  color: #7c3aed;
  text-decoration: none;
  padding: 8px;
  border-radius: 8px;
  border: 1px solid rgba(124,58,237,0.2);
  background: rgba(124,58,237,0.04);
  transition: background 0.12s, border-color 0.12s;
}
.dash-view-all:hover { background: rgba(124,58,237,0.1); border-color: rgba(124,58,237,0.35); }

/* Shimmer */
@keyframes dash-shimmer { 0%,100%{opacity:.5} 50%{opacity:1} }
.dash-shimmer {
  background: #f4f4f5;
  border-radius: 8px;
  animation: dash-shimmer 1.4s ease-in-out infinite;
}
.dark .dash-shimmer { background: rgba(255,255,255,0.06); }
`;

export default DashboardPage;
