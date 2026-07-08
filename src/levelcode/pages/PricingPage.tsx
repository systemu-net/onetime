import { useEffect, useState } from "react";
import { api, type Pricing, type PricingTier } from "../api";
import { useSession } from "../auth";
import LevelNav from "../components/LevelNav";
import PricingCards from "./PricingCards";

// Server-truth pricing (SPEC §6 plan_catalog via GET /pricing, public).
export default function PricingPage() {
  const { profile } = useSession();
  const [tiers, setTiers] = useState<PricingTier[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    api<Pricing>("/api/levelcode/v1/pricing")
      .then((d) => {
        if (alive) setTiers(d.tiers ?? []);
      })
      .catch(() => {
        if (alive) setError("Pricing is temporarily unavailable. Please try again shortly.");
      });
    return () => {
      alive = false;
    };
  }, []);

  return (
    <>
      <LevelNav />
      <main className="mx-auto max-w-6xl px-5 py-28">
        <div className="lineno mb-4">04 · pricing</div>
        <h1 className="max-w-3xl font-display text-[clamp(2rem,4.5vw,3.2rem)] font-semibold leading-[1.04] tracking-tightest text-balance">
          Plans that scale with your orbit
        </h1>
        <p className="mt-5 max-w-xl text-[17px] leading-relaxed text-sub pretty">
          Every plan is bring-your-own-key by default. Switch on the gateway and your monthly token cap is all
          you pay — we never mark up the provider.
        </p>

        {error ? (
          <div className="surface mt-12 p-8 text-[15px] text-sub">{error}</div>
        ) : (
          <PricingCards tiers={tiers} authed={!!profile} currentPlan={profile?.plan ?? null} />
        )}
      </main>
    </>
  );
}
