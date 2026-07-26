import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api, type ReferralFunnel } from "../api";
import { useSession } from "../auth";
import ClassicShell from "../components/classic/ClassicShell";

// Admin-only referral funnel: clicks -> signups -> paid, per marketing channel.
//
// The three columns come from three unrelated places and are joined only by
// channel NAME (clicks are anonymous, so there is no per-person path through the
// funnel). The caveats under the table are not decoration — without them the
// numbers invite conclusions the data cannot support.

// LOCAL calendar date as YYYY-MM-DD.
//
// Not toISOString().slice(0, 10): that formats in UTC, so anywhere east of UTC the
// "today" it produces is yesterday for part of the day (and west of UTC, tomorrow).
// These strings feed <input type="date"> values and its `max`, which are local
// dates — a UTC string there both preselects the wrong day and can make the real
// today unselectable.
function localDate(d: Date): string {
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${month}-${day}`;
}

function isoDaysAgo(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return localDate(d);
}

const today = () => localDate(new Date());

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Why the range is validated before fetching rather than left to the server:
 *
 * a `type="date"` input can be CLEARED (value becomes "") and, in most browsers,
 * typed into directly — which bypasses min/max. Either produces a request the
 * backend answers rather than rejects: a blank `from` silently falls back to its
 * 30-day default, and an inverted range is clamped to a single day. The table
 * would then show a range that does not match what the inputs say, which is worse
 * than an error because it looks like data.
 *
 * ISO dates compare correctly as strings, so no Date parsing is needed.
 */
function rangeError(from: string, to: string): string | null {
  if (!DATE_PATTERN.test(from) || !DATE_PATTERN.test(to)) {
    return "Pick both a start and an end date.";
  }
  if (from > to) return "The start date is after the end date.";
  if (to > today()) return "The end date is in the future.";
  return null;
}

export default function ReferralsPage() {
  const navigate = useNavigate();
  const { loading: sessionLoading, profile } = useSession();

  const [from, setFrom] = useState(() => isoDaysAgo(29));
  const [to, setTo] = useState(today);
  const [data, setData] = useState<ReferralFunnel | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const isAdmin = profile?.role === "admin";

  // Non-admins (or signed-out) never see this surface. Enforced server-side too.
  useEffect(() => {
    if (sessionLoading) return;
    if (!profile) navigate("/login", { replace: true });
    else if (!isAdmin) navigate("/account", { replace: true });
  }, [sessionLoading, profile, isAdmin, navigate]);

  const invalidRange = rangeError(from, to);

  useEffect(() => {
    if (!isAdmin) return;
    // Don't ask the API to interpret a range the user hasn't finished typing.
    if (invalidRange) {
      setLoading(false);
      return;
    }
    let alive = true;
    setLoading(true);
    setError(null);
    const p = new URLSearchParams({ from, to });
    api<ReferralFunnel>(`/api/levelcode/v1/admin/referrals?${p.toString()}`)
      .then((d) => {
        if (!alive) return;
        setData(d);
        setLoading(false);
      })
      .catch(() => {
        if (!alive) return;
        setError("Couldn’t load the referral funnel.");
        setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [isAdmin, from, to, invalidRange]);

  if (sessionLoading || !isAdmin) {
    return (
      <ClassicShell>
        <main className="mx-auto max-w-5xl px-5 py-12" />
      </ClassicShell>
    );
  }

  const rows = data?.rows ?? [];

  return (
    <ClassicShell>
      <main className="mx-auto max-w-5xl px-5 py-12">
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <div>
            <h1 className="text-[28px] font-bold tracking-tight text-[var(--c-text)] sm:text-[32px]">
              Referrals
            </h1>
            <p className="mt-2 text-[14px] text-[var(--c-text3)]">
              clicks · signups · paid, per marketing channel
            </p>
          </div>
          <Link to="/admin" className="text-[14px] text-[var(--c-text2)] hover:text-[var(--c-text)]">
            ← System dashboard
          </Link>
        </div>

        {error ? <div className="classic-card mt-8 p-6 text-[14px] text-red-500">{error}</div> : null}

        {invalidRange ? (
          <div
            role="alert"
            className="mt-8 rounded-md border border-[#d19a66]/40 bg-[#d19a66]/[0.1] px-4 py-3 text-[14px] text-[var(--c-text)]"
          >
            {invalidRange} Showing the last loaded range below.
          </div>
        ) : null}

        {/* Date range */}
        <div className="mt-8 flex flex-wrap items-center gap-3">
          <DateInput label="from" value={from} max={to} onChange={setFrom} />
          <DateInput label="to" value={to} min={from} max={today()} onChange={setTo} />
          <div className="flex gap-2">
            {[
              { label: "7d", days: 6 },
              { label: "30d", days: 29 },
              { label: "90d", days: 89 },
            ].map((p) => (
              <button
                key={p.label}
                type="button"
                onClick={() => {
                  setFrom(isoDaysAgo(p.days));
                  setTo(today());
                }}
                className="rounded-md border border-[var(--c-line)] px-2.5 py-1.5 font-mono text-[12px] text-[var(--c-text2)] transition-colors hover:border-[var(--c-accent)] hover:text-[var(--c-text)]"
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Totals */}
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <Stat label="clicks" value={data?.totals.clicks} />
          <Stat label="signups" value={data?.totals.signups} />
          <Stat label="paid" value={data?.totals.paid} />
        </div>

        {/* The range the SERVER actually used, echoed back. The inputs are what you
            asked for; this is what is plotted — they can differ while a date is
            mid-edit, and the difference should never be invisible. */}
        {data ? (
          <p className="mt-3 font-mono text-[12px] text-[var(--c-text3)]">
            covering {data.from} → {data.to}
          </p>
        ) : null}

        {/* Funnel table */}
        <div className="classic-card mt-6 overflow-x-auto p-0">
          <table className="w-full min-w-[620px] border-collapse text-left font-mono text-[12px]">
            <thead className="text-[var(--c-text3)]">
              <tr className="border-b border-[var(--c-line)]">
                <th className="px-3 py-2 font-normal">channel</th>
                <th className="px-3 py-2 font-normal">handle</th>
                <th className="px-3 py-2 text-right font-normal">clicks</th>
                <th className="px-3 py-2 text-right font-normal">signups</th>
                <th className="px-3 py-2 text-right font-normal">paid</th>
                <th className="px-3 py-2 text-right font-normal">click → signup</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr
                  key={`${r.channel}-${r.handle ?? ""}`}
                  className="border-b border-[var(--c-line)] last:border-b-0 hover:bg-[var(--c-surface)]"
                >
                  <td className="px-3 py-2 text-[var(--c-text)]">{r.channel}</td>
                  <td className="px-3 py-2 text-[var(--c-text2)]">{r.handle ?? "—"}</td>
                  <td className="px-3 py-2 text-right tabular-nums text-[var(--c-text2)]">{r.clicks}</td>
                  <td className="px-3 py-2 text-right tabular-nums text-[var(--c-text)]">{r.signups}</td>
                  <td className="px-3 py-2 text-right tabular-nums text-[var(--c-text2)]">{r.paid}</td>
                  <td className="px-3 py-2 text-right tabular-nums text-[var(--c-text3)]">
                    {r.clicks > 0 ? `${((r.signups / r.clicks) * 100).toFixed(1)}%` : "—"}
                  </td>
                </tr>
              ))}
              {rows.length === 0 && !loading ? (
                <tr>
                  <td colSpan={6} className="px-3 py-8 text-center text-[var(--c-text3)]">
                    No referral activity in this range.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>

        {/* What the table is not telling you. */}
        <div className="mt-4 space-y-1.5 text-[12px] leading-relaxed text-[var(--c-text3)]">
          {data ? (
            <p>
              <strong className="font-semibold text-[var(--c-text2)]">
                {data.unattributed_signups}
              </strong>{" "}
              signup{data.unattributed_signups === 1 ? "" : "s"} in this range carried no channel —
              organic, or the visitor’s browser dropped the stored attribution. They are not in the
              table.
            </p>
          ) : null}
          <p>
            <strong className="font-semibold text-[var(--c-text2)]">paid</strong> counts people who
            signed up in this range and are on a paid plan <em>right now</em> — there is no
            “became paid” timestamp to measure conversions inside the range.
          </p>
          <p>
            <strong className="font-semibold text-[var(--c-text2)]">clicks</strong> are matched to a
            channel through the short link’s current destination and exclude bots. Editing a link’s
            destination re-attributes its past clicks.
          </p>
          <p>
            Clicks and signups are counted independently and joined only by channel name, so
            click&nbsp;→&nbsp;signup is a ratio between two populations, not a tracked journey.
          </p>
        </div>
      </main>
    </ClassicShell>
  );
}

function DateInput({
  label,
  value,
  min,
  max,
  onChange,
}: {
  label: string;
  value: string;
  min?: string;
  max?: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="flex items-center gap-2 font-mono text-[12px] text-[var(--c-text3)]">
      {label}
      <input
        type="date"
        value={value}
        min={min}
        max={max}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-md border border-[var(--c-line)] bg-[var(--c-bg)] px-2.5 py-1.5 font-mono text-[12px] text-[var(--c-text)] outline-none focus:border-[var(--c-accent)]"
      />
    </label>
  );
}

function Stat({ label, value }: { label: string; value?: number }) {
  return (
    <div className="classic-card p-5">
      <p className="classic-label">{label}</p>
      <p className="mt-1 text-[26px] font-bold tabular-nums text-[var(--c-text)]">
        {value === undefined ? "—" : value.toLocaleString("en-US")}
      </p>
    </div>
  );
}
