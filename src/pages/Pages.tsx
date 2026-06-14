/**
 * Pages — the live /pages dashboard.
 * Visual design ported from PagesMockup (/pages-mockup); wired to real data.
 *
 * Real & wired: page list (getPages), publish status (getPageStatus), inline
 * rename (updatePage), delete (deletePage), edit navigation, "view live"
 * (published_url), create page, and traffic analytics — real page views, the
 * 14-day window, trend and daily sparkline (getPagesAnalytics, backed by
 * BrandPageAnalyticsService). Per-link click counts are NOT tracked for
 * brand-page links, so there is no per-link breakdown.
 * Client-only niceties: search / status filter / sort / pin (not persisted).
 */
import MainLayout from '@/components/layouts/MainLayout';
import Preview from '@/components/sections/Preview';
import PortfolioThumb from '@/components/sections/PortfolioThumb';
import { deletePage, getPages, getPagesAnalytics, updatePage } from '@/apis/pages';
import { CREATE_PAGES_ROUTE } from '@/routes';
import type { Page, PageLink } from '@/types';
import { getPageStatus, isPagePublished, type PageStatus } from '@/utils/pageStatus';
import {
  ExternalLink,
  MoreVertical,
  Pencil,
  Pin,
  PinOff,
  Search,
  Trash2,
} from 'lucide-react';
import {
  type CSSProperties,
  type KeyboardEvent,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useCookies } from 'react-cookie';
import { useNavigate } from 'react-router-dom';

import '@/components/pages-mockup/pages-mockup.css';

// ─── Display model ───────────────────────────────────────────────────────────

// Real per-page traffic, fetched from GET /api/v1/brand_pages/analytics.
// `views` is all-time page views; `views_window` the last 14 days; `trend_pct`
// the change vs the preceding 14 days; `spark` the 14 daily counts.
type PageAnalytics = {
  views: number;
  views_window: number;
  trend_pct: number;
  spark: number[];
};
type AnalyticsMap = Record<string, PageAnalytics>;

const EMPTY_SPARK = Array(14).fill(0) as number[];

type DisplayPage = Page & {
  clicks: number; // all-time page views
  views14d: number; // page views in the last 14 days
  trend: number; // % change of the 14-day window vs the previous one
  spark: number[]; // daily page views, last 14 days (oldest → newest)
  updatedRel: string;
  isPrimary?: boolean;
};

function relTime(iso: string): string {
  const then = new Date(iso).getTime();
  const now = Date.now();
  const diff = Math.max(0, now - then);
  const min = Math.floor(diff / 60000);
  if (min < 1) return 'just now';
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const day = Math.floor(hr / 24);
  if (day < 30) return `${day}d ago`;
  const mo = Math.floor(day / 30);
  if (mo < 12) return `${mo}mo ago`;
  return `${Math.floor(mo / 12)}y ago`;
}

function toDisplay(page: Page, analytics?: PageAnalytics): DisplayPage {
  return {
    ...page,
    clicks: analytics?.views ?? 0,
    views14d: analytics?.views_window ?? 0,
    trend: analytics?.trend_pct ?? 0,
    spark: analytics?.spark?.length ? analytics.spark : EMPTY_SPARK,
    updatedRel: relTime(page.updated_at),
  };
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function pageGradient(page: DisplayPage): string {
  const c = page.content;
  if (c.backgroundType === 'gradient') {
    return `linear-gradient(135deg, ${c.gradientStart ?? '#7c3aed'}, ${c.gradientEnd ?? '#ec4899'})`;
  }
  const solid = c.backgroundColor ?? '#7c3aed';
  return `linear-gradient(135deg, ${solid}, ${solid})`;
}

function pageAccent(page: DisplayPage): string {
  return page.content.gradientStart ?? page.content.backgroundColor ?? '#7c3aed';
}

function previewLinks(page: Page): PageLink[] {
  return Array.isArray(page.links) ? page.links : [];
}

function StatusBadge({ status }: { status: PageStatus }) {
  if (status === 'published')
    return <span className="pm-badge pm-badge-published">● Live</span>;
  if (status === 'publishing')
    return <span className="pm-badge pm-badge-publishing">◌ Publishing…</span>;
  return <span className="pm-badge pm-badge-draft">✎ Draft</span>;
}

// ─── Stats row (top) ──────────────────────────────────────────────────────────

function StatsRow({ pages }: { pages: DisplayPage[] }) {
  const total = pages.length;
  const published = pages.filter(isPagePublished).length;
  const drafts = total - published;
  const totalLinks = pages.reduce((sum, p) => sum + previewLinks(p).length, 0);
  const totalViews = pages.reduce((sum, p) => sum + p.clicks, 0);
  const topPage = [...pages].sort((a, b) => b.clicks - a.clicks)[0];
  const avgViews = total ? Math.round(totalViews / total) : 0;

  const tiles = [
    {
      icon: '▤',
      label: 'Pages',
      value: total.toString(),
      sub: `${published} live · ${drafts} draft`,
      bg: 'linear-gradient(135deg, #ec4899, #7c3aed)',
      shadow: 'rgba(124, 58, 237, 0.35)',
    },
    {
      icon: '⊞',
      label: 'Total Links',
      value: totalLinks.toString(),
      sub: 'across all pages',
      bg: 'linear-gradient(135deg, #06b6d4, #3b82f6)',
      shadow: 'rgba(6, 182, 212, 0.35)',
    },
    {
      icon: '⇗',
      label: 'Total Views',
      value: totalViews.toLocaleString(),
      sub: 'all time',
      bg: 'linear-gradient(135deg, #84cc16, #10b981)',
      shadow: 'rgba(16, 185, 129, 0.35)',
    },
    {
      icon: '★',
      label: 'Top Page',
      value: topPage?.title.split(' ').slice(0, 2).join(' ') ?? '—',
      sub: topPage ? `${topPage.clicks.toLocaleString()} views` : '—',
      bg: 'linear-gradient(135deg, #f59e0b, #ec4899)',
      shadow: 'rgba(236, 72, 153, 0.35)',
    },
    {
      icon: '≈',
      label: 'Avg / Page',
      value: avgViews.toLocaleString(),
      sub: 'views',
      bg: 'linear-gradient(135deg, #a855f7, #6366f1)',
      shadow: 'rgba(99, 102, 241, 0.35)',
    },
  ];

  return (
    <div className="pm-stats-row">
      {tiles.map((t) => (
        <div
          key={t.label}
          className="pm-stat-tile"
          style={{ '--pm-tile-bg': t.bg, '--pm-tile-shadow': t.shadow } as CSSProperties}
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

// ─── Donut (compact) ──────────────────────────────────────────────────────────

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
      style={{ transform: 'rotate(-90deg)', flexShrink: 0 }}
    >
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(0,0,0,0.06)" strokeWidth={10} />
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

// ─── Insights sidebar ─────────────────────────────────────────────────────────

function InsightsPanel({ pages }: { pages: DisplayPage[] }) {
  const topPages = [...pages].sort((a, b) => b.clicks - a.clicks).slice(0, 5);
  const topPeak = Math.max(1, ...topPages.map((p) => p.clicks));

  const trending = [...pages]
    .filter((p) => p.views14d > 0)
    .sort((a, b) => b.views14d - a.views14d)
    .slice(0, 5);
  const trendPeak = Math.max(1, ...trending.map((p) => p.views14d));

  const counts = pages.reduce(
    (acc, p) => {
      if (isPagePublished(p)) acc.pub++;
      else acc.draft++;
      return acc;
    },
    { pub: 0, draft: 0 },
  );
  const total = Math.max(1, pages.length);
  const healthItems = [
    { label: 'Live', value: counts.pub, color: '#10b981' },
    { label: 'Draft', value: counts.draft, color: '#f59e0b' },
  ].filter((i) => i.value > 0);
  const donutSegs = healthItems.map((i) => ({
    pct: Math.round((i.value / total) * 100),
    color: i.color,
  }));

  return (
    <aside className="pm-side">
      <div className="pm-panel">
        <h3 className="pm-panel-title">
          <span className="pm-panel-title-dot" />
          Top Performing Pages
        </h3>
        {topPages.map((p, i) => (
          <div key={p.id} className="pm-rank-row">
            <div className="pm-rank">{i + 1}</div>
            <div className="pm-rank-info">
              <div className="pm-rank-name">{p.title}</div>
              <div className="pm-rank-sub">{previewLinks(p).length} links</div>
            </div>
            <div>
              <div className="pm-rank-clicks">{p.clicks.toLocaleString()}</div>
              <div className="pm-rank-bar">
                <div className="pm-rank-bar-fill" style={{ width: `${(p.clicks / topPeak) * 100}%` }} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="pm-panel">
        <h3 className="pm-panel-title">
          <span className="pm-panel-title-dot" />
          Trending · last 14 days
        </h3>
        {trending.length === 0 ? (
          <div className="pm-rank-sub" style={{ padding: '6px 2px' }}>No views yet</div>
        ) : (
          trending.map((p, i) => (
            <div key={p.id} className="pm-rank-row">
              <div className="pm-rank">{i + 1}</div>
              <div className="pm-rank-info">
                <div className="pm-rank-name">{p.title}</div>
                <div className="pm-rank-sub">
                  {p.trend === 0 ? 'vs prev 14d' : `${p.trend > 0 ? '▲' : '▼'} ${Math.abs(p.trend)}% vs prev`}
                </div>
              </div>
              <div>
                <div className="pm-rank-clicks">{p.views14d.toLocaleString()}</div>
                <div className="pm-rank-bar">
                  <div className="pm-rank-bar-fill" style={{ width: `${(p.views14d / trendPeak) * 100}%` }} />
                </div>
              </div>
            </div>
          ))
        )}
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
                <div className="pm-donut-leg-dot" style={{ background: i.color }} />
                <div className="pm-donut-leg-label">{i.label}</div>
                <div className="pm-donut-leg-val">{i.value}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
}

// ─── PageCard ─────────────────────────────────────────────────────────────────

interface PageCardProps {
  page: DisplayPage;
  isPinned: boolean;
  onTogglePin: (id: number) => void;
  onRename: (page: DisplayPage, newTitle: string) => void;
  onEdit: () => void;
  onDelete: () => void;
  showDivider: boolean;
}

function PageCard({
  page,
  isPinned,
  onTogglePin,
  onRename,
  onEdit,
  onDelete,
  showDivider,
}: PageCardProps) {
  const [editing, setEditing] = useState(false);
  const [draftTitle, setDraftTitle] = useState(page.title);

  const gradient = pageGradient(page);
  const accent = pageAccent(page);
  const sparkPeak = Math.max(...page.spark, 1);

  const commit = () => {
    if (draftTitle.trim() && draftTitle !== page.title) onRename(page, draftTitle.trim());
    else setDraftTitle(page.title);
    setEditing(false);
  };

  const onKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') commit();
    if (e.key === 'Escape') {
      setDraftTitle(page.title);
      setEditing(false);
    }
  };

  return (
    <>
      <article
        className={`pm-card${page.isPrimary ? ' pm-card--primary' : ''}`}
        style={{
          '--pm-card-accent': accent,
          '--pm-card-gradient': gradient,
          '--pm-card-glow': `${accent}55`,
        } as CSSProperties}
      >
        <div className="pm-card-halo" />

        <button
          type="button"
          className={`pm-pin-btn${isPinned ? ' pm-pin-btn--active' : ''}`}
          title={isPinned ? 'Unpin page' : 'Pin to top'}
          onClick={() => onTogglePin(page.id ?? 0)}
        >
          {isPinned ? <PinOff size={14} strokeWidth={2} /> : <Pin size={14} strokeWidth={2} />}
        </button>

        <div className="pm-card-body">
          {/* Phone */}
          <div className="pm-phone-wrap">
            <div className="pm-phone">
              <div className="pm-phone-notch" />
              <div className="pm-phone-screen">
                <div className="pm-phone-screen-inner">
                  {page.content.template === 'portfolio' ? (
                    <PortfolioThumb title={page.title} content={page.content} />
                  ) : (
                    <Preview
                      title={page.title}
                      description={page.description}
                      content={page.content}
                      links={previewLinks(page)}
                    />
                  )}
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
                  ? page.published_url.replace('https://', '')
                  : `thin.ly/${page.lookup_code}`}
              </span>
              <StatusBadge status={getPageStatus(page)} />
              {isPinned && (
                <span className="pm-badge pm-badge-pinned">
                  <Pin size={10} strokeWidth={2.5} /> Pinned
                </span>
              )}
            </div>

            <div className="pm-stat-pills">
              <div className="pm-pill" style={{ '--pm-pill-accent': '#06b6d4' } as CSSProperties}>
                <div className="pm-pill-label">
                  <span className="pm-pill-dot" /> Links
                </div>
                <div className="pm-pill-value">{previewLinks(page).length}</div>
                <div className="pm-pill-sub">in this page</div>
              </div>

              <div className="pm-pill" style={{ '--pm-pill-accent': '#7c3aed' } as CSSProperties}>
                <div className="pm-pill-label">
                  <span className="pm-pill-dot" /> Views
                </div>
                <div className="pm-pill-value">{page.clicks.toLocaleString()}</div>
                <div className="pm-pill-sub">all time</div>
              </div>

              <div className="pm-pill" style={{ '--pm-pill-accent': '#ec4899' } as CSSProperties}>
                <div className="pm-pill-label">
                  <span className="pm-pill-dot" /> Views · 14d
                </div>
                <div className="pm-pill-value">{page.views14d.toLocaleString()}</div>
                <div
                  className={`pm-pill-sub ${
                    page.trend > 0 ? 'pm-pill-sub-up' : page.trend < 0 ? 'pm-pill-sub-down' : ''
                  }`}
                >
                  {page.trend === 0
                    ? 'vs prev 14d'
                    : `${page.trend > 0 ? '▲' : '▼'} ${Math.abs(page.trend)}% vs prev`}
                </div>
              </div>

              <div className="pm-pill pm-pill-trend" style={{ '--pm-pill-accent': '#84cc16' } as CSSProperties}>
                <div className="pm-pill-label">
                  <span className="pm-pill-dot" /> Daily · 14d
                </div>
                <div className="pm-spark" aria-hidden>
                  {page.spark.map((v, i) => (
                    <div
                      key={i}
                      className="pm-spark-bar"
                      style={{
                        height: `${Math.max(8, (v / sparkPeak) * 100)}%`,
                        '--pm-spark-color':
                          page.trend >= 0
                            ? 'linear-gradient(180deg, #a855f7, #7c3aed)'
                            : 'linear-gradient(180deg, #fda4af, #ef4444)',
                      } as CSSProperties}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="pm-card-foot">
          <span className="pm-foot-date">
            Created{' '}
            {new Date(page.created_at).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })}{' '}
            · updated {page.updatedRel}
          </span>
          <div className="pm-foot-actions">
            <a
              className={`pm-btn pm-btn-ghost pm-btn-sm${page.published_url ? '' : ' pm-btn-disabled'}`}
              href={page.published_url || undefined}
              target="_blank"
              rel="noopener noreferrer"
              aria-disabled={!page.published_url}
              onClick={(e) => {
                if (!page.published_url) e.preventDefault();
              }}
            >
              <ExternalLink size={12} strokeWidth={2} />
              View live
            </a>
            <button
              type="button"
              className="pm-btn pm-btn-ghost pm-btn-sm pm-btn-disabled"
              title="Duplicate — coming soon"
              disabled
            >
              ⎘ Duplicate
            </button>
            <button type="button" className="pm-btn pm-btn-primary pm-btn-sm" onClick={onEdit}>
              Edit page →
            </button>
            <button
              type="button"
              className="pm-btn pm-btn-ghost pm-btn-icon pm-btn-disabled"
              title="More — coming soon"
              disabled
            >
              <MoreVertical size={14} strokeWidth={2} />
            </button>
            <button
              type="button"
              className="pm-btn pm-btn-ghost pm-btn-icon"
              title="Delete page"
              onClick={onDelete}
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

// ─── Top-level page ───────────────────────────────────────────────────────────

const STATE_FILTERS: Array<'all' | 'PUBLISHED' | 'DRAFT'> = ['all', 'PUBLISHED', 'DRAFT'];
const STATE_LABEL: Record<(typeof STATE_FILTERS)[number], string> = {
  all: 'All',
  PUBLISHED: 'Live',
  DRAFT: 'Draft',
};

type SortKey = 'clicks' | 'updated' | 'alpha';
const SORT_LABEL: Record<SortKey, string> = {
  clicks: 'Most views',
  updated: 'Recently updated',
  alpha: 'A → Z',
};

const PagesPage = () => {
  const [cookies] = useCookies(['token']);
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [pages, setPages] = useState<DisplayPage[]>([]);
  const [loaded, setLoaded] = useState(false);

  const [search, setSearch] = useState('');
  const [stateFilter, setStateFilter] = useState<(typeof STATE_FILTERS)[number]>('all');
  const [sortKey, setSortKey] = useState<SortKey>('updated');
  const [pinnedIds, setPinnedIds] = useState<Set<number>>(new Set());

  const retrievePages = useCallback(async () => {
    try {
      const res: Page[] = await getPages(cookies.token);
      // Real traffic is a best-effort enrichment — never block the page list on it.
      let analytics: AnalyticsMap = {};
      try {
        analytics = (await getPagesAnalytics(cookies.token)) as AnalyticsMap;
      } catch (analyticsError) {
        console.error('Could not load page analytics:', analyticsError);
      }
      setPages((res || []).map((p) => toDisplay(p, analytics[p.lookup_code])));
    } catch (error: unknown) {
      console.error(error);
      setErrorMessage('An error occurred while fetching pages.');
    } finally {
      setLoaded(true);
    }
  }, [cookies.token]);

  useEffect(() => {
    if (cookies.token) retrievePages();
  }, [cookies.token, retrievePages]);

  const onTogglePin = (id: number) => {
    setPinnedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const onRename = async (page: DisplayPage, newTitle: string) => {
    setPages((prev) => prev.map((p) => (p.id === page.id ? { ...p, title: newTitle } : p)));
    try {
      await updatePage(cookies.token, page.lookup_code, { title: newTitle });
    } catch (error) {
      console.error('Rename failed:', error);
      setErrorMessage('Could not rename the page.');
      retrievePages();
    }
  };

  const onDelete = async (page: DisplayPage) => {
    if (!window.confirm(`Delete “${page.title}”? This can't be undone.`)) return;
    try {
      await deletePage(cookies.token, page.lookup_code);
      setPages((prev) => prev.filter((p) => p.id !== page.id));
    } catch (error) {
      console.error('Delete failed:', error);
      setErrorMessage('Could not delete the page.');
    }
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const pinned: DisplayPage[] = [];
    const rest: DisplayPage[] = [];
    for (const p of pages) {
      if (stateFilter === 'PUBLISHED' && !isPagePublished(p)) continue;
      if (stateFilter === 'DRAFT' && isPagePublished(p)) continue;
      if (q.length > 0) {
        const hay = `${p.title} ${p.description ?? ''} ${p.lookup_code}`.toLowerCase();
        if (!hay.includes(q)) continue;
      }
      (pinnedIds.has(p.id ?? -1) ? pinned : rest).push(p);
    }
    const sorter = (a: DisplayPage, b: DisplayPage) => {
      if (sortKey === 'clicks') return b.clicks - a.clicks;
      if (sortKey === 'updated')
        return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
      return a.title.localeCompare(b.title);
    };
    pinned.sort(sorter);
    rest.sort(sorter);
    return [...pinned, ...rest];
  }, [pages, search, stateFilter, sortKey, pinnedIds]);

  const pinnedCount = filtered.filter((p) => pinnedIds.has(p.id ?? -1)).length;

  return (
    <MainLayout>
      <div className="pm-shell">
        <div className="pm-page-header">
          <div>
            <h1 className="pm-h1">
              Your <span className="pm-h1-accent">pages</span>
            </h1>
            <p className="pm-subtitle">Preview, measure, and edit your link-in-bio pages</p>
          </div>
          <div className="pm-header-actions">
            <button
              type="button"
              className="pm-btn pm-btn-ghost pm-btn-disabled"
              title="Archive drafts — coming soon"
              disabled
            >
              ⊟ Archive drafts
            </button>
            <button
              type="button"
              className="pm-btn pm-btn-primary"
              onClick={() => navigate(CREATE_PAGES_ROUTE)}
            >
              + New page
            </button>
          </div>
        </div>

        <StatsRow pages={pages} />

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
                    className={`pm-chip${stateFilter === s ? ' pm-chip-on' : ''}`}
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
                    className={`pm-chip${sortKey === k ? ' pm-chip-on' : ''}`}
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
                  <p>
                    {loaded
                      ? pages.length === 0
                        ? 'No pages yet — create your first one.'
                        : 'No pages match your filters.'
                      : 'Loading pages…'}
                  </p>
                </div>
              ) : (
                filtered.map((page, idx) => (
                  <PageCard
                    key={page.id}
                    page={page}
                    isPinned={pinnedIds.has(page.id ?? -1)}
                    onTogglePin={onTogglePin}
                    onRename={onRename}
                    onEdit={() => navigate(`/pages/${page.lookup_code}`)}
                    onDelete={() => onDelete(page)}
                    showDivider={
                      idx === pinnedCount - 1 && pinnedCount > 0 && pinnedCount < filtered.length
                    }
                  />
                ))
              )}
            </div>
            {errorMessage && <p className="text-red-500 mt-4">{errorMessage}</p>}
          </div>

          <InsightsPanel pages={pages} />
        </div>
      </div>
    </MainLayout>
  );
};

export default PagesPage;
