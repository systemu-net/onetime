import { MDXProvider } from "@mdx-js/react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { useLocation } from "react-router-dom";
import ClassicShell from "../classic/ClassicShell";
import { DOCS_FLAT } from "../../docs/nav";
import Pager from "./Pager";
import Sidebar, { MobileNav } from "./Sidebar";
import Toc from "./Toc";
import { mdxComponents } from "./mdxComponents";
import { scrollToElement, scrollToTop } from "./scrollToElement";

// The docs shell: the classic nav and footer from ClassicShell, then
// tree / article / on-this-page. The rails collapse in order as the viewport
// narrows — the on-this-page rail goes first (it is a convenience), the tree
// becomes a disclosure at `lg`, and the article keeps a measured line length the
// whole way down.
//
// Three things this owns that a statically-rendered docs site gets for free:
//   * the document title, taken from docs/nav.ts so it can't drift from the sidebar
//   * scroll behaviour — a router navigation doesn't move the viewport, so without
//     this you land mid-page on the next doc, or a #deep-link is ignored
//   * coping with content that arrives LATE: the pages live in a lazy chunk, so on
//     a cold deep-link the article is still empty when the effects first run.

/**
 * Counts mutations inside the article. Both the rail and the deep-link scroll need
 * to react to content appearing, and this is the one signal that covers the lazy
 * chunk resolving, a route change, and any later dynamic content alike.
 */
function useArticleRevision(): number {
  const [revision, setRevision] = useState(0);
  useEffect(() => {
    const article = document.querySelector("article");
    if (!article) return;
    const observer = new MutationObserver(() => setRevision((r) => r + 1));
    observer.observe(article, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, []);
  return revision;
}

function useDocumentTitle(pathname: string) {
  useEffect(() => {
    const entry = DOCS_FLAT.find((d) => d.href === pathname);
    const previousTitle = document.title;
    document.title = entry ? `${entry.title} — LevelCode Docs` : "LevelCode Docs";

    const meta = document.querySelector('meta[name="description"]');
    const previousDesc = meta?.getAttribute("content") ?? null;
    if (meta && entry) meta.setAttribute("content", entry.blurb);

    return () => {
      document.title = previousTitle;
      if (meta && previousDesc !== null) meta.setAttribute("content", previousDesc);
    };
  }, [pathname]);
}

/**
 * Scroll on navigation: to the #target if there is one, else to the top.
 *
 * Retries as the article changes, because on a cold deep-link the target is inside
 * a chunk that hasn't loaded yet. `handled` makes it one-shot per destination, so
 * opening an accordion or switching a tab later — both of which mutate the article
 * — can't yank the viewport back.
 */
function useScrollBehaviour(pathname: string, hash: string, revision: number) {
  const handled = useRef("");

  useEffect(() => {
    const destination = pathname + hash;

    if (!hash) {
      if (handled.current !== destination) {
        handled.current = destination;
        scrollToTop();
      }
      return;
    }

    if (handled.current === destination) return;
    const target = document.getElementById(decodeURIComponent(hash.slice(1)));
    if (!target) return; // content not mounted yet — try again on the next revision

    // Marked handled only once the scroll LANDS. An early attempt runs while the
    // lazy chunk is still rendering, when the document is too short to scroll that
    // far and the browser clamps to the top; claiming success there would strand
    // the reader at the top of the page with no retry.
    const attempt = () => {
      if (scrollToElement(target)) handled.current = destination;
    };

    // Once now, and once on the next frame. The frame lets an <Accordion> that
    // opens on this same hash finish expanding, so we don't land at its
    // pre-open offset — but rAF never fires while the tab is in the background
    // (open-in-new-tab is exactly how deep links get followed), so the immediate
    // attempt is what makes it work there. Repeats are harmless: the first one to
    // land wins and the rest return early.
    attempt();
    requestAnimationFrame(attempt);
  }, [pathname, hash, revision]);
}

export default function DocsLayout({ children }: { children: ReactNode }) {
  const { pathname, hash } = useLocation();
  const revision = useArticleRevision();
  useDocumentTitle(pathname);
  useScrollBehaviour(pathname, hash, revision);

  return (
    <ClassicShell>
      <MobileNav />

      <div className="mx-auto max-w-[88rem] px-5">
        <div className="lg:grid lg:grid-cols-[14rem_minmax(0,1fr)] lg:gap-10 xl:grid-cols-[14rem_minmax(0,1fr)_13rem]">
          <Sidebar />

          <main className="min-w-0 py-10 lg:py-12">
            <article className="max-w-[46rem]">
              <MDXProvider components={mdxComponents}>{children}</MDXProvider>
            </article>
            <div className="max-w-[46rem]">
              <Pager />
            </div>
          </main>

          <div className="hidden xl:block">
            <div className="sticky top-0 max-h-screen overflow-y-auto py-12">
              <Toc revision={revision} />
            </div>
          </div>
        </div>
      </div>
    </ClassicShell>
  );
}
