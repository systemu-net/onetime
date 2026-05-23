import type { IconType } from "react-icons";
import {
    LuCircleCheck,
    LuCirclePause,
    LuFilePenLine,
    LuHourglass,
    LuLink2,
    LuMousePointerClick,
} from "react-icons/lu";

interface Stat {
  label: string;
  value: string | number;
  delta: string;
  dir: "up" | "down" | "neutral";
  Icon: IconType;
  accent: string; // border + icon color
  accentBg: string; // icon tile background
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
      Icon: LuLink2,
      accent: "#7c3aed",
      accentBg: "rgba(124,58,237,0.10)",
    },
    {
      label: "Active Links",
      value: active,
      delta: `${activePct}% of portfolio live`,
      dir: "up",
      Icon: LuCircleCheck,
      accent: "#2a7a5c",
      accentBg: "rgba(42,122,92,0.10)",
    },
    {
      label: "Paused Links",
      value: paused,
      delta: paused > 0 ? "traffic suspended" : "none paused",
      dir: paused > 0 ? "down" : "neutral",
      Icon: LuCirclePause,
      accent: "#b5613c",
      accentBg: "rgba(181,97,60,0.10)",
    },
    {
      label: "Expired Links",
      value: expired,
      delta: expired > 0 ? "past expiry date" : "none expired",
      dir: expired > 0 ? "down" : "neutral",
      Icon: LuHourglass,
      accent: "#b54a31",
      accentBg: "rgba(181,74,49,0.10)",
    },
    {
      label: "Draft Links",
      value: draft,
      delta: draft > 0 ? "not yet active" : "none in draft",
      dir: "neutral",
      Icon: LuFilePenLine,
      accent: "#6a6a78",
      accentBg: "rgba(106,106,120,0.10)",
    },
    {
      label: "Total Clicks",
      value: totalClicks.toLocaleString(),
      delta: "all-time traffic",
      dir: "up",
      Icon: LuMousePointerClick,
      accent: "#2c5d8f",
      accentBg: "rgba(44,93,143,0.10)",
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3">
      {stats.map((s) => {
        const Icon = s.Icon;
        return (
          <div
            key={s.label}
            className="relative overflow-hidden rounded-xl sm:rounded-2xl border border-neutral-200/80 dark:border-white/[0.06] bg-white dark:bg-neutral-900 px-3 py-2.5 sm:px-5 sm:py-[18px] shadow-[0_1px_0_rgba(0,0,0,0.03),0_4px_14px_rgba(0,0,0,0.04)] transition-transform duration-150 hover:-translate-y-0.5"
          >
            {/* Top accent border */}
            <div
              className="absolute inset-x-0 top-0 h-[2px] sm:h-[3px]"
              style={{ background: s.accent }}
            />

            {/* Icon tile (top-right) */}
            <div
              className="absolute right-2 top-2 sm:right-4 sm:top-4 flex h-6 w-6 sm:h-9 sm:w-9 items-center justify-center rounded-md sm:rounded-[10px]"
              style={{ background: s.accentBg, color: s.accent }}
            >
              <Icon className="w-3.5 h-3.5 sm:w-[18px] sm:h-[18px]" strokeWidth={2} />
            </div>

            <div className="font-mono text-[10px] sm:text-[11px] uppercase tracking-[0.06em] sm:tracking-[0.08em] text-neutral-500 dark:text-neutral-400 pr-7 sm:pr-0">
              {s.label}
            </div>
            <div className="mt-1 sm:mt-2 text-[22px] sm:text-[34px] font-extrabold leading-none tracking-tight text-neutral-900 dark:text-white">
              {s.value}
            </div>
            <div
              className={`mt-1 sm:mt-2 flex items-center gap-1 text-[11px] sm:text-[12.5px] ${
                s.dir === "up"
                  ? "text-emerald-600 dark:text-emerald-400"
                  : s.dir === "down"
                    ? "text-red-500 dark:text-red-400"
                    : "text-neutral-500 dark:text-neutral-400"
              }`}
            >
              <span aria-hidden>
                {s.dir === "up" ? "↑" : s.dir === "down" ? "↓" : "·"}
              </span>
              <span className="truncate">{s.delta}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
