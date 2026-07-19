import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { initials, useSession } from "../../auth";

// Ported from levelcode.dev's nav and re-skinned to the account app's cream palette. Section links scroll
// the single-page landing; Download / Sign in / Account are wired to the /ai flows (no theme toggle — the
// account app keeps its one paper-and-ink theme).
const GITHUB = "https://github.com/levelcodeai/levelcode";

const links = [
  { href: "#runtime", label: "Runtime" },
  { href: "#sketches", label: "Sketches" },
  { href: "#systems", label: "Systems" },
  { href: "#models", label: "Models" },
];

export default function LandingNav() {
  const { profile } = useSession();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-colors duration-300 ${
        scrolled ? "border-b border-rule bg-paper/85 backdrop-blur-md" : "border-b border-transparent"
      }`}
    >
      <nav className="mx-auto flex h-14 max-w-6xl items-center justify-between px-5">
        <a href="#top" className="font-display text-[15px] font-bold tracking-tightest text-ink">
          Level<span className="pp">Code</span>.ai
        </a>

        <div className="hidden items-center gap-7 lg:flex">
          {links.map((l) => (
            <a key={l.href} href={l.href} className="text-sm text-sub transition-colors hover:text-flame">
              {l.label}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <a
            href={GITHUB}
            target="_blank"
            rel="noreferrer"
            className="hidden items-center gap-2 rounded-full border border-rule bg-card px-3 py-1.5 text-sm text-sub transition-colors hover:border-ink hover:text-ink sm:inline-flex"
          >
            GitHub
          </a>
          <Link
            to="/download"
            className="rounded-full bg-flame px-4 py-1.5 text-sm font-semibold text-paper transition-colors hover:bg-flamedeep"
          >
            Download
          </Link>

          {profile ? (
            <Link
              to="/account"
              title="Account"
              aria-label="Account"
              className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-rule bg-card text-[12px] font-semibold text-ink transition-colors hover:border-ink"
            >
              {initials(profile.name, profile.email)}
            </Link>
          ) : (
            <Link
              to="/login"
              className="hidden items-center gap-2 rounded-full border border-rule bg-card px-3 py-1.5 text-sm text-sub transition-colors hover:border-ink hover:text-ink sm:inline-flex"
            >
              Sign in
            </Link>
          )}
        </div>
      </nav>
    </header>
  );
}
