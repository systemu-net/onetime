import { useNotification } from "@/Notifications";
import { fetchCampaigns } from "@/apis/campaigns";
import {
    createGovernedLink,
    fetchGovernanceLinks,
    pauseAllGovernedLinks,
} from "@/apis/governance";
import { getQrCodes } from "@/apis/qr_codes";
import { Heading } from "@/components/elements/heading";
import { GovernanceDrawer } from "@/components/governance/GovernanceDrawer";
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
} from "@/types/governance";
import { useCallback, useEffect, useState } from "react";
import { useCookies } from "react-cookie";
import { useLocation, useNavigate } from "react-router-dom";

// Import governance-specific design tokens (badges, rule pills, etc.)
import "@/components/governance/governance.css";

export default function GovernancePage() {
  const [cookies] = useCookies(["token"]);
  const token = cookies.token as string;
  const { addNotification } = useNotification();
  const location = useLocation();
  const navigate = useNavigate();

  const [links, setLinks] = useState<GovernanceLink[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<GovernanceLink | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isPausingAll, setIsPausingAll] = useState(false);

  const loadLinks = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const [items, campaignList, qrCodes] = await Promise.all([
        fetchGovernanceLinks(token),
        fetchCampaigns(token).catch(() => []),
        getQrCodes(token).catch(() => []),
      ]);
      const campaignMap = new Map(
        campaignList.map((c) => [c.id, { name: c.name, color: c.accentColor }]),
      );
      const qrMap = new Map(
        (qrCodes as QrCode[])
          .filter((qr) => qr?.link?.lookup_code)
          .map((qr) => [qr.link.lookup_code, qr.image_url]),
      );
      setCampaigns(campaignList);
      const enriched = items.map((link) => {
        const qrImageUrl = qrMap.get(link.lookup_code) ?? null;
        if (link.linkCampaignId == null) {
          return {
            ...link,
            qrImageUrl,
          };
        }
        const meta = campaignMap.get(link.linkCampaignId);
        if (!meta) {
          return {
            ...link,
            qrImageUrl,
          };
        }
        return {
          ...link,
          campaign: meta.name,
          linkCampaignColor: meta.color ?? null,
          qrImageUrl,
        };
      });
      setLinks(enriched);
    } catch (err) {
      onToast(`Failed to load links: ${(err as Error).message}`, "error");
    } finally {
      setLoading(false);
    }
  }, [token]); // eslint-disable-line react-hooks/exhaustive-deps

  // Wrap addNotification so child components can call a simpler API
  const onToast = useCallback(
    (msg: string, type: "success" | "info" | "error" | "warning" = "info") => {
      addNotification(msg, type);
    },
    [addNotification],
  );

  // Load all governed links on mount
  useEffect(() => {
    loadLinks();
  }, [loadLinks]);

  // Allow deep-linking from campaigns drawer: /governance?lookup=<lookup_code>
  useEffect(() => {
    if (loading || links.length === 0) return;

    const query = new URLSearchParams(location.search);
    const lookup = query.get("lookup") ?? query.get("lookup_code");
    if (!lookup) return;

    const target = links.find((link) => link.lookup_code === lookup);
    if (!target) return;

    setSelected(target);
    navigate(GOVERNANCE_ROUTE, { replace: true });
  }, [loading, links, location.search, navigate]);

  const updateLink = useCallback(
    (id: string, patch: Partial<GovernanceLink>) => {
      setLinks((ls) => ls.map((l) => (l.id === id ? { ...l, ...patch } : l)));
      setSelected((sel) => (sel?.id === id ? { ...sel, ...patch } : sel));
    },
    [],
  );

  const removeLink = useCallback((id: string) => {
    setLinks((ls) => ls.filter((l) => l.id !== id));
    setSelected((sel) => (sel?.id === id ? null : sel));
  }, []);

  const stats = {
    total: links.length,
    active: links.filter((l) => l.state === "active").length,
    paused: links.filter((l) => l.state === "paused").length,
    totalClicks: links.reduce((s, l) => s + l.clicks, 0),
  };

  const handleCreateGovernedLink = useCallback(
    async (payload: CreateGovernedLinkPayload) => {
      if (!token) {
        onToast("Missing auth token. Please log in again.", "error");
        return;
      }

      setIsCreating(true);
      try {
        const created = await createGovernedLink(token, payload);
        setLinks((current) => [created, ...current]);
        setIsCreateOpen(false);
        onToast("Governed link created successfully.", "success");
      } catch (err) {
        onToast(`Create failed: ${(err as Error).message}`, "error");
      } finally {
        setIsCreating(false);
      }
    },
    [token, onToast],
  );

  const handlePauseAll = useCallback(async () => {
    if (!token) {
      onToast("Missing auth token. Please log in again.", "error");
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
      <div className="px-4 sm:px-6 lg:px-8 pb-10">
        {/* Page header */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div>
            <Heading className="text-2xl font-bold">Link Governance</Heading>
            <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
              Real-time lifecycle control for all distributed links
            </p>
          </div>
          <div className="flex gap-2 ml-auto">
            <button
              onClick={handlePauseAll}
              disabled={isPausingAll}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg border border-neutral-300 dark:border-neutral-600 text-neutral-700 dark:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors disabled:opacity-60"
            >
              {isPausingAll ? "Pausing..." : "⏸ Pause All"}
            </button>
            <button
              onClick={() => setIsCreateOpen(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg bg-violet-600 hover:bg-violet-500 text-white transition-colors"
            >
              + New Governed Link
            </button>
          </div>
        </div>

        {/* Loading state */}
        {loading && (
          <div className="flex items-center justify-center py-16 text-sm text-neutral-400">
            <span className="animate-pulse">Loading governed links…</span>
          </div>
        )}

        {!loading && (
          <div className="flex flex-col gap-6">
            {/* Stats */}
            <GovernanceStatsGrid {...stats} />

            {/* Table */}
            <GovernanceLinksTable
              links={links}
              campaigns={campaigns}
              onSelect={setSelected}
              onUpdate={updateLink}
              onRemove={removeLink}
              onToast={onToast}
            />
          </div>
        )}
      </div>

      {/* Detail drawer (portal-like, fixed positioning) */}
      {selected && (
        <GovernanceDrawer
          link={selected}
          onClose={() => setSelected(null)}
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
