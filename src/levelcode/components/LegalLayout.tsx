import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import LevelNav from "./LevelNav";

/**
 * Shared shell for the LevelCode legal pages (paper-and-ink design, matches the SPA).
 *
 * NOTE: The copy in TermsPage / PrivacyPage is a good-faith DRAFT written to reflect
 * LevelCode's actual practices (Stripe billing, the OpenRouter-backed AI gateway, BYOK,
 * rolling usage windows). It is NOT legal advice — have counsel review it, and fill in the
 * operating entity + governing-law jurisdiction, before treating these as binding.
 */
export default function LegalLayout({
  eyebrow,
  title,
  updated,
  intro,
  children,
}: {
  eyebrow: string;
  title: string;
  updated: string;
  intro: ReactNode;
  children: ReactNode;
}) {
  return (
    <>
      <LevelNav />
      <main className="mx-auto max-w-3xl px-5 py-24">
        <div className="lineno mb-4">{eyebrow}</div>
        <h1 className="font-display text-[clamp(2rem,5vw,3rem)] font-semibold leading-[1.05] tracking-tightest text-balance">
          {title}
        </h1>
        <p className="mt-4 font-mono text-[12px] text-faint">Last updated: {updated}</p>
        <p className="mt-6 max-w-2xl text-[16px] leading-relaxed text-sub pretty">{intro}</p>

        <div className="mt-10 space-y-9">{children}</div>

        <div className="mt-16 border-t border-rule pt-6 font-mono text-[12px] text-faint">
          <Link to="/terms" className="underline decoration-rule underline-offset-4 transition-colors hover:text-ink">
            Terms
          </Link>
          <span className="px-2">·</span>
          <Link to="/privacy" className="underline decoration-rule underline-offset-4 transition-colors hover:text-ink">
            Privacy
          </Link>
          <span className="px-2">·</span>
          <Link to="/" className="underline decoration-rule underline-offset-4 transition-colors hover:text-ink">
            levelcode.ai
          </Link>
        </div>
      </main>
    </>
  );
}

/** A titled legal section. */
export function LegalSection({ id, heading, children }: { id?: string; heading: string; children: ReactNode }) {
  return (
    <section id={id} className="scroll-mt-24">
      <h2 className="font-display text-xl font-semibold tracking-tight text-ink">{heading}</h2>
      <div className="mt-3 space-y-3 text-[15px] leading-relaxed text-sub pretty">{children}</div>
    </section>
  );
}
