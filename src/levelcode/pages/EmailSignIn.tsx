import { useState } from "react";
import { api, ApiError, navigateTo } from "../api";

// Passwordless email + one-time-code sign-in (OpenRouter/Cursor style):
//   1. enter email → POST /ai/auth/email        (Rails emails a 6-digit code)
//   2. enter code  → POST /ai/auth/verify → { redirect }  (editor deep-link or /ai/account)
// redirectUri + codeChallenge (from the editor) are threaded through so the
// one-time handoff code is bound to the editor's PKCE verifier.
export default function EmailSignIn({
  redirectUri,
  codeChallenge,
}: {
  redirectUri?: string;
  codeChallenge?: string;
}) {
  const [step, setStep] = useState<"email" | "code">("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function sendCode(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await api("/ai/auth/email", { body: { email } });
      setStep("code");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't send a code. Try again.");
    } finally {
      setBusy(false);
    }
  }

  async function verify(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const d = await api<{ redirect?: string }>("/ai/auth/verify", {
        body: { email, code, redirect_uri: redirectUri, code_challenge: codeChallenge },
      });
      if (!d.redirect) throw new ApiError(422, "That code is invalid or has expired.");

      if (d.redirect.startsWith("atom-plus-plus:")) {
        // Editor deep-link (custom scheme): navigating to it is a no-op if the
        // editor isn't installed on this device — arm a fallback so the button
        // doesn't freeze on "Verifying…". pagehide firing means the OS handler
        // took over, so cancel the fallback.
        const t = window.setTimeout(() => {
          setBusy(false);
          setError("Open LevelCode to finish signing in. If nothing happened, the editor may not be installed on this device.");
        }, 1500);
        window.addEventListener("pagehide", () => window.clearTimeout(t), { once: true });
        navigateTo(d.redirect);
        return;
      }

      navigateTo(d.redirect); // web: full-page nav to /ai/account (session cookie now set)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "That code is invalid or has expired.");
      setBusy(false);
    }
    // On the web path we navigate away — no finally-unset.
  }

  if (step === "email") {
    return (
      <form onSubmit={sendCode} className="flex flex-col gap-3">
        <label className="flex flex-col gap-1">
          <span className="font-mono text-[11px] uppercase tracking-widest text-faint">Email</span>
          <input
            type="email"
            required
            autoFocus
            autoComplete="email"
            value={email}
            onChange={(ev) => setEmail(ev.target.value)}
            placeholder="you@studio.dev"
            className="rounded-lg border border-rule bg-card px-3 py-2.5 text-[15px] text-ink outline-none transition-colors focus:border-flame"
          />
        </label>
        {error ? <p className="text-[13px] text-red-600">{error}</p> : null}
        <button type="submit" disabled={busy} className="btn-primary w-full justify-center">
          {busy ? "Sending…" : "Email me a sign-in code"}
        </button>
      </form>
    );
  }

  return (
    <form onSubmit={verify} className="flex flex-col gap-3">
      <p className="text-[13px] text-sub">
        We sent a 6-digit code to <span className="font-medium text-ink">{email}</span>. Enter it below.
      </p>
      <label className="flex flex-col gap-1">
        <span className="font-mono text-[11px] uppercase tracking-widest text-faint">Verification code</span>
        <input
          inputMode="numeric"
          autoComplete="one-time-code"
          pattern="[0-9]*"
          maxLength={6}
          required
          autoFocus
          value={code}
          onChange={(ev) => setCode(ev.target.value.replace(/\D/g, "").slice(0, 6))}
          placeholder="000000"
          className="rounded-lg border border-rule bg-card px-3 py-2.5 text-center text-[22px] font-semibold tracking-[0.4em] text-ink outline-none transition-colors focus:border-flame"
        />
      </label>
      {error ? <p className="text-[13px] text-red-600">{error}</p> : null}
      <button type="submit" disabled={busy || code.length < 6} className="btn-primary w-full justify-center">
        {busy ? "Verifying…" : "Verify & continue"}
      </button>
      <div className="flex items-center justify-between font-mono text-[12px] text-faint">
        <button type="button" onClick={sendCode} disabled={busy} className="underline decoration-rule underline-offset-4 hover:text-ink">
          Resend code
        </button>
        <button
          type="button"
          onClick={() => {
            setStep("email");
            setCode("");
            setError(null);
          }}
          className="underline decoration-rule underline-offset-4 hover:text-ink"
        >
          Use a different email
        </button>
      </div>
    </form>
  );
}
