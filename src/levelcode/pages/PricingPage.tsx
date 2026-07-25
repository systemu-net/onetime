import { useEffect, useState } from "react";
import { api, type Pricing, type PricingTier } from "../api";
import { useSession } from "../auth";
import ClassicShell from "../components/classic/ClassicShell";
import PricingCards from "./PricingCards";

// Server-truth pricing (SPEC §6 plan_catalog via GET /pricing, public) — LevelCode Classic
// (atom.io-heritage) framing: flat, centered, hairline rules. Same scoping as the landing.
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
    <ClassicShell>
      <section className="border-b border-[var(--c-line)] bg-[var(--c-surface)]">
        <div className="mx-auto max-w-5xl px-5 py-12 text-center">
          <h1 className="text-[30px] font-bold tracking-tight text-[var(--c-text)] sm:text-[36px]">
            Plans that scale as you ship
          </h1>
          <p className="mx-auto mt-3 max-w-xl pretty">
            Every plan is bring-your-own-key by default — free, forever. Switch on the gateway and
            your monthly credit is all you pay; we never mark up the provider.
          </p>
        </div>
      </section>

      <section>
        <div className="mx-auto max-w-5xl px-5 py-12">
          {error ? (
            <div className="rounded-md border border-[var(--c-line)] bg-[var(--c-surface)] p-8 text-center text-[15px]">
              {error}
            </div>
          ) : (
            <PricingCards tiers={tiers} authed={!!profile} currentPlan={profile?.plan ?? null} />
          )}

          <p className="mt-10 text-center text-[13px] text-[var(--c-text3)]">
            All plans include the full editor — it&rsquo;s free and open source. Plans meter the
            managed AI gateway only.
          </p>
        </div>
      </section>
    </ClassicShell>
  );
}
