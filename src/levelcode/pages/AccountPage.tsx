import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api, navigateTo, type AccountModels, type AccountUsage, type Activity } from "../api";
import { useSession } from "../auth";
import ClassicShell from "../components/classic/ClassicShell";
import ContributionsHeatmap from "./ContributionsHeatmap";
import { fmtCredits, fmtCreditAmount, toCredits, LOCALE } from "../credits";

// Usage dashboard (SPEC §8 / §3 GET /account/usage). Session-gated: redirects to
// /ai/login when the Devise session probe comes back empty.
export default function AccountPage() {
  const navigate = useNavigate();
  const { loading: sessionLoading, profile } = useSession();
  const [usage, setUsage] = useState<AccountUsage | null>(null);
  const [models, setModels] = useState<AccountModels | null>(null);
  const [activity, setActivity] = useState<Activity | null>(null);
  const [activityYear, setActivityYear] = useState<number>(new Date().getFullYear());
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!sessionLoading && !profile) navigate("/login", { replace: true });
  }, [sessionLoading, profile, navigate]);

  useEffect(() => {
    if (!profile) return;
    let alive = true;
    api<AccountUsage>("/api/levelcode/v1/account/usage")
      .then((u) => {
        if (alive) setUsage(u);
      })
      .catch(() => {
        if (alive) setError("We couldn’t load your usage right now. Please try again shortly.");
      });
    return () => {
      alive = false;
    };
  }, [profile]);

  // Model roster + credit balance (the Cursor-class lineup with per-model turns-left).
  useEffect(() => {
    if (!profile) return;
    let alive = true;
    api<AccountModels>("/api/levelcode/v1/account/models")
      .then((m) => {
        if (alive) setModels(m);
      })
      .catch(() => {
        /* non-critical — the roster section just hides */
      });
    return () => {
      alive = false;
    };
  }, [profile]);

  // Contribution activity — refetched when the selected year changes.
  useEffect(() => {
    if (!profile) return;
    let alive = true;
    api<Activity>(`/api/levelcode/v1/account/activity?year=${activityYear}`)
      .then((a) => {
        if (alive) setActivity(a);
      })
      .catch(() => {
        /* non-critical — the heatmap just stays empty */
      });
    return () => {
      alive = false;
    };
  }, [profile, activityYear]);

  async function manageBilling() {
    try {
      const d = await api<{ url?: string }>("/ai/billing", { method: "POST" });
      if (d.url) navigateTo(d.url);
    } catch {
      setError("Could not open billing. Please try again.");
    }
  }

  async function signOut() {
    try {
      await api("/ai/signout", { method: "POST" });
    } catch {
      /* ignore — clear locally regardless */
    }
    navigate("/login", { replace: true });
  }

  // While the session resolves (or is absent, pre-redirect), keep the frame.
  if (sessionLoading || !profile) {
    return (
      <ClassicShell>
        <main className="mx-auto max-w-4xl px-5 py-12" />
      </ClassicShell>
    );
  }

  const inPct = usage ? pct(usage.input_used, usage.input_cap) : 0;
  const outPct = usage ? pct(usage.output_used, usage.output_cap) : 0;

  return (
    <ClassicShell>
      <main className="mx-auto max-w-4xl px-5 py-12">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-[28px] font-bold tracking-tight text-[var(--c-text)] sm:text-[32px]">
              {profile.name ? `Hi, ${profile.name}` : "Your account"}
            </h1>
            {profile.email ? <p className="mt-2 font-mono text-[13px] text-[var(--c-text3)]">{profile.email}</p> : null}
          </div>
          <span className="rounded-[3px] border border-[var(--c-line)] bg-[var(--c-surface)] px-2.5 py-1 font-mono text-[12px] text-[var(--c-text2)]">
            plan · {usage?.plan ?? profile.plan ?? "free"}
          </span>
        </div>

        {error ? (
          <div className="classic-card mt-10 p-8 text-[15px] text-[var(--c-text2)]">{error}</div>
        ) : usage ? (
          <div className="mt-10 grid gap-5 sm:grid-cols-2">
            <UsageMeter label="Input tokens" used={usage.input_used} cap={usage.input_cap} pct={inPct} />
            <UsageMeter label="Output tokens" used={usage.output_used} cap={usage.output_cap} pct={outPct} />

            <div className="classic-card p-6 sm:col-span-2">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <div className="classic-label">billing period resets</div>
                  <div className="mt-1 text-lg font-semibold text-[var(--c-text)]">{formatDate(usage.period_end)}</div>
                  <div className="mt-1 font-mono text-[12px] text-[var(--c-text3)]">overage policy · {usage.overage_policy}</div>
                </div>
                <div className="flex flex-wrap gap-3">
                  <button type="button" onClick={manageBilling} className="classic-button--quiet">
                    Manage billing
                  </button>
                  <Link to="/pricing" className="classic-button">
                    Upgrade
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ) : null}

        {models && models.models.length ? <CreditsRoster models={models} /> : null}

        <div className="mt-6">
          <ContributionsHeatmap
            activity={activity}
            year={activityYear}
            years={activity?.years ?? [activityYear]}
            onYear={setActivityYear}
          />
        </div>

        <button
          type="button"
          onClick={signOut}
          className="mt-10 text-[13px] text-[var(--c-accent)] hover:underline"
        >
          Sign out
        </button>
      </main>
    </ClassicShell>
  );
}

// Credit balance meter + the plan's model roster with credit multipliers + ≈ turns-left.
function CreditsRoster({ models }: { models: AccountModels }) {
  const full = models.budget_micros || 0;
  // Meter against what's usable NOW (the unlocked ceiling), not the full monthly budget — so the bar
  // matches enforcement. With rolling windows off, ceiling == full and this reads exactly as before.
  const ceiling = models.ceiling_micros ?? full;
  const spent = models.spent_micros || 0;
  const remaining = models.credits_remaining_micros || 0;
  const tranched = ceiling < full;
  const unlockAt = models.next_unlock_at ? new Date(models.next_unlock_at) : null;
  const pct = ceiling > 0 ? Math.min(Math.round((spent / ceiling) * 100), 100) : 0;
  // Credit formatting lives in ../credits, shared with the activity panel below — the two must render
  // the same figure identically, and a comment promising that is not enforcement.
  const credits = fmtCredits;
  // A per-turn price of zero means "no price", not "free", so it reads as an em dash here rather than
  // the "0" fmtCreditAmount returns for a genuinely zero SPEND.
  const rate = (m: number) => (toCredits(m) > 0 ? fmtCreditAmount(m) : "—");
  const short = (id: string) => (id.includes("/") ? id.slice(id.indexOf("/") + 1) : id);

  return (
    <div className="classic-card mt-5 p-6">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <div className="classic-label">{tranched ? "usage available now" : "compute credits"}</div>
        <div className="font-mono text-[12px] tabular-nums text-[var(--c-text2)]">
          {credits(spent)} / {credits(ceiling)} · {pct}%
        </div>
      </div>
      <div className="mt-1 text-2xl font-semibold tracking-tight tabular-nums text-[var(--c-text)]">
        {credits(remaining)}
        <span className="text-sm font-normal text-[var(--c-text3)]">
          {" "}
          credits {tranched ? "available now" : "left this period"}
        </span>
      </div>
      <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-[var(--c-line)]">
        <div className={`h-full rounded-full ${pct >= 100 ? "bg-red-500" : "bg-[var(--c-accent)]"}`} style={{ width: `${pct}%` }} />
      </div>
      {tranched && unlockAt ? (
        <div className="mt-2 font-mono text-[11px] text-[var(--c-text3)]">
          More unlocks {unlockAt.toLocaleDateString(undefined, { month: "short", day: "numeric" })} · {credits(full)}{" "}
          credits total this cycle
        </div>
      ) : null}

      <div className="mt-6 lineno">models on your plan</div>
      <div className="mt-3 overflow-x-auto">
        <table className="w-full min-w-[460px] border-collapse text-left font-mono text-[12px]">
          <thead className="text-[var(--c-text3)]">
            <tr className="border-b border-[var(--c-line)]">
              <th className="py-1.5 pr-3 font-normal">model</th>
              <th className="py-1.5 px-3 text-right font-normal">credits/turn</th>
              <th className="py-1.5 px-3 text-right font-normal">≈ turns left</th>
              <th className="py-1.5 pl-3 text-right font-normal">status</th>
            </tr>
          </thead>
          <tbody>
            {models.models.map((m) => (
              <tr key={m.id} className={`border-b border-[var(--c-line)] ${m.live ? "" : "opacity-55"}`}>
                <td className="py-1.5 pr-3 text-[var(--c-text)]">{short(m.id)}</td>
                <td
                  className="py-1.5 px-3 text-right tabular-nums text-[var(--c-text2)]"
                  title={`${m.multiplier}× the baseline model`}
                >
                  {rate(m.per_turn_micros)}
                  {/* The multiplier used to be the visible value; credits/turn replaced it because it
                      divides into your balance directly. Keeping it in `title` alone would hide it from
                      screen readers and from touch, so it also rides here — announced, never displayed. */}
                  <span className="sr-only"> credits per turn, {m.multiplier}× the baseline model</span>
                </td>
                <td className="py-1.5 px-3 text-right tabular-nums text-[var(--c-text2)]">
                  {m.live ? (m.turns_left ?? 0).toLocaleString(LOCALE) : "—"}
                </td>
                <td className="py-1.5 pl-3 text-right">
                  {m.live ? (
                    <span className="text-[11px] text-[var(--c-accent)]">live</span>
                  ) : (
                    <span className="rounded bg-[var(--c-line)] px-1.5 py-0.5 text-[10px] text-[var(--c-text3)]">soon</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function UsageMeter({ label, used, cap, pct }: { label: string; used: number; cap: number; pct: number }) {
  const over = pct >= 100;
  return (
    <div className="classic-card p-6">
      <div className="flex items-baseline justify-between">
        <div className="classic-label">{label}</div>
        <div className="font-mono text-[12px] tabular-nums text-[var(--c-text2)]">{pct}%</div>
      </div>
      <div className="mt-3 text-2xl font-semibold tracking-tight tabular-nums text-[var(--c-text)]">
        {formatTokens(used)}
        <span className="text-sm font-normal text-[var(--c-text3)]"> / {formatTokens(cap)}</span>
      </div>
      <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-[var(--c-line)]">
        <div
          className={`h-full rounded-full ${over ? "bg-red-500" : "bg-[var(--c-accent)]"}`}
          style={{ width: `${Math.min(pct, 100)}%` }}
        />
      </div>
    </div>
  );
}

function pct(used: number, cap: number): number {
  if (!cap || cap <= 0) return 0;
  return Math.round((used / cap) * 100);
}

function formatTokens(n: number): string {
  if (n >= 1_000_000) return `${+(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${+(n / 1_000).toFixed(0)}K`;
  return (n ?? 0).toLocaleString(LOCALE);
}

function formatDate(iso: string): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString(undefined, { month: "long", day: "numeric", year: "numeric" });
}
