// Campaign attribution (first-touch). Reads the marketing params off the landing URL — the thin.ly short
// links resolve to e.g. `/ai?linkedin=saienkoanastasia` or `/ai?youtube=koderrsha` — and persists them so
// the channel that first brought a visitor is still known when they later sign in. thin.ly gives per-link
// CLICK counts for free; this is what carries the channel identity into the SIGNUP conversion (attached to
// the /ai/auth/verify call by EmailSignIn, so the backend can record it on the new user).
//
// First-touch on purpose: the campaign that acquired someone is more useful than whichever link they
// happened to click last. Best-effort: if localStorage is blocked (private mode, cookies off) it silently
// no-ops — attribution must never break sign-in.
//
// localStorage is user-controlled, so every stored blob is treated as untrusted: reads (and the
// first-touch check) validate the shape and re-clamp lengths, and a corrupted/edited value is ignored
// rather than trusted or allowed to block a fresh capture. (The backend re-sanitizes independently.)

const KEY = "lc_attribution";

// Recognized campaign params, in priority order for the derived `source`. Anything else is dropped.
const PARAM_KEYS = ["linkedin", "youtube", "ref", "utm_source", "utm_medium", "utm_campaign", "utm_content"] as const;

const MAX_PARAM = 120;
const MAX_SOURCE = 40;
const MAX_STR = 300;
const MAX_TS = 40;

export type Attribution = {
  source: string; // best-guess channel: "linkedin" | "youtube" | ref/utm_source value | "other"
  params: Record<string, string>;
  landing: string; // pathname at first touch (no raw query — the campaign params live in `params`)
  referrer: string;
  ts: string; // ISO timestamp of first touch
};

// Validate + clamp an untrusted object (parsed from localStorage) into a well-formed Attribution, or null
// if it carries nothing usable. Only whitelisted param keys survive, and every string is length-bounded.
function normalize(raw: unknown): Attribution | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;

  const params: Record<string, string> = {};
  const rp = o.params;
  if (rp && typeof rp === "object") {
    for (const k of PARAM_KEYS) {
      const v = (rp as Record<string, unknown>)[k];
      if (typeof v === "string" && v) params[k] = v.slice(0, MAX_PARAM);
    }
  }
  const source = typeof o.source === "string" ? o.source.slice(0, MAX_SOURCE) : "";
  if (Object.keys(params).length === 0 && !source) return null; // nothing to attribute

  const str = (v: unknown, max: number) => (typeof v === "string" ? v.slice(0, max) : "");
  return {
    source: source || "other",
    params,
    landing: str(o.landing, MAX_STR),
    referrer: str(o.referrer, MAX_STR),
    ts: str(o.ts, MAX_TS),
  };
}

// The stored first-touch attribution, validated, or null (also null for a missing/corrupt/blocked store).
function readStored(): Attribution | null {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? normalize(JSON.parse(raw)) : null;
  } catch {
    return null;
  }
}

// Call once at app boot (main.tsx), before render. Captures nothing on an organic visit; preserves an
// existing VALID first-touch; recaptures over a corrupt/legacy value if this visit carries campaign params.
export function captureAttribution(): void {
  if (typeof window === "undefined") return;
  try {
    if (readStored()) return; // valid first-touch already recorded — leave it (first-touch wins)

    const sp = new URLSearchParams(window.location.search);
    const params: Record<string, string> = {};
    for (const k of PARAM_KEYS) {
      const v = sp.get(k);
      if (v) params[k] = v.slice(0, MAX_PARAM);
    }
    if (Object.keys(params).length === 0) return; // organic visit — nothing to attribute

    const source =
      params.linkedin ? "linkedin" : params.youtube ? "youtube" : params.utm_source || params.ref || "other";

    const rec: Attribution = {
      source,
      params,
      // pathname only — never the raw query string, so unrelated (and possibly sensitive) params that may
      // later appear on /ai?… can't leak into storage or the signup payload. Campaign params are in `params`.
      landing: window.location.pathname.slice(0, MAX_STR),
      referrer: (document.referrer || "").slice(0, MAX_STR),
      ts: new Date().toISOString(),
    };
    localStorage.setItem(KEY, JSON.stringify(rec));
  } catch {
    /* storage unavailable — attribution is best-effort, never block the app */
  }
}

// The stored first-touch attribution, or null. Safe to call anywhere (e.g. attach to the sign-in request);
// always returns a validated, clamped record or null.
export function getAttribution(): Attribution | null {
  if (typeof window === "undefined") return null;
  return readStored();
}
