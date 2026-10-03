import { useEffect, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import AgentShowcase from "../components/AgentShowcase";
import { api, type AccountProfile, type Pricing } from "../api";
import { useSession } from "../auth";
import { isMacDevice } from "../platform";
import ClassicShell, { GITHUB } from "../components/classic/ClassicShell";
import SketchBuilder from "../components/level/SketchBuilder";

// The /ai landing. It tells the product story the way a product page for a professional tool
// does: one idea per section, in plain language, each one shown rather than described —
//
//   hero → what backs the claim → the product at work → how to start → what the agent does →
//   what it connects to → the editor underneath → why it is safe to install → start
//
// Two rules for anything added here:
//
//   1. Every claim must be true of the build a visitor downloads today. The source of truth is
//      the documentation in src/levelcode/docs (written against the editor's own source), not a
//      roadmap. Sample numbers in the illustrations are the only invented content on the page.
//   2. Say what the product does, not what it is like. This page is read by people deciding
//      whether to install an editor on a work machine; words that sound adventurous to an
//      enthusiast read as risk to them.
//
// Layout and type live in the `.classic .lp-*` rules in globals.css, so the page follows the
// light/dark theme of the shared shell.

const RELEASES = `${GITHUB}/releases/latest`;
const DMG_ARM = `${RELEASES}/download/LevelCode-arm64.dmg`;
const DMG_X64 = `${RELEASES}/download/LevelCode-x64.dmg`;
// Shown until the live lookup lands (and if it fails — GitHub rate-limits anonymous API calls per
// IP, which an office network shares). Keep it at the current release so that case still reads right.
const FALLBACK_VERSION = "1.2.0";

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

type EntryPrice = { amount: string; interval: string };

// The lowest paid plan, read from the same endpoint the pricing page uses — so this page can
// never quote a figure that /pricing contradicts. Null until it loads and if it fails; the card
// then leaves the figure out rather than guessing one.
function useEntryPrice(): EntryPrice | null {
  const [price, setPrice] = useState<EntryPrice | null>(null);
  useEffect(() => {
    let alive = true;
    api<Pricing>("/api/levelcode/v1/pricing")
      .then((d) => {
        const paid = (d.tiers ?? []).filter((t) => t.price_cents > 0);
        if (!alive || paid.length === 0) return;
        const entry = paid.reduce((low, t) => (t.price_cents < low.price_cents ? t : low));
        const dollars = entry.price_cents / 100;
        setPrice({
          amount: `$${dollars % 1 === 0 ? dollars.toFixed(0) : dollars.toFixed(2)}`,
          interval: entry.interval || "month",
        });
      })
      .catch(() => {
        /* leave the figure out */
      });
    return () => {
      alive = false;
    };
  }, []);
  return price;
}

export default function LandingPage() {
  const version = useLatestVersion();
  const entryPrice = useEntryPrice();
  const { profile } = useSession();
  // Read ONCE, synchronously, on the first render. The device does not change under the visitor, and
  // computing it in state would mean rendering a Download button and replacing it a frame later —
  // a primary call to action that moves under the reader's thumb.
  const [isMac] = useState(isMacDevice);
  const releaseNotes = `${GITHUB}/releases/tag/v${version}`;

  return (
    <ClassicShell>
      {/* ───────────────────────── HERO ───────────────────────── */}
      <section className="lp-hero">
        <div className="mx-auto flex max-w-4xl flex-col items-center px-5 pb-14 pt-16 text-center sm:pb-16 sm:pt-24">
          <AppIcon id="lp-icon-hero" size={88} />
          <h1 className="lp-h1 mt-8 text-balance">The AI code editor that keeps you in control</h1>
          <p className="lp-lead mt-5 max-w-2xl text-balance">
            LevelCode plans, edits, and verifies work across your codebase. You review every change,
            and commands wait for your approval.
          </p>

          <div className="mt-9">
            <PrimaryAction isMac={isMac} profile={profile} />
          </div>

          {isMac ? (
            <>
              <p className="mt-5 text-[15px] text-[var(--c-text2)]">
                Free and open source. No account required.
              </p>
              <p className="mt-1.5 text-[13px] text-[var(--c-text3)]">
                Version {version} ·{" "}
                <a href={releaseNotes} className="lp-link">
                  Release notes
                </a>{" "}
                · Intel Mac?{" "}
                <a href={DMG_X64} className="lp-link" download>
                  Download the x64 build
                </a>
              </p>
            </>
          ) : (
            // Not a Mac — so the download is not the action. Say plainly what LevelCode is and
            // where it runs, and leave every build one click away for someone fetching it for a Mac.
            <p className="mt-5 max-w-md text-[15px] text-[var(--c-text2)] pretty">
              LevelCode is a desktop app for macOS. Open this page on your Mac to download it, or
              see{" "}
              <a href={`${GITHUB}/releases`} className="lp-link">
                all builds
              </a>
              .
            </p>
          )}
        </div>
      </section>

      {/* ─────────── WHAT BACKS THE CLAIM — facts, where a logo row would go ─────────── */}
      <section aria-label="Why LevelCode is safe to adopt">
        <ul className="mx-auto grid max-w-5xl grid-cols-2 gap-x-6 gap-y-8 px-5 pb-16 md:grid-cols-4">
          {PROOF.map((p) => (
            <li key={p.title} className="flex flex-col items-center text-center">
              <span className="text-[var(--c-accent)]">{p.icon}</span>
              <span className="mt-2.5 text-[15px] font-semibold text-[var(--c-text)]">{p.title}</span>
              <span className="mt-0.5 text-[13px] text-[var(--c-text3)]">{p.detail}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* ───────────────────── THE PRODUCT AT WORK ───────────────────── */}
      <section id="agent" className="scroll-mt-14">
        <div className="mx-auto max-w-5xl px-5 pb-24">
          <h2 className="sr-only">LevelCode at work</h2>
          <AgentShowcase />
        </div>
      </section>

      {/* ───────────────────────── GET STARTED ───────────────────────── */}
      <section id="get-started" className="scroll-mt-14 border-y border-[var(--c-line)] bg-[var(--c-surface)]">
        <div className="mx-auto max-w-5xl px-5 py-20 sm:py-24">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="lp-h2 text-balance">Get started</h2>
            <p className="lp-lead mt-4 text-balance">
              LevelCode is free to use with your own API key. Add a plan when you want managed
              models.
            </p>
          </div>

          <div className="mx-auto mt-12 grid max-w-4xl gap-6 md:grid-cols-2">
            <div className="lp-card flex flex-col p-7">
              <h3 className="text-[22px] font-semibold text-[var(--c-text)]">Free</h3>
              <p className="mt-1.5 text-[16px] pretty">
                The complete editor, with your own API key or a local model.
              </p>
              <p className="mt-7 flex h-12 items-end gap-2">
                <span className="text-[40px] font-semibold leading-none tracking-tight text-[var(--c-text)]">
                  $0
                </span>
              </p>
              <div className="mt-6 flex flex-1 items-end">
                {isMac ? (
                  <PrimaryAction isMac profile={profile} fullWidth />
                ) : (
                  // Signing in does not get anyone the editor, so on a device that cannot run it
                  // this card points at how to get started rather than repeating the hero's action.
                  <Link to="/docs/quickstart" className="lp-cta lp-cta--quiet w-full">
                    Read the quickstart
                  </Link>
                )}
              </div>
            </div>

            <div className="lp-card flex flex-col p-7">
              <h3 className="text-[22px] font-semibold text-[var(--c-text)]">LevelCode Cloud</h3>
              <p className="mt-1.5 text-[16px] pretty">
                Managed models with no key to set up, and the cost of every run shown in the
                editor.
              </p>
              {/* The figure is live (see useEntryPrice). Side by side, the Free card already sets the
                  row height, so this arriving moves nothing; without it the card just closes up. */}
              {entryPrice ? (
                <p className="mt-7 flex h-12 items-end gap-2">
                  <span className="pb-1 text-[15px] text-[var(--c-text3)]">From</span>
                  <span className="text-[40px] font-semibold leading-none tracking-tight text-[var(--c-text)]">
                    {entryPrice.amount}
                  </span>
                  <span className="pb-1 text-[15px] text-[var(--c-text3)]">/ {entryPrice.interval}</span>
                </p>
              ) : null}
              <div className="mt-6 flex flex-1 items-end">
                <Link to="/pricing" className="lp-cta lp-cta--quiet w-full">
                  View plans
                </Link>
              </div>
            </div>
          </div>

          <p className="mt-8 text-center text-[14px] text-[var(--c-text3)]">
            Every plan includes the full editor. Plans meter managed AI usage only.
          </p>
        </div>
      </section>

      {/* ─────────────────────── WHAT THE AGENT DOES ─────────────────────── */}
      <section id="features" className="scroll-mt-14">
        <div className="mx-auto max-w-6xl px-5 pb-10 pt-24 sm:pt-28">
          <h2 className="lp-h2 text-center text-balance">An agent that shows its work</h2>

          <div className="mt-16 space-y-24 sm:mt-20 sm:space-y-28">
            <FeatureRow
              title="From goal to verified change"
              body="Describe the outcome you want. LevelCode plans the steps, edits across files, and runs the commands it needs. Before it reports back, it checks its changes against your type checker and linter, and runs the verify command you set."
              visual={<AgentRunVisual />}
            />
            <FeatureRow
              flip
              title="You decide what lands"
              body="Every edit is tracked file by file, with Keep and Undo. Commands wait for your approval before they run, and each message is a checkpoint you can restore."
              visual={<ControlVisual />}
            />
          </div>
        </div>

        {/* Sketches — the canvas needs the full measure, so this row stacks instead of splitting. */}
        <div id="sketches" className="mx-auto max-w-6xl scroll-mt-14 px-5 py-14 sm:py-16">
          <div className="max-w-2xl">
            <h3 className="lp-h3">Coordinate a team of agents</h3>
            <p className="lp-body mt-4 pretty">
              Sketch a workflow on a canvas: place specialized agents, connect them, and run.
              Independent steps run in parallel, and each one reports its token usage and estimated
              cost.
            </p>
          </div>
          <div className="classic-demo-sketch mt-10">
            <SketchBuilder preload />
          </div>
        </div>

        <div className="mx-auto max-w-6xl px-5 pb-24 pt-10 sm:pb-28">
          <FeatureRow
            title="Use the models you choose"
            body="Bring your own API key for Anthropic, OpenAI, OpenRouter, and other providers, or run local models with Ollama for chat, edits, and autocomplete. Prefer a single bill? LevelCode Cloud adds managed models on a monthly plan."
            visual={<ModelsVisual />}
          />
        </div>
      </section>

      {/* ─────────────────────── WHAT IT CONNECTS TO ─────────────────────── */}
      <section className="border-y border-[var(--c-line)] bg-[var(--c-surface)]">
        <div className="mx-auto max-w-5xl px-5 py-20 sm:py-24">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="lp-h2 text-balance">Works with the tools you already use</h2>
            <p className="lp-lead mt-4 text-balance">
              Keep your extensions, your settings, and your workflow.
            </p>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {CONNECTS.map((c) => (
              <div key={c.title} className="lp-card p-6">
                <span className="text-[var(--c-accent)]">{c.icon}</span>
                <h3 className="mt-4 text-[18px] font-semibold text-[var(--c-text)]">{c.title}</h3>
                <p className="mt-1.5 text-[15px] pretty">{c.body}</p>
              </div>
            ))}
          </div>

          <p className="mt-10 text-center">
            <Link to="/docs" className="lp-link text-[16px] font-medium">
              Read the documentation →
            </Link>
          </p>
        </div>
      </section>

      {/* ─────────────────────── THE EDITOR UNDERNEATH ─────────────────────── */}
      <section>
        <div className="mx-auto max-w-5xl px-5 py-20 sm:py-24">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="lp-h2 text-balance">A complete editor underneath</h2>
            <p className="lp-lead mt-4 text-balance">
              LevelCode is built on Code-OSS, the open-source project behind VS Code. The editing
              experience, keybindings, and extension model are the ones you already know.
            </p>
          </div>

          <div className="mt-14 grid gap-x-10 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
            {EDITOR.map((f) => (
              <div key={f.title}>
                <span className="text-[var(--c-accent)]">{f.icon}</span>
                <h3 className="mt-3 text-[17px] font-semibold text-[var(--c-text)]">{f.title}</h3>
                <p className="mt-1.5 text-[15px] pretty">{f.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─────────────────────── WHY IT IS SAFE TO INSTALL ─────────────────────── */}
      <section id="security" className="scroll-mt-14 border-y border-[var(--c-line)] bg-[var(--c-surface)]">
        <div className="mx-auto max-w-5xl px-5 py-20 sm:py-24">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="lp-h2 text-balance">Security you can verify</h2>
            <p className="lp-lead mt-4 text-balance">
              LevelCode is designed so you can see what it does and decide what it is allowed to do.
            </p>
          </div>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {TRUST.map((t) => (
              <div key={t.title} className="lp-card p-6">
                <span className="text-[var(--c-accent)]">{t.icon}</span>
                <h3 className="mt-4 text-[18px] font-semibold text-[var(--c-text)]">{t.title}</h3>
                <p className="mt-1.5 text-[15px] pretty">{t.body}</p>
              </div>
            ))}
          </div>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <a href={GITHUB} className="lp-cta lp-cta--quiet">
              <GitHubMark />
              View the source on GitHub
            </a>
            <Link to="/privacy" className="lp-cta lp-cta--quiet">
              Read the privacy policy
            </Link>
          </div>
        </div>
      </section>

      {/* ───────────────────────────── START ───────────────────────────── */}
      <section id="download" className="lp-hero lp-hero--closing scroll-mt-14">
        <div className="mx-auto flex max-w-3xl flex-col items-center px-5 py-24 text-center sm:py-28">
          <AppIcon id="lp-icon-closing" size={64} decorative />
          <h2 className="lp-h2 mt-6 text-balance">Start building with LevelCode</h2>
          <p className="lp-lead mt-4 text-balance">Free and open source. No account required.</p>

          {isMac ? (
            <>
              <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
                <a href={DMG_ARM} className="lp-cta" download>
                  <AppleMark />
                  Download for Apple Silicon
                </a>
                <a href={DMG_X64} className="lp-cta lp-cta--quiet" download>
                  <AppleMark />
                  Download for Intel
                </a>
              </div>
              <p className="mt-5 text-[13px] text-[var(--c-text3)]">
                Version {version} ·{" "}
                <a href={releaseNotes} className="lp-link">
                  Release notes
                </a>{" "}
                ·{" "}
                <a href={`${GITHUB}/releases`} className="lp-link">
                  All releases
                </a>
              </p>
            </>
          ) : (
            <>
              <div className="mt-9">
                <PrimaryAction isMac={isMac} profile={profile} />
              </div>
              <p className="mt-5 max-w-md text-[14px] text-[var(--c-text3)] pretty">
                LevelCode runs on Apple Silicon and Intel Macs. Open this page on your Mac to
                download it, or see{" "}
                <a href={`${GITHUB}/releases`} className="lp-link">
                  all releases
                </a>
                .
              </p>
            </>
          )}

          <p className="mt-12 max-w-xl text-[12px] text-[var(--c-text2)] pretty">
            LevelCode is an independent project. It is not produced by, endorsed by, or affiliated
            with Microsoft.
          </p>
        </div>
      </section>
    </ClassicShell>
  );
}

/* ───────────────────────── building blocks ───────────────────────── */

// The page's main action, in one place so the hero, the Free plan and the closing section can
// never disagree about it. On a Mac that is the download. Anywhere else a Download button is a
// dead end dressed as the primary action, so it becomes the thing that DOES work on this device:
// the account — the dashboard when signed in, sign-in when not.
function PrimaryAction({
  isMac,
  profile,
  fullWidth = false,
}: {
  isMac: boolean;
  profile: AccountProfile | null;
  fullWidth?: boolean;
}) {
  const cls = `lp-cta${fullWidth ? " w-full" : ""}`;
  if (isMac) {
    return (
      <a href={DMG_ARM} className={cls} download>
        <AppleMark />
        Download for macOS
      </a>
    );
  }
  return (
    <Link to={profile ? "/account" : "/login"} className={cls}>
      {profile ? "Your account" : "Sign in"}
    </Link>
  );
}

// One idea, one picture: a short claim beside the surface that proves it. `flip` puts the
// picture first on wide screens so consecutive rows alternate; on a phone the text always leads.
function FeatureRow({
  title,
  body,
  visual,
  flip = false,
}: {
  title: string;
  body: string;
  visual: ReactNode;
  flip?: boolean;
}) {
  return (
    <div className="grid items-center gap-10 md:grid-cols-12 md:gap-12 lg:gap-16">
      <div className={`md:col-span-5 lg:col-span-4 ${flip ? "md:order-2" : ""}`}>
        <h3 className="lp-h3 text-balance">{title}</h3>
        <p className="lp-body mt-4 pretty">{body}</p>
      </div>
      <div className={`md:col-span-7 lg:col-span-8 ${flip ? "md:order-1" : ""}`}>{visual}</div>
    </div>
  );
}

/* ─────────────────────── product illustrations ───────────────────────
   Static renderings of LevelCode surfaces. The first two use the editor's own wording — the
   step summary ("Read 6 files, searched the workspace"), the approval card ("Run this command?",
   Run / Skip) and the review bar (Keep all / Undo all, Keep / Undo) — so a visitor sees here what
   they will see after installing. The third summarizes the model picker as its three routes
   rather than reproducing its list. File names and counts are sample data. Each illustration is
   one image to assistive tech, described by its aria-label. */

function AgentRunVisual() {
  return (
    <div
      className="lp-stage"
      role="img"
      aria-label="LevelCode working through a task: it reads the relevant files, edits three of them, runs the tests, and verifies the result before reporting back."
    >
      <div className="lp-pane w-full max-w-[460px] p-5" aria-hidden>
        <p className="lp-bubble">Add rate limiting to the public API routes, then run the tests.</p>
        <ul className="mt-5 space-y-2.5 text-[14px] text-[var(--c-text)]">
          <DoneStep>Read 6 files, searched the workspace</DoneStep>
          <DoneStep>
            Edited 3 files <DiffStat add={84} del={21} />
          </DoneStep>
          <DoneStep>
            Ran <code className="lp-code">npm test</code>
          </DoneStep>
          <DoneStep>Verified the edits</DoneStep>
        </ul>
        <p className="mt-5 border-t border-[var(--c-line)] pt-4 text-[13.5px] leading-relaxed text-[var(--c-text2)]">
          Rate limiting is in place on every public route. The tests pass, and the change introduced
          no new type or lint problems.
        </p>
      </div>
    </div>
  );
}

function ControlVisual() {
  return (
    <div
      className="lp-stage"
      role="img"
      aria-label="A command waiting for approval with Run and Skip buttons, above a list of three changed files with Keep and Undo for each."
    >
      <div className="flex w-full max-w-[480px] flex-col gap-4" aria-hidden>
        <div className="lp-pane p-5">
          <p className="text-[15px] font-semibold text-[var(--c-text)]">Run this command?</p>
          <p className="mt-0.5 text-[13px] text-[var(--c-text3)]">
            LevelCode wants to run this in your terminal.
          </p>
          <p className="lp-well mt-3">npm test</p>
          <div className="mt-3 flex justify-end gap-2">
            <span className="lp-btn">
              Skip <kbd>esc</kbd>
            </span>
            <span className="lp-btn lp-btn--primary">
              Run <kbd>⏎</kbd>
            </span>
          </div>
        </div>

        <div className="lp-pane p-5">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
            <span className="text-[15px] font-semibold text-[var(--c-text)]">3 files changed</span>
            <DiffStat add={84} del={21} />
            <span className="ml-auto flex gap-2">
              <span className="lp-btn">Undo all</span>
              <span className="lp-btn lp-btn--primary">Keep all</span>
            </span>
          </div>
          <ul className="mt-3 divide-y divide-[var(--c-line)] border-t border-[var(--c-line)]">
            <ChangedFile name="routes/api.ts" add={41} del={9} />
            <ChangedFile name="middleware/rateLimit.ts" add={38} del={0} />
            <ChangedFile name="routes/api.test.ts" add={5} del={12} />
          </ul>
        </div>
      </div>
    </div>
  );
}

function ModelsVisual() {
  return (
    <div
      className="lp-stage"
      role="img"
      aria-label="The model picker, grouped three ways: your own API key with a provider such as Anthropic, OpenAI, OpenRouter or Mistral; a local model with Ollama; or managed models on LevelCode Cloud."
    >
      <div className="lp-pane w-full max-w-[440px] p-5" aria-hidden>
        <p className="text-[15px] font-semibold text-[var(--c-text)]">Select model</p>

        <p className="lp-group mt-4">Your API key</p>
        <ul className="mt-1.5 space-y-1">
          <ModelRow name="Anthropic" note="Direct" selected />
          <ModelRow name="OpenAI" note="Direct" />
          <ModelRow name="OpenRouter" note="Direct" />
          <ModelRow name="Mistral" note="Direct" />
        </ul>

        <p className="lp-group mt-4">On this Mac</p>
        <ul className="mt-1.5 space-y-1">
          <ModelRow name="Ollama" note="Local" />
        </ul>

        <p className="lp-group mt-4">LevelCode Cloud</p>
        <ul className="mt-1.5 space-y-1">
          <ModelRow name="Managed models" note="Included in a plan" />
        </ul>
      </div>
    </div>
  );
}

function DoneStep({ children }: { children: ReactNode }) {
  return (
    <li className="flex items-center gap-2.5">
      <svg viewBox="0 0 16 16" width="16" height="16" className="shrink-0 text-[var(--lp-add)]" aria-hidden>
        <circle cx="8" cy="8" r="6.35" fill="none" stroke="currentColor" strokeWidth="1" />
        <path
          d="M5.05 8.25 7 10.2l4.15-4.35"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <span className="flex flex-wrap items-center gap-x-2">{children}</span>
    </li>
  );
}

function DiffStat({ add, del }: { add: number; del: number }) {
  return (
    <span className="font-mono text-[12.5px] tabular-nums">
      <span className="text-[var(--lp-add)]">+{add}</span>{" "}
      <span className="text-[var(--lp-del)]">−{del}</span>
    </span>
  );
}

function ChangedFile({ name, add, del }: { name: string; add: number; del: number }) {
  return (
    <li className="flex items-center gap-3 py-2.5">
      <span className="min-w-0 flex-1 truncate font-mono text-[12.5px] text-[var(--c-text)]">{name}</span>
      <DiffStat add={add} del={del} />
      <span className="hidden gap-1.5 sm:flex">
        <span className="lp-btn lp-btn--sm">Undo</span>
        <span className="lp-btn lp-btn--sm lp-btn--primary">Keep</span>
      </span>
    </li>
  );
}

function ModelRow({ name, note, selected = false }: { name: string; note: string; selected?: boolean }) {
  return (
    <li className={`lp-row ${selected ? "lp-row--on" : ""}`}>
      <span aria-hidden className={`lp-radio ${selected ? "lp-radio--on" : ""}`} />
      <span className="text-[14px] text-[var(--c-text)]">{name}</span>
      <span className="ml-auto text-[12.5px] text-[var(--c-text3)]">{note}</span>
    </li>
  );
}

/* ───────────────────────── content ───────────────────────── */

type Item = { title: string; body: string; icon: ReactNode };

// The four facts under the hero — each one checkable by the reader, which is the point.
const PROOF: { title: string; detail: string; icon: ReactNode }[] = [
  {
    title: "Open source",
    detail: "MIT licensed",
    icon: <Icon d="M9 5 3 12l6 7m6-14 6 7-6 7" />,
  },
  {
    title: "Built on Code-OSS",
    detail: "The open-source core of VS Code",
    icon: <Icon d="m12 3 9 5-9 5-9-5 9-5Zm-9 9 9 5 9-5M3 16l9 5 9-5" />,
  },
  {
    title: "Notarized by Apple",
    detail: "Signed with a Developer ID",
    icon: <Icon d="M12 3 4.5 6v5.5c0 4.6 3.1 8.2 7.5 9.5 4.4-1.3 7.5-4.9 7.5-9.5V6L12 3Zm-3.2 9 2.3 2.3 4.1-4.6" />,
  },
  {
    title: "Private by default",
    detail: "No telemetry",
    icon: <Icon d="M7 11V8a5 5 0 0 1 10 0v3M6 11h12v9H6v-9Zm6 3.5v2" />,
  },
];

const CONNECTS: Item[] = [
  {
    title: "Extensions",
    body: "Install language support, themes, and tools from Open VSX, the open extension registry, without leaving the editor.",
    icon: <Icon d="M12 3 4 7v10l8 4 8-4V7l-8-4Zm0 0v8m8-4-8 4M4 7l8 4" />,
  },
  {
    title: "MCP servers",
    body: "Give the agent new tools through the Model Context Protocol. Every tool call asks before it runs, unless you choose to allow it.",
    icon: <Icon d="M9 3v5m6-5v5M6 8h12v3a6 6 0 0 1-12 0V8Zm6 9v4" />,
  },
  {
    title: "Import from VS Code",
    body: "Bring your settings, keybindings, and snippets from VS Code, VSCodium, or Cursor in one step. Your existing files are backed up first.",
    icon: <Icon d="M12 3v12m0 0-4-4m4 4 4-4M4 20h16" />,
  },
];

const EDITOR: Item[] = [
  {
    title: "Chat",
    body: "Ask questions about your codebase and get answers grounded in your files. Chat never edits them.",
    icon: <Icon d="M4 5h16v11H9l-5 4V5Z" />,
  },
  {
    title: "Inline edits",
    body: "Select code, describe the change, and review it as a diff before anything lands.",
    icon: <Icon d="M4 20h4L19 9l-4-4L4 16v4Zm9.5-13.5 4 4" />,
  },
  {
    title: "Autocomplete",
    body: "Suggestions appear as you type. Press Tab to accept one, or keep typing to dismiss it.",
    icon: <Icon d="M12 3a6 6 0 0 1 3.5 10.9c-.6.45-1 1.1-1 1.85V17h-5v-1.25c0-.75-.4-1.4-1-1.85A6 6 0 0 1 12 3ZM10 20h4" />,
  },
  {
    title: "Power editing",
    body: "Keystroke macros, column editing, line operations, encoding control, and a mode for very large files.",
    icon: <Icon d="M4 5h16M4 9h10M4 13h16M4 17h7" />,
  },
  {
    title: "Familiar keys and themes",
    body: "Keymap presets for Atom and Notepad++, with One Dark and One Light built in.",
    icon: <Icon d="M3 7h18v10H3V7Zm4 3.5h.01M11 10.5h.01M15 10.5h.01M7.5 14h9" />,
  },
  {
    title: "Yours to extend",
    body: "Add your own commands with a startup script, or build a package and see changes as you save.",
    icon: <Icon d="M4 5h16v14H4V5Zm3.5 4.5 3 2.5-3 2.5M13 15h3.5" />,
  },
];

const TRUST: Item[] = [
  {
    title: "Open source",
    body: "LevelCode is MIT licensed and built on Code-OSS, the open-source project behind VS Code. The full source is on GitHub for you or your security team to review.",
    icon: <Icon d="M9 5 3 12l6 7m6-14 6 7-6 7" />,
  },
  {
    title: "Signed and notarized",
    body: "Releases are signed with an Apple Developer ID and notarized by Apple, so macOS verifies the app before it opens.",
    icon: <Icon d="M12 3 4.5 6v5.5c0 4.6 3.1 8.2 7.5 9.5 4.4-1.3 7.5-4.9 7.5-9.5V6L12 3Zm-3.2 9 2.3 2.3 4.1-4.6" />,
  },
  {
    title: "Your keys stay on your Mac",
    body: "API keys are stored in the macOS Keychain, never in a settings file. With your own key, requests go directly from your Mac to your provider.",
    icon: <Icon d="M8 19a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm2.8-6.8L20 3m-3.5 3.5 2.5 2.5M14 9l2 2" />,
  },
  {
    title: "Approval before action",
    body: "Commands and third-party tools wait for your approval by default. A tool server defined by a repository cannot start until you approve its exact command.",
    icon: <Icon d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Zm-4-9 3 3 5-6" />,
  },
  {
    title: "No telemetry",
    body: "Telemetry is off, and there is no setting that turns it on.",
    icon: <Icon d="M3 3l18 18M10.6 6.1A9.6 9.6 0 0 1 12 6c5 0 8.5 4.5 9 6-.3.9-1.2 2.3-2.7 3.6M6.3 7.8C4.4 9.1 3.3 10.9 3 12c.5 1.5 4 6 9 6 1.3 0 2.6-.3 3.7-.8M9.9 9.9a3 3 0 0 0 4.2 4.2" />,
  },
  {
    title: "No account required",
    body: "Download and use the editor without signing up. An account is only needed for a LevelCode Cloud plan.",
    icon: <Icon d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm-7 9a7 7 0 0 1 14 0" />,
  },
];

/* ─────────────────────────── glyphs ─────────────────────────── */

function Icon({ d }: { d: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="28"
      height="28"
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

// The app icon exactly as it sits in the Dock: the dark squircle with the indigo-to-ice chevrons.
// `id` scopes the gradient — the icon appears twice on the page, and two <linearGradient>s that
// share an id resolve to whichever comes first in the document. `decorative` hides it from
// assistive tech where the text beside it already names the product.
function AppIcon({ id, size, decorative = false }: { id: string; size: number; decorative?: boolean }) {
  const a11y = decorative ? { "aria-hidden": true } : { role: "img", "aria-label": "LevelCode" };
  return (
    <svg viewBox="0 0 120 120" width={size} height={size} className="lp-appicon" {...a11y}>
      <defs>
        <linearGradient id={id} x1="0" y1="104" x2="0" y2="14" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#5b3fd6" />
          <stop offset=".45" stopColor="#7d6bff" />
          <stop offset=".75" stopColor="#5fb4ff" />
          <stop offset="1" stopColor="#a8ecff" />
        </linearGradient>
      </defs>
      <rect width="120" height="120" rx="27" fill="#0a0c16" />
      <g fill="none" stroke={`url(#${id})`} strokeWidth="13" strokeLinecap="round" strokeLinejoin="round">
        <path d="M28 92 L60 69 L92 92" opacity=".55" />
        <path d="M28 68 L60 45 L92 68" opacity=".8" />
        <path d="M28 44 L60 21 L92 44" />
      </g>
    </svg>
  );
}

function AppleMark() {
  return (
    <svg viewBox="0 0 814 1000" width="15" height="15" fill="currentColor" aria-hidden>
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
