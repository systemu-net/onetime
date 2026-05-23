import { useNotification } from "@/Notifications";
import { fetchCampaigns } from "@/apis/campaigns";
import {
    createGovernedLink,
    fetchGovernanceLinkByCode,
    fetchGovernanceLinks,
    pauseAllGovernedLinks,
} from "@/apis/governance";
import { getQrCodes } from "@/apis/qr_codes";
import { Pagination } from "@/components/elements/Pagination";
import { Heading } from "@/components/elements/heading";
import { GovernanceDrawer } from "@/components/governance/GovernanceDrawer";
import { GovernanceLastOpenedTable } from "@/components/governance/GovernanceLastOpenedTable";
import { GovernanceLinksTable } from "@/components/governance/GovernanceLinksTable";
import { GovernanceStatsGrid } from "@/components/governance/GovernanceStatsGrid";
import { NewGovernedLinkModal } from "@/components/governance/NewGovernedLinkModal";
import MainLayout from "@/components/layouts/MainLayout";
import { GOVERNANCE_ROUTE } from "@/routes";
import type { QrCode } from "@/types";
import type { Campaign } from "@/types/campaigns";
import type {
    CreateGovernedLinkPayload,
    GovernanceLink,
    LinkState,
} from "@/types/governance";
import type { LinkStats, PaginationMeta } from "@/types/pagination";
import { useCallback, useEffect, useRef, useState } from "react";
import { useCookies } from "react-cookie";
import { useLocation } from "react-router-dom";

import "@/components/governance/governance.css";

const DEFAULT_PAGINATION: PaginationMeta = {
  count: 0,
  page: 1,
  limit: 25,
  pages: 1,
  next: null,
  prev: null,
};
const DEFAULT_STATS: LinkStats = {
  total: 0,
  active: 0,
  paused: 0,
  expired: 0,
  draft: 0,
  totalClicks: 0,
};

export default function GovernancePage() {
  const [cookies] = useCookies(["token"]);
  const token = cookies.token as string;
  const { addNotification } = useNotification();
  const location = useLocation();

  // ── Data state ──────────────────────────────────────────────────────────────
  const [links, setLinks] = useState<GovernanceLink[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [pagination, setPagination] =
    useState<PaginationMeta>(DEFAULT_PAGINATION);
  const [stats, setStats] = useState<LinkStats>(DEFAULT_STATS);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<GovernanceLink | null>(null);

  // ── Last-opened tracking ─────────────────────────────────────────────────────
  // Stores the full link object so both the row highlight and the cross-page chip
  // can render without extra fetches. lastOpenedIdRef is a stable copy for the
  // handleClose callback so it doesn't need the state value in its dep array.
  const [lastOpenedLink, setLastOpenedLink] = useState<GovernanceLink | null>(
    null,
  );
  const [flashingId, setFlashingId] = useState<string | null>(null);
  const lastOpenedIdRef = useRef<string | null>(null);

  // ── Filter / page state (lifted from table) ─────────────────────────────────
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [filterState, setFilterState] = useState<LinkState | "all">(() => {
    const s = new URLSearchParams(window.location.search).get("state");
    return (s as LinkState) || "all";
  });
  const [page, setPage] = useState(1);

  const setFilterStateWithUrl = useCallback((state: LinkState | "all") => {
    setFilterState(state);
    const params = new URLSearchParams(window.location.search);
    if (state === "all") {
      params.delete("state");
    } else {
      params.set("state", state);
    }
    const qs = params.toString();
    window.history.replaceState(
      null,
      "",
      GOVERNANCE_ROUTE + (qs ? `?${qs}` : ""),
    );
  }, []);

  // Open the drawer and record which link was opened in the URL.
  const handleSelect = useCallback((link: GovernanceLink) => {
    setSelected(link);
    setLastOpenedLink(link);
    lastOpenedIdRef.current = link.id;
    const params = new URLSearchParams(window.location.search);
    params.set("lookup", link.lookup_code);
    window.history.replaceState(
      null,
      "",
      GOVERNANCE_ROUTE + "?" + params.toString(),
    );
  }, []);

  // Close the drawer: preserve the URL (so refresh reopens it), flash + scroll
  // the row back into view so the user instantly sees what they just edited.
  const handleClose = useCallback(() => {
    setSelected(null);
    const id = lastOpenedIdRef.current;
    if (!id) return;
    setFlashingId(id);
    requestAnimationFrame(() => {
      document.querySelector(`[data-link-id="${id}"]`)?.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    });
  }, []);

  const handleDismissLastOpened = useCallback(() => {
    setLastOpenedLink(null);
    lastOpenedIdRef.current = null;
    const params = new URLSearchParams(window.location.search);
    params.delete("lookup");
    const qs = params.toString();
    window.history.replaceState(
      null,
      "",
      GOVERNANCE_ROUTE + (qs ? `?${qs}` : ""),
    );
  }, []);

  // Auto-clear the flash class after the animation finishes.
  useEffect(() => {
    if (!flashingId) return;
    const t = setTimeout(() => setFlashingId(null), 800);
    return () => clearTimeout(t);
  }, [flashingId]);

  // ── Modal state ─────────────────────────────────────────────────────────────
  const [isCreateOpen, setIsCreateOpen] = useState(() => {
    return new URLSearchParams(window.location.search).get("new") === "1";
  });
  const [isCreating, setIsCreating] = useState(false);
  const [isPausingAll, setIsPausingAll] = useState(false);

  // Open the create modal when navigated with ?new=1 (e.g. from the Dashboard
  // "New Link" button). Strip the param so refreshing doesn't reopen it.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("new") === "1") {
      setIsCreateOpen(true);
      params.delete("new");
      const qs = params.toString();
      window.history.replaceState(
        null,
        "",
        GOVERNANCE_ROUTE + (qs ? `?${qs}` : ""),
      );
    }
  }, []);

  // Campaigns and QR codes are loaded once; they don't paginate.
  const campaignsRef = useRef<Campaign[]>([]);
  const qrMapRef = useRef<Map<string, string>>(new Map());
  const campaignsLoaded = useRef(false);

  const onToast = useCallback(
    (msg: string, type: "success" | "info" | "error" | "warning" = "info") => {
      addNotification(msg, type);
    },
    [addNotification],
  );

  // ── Debounce search → debouncedSearch, reset page ──────────────────────────
  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 350);
    return () => clearTimeout(t);
  }, [search]);

  // Reset page when filter changes
  useEffect(() => {
    setPage(1);
  }, [filterState]);

  // ── Load campaigns + QR codes once ─────────────────────────────────────────
  useEffect(() => {
    if (!token || campaignsLoaded.current) return;
    campaignsLoaded.current = true;

    Promise.all([
      fetchCampaigns(token).catch(() => [] as Campaign[]),
      getQrCodes(token).catch(() => []),
    ]).then(([campaignList, qrCodes]) => {
      campaignsRef.current = campaignList;
      setCampaigns(campaignList);
      qrMapRef.current = new Map(
        (qrCodes as QrCode[])
          .filter((qr) => qr?.link?.lookup_code)
          .map((qr) => [qr.link.lookup_code, qr.image_url]),
      );
    });
  }, [token]);

  // ── Enrich raw links with campaign + QR data ────────────────────────────────
  const enrich = useCallback((raw: GovernanceLink[]): GovernanceLink[] => {
    const campaignMap = new Map(
      campaignsRef.current.map((c) => [
        c.id,
        { name: c.name, color: c.accentColor },
      ]),
    );
    return raw.map((link) => {
      const qrImageUrl = qrMapRef.current.get(link.lookup_code) ?? null;
      const meta =
        link.linkCampaignId != null
          ? campaignMap.get(link.linkCampaignId)
          : undefined;
      return {
        ...link,
        qrImageUrl,
        campaign: meta?.name ?? link.campaign,
        linkCampaignColor: meta?.color ?? link.linkCampaignColor ?? null,
      };
    });
  }, []);

  // ── Main data load — reruns on page / filter / debounced search ─────────────
  const loadLinks = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const result = await fetchGovernanceLinks(token, {
        page,
        search: debouncedSearch || undefined,
        state: filterState !== "all" ? filterState : undefined,
      });
      setLinks(enrich(result.links));
      setPagination(result.pagination);
      setStats(result.stats);
    } catch (err) {
      onToast(`Failed to load links: ${(err as Error).message}`, "error");
    } finally {
      setLoading(false);
    }
  }, [token, page, debouncedSearch, filterState, enrich, onToast]);

  useEffect(() => {
    loadLinks();
  }, [loadLinks]);

  // ── Deep-link: /governance?lookup=<code> ────────────────────────────────────
  // Runs once on mount. URL is preserved (not cleared) so refresh reopens the drawer.
  useEffect(() => {
    if (!token) return;
    const query = new URLSearchParams(location.search);
    const lookup = query.get("lookup") ?? query.get("lookup_code");
    if (!lookup) return;

    const open = (link: GovernanceLink) => {
      setSelected(link);
      setLastOpenedLink(link);
      lastOpenedIdRef.current = link.id;
    };

    // Try current page first, fall back to a direct fetch.
    const inPage = links.find((l) => l.lookup_code === lookup);
    if (inPage) {
      open(inPage);
      return;
    }

    fetchGovernanceLinkByCode(token, lookup).then((link) => {
      if (link) open(enrich([link])[0]);
    });
    // Only on initial mount — replaceState updates don't change location.search.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.search, token]);

  // ── Optimistic link updates (state transitions, field edits) ────────────────
  const updateLink = useCallback(
    (id: string, patch: Partial<GovernanceLink>) => {
      setLinks((ls) => ls.map((l) => (l.id === id ? { ...l, ...patch } : l)));
      setSelected((sel) => (sel?.id === id ? { ...sel, ...patch } : sel));
    },
    [],
  );

  // After a delete, reload the page so count + pagination stay correct.
  const removeLink = useCallback(
    (id: string) => {
      setSelected((sel) => (sel?.id === id ? null : sel));
      setLastOpenedLink((prev) => (prev?.id === id ? null : prev));
      if (lastOpenedIdRef.current === id) lastOpenedIdRef.current = null;
      loadLinks();
    },
    [loadLinks],
  );

  // ── Create ──────────────────────────────────────────────────────────────────
  const handleCreateGovernedLink = useCallback(
    async (payload: CreateGovernedLinkPayload) => {
      if (!token) {
        onToast("Missing auth token.", "error");
        return;
      }
      setIsCreating(true);
      try {
        await createGovernedLink(token, payload);
        setIsCreateOpen(false);
        onToast("Governed link created successfully.", "success");
        // Reload page 1 so the new link (sorted desc) is immediately visible.
        setPage(1);
      } catch (err) {
        onToast(`Create failed: ${(err as Error).message}`, "error");
      } finally {
        setIsCreating(false);
      }
    },
    [token, onToast],
  );

  // ── Pause all ───────────────────────────────────────────────────────────────
  const handlePauseAll = useCallback(async () => {
    if (!token) {
      onToast("Missing auth token.", "error");
      return;
    }
    setIsPausingAll(true);
    try {
      const { pausedCount, pausedLookupCodes, message } =
        await pauseAllGovernedLinks(
          token,
          "Bulk pause from Governance dashboard",
        );
      if (pausedLookupCodes.length > 0) {
        const pausedSet = new Set(pausedLookupCodes);
        setLinks((current) =>
          current.map((link) =>
            pausedSet.has(link.lookup_code)
              ? { ...link, state: "paused" as const }
              : link,
          ),
        );
        setSelected((current) =>
          current && pausedSet.has(current.lookup_code)
            ? { ...current, state: "paused" }
            : current,
        );
      }
      onToast(message ?? `Paused ${pausedCount} governed links.`, "success");
    } catch (err) {
      onToast(`Pause all failed: ${(err as Error).message}`, "error");
    } finally {
      setIsPausingAll(false);
    }
  }, [token, onToast]);

  return (
    <MainLayout>
      <div className="lg:-mt-6 pb-24 lg:pb-10">
        {/* Sticky header: title row + buttons + stats grid.
            Sits flush against the viewport top while the links list scrolls below.
            On mobile it sits just below MainLayout's sticky Menu bar (~60px). */}
        <div className="sticky top-[60px] lg:top-0 z-30 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 pb-4 bg-white/90 dark:bg-neutral-950/90 backdrop-blur supports-[backdrop-filter]:bg-white/75 border-b border-neutral-200/70 dark:border-white/[0.06]">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <div className="min-w-0">
              <Heading className="text-3xl lg:text-2xl font-bold">
                Link Governance
              </Heading>
              <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
                Real-time lifecycle control
                <span className="hidden lg:inline">
                  {" "}
                  for all distributed links
                </span>
              </p>
            </div>
            <div className="hidden lg:flex gap-2 ml-auto shrink-0">
              <button
                onClick={handlePauseAll}
                disabled={isPausingAll}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg border border-neutral-300 dark:border-neutral-600 text-neutral-700 dark:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors disabled:opacity-60 whitespace-nowrap"
              >
                {isPausingAll ? "Pausing..." : "⏸ Pause All"}
              </button>
              <button
                onClick={() => setIsCreateOpen(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg bg-violet-600 hover:bg-violet-500 text-white transition-colors whitespace-nowrap shrink-0"
              >
                + New Governed Link
              </button>
            </div>
          </div>

          {/* ── Mobile-only minimalist header: search + filter chips + count ── */}
          {!loading && (
            <div className="lg:hidden flex flex-col gap-3">
              {/* Search input */}
              <div className="relative">
                <svg
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-neutral-400 pointer-events-none"
                >
                  <circle cx={11} cy={11} r={7} />
                  <path d="m20 20-3.5-3.5" />
                </svg>
                <input
                  type="search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search links…"
                  className="w-full pl-12 pr-4 py-3.5 text-[15px] rounded-2xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 focus:outline-none focus:border-violet-500"
                />
              </div>

              {/* Filter chips with counts — wrap on narrow screens so the
                  rightmost chip is never clipped at the container edge. */}
              <div className="flex flex-wrap items-center gap-2">
                {(
                  [
                    { key: "all", label: "All", count: stats.total },
                    { key: "active", label: "Active", count: stats.active },
                    { key: "paused", label: "Paused", count: stats.paused },
                    { key: "expired", label: "Expired", count: stats.expired },
                  ] as const
                ).map((chip) => {
                  const isOn = filterState === chip.key;
                  return (
                    <button
                      key={chip.key}
                      type="button"
                      onClick={() =>
                        setFilterStateWithUrl(chip.key as LinkState | "all")
                      }
                      className={`shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-sm font-medium transition-colors ${
                        isOn
                          ? "bg-violet-500/10 border-violet-400/60 text-violet-700 dark:text-violet-300"
                          : "bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300"
                      }`}
                    >
                      <span>{chip.label}</span>
                      <span
                        className={`inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-xs font-semibold ${
                          isOn
                            ? "bg-violet-500/20 text-violet-700 dark:text-violet-200"
                            : "bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300"
                        }`}
                      >
                        {chip.count}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Count + sort label */}
              <div className="flex items-center justify-between text-sm">
                <span className="font-mono text-neutral-500 dark:text-neutral-400">
                  {stats.total} {stats.total === 1 ? "link" : "links"}
                </span>
                <span className="inline-flex items-center gap-1 text-neutral-500 dark:text-neutral-400">
                  Newest first
                  <svg
                    aria-hidden="true"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="size-4"
                  >
                    <path d="m6 9 6 6 6-6" />
                  </svg>
                </span>
              </div>
            </div>
          )}

          {/* Desktop stats grid — hidden on mobile to keep the header minimal */}
          {!loading && (
            <div className="hidden lg:block">
              <GovernanceStatsGrid
                total={stats.total}
                active={stats.active}
                paused={stats.paused}
                expired={stats.expired}
                draft={stats.draft}
                totalClicks={stats.totalClicks}
              />
            </div>
          )}

          {/* Last-opened panel — desktop only */}
          {!loading && lastOpenedLink && (
            <div className="hidden lg:block mt-4">
              <GovernanceLastOpenedTable
                link={lastOpenedLink}
                flashingId={flashingId}
                onSelect={handleSelect}
                onDismiss={handleDismissLastOpened}
              />
            </div>
          )}
        </div>

        {loading && (
          <div className="flex items-center justify-center py-16 text-sm text-neutral-400">
            <span className="animate-pulse">Loading governed links…</span>
          </div>
        )}

        {!loading && (
          <div className="flex flex-col gap-6 pt-6">
            <GovernanceLinksTable
              links={links}
              campaigns={campaigns}
              search={search}
              filterState={filterState}
              lastOpenedId={lastOpenedLink?.id ?? null}
              flashingId={flashingId}
              onSearchChange={setSearch}
              onFilterChange={setFilterStateWithUrl}
              onSelect={handleSelect}
              onUpdate={updateLink}
              onRemove={removeLink}
              onToast={onToast}
            />

            <Pagination meta={pagination} onChange={setPage} />
          </div>
        )}
      </div>

      {/* Mobile-only fixed bottom action bar: mirrors the desktop top-right buttons,
          always visible while the links list scrolls behind it. */}
      <div className="lg:hidden fixed bottom-0 inset-x-0 z-40 px-4 py-3 pb-[calc(env(safe-area-inset-bottom)+0.75rem)] bg-white/90 dark:bg-neutral-950/90 backdrop-blur supports-[backdrop-filter]:bg-white/75 border-t border-neutral-200/70 dark:border-white/[0.06] flex gap-2">
        <button
          onClick={handlePauseAll}
          disabled={isPausingAll}
          className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 text-sm font-medium rounded-lg border border-neutral-300 dark:border-neutral-600 text-neutral-700 dark:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors disabled:opacity-60 whitespace-nowrap"
        >
          {isPausingAll ? "Pausing..." : "⏸ Pause All"}
        </button>
        <button
          onClick={() => setIsCreateOpen(true)}
          className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 text-sm font-medium rounded-lg bg-violet-600 hover:bg-violet-500 text-white transition-colors whitespace-nowrap"
        >
          + New Link
        </button>
      </div>

      {selected && (
        <GovernanceDrawer
          link={selected}
          onClose={handleClose}
          onUpdate={updateLink}
          onDelete={removeLink}
          onToast={onToast}
        />
      )}

      <NewGovernedLinkModal
        isOpen={isCreateOpen}
        isSubmitting={isCreating}
        onClose={() => setIsCreateOpen(false)}
        onSubmit={handleCreateGovernedLink}
      />
    </MainLayout>
  );
}
