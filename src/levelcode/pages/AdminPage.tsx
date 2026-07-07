import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api, type AdminSummary, type AdminUsers } from "../api";
import { useSession } from "../auth";
import LevelNav from "../components/LevelNav";

type SortKey = "input" | "output" | "requests" | "cost" | "auth_attempts" | "auth_failures" | "last_seen" | "email" | "plan";

// Admin-only ops dashboard: who's burning tokens, on what plan, from where, and whether
// their logins are failing. Session-gated on the `admin` role (also enforced server-side).
export default function AdminPage() {
  const navigate = useNavigate();
  const { loading: sessionLoading, profile } = useSession();

  const [summary, setSummary] = useState<AdminSummary | null>(null);
  const [data, setData] = useState<AdminUsers | null>(null);
  const [sort, setSort] = useState<SortKey>("input");
  const [dir, setDir] = useState<"asc" | "desc">("desc");
  const [q, setQ] = useState("");
  const [plan, setPlan] = useState("");
  const [error, setError] = useState<string | null>(null);

  const isAdmin = profile?.role === "admin";

  // Non-admins (or signed-out) never see this surface.
  useEffect(() => {
    if (sessionLoading) return;
    if (!profile) navigate("/login", { replace: true });
    else if (!isAdmin) navigate("/account", { replace: true });
  }, [sessionLoading, profile, isAdmin, navigate]);

  useEffect(() => {
    if (!isAdmin) return;
    let alive = true;
    api<AdminSummary>("/api/levelcode/v1/admin/summary")
      .then((s) => alive && setSummary(s))
      .catch(() => alive && setError("Couldn’t load the admin summary."));
    return () => {
      alive = false;
    };
  }, [isAdmin]);

  useEffect(() => {
    if (!isAdmin) return;
    let alive = true;
    const p = new URLSearchParams({ sort, dir, limit: "200" });
    if (q.trim()) p.set("q", q.trim());
    if (plan) p.set("plan", plan);
    api<AdminUsers>(`/api/levelcode/v1/admin/users?${p.toString()}`)
      .then((d) => alive && setData(d))
      .catch(() => alive && setError("Couldn’t load users."));
    return () => {
      alive = false;
    };
  }, [isAdmin, sort, dir, q, plan]);

  const planOptions = useMemo(() => Object.keys(summary?.plans ?? {}).sort(), [summary]);

  function toggleSort(key: SortKey) {
    if (sort === key) setDir((d) => (d === "desc" ? "asc" : "desc"));
    else {
      setSort(key);
      setDir(key === "email" || key === "plan" ? "asc" : "desc");
    }
  }

  if (sessionLoading || !isAdmin) {
    return (
      <>
        <LevelNav />
        <main className="mx-auto max-w-6xl px-5 py-28" />
      </>
    );
  }

  return (
    <>
      <LevelNav />
      <main className="mx-auto max-w-6xl px-5 py-28">
        <div className="lineno mb-4">06 · admin</div>
        <h1 className="font-display text-[clamp(1.9rem,4vw,2.8rem)] font-semibold leading-[1.05] tracking-tightest">
          System dashboard
        </h1>
        <p className="mt-2 font-mono text-[13px] text-faint">tokens burned · plans · geography · login health</p>

        {error ? <div className="surface mt-8 p-6 text-[14px] text-flame">{error}</div> : null}

        {/* Summary cards */}
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Stat label="users" value={fmtInt(summary?.users)} sub={`${fmtInt(summary?.active_users)} active`} />
          <Stat label="requests" value={fmtInt(summary?.requests)} sub={fmtCost(summary?.cost_micros)} />
          <Stat label="input tokens" value={fmtTokens(summary?.input)} />
          <Stat label="output tokens" value={fmtTokens(summary?.output)} />
          <Stat
            label="auth attempts"
            value={fmtInt(summary?.auth_attempts)}
            sub={`${fmtInt(summary?.auth_failures)} failed`}
            alert={(summary?.auth_failures ?? 0) > 0}
          />
          <Breakdown label="plans" map={summary?.plans} />
          <Breakdown label="countries" map={summary?.countries} />
          <Breakdown label="auth failures · country" map={summary?.auth_failures_by_country} alert />
        </div>

        {/* Filters */}
        <div className="mt-10 flex flex-wrap items-center gap-3">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search email…"
            className="w-full max-w-xs rounded-lg border border-rule bg-card px-3 py-2 font-mono text-[13px] text-ink outline-none focus:border-ink sm:w-auto"
          />
          <select
            value={plan}
            onChange={(e) => setPlan(e.target.value)}
            className="rounded-lg border border-rule bg-card px-3 py-2 font-mono text-[13px] text-sub outline-none focus:border-ink"
          >
            <option value="">all plans</option>
            {planOptions.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
          <span className="font-mono text-[12px] text-faint">{fmtInt(data?.total)} users</span>
        </div>

        {/* Users table */}
        <div className="surface mt-4 overflow-x-auto p-0">
          <table className="w-full min-w-[880px] border-collapse text-left font-mono text-[12px]">
            <thead className="text-faint">
              <tr className="border-b border-rule">
                <Th label="email" col="email" sort={sort} dir={dir} onClick={toggleSort} align="left" />
                <Th label="plan" col="plan" sort={sort} dir={dir} onClick={toggleSort} align="left" />
                <Th label="input" col="input" sort={sort} dir={dir} onClick={toggleSort} />
                <Th label="output" col="output" sort={sort} dir={dir} onClick={toggleSort} />
                <Th label="requests" col="requests" sort={sort} dir={dir} onClick={toggleSort} />
                <Th label="cost" col="cost" sort={sort} dir={dir} onClick={toggleSort} />
                <th className="px-3 py-2 text-left font-normal">country</th>
                <Th label="auth" col="auth_attempts" sort={sort} dir={dir} onClick={toggleSort} />
                <Th label="last seen" col="last_seen" sort={sort} dir={dir} onClick={toggleSort} />
                <th className="px-3 py-2 text-right font-normal">reach</th>
              </tr>
            </thead>
            <tbody>
              {(data?.users ?? []).map((u) => (
                <tr key={u.id} className="border-b border-rule/60 hover:bg-rule/20">
                  <td className="px-3 py-2 text-ink">
                    {u.email}
                    {u.role === "admin" ? <span className="ml-2 rounded bg-flame/15 px-1.5 py-0.5 text-[10px] text-flame">admin</span> : null}
                  </td>
                  <td className="px-3 py-2 text-sub">{u.plan}</td>
                  <td className="px-3 py-2 text-right tabular-nums text-sub">{fmtTokens(u.input)}</td>
                  <td className="px-3 py-2 text-right tabular-nums text-sub">{fmtTokens(u.output)}</td>
                  <td className="px-3 py-2 text-right tabular-nums text-sub">{fmtInt(u.requests)}</td>
                  <td className="px-3 py-2 text-right tabular-nums text-sub">{fmtCost(u.cost_micros)}</td>
                  <td className="px-3 py-2 text-sub">{u.country ?? "—"}</td>
                  <td className="px-3 py-2 text-right tabular-nums">
                    <span className={u.auth_failures > 0 ? "text-flame" : "text-faint"}>
                      {u.auth_attempts}
                      {u.auth_failures > 0 ? ` · ${u.auth_failures}✗` : ""}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-faint">{fmtWhen(u.last_seen_at)}</td>
                  <td className="px-3 py-2 text-right">
                    <a className="text-flame underline decoration-rule underline-offset-2 hover:decoration-flame" href={`mailto:${u.email}`}>
                      email
                    </a>
                  </td>
                </tr>
              ))}
              {data && data.users.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-3 py-6 text-center text-faint">
                    No users match.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </main>
    </>
  );
}

function Th({
  label,
  col,
  sort,
  dir,
  onClick,
  align = "right",
}: {
  label: string;
  col: SortKey;
  sort: SortKey;
  dir: "asc" | "desc";
  onClick: (k: SortKey) => void;
  align?: "left" | "right";
}) {
  const active = sort === col;
  return (
    <th className={`px-3 py-2 font-normal ${align === "right" ? "text-right" : "text-left"}`}>
      <button type="button" onClick={() => onClick(col)} className={`inline-flex items-center gap-1 ${active ? "text-ink" : "hover:text-ink"}`}>
        {label}
        <span className="text-[9px]">{active ? (dir === "desc" ? "▼" : "▲") : "↕"}</span>
      </button>
    </th>
  );
}

function Stat({ label, value, sub, alert }: { label: string; value: string; sub?: string; alert?: boolean }) {
  return (
    <div className="surface p-5">
      <div className="lineno">{label}</div>
      <div className="mt-1 font-display text-2xl font-semibold tracking-tightest tabular-nums">{value}</div>
      {sub ? <div className={`mt-1 font-mono text-[11px] ${alert ? "text-flame" : "text-faint"}`}>{sub}</div> : null}
    </div>
  );
}

function Breakdown({ label, map, alert }: { label: string; map?: Record<string, number>; alert?: boolean }) {
  const entries = Object.entries(map ?? {}).sort((a, b) => b[1] - a[1]);
  return (
    <div className="surface p-5">
      <div className="lineno">{label}</div>
      {entries.length ? (
        <ul className="mt-2 space-y-1 font-mono text-[12px]">
          {entries.slice(0, 5).map(([k, n]) => (
            <li key={k} className="flex justify-between">
              <span className="text-sub">{k}</span>
              <span className={`tabular-nums ${alert ? "text-flame" : "text-faint"}`}>{n}</span>
            </li>
          ))}
        </ul>
      ) : (
        <div className="mt-2 font-mono text-[12px] text-faint">—</div>
      )}
    </div>
  );
}

function fmtInt(n?: number): string {
  return (n ?? 0).toLocaleString();
}
function fmtTokens(n?: number): string {
  const v = n ?? 0;
  if (v >= 1_000_000) return `${+(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1_000) return `${+(v / 1_000).toFixed(0)}K`;
  return v.toLocaleString();
}
function fmtCost(micros?: number): string {
  return `$${((micros ?? 0) / 1_000_000).toFixed(2)}`;
}
function fmtWhen(iso: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}
