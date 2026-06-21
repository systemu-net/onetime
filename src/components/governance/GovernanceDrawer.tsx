import { fetchCampaigns } from "@/apis/campaigns";
import { createQrCode } from "@/apis/qr_codes";
import {
  assignLinkToCampaign,
  createRoutingRule,
  deleteGovernedLink,
  deleteRoutingRule,
  fetchAuditLog,
  fetchRoutingRules,
  transitionLink,
  updateDestination,
  updateFallbackUrls,
  updateLinkName,
} from "@/apis/governance";
import type { Campaign } from "@/types/campaigns";
import type {
  AuditLogEntry,
  CreateRoutingRulePayload,
  GovernanceLink,
  LinkState,
  RoutingRule,
} from "@/types/governance";
import { STATE_CONFIG } from "@/types/governance";
import { useEffect, useState } from "react";
import { useCookies } from "react-cookie";
import { AddRuleModal } from "./AddRuleModal";
import { AuditLogPanel } from "./AuditLogPanel";
import { GovernanceBadge } from "./GovernanceBadge";
import { GovernanceDeleteConfirmModal } from "./GovernanceDeleteConfirmModal";
import { GovernanceLinkAnalyticsPanel } from "./GovernanceLinkAnalyticsPanel";
import { RoutingRulesPanel } from "./RoutingRulesPanel";
import { SchedulePanel } from "./SchedulePanel";
import {
  LuShield,
  LuChartColumn,
  LuRoute,
  LuCalendar,
  LuScrollText,
} from "react-icons/lu";
import type { IconType } from "react-icons";

type DrawerTab = "governance" | "routing" | "schedule" | "audit" | "analytics";

// Okabe-Ito colorblind-safe palette (deuteranopia/protanopia/tritanopia friendly).
// Each tab gets a distinct hue mapped to its semantic meaning.
// Single alpha (0.18) on the tint reads as a soft pastel on white and a subtle
// glow on dark zinc-900 — works in both modes without conditional styling.
const TABS: {
  id: DrawerTab;
  label: string;
  Icon: IconType;
  color: string; // active accent (text, icon, underline)
  tint: string; // active background fill
}[] = [
  {
    id: "governance",
    label: "Governance",
    Icon: LuShield,
    color: "#0072B2", // blue — trust, safety
    tint: "rgba(0, 114, 178, 0.18)",
  },
  {
    id: "analytics",
    label: "Analytics",
    Icon: LuChartColumn,
    color: "#009E73", // bluish green — growth, data
    tint: "rgba(0, 158, 115, 0.18)",
  },
  {
    id: "routing",
    label: "Routing",
    Icon: LuRoute,
    color: "#CC79A7", // reddish purple — branching paths
    tint: "rgba(204, 121, 167, 0.20)",
  },
  {
    id: "schedule",
    label: "Schedule",
    Icon: LuCalendar,
    color: "#E69F00", // orange — time, attention
    tint: "rgba(230, 159, 0, 0.18)",
  },
  {
    id: "audit",
    label: "Audit",
    Icon: LuScrollText,
    color: "#D55E00", // vermillion — record, history
    tint: "rgba(213, 94, 0, 0.18)",
  },
];

interface GovernanceDrawerProps {
  link: GovernanceLink;
  onClose: () => void;
  onUpdate: (id: string, patch: Partial<GovernanceLink>) => void;
  onDelete: (id: string) => void;
  onToast: (
    msg: string,
    type?: "success" | "info" | "error" | "warning",
  ) => void;
}

const MAX_CLICKS = 35_000;
function capPct(clicks: number, cap: number | null) {
  return cap
    ? Math.min(100, (clicks / cap) * 100)
    : Math.min(100, (clicks / MAX_CLICKS) * 100);
}

export function GovernanceDrawer({
  link,
  onClose,
  onUpdate,
  onDelete,
  onToast,
}: GovernanceDrawerProps) {
  const [cookies] = useCookies(["token"]);
  const token = cookies.token as string;

  const [tab, setTab] = useState<DrawerTab>("governance");
  const [localLink, setLocalLink] = useState<GovernanceLink>(link);
  // QR data is enriched asynchronously by the parent; sync it in if it arrives
  // after the drawer opened. Targeted to qrImageUrl so in-progress local edits
  // (name / destination / state) aren't clobbered.
  useEffect(() => {
    setLocalLink((l) =>
      l.qrImageUrl === link.qrImageUrl ? l : { ...l, qrImageUrl: link.qrImageUrl },
    );
  }, [link.qrImageUrl]);
  const [qrBusy, setQrBusy] = useState(false);
  const [nameDraft, setNameDraft] = useState(link.name);
  const [dest, setDest] = useState(link.dest);
  const [pausedFallbackUrl, setPausedFallbackUrl] = useState(
    link.pausedRedirectUrl ?? "",
  );
  const [expiredFallbackUrl, setExpiredFallbackUrl] = useState(
    link.expiredRedirectUrl ?? "",
  );
  const [editingName, setEditingName] = useState(false);
  const [editingDest, setEditingDest] = useState(false);
  const [saving, setSaving] = useState(false);
  const [auditEvents, setAuditEvents] = useState<AuditLogEntry[]>([]);
  const [auditLoading, setAuditLoading] = useState(false);
  const [rules, setRules] = useState<RoutingRule[]>([]);
  const [rulesLoading, setRulesLoading] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [copiedShortUrl, setCopiedShortUrl] = useState(false);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [assigningCampaign, setAssigningCampaign] = useState(false);

  // Load campaigns once on mount; derive campaign name from id if not yet populated
  useEffect(() => {
    if (!token) return;
    fetchCampaigns(token)
      .then((list) => {
        setCampaigns(list);
        // The API only returns link_campaign_id, not the name/color — resolve them here
        if (localLink.linkCampaignId != null && localLink.campaign == null) {
          const found = list.find((c) => c.id === localLink.linkCampaignId);
          if (found) {
            setLocalLink((l) => ({
              ...l,
              campaign: found.name,
              linkCampaignColor: found.accentColor ?? null,
            }));
          }
        }
      })
      .catch(() => {
        /* non-critical – silently ignore */
      });
  }, [token]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleAssignCampaign = async (campaignId: number | null) => {
    setAssigningCampaign(true);
    try {
      await assignLinkToCampaign(token, link.lookup_code, campaignId);
      const found =
        campaignId == null
          ? null
          : (campaigns.find((c) => c.id === campaignId) ?? null);
      const campaignName = found?.name ?? null;
      const campaignColor = found?.accentColor ?? null;
      setLocalLink((l) => ({
        ...l,
        campaign: campaignName,
        linkCampaignId: campaignId,
        linkCampaignColor: campaignColor,
      }));
      onUpdate(link.id, {
        campaign: campaignName,
        linkCampaignId: campaignId,
        linkCampaignColor: campaignColor,
      });
      onToast(
        campaignId == null
          ? "Link removed from campaign"
          : `Link assigned to "${campaignName}"`,
        "success",
      );
    } catch (err) {
      onToast((err as Error).message, "error");
    } finally {
      setAssigningCampaign(false);
    }
  };

  // Lazy-load audit log
  useEffect(() => {
    if (tab !== "audit") return;
    setAuditLoading(true);
    fetchAuditLog(token, link.lookup_code)
      .then(setAuditEvents)
      .catch((err: Error) =>
        onToast(`Audit log error: ${err.message}`, "error"),
      )
      .finally(() => setAuditLoading(false));
  }, [tab, link.lookup_code, token]); // eslint-disable-line react-hooks/exhaustive-deps

  // Close drawer on Escape key
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  // Lazy-load routing rules
  useEffect(() => {
    if (tab !== "routing") return;
    setRulesLoading(true);
    fetchRoutingRules(token, link.lookup_code)
      .then(setRules)
      .catch((err: Error) => onToast(`Rules error: ${err.message}`, "error"))
      .finally(() => setRulesLoading(false));
  }, [tab, link.lookup_code, token]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleStateChange = async (newState: LinkState) => {
    setSaving(true);
    try {
      await transitionLink(token, link.lookup_code, newState);
      setLocalLink((l) => ({ ...l, state: newState }));
      onUpdate(link.id, { state: newState });
      onToast(
        `Link transitioned to ${STATE_CONFIG[newState].label}`,
        "success",
      );
    } catch (err) {
      onToast((err as Error).message, "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDestSave = async () => {
    setSaving(true);
    try {
      await updateDestination(token, link.lookup_code, dest);
      setLocalLink((l) => ({ ...l, dest }));
      onUpdate(link.id, { dest });
      setEditingDest(false);
      onToast("Destination URL updated across all published links", "success");
    } catch (err) {
      onToast((err as Error).message, "error");
    } finally {
      setSaving(false);
    }
  };

  const handleNameSave = async () => {
    const nextName = nameDraft.trim();
    if (!nextName) {
      onToast("Link name cannot be empty", "warning");
      return;
    }

    setSaving(true);
    try {
      await updateLinkName(token, link.lookup_code, nextName);
      setLocalLink((current) => ({ ...current, name: nextName }));
      onUpdate(link.id, { name: nextName });
      setEditingName(false);
      onToast("Link name updated", "success");
    } catch (err) {
      onToast((err as Error).message, "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteRule = async (ruleId: number) => {
    try {
      await deleteRoutingRule(token, link.lookup_code, ruleId);
      setRules((rs) => rs.filter((r) => r.id !== ruleId));
      onToast("Routing rule removed", "success");
    } catch (err) {
      onToast((err as Error).message, "error");
    }
  };

  const [addRuleOpen, setAddRuleOpen] = useState(false);
  const [addRuleSubmitting, setAddRuleSubmitting] = useState(false);

  const handleAddRule = async (payload: CreateRoutingRulePayload) => {
    setAddRuleSubmitting(true);
    try {
      const newRule = await createRoutingRule(token, link.lookup_code, payload);
      setRules((rs) => [...rs, newRule]);
      setAddRuleOpen(false);
      onToast("Routing rule added", "success");
    } catch (err) {
      onToast((err as Error).message, "error");
    } finally {
      setAddRuleSubmitting(false);
    }
  };

  const handleSaveFallbacks = async () => {
    setSaving(true);
    try {
      await updateFallbackUrls(
        token,
        link.lookup_code,
        pausedFallbackUrl,
        expiredFallbackUrl,
      );
      const pausedValue =
        pausedFallbackUrl.trim() === "" ? null : pausedFallbackUrl.trim();
      const expiredValue =
        expiredFallbackUrl.trim() === "" ? null : expiredFallbackUrl.trim();
      setLocalLink((l) => ({
        ...l,
        pausedRedirectUrl: pausedValue,
        expiredRedirectUrl: expiredValue,
      }));
      onUpdate(link.id, {
        pausedRedirectUrl: pausedValue,
        expiredRedirectUrl: expiredValue,
      });
      onToast("Fallback URLs saved", "success");
    } catch (err) {
      onToast((err as Error).message, "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteLink = async () => {
    setIsDeleting(true);
    try {
      await deleteGovernedLink(token, localLink.lookup_code);
      onDelete(localLink.id);
      setIsDeleteModalOpen(false);
      onClose();
      onToast(`"${localLink.name}" deleted`, "success");
    } catch (err) {
      onToast((err as Error).message, "error");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCopyShortUrl = async () => {
    try {
      await navigator.clipboard.writeText(localLink.short);
      setCopiedShortUrl(true);
      onToast("Link was copied into the clipboard", "success");
      setTimeout(() => setCopiedShortUrl(false), 2000);
    } catch {
      onToast("Failed to copy link. Please try again.", "error");
    }
  };

  // Generate a complementary QR for a link that has none, and propagate it to
  // the parent so the table/cache pick it up immediately.
  const handleGenerateQr = async () => {
    setQrBusy(true);
    try {
      const res = await createQrCode(token, {
        qr_code: { lookup_code: localLink.lookup_code, title: localLink.name },
      });
      const imageUrl = res?.qr_code?.image_url;
      if (!imageUrl) throw new Error("QR code response was empty");
      setLocalLink((l) => ({ ...l, qrImageUrl: imageUrl }));
      onUpdate(localLink.id, { qrImageUrl: imageUrl });
      onToast("QR code generated", "success");
    } catch (err) {
      onToast(`Couldn't generate the QR code: ${(err as Error).message}`, "error");
    } finally {
      setQrBusy(false);
    }
  };

  const p = capPct(localLink.clicks, localLink.cap);
  const capClass =
    p < 60 ? "gov-cap-low" : p < 85 ? "gov-cap-mid" : "gov-cap-high";

  return (
    <>
      <GovernanceDeleteConfirmModal
        isOpen={isDeleteModalOpen}
        title="Delete Link"
        description={`Delete "${localLink.name}"? This action cannot be undone.`}
        confirmLabel="Delete Link"
        isSubmitting={isDeleting}
        onCancel={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteLink}
      />

      <AddRuleModal
        isOpen={addRuleOpen}
        isSubmitting={addRuleSubmitting}
        existingRuleCount={rules.length}
        onClose={() => setAddRuleOpen(false)}
        onSubmit={handleAddRule}
      />

      {/* Overlay */}
      <div
        className="gov-drawer-overlay fixed inset-0 z-40"
        onClick={onClose}
      />

      {/* Drawer panel */}
      <div className="gov-drawer-enter fixed right-0 top-0 bottom-0 z-50 h-[100dvh] w-full max-w-[680px] transform-gpu will-change-transform flex flex-col bg-white dark:bg-neutral-900 border-l border-neutral-200 dark:border-white/[0.06] shadow-2xl">
        {/* Header */}
        <div className="px-4 sm:px-6 py-4 sm:py-5 border-b border-neutral-200 dark:border-white/[0.06] flex items-start justify-between gap-3 sm:gap-4 shrink-0">
          <div className="min-w-0">
            {editingName ? (
              <div className="gov-title-edit-row">
                <input
                  className="gov-title-input"
                  value={nameDraft}
                  onChange={(e) => setNameDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      void handleNameSave();
                    }
                    if (e.key === "Escape") {
                      setEditingName(false);
                      setNameDraft(localLink.name);
                    }
                  }}
                  placeholder="Link name"
                  autoFocus
                />
                <div className="gov-title-edit-actions">
                  <button
                    disabled={saving}
                    onClick={handleNameSave}
                    className="gov-title-save-btn"
                  >
                    {saving ? "Saving" : "Save"}
                  </button>
                  <button
                    onClick={() => {
                      setEditingName(false);
                      setNameDraft(localLink.name);
                    }}
                    className="gov-title-cancel-btn"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="gov-title-display-row">
                <h2 className="gov-title-display">{localLink.name}</h2>
                <button
                  onClick={() => {
                    setEditingName(true);
                    setNameDraft(localLink.name);
                  }}
                  className="gov-title-edit-trigger"
                  aria-label="Edit link name"
                  title="Edit link name"
                >
                  <svg
                    aria-hidden="true"
                    viewBox="0 0 20 20"
                    fill="none"
                    className="h-3.5 w-3.5"
                  >
                    <path
                      d="M13.958 3.542a1.5 1.5 0 1 1 2.121 2.121l-8.25 8.25-3.329.707.707-3.329 8.25-8.25Z"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M12.5 5l2.5 2.5"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                  </svg>
                </button>
              </div>
            )}
            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
              <a
                href={localLink.short}
                target="_blank"
                rel="noreferrer"
                onClick={(e) => e.stopPropagation()}
                title="Open short link in new tab"
                className="group inline-flex items-center gap-1.5 font-mono text-xs px-2.5 py-1 rounded-md bg-violet-500/10 hover:bg-violet-500/20 border border-violet-500/30 hover:border-violet-500/60 text-violet-600 dark:text-violet-300 hover:text-violet-700 dark:hover:text-violet-200 shadow-sm hover:shadow transition-all"
              >
                <span className="truncate max-w-[18rem] sm:max-w-none">
                  {localLink.short}
                </span>
                <svg
                  aria-hidden="true"
                  viewBox="0 0 12 12"
                  className="h-3 w-3 shrink-0 opacity-60 group-hover:opacity-100 transition-opacity"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.75"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M4.5 2.5h5v5" />
                  <path d="M9.5 2.5l-7 7" />
                </svg>
              </a>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg border border-neutral-200 dark:border-neutral-700 flex items-center justify-center text-neutral-400 hover:text-neutral-600 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors shrink-0"
          >
            ✕
          </button>
        </div>

        <div className="px-4 sm:px-6 py-2.5 border-b border-neutral-200 dark:border-white/[0.06] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2">
          <button
            onClick={handleCopyShortUrl}
            className={`gov-copy-btn inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs rounded-lg border ${copiedShortUrl ? "gov-copy-btn-burst" : ""}`}
          >
            {copiedShortUrl ? "Copied!" : "Copy Short URL"}
          </button>
          <button
            onClick={() => setIsDeleteModalOpen(true)}
            disabled={isDeleting}
            className={`gov-delete-btn inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs rounded-lg border ${isDeleting ? "gov-delete-btn-burst" : ""} disabled:opacity-60`}
          >
            Delete Link
          </button>
        </div>

        {/* Tab strip */}
        <div
          className="px-4 sm:px-6 pt-3 border-b border-neutral-200 dark:border-white/[0.06] shrink-0"
          role="tablist"
          aria-label="Link details sections"
        >
          <div className="flex gap-1 overflow-x-auto -mb-px">
            {TABS.map((t) => {
              const Icon = t.Icon;
              const active = tab === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  aria-label={t.label}
                  onClick={() => setTab(t.id)}
                  className={[
                    "group relative inline-flex items-center justify-center gap-1.5 flex-1 sm:flex-initial shrink-0 px-2 sm:px-4 py-2 text-[12.5px] font-medium rounded-t-md",
                    "border-b-2 transition-all duration-150 cursor-pointer",
                    active
                      ? ""
                      : "text-neutral-400 dark:text-neutral-500 border-transparent opacity-70 hover:opacity-100 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800/60",
                  ].join(" ")}
                  style={
                    active
                      ? {
                          color: t.color,
                          borderBottomColor: t.color,
                          backgroundColor: t.tint,
                        }
                      : undefined
                  }
                  title={t.label}
                >
                  <Icon
                    size={18}
                    strokeWidth={active ? 2.5 : 2}
                    aria-hidden
                    style={active ? { color: t.color } : undefined}
                    className={
                      active
                        ? "scale-110 sm:scale-100 transition-transform"
                        : "text-neutral-400 group-hover:text-neutral-600 dark:group-hover:text-neutral-200"
                    }
                  />
                  <span className="hidden sm:inline">{t.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain p-4 sm:p-6 flex flex-col gap-4 sm:gap-5">
          {/* ── Governance tab ── */}
          {tab === "governance" && (
            <>
              {/* State switcher */}
              <SectionCard
                title="Link State"
                action={<GovernanceBadge state={localLink.state} />}
              >
                <div className="flex flex-wrap gap-2">
                  {(
                    Object.entries(STATE_CONFIG) as [
                      LinkState,
                      (typeof STATE_CONFIG)[LinkState],
                    ][]
                  ).map(([s, cfg]) => (
                    <button
                      key={s}
                      disabled={saving}
                      onClick={() => handleStateChange(s)}
                      className={`gov-state-btn text-[12.5px] ${
                        localLink.state === s
                          ? "font-semibold"
                          : "border-neutral-200 dark:border-neutral-700 text-neutral-500 dark:text-neutral-400 bg-neutral-50 dark:bg-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-500 hover:text-neutral-700 dark:hover:text-white"
                      }`}
                      style={
                        localLink.state === s
                          ? {
                              borderColor: cfg.color,
                              color: cfg.color,
                              background: `${cfg.color}18`,
                            }
                          : undefined
                      }
                    >
                      {cfg.emoji} {cfg.label}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-neutral-400 mt-2">
                  State changes apply instantly — no republishing needed.
                </p>
              </SectionCard>

              {/* Destination URL */}
              <SectionCard
                title="Destination URL"
                action={
                  <button
                    onClick={() => setEditingDest((v) => !v)}
                    className="text-xs px-2.5 py-1 rounded-md border border-neutral-300 dark:border-neutral-600 text-neutral-500 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
                  >
                    {editingDest ? "Cancel" : "Edit"}
                  </button>
                }
              >
                {editingDest ? (
                  <div className="flex flex-col sm:flex-row gap-2">
                    <input
                      className="gov-field-input flex-1"
                      value={dest}
                      onChange={(e) => setDest(e.target.value)}
                      placeholder="https://…"
                    />
                    <button
                      disabled={saving}
                      onClick={handleDestSave}
                      className="px-3 py-1.5 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-xs font-medium transition-colors disabled:opacity-50"
                    >
                      {saving ? "…" : "Save"}
                    </button>
                  </div>
                ) : (
                  <a
                    href={localLink.dest}
                    target="_blank"
                    rel="noreferrer"
                    title={`Open ${localLink.dest} in a new tab`}
                    className="group inline-flex items-start gap-1.5 font-mono text-[12.5px] text-violet-500 dark:text-violet-400 hover:text-violet-600 dark:hover:text-violet-300 hover:underline break-all leading-relaxed"
                  >
                    <span className="min-w-0 break-all">{localLink.dest}</span>
                    <span
                      aria-hidden
                      className="shrink-0 mt-0.5 text-neutral-400 group-hover:text-violet-500 dark:group-hover:text-violet-300 transition-colors"
                    >
                      ↗
                    </span>
                  </a>
                )}
                <p className="text-xs text-neutral-400 mt-2">
                  All existing short links instantly point to the new
                  destination.
                </p>
              </SectionCard>

              {/* Complementary QR code */}
              <SectionCard title="QR Code">
                {localLink.qrImageUrl ? (
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="flex items-start sm:items-center gap-3 min-w-0">
                      <img
                        src={localLink.qrImageUrl}
                        alt={`${localLink.name} QR code`}
                        className="h-24 w-24 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white"
                        style={{ imageRendering: "crisp-edges" }}
                      />
                      <div className="min-w-0">
                        <p className="text-xs text-neutral-400 font-mono">
                          Linked complementary QR
                        </p>
                        <p className="text-xs text-neutral-500 dark:text-neutral-300 mt-1">
                          Use this code for offline scans to this same link.
                        </p>
                      </div>
                    </div>
                    <a
                      href={localLink.qrImageUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs px-2.5 py-1.5 rounded-md border border-neutral-300 dark:border-neutral-600 text-neutral-500 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors self-start sm:self-auto"
                    >
                      Open
                    </a>
                  </div>
                ) : (
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <p className="text-xs text-neutral-400">
                      No complementary QR code yet — generate one for offline
                      scans to this link.
                    </p>
                    <button
                      type="button"
                      onClick={handleGenerateQr}
                      disabled={qrBusy}
                      className="text-xs px-3 py-1.5 rounded-md bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 hover:opacity-90 transition disabled:opacity-50 self-start sm:self-auto whitespace-nowrap"
                    >
                      {qrBusy ? "Generating…" : "Generate QR code"}
                    </button>
                  </div>
                )}
              </SectionCard>

              {/* Click cap progress */}
              {localLink.cap && (
                <SectionCard title="Click Cap">
                  <div>
                    <div className="flex justify-between items-end mb-2">
                      <span className="text-2xl font-bold text-neutral-900 dark:text-white">
                        {localLink.clicks.toLocaleString()}
                      </span>
                      <span className="text-xs text-neutral-400">
                        / {localLink.cap.toLocaleString()} cap
                      </span>
                    </div>
                    <div className="h-1.5 rounded-full bg-neutral-200 dark:bg-neutral-700 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${capClass}`}
                        style={{ width: `${p}%` }}
                      />
                    </div>
                    <div className="flex justify-between mt-1.5 text-[11px] font-mono text-neutral-400">
                      <span>0</span>
                      <span>{p.toFixed(0)}% used</span>
                      <span>{localLink.cap.toLocaleString()}</span>
                    </div>
                  </div>
                </SectionCard>
              )}

              {/* Campaign assignment */}
              <SectionCard
                title="Campaign"
                action={
                  localLink.campaign ? (
                    <span
                      className="text-xs px-2 py-0.5 rounded font-medium"
                      style={{
                        background: localLink.linkCampaignColor
                          ? `${localLink.linkCampaignColor}20`
                          : undefined,
                        borderWidth: 1,
                        borderStyle: "solid",
                        borderColor: localLink.linkCampaignColor
                          ? `${localLink.linkCampaignColor}50`
                          : undefined,
                        color: localLink.linkCampaignColor ?? undefined,
                      }}
                    >
                      {localLink.campaign}
                    </span>
                  ) : (
                    <span className="text-xs text-neutral-400">Unassigned</span>
                  )
                }
              >
                <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
                  <select
                    disabled={assigningCampaign}
                    value={localLink.linkCampaignId ?? ""}
                    onChange={(e) =>
                      handleAssignCampaign(
                        e.target.value === "" ? null : Number(e.target.value),
                      )
                    }
                    className="gov-field-input flex-1 text-xs"
                  >
                    <option value="">— Unassigned —</option>
                    {campaigns.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                  {assigningCampaign && (
                    <span className="text-xs text-neutral-400 shrink-0 self-start sm:self-auto">
                      Saving…
                    </span>
                  )}
                </div>
                <p className="text-xs text-neutral-400 mt-2">
                  Assign this link to a campaign to group and govern it
                  together.
                </p>
              </SectionCard>

              {/* Fallback URLs */}
              <SectionCard title="Fallback URLs">
                <div className="flex flex-col gap-3">
                  <FieldRow label="When Paused →">
                    <input
                      className="gov-field-input"
                      value={pausedFallbackUrl}
                      onChange={(e) => setPausedFallbackUrl(e.target.value)}
                      placeholder="https://your-fallback-for-paused.com"
                    />
                  </FieldRow>
                  <FieldRow label="When Expired →">
                    <input
                      className="gov-field-input"
                      value={expiredFallbackUrl}
                      onChange={(e) => setExpiredFallbackUrl(e.target.value)}
                      placeholder="https://your-fallback-for-expired.com"
                    />
                  </FieldRow>
                  <button
                    onClick={handleSaveFallbacks}
                    disabled={saving}
                    className="self-start text-xs px-3 py-1.5 rounded-lg border border-neutral-300 dark:border-neutral-600 text-neutral-500 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
                  >
                    {saving ? "Saving..." : "Save Fallbacks"}
                  </button>
                </div>
              </SectionCard>
            </>
          )}

          {/* ── Routing tab ── */}
          {tab === "routing" && (
            <RoutingRulesPanel
              rules={rules}
              loading={rulesLoading}
              onDeleteRule={handleDeleteRule}
              onAddRule={() => setAddRuleOpen(true)}
            />
          )}

          {/* ── Schedule tab ── */}
          {tab === "schedule" && (
            <SchedulePanel
              link={localLink}
              onUpdateLink={(patch) => {
                setLocalLink((l) => ({ ...l, ...patch }));
                onUpdate(link.id, patch);
              }}
              onToast={onToast}
            />
          )}

          {/* ── Audit tab ── */}
          {tab === "audit" && (
            <AuditLogPanel
              events={auditEvents}
              loading={auditLoading}
              onExport={() => onToast("Audit log exported to CSV", "success")}
            />
          )}

          {/* ── Analytics tab — always mounted to preserve state across tab switches ── */}
          <div style={{ display: tab === "analytics" ? "block" : "none" }}>
            <GovernanceLinkAnalyticsPanel
              lookupCode={link.lookup_code}
              token={token}
              onToast={onToast}
            />
          </div>
        </div>
      </div>
    </>
  );
}

// ── Local layout helpers ───────────────────────────────────────────────────────

function SectionCard({
  title,
  action,
  children,
}: {
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-neutral-200 dark:border-white/[0.06] bg-white dark:bg-neutral-900">
      <div className="px-4 py-2.5 border-b border-neutral-200 dark:border-white/[0.06] bg-neutral-50 dark:bg-neutral-800/40 flex items-center justify-between">
        <span className="text-[11px] font-semibold uppercase tracking-[0.05em] text-neutral-400 font-mono">
          {title}
        </span>
        {action}
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}

function FieldRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[11px] font-medium uppercase tracking-[0.05em] text-neutral-400">
        {label}
      </label>
      {children}
    </div>
  );
}
