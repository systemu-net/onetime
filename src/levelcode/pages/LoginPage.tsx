import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { api, navigateTo } from "../api";
import { useSession } from "../auth";
import LevelNav from "../components/LevelNav";
import EmailSignIn from "./EmailSignIn";

// Sign-in error codes bounced back here with ?error= (editor link-expiry, or a stale session).
const SIGNIN_ERRORS: Record<string, string> = {
  session_expired: "Your sign-in session expired. Please try again.",
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
                {SIGNIN_ERRORS[errorCode] ?? "Sign-in failed. Please try again."}
              </div>
            ) : null}
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
