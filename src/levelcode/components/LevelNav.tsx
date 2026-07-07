import { Link } from "react-router-dom";
import { initials, useSession } from "../auth";

const GITHUB = "https://github.com/levelcodeai/levelcode";
// Marketing / download lives on the separate Vercel site.
const MARKETING = "https://levelcode.ai";
// Bare launch deep-link (NO credential in the URL). The editor handles it: it focuses
// and, if not signed in, runs its own PKCE sign-in — which this already-authenticated
// browser completes silently (see LoginPage auto-complete). Keeping the credential out
// of the custom-scheme URL is the fix for the interceptable-unbound-code issue.
const IDE_LAUNCH = "levelcode://levelcode.levelcode-ai/launch";

// Account-app top nav (paper-and-ink). Probes the Devise session to render an
// avatar when signed in, else a Sign-in link.
export default function LevelNav() {
  const { profile } = useSession();

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-rule bg-paper/85 backdrop-blur-md">
      <nav className="mx-auto flex h-14 max-w-6xl items-center justify-between px-5">
        <Link to="/" className="font-display text-[15px] font-bold tracking-tightest">
          LevelCode <span className="font-medium text-faint">Cloud</span>
        </Link>

        <div className="flex items-center gap-3">
          <Link to="/pricing" className="hidden text-sm text-sub transition-colors hover:text-flame sm:inline">
            Pricing
          </Link>
          <a
            href={GITHUB}
            target="_blank"
            rel="noreferrer"
            className="hidden items-center gap-2 rounded-full border border-rule bg-card px-3 py-1.5 text-sm text-sub transition-colors hover:border-ink hover:text-ink sm:inline-flex"
          >
            GitHub
          </a>
          <a
            href={MARKETING}
            className="rounded-full bg-ink px-4 py-1.5 text-sm font-semibold text-paper transition-colors hover:bg-flame"
          >
            Download
          </a>

          {profile ? (
            <>
              {profile.role === "admin" ? (
                <Link
                  to="/admin"
                  className="hidden text-sm text-sub transition-colors hover:text-flame sm:inline"
                >
                  Admin
                </Link>
              ) : null}
              <a
                href={IDE_LAUNCH}
                title="Open the LevelCode editor (signs it into this account)"
                className="inline-flex items-center gap-1 rounded-full border border-rule bg-card px-3 py-1.5 text-sm text-sub transition-colors hover:border-ink hover:text-ink"
              >
                IDE <span aria-hidden="true">↗</span>
              </a>
              <Link
                to="/account"
                title="Account"
                aria-label="Account"
                className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-rule bg-card text-[12px] font-semibold text-ink transition-colors hover:border-ink"
              >
                {initials(profile.name, profile.email)}
              </Link>
            </>
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
