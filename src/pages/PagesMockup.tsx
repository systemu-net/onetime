/**
 * PagesMockup — static visual mockup of the redesigned /pages dashboard.
 * Route: /pages-mockup
 * Direction: hero-phone cards · vivid & playful palette.
 * All data here is fake; nothing hits the API.
 */
import MainLayout from "@/components/layouts/MainLayout";
import Preview from "@/components/sections/Preview";
import type { Page, PageLink } from "@/types";
import {
  ExternalLink,
  MoreVertical,
  Pencil,
  Pin,
  PinOff,
  Search,
  Trash2,
} from "lucide-react";
import {
  type CSSProperties,
  type KeyboardEvent,
  useMemo,
  useState,
} from "react";
import { useNavigate } from "react-router-dom";

import "@/components/pages-mockup/pages-mockup.css";

// ─── Mock data ──────────────────────────────────────────────────────────────

type MockPage = Omit<Page, "status"> & {
  clicks: number;
  trend: number; // % vs prior period
  topLink: { name: string; clicks: number };
  spark: number[];
  updatedRel: string;
  isPrimary?: boolean;
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
};

function L(id: string, label: string, color: string, link: string): PageLink {
  return { id, label, color, link };
}

const MOCK_PAGES: MockPage[] = [
  {
    id: 1,
    lookup_code: "abc1234",
    published_lookup_code: "abc1234",
    title: "My Personal Links",
    description: "Everything I create, in one place.",
    created_at: "2026-05-03T10:00:00Z",
    updated_at: "2026-05-31T14:00:00Z",
    published_url: "https://thin.ly/abc1234",
    status: "PUBLISHED",
    isPrimary: true,
    clicks: 1247,
    trend: 18,
    topLink: { name: "QiYa1or", clicks: 55 },
    updatedRel: "2h ago",
    spark: [22, 38, 31, 47, 54, 49, 62, 71, 65, 80, 88, 92, 86, 98],
    links: [
      L("a", "Visit my Medium", "#7c3aed", "#"),
      L("b", "Latest course", "#3b82f6", "#"),
      L("c", "Twitter / X", "#0ea5e9", "#"),
      L("d", "Get the newsletter", "#10b981", "#"),
    ],
    content: {
      button: "rounded-lg",
      buttonColor: "#ffffff",
      textColor: "#ffffff",
      background: "",
      backgroundType: "gradient",
      gradientStart: "#7c3aed",
      gradientEnd: "#ec4899",
      gradientDirection: "to bottom",
      fontFamily: "Inter, sans-serif",
      social: { ig: "#", linkedin: "#" } as Page["content"]["social"],
    },
  },
  {
    id: 2,
    lookup_code: "lnch026",
    published_lookup_code: "lnch026",
    title: "Product Launch 2026",
    description: "Pricing, demo, waitlist, press kit.",
    created_at: "2026-04-12T08:00:00Z",
    updated_at: "2026-05-29T12:00:00Z",
    published_url: "https://thin.ly/lnch026",
    status: "PUBLISHED",
    clicks: 832,
    trend: 42,
    topLink: { name: "Join waitlist", clicks: 312 },
    updatedRel: "1d ago",
    spark: [12, 18, 26, 35, 41, 48, 52, 60, 58, 64, 70, 78, 82, 88],
    links: [
      L("a", "Watch the demo", "#0f172a", "#"),
      L("b", "Pricing", "#0f172a", "#"),
      L("c", "Join the waitlist", "#06b6d4", "#"),
      L("d", "Press kit", "#0f172a", "#"),
    ],
    content: {
      button: "rounded",
      buttonColor: "#ffffff",
      textColor: "#ffffff",
      background: "",
      backgroundType: "gradient",
      gradientStart: "#06b6d4",
      gradientEnd: "#3b82f6",
      gradientDirection: "to top right",
      fontFamily: "Inter, sans-serif",
      social: { linkedin: "#" } as Page["content"]["social"],
    },
  },
  {
    id: 3,
    lookup_code: "aicrs01",
    published_lookup_code: "aicrs01",
    title: "AI Course Resources",
    description: "Slides, notebooks, recordings.",
    created_at: "2026-03-20T08:00:00Z",
    updated_at: "2026-05-22T10:00:00Z",
    published_url: "https://thin.ly/aicrs01",
    status: "PUBLISHED",
    clicks: 423,
    trend: -8,
    topLink: { name: "Week 3 notebook", clicks: 96 },
    updatedRel: "9d ago",
    spark: [42, 38, 34, 30, 28, 26, 24, 22, 20, 18, 22, 20, 18, 16],
    links: [
      L("a", "Course intro", "#10b981", "#"),
      L("b", "Slides — week 1", "#10b981", "#"),
      L("c", "Notebooks", "#10b981", "#"),
    ],
    content: {
      button: "rounded-full",
      buttonColor: "#064e3b",
      textColor: "#ecfdf5",
      background: "",
      backgroundType: "gradient",
      gradientStart: "#10b981",
      gradientEnd: "#84cc16",
      gradientDirection: "to bottom",
      fontFamily: "Inter, sans-serif",
      social: {} as Page["content"]["social"],
    },
  },
  {
    id: 4,
    lookup_code: "newslt7",
    published_lookup_code: null,
    title: "Newsletter Signups",
    description: "",
    created_at: "2026-05-25T08:00:00Z",
    updated_at: "2026-05-30T16:00:00Z",
    status: "DRAFT",
    clicks: 0,
    trend: 0,
    topLink: { name: "—", clicks: 0 },
    updatedRel: "1d ago",
    spark: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    links: [
      L("a", "Subscribe", "#f59e0b", "#"),
      L("b", "Read back issues", "#f59e0b", "#"),
    ],
    content: {
      button: "rounded",
      buttonColor: "#7c2d12",
      textColor: "#7c2d12",
      background: "",
      backgroundType: "gradient",
      gradientStart: "#fbbf24",
      gradientEnd: "#f97316",
      gradientDirection: "to bottom",
      fontFamily: "Inter, sans-serif",
      social: {} as Page["content"]["social"],
    },
  },
  {
    id: 5,
    lookup_code: "spkrkt2",
    published_lookup_code: "spkrkt2",
    title: "Conference Speaker Kit",
    description: "Bio, photos, talk topics.",
    created_at: "2026-02-08T08:00:00Z",
    updated_at: "2026-05-18T10:00:00Z",
    published_url: "https://thin.ly/spkrkt2",
    status: "PUBLISHED",
    clicks: 287,
    trend: 5,
    topLink: { name: "Speaker bio", clicks: 88 },
    updatedRel: "13d ago",
    spark: [18, 22, 19, 24, 28, 25, 30, 29, 32, 28, 30, 34, 32, 36],
    links: [
      L("a", "Speaker bio", "#0ea5e9", "#"),
      L("b", "High-res photos", "#0ea5e9", "#"),
      L("c", "Talk topics", "#0ea5e9", "#"),
    ],
    content: {
      button: "rounded-sm",
      buttonColor: "#ffffff",
      textColor: "#0c4a6e",
      background: "",
      backgroundType: "gradient",
      gradientStart: "#a5f3fc",
      gradientEnd: "#06b6d4",
      gradientDirection: "to bottom",
      fontFamily: "Inter, sans-serif",
      social: { linkedin: "#" } as Page["content"]["social"],
    },
  },
  {
    id: 6,
    lookup_code: "oldprt9",
    published_lookup_code: null,
    title: "Old Portfolio",
    description: "Replaced — kept for archive.",
    created_at: "2025-08-12T08:00:00Z",
    updated_at: "2026-01-04T10:00:00Z",
    status: "ARCHIVED",
    clicks: 42,
    trend: -32,
    topLink: { name: "Project 1", clicks: 14 },
    updatedRel: "4mo ago",
    spark: [8, 7, 6, 5, 4, 4, 3, 3, 2, 2, 1, 1, 1, 1],
    links: [
      L("a", "Project 1", "#71717a", "#"),
      L("b", "Project 2", "#71717a", "#"),
    ],
    content: {
      button: "rounded",
      buttonColor: "#27272a",
      textColor: "#f4f4f5",
      background: "",
      backgroundType: "color",
      backgroundColor: "#27272a",
      fontFamily: "Inter, sans-serif",
      social: {} as Page["content"]["social"],
    },
  },
];

// ─── Helpers ────────────────────────────────────────────────────────────────

function pageGradient(page: MockPage): string {
  const c = page.content;
  if (c.backgroundType === "gradient") {
    return `linear-gradient(135deg, ${c.gradientStart ?? "#7c3aed"}, ${c.gradientEnd ?? "#ec4899"})`;
  }
  return `linear-gradient(135deg, ${c.backgroundColor ?? "#7c3aed"}, ${c.backgroundColor ?? "#7c3aed"})`;
}

function pageAccent(page: MockPage): string {
  return page.content.gradientStart ?? page.content.backgroundColor ?? "#7c3aed";
}

function StatusBadge({ status }: { status: MockPage["status"] }) {
  if (status === "PUBLISHED")
    return <span className="pm-badge pm-badge-published">● Live</span>;
  if (status === "DRAFT")
    return <span className="pm-badge pm-badge-draft">✎ Draft</span>;
  return <span className="pm-badge pm-badge-archived">⊟ Archived</span>;
}

// ─── Stats row (top) ────────────────────────────────────────────────────────

function StatsRow({ pages }: { pages: MockPage[] }) {
  const total = pages.length;
  const published = pages.filter((p) => p.status === "PUBLISHED").length;
  const drafts = pages.filter((p) => p.status === "DRAFT").length;
  const totalLinks = pages.reduce((s, p) => s + p.links.length, 0);
  const totalClicks = pages.reduce((s, p) => s + p.clicks, 0);
  const topPage = [...pages].sort((a, b) => b.clicks - a.clicks)[0];
  const avgClicks = total ? Math.round(totalClicks / total) : 0;

  const tiles = [
    {
      icon: "▤",
      label: "Pages",
      value: total.toString(),
      sub: `${published} live · ${drafts} draft`,
      bg: "linear-gradient(135deg, #ec4899, #7c3aed)",
      shadow: "rgba(124, 58, 237, 0.35)",
    },
    {
      icon: "⊞",
      label: "Total Links",
      value: totalLinks.toString(),
      sub: "across all pages",
      bg: "linear-gradient(135deg, #06b6d4, #3b82f6)",
      shadow: "rgba(6, 182, 212, 0.35)",
    },
    {
      icon: "⇗",
      label: "Total Clicks",
      value: totalClicks.toLocaleString(),
      sub: "all time",
      bg: "linear-gradient(135deg, #84cc16, #10b981)",
      shadow: "rgba(16, 185, 129, 0.35)",
    },
    {
      icon: "★",
      label: "Top Page",
      value: topPage?.title.split(" ").slice(0, 2).join(" ") ?? "—",
      sub: topPage ? `${topPage.clicks.toLocaleString()} clicks` : "—",
      bg: "linear-gradient(135deg, #f59e0b, #ec4899)",
      shadow: "rgba(236, 72, 153, 0.35)",
    },
    {
      icon: "≈",
      label: "Avg / Page",
      value: avgClicks.toLocaleString(),
      sub: "clicks",
      bg: "linear-gradient(135deg, #a855f7, #6366f1)",
      shadow: "rgba(99, 102, 241, 0.35)",
    },
  ];

  return (
    <div className="pm-stats-row">
      {tiles.map((t) => (
        <div
          key={t.label}
          className="pm-stat-tile"
          style={
            {
              "--pm-tile-bg": t.bg,
              "--pm-tile-shadow": t.shadow,
            } as CSSProperties
          }
        >
          <div className="pm-stat-tile-icon">{t.icon}</div>
          <div className="pm-stat-tile-text">
            <div className="pm-stat-tile-label">{t.label}</div>
            <div className="pm-stat-tile-value">{t.value}</div>
            <div className="pm-stat-tile-sub">{t.sub}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Donut (compact) ────────────────────────────────────────────────────────

function Donut({
  segments,
  size = 88,
}: {
  segments: { pct: number; color: string }[];
  size?: number;
}) {
  const r = 32;
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
        stroke="rgba(0,0,0,0.06)"
        strokeWidth={10}
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
            strokeWidth={10}
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

// ─── Insights sidebar ───────────────────────────────────────────────────────

function InsightsPanel({ pages }: { pages: MockPage[] }) {
  const topPages = [...pages]
    .sort((a, b) => b.clicks - a.clicks)
    .slice(0, 5);
  const topPeak = Math.max(1, ...topPages.map((p) => p.clicks));

  const topButtons = pages
    .filter((p) => p.topLink.clicks > 0)
    .map((p) => ({
      name: p.topLink.name,
      clicks: p.topLink.clicks,
      page: p.title,
    }))
    .sort((a, b) => b.clicks - a.clicks)
    .slice(0, 5);
  const btnPeak = Math.max(1, ...topButtons.map((b) => b.clicks));

  const counts = pages.reduce(
    (acc, p) => {
      if (p.status === "PUBLISHED") acc.pub++;
      else if (p.status === "DRAFT") acc.draft++;
      else acc.arch++;
      return acc;
    },
    { pub: 0, draft: 0, arch: 0 },
  );
  const total = Math.max(1, pages.length);
  const healthItems = [
    { label: "Live", value: counts.pub, color: "#10b981" },
    { label: "Draft", value: counts.draft, color: "#f59e0b" },
    { label: "Archived", value: counts.arch, color: "#6366f1" },
  ].filter((i) => i.value > 0);
  const donutSegs = healthItems.map((i) => ({
    pct: Math.round((i.value / total) * 100),
    color: i.color,
  }));

  const activity = [
    { text: "“My Personal Links” gained 1 button", time: "2h ago", color: "#7c3aed" },
    { text: "Newsletter Signups created as draft", time: "1d ago", color: "#f59e0b" },
    { text: "Product Launch 2026 passed 800 clicks", time: "1d ago", color: "#10b981" },
    { text: "Speaker Kit republished", time: "13d ago", color: "#06b6d4" },
  ];

  return (
    <aside className="pm-side">
      <div className="pm-panel">
        <h3 className="pm-panel-title">
          <span className="pm-panel-title-dot" />
          Top Performing Pages
        </h3>
        {topPages.map((p) => (
          <div key={p.id} className="pm-rank-row">
            <div className="pm-rank">{topPages.indexOf(p) + 1}</div>
            <div className="pm-rank-info">
              <div className="pm-rank-name">{p.title}</div>
              <div className="pm-rank-sub">{p.links.length} links</div>
            </div>
            <div>
              <div className="pm-rank-clicks">{p.clicks.toLocaleString()}</div>
              <div className="pm-rank-bar">
                <div
                  className="pm-rank-bar-fill"
                  style={{ width: `${(p.clicks / topPeak) * 100}%` }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="pm-panel">
        <h3 className="pm-panel-title">
          <span className="pm-panel-title-dot" />
          Top Buttons (all pages)
        </h3>
        {topButtons.map((b, i) => (
          <div key={`${b.page}-${b.name}`} className="pm-rank-row">
            <div className="pm-rank">{i + 1}</div>
            <div className="pm-rank-info">
              <div className="pm-rank-name">{b.name}</div>
              <div className="pm-rank-sub">{b.page}</div>
            </div>
            <div>
              <div className="pm-rank-clicks">{b.clicks.toLocaleString()}</div>
              <div className="pm-rank-bar">
                <div
                  className="pm-rank-bar-fill"
                  style={{ width: `${(b.clicks / btnPeak) * 100}%` }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="pm-panel">
        <h3 className="pm-panel-title">
          <span className="pm-panel-title-dot" />
          Health Overview
        </h3>
        <div className="pm-donut-wrap">
          <Donut segments={donutSegs} />
          <div className="pm-donut-legend">
            {healthItems.map((i) => (
              <div key={i.label} className="pm-donut-leg">
                <div
                  className="pm-donut-leg-dot"
                  style={{ background: i.color }}
                />
                <div className="pm-donut-leg-label">{i.label}</div>
                <div className="pm-donut-leg-val">{i.value}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="pm-panel">
        <h3 className="pm-panel-title">
          <span className="pm-panel-title-dot" />
          Recent Activity
        </h3>
        <div className="pm-activity">
          {activity.map((a, i) => (
            <div key={i} className="pm-act">
              <div className="pm-act-dot" style={{ background: a.color }} />
              <div className="pm-act-text">{a.text}</div>
              <div className="pm-act-time">{a.time}</div>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}

// ─── PageCard ───────────────────────────────────────────────────────────────

interface PageCardProps {
  page: MockPage;
  isPinned: boolean;
  onTogglePin: (id: number) => void;
  onRename: (id: number, newTitle: string) => void;
  onEdit: () => void;
  showDivider: boolean;
}

function PageCard({
  page,
  isPinned,
  onTogglePin,
  onRename,
  onEdit,
  showDivider,
}: PageCardProps) {
  const [editing, setEditing] = useState(false);
  const [draftTitle, setDraftTitle] = useState(page.title);

  const gradient = pageGradient(page);
  const accent = pageAccent(page);
  const sparkPeak = Math.max(...page.spark, 1);

  const commit = () => {
    if (draftTitle.trim() && draftTitle !== page.title) {
      onRename(page.id ?? 0, draftTitle.trim());
    } else {
      setDraftTitle(page.title);
    }
    setEditing(false);
  };

  const onKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") commit();
    if (e.key === "Escape") {
      setDraftTitle(page.title);
      setEditing(false);
    }
  };

  return (
    <>
      <article
        className={`pm-card${page.isPrimary ? " pm-card--primary" : ""}`}
        style={
          {
            "--pm-card-accent": accent,
            "--pm-card-gradient": gradient,
            "--pm-card-glow": `${accent}55`,
          } as CSSProperties
        }
      >
        <div className="pm-card-halo" />

        <button
          type="button"
          className={`pm-pin-btn${isPinned ? " pm-pin-btn--active" : ""}`}
          title={isPinned ? "Unpin page" : "Pin to top"}
          onClick={() => onTogglePin(page.id ?? 0)}
        >
          {isPinned ? (
            <PinOff size={14} strokeWidth={2} />
          ) : (
            <Pin size={14} strokeWidth={2} />
          )}
        </button>

        <div className="pm-card-body">
          {/* Phone */}
          <div className="pm-phone-wrap">
            <div className="pm-phone">
              <div className="pm-phone-notch" />
              <div className="pm-phone-screen">
                <div className="pm-phone-screen-inner">
                  <Preview
                    title={page.title}
                    description={page.description}
                    content={page.content}
                    links={page.links}
                  />
                </div>
                <div className="pm-phone-shine" />
              </div>
            </div>
          </div>

          {/* Meta */}
          <div className="pm-meta">
            <div className="pm-title-row">
              {editing ? (
                <input
                  autoFocus
                  className="pm-rename-input"
                  value={draftTitle}
                  onChange={(e) => setDraftTitle(e.target.value)}
                  onBlur={commit}
                  onKeyDown={onKey}
                />
              ) : (
                <>
                  <h2 className="pm-title">{page.title}</h2>
                  <button
                    type="button"
                    className="pm-rename-btn"
                    title="Rename page"
                    onClick={() => setEditing(true)}
                  >
                    <Pencil size={13} strokeWidth={2} />
                  </button>
                </>
              )}
            </div>

            <div className="pm-slug-row">
              <span className="pm-slug">
                {page.published_url
                  ? page.published_url.replace("https://", "")
                  : `thin.ly/${page.lookup_code}`}
              </span>
              <StatusBadge status={page.status} />
              {page.isPrimary && (
                <span className="pm-badge pm-badge-primary">⚑ Primary</span>
              )}
              {isPinned && !page.isPrimary && (
                <span className="pm-badge pm-badge-pinned">
                  <Pin size={10} strokeWidth={2.5} /> Pinned
                </span>
              )}
            </div>

            <div className="pm-stat-pills">
              <div
                className="pm-pill"
                style={{ "--pm-pill-accent": "#06b6d4" } as CSSProperties}
              >
                <div className="pm-pill-label">
                  <span className="pm-pill-dot" /> Links
                </div>
                <div className="pm-pill-value">{page.links.length}</div>
                <div className="pm-pill-sub">in this page</div>
              </div>

              <div
                className="pm-pill"
                style={{ "--pm-pill-accent": "#7c3aed" } as CSSProperties}
              >
                <div className="pm-pill-label">
                  <span className="pm-pill-dot" /> Clicks
                </div>
                <div className="pm-pill-value">
                  {page.clicks.toLocaleString()}
                </div>
                <div
                  className={`pm-pill-sub ${
                    page.trend > 0
                      ? "pm-pill-sub-up"
                      : page.trend < 0
                        ? "pm-pill-sub-down"
                        : ""
                  }`}
                >
                  {page.trend === 0
                    ? "no data yet"
                    : `${page.trend > 0 ? "▲" : "▼"} ${Math.abs(page.trend)}% vs prev`}
                </div>
              </div>

              <div
                className="pm-pill"
                style={{ "--pm-pill-accent": "#ec4899" } as CSSProperties}
              >
                <div className="pm-pill-label">
                  <span className="pm-pill-dot" /> Top Link
                </div>
                <div className="pm-pill-value">{page.topLink.name}</div>
                <div className="pm-pill-sub">
                  {page.topLink.clicks > 0
                    ? `${page.topLink.clicks} clicks`
                    : "no data"}
                </div>
              </div>

              <div
                className="pm-pill pm-pill-trend"
                style={{ "--pm-pill-accent": "#84cc16" } as CSSProperties}
              >
                <div className="pm-pill-label">
                  <span className="pm-pill-dot" /> Last 14 days
                </div>
                <div className="pm-spark" aria-hidden>
                  {page.spark.map((v, i) => (
                    <div
                      key={i}
                      className="pm-spark-bar"
                      style={
                        {
                          height: `${Math.max(8, (v / sparkPeak) * 100)}%`,
                          "--pm-spark-color":
                            page.trend >= 0
                              ? "linear-gradient(180deg, #a855f7, #7c3aed)"
                              : "linear-gradient(180deg, #fda4af, #ef4444)",
                        } as CSSProperties
                      }
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

        </div>

        <div className="pm-card-foot">
          <span className="pm-foot-date">
            Created{" "}
            {new Date(page.created_at).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}{" "}
            · updated {page.updatedRel}
          </span>
          <div className="pm-foot-actions">
            <button
              type="button"
              className="pm-btn pm-btn-ghost pm-btn-sm"
              disabled={!page.published_url}
            >
              <ExternalLink size={12} strokeWidth={2} />
              View live
            </button>
            <button
              type="button"
              className="pm-btn pm-btn-ghost pm-btn-sm"
            >
              ⎘ Duplicate
            </button>
            <button
              type="button"
              className="pm-btn pm-btn-primary pm-btn-sm"
              onClick={onEdit}
            >
              Edit page →
            </button>
            <button
              type="button"
              className="pm-btn pm-btn-ghost pm-btn-icon"
              title="More"
            >
              <MoreVertical size={14} strokeWidth={2} />
            </button>
            <button
              type="button"
              className="pm-btn pm-btn-ghost pm-btn-icon"
              title="Delete page"
            >
              <Trash2 size={13} strokeWidth={2} />
            </button>
          </div>
        </div>
      </article>

      {showDivider && <div className="pm-divider">Other pages</div>}
    </>
  );
}

// ─── Top-level page ─────────────────────────────────────────────────────────

const STATE_FILTERS: Array<"all" | "PUBLISHED" | "DRAFT" | "ARCHIVED"> = [
  "all",
  "PUBLISHED",
  "DRAFT",
  "ARCHIVED",
];
const STATE_LABEL = {
  all: "All",
  PUBLISHED: "Live",
  DRAFT: "Draft",
  ARCHIVED: "Archived",
};

type SortKey = "clicks" | "updated" | "alpha";
const SORT_LABEL: Record<SortKey, string> = {
  clicks: "Most clicks",
  updated: "Recently updated",
  alpha: "A → Z",
};

export default function PagesMockup() {
  const navigate = useNavigate();
  const [pagesState, setPagesState] = useState<MockPage[]>(MOCK_PAGES);
  const [search, setSearch] = useState("");
  const [stateFilter, setStateFilter] =
    useState<(typeof STATE_FILTERS)[number]>("all");
  const [sortKey, setSortKey] = useState<SortKey>("clicks");
  const [pinnedIds, setPinnedIds] = useState<Set<number>>(() => {
    const initial = new Set<number>();
    const primary = MOCK_PAGES.find((p) => p.isPrimary);
    if (primary?.id != null) initial.add(primary.id);
    return initial;
  });

  const onTogglePin = (id: number) => {
    setPinnedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const onRename = (id: number, newTitle: string) => {
    setPagesState((prev) =>
      prev.map((p) => (p.id === id ? { ...p, title: newTitle } : p)),
    );
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const pinned: MockPage[] = [];
    const rest: MockPage[] = [];
    for (const p of pagesState) {
      if (stateFilter !== "all" && p.status !== stateFilter) continue;
      if (q.length > 0) {
        const hay = `${p.title} ${p.description ?? ""} ${p.lookup_code}`.toLowerCase();
        if (!hay.includes(q)) continue;
      }
      (pinnedIds.has(p.id ?? -1) ? pinned : rest).push(p);
    }
    const sorter = (a: MockPage, b: MockPage) => {
      if (sortKey === "clicks") return b.clicks - a.clicks;
      if (sortKey === "updated")
        return (
          new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
        );
      return a.title.localeCompare(b.title);
    };
    pinned.sort(sorter);
    rest.sort(sorter);
    return [...pinned, ...rest];
  }, [pagesState, search, stateFilter, sortKey, pinnedIds]);

  const pinnedCount = filtered.filter((p) =>
    pinnedIds.has(p.id ?? -1),
  ).length;

  return (
    <MainLayout>
      <div className="pm-shell">
        <div className="pm-banner">
          <span className="pm-banner-tag">MOCKUP</span>
          <span>
            Static preview of the redesigned /pages dashboard. All data is fake
            — nothing is saved.
          </span>
        </div>

        <div className="pm-page-header">
          <div>
            <h1 className="pm-h1">
              Your <span className="pm-h1-accent">pages</span>
            </h1>
            <p className="pm-subtitle">
              Preview, measure, and edit your link-in-bio pages
            </p>
          </div>
          <div className="pm-header-actions">
            <button type="button" className="pm-btn pm-btn-ghost">
              ⊟ Archive drafts
            </button>
            <button type="button" className="pm-btn pm-btn-primary">
              + New page
            </button>
          </div>
        </div>

        <StatsRow pages={pagesState} />

        <div className="pm-grid">
          <div>
            <div className="pm-toolbar">
              <div className="pm-search">
                <Search className="pm-search-icon" size={16} />
                <input
                  className="pm-search-input"
                  placeholder="Search pages…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <div className="pm-chip-group">
                {STATE_FILTERS.map((s) => (
                  <button
                    key={s}
                    type="button"
                    className={`pm-chip${stateFilter === s ? " pm-chip-on" : ""}`}
                    onClick={() => setStateFilter(s)}
                  >
                    {STATE_LABEL[s]}
                  </button>
                ))}
              </div>
              <span className="pm-sort-label">Sort</span>
              <div className="pm-chip-group">
                {(Object.keys(SORT_LABEL) as SortKey[]).map((k) => (
                  <button
                    key={k}
                    type="button"
                    className={`pm-chip${sortKey === k ? " pm-chip-on" : ""}`}
                    onClick={() => setSortKey(k)}
                  >
                    {SORT_LABEL[k]}
                  </button>
                ))}
              </div>
            </div>

            <div className="pm-card-list">
              {filtered.length === 0 ? (
                <div className="pm-empty">
                  <div className="pm-empty-icon">◇</div>
                  <p>No pages match your filters.</p>
                </div>
              ) : (
                filtered.map((page, idx) => (
                  <PageCard
                    key={page.id}
                    page={page}
                    isPinned={pinnedIds.has(page.id ?? -1)}
                    onTogglePin={onTogglePin}
                    onRename={onRename}
                    onEdit={() => navigate("/pages-mockup/edit")}
                    showDivider={
                      idx === pinnedCount - 1 &&
                      pinnedCount > 0 &&
                      pinnedCount < filtered.length
                    }
                  />
                ))
              )}
            </div>
          </div>

          <InsightsPanel pages={pagesState} />
        </div>
      </div>
    </MainLayout>
  );
}
