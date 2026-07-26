import type { ReactNode } from "react";
import { API_BASE } from "../api";
import { getAttribution } from "../attribution";

// Social sign-in for the LevelCode Cloud login: Google + GitHub.
//
// Each is a real <a> (top-level GET), NOT an api() fetch and NOT a GIS-style token button: Rails'
// oauth_start 302s to the provider and relies on the session cookie it sets to carry the CSRF `state`,
// neither of which survives an XHR. As links they keep native semantics too — keyboard, Cmd/Ctrl-click
// to open in a new tab, works without JS.
//
// The editor's redirect_uri + code_challenge are a PKCE PAIR, forwarded only when BOTH are present (see
// oauthStartUrl) so a partial handoff never reaches the backend. Both providers share the exact same
// oauth_start/oauth_callback path — the callback dispatches on the stashed provider.
export default function ProviderSignIn({
  redirectUri,
  codeChallenge,
}: {
  redirectUri?: string;
  codeChallenge?: string;
}) {
  return (
    <div className="flex flex-col gap-3">
      <ProviderLink provider="google" label="Continue with Google" redirectUri={redirectUri} codeChallenge={codeChallenge}>
        <GoogleG />
      </ProviderLink>
      <ProviderLink provider="github" label="Continue with GitHub" redirectUri={redirectUri} codeChallenge={codeChallenge}>
        <GitHubMark />
      </ProviderLink>
    </div>
  );
}

function ProviderLink({
  provider,
  label,
  redirectUri,
  codeChallenge,
  children,
}: {
  provider: string;
  label: string;
  redirectUri?: string;
  codeChallenge?: string;
  children: ReactNode;
}) {
  return (
    <a
      href={oauthStartUrl(provider, redirectUri, codeChallenge)}
      className="classic-button--quiet w-full gap-2.5"
    >
      {children}
      {label}
    </a>
  );
}

function oauthStartUrl(provider: string, redirectUri?: string, codeChallenge?: string): string {
  const qs = new URLSearchParams();
  // Both or neither — a lone redirect_uri has no PKCE binding and must not be forwarded (defensive; the
  // login page already pairs them, but this component shouldn't trust its caller to).
  if (redirectUri && codeChallenge) {
    qs.set("redirect_uri", redirectUri);
    qs.set("code_challenge", codeChallenge);
  }
  // First-touch campaign attribution. The email flow posts this in the verify body; OAuth is a top-level
  // navigation with no body, so it rides the query string — oauth_start moves it straight into the session
  // (like the CSRF `state`), and oauth_callback stamps it on the user IF this sign-in creates one. Without
  // it every GitHub/Google signup is attributed to nothing, which quietly undercounts whichever channel
  // sends the most developers.
  const attribution = getAttribution();
  if (attribution) qs.set("attribution", JSON.stringify(attribution));

  const q = qs.toString();
  return `${API_BASE}/ai/auth/oauth/${provider}${q ? `?${q}` : ""}`;
}

function GoogleG() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true" className="shrink-0">
      <path
        fill="#4285F4"
        d="M17.64 9.2045c0-.6381-.0573-1.2518-.1636-1.8409H9v3.4814h4.8436c-.2086 1.125-.8427 2.0782-1.7959 2.7164v2.2581h2.9086c1.7018-1.5668 2.6837-3.874 2.6837-6.615z"
      />
      <path
        fill="#34A853"
        d="M9 18c2.43 0 4.4673-.806 5.9564-2.1805l-2.9086-2.2581c-.8059.54-1.8368.859-3.0478.859-2.344 0-4.3282-1.5832-5.036-3.7105H.9573v2.3318C2.4382 15.9832 5.4818 18 9 18z"
      />
      <path
        fill="#FBBC05"
        d="M3.964 10.71c-.18-.54-.2822-1.1168-.2822-1.71s.1023-1.17.2823-1.71V4.9582H.9573C.3477 6.1732 0 7.5477 0 9s.3477 2.8268.9573 4.0418L3.964 10.71z"
      />
      <path
        fill="#EA4335"
        d="M9 3.5795c1.3214 0 2.5077.4541 3.4405 1.346l2.5813-2.5814C13.4636.8918 11.426 0 9 0 5.4818 0 2.4382 2.0168.9573 4.9582L3.964 7.29C4.6718 5.1627 6.656 3.5795 9 3.5795z"
      />
    </svg>
  );
}

function GitHubMark() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className="shrink-0">
      <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
    </svg>
  );
}
