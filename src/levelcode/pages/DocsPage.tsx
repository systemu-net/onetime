import { Suspense, lazy } from "react";
import DocsLayout from "../components/docs/DocsLayout";

// The shell is eager (it is small, and shares ClassicShell with the rest of the
// app) while the pages themselves are one lazy chunk — see docs/bundle.tsx for
// why. Suspending INSIDE the layout means the nav, sidebar and footer paint
// immediately and only the article waits, so a docs link never flashes a blank
// screen.
const DocsBundle = lazy(() => import("../docs/bundle"));

export default function DocsPage({ slug = "" }: { slug?: string }) {
  return (
    <DocsLayout>
      <Suspense fallback={<ArticleSkeleton />}>
        <DocsBundle slug={slug} />
      </Suspense>
    </DocsLayout>
  );
}

/** Placeholder at roughly the shape of a doc page, so the layout doesn't jump. */
function ArticleSkeleton() {
  return (
    <div aria-hidden className="animate-pulse">
      <div className="h-9 w-2/3 rounded bg-[var(--c-surface)]" />
      <div className="mt-6 h-4 w-full rounded bg-[var(--c-surface)]" />
      <div className="mt-3 h-4 w-11/12 rounded bg-[var(--c-surface)]" />
      <div className="mt-3 h-4 w-4/5 rounded bg-[var(--c-surface)]" />
      <div className="mt-10 h-6 w-1/3 rounded bg-[var(--c-surface)]" />
      <div className="mt-5 h-4 w-full rounded bg-[var(--c-surface)]" />
      <div className="mt-3 h-4 w-10/12 rounded bg-[var(--c-surface)]" />
      <span className="sr-only">Loading documentation…</span>
    </div>
  );
}
