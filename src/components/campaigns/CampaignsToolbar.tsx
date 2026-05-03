import type { CampaignState } from "@/types/campaigns";

interface CampaignsToolbarProps {
  search: string;
  setSearch: (value: string) => void;
  stateFilter: "all" | CampaignState;
  setStateFilter: (value: "all" | CampaignState) => void;
  isPausing: boolean;
  onPauseAll: () => void;
  onCreate: () => void;
}

export function CampaignsToolbar({
  search,
  setSearch,
  stateFilter,
  setStateFilter,
  isPausing,
  onPauseAll,
  onCreate,
}: CampaignsToolbarProps) {
  const filters: Array<"all" | CampaignState> = [
    "all",
    "active",
    "paused",
    "expired",
    "archived",
  ];

  return (
    <div className="gov-campaign-toolbar">
      <div className="gov-campaign-toolbar-left">
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search campaigns"
          className="gov-field-input"
        />
        <div className="gov-chip-wrap">
          {filters.map((filter) => (
            <button
              key={filter}
              onClick={() => setStateFilter(filter)}
              className={`gov-chip ${stateFilter === filter ? "gov-chip-active" : ""}`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>
      <div className="gov-campaign-toolbar-actions">
        <button
          onClick={onPauseAll}
          disabled={isPausing}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg border border-neutral-300 dark:border-neutral-600 text-neutral-700 dark:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors disabled:opacity-60"
        >
          {isPausing ? "Pausing..." : "Pause All Active"}
        </button>
        <button
          onClick={onCreate}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg bg-violet-600 hover:bg-violet-500 text-white transition-colors"
        >
          + New Campaign
        </button>
      </div>
    </div>
  );
}
