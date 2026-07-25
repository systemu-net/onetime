import type { ReactNode } from "react";
import ClassicShell from "./classic/ClassicShell";

/**
 * Shared shell for the LevelCode legal pages — LevelCode Classic (atom.io-heritage):
 * a flat surface-tinted title band, then the document in a narrow reading measure.
 * Wrapped in ClassicShell, so the pages get the classic nav, the theme switcher
 * (dark = One Dark), and the octicon footer like every other logged-out surface.
 *
 * NOTE: The copy in TermsPage / PrivacyPage is a good-faith DRAFT written to reflect
 * LevelCode's actual practices (Stripe billing, the OpenRouter-backed AI gateway, BYOK,
 * rolling usage windows). It is NOT legal advice — have counsel review it, and fill in the
 * operating entity + governing-law jurisdiction, before treating these as binding.
 */
export default function LegalLayout({
  title,
  updated,
  intro,
  children,
}: {
  title: string;
  updated: string;
  intro: ReactNode;
  children: ReactNode;
}) {
  return (
    <ClassicShell>
      <section className="border-b border-[var(--c-line)] bg-[var(--c-surface)]">
        <div className="mx-auto max-w-3xl px-5 py-10 text-center">
          <h1 className="text-[30px] font-bold tracking-tight text-[var(--c-text)] sm:text-[36px]">
            {title}
          </h1>
          <p className="mt-2 text-[13px] text-[var(--c-text3)]">Last updated: {updated}</p>
        </div>
      </section>

      <main className="mx-auto max-w-3xl px-5 py-12">
        <p className="text-[16px] leading-relaxed pretty">{intro}</p>
        <div className="mt-10 space-y-9">{children}</div>
      </main>
    </ClassicShell>
  );
}

/** A titled legal section. */
export function LegalSection({
  id,
  heading,
  children,
}: {
  id?: string;
  heading: string;
  children: ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-24">
      <h2 className="text-xl font-semibold tracking-tight text-[var(--c-text)]">{heading}</h2>
      <div className="mt-3 space-y-3 text-[15px] leading-relaxed pretty">{children}</div>
    </section>
  );
}
