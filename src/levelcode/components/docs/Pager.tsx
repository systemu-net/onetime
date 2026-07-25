import { Link, useLocation } from "react-router-dom";
import { docNeighbors } from "../../docs/nav";

// Previous / next in sidebar order, so the docs can be read straight through.
// Order comes from docs/nav.ts, which means adding a page in the middle re-links
// its neighbours automatically.

export default function Pager() {
  const { pathname } = useLocation();
  const { prev, next } = docNeighbors(pathname);
  if (!prev && !next) return null;

  return (
    <nav
      aria-label="Page navigation"
      className="mt-14 grid grid-cols-1 gap-3 border-t border-[var(--c-line)] pt-6 sm:grid-cols-2"
    >
      {prev ? (
        <Link
          to={prev.href}
          className="group rounded-md border border-[var(--c-line)] px-4 py-3 no-underline transition-colors hover:border-[var(--c-accent)]"
        >
          <span className="block text-[12px] uppercase tracking-wide text-[var(--c-text3)]">
            Previous
          </span>
          <span className="mt-0.5 block text-[15px] font-medium text-[var(--c-text)] group-hover:text-[var(--c-accent)]">
            {prev.title}
          </span>
        </Link>
      ) : (
        <span />
      )}

      {next ? (
        <Link
          to={next.href}
          className="group rounded-md border border-[var(--c-line)] px-4 py-3 text-right no-underline transition-colors hover:border-[var(--c-accent)] sm:col-start-2"
        >
          <span className="block text-[12px] uppercase tracking-wide text-[var(--c-text3)]">Next</span>
          <span className="mt-0.5 block text-[15px] font-medium text-[var(--c-text)] group-hover:text-[var(--c-accent)]">
            {next.title}
          </span>
        </Link>
      ) : null}
    </nav>
  );
}
