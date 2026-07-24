import { useMemo, useState } from "react";
import type { Activity, ActivityDay } from "../api";

// GitHub-style contribution calendar for editor usage. Columns are weeks (Sunday-start),
// rows are weekdays; cell intensity scales with the day's request count. Clicking a day
// reveals its per-model breakdown; a per-model year summary sits below. Dates are handled
// in UTC so the grid keys line up with the backend's DATE(created_at) buckets.
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const LEVEL_BG = ["bg-rule/50", "bg-flame/25", "bg-flame/50", "bg-flame/75", "bg-flame"];

function ymd(d: Date): string {
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}-${String(d.getUTCDate()).padStart(2, "0")}`;
}

// Fixed thresholds (request counts) → 0..4. Stable regardless of the busiest day.
function level(count: number): number {
  if (count <= 0) return 0;
  if (count <= 2) return 1;
  if (count <= 6) return 2;
  if (count <= 14) return 3;
  return 4;
}

// Pinned locale + credit conversion, kept identical to AccountPage (and to CREDIT_LOCALE in the
// extension's chat.html) so one number never renders three ways across the product.
const LOCALE = "en-US";
const MICROS_PER_CREDIT = 10_000;

function fmtInt(n: number): string {
  return (n ?? 0).toLocaleString(LOCALE);
}
function fmtTokens(n: number): string {
  if (n >= 1_000_000) return `${+(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${+(n / 1_000).toFixed(0)}K`;
  return (n ?? 0).toLocaleString(LOCALE);
}
// Spend, in credits — the unit the balance above this panel is shown in. The API now sends RETAIL
// micro-$ for activity (it previously sent raw wire COST, which understated what the user actually
// spent), so these figures reconcile against the credits the dashboard reports as spent.
//
// Same shape as AccountPage's rate(): a day or a model can total well under one credit, and rounding
// that to "0" would read as free, so small amounts floor rather than disappear.
function fmtCost(micros: number): string {
  const c = (micros || 0) / MICROS_PER_CREDIT;
  if (!(c > 0)) return "0";
  if (c >= 10) return Math.round(c).toLocaleString(LOCALE);
  return c < 0.05 ? "<0.1" : c.toFixed(1);
}
function prettyDate(key: string): string {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}

type Week = { key: string | null; count: number; date: Date | null }[];

export default function ContributionsHeatmap({
  activity,
  year,
  years,
  onYear,
}: {
  activity: Activity | null;
  year: number;
  years: number[];
  onYear: (y: number) => void;
}) {
  const [selected, setSelected] = useState<string | null>(null);
  const days = activity?.days ?? {};

  // Build week-columns from the Sunday on/before Jan 1 to the Saturday on/after Dec 31.
  const { weeks, monthCols } = useMemo(() => {
    const first = new Date(Date.UTC(year, 0, 1));
    const start = new Date(first);
    start.setUTCDate(first.getUTCDate() - first.getUTCDay());
    const last = new Date(Date.UTC(year, 11, 31));
    const end = new Date(last);
    end.setUTCDate(last.getUTCDate() + (6 - last.getUTCDay()));

    const cols: Week[] = [];
    const months: (string | null)[] = [];
    const cur = new Date(start);
    let prevMonth = -1;
    while (cur <= end) {
      const col: Week = [];
      let topMonth: number | null = null;
      for (let r = 0; r < 7; r++) {
        const inYear = cur.getUTCFullYear() === year;
        if (r === 0) topMonth = inYear ? cur.getUTCMonth() : null;
        if (inYear) {
          const key = ymd(cur);
          col.push({ key, count: days[key]?.count ?? 0, date: new Date(cur) });
        } else {
          col.push({ key: null, count: 0, date: null });
        }
        cur.setUTCDate(cur.getUTCDate() + 1);
      }
      // Month label when this column introduces a new month (and there's room to read it).
      if (topMonth != null && topMonth !== prevMonth) {
        months.push(MONTHS[topMonth]);
        prevMonth = topMonth;
      } else {
        months.push(null);
      }
      cols.push(col);
    }
    return { weeks: cols, monthCols: months };
  }, [year, days]);

  const selectedDay: ActivityDay | null = selected ? days[selected] ?? null : null;
  const models = activity?.models ?? [];

  return (
    <div className="surface p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="lineno">activity</div>
          <div className="mt-1 font-display text-lg font-semibold tracking-tightest">
            {fmtInt(activity?.total ?? 0)} request{(activity?.total ?? 0) === 1 ? "" : "s"} in {year}
          </div>
        </div>
        {years.length > 1 ? (
          <div className="flex flex-wrap gap-1">
            {years.map((y) => (
              <button
                key={y}
                type="button"
                onClick={() => {
                  setSelected(null);
                  onYear(y);
                }}
                className={`rounded-md px-2.5 py-1 font-mono text-[12px] transition-colors ${
                  y === year ? "bg-flame text-white" : "text-sub hover:bg-rule/60"
                }`}
              >
                {y}
              </button>
            ))}
          </div>
        ) : null}
      </div>

      {/* Calendar — scrolls horizontally on narrow viewports */}
      <div className="mt-5 overflow-x-auto">
        <div className="inline-flex flex-col gap-1">
          {/* Month labels */}
          <div className="flex gap-[3px] pl-8">
            {monthCols.map((m, i) => (
              <div key={i} className="w-[11px] font-mono text-[10px] text-faint">
                {m ? <span className="relative -left-[1px] whitespace-nowrap">{m}</span> : null}
              </div>
            ))}
          </div>
          <div className="flex gap-[3px]">
            {/* Weekday labels (Mon/Wed/Fri) */}
            <div className="mr-1 flex w-7 flex-col gap-[3px]">
              {["", "Mon", "", "Wed", "", "Fri", ""].map((d, i) => (
                <div key={i} className="h-[11px] font-mono text-[9px] leading-[11px] text-faint">
                  {d}
                </div>
              ))}
            </div>
            {/* Week columns */}
            {weeks.map((col, ci) => (
              <div key={ci} className="flex flex-col gap-[3px]">
                {col.map((cell, ri) => {
                  if (!cell.key) return <div key={ri} className="h-[11px] w-[11px]" />;
                  const lvl = level(cell.count);
                  const isSel = selected === cell.key;
                  const top = days[cell.key]?.models?.[0];
                  const title =
                    cell.count > 0
                      ? `${prettyDate(cell.key)} · ${cell.count} request${cell.count === 1 ? "" : "s"}${
                          top ? ` · ${modelShort(top.model)} ${top.count}` : ""
                        }`
                      : `${prettyDate(cell.key)} · no activity`;
                  return (
                    <button
                      key={ri}
                      type="button"
                      title={title}
                      onClick={() => setSelected(isSel ? null : cell.key)}
                      className={`h-[11px] w-[11px] rounded-[2px] ${LEVEL_BG[lvl]} ${
                        isSel ? "ring-1 ring-ink ring-offset-1" : ""
                      } transition-colors hover:ring-1 hover:ring-ink/40`}
                    />
                  );
                })}
              </div>
            ))}
          </div>
          {/* Legend */}
          <div className="mt-1 flex items-center gap-1 pl-8 font-mono text-[10px] text-faint">
            <span className="mr-1">Less</span>
            {LEVEL_BG.map((bg, i) => (
              <span key={i} className={`h-[11px] w-[11px] rounded-[2px] ${bg}`} />
            ))}
            <span className="ml-1">More</span>
          </div>
        </div>
      </div>

      {/* Selected-day per-model detail */}
      {selected && selectedDay ? (
        <div className="mt-6 rounded-lg border border-rule bg-card p-4">
          <div className="flex items-baseline justify-between">
            <div className="font-mono text-[12px] text-sub">{prettyDate(selected)}</div>
            <div className="font-mono text-[12px] text-faint">
              {selectedDay.count} req · {fmtTokens(selectedDay.input)} in · {fmtTokens(selectedDay.output)} out ·{" "}
              {fmtCost(selectedDay.cost_micros)} credits
            </div>
          </div>
          <ul className="mt-3 space-y-1.5">
            {selectedDay.models.map((m) => (
              <li key={m.model} className="flex items-center justify-between gap-3 font-mono text-[12px]">
                <span className="truncate text-ink">{modelShort(m.model)}</span>
                <span className="whitespace-nowrap text-faint">
                  {m.count} · {fmtTokens(m.input + m.output)} tok
                </span>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <p className="mt-4 font-mono text-[11px] text-faint">Click a day to see its per-model breakdown.</p>
      )}

      {/* Per-model year summary */}
      {models.length ? (
        <div className="mt-6">
          <div className="lineno mb-3">by model · {year}</div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[520px] border-collapse text-left font-mono text-[12px]">
              <thead className="text-faint">
                <tr className="border-b border-rule">
                  <th className="py-1.5 pr-3 font-normal">model</th>
                  <th className="py-1.5 px-3 text-right font-normal">requests</th>
                  <th className="py-1.5 px-3 text-right font-normal">input</th>
                  <th className="py-1.5 px-3 text-right font-normal">output</th>
                  <th className="py-1.5 px-3 text-right font-normal">credits</th>
                  <th className="py-1.5 pl-3 text-right font-normal">reactions</th>
                </tr>
              </thead>
              <tbody>
                {models.map((m) => (
                  <tr key={m.model} className="border-b border-rule/60">
                    <td className="py-1.5 pr-3 text-ink">{modelShort(m.model)}</td>
                    <td className="py-1.5 px-3 text-right tabular-nums text-sub">{fmtInt(m.count)}</td>
                    <td className="py-1.5 px-3 text-right tabular-nums text-sub">{fmtTokens(m.input)}</td>
                    <td className="py-1.5 px-3 text-right tabular-nums text-sub">{fmtTokens(m.output)}</td>
                    <td className="py-1.5 px-3 text-right tabular-nums text-sub">{fmtCost(m.cost_micros)}</td>
                    <td className="py-1.5 pl-3 text-right tabular-nums text-faint">
                      <span className="inline-flex items-center justify-end gap-3">
                        <span className="inline-flex items-center gap-1">
                          <ThumbUp className="text-sub" /> {m.up}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <ThumbDown className="text-sub" /> {m.down}
                        </span>
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}
    </div>
  );
}

// Drop the provider prefix for display: "moonshotai/kimi-k2.7-code" -> "kimi-k2.7-code".
function modelShort(model: string): string {
  const s = model || "unknown";
  const i = s.indexOf("/");
  return i >= 0 ? s.slice(i + 1) : s;
}

// Thumbs share the exact glyphs the editor uses on the assistant reaction bar, so the
// dashboard's per-model reaction column reads the same as where the votes are cast.
function ThumbUp({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" width="13" height="13" fill="currentColor" aria-hidden="true" className={className}>
      <path d="M12.999 6.00002H10.672L11.207 4.21802C11.278 3.98102 11.314 3.73902 11.314 3.49602C11.314 2.12002 10.192 0.999023 8.81298 0.999023C8.42998 0.999023 8.08498 1.21202 7.91398 1.55402L5.82998 5.72202C5.74498 5.89202 5.57398 5.99802 5.38298 5.99802H3.00098C1.89798 5.99802 1.00098 6.89502 1.00098 7.99802V12.998C1.00098 14.101 1.89798 14.998 3.00098 14.998H11.163C12.727 14.998 13.283 13.796 13.565 12.893L14.908 8.59602C14.969 8.40102 15 8.19902 15 7.99602C15 6.89402 14.103 5.99802 12.999 5.99802V6.00002ZM1.99998 13V8.00002C1.99998 7.44902 2.44898 7.00002 2.99998 7.00002H3.99998V14H2.99998C2.44898 14 1.99998 13.551 1.99998 13ZM13.954 8.29802L12.611 12.596C12.247 13.761 11.769 13.999 11.163 13.999H5.00098V6.99902H5.38298C5.95498 6.99902 6.46898 6.68102 6.72498 6.17002L8.80898 2.00202C8.80898 2.00202 8.81098 2.00002 8.81298 2.00002C9.64098 2.00002 10.314 2.67102 10.314 3.49702C10.314 3.64202 10.292 3.78802 10.249 3.93202L9.52098 6.35702C9.47598 6.50802 9.50398 6.67202 9.59898 6.79902C9.69398 6.92602 9.84198 7.00102 9.99998 7.00102H12.999C13.551 7.00102 14 7.44802 14 7.99902C14 8.10002 13.984 8.20102 13.954 8.30002V8.29802Z" />
    </svg>
  );
}

function ThumbDown({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" width="13" height="13" fill="currentColor" aria-hidden="true" className={className}>
      <path d="M13 1H4.838C3.274 1 2.717 2.202 2.435 3.105L1.092 7.404C1.031 7.6 1 7.801 1 8.002C1 9.104 1.897 10 3.001 10H5.328L4.794 11.781C4.723 12.016 4.687 12.26 4.687 12.504C4.687 13.88 5.809 15.001 7.189 15.001C7.571 15.001 7.915 14.789 8.087 14.446L10.171 10.277C10.256 10.107 10.427 10.001 10.618 10.001H13C14.103 10.001 15 9.104 15 8.001V3C15 1.897 14.103 1 13 1ZM9.276 9.829L7.193 13.996L7.188 13.999C6.36 13.999 5.686 13.328 5.686 12.502C5.686 12.356 5.707 12.21 5.75 12.067L6.478 9.642C6.524 9.491 6.495 9.327 6.401 9.2C6.306 9.073 6.158 8.998 6 8.998H3.001C2.449 8.998 2 8.551 2 8C2 7.9 2.016 7.799 2.047 7.699L3.39 3.401C3.753 2.236 4.232 1.998 4.838 1.998H11V8.998H10.618C10.046 8.998 9.531 9.316 9.276 9.827V9.829ZM14 8C14 8.551 13.552 9 13 9H12V2H13C13.552 2 14 2.449 14 3V8Z" />
    </svg>
  );
}
