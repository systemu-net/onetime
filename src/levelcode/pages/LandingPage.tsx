import { Link } from "react-router-dom";
import LevelNav from "../components/LevelNav";

// Minimal branded index for /ai. The full marketing landing stays on the
// Vercel site (levelcode.ai) for now; this is the account-app entry.
export default function LandingPage() {
  return (
    <>
      <LevelNav />
      <main className="mx-auto flex min-h-[100svh] max-w-6xl flex-col justify-center px-5 py-28">
        <div className="max-w-2xl">
          <div className="lineno mb-4">00 · levelcode cloud</div>
          <h1 className="font-display text-[clamp(2.2rem,6vw,4rem)] font-semibold leading-[1.02] tracking-tightest text-balance">
            Your plan, keys, and usage — <span className="pp">one</span> account.
          </h1>
          <p className="mt-6 max-w-xl text-[17px] leading-relaxed text-sub pretty">
            Bring your own key and run free and direct, or switch on the metered gateway. No middleman markup —
            your monthly token cap is all you pay.
          </p>
          <div className="mt-9 flex flex-wrap items-center gap-3">
            <Link to="/pricing" className="btn-primary">
              See plans
            </Link>
            <Link to="/login" className="btn-ghost">
              Sign in
            </Link>
          </div>
          <p className="mt-6 font-mono text-[12px] text-faint">
            Bring-your-own-key is always free and direct. Gateway plans are metered.
          </p>
        </div>
      </main>
    </>
  );
}
