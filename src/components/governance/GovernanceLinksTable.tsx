import {
    assignLinkToCampaign,
    deleteGovernedLink,
    transitionLink,
} from "@/apis/governance";
import type { Campaign } from "@/types/campaigns";
import { GOV_SORT_OPTIONS } from "@/types/governance";
import type { GovernanceLink, LinkState } from "@/types/governance";
import { extractDomain } from "@/utils/transformers";
import { useEffect, useRef, useState } from "react";
import { useCookies } from "react-cookie";
import {
    LuCheck,
    LuCopy,
    LuEllipsisVertical,
    LuMousePointerClick,
    LuPause,
    LuPencilLine,
    LuPlay,
    LuTrash2,
} from "react-icons/lu";
import { TbWorld } from "react-icons/tb";
import { GovernanceBadge } from "./GovernanceBadge";
import { GovernanceDeleteConfirmModal } from "./GovernanceDeleteConfirmModal";

const FILTER_STATES: (LinkState | "all")[] = [
  "all",
  "active",
  "paused",
  "expired",
  "draft",
];

// Explicit column widths are required here AND in GovernanceLastOpenedTable so
// that the two separate <table> elements align their columns pixel-perfectly.
export const GOVERNANCE_TABLE_COLUMNS: {
  key: string;
  label: string;
  className?: string;
}[] = [
  { key: "link", label: "Link", className: "w-[220px]" },
  {
    key: "status",
    label: "Status",
    className: "hidden md:table-cell w-[110px]",
  },
  {
    key: "destination",
    label: "Destination",
    className: "hidden md:table-cell w-[420px] xl:w-[520px]",
  },
  {
    key: "clicks",
    label: "Clicks",
    className: "hidden md:table-cell w-[100px]",
  },
  {
    key: "routing",
    label: "Routing",
    className: "hidden lg:table-cell w-[110px]",
  },
  {
    key: "campaign",
    label: "Campaign",
    className: "hidden lg:table-cell w-[150px]",
  },
  { key: "actions", label: "", className: "hidden md:table-cell w-0 p-0" },
];

interface GovernanceLinksTableProps {
  links: GovernanceLink[];
  campaigns: Campaign[];
  search: string;
  filterState: LinkState | "all";
  sort: string;
  lastOpenedId?: string | null;
  flashingId?: string | null;
  onSearchChange: (v: string) => void;
  onFilterChange: (v: LinkState | "all") => void;
  onSortChange: (v: string) => void;
  onSelect: (link: GovernanceLink) => void;
  onUpdate: (id: string, patch: Partial<GovernanceLink>) => void;
  onRemove: (id: string) => void;
  onToast: (
    msg: string,
    type?: "success" | "info" | "error" | "warning",
  ) => void;
}

const MAX_CLICKS = 35_000;
function barPct(clicks: number, cap: number | null) {
  return cap
    ? Math.min(100, (clicks / cap) * 100)
    : Math.min(100, (clicks / MAX_CLICKS) * 100);
}

// Strip protocol and split "host/slug" for the mobile short-link display.
function splitShort(short: string): { domain: string; slug: string } {
  const stripped = short.replace(/^https?:\/\//i, "");
  const idx = stripped.indexOf("/");
  if (idx === -1) return { domain: stripped, slug: "" };
  return {
    domain: stripped.slice(0, idx),
    slug: stripped.slice(idx + 1),
  };
}

// Pretty short numbers: 4324 → "4.3k", 1_200_000 → "1.2m".
function formatClicks(n: number): string {
  if (n >= 1_000_000)
    return (n / 1_000_000).toFixed(1).replace(/\.0$/, "") + "m";
  if (n >= 1_000) return (n / 1_000).toFixed(1).replace(/\.0$/, "") + "k";
  return n.toString();
}

// State → left-stripe color, used by the mobile card list.
const STATE_STRIPE: Record<string, string> = {
  active: "#2a7a5c",
  paused: "#b5613c",
  expired: "#b54a31",
  draft: "#9a9aa8",
  archived: "#9a9aa8",
};

export function GovernanceLinksTable({
  links,
  campaigns,
  search,
  filterState,
  sort,
  lastOpenedId,
  flashingId,
  onSearchChange,
  onFilterChange,
  onSortChange,
  onSelect,
  onUpdate,
  onRemove,
  onToast,
}: GovernanceLinksTableProps) {
  const [cookies] = useCookies(["token"]);
  const token = cookies.token as string;
  const [pendingDelete, setPendingDelete] = useState<GovernanceLink | null>(
    null,
  );
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkCampaignId, setBulkCampaignId] = useState("");
  const [isBulkAssigning, setIsBulkAssigning] = useState(false);
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [faviconErrors, setFaviconErrors] = useState<Set<string>>(new Set());
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

  // Close the per-card popover menu when the user taps anywhere else.
  useEffect(() => {
    if (!openMenuId) return;
    const onDocPointer = (e: PointerEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpenMenuId(null);
      }
    };
    document.addEventListener("pointerdown", onDocPointer);
    return () => document.removeEventListener("pointerdown", onDocPointer);
  }, [openMenuId]);

  const handleCopyShort = async (e: React.MouseEvent, link: GovernanceLink) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(link.short);
      setCopiedId(link.lookup_code);
      setTimeout(
        () =>
          setCopiedId((current) =>
            current === link.lookup_code ? null : current,
          ),
        1200,
      );
    } catch {
      onToast("Couldn't copy to clipboard", "error");
    }
  };

  // links is already the server-filtered page — use directly
  const filtered = links;

  useEffect(() => {
    setSelectedIds((prev) => {
      const linkIds = new Set(links.map((link) => link.id));
      const next = new Set<string>();
      prev.forEach((id) => {
        if (linkIds.has(id)) next.add(id);
      });
      return next;
    });
  }, [links]);

  const visibleIds = filtered.map((link) => link.id);
  const allVisibleSelected =
    visibleIds.length > 0 && visibleIds.every((id) => selectedIds.has(id));
  const selectedCount = selectedIds.size;

  const toggleSelectOne = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAllVisible = () => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (allVisibleSelected) {
        visibleIds.forEach((id) => next.delete(id));
      } else {
        visibleIds.forEach((id) => next.add(id));
      }
      return next;
    });
  };

  const handleQuickTransition = async (
    e: React.MouseEvent,
    link: GovernanceLink,
    newState: LinkState,
  ) => {
    e.stopPropagation();
    try {
      await transitionLink(token, link.lookup_code, newState);
      onUpdate(link.id, { state: newState });
      onToast(
        `"${link.name}" ${newState === "paused" ? "paused" : newState === "archived" ? "archived" : "resumed"}`,
        newState === "paused" ? "info" : "success",
      );
    } catch (err) {
      onToast((err as Error).message, "error");
    }
  };

  const handleDeleteLink = async (
    e: React.MouseEvent,
    link: GovernanceLink,
  ) => {
    e.stopPropagation();

    setPendingDelete(link);
  };

  const confirmDelete = async () => {
    if (!pendingDelete) return;

    setIsDeleting(true);
    try {
      await deleteGovernedLink(token, pendingDelete.lookup_code);
      onRemove(pendingDelete.id);
      onToast(`"${pendingDelete.name}" deleted`, "success");
      setPendingDelete(null);
    } catch (err) {
      onToast((err as Error).message, "error");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleBulkAssignCampaign = async () => {
    if (!bulkCampaignId) {
      onToast("Select a campaign first.", "warning");
      return;
    }
    if (selectedCount === 0) {
      onToast("Select at least one link.", "warning");
      return;
    }

    const campaignId =
      bulkCampaignId === "none" ? null : Number(bulkCampaignId);
    const campaignMeta =
      campaignId == null
        ? null
        : (campaigns.find((campaign) => campaign.id === campaignId) ?? null);
    const targets = links.filter((link) => selectedIds.has(link.id));

    setIsBulkAssigning(true);
    try {
      const results = await Promise.allSettled(
        targets.map((link) =>
          assignLinkToCampaign(token, link.lookup_code, campaignId),
        ),
      );

      const succeeded = targets.filter(
        (_link, index) => results[index]?.status === "fulfilled",
      );
      const failedCount = targets.length - succeeded.length;

      succeeded.forEach((link) => {
        onUpdate(link.id, {
          linkCampaignId: campaignId,
          campaign: campaignMeta?.name ?? null,
          linkCampaignColor: campaignMeta?.accentColor ?? null,
        });
      });

      if (succeeded.length > 0) {
        onToast(
          campaignId == null
            ? `Removed campaign assignment for ${succeeded.length} link${succeeded.length === 1 ? "" : "s"}.`
            : `Assigned ${succeeded.length} link${succeeded.length === 1 ? "" : "s"} to ${campaignMeta?.name ?? "campaign"}.`,
          failedCount > 0 ? "warning" : "success",
        );
      }
      if (failedCount > 0) {
        onToast(
          `Failed to update ${failedCount} link${failedCount === 1 ? "" : "s"}.`,
          "error",
        );
      }
      setBulkCampaignId("");
    } catch (err) {
      onToast(
        `Bulk campaign update failed: ${(err as Error).message}`,
        "error",
      );
    } finally {
      setIsBulkAssigning(false);
    }
  };

  const confirmBulkDelete = async () => {
    const targets = links.filter((link) => selectedIds.has(link.id));
    if (targets.length === 0) {
      setBulkDeleteOpen(false);
      return;
    }

    setIsBulkDeleting(true);
    try {
      const results = await Promise.allSettled(
        targets.map((link) => deleteGovernedLink(token, link.lookup_code)),
      );
      const succeeded = targets.filter(
        (_link, index) => results[index]?.status === "fulfilled",
      );
      const failedCount = targets.length - succeeded.length;

      succeeded.forEach((link) => onRemove(link.id));
      if (succeeded.length > 0) {
        onToast(
          `Deleted ${succeeded.length} link${succeeded.length === 1 ? "" : "s"}.`,
          failedCount > 0 ? "warning" : "success",
        );
      }
      if (failedCount > 0) {
        onToast(
          `Failed to delete ${failedCount} link${failedCount === 1 ? "" : "s"}.`,
          "error",
        );
      }
      setSelectedIds((prev) => {
        const next = new Set(prev);
        succeeded.forEach((link) => next.delete(link.id));
        return next;
      });
      setBulkDeleteOpen(false);
    } catch (err) {
      onToast(`Bulk delete failed: ${(err as Error).message}`, "error");
    } finally {
      setIsBulkDeleting(false);
    }
  };

  return (
    <div className="rounded-xl border border-neutral-200 dark:border-white/[0.06] overflow-hidden bg-white dark:bg-neutral-900">
      {/* Table toolbar — desktop only; on mobile the GovernancePage hosts a
          minimalistic search + filter-chip header instead. */}
      <div className="hidden lg:flex px-4 sm:px-5 py-3 sm:py-4 border-b border-neutral-200 dark:border-white/[0.06] flex-col gap-3">
        {/* Row 1: title + search */}
        <div className="flex items-center gap-3">
          <h2 className="font-semibold text-[15px] text-neutral-900 dark:text-white shrink-0">
            Governed Links
          </h2>
          <div className="relative ml-auto w-full max-w-[200px] sm:max-w-[220px]">
            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-neutral-400 text-xs pointer-events-none">
              ⌕
            </span>
            <input
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search links…"
              className="pl-7 pr-3 py-1.5 text-xs rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-100 placeholder-neutral-400 focus:outline-none focus:border-violet-500 transition-colors w-full"
            />
          </div>
          <select
            aria-label="Sort links"
            value={sort}
            onChange={(e) => onSortChange(e.target.value)}
            className="shrink-0 py-1.5 px-2.5 text-xs rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-200 focus:outline-none focus:border-violet-500 transition-colors cursor-pointer"
          >
            {GOV_SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>

        {/* Row 2: state filters — horizontally scrollable on small screens */}
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-hidden pb-0.5">
          {FILTER_STATES.map((s) => (
            <button
              key={s}
              onClick={() => onFilterChange(s)}
              className={`text-xs px-3 py-1.5 rounded-full border transition-colors shrink-0 ${
                filterState === s
                  ? "bg-violet-500/15 border-violet-500/30 text-violet-400"
                  : "border-neutral-200 dark:border-neutral-700 text-neutral-500 dark:text-neutral-400 hover:border-neutral-300 dark:hover:border-neutral-500"
              }`}
            >
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>

        {/* Row 3: bulk actions — only when links are selected */}
        {selectedCount > 0 && (
          <div className="flex flex-wrap items-center gap-2 rounded-lg border border-violet-300/60 dark:border-violet-500/35 bg-violet-50 dark:bg-violet-500/10 px-2.5 py-1.5">
            <span className="text-xs font-medium text-violet-700 dark:text-violet-300 shrink-0">
              {selectedCount} selected
            </span>
            <select
              value={bulkCampaignId}
              onChange={(e) => setBulkCampaignId(e.target.value)}
              className="flex-1 min-w-0 px-2 py-1 text-xs rounded-md border border-violet-200 dark:border-violet-500/35 bg-white dark:bg-neutral-900 text-neutral-700 dark:text-neutral-200"
            >
              <option value="">Assign campaign…</option>
              <option value="none">Unassign campaign</option>
              {campaigns.map((campaign) => (
                <option key={campaign.id} value={campaign.id.toString()}>
                  {campaign.name}
                </option>
              ))}
            </select>
            <button
              onClick={handleBulkAssignCampaign}
              disabled={isBulkAssigning || !bulkCampaignId}
              className="shrink-0 px-2.5 py-1 text-xs rounded-md border border-violet-300 dark:border-violet-500/45 text-violet-700 dark:text-violet-200 hover:bg-violet-100 dark:hover:bg-violet-500/20 disabled:opacity-60"
            >
              {isBulkAssigning ? "Applying..." : "Apply"}
            </button>
            <button
              onClick={() => setBulkDeleteOpen(true)}
              disabled={isBulkDeleting}
              className="shrink-0 px-2.5 py-1 text-xs rounded-md border border-red-300 dark:border-red-500/45 text-red-700 dark:text-red-300 hover:bg-red-50 dark:hover:bg-red-500/20 disabled:opacity-60"
            >
              Delete selected
            </button>
          </div>
        )}
      </div>

      {/* Mobile / tablet card list (< lg) — purpose-built for narrow screens */}
      <ul className="lg:hidden flex flex-col gap-2.5 px-3 sm:px-4 py-3 bg-neutral-50/60 dark:bg-neutral-900/40">
        {filtered.map((link) => {
          const isSelected = selectedIds.has(link.id);
          const isMenuOpen = openMenuId === link.id;
          const isCopied = copiedId === link.lookup_code;
          const { domain, slug } = splitShort(link.short);
          const destDisplay = link.dest.replace(/^https?:\/\//i, "");
          const stripe = STATE_STRIPE[link.state] ?? STATE_STRIPE.draft;
          return (
            <li
              key={link.id}
              data-link-id={link.id}
              onClick={() => onSelect(link)}
              className={[
                "relative cursor-pointer rounded-2xl border bg-white dark:bg-neutral-900 overflow-hidden",
                "pl-4 pr-3 py-3.5",
                "shadow-[0_1px_0_rgba(0,0,0,0.02),0_2px_8px_rgba(0,0,0,0.03)]",
                "transition-colors active:bg-neutral-50 dark:active:bg-neutral-800",
                isSelected
                  ? "border-violet-400/60 ring-1 ring-violet-400/30"
                  : "border-neutral-200/80 dark:border-white/[0.06]",
                link.id === lastOpenedId
                  ? "ring-1 ring-violet-500/50 border-violet-400/60"
                  : "",
                link.id === flashingId ? "gov-link-row--flash" : "",
              ]
                .filter(Boolean)
                .join(" ")}
            >
              {/* Left state stripe — full-height, matches campaign-card accent */}
              <span
                aria-hidden
                className="absolute left-0 top-0 bottom-0 w-[4px]"
                style={{ background: stripe }}
              />

              {/* ── Section 1: Favicon + short link + copy + menu ── */}
              <div className="flex items-center gap-2.5 min-w-0">
                {/* Favicon */}
                <div className="shrink-0">
                  {faviconErrors.has(link.lookup_code) ? (
                    <div className="flex h-9 w-9 items-center justify-center rounded-full border border-neutral-200 dark:border-neutral-700 bg-neutral-100 dark:bg-neutral-800">
                      <TbWorld className="h-4 w-4 text-neutral-500 dark:text-neutral-400" />
                    </div>
                  ) : (
                    <img
                      alt={extractDomain(link.dest)}
                      draggable={false}
                      loading="lazy"
                      width="36"
                      height="36"
                      className="h-9 w-9 rounded-full border border-neutral-200 dark:border-neutral-700 bg-white object-cover"
                      src={`https://www.google.com/s2/favicons?sz=64&domain_url=${extractDomain(link.dest)}`}
                      onError={() =>
                        setFaviconErrors((prev) =>
                          new Set(prev).add(link.lookup_code),
                        )
                      }
                    />
                  )}
                </div>

                {/* Short URL */}
                <div className="min-w-0 flex-1 flex items-center gap-1.5">
                  <span
                    className="min-w-0 flex-1 truncate text-[13.5px] leading-tight"
                    title={link.short}
                  >
                    <span className="text-neutral-500 dark:text-neutral-400 font-medium">
                      {domain}
                    </span>
                    <span className="text-neutral-400 dark:text-neutral-600">
                      /
                    </span>
                    <span className="font-bold text-neutral-900 dark:text-neutral-100">
                      {slug}
                    </span>
                  </span>
                  <button
                    type="button"
                    aria-label={isCopied ? "Copied" : "Copy short link"}
                    onClick={(e) => handleCopyShort(e, link)}
                    className={`shrink-0 inline-flex h-7 w-7 items-center justify-center rounded-md transition-colors ${
                      isCopied
                        ? "text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30"
                        : "text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                    }`}
                  >
                    {isCopied ? (
                      <LuCheck size={14} strokeWidth={2.5} />
                    ) : (
                      <LuCopy size={13} strokeWidth={2} />
                    )}
                  </button>
                </div>

                {/* 3-dot menu */}
                <div className="relative shrink-0">
                  <button
                    type="button"
                    aria-label="More actions"
                    aria-haspopup="menu"
                    aria-expanded={isMenuOpen}
                    onClick={(e) => {
                      e.stopPropagation();
                      setOpenMenuId((current) =>
                        current === link.id ? null : link.id,
                      );
                    }}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:text-neutral-900 dark:hover:text-neutral-100"
                  >
                    <LuEllipsisVertical size={17} strokeWidth={2} />
                  </button>
                  {isMenuOpen && (
                    <div
                      ref={menuRef}
                      role="menu"
                      onClick={(e) => e.stopPropagation()}
                      className="absolute right-0 top-9 z-30 w-44 overflow-hidden rounded-xl border border-neutral-200 dark:border-white/[0.08] bg-white dark:bg-neutral-900 shadow-[0_10px_30px_rgba(0,0,0,0.12),0_2px_8px_rgba(0,0,0,0.06)]"
                    >
                      <button
                        role="menuitem"
                        className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-[13px] text-neutral-700 dark:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-neutral-800"
                        onClick={() => {
                          setOpenMenuId(null);
                          onSelect(link);
                        }}
                      >
                        <LuPencilLine size={14} />
                        Manage
                      </button>
                      <button
                        role="menuitem"
                        className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-[13px] text-neutral-700 dark:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-neutral-800"
                        onClick={(e) => {
                          setOpenMenuId(null);
                          handleQuickTransition(
                            e,
                            link,
                            link.state === "paused" ? "active" : "paused",
                          );
                        }}
                      >
                        {link.state === "paused" ? (
                          <>
                            <LuPlay size={14} /> Resume
                          </>
                        ) : (
                          <>
                            <LuPause size={14} /> Pause
                          </>
                        )}
                      </button>
                      <button
                        role="menuitem"
                        className="flex w-full items-center gap-2 border-t border-neutral-100 dark:border-white/[0.06] px-3 py-2.5 text-left text-[13px] text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                        onClick={(e) => {
                          setOpenMenuId(null);
                          handleDeleteLink(e, link);
                        }}
                      >
                        <LuTrash2 size={14} /> Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* ── Section 2: Destination URL block (display only — open in drawer) ── */}
              <div
                title={link.dest}
                className="mt-2.5 flex items-start gap-2 rounded-lg bg-neutral-100/80 dark:bg-neutral-800/60 px-3 py-2 text-[12.5px] leading-snug text-neutral-700 dark:text-neutral-300"
              >
                <span
                  aria-hidden
                  className="shrink-0 text-neutral-400 font-medium"
                >
                  ↳
                </span>
                <span className="min-w-0 flex-1 line-clamp-2 break-all">
                  {destDisplay}
                </span>
              </div>

              {/* ── Section 3: State + campaign + clicks ── */}
              <div className="mt-2.5 flex items-center gap-1.5 min-w-0">
                <GovernanceBadge state={link.state} />
                {link.campaign && (
                  <span
                    className="min-w-0 truncate max-w-[40%] rounded-md border border-neutral-200 dark:border-white/[0.08] bg-neutral-50 dark:bg-neutral-800/60 px-2 py-[3px] font-mono text-[10.5px] text-neutral-600 dark:text-neutral-300"
                    title={link.campaign}
                  >
                    {link.campaign}
                  </span>
                )}
                {link.rulesCount > 0 && (
                  <span className="shrink-0 rounded-md border border-violet-200 dark:border-violet-500/30 bg-violet-50 dark:bg-violet-500/10 px-2 py-[3px] font-mono text-[10.5px] text-violet-600 dark:text-violet-300">
                    {link.rulesCount} rule{link.rulesCount > 1 ? "s" : ""}
                  </span>
                )}
                <span className="ml-auto inline-flex shrink-0 items-center gap-1.5 rounded-full border border-neutral-200 dark:border-white/[0.08] bg-neutral-50 dark:bg-neutral-800/60 px-2.5 py-[3px] text-[11px] text-neutral-600 dark:text-neutral-300">
                  <LuMousePointerClick
                    size={11}
                    strokeWidth={2}
                    className="text-[#4a7fb8]"
                  />
                  <strong className="font-mono font-bold text-neutral-900 dark:text-neutral-100">
                    {formatClicks(link.clicks)}
                  </strong>
                  {link.clicks === 1 ? "click" : "clicks"}
                </span>
              </div>

              {/* Mini cap-progress bar (kept subtle, only when there's data) */}
              {link.clicks > 0 && (
                <div className="mt-2.5 h-0.5 overflow-hidden rounded-full bg-neutral-200/70 dark:bg-neutral-800">
                  <div
                    className="gov-clicks-bar-fill h-full"
                    style={{ width: `${barPct(link.clicks, link.cap)}%` }}
                  />
                </div>
              )}
            </li>
          );
        })}

        {filtered.length === 0 && (
          <li className="px-5 py-12 text-center text-neutral-400">
            <div className="text-3xl mb-2 opacity-30">⊘</div>
            <p className="text-sm">No links match your filter</p>
          </li>
        )}
      </ul>

      {/* Table (lg and up) */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="w-full table-fixed min-w-0 md:min-w-[860px] lg:min-w-[1160px] xl:min-w-[1360px]">
          <thead>
            <tr className="border-b border-neutral-100 dark:border-white/[0.04]">
              <th className="px-5 py-3 text-left w-[56px]">
                <input
                  type="checkbox"
                  checked={allVisibleSelected}
                  onChange={toggleSelectAllVisible}
                  aria-label="Select all visible links"
                  className="h-4 w-4 rounded border-neutral-300 dark:border-neutral-600"
                />
              </th>
              {GOVERNANCE_TABLE_COLUMNS.map((column) => (
                <th
                  key={column.key}
                  className={`px-5 py-3 text-left text-[11px] font-medium uppercase tracking-[0.06em] text-neutral-400 font-mono ${column.className ?? ""}`}
                >
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((link) => (
              <tr
                key={link.id}
                data-link-id={link.id}
                onClick={() => onSelect(link)}
                className={[
                  "gov-link-row border-b border-neutral-50 dark:border-white/[0.025] last:border-0 cursor-pointer group",
                  selectedIds.has(link.id) ? "bg-violet-500/[0.08]" : "",
                  link.linkCampaignColor ? "gov-link-row--accented" : "",
                  link.id === lastOpenedId ? "gov-link-row--last-opened" : "",
                  link.id === flashingId ? "gov-link-row--flash" : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
                style={{
                  ["--gov-row-accent" as string]:
                    link.linkCampaignColor ?? "transparent",
                }}
              >
                <td
                  className="px-5 py-3.5"
                  onClick={(e) => e.stopPropagation()}
                >
                  <input
                    type="checkbox"
                    checked={selectedIds.has(link.id)}
                    onChange={() => toggleSelectOne(link.id)}
                    aria-label={`Select ${link.name}`}
                    className="h-4 w-4 rounded border-neutral-300 dark:border-neutral-600"
                  />
                </td>
                {/* Name + short */}
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-2">
                    <div className="shrink-0">
                      {faviconErrors.has(link.lookup_code) ? (
                        <div className="rounded-full size-5 border border-neutral-200 dark:border-neutral-600 bg-neutral-100 dark:bg-neutral-700 flex items-center justify-center">
                          <TbWorld className="w-3 h-3 text-neutral-500 dark:text-neutral-400" />
                        </div>
                      ) : (
                        <img
                          alt={extractDomain(link.dest)}
                          draggable={false}
                          loading="lazy"
                          width="20"
                          height="20"
                          className="rounded-full size-5 border border-neutral-200 dark:border-neutral-600"
                          src={`https://www.google.com/s2/favicons?sz=64&domain_url=${extractDomain(link.dest)}`}
                          onError={() =>
                            setFaviconErrors((prev) =>
                              new Set(prev).add(link.lookup_code),
                            )
                          }
                        />
                      )}
                    </div>
                    <div className="font-medium text-[13.5px] text-neutral-900 dark:text-neutral-100 truncate">
                      {link.name}
                    </div>
                  </div>
                  <div className="mt-0.5">
                    <span className="font-mono text-[11.5px] px-1.5 py-0.5 rounded bg-violet-500/10 border border-violet-500/20 text-violet-400">
                      {link.short}
                    </span>
                  </div>

                  {/* Mobile details */}
                  <div className="mt-2.5 md:hidden flex flex-col gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <GovernanceBadge state={link.state} />
                      <span className="text-[11px] font-mono text-neutral-500 dark:text-neutral-400">
                        {link.clicks.toLocaleString()} clicks
                      </span>
                    </div>
                    <span
                      className="block text-[12.5px] font-mono text-neutral-500 dark:text-neutral-400 break-all leading-relaxed"
                      title={link.dest}
                    >
                      {link.dest}
                    </span>
                    {link.campaign ? (
                      <span className="text-xs px-2 py-0.5 rounded font-medium border border-neutral-200 dark:border-white/[0.08] bg-white/80 dark:bg-neutral-900/60 text-neutral-700 dark:text-neutral-200 self-start">
                        {link.campaign}
                      </span>
                    ) : null}

                    {/* Mobile quick actions */}
                    <div
                      className="flex items-center gap-2 pt-1"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        className="flex-1 text-[11.5px] font-medium py-1.5 px-3 rounded-lg border border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
                        onClick={() => onSelect(link)}
                      >
                        ✎ Manage
                      </button>
                      <button
                        className={`flex-1 text-[11.5px] font-medium py-1.5 px-3 rounded-lg border transition-colors ${
                          link.state === "paused"
                            ? "border-green-200 dark:border-green-700/50 text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20"
                            : "border-amber-200 dark:border-amber-700/50 text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20"
                        }`}
                        onClick={(e) =>
                          handleQuickTransition(
                            e,
                            link,
                            link.state === "paused" ? "active" : "paused",
                          )
                        }
                      >
                        {link.state === "paused" ? "▶ Resume" : "⏸ Pause"}
                      </button>
                      <button
                        title="Delete link"
                        className="w-8 h-8 shrink-0 rounded-lg border border-neutral-200 dark:border-neutral-700 text-neutral-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-500 hover:border-red-200 dark:hover:border-red-700/50 transition-colors flex items-center justify-center text-sm"
                        onClick={(e) => handleDeleteLink(e, link)}
                      >
                        🗑
                      </button>
                    </div>
                  </div>
                </td>

                {/* Badge */}
                <td className="px-5 py-3.5 hidden md:table-cell">
                  <GovernanceBadge state={link.state} />
                </td>

                {/* Destination (display only — opens in drawer on row click) */}
                <td className="px-5 py-3.5 hidden md:table-cell w-[420px] xl:w-[520px]">
                  <span
                    className="text-xs text-neutral-500 dark:text-neutral-300 truncate block"
                    title={link.dest}
                  >
                    {link.dest}
                  </span>
                </td>

                {/* Clicks bar */}
                <td className="px-5 py-3.5 hidden md:table-cell">
                  <div className="w-24">
                    <div className="text-[12.5px] font-mono font-medium text-neutral-700 dark:text-neutral-300">
                      {link.clicks.toLocaleString()}
                    </div>
                    <div className="mt-1.5 h-0.5 rounded-full bg-neutral-200 dark:bg-neutral-700 overflow-hidden">
                      <div
                        className="gov-clicks-bar-fill h-full"
                        style={{ width: `${barPct(link.clicks, link.cap)}%` }}
                      />
                    </div>
                  </div>
                </td>

                {/* Routing rules count */}
                <td className="px-5 py-3.5 hidden lg:table-cell">
                  {link.rulesCount > 0 ? (
                    <span className="text-xs font-mono text-violet-400">
                      {link.rulesCount} rule{link.rulesCount > 1 ? "s" : ""}
                    </span>
                  ) : (
                    <span className="text-xs text-neutral-400">—</span>
                  )}
                </td>

                {/* Campaign tag */}
                <td className="px-5 py-3.5 hidden lg:table-cell">
                  {link.campaign ? (
                    <span className="text-xs px-2 py-0.5 rounded font-medium border border-neutral-200 dark:border-white/[0.08] bg-white/80 dark:bg-neutral-900/60 text-neutral-700 dark:text-neutral-200">
                      {link.campaign}
                    </span>
                  ) : (
                    <span className="text-xs text-neutral-400">—</span>
                  )}
                </td>

                {/* Row actions — zero-width sticky cell; buttons float over the row on hover */}
                <td className="w-0 p-0 hidden md:table-cell sticky right-0 relative">
                  <div
                    className="absolute right-0 top-1/2 -translate-y-1/2 flex items-center gap-1.5 pr-3 pl-10 py-3 opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-l from-white dark:from-neutral-900 via-white/90 dark:via-neutral-900/90 to-transparent pointer-events-none group-hover:pointer-events-auto"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <IconButton title="Edit" onClick={() => onSelect(link)}>
                      ✎
                    </IconButton>
                    <IconButton
                      title={link.state === "paused" ? "Resume" : "Pause"}
                      variant="pause"
                      onClick={(e) =>
                        handleQuickTransition(
                          e,
                          link,
                          link.state === "paused" ? "active" : "paused",
                        )
                      }
                    >
                      {link.state === "paused" ? "▶" : "⏸"}
                    </IconButton>
                    <IconButton
                      title="Archive"
                      variant="danger"
                      onClick={(e) =>
                        handleQuickTransition(e, link, "archived")
                      }
                    >
                      ⬡
                    </IconButton>
                    <IconButton
                      title="Delete"
                      variant="danger"
                      onClick={(e) => handleDeleteLink(e, link)}
                    >
                      🗑
                    </IconButton>
                  </div>
                </td>
              </tr>
            ))}

            {filtered.length === 0 && (
              <tr>
                <td
                  colSpan={8}
                  className="px-5 py-12 text-center text-neutral-400"
                >
                  <div className="text-3xl mb-2 opacity-30">⊘</div>
                  <p className="text-sm">No links match your filter</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <GovernanceDeleteConfirmModal
        isOpen={!!pendingDelete}
        title="Delete Link"
        description={
          pendingDelete
            ? `Delete "${pendingDelete.name}"? This action cannot be undone.`
            : undefined
        }
        confirmLabel="Delete Link"
        isSubmitting={isDeleting}
        onCancel={() => setPendingDelete(null)}
        onConfirm={confirmDelete}
      />

      <GovernanceDeleteConfirmModal
        isOpen={bulkDeleteOpen}
        title="Delete Selected Links"
        description={`Delete ${selectedCount} selected link${selectedCount === 1 ? "" : "s"}? This action cannot be undone.`}
        confirmLabel={`Delete ${selectedCount} link${selectedCount === 1 ? "" : "s"}`}
        isSubmitting={isBulkDeleting}
        onCancel={() => setBulkDeleteOpen(false)}
        onConfirm={confirmBulkDelete}
      />
    </div>
  );
}

// ── Local helpers ──────────────────────────────────────────────────────────────

function IconButton({
  children,
  title,
  variant,
  onClick,
}: {
  children: React.ReactNode;
  title?: string;
  variant?: "pause" | "danger";
  onClick?: (e: React.MouseEvent) => void;
}) {
  const base =
    "w-7 h-7 rounded-md border text-xs flex items-center justify-center transition-colors";
  const color =
    variant === "danger"
      ? "border-neutral-200 dark:border-neutral-700 text-neutral-400 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/25"
      : variant === "pause"
        ? "border-neutral-200 dark:border-neutral-700 text-neutral-400 hover:bg-amber-500/10 hover:text-amber-400 hover:border-amber-500/25"
        : "border-neutral-200 dark:border-neutral-700 text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-700 hover:text-neutral-600 dark:hover:text-white";

  return (
    <button className={`${base} ${color}`} title={title} onClick={onClick}>
      {children}
    </button>
  );
}
