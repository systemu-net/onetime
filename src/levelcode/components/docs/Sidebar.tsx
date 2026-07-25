import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { DOCS_NAV } from "../../docs/nav";

// The docs tree, in two shapes off one list: `MobileNav` is a full-bleed
// disclosure that sits under the site nav on small screens, `Sidebar` is the
// sticky rail from `lg` up. The layout places each where it belongs, which keeps
// the mobile bar edge-to-edge instead of inheriting the content grid's padding.

function NavList({ onNavigate }: { onNavigate?: () => void }) {
  const { pathname } = useLocation();

  return (
    <nav aria-label="Documentation" className="text-[14px]">
      {DOCS_NAV.map((group) => (
        <div key={group.group} className="mb-6 last:mb-0">
          <p className="mb-2 text-[12px] font-semibold uppercase tracking-wide text-[var(--c-text3)]">
            {group.group}
          </p>
          <ul className="space-y-0.5 border-l border-[var(--c-line)]">
            {group.items.map((item) => {
              const active = pathname === item.href;
              return (
                <li key={item.href}>
                  <Link
                    to={item.href}
                    onClick={onNavigate}
                    aria-current={active ? "page" : undefined}
                    className={`-ml-px block border-l py-1 pl-3 transition-colors ${
                      active
                        ? "border-[var(--c-accent)] font-medium text-[var(--c-accent)]"
                        : "border-transparent text-[var(--c-text2)] hover:border-[var(--c-line)] hover:text-[var(--c-text)]"
                    }`}
                  >
                    {item.title}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}

export function MobileNav() {
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);

  // Route changed → the menu has done its job. Without this, tapping a link on a
  // phone leaves the open menu covering the page you just asked for.
  useEffect(() => setOpen(false), [pathname]);

  return (
    <div className="border-b border-[var(--c-line)] lg:hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls="docs-mobile-nav"
        className="flex w-full items-center gap-2 px-5 py-3 text-[14px] font-medium text-[var(--c-text)]"
      >
        <svg
          viewBox="0 0 16 16"
          width="12"
          height="12"
          fill="currentColor"
          aria-hidden
          className={`text-[var(--c-text3)] transition-transform duration-150 ${open ? "rotate-90" : ""}`}
        >
          <path d="M6.22 3.22a.75.75 0 0 1 1.06 0l4.25 4.25a.75.75 0 0 1 0 1.06l-4.25 4.25a.75.75 0 0 1-1.06-1.06L9.94 8 6.22 4.28a.75.75 0 0 1 0-1.06Z" />
        </svg>
        Documentation menu
      </button>
      {open ? (
        <div id="docs-mobile-nav" className="px-5 pb-5">
          <NavList onNavigate={() => setOpen(false)} />
        </div>
      ) : null}
    </div>
  );
}

export default function Sidebar() {
  return (
    <aside className="hidden lg:block">
      <div className="sticky top-0 max-h-screen overflow-y-auto py-12 pr-6">
        <NavList />
      </div>
    </aside>
  );
}
