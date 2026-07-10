import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { api, API_BASE, navigateTo } from "../api";
import { useSession } from "../auth";
import LevelNav from "../components/LevelNav";
import EmailSignIn from "./EmailSignIn";

// The editor opens {endpoint}/ai/login?redirect_uri=levelcode://…&code_challenge=…
// We thread redirect_uri + PKCE challenge through the OAuth start route so the
// callback bounces the one-time code back into the editor instead of the web session.
function oauthHref(provider: string, redirectUri: string | null, codeChallenge: string | null): string {
  const p = new URLSearchParams();
  if (redirectUri) p.set("redirect_uri", redirectUri);
  if (codeChallenge) {
    p.set("code_challenge", codeChallenge);
    p.set("code_challenge_method", "S256");
  }
  const qs = p.toString();
  return `${API_BASE}/ai/auth/oauth/${provider}${qs ? `?${qs}` : ""}`;
}

// OAuth failures (Levelcode::WebController#oauth_callback) 302 back here with ?error=.
const OAUTH_ERRORS: Record<string, string> = {
  session_expired: "Your sign-in session expired. Please try again.",
  oauth_failed: "We couldn’t sign you in with that provider. Please try again.",
  link_expired: "That sign-in link expired. Please try again from the editor.",
};

export default function LoginPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const redirectUri = params.get("redirect_uri");
  const codeChallenge = params.get("code_challenge");
  const errorCode = params.get("error");
  const fromEditor = !!redirectUri;

  const { loading: sessionLoading, profile } = useSession();
  // idle: probing session / about to redirect · completing: minting an editor code · form: show sign-in.
  const [phase, setPhase] = useState<"idle" | "completing" | "form">("idle");

  useEffect(() => {
    if (sessionLoading) return;

    // Not signed in → show the sign-in form.
    if (!profile) {
      setPhase("form");
      return;
    }

    // Signed in + an editor sign-in request → mint a PKCE-BOUND code and bounce back to the editor
    // (no second login; the editor holds the verifier, so an intercepted code is useless).
    if (redirectUri && codeChallenge) {
      setPhase("completing");
      let alive = true;
      api<{ redirect?: string }>("/ai/authorize_editor", {
        method: "POST",
        body: { redirect_uri: redirectUri, code_challenge: codeChallenge },
      })
        .then((d) => {
          if (!alive) return;
          if (d.redirect) navigateTo(d.redirect);
          else setPhase("form"); // couldn't mint → let them retry
        })
        .catch(() => {
          if (alive) setPhase("form");
        });
      return () => {
        alive = false;
      };
    }

    // Signed in on a plain web visit → the login page is pointless; go straight to the dashboard.
    navigate("/account", { replace: true });
  }, [sessionLoading, profile, redirectUri, codeChallenge, navigate]);

  if (phase === "completing") {
    return (
      <>
        <LevelNav />
        <main className="mx-auto flex min-h-[100svh] max-w-6xl flex-col items-center justify-center px-5 py-28">
          <div className="surface w-full max-w-md p-8 text-center">
            <div className="lineno mb-3">connecting</div>
            <h1 className="font-display text-xl font-semibold tracking-tightest">Opening LevelCode…</h1>
            <p className="mt-3 text-[14px] text-sub pretty">
              Signing the editor into your account. You can return to LevelCode — this tab can be closed.
            </p>
          </div>
        </main>
      </>
    );
  }

  // Idle — probing the session, or redirecting an already-signed-in user — keep a blank frame so the
  // sign-in form never flashes before the redirect.
  if (phase !== "form") {
    return (
      <>
        <LevelNav />
        <main className="mx-auto flex min-h-[100svh] max-w-6xl flex-col items-center justify-center px-5 py-28" />
      </>
    );
  }

  return (
    <>
      <LevelNav />
      <main className="mx-auto flex min-h-[100svh] max-w-6xl flex-col items-center justify-center px-5 py-28">
        <div className="w-full max-w-md">
          <div className="lineno mb-4">01 · sign in</div>
          <h1 className="font-display text-[clamp(2rem,4.5vw,2.8rem)] font-semibold leading-[1.04] tracking-tightest">
            Welcome to <span className="pp">LevelCode</span> Cloud
          </h1>
          <p className="mt-4 text-[15px] leading-relaxed text-sub pretty">
            {fromEditor
              ? "Sign in to connect the editor to your account. You’ll be sent back to LevelCode when you’re done."
              : "Sign in to manage your plan, keys, and usage."}
          </p>

          <div className="surface mt-8 p-7">
            {errorCode ? (
              <div role="alert" className="mb-5 rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-[13px] text-red-700">
                {OAUTH_ERRORS[errorCode] ?? "Sign-in failed. Please try again."}
              </div>
            ) : null}
            <div className="flex flex-col gap-3">
              <a href={oauthHref("github", redirectUri, codeChallenge)} className="btn-ghost w-full justify-center">
                <GitHubMark />
                Continue with GitHub
              </a>
              <a href={oauthHref("google", redirectUri, codeChallenge)} className="btn-ghost w-full justify-center">
                <GoogleMark />
                Continue with Google
              </a>
            </div>

            <div className="my-6 flex items-center gap-3 text-faint">
              <span className="h-px flex-1 bg-rule" />
              <span className="font-mono text-[11px] uppercase tracking-widest">or</span>
              <span className="h-px flex-1 bg-rule" />
            </div>

            <EmailSignIn redirectUri={redirectUri ?? undefined} codeChallenge={codeChallenge ?? undefined} />
          </div>

          <p className="mt-5 font-mono text-[12px] text-faint">
            By continuing you agree to the{" "}
            <Link to="/terms" className="underline decoration-rule underline-offset-4 transition-colors hover:text-ink">
              terms
            </Link>{" "}
            and{" "}
            <Link to="/privacy" className="underline decoration-rule underline-offset-4 transition-colors hover:text-ink">
              privacy policy
            </Link>
            . Bring your own key — we never resell provider access.
          </p>
        </div>
      </main>
    </>
  );
}

function GitHubMark() {
  return (
    <svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor" aria-hidden>
      <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0016 8c0-4.42-3.58-8-8-8z" />
    </svg>
  );
}

function GoogleMark() {
  return (
    <svg viewBox="0 0 18 18" width="16" height="16" aria-hidden>
      <path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 01-1.8 2.72v2.26h2.92c1.7-1.57 2.68-3.88 2.68-6.62z" />
      <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.8.54-1.84.86-3.04.86-2.34 0-4.32-1.58-5.03-3.7H.96v2.33A9 9 0 009 18z" />
      <path fill="#FBBC05" d="M3.97 10.72a5.4 5.4 0 010-3.44V4.95H.96a9 9 0 000 8.1l3.01-2.33z" />
      <path fill="#EA4335" d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.58C13.46.9 11.43 0 9 0A9 9 0 00.96 4.95l3.01 2.33C4.68 5.16 6.66 3.58 9 3.58z" />
    </svg>
  );
}
