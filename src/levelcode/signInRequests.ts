import type { Attribution } from "./attribution";

// The two requests that finish a sign-in, built in one place so what they carry can be tested:
// the OAuth start link (ProviderSignIn) and the email-code verify body (EmailSignIn).
// Nothing here touches the page or the network; the components pass in what they read.

/** What the login page knows about this sign-in. */
export type SignInContext = {
  /** The editor's callback; meaningful only together with its code_challenge (a PKCE pair). */
  redirectUri?: string;
  codeChallenge?: string;
};

/**
 * GET /ai/auth/oauth/:provider, the link each provider button is.
 *
 * The editor's redirect_uri + code_challenge are a PKCE PAIR, forwarded only when BOTH are present so a
 * partial handoff never reaches the backend (defensive; the login page already pairs them, but this
 * shouldn't trust its caller to).
 */
export function oauthStartUrl(
  base: string,
  provider: string,
  context: SignInContext,
  attribution: Attribution | null,
): string {
  const { redirectUri, codeChallenge } = context;
  const qs = new URLSearchParams();
  if (redirectUri && codeChallenge) {
    qs.set("redirect_uri", redirectUri);
    qs.set("code_challenge", codeChallenge);
  }
  // First-touch campaign attribution. The email flow posts this in the verify body; OAuth is a top-level
  // navigation with no body, so it rides the query string — oauth_start moves it straight into the session
  // (like the CSRF `state`), and oauth_callback stamps it on the user IF this sign-in creates one. Without
  // it every GitHub/Google signup is attributed to nothing, which quietly undercounts whichever channel
  // sends the most developers.
  //
  // Only the fields the funnel actually uses are carried, as an explicit allowlist rather than the whole
  // record. A query string ends up in browser history and server access logs, and `referrer` is the one
  // attribution field that can itself be a third-party URL carrying its own query params — so it stays out
  // of the URL entirely. Listing the fields (instead of deleting one) also means a field added to
  // Attribution later cannot silently start appearing in logs.
  if (attribution) {
    qs.set(
      "attribution",
      JSON.stringify({
        source: attribution.source,
        params: attribution.params,
        landing: attribution.landing,
        ts: attribution.ts,
      }),
    );
  }

  const q = qs.toString();
  return `${base}/ai/auth/oauth/${provider}${q ? `?${q}` : ""}`;
}

/**
 * The body of POST /ai/auth/verify. redirect_uri and code_challenge go as the login page passed them
 * (it pairs them). `attribution` is the first-touch campaign channel (null for organic sign-ins) so the
 * backend can record which channel acquired a new account; harmless if the backend doesn't consume it.
 */
export function verifyBody(
  email: string,
  code: string,
  context: SignInContext,
  attribution: Attribution | null,
): Record<string, unknown> {
  return {
    email,
    code,
    redirect_uri: context.redirectUri,
    code_challenge: context.codeChallenge,
    attribution,
  };
}
