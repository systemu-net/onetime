import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api, ApiError, navigateTo, type PricingTier } from "../api";

// 4-card grid. Checkout goes through /ai/checkout (CSRF-protected, session-authed).
// tier.key IS the Stripe lookup_key (server truth) — send it verbatim. The server
// returns one of two shapes:
//   • first purchase   → { url }                       — redirect to Stripe Checkout
//   • plan change       → { status: "plan_changed", … } — Stripe prorated it in place
//     (no redirect); we land on the account page, which reflects the new plan once
//     the Stripe webhook syncs.
//
// `currentPlan` is the signed-in user's friendly plan NAME (AccountProfile.plan,
// e.g. "Pro" / "Free"); the tier whose name matches is marked as current and its
// checkout button is disabled, so we never invite a user to buy the plan they're on.
export default function PricingCards({
  tiers,
  authed,
  currentPlan,
}: {
  tiers: PricingTier[];
  authed: boolean;
  currentPlan?: string | null;
}) {
  const navigate = useNavigate();
  const [busy, setBusy] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const norm = (s?: string | null) => (s ?? "").trim().toLowerCase();
  const isCurrentPlan = (tier: PricingTier) => authed && !!currentPlan && norm(currentPlan) === norm(tier.name);

  async function checkout(tier: PricingTier) {
    setErr(null);
    if (!authed) {
      navigate("/login");
      return;
    }
    setBusy(tier.key);
    try {
      const d = await api<{ url?: string; status?: string }>("/ai/checkout", { body: { lookup_key: tier.key } });
      // First purchase → redirect to Stripe Checkout.
      if (d.url) {
        navigateTo(d.url);
        return;
      }
      // Upgrade / downgrade → Stripe prorated it in place, no redirect. Go to the account
      // page (it refetches usage + plan; the change lands once the webhook syncs).
      if (d.status === "plan_changed") {
        navigate("/account?checkout=changed");
        return;
      }
      setErr("Could not start checkout.");
      setBusy(null);
    } catch (e) {
      setErr(e instanceof ApiError ? e.message : "Could not start checkout.");
      setBusy(null);
    }
  }

  return (
    <>
      {err ? (
        <p className="mb-4 text-center text-[13px] text-red-500" role="alert">
          {err}
        </p>
      ) : null}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {tiers.map((tier, i) => {
          const featured = i === 1; // pro_plus — the recommended tier
          const current = isCurrentPlan(tier);
          return (
            <div
              key={tier.key}
              className={`flex flex-col rounded-md border bg-[var(--c-bg)] p-6 ${
                current || featured ? "border-[var(--c-accent)]" : "border-[var(--c-line)]"
              } ${current ? "shadow-[0_0_0_1px_var(--c-accent)]" : ""}`}
            >
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-[var(--c-text)]">{tier.name}</h3>
                {current ? (
                  <span className="rounded-[3px] bg-[var(--c-accent)] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-widest text-white">
                    current
                  </span>
                ) : featured ? (
                  <span className="rounded-[3px] border border-[var(--c-accent)] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-widest text-[var(--c-accent)]">
                    popular
                  </span>
                ) : null}
              </div>

              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-3xl font-bold tracking-tight text-[var(--c-text)]">{formatPrice(tier.price_cents)}</span>
                <span className="text-sm text-[var(--c-text3)]">/{tier.interval || "mo"}</span>
              </div>

              <dl className="mt-5 space-y-1.5 font-mono text-[12px] text-[var(--c-text2)]">
                <div className="flex justify-between">
                  <dt className="text-[var(--c-text3)]">input</dt>
                  <dd className="tabular-nums">{formatTokens(tier.input_cap)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-[var(--c-text3)]">output</dt>
                  <dd className="tabular-nums">{formatTokens(tier.output_cap)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-[var(--c-text3)]">turns</dt>
                  <dd className="tabular-nums">{(tier.turns ?? 0).toLocaleString()}</dd>
                </div>
              </dl>

              <ul className="mt-5 flex-1 space-y-2 text-[13px] text-[var(--c-text2)]">
                {(tier.features ?? []).map((f) => (
                  <li key={f} className="flex gap-2">
                    <span className="mt-1.5 h-1 w-1 flex-none rounded-full bg-[var(--c-accent)]" />
                    <span className="pretty">{f}</span>
                  </li>
                ))}
              </ul>

              {current ? (
                <button
                  type="button"
                  disabled
                  aria-disabled="true"
                  className="classic-button--quiet mt-6 w-full cursor-default opacity-70"
                >
                  ✓ Current plan
                </button>
              ) : (
                <button
                  onClick={() => checkout(tier)}
                  disabled={busy === tier.key}
                  className={`mt-6 w-full ${featured ? "classic-button" : "classic-button--quiet"}`}
                >
                  {busy === tier.key ? "Starting…" : authed ? "Choose plan" : "Sign in to start"}
                </button>
              )}
            </div>
          );
        })}
      </div>
    </>
  );
}

function formatPrice(cents: number): string {
  const dollars = cents / 100;
  return `$${dollars % 1 === 0 ? dollars.toFixed(0) : dollars.toFixed(2)}`;
}

function formatTokens(n: number): string {
  if (n >= 1_000_000) return `${+(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${+(n / 1_000).toFixed(0)}K`;
  return (n ?? 0).toLocaleString();
}
