import {
  fetchClicksTimeline,
  type ClicksTimeline,
  type TimelineGranularity,
  type TimelinePeriod,
} from "@/apis/analytics";
import { fetchCampaigns, getCampaignType } from "@/apis/campaigns";
import { fetchGovernanceLinks } from "@/apis/governance";
import { getPages } from "@/apis/pages";
import { getQrCodes } from "@/apis/qr_codes";
import type { Campaign } from "@/types/campaigns";
import type { GovernanceLink } from "@/types/governance";
import { FormEvent, ReactNode, useEffect, useState } from "react";
import { useCookies } from "react-cookie";
import { Link } from "react-router-dom";
import MainLayout from "../components/layouts/MainLayout";
import {
  CAMPAIGNS_ROUTE,
  GOVERNANCE_ROUTE,
  PAGES_ROUTE,
  PLANS_ROUTE,
  QR_ROUTE,
} from "../routes";

// ── Types ─────────────────────────────────────────────────────────────────────

interface DashStats {
  total: number;
  active: number;
  paused: number;
  expired: number;
  draft: number;
  totalClicks: number;
}

interface PlanFeature {
  name: string;
  used: number;
  limit: number;
}

// Mirrors src/components/campaigns/CampaignsList.tsx so the dashboard and the
// campaigns page surface the same icon for the same campaign. Driven by the
// name-keyword heuristic in `getCampaignType` since the backend does not
// persist a per-campaign icon.
const CAMPAIGN_TYPE_ICONS: Record<string, string> = {
  launch: "🚀",
  sale: "⚡",
  event: "🎯",
  content: "💡",
  retargeting: "🎬",
  affiliate: "💎",
};

function campaignIcon(name: string): string {
  return CAMPAIGN_TYPE_ICONS[getCampaignType(name)] ?? "🚀";
}

// ── Main component ────────────────────────────────────────────────────────────

const DashboardPage = () => {
  const [cookies] = useCookies(["plan", "token", "email"]);
  const [stats, setStats] = useState<DashStats | null>(null);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [topLinks, setTopLinks] = useState<GovernanceLink[]>([]);
  const [qrCount, setQrCount] = useState(0);
  const [pagesCount, setPagesCount] = useState(0);
  const [statsLoading, setStatsLoading] = useState(true);
  const [shortenerPlaceholder, setShortenerPlaceholder] = useState(
    "paste your long URL here…",
  );
  const [shortenerValue, setShortenerValue] = useState("");

  // fetch live data
  useEffect(() => {
    if (!cookies.token) {
      setStatsLoading(false);
      return;
    }
    Promise.all([
      fetchGovernanceLinks(cookies.token, {}).catch(() => null),
      fetchCampaigns(cookies.token).catch(() => [] as Campaign[]),
      fetchGovernanceLinks(cookies.token, {
        sortBy: "last_clicked",
        order: "desc",
      }).catch(() => null),
      getQrCodes(cookies.token).catch(() => []),
      getPages(cookies.token).catch(() => []),
    ]).then(([govPage, camps, lastClickedPage, qrCodes, pages]) => {
      if (govPage) setStats(govPage.stats as DashStats);
      setCampaigns(camps ?? []);
      if (lastClickedPage) setTopLinks(lastClickedPage.links.slice(0, 5));
      setQrCount(((qrCodes as unknown[]) ?? []).length);
      setPagesCount(((pages as unknown[]) ?? []).length);
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
  const todayLabel = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  const topCampaigns = [...campaigns]
    .sort((a, b) => b.totalClicks - a.totalClicks)
    .slice(0, 5);

  const planFeatures: PlanFeature[] = cookies.plan?.features ?? [];
  const planName = (cookies.plan?.name ?? "Free").toString();

  // Governance-health math derived from real stats
  const totalLinks = stats?.total ?? 0;
  const activeLinks = stats?.active ?? 0;
  const pausedLinks = stats?.paused ?? 0;
  const expiredLinks = stats?.expired ?? 0;
  const healthPct =
    totalLinks > 0 ? Math.round((activeLinks / totalLinks) * 100) : 0;

  // Smart-insight: shown only when something needs attention
  const insightVisible = expiredLinks > 0;

  const handleShortenSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Route to Governance with the pasted URL pre-filled (placeholder UX).
    if (shortenerValue.trim()) {
      setShortenerPlaceholder("Opening Governance…");
      window.location.assign(
        `${GOVERNANCE_ROUTE}?new=${encodeURIComponent(shortenerValue.trim())}`,
      );
    } else {
      setShortenerPlaceholder("paste a URL first…");
      setTimeout(
        () => setShortenerPlaceholder("paste your long URL here…"),
        2000,
      );
    }
  };

  return (
    <MainLayout>
      <div className="bg-canvas dark:bg-zinc-950 min-h-full font-sans text-ink dark:text-zinc-100">
        <div className="mx-auto w-full max-w-[1480px] px-4 py-6 sm:px-7 sm:py-7">
          {/* ── Top bar ─────────────────────────────────────────────── */}
          <TopBar
            greeting={greeting}
            firstName={firstName}
            todayLabel={todayLabel}
          />

          {/* ── Quick shortener ─────────────────────────────────────── */}
          <QuickShortener
            value={shortenerValue}
            onChange={setShortenerValue}
            placeholder={shortenerPlaceholder}
            onSubmit={handleShortenSubmit}
          />

          {/* ── Bento grid ──────────────────────────────────────────── */}
          <div className="grid grid-cols-12 gap-3.5">
            <FeaturedCard />
            <ActivityCard loading={statsLoading} topLinks={topLinks} />
            <PlanCard
              planName={planName}
              features={planFeatures}
              loading={statsLoading}
            />

            <StatCard
              tone="mint"
              icon="🔗"
              label="Short Links"
              value={statsLoading ? "—" : totalLinks}
              sub={statsLoading ? "loading…" : `${activeLinks} active`}
              spark={[30, 45, 55, 50, 65, 72, 80]}
              peakIndex={6}
              href={GOVERNANCE_ROUTE}
            />
            <StatCard
              tone="peach"
              icon="📣"
              label="Campaigns"
              value={statsLoading ? "—" : campaigns.length}
              sub={
                statsLoading
                  ? "loading…"
                  : `${campaigns.filter((c) => c.state === "active").length} active`
              }
              spark={[40, 50, 60, 55, 75, 68, 72]}
              peakIndex={4}
              href={CAMPAIGNS_ROUTE}
            />
            <StatCard
              tone="lilac"
              icon="▦"
              label="QR Codes"
              value={statsLoading ? "—" : qrCount}
              sub="generated"
              spark={[25, 38, 45, 55, 60, 78, 70]}
              peakIndex={5}
              href={QR_ROUTE}
            />
            <StatCard
              tone="sun"
              icon="◧"
              label="Pages"
              value={statsLoading ? "—" : pagesCount}
              sub="landing pages"
              spark={[15, 20, 25, 35, 45, 55, 50]}
              peakIndex={5}
              href={PAGES_ROUTE}
            />

            <ChartCard token={cookies.token} />
            <HealthCard
              pct={healthPct}
              active={activeLinks}
              paused={pausedLinks}
              expired={expiredLinks}
              loading={statsLoading}
            />

            <LeaderboardCard
              campaigns={topCampaigns}
              loading={statsLoading}
            />
            <LastClickedCard links={topLinks} loading={statsLoading} />

            {insightVisible && (
              <InsightCard
                expiredCount={expiredLinks}
                exampleLinks={topLinks
                  .filter((l) => l.state === "expired")
                  .slice(0, 2)}
              />
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

// ── Top bar ──────────────────────────────────────────────────────────────────

function TopBar({
  greeting,
  firstName,
  todayLabel,
}: {
  greeting: string;
  firstName: string;
  todayLabel: string;
}) {
  return (
    <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
      <div className="animate-[fadeIn_0.5s_ease-out_forwards]">
        <h1 className="font-display text-[32px] font-bold leading-[1.05] tracking-[-0.025em] text-ink dark:text-zinc-100">
          {greeting},{" "}
          <span className="text-violetBrand">{firstName}</span>{" "}
          <span className="inline-block origin-[70%_70%] animate-wave">👋</span>
        </h1>
        <div className="mt-1 flex items-center gap-2 font-mono text-xs text-ink-3 dark:text-zinc-400">
          <span>{todayLabel}</span>
          <span className="text-mint-d">·</span>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <div className="flex w-[260px] items-center gap-2 rounded-full border border-dashline bg-canvas-2 px-4 py-2 transition focus-within:border-ink focus-within:shadow-[0_0_0_3px_rgba(0,0,0,0.04)] dark:border-zinc-700 dark:bg-zinc-900">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="h-3.5 w-3.5 text-ink-3 dark:text-zinc-400"
          >
            <circle cx="11" cy="11" r="7" />
            <path d="M21 21l-4.3-4.3" />
          </svg>
          <input
            type="text"
            placeholder="Search links, campaigns…"
            className="flex-1 bg-transparent text-sm text-ink outline-none placeholder:text-ink-4 dark:text-zinc-100 dark:placeholder:text-zinc-500"
          />
          <span className="rounded bg-canvas px-1.5 py-0.5 font-mono text-[10px] text-ink-4 dark:bg-zinc-800 dark:text-zinc-500">
            ⌘K
          </span>
        </div>
        <Link
          to={GOVERNANCE_ROUTE}
          className="inline-flex items-center gap-1.5 rounded-full border border-ink bg-ink px-5 py-2.5 text-sm font-medium text-canvas-2 transition hover:-translate-y-px hover:bg-ink-2"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            className="h-3 w-3"
          >
            <path d="M12 5v14M5 12h14" />
          </svg>
          New Link
        </Link>
      </div>
    </div>
  );
}

// ── Quick shortener (front-and-center) ───────────────────────────────────────

function QuickShortener({
  value,
  onChange,
  placeholder,
  onSubmit,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  onSubmit: (e: FormEvent<HTMLFormElement>) => void;
}) {
  return (
    <div className="relative mb-4 overflow-hidden rounded-bento bg-gradient-to-br from-ink to-[#1f1f28] px-4 py-4 text-canvas-2 sm:px-6 sm:py-5">
      <div className="pointer-events-none absolute -right-[10%] -top-[40%] h-[360px] w-[360px] rounded-full bg-[radial-gradient(circle,rgba(124,58,237,0.18),transparent_70%)]" />
      <div className="pointer-events-none absolute -bottom-[40%] left-[10%] h-[280px] w-[280px] rounded-full bg-[radial-gradient(circle,rgba(183,230,208,0.1),transparent_70%)]" />

      <div className="relative z-10 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
        {/* Icon + label group */}
        <div className="flex items-center gap-3 sm:shrink-0 sm:gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violetBrand to-violetBrand-2 shadow-[0_0_24px_rgba(124,58,237,0.4)] sm:h-11 sm:w-11">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2"
            >
              <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
              <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
            </svg>
          </div>
          <div className="min-w-0">
            <div className="font-display text-[17px] font-bold tracking-[-0.015em]">
              Shorten on the fly
            </div>
            <div className="mt-px font-mono text-[11px] text-white/50 sm:text-xs">
              // instant · governed · safe
            </div>
          </div>
        </div>

        {/* Form — full-width on mobile, flex-1 alongside the label on sm+ */}
        <form
          onSubmit={onSubmit}
          className="flex min-w-0 gap-2 sm:flex-1"
        >
          <input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            type="url"
            placeholder={placeholder}
            aria-label="URL to shorten"
            className="min-w-0 flex-1 rounded-full border border-white/10 bg-white/5 px-4 py-2.5 font-mono text-[13px] text-canvas-2 outline-none transition placeholder:text-white/35 focus:border-violetBrand-2 focus:bg-white/10"
          />
          <button
            type="submit"
            aria-label="Shorten URL"
            className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-full bg-gradient-to-br from-violetBrand to-violetBrand-2 px-4 py-2.5 text-sm font-semibold shadow-[0_4px_16px_rgba(124,58,237,0.25)] transition hover:-translate-y-px hover:shadow-[0_8px_24px_rgba(124,58,237,0.35)] sm:px-6"
          >
            <span className="hidden sm:inline">Shorten</span>
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              className="h-3.5 w-3.5 sm:h-3 sm:w-3"
            >
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </button>
        </form>
      </div>
    </div>
  );
}

// ── Card wrapper ─────────────────────────────────────────────────────────────

function Card({
  className = "",
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <div
      className={`relative flex flex-col rounded-bento p-5 shadow-bento-sm transition duration-200 ease-out hover:-translate-y-0.5 hover:shadow-bento ${className}`}
    >
      {children}
    </div>
  );
}

// ── Featured Governance card ─────────────────────────────────────────────────

function FeaturedCard() {
  return (
    <Card className="col-span-12 min-h-[240px] overflow-hidden bg-coral-2 px-7 py-6 lg:col-span-5">
      <span className="mb-3.5 inline-flex items-center gap-1.5 self-start rounded-full bg-sun px-2.5 py-1 text-[11px] font-semibold text-ink">
        ⚡ Featured
      </span>
      <h2 className="mb-2 max-w-[60%] font-display text-3xl font-bold uppercase tracking-[-0.02em] leading-[1.05] text-ink">
        Link
        <br />
        Governance
      </h2>
      <p className="mb-4 max-w-[56%] text-[13.5px] text-ink-2">
        Lifecycle control, routing rules &amp; deep analytics — all in real
        time.
      </p>
      <div className="flex gap-2">
        <Link
          to={GOVERNANCE_ROUTE}
          className="inline-flex items-center gap-1.5 rounded-full bg-ink px-4 py-2.5 text-[13px] font-medium text-canvas-2 transition hover:bg-coral-d"
        >
          Check it out
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            className="h-3 w-3"
          >
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </Link>
        <Link
          to={GOVERNANCE_ROUTE}
          className="rounded-full bg-transparent px-3 py-2.5 text-[13px] font-medium text-ink-2 underline underline-offset-2"
        >
          See all
        </Link>
      </div>
      {/* Decorative illustration */}
      <svg
        className="pointer-events-none absolute right-4 top-9"
        width="160"
        height="180"
        viewBox="0 0 160 180"
        fill="none"
      >
        <g className="animate-float">
          <rect
            x="40"
            y="20"
            width="110"
            height="80"
            rx="8"
            fill="#fff"
            stroke="#15151b"
            strokeWidth="1.5"
          />
          <circle cx="50" cy="30" r="2" fill="#f5a99a" />
          <circle cx="58" cy="30" r="2" fill="#fce58b" />
          <circle cx="66" cy="30" r="2" fill="#b7e6d0" />
          <rect x="48" y="42" width="60" height="4" rx="2" fill="#c8def5" />
          <rect x="48" y="52" width="90" height="4" rx="2" fill="#15151b" />
          <rect x="48" y="62" width="80" height="4" rx="2" fill="#15151b" />
          <rect x="48" y="76" width="30" height="14" rx="7" fill="#f5a99a" />
        </g>
        <g
          transform="translate(115, 100)"
          className="animate-float [animation-delay:-1.6s]"
        >
          <circle cx="0" cy="0" r="14" fill="#15151b" />
          <path d="M-3,-5 L4,2 L0,2 L1,5 L-1,5 L-2,2 L-5,4 Z" fill="#fff" />
        </g>
        <g
          transform="translate(25, 130)"
          fill="#15151b"
          className="animate-float [animation-delay:-3.2s]"
        >
          <path d="M0,-7 L2,-2 L7,0 L2,2 L0,7 L-2,2 L-7,0 L-2,-2 Z" />
        </g>
      </svg>
    </Card>
  );
}

// ── Live activity card ───────────────────────────────────────────────────────

function ActivityCard({
  loading,
  topLinks,
}: {
  loading: boolean;
  topLinks: GovernanceLink[];
}) {
  const items = topLinks.slice(0, 3);
  return (
    <Card className="col-span-12 bg-mint px-5 py-5 lg:col-span-5">
      <div className="mb-3 flex items-center justify-between gap-2 font-mono text-[10px] uppercase tracking-[0.08em] text-ink-3">
        <span>Live activity</span>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-mint-d/10 px-2.5 py-0.5 font-mono text-[10px] text-mint-d">
          <span className="h-1.5 w-1.5 animate-pulse-live rounded-full bg-mint-d" />
          live
        </span>
      </div>
      <div className="flex flex-col gap-2">
        {loading
          ? [0, 1, 2].map((i) => (
              <div
                key={i}
                className="flex items-center gap-3 rounded-[10px] bg-mint-3 px-3.5 py-2.5"
              >
                <div className="h-8 w-8 shrink-0 animate-pulse rounded-lg bg-canvas-2/60" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-3 w-2/3 animate-pulse rounded bg-canvas-2/70" />
                  <div className="h-2.5 w-1/2 animate-pulse rounded bg-canvas-2/50" />
                </div>
                <div className="h-6 w-12 animate-pulse rounded bg-canvas-2/60" />
              </div>
            ))
          : items.length === 0
            ? (
              <div className="rounded-[10px] bg-mint-3 px-3.5 py-6 text-center text-[13px] text-ink-3">
                Share your links to see activity here.
              </div>
            )
            : (
              items.map((link) => (
                <Link
                  key={link.lookup_code}
                  to={`${GOVERNANCE_ROUTE}?lookup=${link.lookup_code}`}
                  className="flex items-center gap-3 rounded-[10px] bg-mint-3 px-3.5 py-2.5 transition hover:translate-x-0.5 hover:bg-canvas-2"
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-canvas-2 text-sm">
                    🔗
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-[13.5px] font-medium text-ink">
                      {link.name || link.dest}
                    </div>
                    <div className="truncate font-mono text-[11px] text-ink-3">
                      {link.short}
                    </div>
                  </div>
                  <div className="flex shrink-0 flex-col items-end">
                    <div className="font-display text-[18px] font-bold leading-none text-ink">
                      {link.clicks.toLocaleString()}
                    </div>
                    <div className="mt-1 font-mono text-[9.5px] uppercase tracking-wider text-ink-3">
                      clicks
                    </div>
                  </div>
                </Link>
              ))
            )}
      </div>
    </Card>
  );
}

// ── Plan card ────────────────────────────────────────────────────────────────

function PlanCard({
  planName,
  features,
  loading,
}: {
  planName: string;
  features: PlanFeature[];
  loading: boolean;
}) {
  return (
    <Card className="col-span-12 min-h-[240px] overflow-hidden bg-forest p-[18px] text-canvas-2 lg:col-span-2">
      <div className="pointer-events-none absolute -bottom-10 -right-10 h-[140px] w-[140px] rounded-full bg-[radial-gradient(circle,rgba(183,230,208,0.16),transparent_70%)]" />
      <div className="relative z-10 mb-3.5 flex items-center justify-between">
        <span className="font-display text-sm font-extrabold uppercase tracking-[0.04em]">
          {planName}
        </span>
        <Link
          to={PLANS_ROUTE}
          className="rounded-full bg-sun px-2.5 py-1 text-[10.5px] font-semibold text-ink transition hover:bg-[#f1c925]"
        >
          Upgrade
        </Link>
      </div>
      <div className="relative z-10 flex flex-col gap-2.5">
        {loading ? (
          [0, 1, 2].map((i) => (
            <div key={i} className="space-y-1">
              <div className="flex items-baseline justify-between">
                <div className="h-3 w-16 animate-pulse rounded bg-white/10" />
                <div className="h-3 w-12 animate-pulse rounded bg-white/10" />
              </div>
              <div className="h-1 w-full rounded bg-white/10" />
            </div>
          ))
        ) : features.length === 0 ? (
          <p className="text-xs opacity-70">No usage data available.</p>
        ) : (
          features.map((f, i) => <PlanUsageRow key={i} feature={f} />)
        )}
      </div>
      <div className="relative z-10 mt-3.5 flex gap-2.5 font-mono text-[9.5px] opacity-55">
        <LegendDot color="bg-coral" label="Near limit" />
        <LegendDot color="bg-sun" label="Caution" />
        <LegendDot color="bg-mint" label="Good" />
      </div>
    </Card>
  );
}

function PlanUsageRow({ feature }: { feature: PlanFeature }) {
  const pct =
    feature.limit > 0 ? Math.min((feature.used / feature.limit) * 100, 100) : 0;
  const warn = pct > 70;
  return (
    <div>
      <div className="mb-1 flex items-baseline justify-between">
        <span className="text-xs opacity-85">{feature.name}</span>
        <span className="font-mono text-[10.5px] opacity-70">
          {feature.used.toLocaleString()} / {feature.limit.toLocaleString()}
        </span>
      </div>
      <div className="h-1 overflow-hidden rounded bg-white/10">
        <div
          className={`h-full rounded transition-[width] duration-700 ease-out ${
            warn
              ? "bg-gradient-to-r from-sun to-coral"
              : "bg-gradient-to-r from-mint to-sky"
          }`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <span className="flex items-center gap-1">
      <span className={`h-1.5 w-1.5 rounded-full ${color}`} />
      {label}
    </span>
  );
}

// ── Stat card ────────────────────────────────────────────────────────────────

type StatTone = "mint" | "peach" | "lilac" | "sun";

function StatCard({
  tone,
  icon,
  label,
  value,
  sub,
  spark,
  peakIndex,
  href,
}: {
  tone: StatTone;
  icon: string;
  label: string;
  value: number | string;
  sub: string;
  spark: number[];
  peakIndex: number;
  href: string;
}) {
  const bg = {
    mint: "bg-mint",
    peach: "bg-peach",
    lilac: "bg-lilac",
    sun: "bg-sun",
  }[tone];
  const sparkColor = {
    mint: "bg-mint-d",
    peach: "bg-peach-d",
    lilac: "bg-lilac-d",
    sun: "bg-sun-d",
  }[tone];
  return (
    <Link
      to={href}
      className={`col-span-6 sm:col-span-3 lg:col-span-2 ${bg} relative flex min-h-[140px] flex-col overflow-hidden rounded-bento px-4 py-4 shadow-bento-sm transition duration-200 ease-out hover:-translate-y-0.5 hover:shadow-bento`}
    >
      <div className="absolute right-3.5 top-3.5 flex h-8 w-8 items-center justify-center rounded-[9px] bg-white/55 text-sm">
        {icon}
      </div>
      <div className="mt-2 font-display text-[38px] font-extrabold leading-none tracking-[-0.03em]">
        {value}
      </div>
      <div className="mt-1 font-mono text-[10px] uppercase tracking-[0.08em] text-ink-2/70">
        {label}
      </div>
      <div className="mt-0.5 text-xs text-ink-2/75">{sub}</div>
      <div className="mt-2 flex h-[22px] items-end gap-0.5">
        {spark.map((h, i) => (
          <div
            key={i}
            className={`flex-1 rounded-t-[2px] ${sparkColor} ${
              i === peakIndex ? "opacity-95" : "opacity-40 hover:opacity-80"
            } transition-opacity`}
            style={{ height: `${h}%` }}
          />
        ))}
      </div>
    </Link>
  );
}

// ── Chart card (clicks over time) ────────────────────────────────────────────

const PERIODS: TimelinePeriod[] = ["24h", "7d", "30d", "all"];
const PERIOD_DAYS: Record<TimelinePeriod, number> = {
  "24h": 1,
  "7d": 7,
  "30d": 30,
  all: 365,
};

function ChartCard({ token }: { token?: string }) {
  const [period, setPeriod] = useState<TimelinePeriod>("7d");
  const [data, setData] = useState<ClicksTimeline | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    fetchClicksTimeline(token, period).then((d) => {
      if (cancelled) return;
      setData(d);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [token, period]);

  const points = data?.points ?? [];
  const totalClicks = data?.total_clicks ?? 0;
  const avgPerDay = data?.avg_per_day ?? 0;
  return (
    <Card className="col-span-12 bg-canvas-2 px-4 py-4 dark:bg-zinc-900 sm:px-6 sm:py-5 lg:col-span-8">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2.5">
        <div>
          <h3 className="font-display text-lg font-bold tracking-[-0.02em]">
            Click performance
          </h3>
          <div className="text-xs text-ink-3 dark:text-zinc-400">
            Aggregate clicks across all governed links
          </div>
        </div>
        <div className="flex gap-0.5 rounded-full bg-canvas p-0.5 dark:bg-zinc-800">
          {PERIODS.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setPeriod(p)}
              className={`rounded-full px-3 py-1 text-[11.5px] font-medium transition ${
                period === p
                  ? "bg-ink text-canvas-2"
                  : "text-ink-3 hover:text-ink dark:text-zinc-400 dark:hover:text-zinc-100"
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-3.5 flex flex-wrap gap-x-6 gap-y-3 sm:gap-5">
        <ChartStat
          label="Total clicks"
          value={loading ? "—" : totalClicks.toLocaleString()}
        />
        <ChartStat
          label={period === "24h" ? "Avg / hour" : "Avg / day"}
          value={
            loading
              ? "—"
              : period === "24h"
                ? (totalClicks / 24).toFixed(1)
                : avgPerDay.toString()
          }
        />
        {/* Buckets + Period: redundant context on mobile (the active tab
            already shows the period), so hide them below sm. */}
        <ChartStat
          label="Buckets"
          value={loading ? "—" : points.length.toString()}
          className="hidden sm:block"
        />
        <ChartStat
          label="Period"
          value={`${PERIOD_DAYS[period]}d window`}
          className="hidden sm:block"
        />
      </div>

      <ChartSvg
        points={points}
        loading={loading}
        granularity={data?.granularity}
      />

      <div className="mt-2 flex gap-4 text-[11.5px] text-ink-3 dark:text-zinc-400">
        <div className="flex items-center gap-1.5">
          <div className="h-[3px] w-2 rounded-[1.5px] bg-violetBrand" />
          Clicks
        </div>
        <div className="ml-auto text-[10.5px] opacity-70">
          {loading
            ? "loading…"
            : points.length === 0
              ? "no data"
              : `${
                  data?.granularity === "hour"
                    ? "hourly"
                    : data?.granularity === "month"
                      ? "monthly"
                      : "daily"
                } buckets`}
        </div>
      </div>
    </Card>
  );
}

function ChartStat({
  label,
  value,
  className = "",
}: {
  label: string;
  value: string;
  className?: string;
}) {
  return (
    <div className={className}>
      <div className="font-display text-xl font-bold leading-none tracking-[-0.025em] sm:text-2xl">
        {value}
      </div>
      <div className="mt-1 font-mono text-[10.5px] uppercase tracking-wider text-ink-4 dark:text-zinc-500">
        {label}
      </div>
    </div>
  );
}

// ── Chart SVG (dynamic) ──────────────────────────────────────────────────────

const VB_W = 800;
const VB_H = 180;
const VB_PAD_Y = 12;

function ChartSvg({
  points,
  loading,
  granularity,
}: {
  points: ClicksTimeline["points"];
  loading: boolean;
  granularity?: TimelineGranularity;
}) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  if (loading) {
    return (
      <div className="relative h-[180px] w-full animate-pulse rounded bg-canvas dark:bg-zinc-800/40" />
    );
  }
  if (!points.length) {
    return (
      <div className="flex h-[180px] w-full items-center justify-center text-sm text-ink-3">
        No clicks recorded in this period.
      </div>
    );
  }

  const maxClicks = Math.max(1, ...points.map((p) => p.clicks));
  const coords = points.map((p, i) => {
    const x =
      points.length === 1 ? VB_W / 2 : (i / (points.length - 1)) * VB_W;
    const y =
      VB_PAD_Y + (1 - p.clicks / maxClicks) * (VB_H - 2 * VB_PAD_Y);
    return { x, y, clicks: p.clicks };
  });

  // Smooth cubic Bézier through the points
  const pathD = coords
    .map((c, i, arr) => {
      if (i === 0) return `M ${c.x.toFixed(1)},${c.y.toFixed(1)}`;
      const prev = arr[i - 1];
      const dx = c.x - prev.x;
      const cp1x = prev.x + dx / 2;
      const cp2x = c.x - dx / 2;
      return `C ${cp1x.toFixed(1)},${prev.y.toFixed(1)} ${cp2x.toFixed(1)},${c.y.toFixed(1)} ${c.x.toFixed(1)},${c.y.toFixed(1)}`;
    })
    .join(" ");

  const areaD = `${pathD} L ${coords[coords.length - 1].x.toFixed(1)},${VB_H} L ${coords[0].x.toFixed(1)},${VB_H} Z`;

  // Highlight up to 3 peaks (first non-zero, mid non-zero, last non-zero)
  const peakIndices = (() => {
    const nonZero = coords
      .map((c, i) => ({ i, clicks: c.clicks }))
      .filter((c) => c.clicks > 0);
    if (nonZero.length === 0) return [] as number[];
    const first = nonZero[0].i;
    const last = nonZero[nonZero.length - 1].i;
    const mid = nonZero[Math.floor(nonZero.length / 2)].i;
    return Array.from(new Set([first, mid, last]));
  })();

  // Map a pointer event's clientX to the nearest data-point index.
  const handlePointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    if (rect.width === 0) return;
    const ratio = Math.max(
      0,
      Math.min(1, (e.clientX - rect.left) / rect.width),
    );
    const idx =
      points.length === 1
        ? 0
        : Math.round(ratio * (points.length - 1));
    setHoveredIdx(idx);
  };

  const hovered = hoveredIdx !== null ? coords[hoveredIdx] : null;
  const hoveredPoint = hoveredIdx !== null ? points[hoveredIdx] : null;
  const hoveredPct = hovered ? (hovered.x / VB_W) * 100 : 0;
  // Flip tooltip transform-origin near the edges so the bubble never clips.
  const tooltipTranslateX =
    hoveredPct < 12 ? "0%" : hoveredPct > 88 ? "-100%" : "-50%";

  return (
    <div className="relative">
      <svg
        className="block h-[180px] w-full cursor-crosshair touch-none"
        viewBox={`0 0 ${VB_W} ${VB_H}`}
        preserveAspectRatio="none"
        onPointerMove={handlePointerMove}
        onPointerLeave={() => setHoveredIdx(null)}
      >
        {[0.25, 0.5, 0.75].map((t) => (
          <line
            key={t}
            x1="0"
            y1={VB_PAD_Y + (VB_H - 2 * VB_PAD_Y) * t}
            x2={VB_W}
            y2={VB_PAD_Y + (VB_H - 2 * VB_PAD_Y) * t}
            stroke="#e5e7e0"
            strokeDasharray="2,4"
          />
        ))}
        <path d={areaD} fill="url(#chart-g1)" opacity="0.4" />
        <path
          d={pathD}
          fill="none"
          stroke="#7c3aed"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {peakIndices.map((i) => (
          <g key={i}>
            <circle
              cx={coords[i].x}
              cy={coords[i].y}
              r="6"
              fill="#7c3aed"
              opacity="0.2"
            />
            <circle cx={coords[i].x} cy={coords[i].y} r="3.5" fill="#7c3aed" />
          </g>
        ))}
        {hovered && (
          <g pointerEvents="none">
            <line
              x1={hovered.x}
              y1={VB_PAD_Y - 4}
              x2={hovered.x}
              y2={VB_H - VB_PAD_Y + 4}
              stroke="#7c3aed"
              strokeWidth="1"
              strokeDasharray="3,3"
              opacity="0.45"
            />
            <circle
              cx={hovered.x}
              cy={hovered.y}
              r="9"
              fill="#7c3aed"
              opacity="0.18"
            />
            <circle
              cx={hovered.x}
              cy={hovered.y}
              r="4.5"
              fill="#7c3aed"
              stroke="#fff"
              strokeWidth="2"
            />
          </g>
        )}
        <defs>
          <linearGradient id="chart-g1" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#7c3aed" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#7c3aed" stopOpacity="0" />
          </linearGradient>
        </defs>
      </svg>

      {hovered && hoveredPoint && (
        <div
          className="pointer-events-none absolute -top-1 z-10"
          style={{
            left: `${hoveredPct}%`,
            transform: `translate(${tooltipTranslateX}, -100%)`,
          }}
        >
          <div className="whitespace-nowrap rounded-md bg-ink px-3 py-1.5 text-canvas-2 shadow-bento dark:bg-zinc-800">
            <div className="font-mono text-[10px] uppercase tracking-wider text-canvas-2/60">
              {formatTooltipDate(hoveredPoint, granularity)}
            </div>
            <div className="font-display text-[15px] font-bold leading-tight">
              {hoveredPoint.clicks.toLocaleString()} click
              {hoveredPoint.clicks === 1 ? "" : "s"}
            </div>
          </div>
        </div>
      )}

      <div className="mt-1 flex justify-between font-mono text-[10px] text-ink-4 dark:text-zinc-500">
        {axisLabels(points).map((label, i) => (
          <span key={i}>{label}</span>
        ))}
      </div>
    </div>
  );
}

function formatTooltipDate(
  point: ClicksTimeline["points"][number],
  granularity?: TimelineGranularity,
): string {
  const date = new Date(point.starts_at);
  if (Number.isNaN(date.getTime())) return point.at;

  switch (granularity) {
    case "hour":
      return date.toLocaleString(undefined, {
        weekday: "short",
        hour: "2-digit",
        minute: "2-digit",
      });
    case "month":
      return date.toLocaleDateString(undefined, {
        month: "long",
        year: "numeric",
      });
    case "day":
    default:
      return date.toLocaleDateString(undefined, {
        weekday: "short",
        month: "short",
        day: "numeric",
      });
  }
}

// Pick at most 7 evenly-spaced labels so wide series don't crowd the x-axis.
function axisLabels(points: ClicksTimeline["points"]): string[] {
  if (points.length === 0) return [];
  if (points.length <= 7) return points.map((p) => p.at);
  const step = (points.length - 1) / 6;
  return Array.from({ length: 7 }, (_, i) => points[Math.round(i * step)].at);
}

// ── Governance Health donut ──────────────────────────────────────────────────

function HealthCard({
  pct,
  active,
  paused,
  expired,
  loading,
}: {
  pct: number;
  active: number;
  paused: number;
  expired: number;
  loading: boolean;
}) {
  const total = active + paused + expired;
  const C = 2 * Math.PI * 40; // donut circumference
  const seg = (n: number) => (total > 0 ? (n / total) * C : 0);
  const activeLen = seg(active);
  const pausedLen = seg(paused);
  const expiredLen = seg(expired);

  return (
    <Card className="col-span-12 bg-lilac px-6 py-5 lg:col-span-4">
      <div className="mb-3 flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.08em] text-ink-3">
        <span>Governance health</span>
        <Link
          to={GOVERNANCE_ROUTE}
          className="inline-flex items-center gap-1 rounded-full bg-black/5 px-2.5 py-0.5 text-ink-2 transition hover:bg-ink hover:text-canvas-2"
        >
          Details
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            className="h-2.5 w-2.5"
          >
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </Link>
      </div>

      <svg className="mx-auto my-2 h-[100px] w-[100px]" viewBox="0 0 100 100">
        <circle
          cx="50"
          cy="50"
          r="40"
          fill="none"
          stroke="rgba(255,255,255,0.4)"
          strokeWidth="14"
        />
        {!loading && total > 0 && (
          <>
            <circle
              cx="50"
              cy="50"
              r="40"
              fill="none"
              stroke="#2a7a5c"
              strokeWidth="14"
              strokeDasharray={`${activeLen} ${C - activeLen}`}
              strokeDashoffset="0"
              transform="rotate(-90 50 50)"
            />
            <circle
              cx="50"
              cy="50"
              r="40"
              fill="none"
              stroke="#b5613c"
              strokeWidth="14"
              strokeDasharray={`${pausedLen} ${C - pausedLen}`}
              strokeDashoffset={-activeLen}
              transform="rotate(-90 50 50)"
            />
            <circle
              cx="50"
              cy="50"
              r="40"
              fill="none"
              stroke="#b54a31"
              strokeWidth="14"
              strokeDasharray={`${expiredLen} ${C - expiredLen}`}
              strokeDashoffset={-(activeLen + pausedLen)}
              transform="rotate(-90 50 50)"
            />
          </>
        )}
        <text
          x="50"
          y="48"
          textAnchor="middle"
          fontFamily="Bricolage Grotesque"
          fontWeight="800"
          fontSize="22"
          fill="#15151b"
        >
          {loading ? "—" : `${pct}%`}
        </text>
        <text
          x="50"
          y="62"
          textAnchor="middle"
          fontFamily="Geist Mono"
          fontSize="7"
          fill="#6a6a78"
        >
          {pct >= 80 ? "HEALTHY" : pct >= 50 ? "OK" : "ATTENTION"}
        </text>
      </svg>

      <div className="flex flex-col gap-1.5">
        <HealthRow color="bg-mint-d" label="Active" value={active} />
        <HealthRow color="bg-peach-d" label="Paused" value={paused} />
        <HealthRow color="bg-coral-d" label="Expired" value={expired} />
      </div>
    </Card>
  );
}

function HealthRow({
  color,
  label,
  value,
}: {
  color: string;
  label: string;
  value: number;
}) {
  return (
    <div className="flex items-center gap-2.5 text-xs">
      <div className={`h-[7px] w-[7px] shrink-0 rounded-full ${color}`} />
      <span className="flex-1 text-ink-2">{label}</span>
      <span className="font-mono text-[11px] text-ink-2">{value}</span>
    </div>
  );
}

// ── Top performing campaigns leaderboard ─────────────────────────────────────

function LeaderboardCard({
  campaigns,
  loading,
}: {
  campaigns: Campaign[];
  loading: boolean;
}) {
  const maxClicks = Math.max(1, ...campaigns.map((c) => c.totalClicks));
  return (
    <Card className="col-span-12 bg-canvas-2 px-4 py-5 sm:px-6 dark:bg-zinc-900 lg:col-span-7">
      <div className="mb-3.5 flex items-baseline justify-between gap-2">
        <h3 className="font-display text-base font-bold tracking-[-0.02em]">
          Top performing campaigns
        </h3>
        <Link
          to={CAMPAIGNS_ROUTE}
          className="inline-flex items-center gap-1 rounded-full bg-black/5 px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.08em] text-ink-2 transition hover:bg-ink hover:text-canvas-2 dark:bg-white/10 dark:text-zinc-200"
        >
          View all
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            className="h-2.5 w-2.5"
          >
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </Link>
      </div>

      {/* Table — sm and up */}
      <table className="hidden w-full border-collapse sm:table">
        <thead>
          <tr className="border-b border-dashline dark:border-zinc-700">
            <th className="w-7 px-2 py-2 text-left font-mono text-[10px] font-medium uppercase tracking-[0.08em] text-ink-4" />
            <th className="px-2 py-2 text-left font-mono text-[10px] font-medium uppercase tracking-[0.08em] text-ink-4">
              Campaign
            </th>
            <th className="px-2 py-2 text-right font-mono text-[10px] font-medium uppercase tracking-[0.08em] text-ink-4">
              State
            </th>
            <th className="px-2 py-2 text-right font-mono text-[10px] font-medium uppercase tracking-[0.08em] text-ink-4">
              Links
            </th>
            <th className="px-2 py-2 text-right font-mono text-[10px] font-medium uppercase tracking-[0.08em] text-ink-4">
              Clicks
            </th>
          </tr>
        </thead>
        <tbody>
          {loading
            ? [0, 1, 2, 3].map((i) => (
                <tr key={i} className="border-b border-dashline/40">
                  <td className="px-2 py-3" />
                  <td className="px-2 py-3">
                    <div className="h-3.5 w-32 animate-pulse rounded bg-canvas dark:bg-zinc-800" />
                  </td>
                  <td className="px-2 py-3 text-right">
                    <div className="ml-auto h-4 w-14 animate-pulse rounded-full bg-canvas dark:bg-zinc-800" />
                  </td>
                  <td className="px-2 py-3 text-right">
                    <div className="ml-auto h-3 w-6 animate-pulse rounded bg-canvas dark:bg-zinc-800" />
                  </td>
                  <td className="px-2 py-3 text-right">
                    <div className="ml-auto h-3 w-12 animate-pulse rounded bg-canvas dark:bg-zinc-800" />
                  </td>
                </tr>
              ))
            : campaigns.length === 0
              ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-2 py-6 text-center text-sm text-ink-3"
                  >
                    No campaigns yet.
                  </td>
                </tr>
              )
              : (
                campaigns.map((c, i) => (
                  <tr
                    key={c.id}
                    className="cursor-pointer border-b border-dashline/40 last:border-b-0 transition hover:bg-canvas dark:hover:bg-zinc-800/50"
                  >
                    <td className="px-2 py-3 font-mono text-[11px] text-ink-4">
                      {String(i + 1).padStart(2, "0")}
                    </td>
                    <td className="px-2 py-3">
                      <Link
                        to={CAMPAIGNS_ROUTE}
                        className="flex items-center gap-2.5"
                      >
                        <span
                          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-sm"
                          style={{ background: c.accentColor || "#ebe2f7" }}
                          aria-hidden="true"
                        >
                          {campaignIcon(c.name)}
                        </span>
                        <span className="text-[13.5px] font-medium">
                          {c.name}
                        </span>
                      </Link>
                    </td>
                    <td className="px-2 py-3 text-right">
                      <StateChip state={c.state} />
                    </td>
                    <td className="px-2 py-3 text-right font-mono text-[13.5px] font-medium text-ink-2">
                      {c.linksCount}
                    </td>
                    <td className="px-2 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <div className="h-[3px] w-[50px] overflow-hidden rounded bg-dashline dark:bg-zinc-700">
                          <div
                            className="h-full rounded"
                            style={{
                              width: `${(c.totalClicks / maxClicks) * 100}%`,
                              background: c.accentColor || "#6b4ba6",
                            }}
                          />
                        </div>
                        <span className="font-mono text-[13.5px] font-medium text-ink">
                          {c.totalClicks.toLocaleString()}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))
              )}
        </tbody>
      </table>

      {/* Card list — mobile only (< sm) */}
      <div className="flex flex-col divide-y divide-dashline/60 sm:hidden dark:divide-zinc-800">
        {loading ? (
          [0, 1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-3 py-3">
              <div className="h-7 w-7 shrink-0 animate-pulse rounded-lg bg-canvas dark:bg-zinc-800" />
              <div className="flex-1 space-y-1.5">
                <div className="h-3.5 w-2/3 animate-pulse rounded bg-canvas dark:bg-zinc-800" />
                <div className="h-2.5 w-1/2 animate-pulse rounded bg-canvas dark:bg-zinc-800" />
              </div>
              <div className="h-4 w-12 animate-pulse rounded-full bg-canvas dark:bg-zinc-800" />
            </div>
          ))
        ) : campaigns.length === 0 ? (
          <div className="py-6 text-center text-sm text-ink-3">
            No campaigns yet.
          </div>
        ) : (
          campaigns.map((c, i) => (
            <Link
              key={c.id}
              to={CAMPAIGNS_ROUTE}
              className="group flex flex-col gap-2.5 py-3 transition active:scale-[0.99]"
            >
              <div className="flex items-center gap-3">
                <span className="w-6 shrink-0 font-mono text-[11px] text-ink-4">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-sm"
                  style={{ background: c.accentColor || "#ebe2f7" }}
                  aria-hidden="true"
                >
                  {campaignIcon(c.name)}
                </span>
                <span className="min-w-0 flex-1 truncate text-[14px] font-medium">
                  {c.name}
                </span>
                <StateChip state={c.state} />
              </div>
              <div className="flex items-center gap-3 pl-[3.25rem] text-[12.5px]">
                <span className="font-mono text-ink-3">
                  <span className="font-medium text-ink-2">{c.linksCount}</span>{" "}
                  links
                </span>
                <span className="text-ink-4">·</span>
                <span className="font-mono text-ink-3">
                  <span className="font-medium text-ink">
                    {c.totalClicks.toLocaleString()}
                  </span>{" "}
                  clicks
                </span>
                <div className="ml-auto h-[3px] w-[60px] overflow-hidden rounded bg-dashline dark:bg-zinc-700">
                  <div
                    className="h-full rounded"
                    style={{
                      width: `${(c.totalClicks / maxClicks) * 100}%`,
                      background: c.accentColor || "#6b4ba6",
                    }}
                  />
                </div>
              </div>
            </Link>
          ))
        )}
      </div>
    </Card>
  );
}

function StateChip({ state }: { state: string }) {
  const cls =
    state === "active"
      ? "text-mint-d"
      : state === "paused"
        ? "text-peach-d"
        : state === "expired"
          ? "text-coral-d"
          : "text-ink-3";
  const dot =
    state === "active"
      ? "bg-mint-d"
      : state === "paused"
        ? "bg-peach-d"
        : state === "expired"
          ? "bg-coral-d"
          : "bg-ink-3";
  return (
    <span
      className={`inline-flex items-center gap-1.5 text-[11.5px] ${cls}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${dot}`} />
      {state}
    </span>
  );
}

// ── Top last-clicked links ───────────────────────────────────────────────────

function LastClickedCard({
  links,
  loading,
}: {
  links: GovernanceLink[];
  loading: boolean;
}) {
  return (
    <Card className="col-span-12 bg-peach-2 px-6 py-5 lg:col-span-5">
      <div className="mb-1.5 flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.08em] text-ink-3">
        <span>Top 5 last clicked</span>
        <Link
          to={`${GOVERNANCE_ROUTE}?sortBy=last_clicked&order=desc`}
          className="inline-flex items-center gap-1 rounded-full bg-black/5 px-2.5 py-0.5 text-ink-2 transition hover:bg-ink hover:text-canvas-2"
        >
          View all
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            className="h-2.5 w-2.5"
          >
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </Link>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[0, 1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="flex items-center gap-3 border-b border-black/[0.06] py-3 last:border-b-0"
            >
              <div className="h-8 w-8 shrink-0 animate-pulse rounded-[9px] bg-canvas-2" />
              <div className="flex-1 space-y-1">
                <div className="h-3 w-2/3 animate-pulse rounded bg-canvas-2" />
                <div className="h-2.5 w-1/2 animate-pulse rounded bg-canvas-2" />
              </div>
              <div className="h-4 w-12 animate-pulse rounded-full bg-canvas-2" />
            </div>
          ))}
        </div>
      ) : links.length === 0 ? (
        <div className="py-6 text-center text-sm text-ink-3">
          No clicks recorded yet.
        </div>
      ) : (
        <div className="flex flex-col">
          {links.map((link) => (
            <Link
              key={link.lookup_code}
              to={`${GOVERNANCE_ROUTE}?lookup=${link.lookup_code}`}
              className="flex items-center gap-3 border-b border-black/[0.06] py-3 transition last:border-b-0 hover:translate-x-0.5"
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[9px] bg-canvas-2 text-sm">
                🔗
              </div>
              <div className="min-w-0 flex-1">
                <div className="truncate text-[13.5px] font-medium text-ink">
                  {link.name || link.dest}
                </div>
                <div className="truncate font-mono text-[11px] text-ink-3">
                  {link.short}
                </div>
              </div>
              <div className="flex shrink-0 flex-col items-end gap-1">
                <StateChipMini state={link.state} />
                <span className="font-mono text-[11.5px] font-medium text-ink-2">
                  👆 {link.clicks.toLocaleString()}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </Card>
  );
}

function StateChipMini({ state }: { state: string }) {
  const cls =
    state === "active"
      ? "bg-mint-2 text-mint-d"
      : state === "paused"
        ? "bg-peach text-peach-d"
        : state === "expired"
          ? "bg-coral-2 text-coral-d"
          : "bg-canvas-2 text-ink-3";
  return (
    <span
      className={`rounded-full px-2 py-0.5 font-mono text-[10.5px] ${cls}`}
    >
      {state}
    </span>
  );
}

// ── Insight / nudge bar ──────────────────────────────────────────────────────

function InsightCard({
  expiredCount,
  exampleLinks,
}: {
  expiredCount: number;
  exampleLinks: GovernanceLink[];
}) {
  const [dismissed, setDismissed] = useState(false);
  if (dismissed) return null;
  const names = exampleLinks.map((l) => l.name || l.dest).slice(0, 2);
  return (
    <div className="relative col-span-12 flex items-center gap-4 overflow-hidden rounded-bento bg-ink px-6 py-5 text-canvas-2 shadow-bento-sm">
      <div className="pointer-events-none absolute inset-y-0 right-0 w-1/2 bg-[radial-gradient(ellipse_at_center_right,rgba(252,217,184,0.1),transparent_60%)]" />
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[11px] bg-gradient-to-br from-sun to-coral text-lg">
        💡
      </div>
      <div className="relative z-10 flex-1">
        <div className="mb-0.5 font-mono text-[10px] uppercase tracking-[0.08em] text-sun">
          Smart insight
        </div>
        <div className="mb-0.5 font-display text-[15px] font-semibold tracking-[-0.01em]">
          {expiredCount} link{expiredCount === 1 ? "" : "s"} expired — review
          before they go dark
        </div>
        <div className="text-[13px] text-white/60">
          {names.length > 0 ? (
            <>
              {names.map((n, i) => (
                <span key={n}>
                  {i > 0 && " and "}
                  <strong className="text-white">{n}</strong>
                </span>
              ))}{" "}
              {names.length === expiredCount
                ? "are"
                : `and ${expiredCount - names.length} more are`}{" "}
              already marked expired. Extend or redirect to recover lost clicks.
            </>
          ) : (
            "Extend or redirect them to recover lost clicks."
          )}
        </div>
      </div>
      <Link
        to={`${GOVERNANCE_ROUTE}?state=expired`}
        className="relative z-10 inline-flex shrink-0 items-center gap-1.5 rounded-full bg-canvas-2 px-4 py-2.5 text-[13px] font-medium text-ink transition hover:-translate-y-px hover:bg-sun"
      >
        Review expired
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          className="h-3 w-3"
        >
          <path d="M5 12h14M12 5l7 7-7 7" />
        </svg>
      </Link>
      <button
        type="button"
        onClick={() => setDismissed(true)}
        title="Dismiss"
        className="relative z-10 flex h-7 w-7 items-center justify-center rounded-full text-lg text-white/40 transition hover:bg-white/10 hover:text-canvas-2"
      >
        ×
      </button>
    </div>
  );
}

export default DashboardPage;
