import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { api, navigateTo } from "../api";
import { useSession } from "../auth";
import ClassicShell, { ChevronMark } from "../components/classic/ClassicShell";
import EmailSignIn from "./EmailSignIn";
import ProviderSignIn from "./ProviderSignIn";

// Sign-in error codes bounced back here with ?error= (editor link-expiry, or a stale session).
const SIGNIN_ERRORS: Record<string, string> = {
  session_expired: "Your sign-in session expired. Please try again.",
  link_expired: "That sign-in link expired. Please try again from the editor.",
};

// The sign-in page, LevelCode Classic (atom.io-heritage): flat centered card under the
// chevron mark. All auth flows unchanged — PKCE editor handoff, OAuth links, email code.
export default function LoginPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const redirectUri = params.get("redirect_uri");
  const codeChallenge = params.get("code_challenge");
  const errorCode = params.get("error");
  // The editor's PKCE handoff is a PAIR — a redirect_uri is only meaningful with its code_challenge.
  // Treat it as present only when BOTH arrive, and forward both-or-neither to the sign-in forms so a
  // lone (unbound) redirect_uri never reaches the backend.
  const editorHandoff = redirectUri && codeChallenge ? { redirectUri, codeChallenge } : null;
  const fromEditor = !!editorHandoff;

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
      <ClassicShell>
        <main className="mx-auto flex max-w-5xl flex-col items-center px-5 py-24">
          <div className="w-full max-w-md rounded-md border border-[var(--c-line)] bg-[var(--c-surface)] p-8 text-center">
            <h1 className="text-xl font-semibold text-[var(--c-text)]">Opening LevelCode…</h1>
            <p className="mt-3 text-[14px] pretty">
              Signing the editor into your account. You can return to LevelCode — this tab can be
              closed.
            </p>
          </div>
        </main>
      </ClassicShell>
    );
  }

  // Idle — probing the session, or redirecting an already-signed-in user — keep a blank frame so the
  // sign-in form never flashes before the redirect.
  if (phase !== "form") {
    return (
      <ClassicShell>
        <main className="mx-auto flex min-h-[60vh] max-w-5xl flex-col px-5 py-24" />
      </ClassicShell>
    );
  }

  return (
    <ClassicShell>
      <main className="mx-auto flex max-w-5xl flex-col items-center px-5 py-16">
        <div className="w-full max-w-md">
          <div className="text-center">
            <div className="inline-block">
              <ChevronMark />
            </div>
            <h1 className="mt-3 text-[28px] font-bold tracking-tight text-[var(--c-text)]">
              Sign in to Level<span className="text-[var(--c-accent)]">Code</span>
            </h1>
            <p className="mt-2 text-[15px] pretty">
              {fromEditor
                ? "Connect the editor to your account — you'll be sent back to LevelCode when you're done."
                : "Manage your plan, keys, and usage."}
            </p>
          </div>

          <div className="mt-8 rounded-md border border-[var(--c-line)] bg-[var(--c-surface)] p-7">
            {errorCode ? (
              <div
                role="alert"
                className="mb-5 rounded-[4px] border border-red-500/50 bg-red-500/10 px-4 py-3 text-[13px] text-red-500"
              >
                {SIGNIN_ERRORS[errorCode] ?? "Sign-in failed. Please try again."}
              </div>
            ) : null}
            <ProviderSignIn
              redirectUri={editorHandoff?.redirectUri}
              codeChallenge={editorHandoff?.codeChallenge}
            />

            <div className="my-5 flex items-center gap-3 text-[var(--c-text3)]" aria-hidden="true">
              <span className="flex-1 border-t border-[var(--c-line)]" />
              <span className="text-[11px] font-semibold uppercase tracking-widest">or</span>
              <span className="flex-1 border-t border-[var(--c-line)]" />
            </div>

            <EmailSignIn
              redirectUri={editorHandoff?.redirectUri}
              codeChallenge={editorHandoff?.codeChallenge}
            />
          </div>

          <p className="mt-5 text-center text-[13px] text-[var(--c-text3)]">
            By continuing you agree to the{" "}
            <Link to="/terms" className="text-[var(--c-accent)] hover:underline">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link to="/privacy" className="text-[var(--c-accent)] hover:underline">
              Privacy Policy
            </Link>
            . Bring your own key — we never resell provider access.
          </p>
        </div>
      </main>
    </ClassicShell>
  );
}
