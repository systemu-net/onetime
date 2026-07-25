import { Link } from "react-router-dom";
import type { ReactNode } from "react";

// <CardGroup> / <Card title="…" href="…"> — the "where to next" grid that ends
// most pages. A Card with an href is a router link; without one it's a plain box,
// which is how feature summaries are laid out mid-page.

export function Card({
  title,
  href,
  children,
}: {
  title: string;
  href?: string;
  children?: ReactNode;
}) {
  const inner = (
    <>
      <span className="flex items-center gap-1.5 text-[15px] font-semibold text-[var(--c-text)]">
        {title}
        {href ? (
          <svg
            viewBox="0 0 16 16"
            width="12"
            height="12"
            fill="currentColor"
            aria-hidden
            className="text-[var(--c-text3)] transition-transform duration-150 group-hover:translate-x-0.5 group-hover:text-[var(--c-accent)]"
          >
            <path d="M8.22 2.97a.75.75 0 0 1 1.06 0l4.25 4.25a.75.75 0 0 1 0 1.06l-4.25 4.25a.75.75 0 0 1-1.06-1.06l2.97-2.97H3.75a.75.75 0 0 1 0-1.5h7.44L8.22 4.03a.75.75 0 0 1 0-1.06Z" />
          </svg>
        ) : null}
      </span>
      {children ? (
        <span className="mt-1.5 block text-[14px] leading-relaxed text-[var(--c-text2)]">
          {children}
        </span>
      ) : null}
    </>
  );

  const box =
    "group block rounded-md border border-[var(--c-line)] bg-[var(--c-surface)] p-4 no-underline transition-colors";

  if (!href) return <div className={box}>{inner}</div>;

  return (
    <Link to={href} className={`${box} hover:border-[var(--c-accent)]`}>
      {inner}
    </Link>
  );
}

export function CardGroup({ cols = 2, children }: { cols?: 1 | 2 | 3; children: ReactNode }) {
  const grid = cols === 1 ? "sm:grid-cols-1" : cols === 3 ? "sm:grid-cols-3" : "sm:grid-cols-2";
  return <div className={`my-6 grid grid-cols-1 gap-3 ${grid}`}>{children}</div>;
}
