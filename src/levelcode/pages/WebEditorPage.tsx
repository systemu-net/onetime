import { useEffect, type ReactNode } from "react";
import { Link } from "react-router-dom";
import ClassicShell, { ChevronMark } from "../components/classic/ClassicShell";
import { useWebEditor } from "../useWebEditor";

// ─────────────────────────────────────────────────────────────────────────────────────────────
// WHAT THIS PAGE SAYS ABOUT THE BROWSER EDITION
//
// Every statement of fact on the page comes from this one block, so correcting a claim is a
// single edit. docs/browser.mdx restates the same facts in prose; change the two together.
//
// The rule for this block: say only what is listed here. When a reader would ask something and
// the answer is not here, the page stays silent. It does not guess.
//
// TODO(owner): not stated anywhere until confirmed. Each of these is something a reader will ask.
//   - Other Chromium browsers (Brave, Arc, Opera): can they open a folder?
//   - Minimum browser versions.
//   - Phones and tablets: supported, or not?
//   - Whether your own provider key (not the gateway) works in the browser edition.
//   - How much a scratch workspace can hold, and what clearing site data does to it.
//   - Whether Keep and Undo and checkpoints behave as they do in the Mac app.
// ─────────────────────────────────────────────────────────────────────────────────────────────
const FACTS = {
  lede: "The real LevelCode workbench, running in a browser tab. Explorer, editor tabs, themes, the chat panel and the agent are all there. Nothing to install.",
  signIn: "Sign in with your LevelCode account. The gateway plan and usage are the same as in the Mac app.",

  works: [
    { title: "The workbench", body: "Explorer, editor tabs, themes and the chat panel." },
    { title: "The agent", body: "It can read, search, create, edit and delete files in the open workspace." },
    { title: "Your account", body: "The gateway plan and usage are the same as in the Mac app." },
    {
      title: "Your files",
      body: "Open a folder from your computer, or work in a scratch workspace saved in your browser.",
    },
  ],

  staysInMacApp: ["Terminal", "Running shell commands", "MCP servers that start local processes", "Installing extensions"],

  folder: {
    title: "Open a folder from your computer",
    body: "LevelCode uses the File System Access API, so edits go straight to the folder you picked. Available in Chrome and Edge.",
  },
  scratch: {
    title: "Use a scratch workspace",
    body: "A workspace that is saved in your browser. It works in every modern browser, including Safari and Firefox.",
  },
  // `folder` is true where the File System Access API is available. Every row can use a scratch workspace.
  browsers: [
    { name: "Chrome", folder: true },
    { name: "Edge", folder: true },
    { name: "Safari", folder: false },
    { name: "Firefox", folder: false },
  ],

  privacy: {
    title: "What goes to the model",
    files: "Files stay in your browser or on your computer.",
    model:
      "The text you send in chat and the files you ask LevelCode to read go to the model through the LevelCode gateway, the same as in the Mac app.",
  },
};

// The page, like the landing, follows the classic shell's light and dark themes through the
// `.classic` variables and the `.lp-*` rules in globals.css.
export default function WebEditorPage() {
  const { enabled, url, loading } = useWebEditor();
  useDocumentTitle(enabled);

  // Until the answer is in, keep the frame and nothing else (the account and login pages do the
  // same), so a visitor to a page that is switched off never sees it flash up and vanish.
  if (loading) {
    return (
      <ClassicShell>
        <main aria-busy="true" className="mx-auto min-h-[60vh] max-w-5xl px-5 py-24" />
      </ClassicShell>
    );
  }

  if (!enabled || !url) return <Unavailable />;

  const host = new URL(url).host;

  return (
    <ClassicShell>
      <main>
        {/* ───────────────────────── HERO ───────────────────────── */}
        <section className="lp-hero">
          <div className="mx-auto flex max-w-4xl flex-col items-center px-5 pb-12 pt-16 text-center sm:pb-14 sm:pt-24">
            <h1 className="lp-h1 text-balance">LevelCode in your browser</h1>
            <p className="lp-lead mt-5 max-w-2xl text-balance">{FACTS.lede}</p>

            <div className="mt-9">
              <OpenLevelCode url={url} />
            </div>
            <p className="mt-5 max-w-md text-[15px] text-[var(--c-text2)] pretty">{FACTS.signIn}</p>
          </div>

          <div className="mx-auto max-w-5xl px-5 pb-20 sm:pb-24">
            <BrowserEditorPicture host={host} />
          </div>
        </section>

        {/* ─────────────── WHAT WORKS / WHAT STAYS IN THE MAC APP ─────────────── */}
        <section className="border-y border-[var(--c-line)] bg-[var(--c-surface)]">
          <div className="mx-auto max-w-5xl px-5 py-20 sm:py-24">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="lp-h2 text-balance">What works here, and what stays in the Mac app</h2>
              <p className="lp-lead mt-4 text-balance">
                The browser edition covers the workbench and the agent&rsquo;s work on your files. A few things stay
                in the Mac app.
              </p>
            </div>

            {/* One card, two columns: what the browser edition does beside what it leaves to the Mac app. */}
            <div className="lp-card mx-auto mt-12 grid max-w-4xl divide-y divide-[var(--c-line)] md:grid-cols-2 md:divide-x md:divide-y-0">
              <div className="p-7">
                <h3 className="text-[22px] font-semibold leading-snug text-[var(--c-text)]">Works in your browser</h3>
                <ul className="mt-6 space-y-5">
                  {FACTS.works.map((w) => (
                    <li key={w.title} className="flex gap-3">
                      <span className="mt-[3px] shrink-0 text-[var(--lp-add)]">
                        <Check />
                      </span>
                      <span>
                        <span className="block text-[16px] font-semibold text-[var(--c-text)]">{w.title}</span>
                        <span className="mt-0.5 block text-[15px] text-[var(--c-text2)] pretty">{w.body}</span>
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-7">
                <h3 className="text-[22px] font-semibold leading-snug text-[var(--c-text)]">Stays in the Mac app</h3>
                <ul className="mt-6 space-y-4">
                  {FACTS.staysInMacApp.map((item) => (
                    <li key={item} className="flex gap-3 text-[16px] text-[var(--c-text)]">
                      <span className="mt-[3px] shrink-0 text-[var(--c-text3)]">
                        <Dash />
                      </span>
                      {item}
                    </li>
                  ))}
                </ul>
                <p className="mt-8">
                  <Link to="/download" className="lp-link text-[15px] font-medium">
                    Download LevelCode for Mac &rarr;
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ───────────────────────── WHERE YOUR FILES LIVE ───────────────────────── */}
        <section>
          <div className="mx-auto max-w-5xl px-5 py-20 sm:py-24">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="lp-h2 text-balance">Where your files live</h2>
              <p className="lp-lead mt-4 text-balance">There are two ways to work with files in the browser.</p>
            </div>

            <div className="mx-auto mt-12 grid max-w-4xl gap-6 md:grid-cols-2">
              <div className="lp-card p-7">
                <span className="text-[var(--c-accent)]">
                  <FolderGlyph />
                </span>
                <h3 className="mt-4 text-[20px] font-semibold leading-snug text-[var(--c-text)]">{FACTS.folder.title}</h3>
                <p className="mt-1.5 text-[15px] pretty">{FACTS.folder.body}</p>
              </div>
              <div className="lp-card p-7">
                <span className="text-[var(--c-accent)]">
                  <TabGlyph />
                </span>
                <h3 className="mt-4 text-[20px] font-semibold leading-snug text-[var(--c-text)]">{FACTS.scratch.title}</h3>
                <p className="mt-1.5 text-[15px] pretty">{FACTS.scratch.body}</p>
              </div>
            </div>

            {/* Browser support */}
            <div className="mx-auto mt-6 max-w-4xl">
              <div className="lp-card overflow-x-auto px-5 py-3 sm:px-7">
                <table className="w-full border-collapse text-left text-[15px]">
                  <caption className="sr-only">Which browsers can open a folder, and which can use a scratch workspace</caption>
                  <thead>
                    <tr className="border-b border-[var(--c-line)] text-[13px] text-[var(--c-text3)]">
                      <th scope="col" className="py-2.5 pr-4 font-medium">
                        Browser
                      </th>
                      <th scope="col" className="px-4 py-2.5 font-medium">
                        Open a folder
                      </th>
                      <th scope="col" className="py-2.5 pl-4 font-medium">
                        Scratch workspace
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {FACTS.browsers.map((b) => (
                      <tr key={b.name} className="border-b border-[var(--c-line)] last:border-b-0">
                        <th scope="row" className="py-3 pr-4 font-medium text-[var(--c-text)]">
                          {b.name}
                        </th>
                        <td className="px-4 py-3">
                          <Support yes={b.folder} />
                        </td>
                        <td className="py-3 pl-4">
                          <Support yes />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* What leaves the machine, said once and plainly */}
            <div className="mx-auto mt-6 max-w-4xl">
              <div className="lp-card flex flex-col gap-4 p-7 sm:flex-row sm:items-start sm:gap-5">
                <span className="shrink-0 text-[var(--c-accent)]">
                  <LockGlyph />
                </span>
                <div>
                  <h3 className="text-[20px] font-semibold leading-snug text-[var(--c-text)]">{FACTS.privacy.title}</h3>
                  <p className="mt-1.5 text-[15px] pretty">
                    {FACTS.privacy.files} {FACTS.privacy.model}
                  </p>
                  <p className="mt-3">
                    <Link to="/privacy" className="lp-link text-[15px] font-medium">
                      Read the privacy policy
                    </Link>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ───────────────────────────── START ───────────────────────────── */}
        <section className="lp-hero lp-hero--closing border-t border-[var(--c-line)]">
          <div className="mx-auto flex max-w-3xl flex-col items-center px-5 py-24 text-center sm:py-28">
            <h2 className="lp-h2 text-balance">Start in your browser</h2>
            <p className="lp-lead mt-4 max-w-xl text-balance">
              Sign in with your LevelCode account, then open a folder or a scratch workspace.
            </p>
            <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
              <OpenLevelCode url={url} />
              <Link to="/download" className="lp-cta lp-cta--quiet">
                Download for Mac
              </Link>
            </div>
            <p className="mt-6 text-[14px] text-[var(--c-text3)]">
              <Link to="/docs/browser" className="lp-link">
                Read the browser edition guide
              </Link>
            </p>
          </div>
        </section>
      </main>
    </ClassicShell>
  );
}

/* ───────────────────────── switched off ───────────────────────── */

// What a visitor sees when the edition is off, unreachable, or answered with something unusable.
// Nothing here describes the feature: the page does not advertise what it cannot open, and it
// does not put a primary button on a link that goes nowhere.
function Unavailable() {
  return (
    <ClassicShell>
      <main>
        <section className="lp-hero">
          <div className="mx-auto flex max-w-4xl flex-col items-center px-5 pb-28 pt-20 text-center sm:pt-28">
            <h1 className="lp-h1 text-balance">LevelCode in your browser</h1>
            <p className="lp-lead mt-5 text-balance">The browser edition is not available right now.</p>
            <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
              <Link to="/download" className="lp-cta">
                Download LevelCode for Mac
              </Link>
              <Link to="/docs" className="lp-cta lp-cta--quiet">
                Read the documentation
              </Link>
            </div>
          </div>
        </section>
      </main>
    </ClassicShell>
  );
}

/* ───────────────────────── building blocks ───────────────────────── */

// Same tab, on purpose: this is the editor, not a link out. The browser's Back button returns here.
function OpenLevelCode({ url }: { url: string }) {
  return (
    <a href={url} className="lp-cta">
      Open LevelCode
      <svg viewBox="0 0 16 16" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M3 8h10m-4-4 4 4-4 4" />
      </svg>
    </a>
  );
}

function Support({ yes }: { yes: boolean }) {
  return yes ? (
    <span className="inline-flex items-center gap-2 text-[var(--c-text)]">
      <span className="text-[var(--lp-add)]">
        <Check />
      </span>
      Yes
    </span>
  ) : (
    <span className="inline-flex items-center gap-2 text-[var(--c-text3)]">
      <Dash />
      No
    </span>
  );
}

// The title and the description are the page's own while it is on, and the shell's again after.
// Mirrors what DocsLayout does for the docs, restoring the exact prior state on the way out.
function useDocumentTitle(enabled: boolean) {
  useEffect(() => {
    if (!enabled) return;
    const previousTitle = document.title;
    document.title = "LevelCode in your browser";

    const meta = document.querySelector('meta[name="description"]');
    const hadDesc = meta?.hasAttribute("content") ?? false;
    const previousDesc = meta?.getAttribute("content") ?? null;
    meta?.setAttribute("content", FACTS.lede);

    return () => {
      document.title = previousTitle;
      if (!meta) return;
      if (hadDesc && previousDesc !== null) meta.setAttribute("content", previousDesc);
      else meta.removeAttribute("content");
    };
  }, [enabled]);
}

/* ─────────────────── the editor in a tab ───────────────────
   The one illustration. A browser window (neutral chrome, from the shell's own tokens) around the
   workbench drawn in the app's dark identity, the same palette AgentShowcase uses on the landing.

   It is a picture of the workbench, not a screenshot. The folder, the file names, the code and the
   agent's task are sample data. The agent's steps stay inside what it can do in the browser (it
   reads, searches and edits files) and the picture shows no terminal and no command being run.

   `host` is the address the visitor is about to open, so the picture never names a hostname that
   is not the real one. One image to assistive tech, described by its label. */

const K = "text-[#c58aff]"; // keyword
const F = "text-[#9fb4ff]"; // function, type
const S = "text-[#7fd88f]"; // string

function BrowserEditorPicture({ host }: { host: string }) {
  return (
    <div
      className="lp-stage"
      role="img"
      aria-label="LevelCode open in a browser tab: the file explorer, a file in the editor, and the chat panel with the agent's steps."
    >
      <div
        className="shot-shadow w-full max-w-[940px] overflow-hidden rounded-xl border border-[var(--c-line)] bg-[var(--c-bg)] text-left"
        aria-hidden
      >
        {/* tab strip */}
        <div className="flex items-end gap-3 border-b border-[var(--c-line)] bg-[var(--c-surface)] px-3 pt-2.5">
          <span className="flex gap-1.5 self-center pb-2">
            <span className="h-2.5 w-2.5 rounded-full bg-[var(--c-line)]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[var(--c-line)]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[var(--c-line)]" />
          </span>
          <span className="relative -mb-px flex items-center gap-2 rounded-t-lg border border-b-0 border-[var(--c-line)] bg-[var(--c-bg)] px-3.5 py-2 text-[12.5px] font-medium text-[var(--c-text)]">
            <ChevronMark size={14} />
            LevelCode
          </span>
        </div>

        {/* address bar */}
        <div className="flex items-center gap-2.5 border-b border-[var(--c-line)] bg-[var(--c-bg)] px-3 py-2">
          <span className="flex gap-2 text-[var(--c-text3)]">
            <svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10 3 5 8l5 5" />
            </svg>
            <svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="opacity-50">
              <path d="m6 3 5 5-5 5" />
            </svg>
          </span>
          <span className="flex min-w-0 flex-1 items-center gap-2 rounded-full bg-[var(--lp-well)] px-3.5 py-1.5 font-mono text-[12px] text-[var(--c-text2)]">
            <span className="shrink-0 text-[var(--c-text3)]">
              <LockGlyph size={12} />
            </span>
            <span className="truncate">{host}</span>
          </span>
        </div>

        {/* the workbench */}
        <div className="grid bg-[#0a0c16] md:grid-cols-[minmax(0,1fr)_262px] lg:grid-cols-[172px_minmax(0,1fr)_262px]">
          {/* explorer */}
          <div className="hidden border-r border-[#1b1e2b] bg-[#0d1020] px-3 py-3.5 font-mono text-[12px] lg:block">
            <p className="text-[10px] uppercase tracking-[0.14em] text-[#6b7280]">Explorer</p>
            <ul className="mt-3 space-y-1 text-[#8b93ad]">
              <li className="flex items-center gap-1.5 text-[#c7cbe0]">
                <Caret open />
                my-blog
              </li>
              <li className="flex items-center gap-1.5 pl-3">
                <Caret open />
                src
              </li>
              <li className="-mx-3 bg-[#7d6bff]/15 py-0.5 pl-11 text-[#e2defe]">slug.ts</li>
              <li className="pl-8">post.ts</li>
              <li className="pl-8">index.ts</li>
              <li className="pl-3">package.json</li>
              <li className="pl-3">README.md</li>
            </ul>
          </div>

          {/* editor */}
          <div className="min-w-0">
            <div className="flex border-b border-[#1b1e2b] bg-[#0d1020] font-mono text-[12px]">
              <span className="border-r border-[#1b1e2b] border-t-2 border-t-[#7d6bff] bg-[#0a0c16] px-4 py-2 text-[#e2defe]">
                slug.ts
              </span>
              <span className="border-r border-[#1b1e2b] px-4 py-2 text-[#6b7280]">post.ts</span>
            </div>
            <div className="overflow-hidden whitespace-pre px-3 py-4 font-mono text-[11px] leading-[1.95] text-[#c7cbe0] sm:px-4 sm:text-[12px] md:text-[12.5px]">
              <Line no="1">
                <span className={K}>import</span> {"{ words }"} <span className={K}>from</span>{" "}
                <span className={S}>&quot;./text&quot;</span>;
              </Line>
              <Line no="2" />
              <Line no="3">
                <span className={K}>export function</span> <span className={F}>slugify</span>(title) {"{"}
              </Line>
              <Line no="4">
                {"  "}
                <span className={K}>return</span> <span className={F}>words</span>(title)
              </Line>
              <Line no="5">
                {"    "}.map((w) =&gt; w.toLowerCase())
              </Line>
              <Line no="6">
                {"    "}.join(<span className={S}>&quot;-&quot;</span>);
              </Line>
              <Line no="7">
                {"}"}
                <span className="ml-px inline-block h-[1.05em] w-[2px] -translate-y-[1px] animate-caret bg-[#7d6bff] align-middle" />
              </Line>
            </div>
          </div>

          {/* chat panel */}
          <div className="flex min-w-0 flex-col gap-4 border-t border-[#1b1e2b] bg-[#0d1020]/60 p-4 text-[13px] leading-relaxed md:border-l md:border-t-0">
            <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.14em] text-[#a99bff]">
              <span className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-[#7d6bff] shadow-[0_0_8px_rgba(125,107,255,0.9)]" />
                LevelCode
              </span>
              <span className="rounded-full border border-[#7d6bff]/40 bg-[#7d6bff]/15 px-2 py-0.5 normal-case tracking-normal text-[#c6bfff]">
                Agent
              </span>
            </div>

            <p className="rounded-lg bg-[#171a2b] px-3 py-2.5 text-[#c7cbe0]">
              Rename makeSlug to slugify everywhere it is used.
            </p>

            <ul className="space-y-2 text-[#8b93ad]">
              <Step>Searched the workspace</Step>
              <Step>Read 4 files</Step>
              <Step>
                Edited 3 files <span className="ml-1 font-mono text-[12px] text-[#7fd88f]">+6</span>{" "}
                <span className="font-mono text-[12px] text-[#f47067]">&minus;6</span>
              </Step>
            </ul>

            <p className="border-t border-[#1b1e2b] pt-3 text-[#8b93ad]">Renamed makeSlug in 3 files.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Line({ no, children }: { no: string; children?: ReactNode }) {
  return (
    <div>
      <span className="inline-block w-[2.4em] select-none text-[#3b4157]">{no}</span>
      {children}
    </div>
  );
}

function Step({ children }: { children: ReactNode }) {
  return (
    <li className="flex items-start gap-2.5">
      <svg viewBox="0 0 16 16" width="15" height="15" className="mt-[3px] shrink-0 text-[#7fd88f]">
        <circle cx="8" cy="8" r="6.35" fill="none" stroke="currentColor" strokeWidth="1" />
        <path d="M5.05 8.25 7 10.2l4.15-4.35" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <span>{children}</span>
    </li>
  );
}

function Caret({ open }: { open?: boolean }) {
  return (
    <svg viewBox="0 0 16 16" width="10" height="10" fill="currentColor" className={open ? "rotate-90" : ""}>
      <path d="M6.22 3.22a.75.75 0 0 1 1.06 0l4.25 4.25a.75.75 0 0 1 0 1.06l-4.25 4.25a.75.75 0 0 1-1.06-1.06L9.94 8 6.22 4.28a.75.75 0 0 1 0-1.06Z" />
    </svg>
  );
}

/* ─────────────────────────── glyphs ─────────────────────────── */

function Check() {
  return (
    <svg viewBox="0 0 16 16" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="m3.5 8.5 3 3 6-7" />
    </svg>
  );
}

function Dash() {
  return (
    <svg viewBox="0 0 16 16" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden>
      <path d="M4 8h8" />
    </svg>
  );
}

function Glyph({ d, size = 28 }: { d: string; size?: number }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className="inline-block"
    >
      <path d={d} />
    </svg>
  );
}

const FolderGlyph = () => <Glyph d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7Z" />;
const TabGlyph = () => <Glyph d="M3 6a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6Zm0 4h18M8 4v6" />;
const LockGlyph = ({ size = 28 }: { size?: number }) => <Glyph size={size} d="M7 11V8a5 5 0 0 1 10 0v3M6 11h12v9H6v-9Zm6 3.5v2" />;
