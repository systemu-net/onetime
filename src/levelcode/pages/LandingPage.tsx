import { Link } from "react-router-dom";
import AgentShowcase from "../components/AgentShowcase";
import SketchBuilder from "../components/level/SketchBuilder";
import { initials, useSession } from "../auth";

// The /ai landing for LOGGED-OUT visitors — LevelCode Classic: the 2014-2022 atom.io page
// structure and temperament, matching levelcode.dev. Flat, light, system fonts, octicon-style
// glyphs. Everything is scoped under `.classic` (see globals.css) with literal colors, so the
// signed-in dashboard's cream paper-and-ink palette is untouched. CTAs wire to the /ai flows
// (Sign in → /login, Pricing → /pricing, legal pages are the real /terms + /privacy routes).

const GITHUB = "https://github.com/levelcodeai/levelcode";
const RELEASES = `${GITHUB}/releases/latest`;
const DMG_ARM = `${RELEASES}/download/LevelCode-arm64.dmg`;
const DMG_X64 = `${RELEASES}/download/LevelCode-x64.dmg`;
const VERSION = "0.6.0";

export default function LandingPage() {
  return (
    <div className="classic min-h-screen bg-white text-[16px] leading-relaxed text-[#555]">
      <ClassicNav />

      {/* heritage strip — the sunset banner slot, inverted */}
      <p className="border-b border-[#e0e0e0] bg-[#efeafd] px-5 py-2 text-center text-[13px] text-[#333]">
        Atom was sunset on December 15, 2022.{" "}
        <a href={`${GITHUB}#readme`} className="font-medium text-[#5b3fd6] hover:underline">
          LevelCode carries the hackable spirit forward →
        </a>
      </p>

      {/* ───────────────────────── HERO ───────────────────────── */}
      <section className="border-b border-[#e0e0e0] bg-[#fafaf9]">
        <div className="mx-auto max-w-5xl px-5 pb-14 pt-10">
          <header className="flex flex-col items-center gap-10 md:flex-row md:items-center md:justify-between">
            {/* the portal: soft circles (the atom.io homage) + the chevron mark */}
            <div aria-hidden className="relative h-[280px] w-[300px] shrink-0">
              <svg viewBox="0 0 300 280" className="h-full w-full">
                <g className="portal-layer">
                  <circle cx="118" cy="128" r="104" fill="#5b3fd6" opacity="0.14" />
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
              <li className="text-[34px] font-bold leading-none tracking-tight text-[#333]">
                Level<span className="text-[#5b3fd6]">Code</span>
              </li>
              <li className="text-[14px]">
                <span className="mr-2 font-mono font-semibold text-[#333]">{VERSION}</span>
                <a
                  href={`${GITHUB}/releases/tag/v${VERSION}`}
                  className="text-[#5b3fd6] hover:underline"
                >
                  Release notes
                </a>
              </li>
              <li className="pt-1">
                <span className="block font-semibold text-[#333]">macOS</span>
                <span className="text-[13px] text-[#777]">For Apple Silicon and Intel Macs</span>
              </li>
              <li>
                <a href={DMG_ARM} className="classic-button w-full" download>
                  <svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor" aria-hidden>
                    <path d="M7.47 10.78a.75.75 0 0 0 1.06 0l3.75-3.75a.75.75 0 0 0-1.06-1.06L8.75 8.44V1.75a.75.75 0 0 0-1.5 0v6.69L4.78 5.97a.75.75 0 0 0-1.06 1.06l3.75 3.75ZM3.75 13a.75.75 0 0 0 0 1.5h8.5a.75.75 0 0 0 0-1.5h-8.5Z" />
                  </svg>
                  Download
                </a>
              </li>
              <li className="text-[13px] text-[#777]">
                Intel Mac?{" "}
                <a href={DMG_X64} className="text-[#5b3fd6] hover:underline" download>
                  Download x64
                </a>
                {" · "}
                <a href={`${GITHUB}/releases`} className="text-[#5b3fd6] hover:underline">
                  Other builds
                </a>
              </li>
              <li className="text-[13px] text-[#777]">
                Free and open source under the{" "}
                <a href={`${GITHUB}/blob/main/LICENSE`} className="text-[#5b3fd6] hover:underline">
                  MIT license
                </a>
                . No account required.
              </li>
            </ul>
          </header>

          <h1 className="mx-auto mt-12 max-w-3xl text-center text-[34px] font-bold leading-tight tracking-tight text-[#333] text-balance sm:text-[42px]">
            A hackable <span className="text-[#5b3fd6]">AI editor</span> for the 21st&nbsp;Century
          </h1>
        </div>
      </section>

      {/* ───────────────────── AGENT (the Teletype slot) ───────────────────── */}
      <section id="agent" className="border-b border-[#e0e0e0]">
        <div className="mx-auto max-w-5xl px-5 py-14">
          <h3 className="text-[26px] font-semibold text-[#333]">Agent for LevelCode</h3>
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
            <a href={DMG_ARM} className="classic-button" download>
              Download for macOS
            </a>
          </p>
        </div>
      </section>

      {/* ─────────────────── SKETCHES (the GitHub-package slot) ─────────────────── */}
      <section id="sketches" className="border-b border-[#e0e0e0] bg-[#fafaf9]">
        <div className="mx-auto max-w-5xl px-5 py-14">
          <h3 className="text-[26px] font-semibold text-[#333]">Sketches for LevelCode</h3>
          <p className="mt-3 max-w-3xl pretty">
            Some systems are too big for one prompt. Sketches let you drag a whole agent topology
            onto a canvas — eleven wired agents for a key-value store, a full leaderboard build —
            set the goal, hit Run, and watch them light up in order.
          </p>

          <div className="mt-8">
            <SketchBuilder />
          </div>

          <p className="mt-8">
            <a href={`${GITHUB}/tree/main/docs`} className="classic-button--quiet">
              Learn more
            </a>
          </p>
        </div>
      </section>

      {/* ─────────────────── EVERYTHING YOU WOULD EXPECT ─────────────────── */}
      <section className="border-b border-[#e0e0e0]">
        <div className="mx-auto max-w-5xl px-5 py-14">
          <h3 className="text-center text-[26px] font-semibold text-[#333]">
            Everything you would expect
          </h3>

          <div className="mt-10 grid gap-x-10 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
            {EXPECT.map((f) => (
              <div key={f.title} className="text-center sm:text-left">
                <span className="text-[#5b3fd6]">{f.icon}</span>
                <h4 className="mt-3 text-[17px] font-semibold text-[#333]">{f.title}</h4>
                <p className="mt-1.5 text-[15px] pretty">{f.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─────────────────────── MAKE IT YOUR EDITOR ─────────────────────── */}
      <section className="border-b border-[#e0e0e0] bg-[#fafaf9]">
        <div className="mx-auto max-w-5xl px-5 py-14">
          <h3 className="text-center text-[26px] font-semibold text-[#333]">Make it your editor</h3>

          <div className="mt-10 grid gap-x-10 gap-y-10 sm:grid-cols-2">
            {YOURS.map((f) => (
              <div key={f.title}>
                <span className="text-[#5b3fd6]">{f.icon}</span>
                <h4 className="mt-3 text-[17px] font-semibold text-[#333]">{f.title}</h4>
                <p className="mt-1.5 text-[15px] pretty">{f.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ───────────────────────────── CONTACT ───────────────────────────── */}
      <section className="border-b border-[#e0e0e0]">
        <div className="mx-auto grid max-w-5xl gap-12 px-5 py-14 md:grid-cols-2">
          <div>
            <h3 className="text-[26px] font-semibold text-[#333]">Open source</h3>
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
            <h3 className="text-[26px] font-semibold text-[#333]">Keep in touch</h3>
            <table className="mt-4 w-full text-[15px]">
              <tbody>
                {TOUCH.map((r) => (
                  <tr key={r.label} className="border-b border-[#e0e0e0] last:border-0">
                    <td className="py-2 pr-6 text-[#777]">{r.label}</td>
                    <td className="py-2">
                      {r.to ? (
                        <Link to={r.to} className="text-[#5b3fd6] hover:underline">
                          {r.text}
                        </Link>
                      ) : (
                        <a href={r.href} className="text-[#5b3fd6] hover:underline">
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

      {/* ───────────────────────────── FOOTER ───────────────────────────── */}
      <footer className="bg-[#fafaf9]">
        <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-4 px-5 py-8 text-[14px] sm:flex-row">
          <ul className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
            <li>
              <Link className="text-[#555] hover:text-[#333]" to="/terms">
                Terms of Use
              </Link>
            </li>
            <li>
              <Link className="text-[#555] hover:text-[#333]" to="/privacy">
                Privacy
              </Link>
            </li>
            <li>
              <a className="text-[#555] hover:text-[#333]" href={`${GITHUB}/releases`}>
                Releases
              </a>
            </li>
            <li>
              <a className="text-[#555] hover:text-[#333]" href={`${GITHUB}/discussions`}>
                Discussions
              </a>
            </li>
            <li>
              <Link className="text-[#555] hover:text-[#333]" to="/pricing">
                Pricing
              </Link>
            </li>
          </ul>
          <span className="flex items-center gap-1.5 text-[#777]">
            <CodeGlyph /> with <HeartGlyph /> by LevelCode
          </span>
        </div>
      </footer>
    </div>
  );
}

/* ─────────────────── the classic top-bar (session-aware) ─────────────────── */

function ClassicNav() {
  const { profile } = useSession();

  return (
    <nav aria-label="Primary" className="border-b border-[#e0e0e0] bg-[#fafaf9]">
      <div className="mx-auto flex h-12 max-w-5xl items-center justify-between px-5">
        <div className="flex items-center gap-6">
          <span className="text-[15px] font-bold text-[#333]">
            Level<span className="text-[#5b3fd6]">Code</span>
          </span>
          <ul className="hidden items-center gap-5 sm:flex">
            <li>
              <a href={`${GITHUB}/tree/main/docs`} className="text-[14px] text-[#555] hover:text-[#333]">
                Documentation
              </a>
            </li>
            <li>
              <a href="https://open-vsx.org/" className="text-[14px] text-[#555] hover:text-[#333]">
                Packages
              </a>
            </li>
            <li>
              <a href={`${GITHUB}/releases`} className="text-[14px] text-[#555] hover:text-[#333]">
                Releases
              </a>
            </li>
            <li>
              <Link to="/pricing" className="text-[14px] text-[#555] hover:text-[#333]">
                Pricing
              </Link>
            </li>
          </ul>
        </div>

        {profile ? (
          <Link
            to="/account"
            title="Account"
            aria-label="Account"
            className="flex h-8 w-8 items-center justify-center rounded-full border border-[#e0e0e0] bg-white text-[12px] font-semibold text-[#333] hover:border-[#5b3fd6]"
          >
            {initials(profile.name, profile.email)}
          </Link>
        ) : (
          <Link
            to="/login"
            className="flex items-center gap-1.5 text-[14px] text-[#555] hover:text-[#333]"
          >
            <svg viewBox="0 0 16 16" width="14" height="14" fill="currentColor" aria-hidden>
              <path d="M10 3.75a.75.75 0 0 1 .75-.75h2.5A1.75 1.75 0 0 1 15 4.75v6.5A1.75 1.75 0 0 1 13.25 13h-2.5a.75.75 0 0 1 0-1.5h2.5a.25.25 0 0 0 .25-.25v-6.5a.25.25 0 0 0-.25-.25h-2.5a.75.75 0 0 1-.75-.75Zm-3.28.72a.75.75 0 0 1 1.06 0l3 3a.75.75 0 0 1 0 1.06l-3 3a.75.75 0 1 1-1.06-1.06l1.72-1.72H1.75a.75.75 0 0 1 0-1.5h6.69L6.72 5.53a.75.75 0 0 1 0-1.06Z" />
            </svg>
            Sign in
          </Link>
        )}
      </div>
    </nav>
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

function GitHubMark() {
  return (
    <svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor" aria-hidden>
      <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8Z" />
    </svg>
  );
}

function CodeGlyph() {
  return (
    <svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="m5.5 4.5-3.5 3.5 3.5 3.5M10.5 4.5 14 8l-3.5 3.5" />
    </svg>
  );
}

function HeartGlyph() {
  return (
    <svg viewBox="0 0 16 16" width="14" height="14" fill="#5b3fd6" aria-hidden>
      <path d="m8 14.25.345.666a.75.75 0 0 1-.69 0l-.008-.004-.018-.01a7.152 7.152 0 0 1-.31-.17 22.055 22.055 0 0 1-3.434-2.414C2.045 10.731 0 8.35 0 5.5 0 2.836 2.086 1 4.25 1 5.797 1 7.153 1.802 8 3.02 8.847 1.802 10.203 1 11.75 1 13.914 1 16 2.836 16 5.5c0 2.85-2.045 5.231-3.885 6.818a22.066 22.066 0 0 1-3.744 2.584l-.018.01-.006.003h-.002Z" />
    </svg>
  );
}
