import {
    assignLinkToCampaign,
    deleteGovernedLink,
    transitionLink,
} from "@/apis/governance";
import type { Campaign } from "@/types/campaigns";
import type { GovernanceLink, LinkState } from "@/types/governance";
import { useEffect, useState } from "react";
import { useCookies } from "react-cookie";
import { GovernanceBadge } from "./GovernanceBadge";
import { GovernanceDeleteConfirmModal } from "./GovernanceDeleteConfirmModal";

const FILTER_STATES: (LinkState | "all")[] = [
  "all",
  "active",
  "paused",
  "expired",
  "draft",
];

interface GovernanceLinksTableProps {
  links: GovernanceLink[];
  campaigns: Campaign[];
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

export function GovernanceLinksTable({
  links,
  campaigns,
  onSelect,
  onUpdate,
  onRemove,
  onToast,
}: GovernanceLinksTableProps) {
  const [cookies] = useCookies(["token"]);
  const token = cookies.token as string;
  const [search, setSearch] = useState("");
  const [filterState, setFilterState] = useState<LinkState | "all">("all");
  const [pendingDelete, setPendingDelete] = useState<GovernanceLink | null>(
    null,
  );
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkCampaignId, setBulkCampaignId] = useState("");
  const [isBulkAssigning, setIsBulkAssigning] = useState(false);
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const filtered = links.filter((l) => {
    if (filterState !== "all" && l.state !== filterState) return false;
    if (search) {
      const q = search.toLowerCase();
      if (
        !l.name.toLowerCase().includes(q) &&
        !l.short.toLowerCase().includes(q)
      )
        return false;
    }
    return true;
  });

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
      {/* Table toolbar */}
      <div className="px-5 py-4 border-b border-neutral-200 dark:border-white/[0.06] flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-semibold text-[15px] text-neutral-900 dark:text-white">
          Governed Links
        </h2>
        {selectedCount > 0 && (
          <div className="flex flex-wrap items-center gap-2 rounded-lg border border-violet-300/60 dark:border-violet-500/35 bg-violet-50 dark:bg-violet-500/10 px-2.5 py-1.5">
            <span className="text-xs font-medium text-violet-700 dark:text-violet-300">
              {selectedCount} selected
            </span>
            <select
              value={bulkCampaignId}
              onChange={(e) => setBulkCampaignId(e.target.value)}
              className="px-2 py-1 text-xs rounded-md border border-violet-200 dark:border-violet-500/35 bg-white dark:bg-neutral-900 text-neutral-700 dark:text-neutral-200"
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
              className="px-2.5 py-1 text-xs rounded-md border border-violet-300 dark:border-violet-500/45 text-violet-700 dark:text-violet-200 hover:bg-violet-100 dark:hover:bg-violet-500/20 disabled:opacity-60"
            >
              {isBulkAssigning ? "Applying..." : "Apply"}
            </button>
            <button
              onClick={() => setBulkDeleteOpen(true)}
              disabled={isBulkDeleting}
              className="px-2.5 py-1 text-xs rounded-md border border-red-300 dark:border-red-500/45 text-red-700 dark:text-red-300 hover:bg-red-50 dark:hover:bg-red-500/20 disabled:opacity-60"
            >
              Delete selected
            </button>
          </div>
        )}
        <div className="flex flex-wrap items-center gap-2 ml-auto">
          {/* Search */}
          <div className="relative">
            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-neutral-400 text-xs pointer-events-none">
              ⌕
            </span>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search links…"
              className="pl-7 pr-3 py-1.5 text-xs rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-100 placeholder-neutral-400 focus:outline-none focus:border-violet-500 transition-colors w-48"
            />
          </div>
          {/* State filters */}
          {FILTER_STATES.map((s) => (
            <button
              key={s}
              onClick={() => setFilterState(s)}
              className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                filterState === s
                  ? "bg-violet-500/15 border-violet-500/30 text-violet-400"
                  : "border-neutral-200 dark:border-neutral-700 text-neutral-500 dark:text-neutral-400 hover:border-neutral-300 dark:hover:border-neutral-500"
              }`}
            >
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1360px]">
          <thead>
            <tr className="border-b border-neutral-100 dark:border-white/[0.04]">
              <th className="px-5 py-3 text-left">
                <input
                  type="checkbox"
                  checked={allVisibleSelected}
                  onChange={toggleSelectAllVisible}
                  aria-label="Select all visible links"
                  className="h-4 w-4 rounded border-neutral-300 dark:border-neutral-600"
                />
              </th>
              {[
                "Link",
                "Status",
                "Destination",
                "Clicks",
                "Routing",
                "Campaign",
                "",
              ].map((h) => (
                <th
                  key={h}
                  className={`px-5 py-3 text-left text-[11px] font-medium uppercase tracking-[0.06em] text-neutral-400 font-mono ${
                    h === "Destination" ? "w-[520px] min-w-[520px]" : ""
                  }`}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((link) => (
              <tr
                key={link.id}
                onClick={() => onSelect(link)}
                className={`gov-link-row border-b border-neutral-50 dark:border-white/[0.025] last:border-0 cursor-pointer group ${selectedIds.has(link.id) ? "bg-violet-500/[0.08]" : ""}`}
                style={{
                  background: link.linkCampaignColor
                    ? `${link.linkCampaignColor}12`
                    : undefined,
                  ["--gov-row-accent" as string]:
                    link.linkCampaignColor ?? "#c0c0c0",
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
                  <div className="font-medium text-[13.5px] text-neutral-900 dark:text-neutral-100">
                    {link.name}
                  </div>
                  <div className="mt-0.5">
                    <span className="font-mono text-[11.5px] px-1.5 py-0.5 rounded bg-violet-500/10 border border-violet-500/20 text-violet-400">
                      {link.short}
                    </span>
                  </div>
                </td>

                {/* Badge */}
                <td className="px-5 py-3.5">
                  <GovernanceBadge state={link.state} />
                </td>

                {/* Destination */}
                <td
                  className="px-5 py-3.5 w-[520px] min-w-[520px] max-w-[520px]"
                  onClick={(e) => e.stopPropagation()}
                >
                  <a
                    href={link.dest}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-neutral-500 dark:text-neutral-300 truncate block hover:text-violet-500 dark:hover:text-violet-400 hover:underline"
                    title={link.dest}
                  >
                    {link.dest}
                  </a>
                </td>

                {/* Clicks bar */}
                <td className="px-5 py-3.5">
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
                <td className="px-5 py-3.5">
                  {link.rules.length > 0 ? (
                    <span className="text-xs font-mono text-violet-400">
                      {link.rules.length} rule{link.rules.length > 1 ? "s" : ""}
                    </span>
                  ) : (
                    <span className="text-xs text-neutral-400">—</span>
                  )}
                </td>

                {/* Campaign tag */}
                <td className="px-5 py-3.5">
                  {link.campaign ? (
                    <span className="text-xs px-2 py-0.5 rounded font-medium border border-neutral-200 dark:border-white/[0.08] bg-white/80 dark:bg-neutral-900/60 text-neutral-700 dark:text-neutral-200">
                      {link.campaign}
                    </span>
                  ) : (
                    <span className="text-xs text-neutral-400">—</span>
                  )}
                </td>

                {/* Row actions */}
                <td className="px-5 py-3.5">
                  <div
                    className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity"
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
            ? `Delete \"${pendingDelete.name}\"? This action cannot be undone.`
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
