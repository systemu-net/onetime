// Campaign attribution (first-touch). Reads the marketing params off the landing URL — the thin.ly short
// links resolve to e.g. `/ai?linkedin=saienkoanastasia` or `/ai?youtube=koderrsha` — and persists them so
// the channel that first brought a visitor is still known when they later sign in. thin.ly gives per-link
// CLICK counts for free; this is what carries the channel identity into the SIGNUP conversion (attached to
// the /ai/auth/verify call by EmailSignIn, so the backend can record it on the new user).
//
// First-touch on purpose: the campaign that acquired someone is more useful than whichever link they
// happened to click last. Best-effort: if localStorage is blocked (private mode, cookies off) it silently
// no-ops — attribution must never break sign-in.

const KEY = "lc_attribution";

// Recognized campaign params, in priority order for the derived `source`.
const PARAM_KEYS = ["linkedin", "youtube", "ref", "utm_source", "utm_medium", "utm_campaign", "utm_content"] as const;

export type Attribution = {
  source: string; // best-guess channel: "linkedin" | "youtube" | ref/utm_source value | "other"
  params: Record<string, string>;
  landing: string; // path+search at first touch
  referrer: string;
  ts: string; // ISO timestamp of first touch
};

// Call once at app boot (main.tsx), before render. Captures nothing if there are no campaign params or a
// prior touch already exists.
export function captureAttribution(): void {
  if (typeof window === "undefined") return;
  try {
    if (localStorage.getItem(KEY)) return; // first-touch wins — never overwrite

    const sp = new URLSearchParams(window.location.search);
    const params: Record<string, string> = {};
    for (const k of PARAM_KEYS) {
      const v = sp.get(k);
      if (v) params[k] = v.slice(0, 120);
    }
    if (Object.keys(params).length === 0) return; // organic visit — nothing to attribute

    const source =
      params.linkedin ? "linkedin" : params.youtube ? "youtube" : params.utm_source || params.ref || "other";

    const rec: Attribution = {
      source,
      params,
      landing: (window.location.pathname + window.location.search).slice(0, 300),
      referrer: (document.referrer || "").slice(0, 300),
      ts: new Date().toISOString(),
    };
    localStorage.setItem(KEY, JSON.stringify(rec));
  } catch {
    /* storage unavailable — attribution is best-effort, never block the app */
  }
}

// The stored first-touch attribution, or null. Safe to call anywhere (e.g. attach to the sign-in request).
export function getAttribution(): Attribution | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Attribution) : null;
  } catch {
    return null;
  }
}
