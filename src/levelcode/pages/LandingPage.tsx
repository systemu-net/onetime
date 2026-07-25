import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import AgentShowcase from "../components/AgentShowcase";
import ClassicShell from "../components/classic/ClassicShell";
import SketchBuilder from "../components/level/SketchBuilder";

// The /ai landing — LevelCode Classic: the 2014-2022 atom.io page structure and
// temperament, matching levelcode.dev. Flat, light, system fonts, octicon-style glyphs,
// all scoped under `.classic` (see globals.css). CTAs wire to the /ai flows (Sign in →
// /login, Pricing → /pricing, legal pages are the real /terms + /privacy routes). The
// classic design now covers the whole app, signed-in dashboard included (ClassicShell).

const GITHUB = "https://github.com/levelcodeai/levelcode";
const RELEASES = `${GITHUB}/releases/latest`;
const DMG_ARM = `${RELEASES}/download/LevelCode-arm64.dmg`;
const DMG_X64 = `${RELEASES}/download/LevelCode-x64.dmg`;
// Shown until the live lookup lands (and if it fails) — the hero normally renders the REAL
// latest release, fetched from GitHub client-side and cached per session, so it can't go stale.
const FALLBACK_VERSION = "0.9.2";

function useLatestVersion(): string {
  const [version, setVersion] = useState<string>(() => {
    try {
      return sessionStorage.getItem("lc-latest-version") || FALLBACK_VERSION;
    } catch {
      return FALLBACK_VERSION;
    }
  });
  useEffect(() => {
    try {
      if (sessionStorage.getItem("lc-latest-version")) return;
    } catch {
      /* fall through to fetch */
    }
    let alive = true;
    fetch("https://api.github.com/repos/levelcodeai/levelcode/releases/latest", {
      headers: { Accept: "application/vnd.github+json" },
    })
      .then((r) => (r.ok ? r.json() : null))
      .then((d: { tag_name?: string } | null) => {
        const v = String(d?.tag_name ?? "").replace(/^v/, "");
        if (alive && v) {
          setVersion(v);
          try {
            sessionStorage.setItem("lc-latest-version", v);
          } catch {
            /* private mode */
          }
        }
      })
      .catch(() => {
        /* keep the fallback */
      });
    return () => {
      alive = false;
    };
  }, []);
  return version;
}

export default function LandingPage() {
  const version = useLatestVersion();
  return (
    <ClassicShell strip>


      {/* ───────────────────────── HERO ───────────────────────── */}
      <section className="border-b border-[var(--c-line)] bg-[var(--c-surface)]">
        <div className="mx-auto max-w-5xl px-5 pb-14 pt-10">
          <header className="flex flex-col items-center gap-10 md:flex-row md:items-center md:justify-between">
            {/* the portal: soft circles (the atom.io homage) + the chevron mark */}
            <div aria-hidden className="relative h-[280px] w-[300px] shrink-0">
              <svg viewBox="0 0 300 280" className="h-full w-full">
                <g className="portal-layer">
                  <circle cx="118" cy="128" r="104" fill="var(--c-accent)" opacity="0.14" />
                </g>
                <g className="portal-layer">
                  <circle cx="186" cy="104" r="86" fill="#7d6bff" opacity="0.16" />
                </g>
                <g className="portal-layer">
                  <circle cx="120" cy="180" r="72" fill="#5fb4ff" opacity="0.18" />
                </g>
                <g className="portal-layer">
                  <circle cx="204" cy="182" r="58" fill="#a8ecff" opacity="0.28" />
                </g>
                <g className="portal-layer" fill="none" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M96 196 L152 152 L208 196" stroke="#5b3fd6" strokeWidth="21" opacity="0.55" />
                  <path d="M96 152 L152 108 L208 152" stroke="#7d6bff" strokeWidth="21" opacity="0.8" />
                  <path d="M96 108 L152 64 L208 108" stroke="#5fb4ff" strokeWidth="21" />
                </g>
              </svg>
            </div>

            {/* the download box — atom.io's hero-download list */}
            <ul className="w-full max-w-sm space-y-3 text-center md:text-left">
              <li className="text-[34px] font-bold leading-none tracking-tight text-[var(--c-text)]">
                Level<span className="text-[var(--c-accent)]">Code</span>
              </li>
              <li className="text-[14px]">
                <span className="mr-2 font-mono font-semibold text-[var(--c-text)]">{version}</span>
                <a
                  href={`${GITHUB}/releases/tag/v${version}`}
                  className="text-[var(--c-accent)] hover:underline"
                >
                  Release notes
                </a>
              </li>
              <li className="pt-1">
                <span className="block font-semibold text-[var(--c-text)]">macOS</span>
                <span className="text-[13px] text-[var(--c-text3)]">For Apple Silicon and Intel Macs</span>
              </li>
              <li>
                <a href={DMG_ARM} className="classic-button w-full" download>
                  <svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor" aria-hidden>
                    <path d="M7.47 10.78a.75.75 0 0 0 1.06 0l3.75-3.75a.75.75 0 0 0-1.06-1.06L8.75 8.44V1.75a.75.75 0 0 0-1.5 0v6.69L4.78 5.97a.75.75 0 0 0-1.06 1.06l3.75 3.75ZM3.75 13a.75.75 0 0 0 0 1.5h8.5a.75.75 0 0 0 0-1.5h-8.5Z" />
                  </svg>
                  Download
                </a>
              </li>
              <li className="text-[13px] text-[var(--c-text3)]">
                Intel Mac?{" "}
                <a href={DMG_X64} className="text-[var(--c-accent)] hover:underline" download>
                  Download x64
                </a>
                {" · "}
                <a href={`${GITHUB}/releases`} className="text-[var(--c-accent)] hover:underline">
                  Other builds
                </a>
              </li>
              <li className="text-[13px] text-[var(--c-text3)]">
                Free and open source under the{" "}
                <a href={`${GITHUB}/blob/HEAD/LICENSE`} className="text-[var(--c-accent)] hover:underline">
                  MIT license
                </a>
                . No account required.
              </li>
            </ul>
          </header>

          <h1 className="mx-auto mt-12 max-w-3xl text-center text-[34px] font-bold leading-tight tracking-tight text-[var(--c-text)] text-balance sm:text-[42px]">
            A hackable editor for the <span className="text-[var(--c-accent)]">AI&nbsp;era</span>
          </h1>
        </div>
      </section>

      {/* ───────────────────── AGENT (the Teletype slot) ───────────────────── */}
      <section id="agent" className="border-b border-[var(--c-line)]">
        <div className="mx-auto max-w-5xl px-5 py-14">
          <h3 className="text-[26px] font-semibold text-[var(--c-text)]">Agent for LevelCode</h3>
          <p className="mt-3 max-w-3xl pretty">
            Great software happens when the editor works with you. The LevelCode agent plans, edits
            across files, runs commands, and verifies its own work — right in your editor, on your
            own API key, with no middleman between you and the model.
          </p>

          <div className="mt-8">
            <AgentShowcase />
          </div>

          <p className="mt-8 max-w-3xl pretty">
            Every edit lands as a reviewable Keep/Undo change. Every command waits at an approval
            gate. Before the agent says done, it checks diagnostics and runs your tests — and every
            turn is a checkpoint you can rewind.
          </p>

          <p className="mt-6">
            <a href="#download" className="classic-button">
              Download for macOS
            </a>
          </p>
        </div>
      </section>

      {/* ─────────────────── SKETCHES (the GitHub-package slot) ─────────────────── */}
      <section id="sketches" className="border-b border-[var(--c-line)] bg-[var(--c-surface)]">
        <div className="mx-auto max-w-5xl px-5 py-14">
          <h3 className="text-[26px] font-semibold text-[var(--c-text)]">Sketches for LevelCode</h3>
          <p className="mt-3 max-w-3xl pretty">
            Some systems are too big for one prompt. Sketches let you drag a whole agent topology
            onto a canvas — eleven wired agents for a key-value store, a full leaderboard build —
            set the goal, hit Run, and watch them light up in order.
          </p>

          <div className="classic-demo-sketch mt-8">
            <SketchBuilder />
          </div>

          <p className="mt-8">
            <a href={`${GITHUB}/tree/HEAD/docs`} className="classic-button--quiet">
              Learn more
            </a>
          </p>
        </div>
      </section>

      {/* ─────────────────── EVERYTHING YOU WOULD EXPECT ─────────────────── */}
      <section className="border-b border-[var(--c-line)]">
        <div className="mx-auto max-w-5xl px-5 py-14">
          <h3 className="text-center text-[26px] font-semibold text-[var(--c-text)]">
            Everything you would expect
          </h3>

          <div className="mt-10 grid gap-x-10 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
            {EXPECT.map((f) => (
              <div key={f.title} className="text-center sm:text-left">
                <span className="text-[var(--c-accent)]">{f.icon}</span>
                <h4 className="mt-3 text-[17px] font-semibold text-[var(--c-text)]">{f.title}</h4>
                <p className="mt-1.5 text-[15px] pretty">{f.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─────────────────────── MAKE IT YOUR EDITOR ─────────────────────── */}
      <section className="border-b border-[var(--c-line)] bg-[var(--c-surface)]">
        <div className="mx-auto max-w-5xl px-5 py-14">
          <h3 className="text-center text-[26px] font-semibold text-[var(--c-text)]">Make it your editor</h3>

          <div className="mt-10 grid gap-x-10 gap-y-10 sm:grid-cols-2">
            {YOURS.map((f) => (
              <div key={f.title}>
                <span className="text-[var(--c-accent)]">{f.icon}</span>
                <h4 className="mt-3 text-[17px] font-semibold text-[var(--c-text)]">{f.title}</h4>
                <p className="mt-1.5 text-[15px] pretty">{f.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ───────────────────────────── DOWNLOAD ───────────────────────────── */}
      <section id="download" className="scroll-mt-14 border-b border-[var(--c-line)] bg-[var(--c-surface)]">
        <div className="mx-auto max-w-5xl px-5 py-20 text-center">
          <svg viewBox="0 0 120 120" width="64" height="64" className="mx-auto" aria-hidden>
            <g fill="none" stroke="var(--c-accent)" strokeWidth="13" strokeLinecap="round" strokeLinejoin="round">
              <path d="M28 92 L60 69 L92 92" opacity="0.4" />
              <path d="M28 68 L60 45 L92 68" opacity="0.7" />
              <path d="M28 44 L60 21 L92 44" />
            </g>
          </svg>
          <h2 className="mt-4 text-[34px] font-bold tracking-tight text-[var(--c-text)] text-balance sm:text-[42px]">
            Download LevelCode
          </h2>
          <p className="mt-2 font-mono text-[14px] text-[var(--c-text3)]">
            v{version} ·{" "}
            <a href={`${GITHUB}/releases/tag/v${version}`} className="text-[var(--c-accent)] hover:underline">
              Release notes
            </a>
          </p>
          <p className="mx-auto mt-4 max-w-xl text-[17px] pretty">
            Free and open. Drag the .dmg to Applications, add a key — or run fully offline on
            local Ollama — and the editor starts editing with you.
          </p>
          <div className="mt-9 flex flex-wrap items-center justify-center gap-4">
            <a href={DMG_ARM} className="classic-button px-10 py-4 text-[17px]" download>
              <AppleMark />
              Download for Apple Silicon
            </a>
            <a href={DMG_X64} className="classic-button--quiet px-10 py-4 text-[17px]" download>
              <AppleMark />
              Intel Mac
            </a>
          </div>
          <p className="mt-6 text-[14px] text-[var(--c-text3)]">
            free · MIT · no account required ·{" "}
            <a href={`${GITHUB}/releases`} className="text-[var(--c-accent)] hover:underline">
              all releases →
            </a>
          </p>
        </div>
      </section>

      {/* ───────────────────────────── CONTACT ───────────────────────────── */}
      <section className="border-b border-[var(--c-line)]">
        <div className="mx-auto grid max-w-5xl gap-12 px-5 py-14 md:grid-cols-2">
          <div>
            <h3 className="text-[26px] font-semibold text-[var(--c-text)]">Open source</h3>
            <p className="mt-3 pretty">
              LevelCode is open source, built on Code-OSS and released under MIT. Be part of the
              community — or help improve your favorite editor.
            </p>
            <p className="mt-5">
              <a href={GITHUB} className="classic-button">
                <GitHubMark />
                Fork on GitHub
              </a>
            </p>
          </div>

          <div>
            <h3 className="text-[26px] font-semibold text-[var(--c-text)]">Keep in touch</h3>
            <table className="mt-4 w-full text-[15px]">
              <tbody>
                {TOUCH.map((r) => (
                  <tr key={r.label} className="border-b border-[var(--c-line)] last:border-0">
                    <td className="py-2 pr-6 text-[var(--c-text3)]">{r.label}</td>
                    <td className="py-2">
                      {r.to ? (
                        <Link to={r.to} className="text-[var(--c-accent)] hover:underline">
                          {r.text}
                        </Link>
                      ) : (
                        <a href={r.href} className="text-[var(--c-accent)] hover:underline">
                          {r.text}
                        </a>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

    </ClassicShell>
  );
}

/* ───────────────────────── content ───────────────────────── */

const EXPECT = [
  {
    title: "Native AI agent",
    body: "Chat, edit, autocomplete, and a full agent mode — first-class in the editor, not a bolted-on plugin. Bring your own key or run local Ollama.",
    icon: <Icon d="M13 1 3.5 12.5h5L7 23l9.5-11.5h-5L13 1Z" filled />,
  },
  {
    title: "Power editing",
    body: "The Notepad++ toolkit: keystroke macros, line operations, column mode with incrementing numbers, encoding and EOL control, huge-file mode.",
    icon: <Icon d="M4 5h16M4 9h10M4 13h16M4 17h7" />,
  },
  {
    title: "Smart autocompletion",
    body: "Debounced ghost text over every file, cancelled the instant you keep typing — routed to a fast model per provider.",
    icon: <Icon d="M12 3a6 6 0 0 1 3.5 10.9c-.6.45-1 1.1-1 1.85V17h-5v-1.25c0-.75-.4-1.4-1-1.85A6 6 0 0 1 12 3ZM10 20h4" />,
  },
  {
    title: "Built-in package manager",
    body: "Thousands of open-source extensions from Open VSX — search, install, and update without leaving the editor.",
    icon: <Icon d="M12 3 4 7v10l8 4 8-4V7l-8-4Zm0 0v8m8-4-8 4M4 7l8 4" />,
  },
  {
    title: "Multiple panes",
    body: "Split the interface into panes to compare and edit code across files — plus a real approval-gated terminal.",
    icon: <Icon d="M4 5h16v14H4V5Zm8 0v14" />,
  },
  {
    title: "Find and replace",
    body: "Find, preview, and replace as you type — in a file or across every project, powered by ripgrep.",
    icon: <Icon d="M10.5 4a6.5 6.5 0 1 0 0 13 6.5 6.5 0 0 0 0-13Zm5.2 11.7L20 20" />,
  },
];

const YOURS = [
  {
    title: "Packages",
    body: "Choose from thousands of open-source packages on Open VSX that add features and functionality — or build one from scratch with the live package-dev loop.",
    icon: <Icon d="M12 3 4 7v10l8 4 8-4V7l-8-4Zm0 0v8m8-4-8 4M4 7l8 4" />,
  },
  {
    title: "Themes",
    body: "One Dark ships built in — Atom's own palette lives on in the editor. Install community themes or restyle everything with CSS.",
    icon: <Icon d="M12 3a9 9 0 1 0 0 18c1.5 0 2-1 1.4-2-.5-.9-.2-2 .9-2H16a5 5 0 0 0 5-5c0-5-4-9-9-9Zm-4.5 9a1.2 1.2 0 1 1 0-2.4 1.2 1.2 0 0 1 0 2.4Zm3-4a1.2 1.2 0 1 1 0-2.4 1.2 1.2 0 0 1 0 2.4Zm5 0a1.2 1.2 0 1 1 0-2.4 1.2 1.2 0 0 1 0 2.4Z" />,
  },
  {
    title: "Customization",
    body: "An init script that runs at boot and hot-reloads on save, keymap presets for Atom, Sublime, and Notepad++ muscle memory, and skills that teach the agent your workflows.",
    icon: <Icon d="M14.5 4.5a4 4 0 0 0-5.4 4.8L3 15.4V19h3.6l6.1-6.1a4 4 0 0 0 4.8-5.4l-2.6 2.6-2.4-2.4 2-2.2Z" />,
  },
  {
    title: "Under the hood",
    body: "A desktop app built on Code-OSS and Electron — the same battle-tested core as VS Code, bent back toward Atom's hackable soul. MIT, forkable, yours.",
    icon: <Icon d="M9 5 3 12l6 7m6-14 6 7-6 7" />,
  },
];

const TOUCH: { label: string; text: string; href?: string; to?: string }[] = [
  { label: "GitHub", href: "https://github.com/levelcodeai", text: "github.com/levelcodeai" },
  { label: "Discussions", href: `${GITHUB}/discussions`, text: "GitHub Discussions" },
  { label: "Releases", href: `${GITHUB}/releases`, text: "Release notes & builds" },
  { label: "Cloud", to: "/pricing", text: "Plans & pricing" },
];

/* ─────────────────────── glyphs (octicon-style) ─────────────────────── */

function Icon({ d, filled = false }: { d: string; filled?: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="30"
      height="30"
      fill={filled ? "currentColor" : "none"}
      stroke={filled ? "none" : "currentColor"}
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className="inline-block"
    >
      <path d={d} />
    </svg>
  );
}

function AppleMark() {
  return (
    <svg viewBox="0 0 814 1000" width="14" height="14" fill="currentColor" aria-hidden>
      <path d="M788 341c-6 4-107 61-107 187 0 146 128 198 132 199-1 3-20 70-67 138-42 60-86 120-153 120s-84-39-161-39c-75 0-102 40-163 40s-104-56-153-124C60 782 13 660 13 544c0-186 121-285 240-285 63 0 116 42 156 42 38 0 97-44 169-44 27 0 125 2 210 84zM554 172c31-37 53-88 53-139 0-7-1-14-2-20-50 2-110 34-146 76-29 32-55 83-55 135 0 8 1 16 2 18 3 1 8 2 13 2 45 0 102-30 135-72z" />
    </svg>
  );
}

function GitHubMark() {
  return (
    <svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor" aria-hidden>
      <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8Z" />
    </svg>
  );
}
