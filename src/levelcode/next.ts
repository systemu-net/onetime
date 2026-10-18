// Where a sign-in on this site lands, and `next`: the page of this site a visitor asked for before
// being sent to sign in.
//
// A sign-in that is not an editor's lands on (the backend decides, POST /ai/auth/verify and the
// OAuth callback; this file is the SPA's side of the same contract):
//   1. `next`, when it is a valid page of this site (safeNext);
//   2. else the browser edition, when it is switched on (useWebEditor's address, `?signin=1`);
//   3. else /ai/account.
// An editor signing in (redirect_uri + code_challenge) always wins, and `next` is not sent with it.
//
// This module imports nothing, so `node --test` can load it as it is (see next.test.ts).

const SITE = "https://levelcode.ai";
const PREFIX = "/ai/";

/** The longest `next` that is taken. The backend uses the same bound. */
export const NEXT_MAX = 512;

// The characters RFC 3986 allows in a path and a query, and nothing else: letters, digits,
// - . _ ~ ! $ & ' ( ) * + , ; = : @ / ? and a percent escape. That alone keeps out whitespace,
// control characters, a backslash, a fragment (#) and anything outside ASCII.
const PATH_AND_QUERY = /^(?:[A-Za-z0-9\-._~!$&'()*+,;=:@/?]|%[0-9A-Fa-f]{2})+$/;

// A percent-encoded / or \. Its only use in a `next` is to get a separator past a check: any layer
// that decodes the value once would turn `/ai/%2F%2Fevil.example` into `/ai///evil.example`.
const ENCODED_SEPARATOR = /%2f|%5c/i;

// What the backend serves under /ai/ itself (thin.ly config/routes.rb, the "ai" scope): not pages to land on.
// Rails answers each with a format suffix (`.json`) and a trailing slash too, so a name is compared after
// decoding it, in lower case, and cut at the first character a route name does not have.
const SERVER_NAMES = new Set(["auth", "authorize_editor", "checkout", "billing", "signout", "csrf"]);

/**
 * `raw` if it is a page of this site to land on after signing in, else null (treated as absent).
 *
 * Valid: a string of 5 to 512 characters that starts with `/ai/` and is a plain path, optionally
 * with a query (`/ai/pricing?plan=pro`). Refused: anything else, including
 *   - another origin in any spelling: `https://…`, `//host`, `/\host`, `javascript:…`;
 *   - `//` anywhere, a backslash, a fragment (`#…`), whitespace or a control character;
 *   - a character RFC 3986 does not allow unescaped (`<`, `"`, `|`, non-ASCII, …) or a broken `%` escape;
 *   - a percent-encoded slash or backslash (`%2F`, `%5C`, any case);
 *   - a dot segment, plain or percent-encoded (`/ai/../x`, `/ai/%2e%2e/x`): a browser resolves both,
 *     and the page would no longer be the one under /ai/ that was checked;
 *   - the server's own endpoints (SERVER_NAMES), in any spelling its router answers: /ai/csrf, /ai/csrf.json,
 *     /ai/csrf/, /ai/%63srf, /ai/CSRF, /ai/auth/…: they are not pages (the backend refuses them too).
 * A double-encoded value such as `/ai/%252F` is accepted: it is a literal path under /ai/, and since
 * the value must begin with the literal `/ai/`, no decoding of what follows can make it start `//`.
 */
export function safeNext(raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  if (raw.length <= PREFIX.length || raw.length > NEXT_MAX) return null;
  if (!raw.startsWith(PREFIX)) return null;
  if (!PATH_AND_QUERY.test(raw)) return null;
  if (raw.includes("//") || ENCODED_SEPARATOR.test(raw)) return null;

  const path = raw.split("?", 1)[0];
  if (path.split("/").some((segment) => isDotSegment(segment))) return null;
  if (isServerName(path.split("/")[2] ?? "")) return null;

  // The contract's own words: parsed against this site, it stays on this site, under /ai/. The rules above
  // already make that so (a literal /ai/ prefix, no //, backslash or dot segment); this guards them.
  let url: URL;
  try {
    url = new URL(raw, SITE);
  } catch {
    return null;
  }
  if (url.origin !== SITE || !url.pathname.startsWith(PREFIX)) return null;

  return raw;
}

/** Is this first segment after /ai/ one of the backend's own endpoints, as written or decoded? A name is read as
 *  the router would: in lower case, up to the first character that is not a letter, digit or underscore
 *  (`csrf.json` and `csrf;x` are `csrf`). Read both ways, `%63srf` and `checkout%A9` are endpoints too. */
function isServerName(segment: string): boolean {
  const name = (s: string) => (/^[a-z0-9_]*/.exec(s.toLowerCase()) ?? [""])[0];
  if (SERVER_NAMES.has(name(segment))) return true;
  try {
    return SERVER_NAMES.has(name(decodeURIComponent(segment)));
  } catch {
    return false; // not decodable: it is read as written, above
  }
}

function isDotSegment(segment: string): boolean {
  const s = segment.replace(/%2e/gi, ".");
  return s === "." || s === "..";
}

/** The page the visitor is on now, as a `next` would name it (`/ai/account?checkout=changed`). */
export function currentPage(): string {
  return window.location.pathname + window.location.search;
}

/**
 * The sign-in page's route (relative to the router's /ai basename), bringing the visitor back to
 * `page` afterwards. A `page` that is not a valid `next` is dropped, and the visitor lands wherever
 * any sign-in does. Leave `page` out for a plain "Sign in".
 */
export function loginRoute(page?: string | null): string {
  const next = safeNext(page);
  return next ? `/login?${new URLSearchParams({ next })}` : "/login";
}

export type WebEditorAnswer = { enabled: boolean; url: string | null; loading: boolean };

export type SignedInDestination =
  /** An editor is signing in: mint it a code (the login page's existing flow). */
  | { kind: "editor" }
  /** Not known yet: the browser edition's answer is still loading. */
  | { kind: "wait" }
  /** A page of this app, as a route relative to the /ai basename. */
  | { kind: "route"; to: string }
  /** The browser edition, on its own origin: a full-page navigation. */
  | { kind: "href"; to: string };

/**
 * Where the login page sends a visitor who is ALREADY signed in, in the same order as a sign-in
 * lands (see the top of this file). `webEditor` is useWebEditor's answer, which has already refused
 * any address it would not link to.
 */
export function signedInDestination({
  editorSigningIn,
  next,
  webEditor,
}: {
  editorSigningIn: boolean;
  next: string | null;
  webEditor: WebEditorAnswer;
}): SignedInDestination {
  if (editorSigningIn) return { kind: "editor" };

  const page = safeNext(next);
  if (page) return { kind: "route", to: page.slice(PREFIX.length - 1) };

  if (webEditor.loading) return { kind: "wait" };
  if (webEditor.enabled && webEditor.url) return { kind: "href", to: webEditor.url };
  return { kind: "route", to: "/account" };
}
