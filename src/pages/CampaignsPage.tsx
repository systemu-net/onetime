import {
  createCampaign,
  deleteCampaign,
  fetchCampaign,
  fetchCampaigns,
  getCampaignType,
  pauseCampaign,
  resumeCampaign,
  updateCampaign,
} from "@/apis/campaigns";
import { CampaignDrawer } from "@/components/campaigns/CampaignDrawer";
import { CampaignsInsightsPanel } from "@/components/campaigns/CampaignsInsightsPanel";
import { CampaignsList } from "@/components/campaigns/CampaignsList";
import { CampaignsStatsGrid } from "@/components/campaigns/CampaignsStatsGrid";
import { NewCampaignModal } from "@/components/campaigns/NewCampaignModal";
import MainLayout from "@/components/layouts/MainLayout";
import { useNotification } from "@/Notifications";
import type {
  Campaign,
  CampaignCreatePayload,
  CampaignState,
  CampaignUpdatePayload,
} from "@/types/campaigns";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useCookies } from "react-cookie";

import "@/components/campaigns/campaigns.css";
import "@/components/governance/governance.css";

const STATE_FILTERS: ("all" | CampaignState)[] = [
  "all",
  "active",
  "paused",
  "archived",
  "expired",
];

export default function CampaignsPage() {
  const [cookies] = useCookies(["token"]);
  const token = cookies.token as string;
  const { addNotification } = useNotification();

  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Campaign | null>(null);
  const [search, setSearch] = useState("");
  const [stateFilter, setStateFilter] = useState<"all" | CampaignState>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [checkedIds, setCheckedIds] = useState<Set<number>>(new Set());
  const [isPausing, setIsPausing] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const notify = useCallback(
    (
      message: string,
      type: "success" | "info" | "error" | "warning" = "info",
    ) => {
      addNotification(message, type);
    },
    [addNotification],
  );

  const loadCampaigns = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const items = await fetchCampaigns(token);
      setCampaigns(items);
    } catch (error) {
      notify(`Failed to load campaigns: ${(error as Error).message}`, "error");
    } finally {
      setLoading(false);
    }
  }, [token, notify]);

  useEffect(() => {
    loadCampaigns();
  }, [loadCampaigns]);

  useEffect(() => {
    if (!selected || !token) return;

    fetchCampaign(token, selected.id)
      .then((fullCampaign) => {
        setCampaigns((current) =>
          current.map((campaign) =>
            campaign.id === fullCampaign.id
              ? { ...campaign, ...fullCampaign }
              : campaign,
          ),
        );
        setSelected((current) =>
          current && current.id === fullCampaign.id ? fullCampaign : current,
        );
      })
      .catch(() => {
        // Keep drawer usable even if details refresh fails.
      });
  }, [selected?.id, token]);

  const filteredCampaigns = useMemo(() => {
    return campaigns.filter((campaign) => {
      if (stateFilter !== "all" && campaign.state !== stateFilter) return false;
      if (typeFilter !== "all" && getCampaignType(campaign.name) !== typeFilter)
        return false;
      if (search.trim().length > 0) {
        const query = search.trim().toLowerCase();
        const inName = campaign.name.toLowerCase().includes(query);
        const inDescription = campaign.description
          .toLowerCase()
          .includes(query);
        if (!inName && !inDescription) return false;
      }
      return true;
    });
  }, [campaigns, search, stateFilter, typeFilter]);

  const governedLinks = useMemo(
    () => campaigns.reduce((sum, campaign) => sum + campaign.linksCount, 0),
    [campaigns],
  );

  const activeCampaigns = useMemo(
    () => campaigns.filter((campaign) => campaign.state === "active").length,
    [campaigns],
  );

  const totalClicks = useMemo(
    () => campaigns.reduce((sum, campaign) => sum + campaign.totalClicks, 0),
    [campaigns],
  );

  const maxClicks = useMemo(
    () => Math.max(1, ...campaigns.map((c) => c.totalClicks)),
    [campaigns],
  );

  const toggleCheck = (id: number) => {
    setCheckedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handlePauseToggle = async (campaign: Campaign) => {
    if (!token) return;

    try {
      if (campaign.state === "paused") {
        await resumeCampaign(
          token,
          campaign.id,
          "Resumed from campaigns dashboard",
        );
        setCampaigns((current) =>
          current.map((item) =>
            item.id === campaign.id ? { ...item, state: "active" } : item,
          ),
        );
        setSelected((current) =>
          current && current.id === campaign.id
            ? { ...current, state: "active" }
            : current,
        );
        notify(`Campaign "${campaign.name}" resumed.`, "success");
      } else {
        await pauseCampaign(
          token,
          campaign.id,
          "Paused from campaigns dashboard",
        );
        setCampaigns((current) =>
          current.map((item) =>
            item.id === campaign.id ? { ...item, state: "paused" } : item,
          ),
        );
        setSelected((current) =>
          current && current.id === campaign.id
            ? { ...current, state: "paused" }
            : current,
        );
        notify(`Campaign "${campaign.name}" paused.`, "info");
      }
    } catch (error) {
      notify((error as Error).message, "error");
    }
  };

  const handlePauseAll = async () => {
    if (!token) return;

    const active = campaigns.filter((campaign) => campaign.state === "active");
    if (active.length === 0) {
      notify("No active campaigns to pause.", "info");
      return;
    }

    setIsPausing(true);
    try {
      await Promise.all(
        active.map((campaign) =>
          pauseCampaign(
            token,
            campaign.id,
            "Bulk paused from campaigns dashboard",
          ),
        ),
      );
      setCampaigns((current) =>
        current.map((campaign) =>
          campaign.state === "active"
            ? { ...campaign, state: "paused" }
            : campaign,
        ),
      );
      setSelected((current) =>
        current && current.state === "active"
          ? { ...current, state: "paused" }
          : current,
      );
      notify(`Paused ${active.length} active campaigns.`, "success");
    } catch (error) {
      notify(`Bulk pause failed: ${(error as Error).message}`, "error");
    } finally {
      setIsPausing(false);
    }
  };

  const handleCreate = async (payload: CampaignCreatePayload) => {
    if (!token) return;

    try {
      const created = await createCampaign(token, payload);
      setCampaigns((current) => [created, ...current]);
      notify("Campaign created successfully.", "success");
    } catch (error) {
      notify(`Create failed: ${(error as Error).message}`, "error");
      throw error;
    }
  };

  const handleDelete = async (campaign: Campaign) => {
    if (!token) return;

    try {
      await deleteCampaign(token, campaign.id);
      setCampaigns((current) =>
        current.filter((item) => item.id !== campaign.id),
      );
      setSelected((current) => (current?.id === campaign.id ? null : current));
      notify(`Campaign "${campaign.name}" deleted.`, "success");
    } catch (error) {
      notify(`Delete failed: ${(error as Error).message}`, "error");
    }
  };

  const handleSaveFromDrawer = async (
    campaignId: number,
    payload: CampaignUpdatePayload,
  ) => {
    if (!token) return;

    const updated = await updateCampaign(token, campaignId, payload);
    setCampaigns((current) =>
      current.map((campaign) =>
        campaign.id === campaignId ? { ...campaign, ...updated } : campaign,
      ),
    );
    setSelected((current) =>
      current && current.id === campaignId
        ? { ...current, ...updated }
        : current,
    );
    notify("Campaign updated.", "success");
  };

  const handleDeleteFromDrawer = async (campaignId: number) => {
    if (!token) return;

    await deleteCampaign(token, campaignId);
    setCampaigns((current) =>
      current.filter((campaign) => campaign.id !== campaignId),
    );
    setSelected((current) => (current?.id === campaignId ? null : current));
    notify("Campaign deleted.", "success");
  };

  const TYPE_FILTERS = [
    "all",
    "launch",
    "sale",
    "event",
    "content",
    "retargeting",
    "affiliate",
  ];

  return (
    <MainLayout>
      <div className="px-4 sm:px-6 lg:px-8 pb-10">
        {/* Page header */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div>
            <h1
              style={{
                fontFamily: "'Syne', sans-serif",
                fontWeight: 700,
                fontSize: 18,
                letterSpacing: "-0.3px",
              }}
              className="text-neutral-900 dark:text-white"
            >
              Campaigns
            </h1>
            <p className="mt-0.5 text-xs text-neutral-400">
              Group, govern, and measure distributed link campaigns
            </p>
          </div>
          <div className="flex gap-2.5 items-center">
            <button
              onClick={handlePauseAll}
              disabled={isPausing}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-[13px] font-medium rounded-lg border border-neutral-300 dark:border-neutral-600 text-neutral-700 dark:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors disabled:opacity-60"
            >
              {isPausing ? "Pausing…" : "⏸ Pause All Active"}
            </button>
            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-[13px] font-medium rounded-lg bg-violet-600 hover:bg-violet-500 text-white transition-colors"
              style={{
                background: "linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)",
                boxShadow: "0 0 20px rgba(124,58,237,0.3)",
              }}
            >
              + New Campaign
            </button>
          </div>
        </div>

        {loading && (
          <div className="flex items-center justify-center py-16 text-sm text-neutral-400">
            <span className="animate-pulse">Loading campaigns...</span>
          </div>
        )}

        {!loading && (
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            {/* 5-card stats */}
            <CampaignsStatsGrid
              totalCampaigns={campaigns.length}
              activeCampaigns={activeCampaigns}
              governedLinks={governedLinks}
              totalClicks={totalClicks}
            />

            {/* Two-column layout */}
            <div className="cc-two-col">
              {/* Left: filters + cards */}
              <div>
                {/* Toolbar */}
                <div className="cc-toolbar">
                  <div className="cc-search-wrap">
                    <span className="cc-search-icon">⌕</span>
                    <input
                      className="cc-search-input"
                      placeholder="Search campaigns…"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                    />
                  </div>
                  {STATE_FILTERS.map((s) => (
                    <button
                      key={s}
                      className={`cc-filter-chip${stateFilter === s ? " cc-chip-on" : ""}`}
                      onClick={() => setStateFilter(s as "all" | CampaignState)}
                    >
                      {s.charAt(0).toUpperCase() + s.slice(1)}
                    </button>
                  ))}
                  <div className="cc-toolbar-right">
                    {TYPE_FILTERS.slice(1).map((t) => (
                      <button
                        key={t}
                        className={`cc-filter-chip${typeFilter === t ? " cc-chip-on" : ""}`}
                        onClick={() =>
                          setTypeFilter((prev) => (prev === t ? "all" : t))
                        }
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Campaign cards */}
                <CampaignsList
                  campaigns={filteredCampaigns}
                  selectedId={selected?.id ?? null}
                  maxClicks={maxClicks}
                  checkedIds={checkedIds}
                  onSelect={setSelected}
                  onPauseToggle={handlePauseToggle}
                  onToggleCheck={toggleCheck}
                />
              </div>

              {/* Right: insights panel */}
              <CampaignsInsightsPanel campaigns={campaigns} />
            </div>
          </div>
        )}
      </div>

      {selected && (
        <CampaignDrawer
          campaign={selected}
          onClose={() => setSelected(null)}
          onSave={handleSaveFromDrawer}
          onDelete={handleDeleteFromDrawer}
          onToast={notify}
        />
      )}

      <NewCampaignModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreate={handleCreate}
      />
    </MainLayout>
  );
}
