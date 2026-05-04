import { getCampaignType } from "@/apis/campaigns";
import {
    assignLinkToCampaign,
    createGovernedLink,
    transitionLink,
} from "@/apis/governance";
import { GovernanceBadge } from "@/components/governance/GovernanceBadge";
import { NewGovernedLinkModal } from "@/components/governance/NewGovernedLinkModal";
import { GOVERNANCE_ROUTE } from "@/routes";
import type { Campaign, CampaignUpdatePayload } from "@/types/campaigns";
import type { CreateGovernedLinkPayload } from "@/types/governance";
import { useEffect, useState } from "react";
import { useCookies } from "react-cookie";
import { useNavigate } from "react-router-dom";
import { CampaignStateBadge } from "./CampaignStateBadge";

interface CampaignDrawerProps {
  campaign: Campaign;
  onClose: () => void;
  onSave: (campaignId: number, payload: CampaignUpdatePayload) => Promise<void>;
  onDelete: (campaignId: number) => Promise<void>;
  onToast: (
    message: string,
    type?: "success" | "info" | "error" | "warning",
  ) => void;
}

type DrawerTab = "overview" | "links" | "settings" | "timeline";

const TYPE_THEME: Record<
  string,
  { accent: string; soft: string; icon: string }
> = {
  launch: { accent: "#7c3aed", soft: "rgba(124,58,237,0.18)", icon: "R" },
  sale: { accent: "#ec4899", soft: "rgba(236,72,153,0.18)", icon: "S" },
  event: { accent: "#3b82f6", soft: "rgba(59,130,246,0.18)", icon: "E" },
  content: { accent: "#06b6d4", soft: "rgba(6,182,212,0.18)", icon: "C" },
  retargeting: { accent: "#f97316", soft: "rgba(249,115,22,0.18)", icon: "T" },
  affiliate: { accent: "#10b981", soft: "rgba(16,185,129,0.18)", icon: "A" },
};

function computeSparklinePoints(clicks: number[], points = 12) {
  const ranked = [...clicks].sort((a, b) => b - a).slice(0, points);
  const padded = [
    ...ranked,
    ...Array(Math.max(0, points - ranked.length)).fill(0),
  ];
  const peak = Math.max(1, ...padded);
  return padded.map((value) =>
    value <= 0 ? 0 : Math.max(8, Math.round((value / peak) * 100)),
  );
}

export function CampaignDrawer({
  campaign,
  onClose,
  onSave,
  onDelete,
  onToast,
}: CampaignDrawerProps) {
  const [cookies] = useCookies(["token"]);
  const token = cookies.token as string;
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<DrawerTab>("overview");
  const [name, setName] = useState(campaign.name);
  const [nameDraft, setNameDraft] = useState(campaign.name);
  const [editingName, setEditingName] = useState(false);
  const [description, setDescription] = useState(campaign.description);
  const [localLinks, setLocalLinks] = useState(campaign.links);
  const [isSaving, setIsSaving] = useState(false);
  const [isBulkSaving, setIsBulkSaving] = useState(false);
  const [activeLinkActionId, setActiveLinkActionId] = useState<number | null>(
    null,
  );
  const [isDeleting, setIsDeleting] = useState(false);
  const [isCreateLinkModalOpen, setIsCreateLinkModalOpen] = useState(false);
  const [isCreatingLink, setIsCreatingLink] = useState(false);

  const campaignType = getCampaignType(name || campaign.name);
  const theme = {
    ...(TYPE_THEME[campaignType] ?? TYPE_THEME.launch),
    accent:
      campaign.accentColor ||
      (TYPE_THEME[campaignType] ?? TYPE_THEME.launch).accent,
  };

  useEffect(() => {
    setName(campaign.name);
    setNameDraft(campaign.name);
    setDescription(campaign.description);
    setLocalLinks(campaign.links);
  }, [campaign.id, campaign.name, campaign.description, campaign.links]);

  const handleNameSave = async () => {
    const nextName = nameDraft.trim();
    if (!nextName) {
      onToast("Campaign name cannot be empty.", "warning");
      return;
    }

    setIsSaving(true);
    try {
      await onSave(campaign.id, { name: nextName });
      setName(nextName);
      setEditingName(false);
      onToast("Campaign name updated.", "success");
    } catch (error) {
      onToast((error as Error).message, "error");
    } finally {
      setIsSaving(false);
    }
  };

  const totalClicks = localLinks.reduce(
    (sum, link) => sum + link.clicksCount,
    0,
  );
  const activeLinks = localLinks.filter(
    (link) => link.state === "active",
  ).length;
  const pausedLinks = localLinks.filter(
    (link) => link.state === "paused",
  ).length;
  const sparklinePoints = computeSparklinePoints(
    localLinks.map((link) => link.clicksCount),
  );

  const ranked = [...localLinks].sort((a, b) => b.clicksCount - a.clicksCount);
  const topA = ranked[0] ?? null;
  const topB = ranked[1] ?? null;
  const trafficTotal = ranked.reduce((sum, link) => sum + link.clicksCount, 0);
  const aPct =
    topA && trafficTotal > 0
      ? Math.round((topA.clicksCount / trafficTotal) * 100)
      : 0;
  const bPct =
    topB && trafficTotal > 0
      ? Math.round((topB.clicksCount / trafficTotal) * 100)
      : 0;
  const otherPct = Math.max(0, 100 - aPct - bPct);

  const timeline = [
    {
      title: "Campaign Created",
      detail: campaign.description || "Campaign initialized",
      time: new Date(campaign.createdAt).toLocaleString(),
      color: "#7c3aed",
    },
    {
      title: "Campaign Updated",
      detail: "Latest settings and metadata saved",
      time: new Date(campaign.updatedAt).toLocaleString(),
      color: "#3b82f6",
    },
    ...(campaign.state === "paused"
      ? [
          {
            title: "Campaign Paused",
            detail: "All active governed links should be paused",
            time: new Date(campaign.updatedAt).toLocaleString(),
            color: "#f59e0b",
          },
        ]
      : []),
  ];

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave(campaign.id, {
        name: name.trim(),
        description: description.trim(),
      });
      onToast("Campaign details saved.", "success");
    } catch (error) {
      onToast((error as Error).message, "error");
    } finally {
      setIsSaving(false);
    }
  };

  const syncLinkState = (
    linkId: number,
    state: Campaign["links"][number]["state"],
  ) => {
    setLocalLinks((current) =>
      current.map((link) => (link.id === linkId ? { ...link, state } : link)),
    );
  };

  const handleSingleLinkTransition = async (
    linkId: number,
    lookupCode: string,
    nextState: Campaign["links"][number]["state"],
  ) => {
    if (!token) return;

    setActiveLinkActionId(linkId);
    try {
      await transitionLink(
        token,
        lookupCode,
        nextState as "active" | "paused" | "expired" | "draft" | "archived",
      );
      syncLinkState(linkId, nextState);
      onToast(
        `Link ${lookupCode} moved to ${nextState}.`,
        nextState === "paused" ? "info" : "success",
      );
    } catch (error) {
      onToast((error as Error).message, "error");
    } finally {
      setActiveLinkActionId(null);
    }
  };

  const handleBulkGovernance = async (
    nextState: "active" | "paused" | "expired",
  ) => {
    if (!token) return;
    if (localLinks.length === 0) {
      onToast("No links assigned to this campaign.", "info");
      return;
    }

    setIsBulkSaving(true);
    try {
      await Promise.allSettled(
        localLinks.map((link) =>
          transitionLink(
            token,
            link.lookupCode,
            nextState as "active" | "paused" | "expired" | "draft" | "archived",
          ),
        ),
      );

      setLocalLinks((current) =>
        current.map((link) => ({ ...link, state: nextState })),
      );
      await onSave(campaign.id, { state: nextState });
      onToast(
        `Bulk governance complete: ${localLinks.length} links → ${nextState}.`,
        "success",
      );
    } catch (error) {
      onToast((error as Error).message, "error");
    } finally {
      setIsBulkSaving(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await onDelete(campaign.id);
      onClose();
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCreateGovernedLink = async (
    payload: CreateGovernedLinkPayload,
  ) => {
    if (!token) return;

    setIsCreatingLink(true);
    try {
      const created = await createGovernedLink(token, {
        ...payload,
        linkCampaignId: campaign.id,
      });

      setLocalLinks((current) => [
        {
          id: Date.now(),
          lookupCode: created.lookup_code,
          originalUrl: created.dest,
          title: created.name,
          state: created.state,
          clicksCount: created.clicks,
        },
        ...current,
      ]);

      setIsCreateLinkModalOpen(false);
      onToast(`Link ${created.lookup_code} added to campaign.`, "success");
    } catch (error) {
      onToast((error as Error).message, "error");
    } finally {
      setIsCreatingLink(false);
    }
  };

  const handleRemoveFromCampaign = async (
    linkId: number,
    lookupCode: string,
  ) => {
    if (!token) return;

    setActiveLinkActionId(linkId);
    try {
      await assignLinkToCampaign(token, lookupCode, null);
      setLocalLinks((current) => current.filter((link) => link.id !== linkId));
      onToast(`Link ${lookupCode} removed from campaign.`, "info");
    } catch (error) {
      onToast((error as Error).message, "error");
    } finally {
      setActiveLinkActionId(null);
    }
  };

  return (
    <>
      <div className="gov-drawer-overlay" onClick={onClose} />
      <aside className="gov-drawer">
        <header className="gov-drawer-head">
          <div className="gov-drawer-head-main">
            <div
              className="gov-drawer-avatar"
              style={{
                borderColor: theme.accent,
                background: `linear-gradient(135deg, ${theme.soft}, rgba(255,255,255,0.04))`,
                color: theme.accent,
              }}
            >
              <span>{theme.icon}</span>
            </div>
            <div>
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
                        setNameDraft(name);
                      }
                    }}
                    placeholder="Campaign name"
                    autoFocus
                  />
                  <div className="gov-title-edit-actions">
                    <button
                      disabled={isSaving}
                      onClick={handleNameSave}
                      className="gov-title-save-btn"
                    >
                      {isSaving ? "Saving" : "Save"}
                    </button>
                    <button
                      onClick={() => {
                        setEditingName(false);
                        setNameDraft(name);
                      }}
                      className="gov-title-cancel-btn"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="gov-title-display-row">
                  <h3 className="gov-title-display">{name}</h3>
                  {campaign.isDefault && (
                    <span
                      title="This is the default campaign. New links are assigned here automatically."
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 4,
                        fontSize: 11,
                        fontWeight: 600,
                        padding: "2px 8px",
                        borderRadius: 99,
                        background: "#ede9fe",
                        color: "#6d28d9",
                        border: "1px solid #c4b5fd",
                        letterSpacing: "0.02em",
                        whiteSpace: "nowrap",
                      }}
                    >
                      ⚑ Default
                    </span>
                  )}
                  <button
                    onClick={() => {
                      setEditingName(true);
                      setNameDraft(name);
                    }}
                    className="gov-title-edit-trigger"
                    aria-label="Edit campaign name"
                    title="Edit campaign name"
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
              <div className="gov-drawer-meta">
                <CampaignStateBadge state={campaign.state} />
                <span>{campaign.linksCount} links</span>
                <span className="gov-drawer-type-chip">{campaignType}</span>
              </div>
            </div>
          </div>
          <button className="gov-icon-btn" onClick={onClose}>
            x
          </button>
        </header>

        <nav className="gov-drawer-tabs">
          {(["overview", "links", "settings", "timeline"] as DrawerTab[]).map(
            (tab) => (
              <button
                key={tab}
                className={`gov-drawer-tab ${activeTab === tab ? "gov-drawer-tab-active" : ""}`}
                onClick={() => setActiveTab(tab)}
              >
                {tab}
              </button>
            ),
          )}
        </nav>

        <div className="gov-drawer-body">
          {activeTab === "overview" && (
            <section className="gov-panel">
              <h4>Campaign Overview</h4>
              <p>{campaign.description || "No description provided."}</p>
              <div className="gov-kpi-row">
                <div className="gov-kpi-box">
                  <span>Total clicks</span>
                  <strong>{totalClicks.toLocaleString()}</strong>
                </div>
                <div className="gov-kpi-box">
                  <span>Active links</span>
                  <strong>{activeLinks}</strong>
                </div>
                <div className="gov-kpi-box">
                  <span>Paused links</span>
                  <strong>{pausedLinks}</strong>
                </div>
              </div>

              <div className="gov-drawer-widget">
                <div className="gov-drawer-widget-head">
                  <h5>Click Distribution - Top 12 Links</h5>
                </div>
                <CampaignDrawerSparkline
                  points={sparklinePoints}
                  accent={theme.accent}
                />
              </div>

              <div className="gov-drawer-widget">
                <div className="gov-drawer-widget-head">
                  <h5>A/B Traffic Distribution</h5>
                </div>
                <div className="gov-ab-track" aria-hidden>
                  <div
                    className="gov-ab-segment gov-ab-segment-a"
                    style={{ width: `${aPct}%` }}
                  />
                  <div
                    className="gov-ab-segment gov-ab-segment-b"
                    style={{ width: `${bPct}%` }}
                  />
                  <div
                    className="gov-ab-segment gov-ab-segment-other"
                    style={{ width: `${otherPct}%` }}
                  />
                </div>
                <div className="gov-ab-legend">
                  <div>
                    <span className="gov-ab-dot gov-ab-dot-a" />
                    <p>{topA ? topA.lookupCode : "Variant A"}</p>
                    <strong>{aPct}%</strong>
                  </div>
                  <div>
                    <span className="gov-ab-dot gov-ab-dot-b" />
                    <p>{topB ? topB.lookupCode : "Variant B"}</p>
                    <strong>{bPct}%</strong>
                  </div>
                  <div>
                    <span className="gov-ab-dot gov-ab-dot-other" />
                    <p>Other</p>
                    <strong>{otherPct}%</strong>
                  </div>
                </div>
              </div>

              <dl className="gov-meta-grid">
                <div>
                  <dt>Created</dt>
                  <dd>{new Date(campaign.createdAt).toLocaleString()}</dd>
                </div>
                <div>
                  <dt>Updated</dt>
                  <dd>{new Date(campaign.updatedAt).toLocaleString()}</dd>
                </div>
              </dl>
              <div className="gov-drawer-actions">
                <button
                  onClick={() => handleBulkGovernance("active")}
                  disabled={isBulkSaving}
                  className="gov-secondary-btn"
                >
                  {isBulkSaving ? "Working..." : "Resume All"}
                </button>
                <button
                  onClick={() => handleBulkGovernance("paused")}
                  disabled={isBulkSaving}
                  className="gov-secondary-btn"
                >
                  {isBulkSaving ? "Working..." : "Pause All"}
                </button>
                <button
                  onClick={() => handleBulkGovernance("expired")}
                  disabled={isBulkSaving}
                  className="gov-danger-btn"
                >
                  {isBulkSaving ? "Working..." : "Expire All"}
                </button>
              </div>
            </section>
          )}

          {activeTab === "links" && (
            <section className="gov-panel">
              <div className="gov-links-head">
                <p className="gov-links-summary">
                  {localLinks.length} links governed by this campaign
                </p>
                <button
                  className="gov-primary-btn"
                  onClick={() => setIsCreateLinkModalOpen(true)}
                >
                  + Add Link
                </button>
              </div>

              {localLinks.length === 0 && (
                <p className="text-sm text-neutral-400 dark:text-neutral-500 py-4">
                  No links assigned yet.
                </p>
              )}
              {localLinks.length > 0 && (
                <div className="rounded-xl border border-neutral-200 dark:border-white/[0.06] overflow-hidden">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-neutral-100 dark:border-white/[0.04]">
                        {["Link", "Status", "Clicks", ""].map((h) => (
                          <th
                            key={h}
                            className="px-4 py-2.5 text-left text-[11px] font-medium uppercase tracking-[0.06em] text-neutral-400 font-mono"
                          >
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {localLinks.map((link) => {
                        const peak = Math.max(
                          1,
                          ...localLinks.map((item) => item.clicksCount),
                        );
                        const pct = Math.min(
                          100,
                          (link.clicksCount / peak) * 100,
                        );
                        const label = link.title?.trim().length
                          ? link.title
                          : link.lookupCode;

                        return (
                          <tr
                            key={link.id}
                            className="border-b border-neutral-50 dark:border-white/[0.025] last:border-0 hover:bg-neutral-50 dark:hover:bg-white/[0.02] transition-colors group cursor-pointer"
                            onClick={() =>
                              navigate(
                                `${GOVERNANCE_ROUTE}?lookup=${encodeURIComponent(link.lookupCode)}`,
                              )
                            }
                          >
                            {/* Name + code */}
                            <td className="px-4 py-3">
                              <div className="font-medium text-[13px] text-neutral-900 dark:text-neutral-100">
                                {label}
                              </div>
                              <div className="mt-0.5">
                                <span className="font-mono text-[11px] px-1.5 py-0.5 rounded bg-violet-500/10 border border-violet-500/20 text-violet-400">
                                  {link.lookupCode}
                                </span>
                              </div>
                            </td>

                            {/* Badge */}
                            <td className="px-4 py-3">
                              <GovernanceBadge
                                state={
                                  link.state as
                                    | "active"
                                    | "paused"
                                    | "expired"
                                    | "draft"
                                    | "archived"
                                }
                              />
                            </td>

                            {/* Clicks bar */}
                            <td className="px-4 py-3">
                              <div className="w-20">
                                <div className="text-[12px] font-mono font-medium text-neutral-700 dark:text-neutral-300">
                                  {link.clicksCount.toLocaleString()}
                                </div>
                                <div className="mt-1 h-0.5 rounded-full bg-neutral-200 dark:bg-neutral-700 overflow-hidden">
                                  <div
                                    className="gov-clicks-bar-fill h-full"
                                    style={{ width: `${pct}%` }}
                                  />
                                </div>
                              </div>
                            </td>

                            {/* Actions */}
                            <td className="px-4 py-3">
                              <div
                                className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <button
                                  title={
                                    link.state === "paused" ? "Resume" : "Pause"
                                  }
                                  onClick={() =>
                                    handleSingleLinkTransition(
                                      link.id,
                                      link.lookupCode,
                                      link.state === "paused"
                                        ? "active"
                                        : "paused",
                                    )
                                  }
                                  disabled={activeLinkActionId === link.id}
                                  className="w-7 h-7 rounded-md border border-neutral-200 dark:border-neutral-700 flex items-center justify-center text-xs text-neutral-400 hover:text-violet-500 hover:border-violet-500/40 dark:hover:text-violet-400 transition-colors disabled:opacity-40"
                                >
                                  {activeLinkActionId === link.id
                                    ? "…"
                                    : link.state === "paused"
                                      ? "▶"
                                      : "⏸"}
                                </button>
                                <button
                                  title="Remove from campaign"
                                  onClick={() =>
                                    handleRemoveFromCampaign(
                                      link.id,
                                      link.lookupCode,
                                    )
                                  }
                                  disabled={activeLinkActionId === link.id}
                                  className="w-7 h-7 rounded-md border border-neutral-200 dark:border-red-800/40 flex items-center justify-center text-xs text-neutral-400 hover:text-red-500 hover:border-red-400/40 dark:hover:text-red-400 transition-colors disabled:opacity-40"
                                >
                                  ✕
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          )}

          {activeTab === "settings" && (
            <section className="gov-panel">
              <h4>Edit Campaign</h4>
              <label>
                Name
                <input
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  className="gov-field-input"
                />
              </label>
              <label>
                Description
                <textarea
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  className="gov-field-input gov-textarea"
                />
              </label>
              <div className="gov-drawer-actions">
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="gov-primary-btn"
                >
                  {isSaving ? "Saving..." : "Save"}
                </button>
                {!campaign.isDefault && (
                  <button
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="gov-danger-btn"
                  >
                    {isDeleting ? "Deleting..." : "Delete Campaign"}
                  </button>
                )}
              </div>
            </section>
          )}

          {activeTab === "timeline" && (
            <section className="gov-panel">
              <div className="gov-timeline-head">
                <h4>Campaign Timeline</h4>
                <button
                  className="gov-secondary-btn"
                  onClick={() =>
                    onToast("Timeline export is coming soon.", "info")
                  }
                >
                  Export
                </button>
              </div>
              <p className="gov-timeline-subtitle">
                Full governance history for this campaign
              </p>
              <div className="gov-timeline-card">
                <div className="gov-timeline-list">
                  {timeline.map((item, index) => (
                    <div
                      key={`${item.title}-${index}`}
                      className="gov-timeline-item"
                    >
                      <div
                        className="gov-timeline-dot"
                        style={{ backgroundColor: item.color }}
                      />
                      <div className="gov-timeline-content">
                        <strong>{item.title}</strong>
                        <p>{item.detail}</p>
                        <span>{item.time}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}
        </div>
      </aside>

      <NewGovernedLinkModal
        isOpen={isCreateLinkModalOpen}
        isSubmitting={isCreatingLink}
        onClose={() => setIsCreateLinkModalOpen(false)}
        onSubmit={handleCreateGovernedLink}
      />
    </>
  );
}

function CampaignDrawerSparkline({
  points,
  accent,
}: {
  points: number[];
  accent: string;
}) {
  const hasData = points.some((point) => point > 0);
  return (
    <div className="gov-spark-wrap">
      <div className="gov-spark-row" aria-hidden>
        {points.map((point, index) => (
          <div
            key={`${point}-${index}`}
            className="gov-spark-bar"
            style={{
              height: `${point}%`,
              background: `linear-gradient(180deg, ${accent}, ${accent}66)`,
              opacity: point > 0 ? 0.9 : 0.18,
            }}
          />
        ))}
      </div>
      <div className="gov-spark-labels">
        <span>Top #1</span>
        <span>{hasData ? "by clicks" : "no data"}</span>
        <span>Top #12</span>
      </div>
    </div>
  );
}
