import { useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { initials, useSession } from "../../auth";

// The shared LevelCode Classic scaffolding (atom.io-heritage): theme state, the flat
// top-bar, the optional heritage strip, and the octicon footer. Everything scoped
// under `.classic` / `.classic--dark` (globals.css). Originally logged-out-only; per
// owner direction the WHOLE app now uses it — landing, pricing, login, legal, and the
// signed-in Account/Admin dashboard.

export const GITHUB = "https://github.com/levelcodeai/levelcode";

type Theme = "light" | "dark";

// Same behavior as levelcode.dev's switcher: stored choice wins, else the OS
// preference, else light.
function initialTheme(): Theme {
  try {
    const t = localStorage.getItem("lc-theme");
    if (t === "dark" || t === "light") return t;
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  } catch {
    return "light";
  }
}

export default function ClassicShell({
  children,
  strip = false,
}: {
  children: ReactNode;
  strip?: boolean;
}) {
  const [theme, setTheme] = useState<Theme>(initialTheme);
  const toggleTheme = () =>
    setTheme((t) => {
      const next: Theme = t === "light" ? "dark" : "light";
      try {
        localStorage.setItem("lc-theme", next);
      } catch {
        /* private mode — the flip still applies to this visit */
      }
      return next;
    });

  return (
    <div
      className={`classic ${theme === "dark" ? "classic--dark" : ""} flex min-h-screen flex-col bg-[var(--c-bg)] text-[16px] leading-relaxed text-[var(--c-text2)]`}
    >
      <ClassicNav theme={theme} onToggleTheme={toggleTheme} />

      {strip ? (
        <p className="border-b border-[var(--c-line)] bg-[var(--c-strip)] px-5 py-2 text-center text-[13px] text-[var(--c-text)]">
          Atom was sunset on December 15, 2022.{" "}
          <a href={`${GITHUB}#readme`} className="font-medium text-[var(--c-accent)] hover:underline">
            LevelCode carries the hackable spirit forward →
          </a>
        </p>
      ) : null}

      <div className="flex-1">{children}</div>

      <footer className="bg-[var(--c-surface)]">
        <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-4 px-5 py-8 text-[14px] sm:flex-row">
          <ul className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
            <li>
              <Link className="text-[var(--c-text2)] hover:text-[var(--c-text)]" to="/terms">
                Terms of Service
              </Link>
            </li>
            <li>
              <Link className="text-[var(--c-text2)] hover:text-[var(--c-text)]" to="/privacy">
                Privacy
              </Link>
            </li>
            <li>
              <a className="text-[var(--c-text2)] hover:text-[var(--c-text)]" href={`${GITHUB}/releases`}>
                Releases
              </a>
            </li>
            <li>
              <a className="text-[var(--c-text2)] hover:text-[var(--c-text)]" href={`${GITHUB}/discussions`}>
                Discussions
              </a>
            </li>
            <li>
              <Link className="text-[var(--c-text2)] hover:text-[var(--c-text)]" to="/pricing">
                Pricing
              </Link>
            </li>
          </ul>
          <span className="flex items-center gap-1.5 text-[var(--c-text3)]">
            <CodeGlyph /> with <HeartGlyph /> by LevelCode
          </span>
        </div>
      </footer>
    </div>
  );
}

function ClassicNav({ theme, onToggleTheme }: { theme: Theme; onToggleTheme: () => void }) {
  const { profile } = useSession();

  return (
    <nav aria-label="Primary" className="border-b border-[var(--c-line)] bg-[var(--c-surface)]">
      <div className="mx-auto flex h-12 max-w-5xl items-center justify-between px-5">
        <div className="flex items-center gap-6">
          <Link to="/" className="text-[15px] font-bold text-[var(--c-text)]">
            Level<span className="text-[var(--c-accent)]">Code</span>
          </Link>
          <ul className="hidden items-center gap-5 sm:flex">
            <li>
              <a
                href={`${GITHUB}/tree/main/docs`}
                className="text-[14px] text-[var(--c-text2)] hover:text-[var(--c-text)]"
              >
                Documentation
              </a>
            </li>
            <li>
              <a href="https://open-vsx.org/" className="text-[14px] text-[var(--c-text2)] hover:text-[var(--c-text)]">
                Packages
              </a>
            </li>
            <li>
              <a
                href={`${GITHUB}/releases`}
                className="text-[14px] text-[var(--c-text2)] hover:text-[var(--c-text)]"
              >
                Releases
              </a>
            </li>
            <li>
              <Link to="/pricing" className="text-[14px] text-[var(--c-text2)] hover:text-[var(--c-text)]">
                Pricing
              </Link>
            </li>
          </ul>
        </div>

        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={onToggleTheme}
            aria-label={theme === "light" ? "Switch to dark mode" : "Switch to light mode"}
            title={theme === "light" ? "Dark mode (One Dark)" : "Light mode"}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-[var(--c-line)] bg-[var(--c-bg)] text-[var(--c-text2)] transition-colors hover:border-[var(--c-accent)] hover:text-[var(--c-text)]"
          >
            {theme === "light" ? (
              <svg viewBox="0 0 16 16" width="14" height="14" fill="currentColor" aria-hidden>
                <path d="M13.3 9.9A5.6 5.6 0 0 1 6.1 2.7a.4.4 0 0 0-.5-.5 6.4 6.4 0 1 0 8.2 8.2.4.4 0 0 0-.5-.5z" />
              </svg>
            ) : (
              <svg
                viewBox="0 0 16 16"
                width="14"
                height="14"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.4"
                strokeLinecap="round"
                aria-hidden
              >
                <circle cx="8" cy="8" r="3.2" />
                <path d="M8 1.2v1.8M8 13v1.8M1.2 8H3M13 8h1.8M3.2 3.2l1.3 1.3M11.5 11.5l1.3 1.3M12.8 3.2l-1.3 1.3M4.5 11.5l-1.3 1.3" />
              </svg>
            )}
          </button>
          {profile ? (
            <Link
              to="/account"
              title="Account"
              aria-label="Account"
              className="flex h-8 w-8 items-center justify-center rounded-full border border-[var(--c-line)] bg-[var(--c-bg)] text-[12px] font-semibold text-[var(--c-text)] hover:border-[var(--c-accent)]"
            >
              {initials(profile.name, profile.email)}
            </Link>
          ) : (
            <Link
              to="/login"
              className="flex items-center gap-1.5 text-[14px] text-[var(--c-text2)] hover:text-[var(--c-text)]"
            >
              <svg viewBox="0 0 16 16" width="14" height="14" fill="currentColor" aria-hidden>
                <path d="M10 3.75a.75.75 0 0 1 .75-.75h2.5A1.75 1.75 0 0 1 15 4.75v6.5A1.75 1.75 0 0 1 13.25 13h-2.5a.75.75 0 0 1 0-1.5h2.5a.25.25 0 0 0 .25-.25v-6.5a.25.25 0 0 0-.25-.25h-2.5a.75.75 0 0 1-.75-.75Zm-3.28.72a.75.75 0 0 1 1.06 0l3 3a.75.75 0 0 1 0 1.06l-3 3a.75.75 0 1 1-1.06-1.06l1.72-1.72H1.75a.75.75 0 0 1 0-1.5h6.69L6.72 5.53a.75.75 0 0 1 0-1.06Z" />
              </svg>
              Sign in
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}

/* the LevelCode chevron mark — small, for page headers (login etc.) */
export function ChevronMark({ size = 56 }: { size?: number }) {
  return (
    <svg viewBox="0 0 120 120" width={size} height={size} aria-hidden>
      <g fill="none" stroke="var(--c-accent)" strokeWidth="13" strokeLinecap="round" strokeLinejoin="round">
        <path d="M28 92 L60 69 L92 92" opacity="0.4" />
        <path d="M28 68 L60 45 L92 68" opacity="0.7" />
        <path d="M28 44 L60 21 L92 44" />
      </g>
    </svg>
  );
}

function CodeGlyph() {
  return (
    <svg
      viewBox="0 0 16 16"
      width="14"
      height="14"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="m5.5 4.5-3.5 3.5 3.5 3.5M10.5 4.5 14 8l-3.5 3.5" />
    </svg>
  );
}

function HeartGlyph() {
  return (
    <svg viewBox="0 0 16 16" width="14" height="14" fill="var(--c-accent)" aria-hidden>
      <path d="m8 14.25.345.666a.75.75 0 0 1-.69 0l-.008-.004-.018-.01a7.152 7.152 0 0 1-.31-.17 22.055 22.055 0 0 1-3.434-2.414C2.045 10.731 0 8.35 0 5.5 0 2.836 2.086 1 4.25 1 5.797 1 7.153 1.802 8 3.02 8.847 1.802 10.203 1 11.75 1 13.914 1 16 2.836 16 5.5c0 2.85-2.045 5.231-3.885 6.818a22.066 22.066 0 0 1-3.744 2.584l-.018.01-.006.003h-.002Z" />
    </svg>
  );
}
