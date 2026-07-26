// Same-origin client for the LevelCode Cloud account app. Served by Rails at
// `/ai/*`, so in production API_BASE is "" (relative) and the Devise session
// cookie rides along automatically. In standalone Vite dev it targets the ngrok
// backend. State-changing writes carry the Rails CSRF token from the shell's
// <meta name="csrf-token"> (see thin.ly app/views/static/ui_levelcode.html).

// Runtime config injected by Rails into the shell (window.__ENV__). Cast locally
// so we don't clash with the thin.ly app's narrower global declaration.
const env = ((typeof window !== "undefined" &&
  (window as unknown as { __ENV__?: Record<string, string> }).__ENV__) ||
  {}) as Record<string, string>;

// Always same-origin/relative. In prod Rails serves both the SPA and the API at
// one origin; in `npm run dev` the Vite proxy (vite.config.ts) forwards /api and
// the /ai server routes to the backend, so it's same-origin from the browser too.
export const API_BASE = String(env.API_BASE ?? "").replace(/\/+$/, "");

// CSRF token for state-changing writes. Prod: the Rails shell embeds it in
// <meta name="csrf-token">. Dev: the Vite shell has no meta, so fetch one from
// Rails once (GET /ai/csrf) and cache it.
let csrfPromise: Promise<string> | null = null;
async function csrfToken(): Promise<string> {
  const el = typeof document !== "undefined" ? document.querySelector('meta[name="csrf-token"]') : null;
  const fromMeta = el?.getAttribute("content");
  if (fromMeta) return fromMeta;

  if (!csrfPromise) {
    csrfPromise = fetch(`${API_BASE}/ai/csrf`, { credentials: "include" })
      .then((r) => (r.ok ? r.json() : { token: "" }))
      .then((d: { token?: string }) => d.token ?? "")
      .catch(() => "");
  }
  return csrfPromise;
}

export class ApiError extends Error {
  status: number;
  code?: string;
  constructor(status: number, message: string, code?: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
  }
}

type Opts = { method?: string; body?: unknown; headers?: Record<string, string> };

// Call a same-origin Rails endpoint (`path` starts with "/"). Sends cookies and,
// for writes, the CSRF token. Throws ApiError on non-2xx.
export async function api<T = unknown>(path: string, opts: Opts = {}): Promise<T> {
  const method = opts.method ?? (opts.body !== undefined ? "POST" : "GET");
  const headers: Record<string, string> = { Accept: "application/json", ...opts.headers };
  if (opts.body !== undefined) headers["Content-Type"] = "application/json";
  if (method !== "GET" && method !== "HEAD") headers["X-CSRF-Token"] = await csrfToken();

  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    credentials: "include",
    body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined,
  });

  const text = await res.text();
  let data: unknown = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = null;
    }
  }

  if (!res.ok) {
    const err = (data as { error?: { code?: string; message?: string } } | null)?.error;
    throw new ApiError(res.status, err?.message ?? `Request failed (${res.status})`, err?.code);
  }
  return data as T;
}

// Full-page navigation to a server-rendered flow (OAuth start, Stripe redirect).
export function navigateTo(url: string): void {
  window.location.href = url;
}

// ── Typed response shapes (mirror SPEC §3 / §6) ─────────────────────────────

export type PricingTier = {
  key: string;
  name: string;
  price_cents: number;
  interval: string;
  input_cap: number;
  output_cap: number;
  turns: number;
  features: string[];
};
export type Pricing = { tiers: PricingTier[] };

export type AccountProfile = {
  id: string;
  email: string;
  name: string;
  plan: string;
  role: string;
};

export type AccountUsage = {
  plan: string;
  model?: string;
  budget_micros?: number;
  spent_micros?: number;
  credits_remaining_micros?: number;
  input_used: number;
  input_cap: number;
  output_used: number;
  output_cap: number;
  period_end: string;
  overage_policy: string;
};

// Plan model roster (GET /account/models) — the Cursor-class lineup with credit economics.
export type RosterModel = {
  id: string;
  label: string;
  context: number;
  multiplier: number;
  live: boolean; // confirmed price → selectable/billable; false → staged ("coming soon")
  per_turn_micros: number; // retail micro-$ for ONE turn — same unit as the balance fields below
  turns_budget: number;
  turns_left: number | null;
};
export type AccountModels = {
  plan: string;
  default_model: string;
  budget_micros: number; // full monthly allowance
  ceiling_micros?: number; // currently-unlocked ceiling (rolling windows); == budget when tranching is off
  spent_micros: number;
  credits_remaining_micros: number; // remaining vs the ceiling
  next_unlock_at?: string | null; // when more unlocks (null if none / tranching off)
  models: RosterModel[];
};

// GitHub-style contribution activity (GET /account/activity?year=).
export type ActivityModel = {
  model: string;
  count: number;
  input: number;
  output: number;
  cost_micros: number;
  up: number;
  down: number;
};
export type ActivityDay = {
  count: number;
  input: number;
  output: number;
  cost_micros: number;
  models: Array<Omit<ActivityModel, "up" | "down">>;
};
export type Activity = {
  year: number;
  total: number;
  days: Record<string, ActivityDay>; // "YYYY-MM-DD" -> day
  models: ActivityModel[];
  years: number[];
};

// Admin dashboard (GET /admin/summary, /admin/users) — admin role only.
export type AdminSummary = {
  users: number;
  active_users: number;
  input: number;
  output: number;
  requests: number;
  cost_micros: number;
  plans: Record<string, number>;
  countries: Record<string, number>;
  auth_attempts: number;
  auth_failures: number;
  auth_failures_by_country: Record<string, number>;
};
export type AdminUser = {
  id: number;
  email: string;
  role: string;
  plan: string;
  input: number;
  output: number;
  requests: number;
  cost_micros: number;
  country: string | null;
  last_seen_at: string | null;
  auth_attempts: number;
  auth_failures: number;
  created_at: string;
};
export type AdminUsers = { total: number; limit: number; offset: number; users: AdminUser[] };

/** One marketing channel (and the partner handle behind it) through the funnel. */
export type ReferralRow = {
  channel: string;
  handle: string | null;
  clicks: number;
  signups: number;
  paid: number;
};
export type ReferralFunnel = {
  from: string;
  to: string;
  rows: ReferralRow[];
  totals: { clicks: number; signups: number; paid: number };
  /** Signups in range that carried no channel — organic, or attribution lost. */
  unattributed_signups: number;
  /**
   * What the `paid` column actually measures. The schema has no "became paid at"
   * timestamp, so it can only be a snapshot; the dashboard says so rather than
   * letting it read as a conversion rate.
   */
  paid_basis: string;
};
