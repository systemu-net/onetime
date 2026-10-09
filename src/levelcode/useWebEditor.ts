import { useSyncExternalStore } from "react";
import { api } from "./api";

// Is the browser edition switched on, and where does it live?
//
// The backend answers GET /api/levelcode/v1/web_editor with { enabled, url }. The setting is off
// by default in production and this app is deployed ahead of it, so every caller treats "no answer"
// exactly like "off": a failed request, a 404 from a backend that predates the endpoint, a body that
// is not what we expect, and an address we would not put in a link all come back as
// { enabled: false }. Nothing in here throws.
//
// There is ONE request per page load, shared by every component that asks. The nav, the account
// page, the docs sidebar and the /web page can all be mounted in one visit, and none of them should
// pay for the others. The answer is kept for the life of the page, so a failure also stays a failure
// until the next load: a hidden entry point is the safe state, and one that flickers is not.

export type WebEditor = {
  /** True only when the backend said so AND handed over an address that is safe to link to. */
  enabled: boolean;
  /** Where "Open LevelCode" goes. Non-null whenever `enabled` is true. */
  url: string | null;
  /** The request is still in flight. An entry point renders nothing while this is true. */
  loading: boolean;
};

const ENDPOINT = "/api/levelcode/v1/web_editor";

// Longer than any healthy answer, short enough that a hung request cannot leave /web on a blank
// frame for the minutes a browser would wait on its own.
const GIVE_UP_AFTER_MS = 10_000;

const PENDING: WebEditor = { enabled: false, url: null, loading: true };
const OFF: WebEditor = { enabled: false, url: null, loading: false };

/**
 * The address, if it is one we are willing to put in an href. The body comes from the network, so it
 * is checked rather than trusted: https only, no credentials in it, and plain http solely for an
 * editor running on this machine during development.
 */
function linkable(raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  let u: URL;
  try {
    u = new URL(raw.trim());
  } catch {
    return null;
  }
  if (u.username || u.password) return null;
  if (u.protocol === "https:") return u.href;

  const h = u.hostname;
  const thisMachine = h === "localhost" || h === "127.0.0.1" || h === "[::1]" || h.endsWith(".localhost");
  return u.protocol === "http:" && thisMachine ? u.href : null;
}

function parse(body: unknown): WebEditor {
  if (!body || typeof body !== "object") return OFF;
  const { enabled, url } = body as { enabled?: unknown; url?: unknown };
  const href = linkable(url);
  // `enabled` must be the boolean true, not merely truthy: "false" the string is truthy.
  return enabled === true && href ? { enabled: true, url: href, loading: false } : OFF;
}

let snapshot: WebEditor = PENDING;
let started = false;
const listeners = new Set<() => void>();

function settle(next: WebEditor) {
  if (!snapshot.loading) return; // first answer wins; the timeout and the response race
  snapshot = next;
  listeners.forEach((notify) => notify());
}

function start() {
  if (started) return;
  started = true;

  const timer = setTimeout(() => settle(OFF), GIVE_UP_AFTER_MS);
  api<unknown>(ENDPOINT).then(
    (body) => {
      clearTimeout(timer);
      try {
        settle(parse(body));
      } catch {
        settle(OFF);
      }
    },
    () => {
      clearTimeout(timer);
      settle(OFF);
    },
  );
}

function subscribe(notify: () => void) {
  listeners.add(notify);
  start();
  return () => {
    listeners.delete(notify);
  };
}

const read = () => snapshot;

export function useWebEditor(): WebEditor {
  return useSyncExternalStore(subscribe, read);
}
