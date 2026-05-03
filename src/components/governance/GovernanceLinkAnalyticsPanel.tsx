import { getLinkAnalytics } from "@/apis/shorten";
import type { LinkAnalytics } from "@/types";
import { useEffect, useState } from "react";
import WorldMapComponent from "../WorldMapComponent";
import "./governance.css";

// ── Types ─────────────────────────────────────────────────────────────────────

type Period = "7d" | "30d" | "3m" | "1y";

interface Props {
  lookupCode: string;
  token: string;
  onToast: (msg: string, type?: "success" | "info" | "error" | "warning") => void;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function getPeriodDates(p: Period): { startDate: string; endDate: string } {
  const end = new Date();
  const start = new Date();
  if (p === "7d")  start.setDate(start.getDate() - 7);
  if (p === "30d") start.setDate(start.getDate() - 30);
  if (p === "3m")  start.setMonth(start.getMonth() - 3);
  if (p === "1y")  start.setFullYear(start.getFullYear() - 1);
  const fmt = (d: Date) => d.toISOString().split("T")[0];
  return { startDate: fmt(start), endDate: fmt(end) };
}

const W = 600, H = 60, PX = 4;

function buildSparkPoints(days: { date: string; clicks: number }[]): string {
  if (days.length < 2) return "";
  const max = Math.max(...days.map((d) => d.clicks), 1);
  return days
    .map((d, i) => {
      const x = PX + (i / (days.length - 1)) * (W - PX * 2);
      const y = (H - 4) - (d.clicks / max) * (H - 8);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

// ── Local sub-components ──────────────────────────────────────────────────────

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="gov-analytics-metric-card" style={{ marginBottom: 12 }}>
      <div className="gov-analytics-metric-label" style={{ marginBottom: 10 }}>{title}</div>
      {children}
    </div>
  );
}

function BarChart({
  rows,
  accent = "#7c3aed",
}: {
  rows: { label: string; value: number }[];
  accent?: string;
}) {
  const max = Math.max(...rows.map((r) => r.value), 1);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {rows.map((r) => (
        <div key={r.label} className="gov-analytics-bar-row">
          <span className="gov-analytics-bar-label" title={r.label}>{r.label}</span>
          <div className="gov-analytics-bar-track">
            <div
              className="gov-analytics-bar-fill"
              style={{ width: `${(r.value / max) * 100}%`, background: accent }}
            />
          </div>
          <span className="gov-analytics-bar-count">{r.value.toLocaleString()}</span>
        </div>
      ))}
    </div>
  );
}

function MetricCard({
  label,
  value,
  sub,
  accent,
}: {
  label: string;
  value: number;
  sub: string;
  accent: string;
}) {
  return (
    <div className="gov-analytics-metric-card">
      <div className="gov-analytics-metric-label">{label}</div>
      <div className="gov-analytics-metric-value" style={{ color: accent }}>
        {value.toLocaleString()}
      </div>
      <div className="gov-analytics-metric-sub">{sub}</div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export function GovernanceLinkAnalyticsPanel({ lookupCode, token, onToast }: Props) {
  const [period, setPeriod] = useState<Period>("30d");
  const [data, setData] = useState<LinkAnalytics | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    const { startDate, endDate } = getPeriodDates(period);
    (getLinkAnalytics as (token: string, code: string, start: string, end: string) => Promise<LinkAnalytics>)(
      token, lookupCode, startDate, endDate,
    )
      .then((res) => { if (!cancelled) setData(res); })
      .catch((e: Error) => {
        if (!cancelled) {
          setError(e.message);
          onToast(`Analytics failed: ${e.message}`, "error");
        }
      })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [lookupCode, token, period, retryCount]); // eslint-disable-line react-hooks/exhaustive-deps

  const PERIODS: { id: Period; label: string }[] = [
    { id: "7d", label: "7d" },
    { id: "30d", label: "30d" },
    { id: "3m", label: "3m" },
    { id: "1y", label: "1y" },
  ];

  const sparkPoints = data ? buildSparkPoints(data.daily_clicks) : "";
  const sparkFirst = data?.daily_clicks[0]?.date;
  const sparkMid = data?.daily_clicks[Math.floor((data.daily_clicks.length - 1) / 2)]?.date;
  const sparkLast = data?.daily_clicks[data.daily_clicks.length - 1]?.date;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
      {/* Period selector */}
      <div className="gov-analytics-period-strip">
        {PERIODS.map((p) => (
          <button
            key={p.id}
            className={`gov-analytics-period-btn${period === p.id ? " gov-analytics-period-btn--active" : ""}`}
            onClick={() => setPeriod(p.id)}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Loading shimmer */}
      {loading && (
        <div>
          <div className="gov-analytics-metric-grid">
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className="gov-analytics-metric-card gov-analytics-shimmer"
                style={{ height: 80 }}
              />
            ))}
          </div>
          <div
            className="gov-analytics-sparkline-wrap gov-analytics-shimmer"
            style={{ height: 96, marginBottom: 12 }}
          />
          <div className="gov-analytics-two-col">
            <div className="gov-analytics-metric-card gov-analytics-shimmer" style={{ height: 100 }} />
            <div className="gov-analytics-metric-card gov-analytics-shimmer" style={{ height: 100 }} />
          </div>
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <div className="gov-analytics-error">
          <span>⚠ Failed to load analytics</span>
          <span style={{ fontSize: 12, color: "#a3a3b2" }}>{error}</span>
          <button
            className="gov-analytics-period-btn"
            style={{ marginTop: 6, alignSelf: "flex-start" }}
            onClick={() => setRetryCount((c) => c + 1)}
          >
            Retry
          </button>
        </div>
      )}

      {/* Empty */}
      {!loading && !error && data && data.summary.total_clicks === 0 && (
        <div className="gov-analytics-empty">
          <div className="gov-analytics-empty-icon">📊</div>
          <span>No clicks recorded for this period.</span>
          <span style={{ fontSize: 11, opacity: 0.7 }}>Try selecting a wider time range.</span>
        </div>
      )}

      {/* Data */}
      {!loading && !error && data && data.summary.total_clicks > 0 && (
        <>
          {/* Summary metric cards */}
          <div className="gov-analytics-metric-grid">
            <MetricCard
              label="Total Clicks"
              value={data.summary.total_clicks}
              sub="all traffic"
              accent="#7c3aed"
            />
            <MetricCard
              label="Human Clicks"
              value={data.summary.human_clicks}
              sub={`${Math.round((data.summary.human_clicks / data.summary.total_clicks) * 100)}% of total`}
              accent="#10b981"
            />
            <MetricCard
              label="QR Scans"
              value={data.summary.qr_scans}
              sub="via QR code"
              accent="#3b82f6"
            />
            <MetricCard
              label="Bot Clicks"
              value={data.summary.bot_clicks}
              sub={`${Math.round((data.summary.bot_clicks / data.summary.total_clicks) * 100)}% of total`}
              accent="#f59e0b"
            />
          </div>

          {/* Sparkline — daily clicks time series */}
          {sparkPoints && (
            <div className="gov-analytics-sparkline-wrap">
              <div className="gov-analytics-sparkline-title">Daily Clicks</div>
              <svg
                viewBox={`0 0 ${W} ${H}`}
                preserveAspectRatio="none"
                className="gov-analytics-sparkline"
              >
                <defs>
                  <linearGradient id={`spark-grad-${lookupCode}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#7c3aed" stopOpacity="0.22" />
                    <stop offset="100%" stopColor="#7c3aed" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <polygon
                  points={`${PX},${H} ${sparkPoints} ${W - PX},${H}`}
                  fill={`url(#spark-grad-${lookupCode})`}
                />
                <polyline
                  points={sparkPoints}
                  fill="none"
                  stroke="#7c3aed"
                  strokeWidth="1.5"
                  strokeLinejoin="round"
                  strokeLinecap="round"
                />
              </svg>
              <div className="gov-analytics-sparkline-labels">
                <span>{sparkFirst ? fmtDate(sparkFirst) : ""}</span>
                <span>{sparkMid ? fmtDate(sparkMid) : ""}</span>
                <span>{sparkLast ? fmtDate(sparkLast) : ""}</span>
              </div>
            </div>
          )}

          {/* Devices + Traffic sources side by side */}
          <div className="gov-analytics-two-col">
            <SectionCard title="Devices">
              <BarChart
                rows={[
                  { label: "Desktop", value: data.devices.desktop },
                  { label: "Mobile", value: data.devices.mobile },
                  { label: "Tablet", value: data.devices.tablet },
                ].filter((r) => r.value > 0)}
                accent="#7c3aed"
              />
            </SectionCard>
            <SectionCard title="Traffic">
              <BarChart
                rows={[
                  { label: "Direct", value: data.summary.direct_clicks },
                  { label: "QR Scan", value: data.summary.qr_scans },
                ].filter((r) => r.value > 0)}
                accent="#3b82f6"
              />
            </SectionCard>
          </div>

          {/* Referrer sources */}
          {data.referrer_sources && data.referrer_sources.length > 0 && (
            <SectionCard title="Referrer Sources">
              <BarChart
                rows={data.referrer_sources.map((r) => ({ label: r.source, value: r.clicks }))}
                accent="#06b6d4"
              />
            </SectionCard>
          )}

          {/* Top cities */}
          {data.top_cities.length > 0 && (
            <SectionCard title="Top Cities">
              <BarChart
                rows={data.top_cities.slice(0, 8).map((c) => ({
                  label: c.region ? `${c.city}, ${c.region}` : c.city,
                  value: c.clicks,
                }))}
                accent="#10b981"
              />
            </SectionCard>
          )}

          {/* Browsers + OS side by side */}
          <div className="gov-analytics-two-col">
            {data.browsers.length > 0 && (
              <SectionCard title="Browsers">
                <BarChart
                  rows={data.browsers.slice(0, 5).map((b) => ({ label: b.browser, value: b.clicks }))}
                  accent="#a855f7"
                />
              </SectionCard>
            )}
            {data.operating_systems.length > 0 && (
              <SectionCard title="Operating Systems">
                <BarChart
                  rows={data.operating_systems.slice(0, 5).map((o) => ({ label: o.os, value: o.clicks }))}
                  accent="#f59e0b"
                />
              </SectionCard>
            )}
          </div>

          {/* World map */}
          <SectionCard title="Countries">
            <WorldMapComponent
              data={data.countries.map((c) => ({ name: c.country, value: c.clicks }))}
            />
          </SectionCard>
        </>
      )}
    </div>
  );
}
