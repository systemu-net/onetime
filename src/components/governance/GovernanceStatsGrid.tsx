interface Stat {
  label: string;
  value: string | number;
  delta: string;
  dir: "up" | "down" | "neutral";
  icon: string;
  gradient: string;
}

interface GovernanceStatsGridProps {
  total: number;
  active: number;
  paused: number;
  expired: number;
  draft: number;
  totalClicks: number;
}

export function GovernanceStatsGrid({
  total,
  active,
  paused,
  expired,
  draft,
  totalClicks,
}: GovernanceStatsGridProps) {
  const activePct = total > 0 ? ((active / total) * 100).toFixed(0) : "0";

  const stats: Stat[] = [
    {
      label: "Total Links",
      value: total,
      delta: `${activePct}% active`,
      dir: "neutral",
      icon: "⊞",
      gradient: "linear-gradient(90deg,#7c3aed,#a855f7)",
    },
    {
      label: "Active Links",
      value: active,
      delta: `${activePct}% of portfolio`,
      dir: "neutral",
      icon: "◉",
      gradient: "linear-gradient(90deg,#10b981,#34d399)",
    },
    {
      label: "Paused Links",
      value: paused,
      delta: paused > 0 ? "traffic suspended" : "none paused",
      dir: paused > 0 ? "down" : "neutral",
      icon: "⏸",
      gradient: "linear-gradient(90deg,#f59e0b,#fbbf24)",
    },
    {
      label: "Expired Links",
      value: expired,
      delta: expired > 0 ? "past expiry date" : "none expired",
      dir: expired > 0 ? "down" : "neutral",
      icon: "⊘",
      gradient: "linear-gradient(90deg,#ef4444,#f87171)",
    },
    {
      label: "Draft Links",
      value: draft,
      delta: draft > 0 ? "not yet active" : "none in draft",
      dir: "neutral",
      icon: "◌",
      gradient: "linear-gradient(90deg,#6b7280,#9ca3af)",
    },
    {
      label: "Total Clicks",
      value: totalClicks.toLocaleString(),
      delta: "all-time traffic",
      dir: "up",
      icon: "⇗",
      gradient: "linear-gradient(90deg,#3b82f6,#60a5fa)",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-6 gap-3">
      {stats.map((s) => (
        <div
          key={s.label}
          className="relative overflow-hidden rounded-xl border border-neutral-200 dark:border-white/[0.06] bg-white dark:bg-neutral-900 p-5"
          style={{ "--accent-line": s.gradient } as React.CSSProperties}
        >
          {/* top colour bar */}
          <div
            className="absolute inset-x-0 top-0 h-0.5"
            style={{ background: s.gradient }}
          />
          <div className="text-[11px] font-medium uppercase tracking-[0.04em] text-neutral-500 dark:text-neutral-400">
            {s.label}
          </div>
          <div className="mt-1.5 text-3xl font-bold tracking-tight text-neutral-900 dark:text-white leading-none">
            {s.value}
          </div>
          <div
            className={`mt-1.5 text-xs flex items-center gap-1 ${
              s.dir === "up"
                ? "text-emerald-500"
                : s.dir === "down"
                  ? "text-red-400"
                  : "text-neutral-400"
            }`}
          >
            {s.dir === "up" ? "↑" : s.dir === "down" ? "↓" : "·"}
            {s.delta}
          </div>
          <div className="absolute right-4 top-4 text-[30px] opacity-10 pointer-events-none select-none">
            {s.icon}
          </div>
        </div>
      ))}
    </div>
  );
}
