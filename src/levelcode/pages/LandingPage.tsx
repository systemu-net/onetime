import AgentShowcase from "../components/AgentShowcase";
import DownloadCard from "../components/level/DownloadCard";
import LandingNav from "../components/level/LandingNav";
import LevelCanvas from "../components/level/LevelCanvas";
import Line from "../components/level/Line";
import Providers from "../components/level/Providers";
import Reveal from "../components/level/Reveal";
import ScrollProgress from "../components/level/ScrollProgress";
import SketchBuilder from "../components/level/SketchBuilder";
import Stats from "../components/level/Stats";

// The /ai landing — the levelcode.dev homepage migrated into the account app and re-skinned to the
// existing cream "paper-and-ink" palette (the .dev "Rise" token names alias onto the cream values in
// tailwind.config). Structure mirrors levelcode.dev app/page.tsx section-for-section; CTAs are wired to
// the /ai flows (nav Download → /ai/download, Sign in → /ai/login) and the download section keeps the
// real GitHub DMG links.

const GITHUB = "https://github.com/levelcodeai/levelcode";

const TICKER = [
  "read_codebase",
  "edit_file",
  "run_command",
  "update_plan",
  "ask_user",
  "use_skill",
  "verify_loop",
  "checkpoint",
  "background_exec",
];

export default function LandingPage() {
  return (
    <main id="top" className="relative overflow-hidden">
      <ScrollProgress />
      <LandingNav />

      {/* ─────────────────────────── HERO ─────────────────────────── */}
      <section className="relative flex min-h-[100svh] flex-col items-center justify-center">
        <div className="absolute inset-0 flex items-center justify-center">
          <LevelCanvas className="h-[min(92vw,740px)] w-[min(92vw,740px)] opacity-95" />
        </div>

        <div className="relative z-10 mx-auto max-w-4xl px-5 text-center">
          <Reveal>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-line bg-abyss/80 px-3 py-1 font-mono text-[12px] text-ghost backdrop-blur-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-electric shadow-[0_0_10px_rgb(var(--accent-rgb)/0.9)]" />
              generation 3 · agentic · macOS · MIT
            </div>
          </Reveal>

          <Reveal delay={0.05}>
            <h1 className="font-display text-[clamp(2.8rem,8vw,5.4rem)] font-bold leading-[0.98] tracking-tightest text-frost text-balance">
              Level<span className="pp">Code</span>.ai
            </h1>
          </Reveal>

          <Reveal delay={0.1}>
            <p className="mx-auto mt-6 max-w-xl text-[17px] leading-relaxed text-ghost pretty">
              The AI-native editor that codes with you. Six agents in quiet orbit — they plan, edit, run,
              and verify. On <em className="text-frost">your</em> key, on <em className="text-frost">your</em>{" "}
              machine, no middleman.
            </p>
          </Reveal>

          <Reveal delay={0.15}>
            <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
              <a href="#init" className="btn-primary">
                Download for macOS
              </a>
              <a href={GITHUB} target="_blank" rel="noreferrer" className="btn-ghost">
                Star on GitHub
              </a>
            </div>
          </Reveal>

          <Reveal delay={0.2}>
            <p className="mt-6 font-mono text-[12px] text-ghost/70">
              no account · no telemetry · bring your own key
            </p>
          </Reveal>
        </div>

        {/* agent-tool ticker */}
        <div className="absolute inset-x-0 bottom-0 border-t border-line bg-abyss/60 backdrop-blur-sm">
          <div className="overflow-hidden">
            <div className="flex w-max animate-marquee items-center gap-10 py-3 font-mono text-[12px] text-ghost/70">
              {[0, 1].map((half) => (
                <div key={half} aria-hidden={half === 1} className="flex items-center gap-10">
                  {TICKER.map((tool) => (
                    <span key={tool} className="whitespace-nowrap">
                      <span className="text-electric/80">◈</span> {tool}
                    </span>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────── RUNTIME ─────────────────────────── */}
      <section id="runtime" className="scroll-mt-20 border-t border-line bg-abyss/50">
        <div className="mx-auto max-w-6xl px-5 py-24">
          <Reveal>
            <Line no="01">agent runtime</Line>
            <h2 className="max-w-3xl font-display text-[clamp(2rem,4.5vw,3.2rem)] font-semibold leading-[1.04] tracking-tightest text-frost text-balance">
              Autonomous where it earns it.
              <br />
              Gated where it matters.
            </h2>
            <p className="mt-6 max-w-2xl text-[17px] leading-relaxed text-ghost pretty">
              Every edit lands as a reviewable change. Every command waits for your approval. Before the
              agent says done, it diffs its own diagnostics and runs your tests — repairing what it broke,
              bounded and cancellable.
            </p>
          </Reveal>

          <Reveal delay={0.08}>
            <div className="mx-auto mt-12 max-w-4xl">
              <AgentShowcase />
            </div>
          </Reveal>

          <div className="mt-14 grid gap-x-8 gap-y-10 md:grid-cols-2 lg:grid-cols-3">
            {RUNTIME.map((feature) => (
              <Reveal key={feature.title}>
                <div className="border-t border-line pt-4">
                  <span className="font-mono text-[12px] text-electric">{feature.tag}</span>
                  <h3 className="mt-3 font-display text-lg font-semibold text-frost">{feature.title}</h3>
                  <p className="mt-2 text-[15px] leading-relaxed text-ghost pretty">{feature.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ─────────────────────────── SKETCH BUILDER ─────────────────────────── */}
      <section id="sketches" className="scroll-mt-20 border-t border-line">
        <div className="mx-auto max-w-6xl px-5 py-24">
          <Reveal>
            <Line no="02">sketch builder</Line>
            <h2 className="max-w-3xl font-display text-[clamp(2rem,4.5vw,3.2rem)] font-semibold leading-[1.04] tracking-tightest text-frost text-balance">
              Drag a whole system onto the canvas.
            </h2>
            <p className="mt-6 max-w-2xl text-[17px] leading-relaxed text-ghost pretty">
              Predefined agent topologies, ready to run — exactly as they appear on the real board. Drag the{" "}
              <span className="font-semibold text-frost">Design a Key-Value Store</span> card onto the canvas
              and it lays down the eleven wired agents from the ByteByteGo chapter — requirements,
              architecture, storage engine, consistent hashing, replication + quorum, vector clocks, gossip +
              failover, integrate + server, tests, build + validate, and a review / run-guide. Or drop the{" "}
              <span className="font-semibold text-frost">Real-time Gaming Leaderboard</span> card for a full
              Redis-sorted-set build. Set the goal at the top, hit Run, and watch the agents light up in
              order.
            </p>
          </Reveal>

          <Reveal delay={0.08}>
            <div className="mt-12">
              <SketchBuilder />
            </div>
          </Reveal>
        </div>
      </section>

      {/* ─────────────────────────── SYSTEMS ─────────────────────────── */}
      <section id="systems" className="scroll-mt-20 border-t border-line bg-abyss/50">
        <div className="mx-auto max-w-6xl px-5 py-24">
          <Reveal>
            <Line no="03">core systems</Line>
            <h2 className="max-w-3xl font-display text-[clamp(2rem,4.5vw,3.2rem)] font-semibold leading-[1.04] tracking-tightest text-frost text-balance">
              Four subsystems, one editor.
            </h2>
          </Reveal>

          <div className="mt-12 grid gap-x-8 gap-y-10 sm:grid-cols-2">
            {SYSTEMS.map((system) => (
              <Reveal key={system.name}>
                <div className="border-t border-line pt-4">
                  <div className="flex items-baseline justify-between">
                    <span className="font-mono text-[12px] text-electric">{system.key}</span>
                    <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-ghost/60">
                      {system.sub}
                    </span>
                  </div>
                  <h3 className="mt-3 font-display text-xl font-semibold text-frost">{system.name}</h3>
                  <p className="mt-2 text-[15px] leading-relaxed text-ghost pretty">{system.body}</p>
                </div>
              </Reveal>
            ))}
          </div>

          {/* power tools strip */}
          <div className="mt-14 grid gap-x-8 gap-y-10 md:grid-cols-3">
            {TOOLS.map((tool) => (
              <Reveal key={tool.title}>
                <div className="border-t border-line pt-4">
                  <span className="font-mono text-[12px] text-leaf">{tool.tag}</span>
                  <h3 className="mt-3 font-display text-lg font-semibold text-frost">{tool.title}</h3>
                  <p className="mt-2 text-[15px] leading-relaxed text-ghost pretty">{tool.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ─────────────────────────── MODELS ─────────────────────────── */}
      <section id="models" className="scroll-mt-20 border-t border-line">
        <div className="mx-auto max-w-6xl px-5 py-24">
          <Reveal>
            <Line no="04">any model · your key</Line>
            <h2 className="max-w-3xl font-display text-[clamp(2rem,4.5vw,3.2rem)] font-semibold leading-[1.04] tracking-tightest text-frost text-balance">
              Fuse it to any intelligence — from your machine.
            </h2>
            <p className="mt-6 max-w-2xl text-[17px] leading-relaxed text-ghost pretty">
              One registry, hundreds of models. Anthropic runs on a native adapter with prompt caching and
              full tool use; everything else flows through one OpenAI-compatible pipe. Requests travel from
              your machine to the provider — no relay, no logging, keys sealed in your keychain.
            </p>
          </Reveal>

          <Reveal delay={0.08}>
            <div className="mt-12">
              <Providers />
            </div>
          </Reveal>

          <Reveal delay={0.12}>
            <div className="mt-16">
              <Stats />
            </div>
          </Reveal>
        </div>
      </section>

      {/* ─────────────────────────── INITIALIZE ─────────────────────────── */}
      <section id="init" className="scroll-mt-20 border-t border-line bg-abyss/50">
        <div className="mx-auto max-w-6xl px-5 py-24 text-center">
          <Reveal>
            <div className="flex justify-center">
              <Line no="05">download levelcode.ai</Line>
            </div>
            <h2 className="mx-auto max-w-3xl font-display text-[clamp(2.4rem,6vw,4.2rem)] font-semibold leading-[1] tracking-tightest text-frost text-balance">
              Install the agent swarm.
            </h2>
            <p className="mx-auto mt-6 max-w-md text-[17px] leading-relaxed text-ghost pretty">
              Free and open. Drag the .dmg to Applications, add a key — or run fully offline on local Ollama
              — and the agents come alive.
            </p>
          </Reveal>
          <Reveal delay={0.08}>
            <div className="mt-12 flex justify-center">
              <DownloadCard />
            </div>
          </Reveal>
        </div>
      </section>

      {/* ─────────────────────────── FOOTER ─────────────────────────── */}
      <footer className="border-t border-line bg-void/50">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-5 py-8 font-mono text-[12px] text-ghost/70 md:flex-row md:items-center md:justify-between">
          <span className="font-display text-sm font-bold tracking-tightest text-frost">
            Level<span className="pp">Code</span>.ai
          </span>
          <span>Built on Code-OSS · MIT · open source</span>
          <span className="flex items-center gap-4">
            <a href={GITHUB} target="_blank" rel="noreferrer" className="transition-colors hover:text-frost">
              GitHub
            </a>
            <a href="#init" className="transition-colors hover:text-frost">
              Download
            </a>
            <span>© {new Date().getFullYear()}</span>
          </span>
        </div>
      </footer>
    </main>
  );
}

const RUNTIME = [
  {
    tag: "apply-then-review",
    title: "Keep / Undo on every file",
    body: "Edits land instantly and await your verdict — per file or all at once, live +/− totals, state survives reloads.",
  },
  {
    tag: "⛨ self-verification",
    title: "Proves itself before reporting",
    body: "Diffs diagnostics against a pre-run baseline and runs your verify command; new failures loop back for repair — bounded, never runaway.",
  },
  {
    tag: "↩ checkpoints",
    title: "Rewind any turn",
    body: "Every agent turn is a checkpoint. One click rolls files, transcript, and pending reviews back to before it ran.",
  },
  {
    tag: "▶ approval-gated",
    title: "A live terminal, on your terms",
    body: "Commands stream real stdout/stderr only after you approve; Stop kills the whole process tree — no orphaned servers.",
  },
  {
    tag: "background",
    title: "Servers keep running",
    body: "Long commands detach and keep streaming while the agent works on; it polls output, sniffs the port, tests against the live process.",
  },
  {
    tag: "transparent",
    title: "Real token accounting",
    body: "A live context meter with actual usage from the provider — click it for the full breakdown. Cost opacity is the enemy.",
  },
];

const SYSTEMS = [
  {
    key: "⇥",
    sub: "reflex",
    name: "Autocomplete",
    body: "Debounced ghost text over every file, cancelled the instant you keep typing. Routed to a fast model per provider.",
  },
  {
    key: "⌘⌥I",
    sub: "cognition",
    name: "Chat",
    body: "Streaming chat that knows your project — pin files or let ripgrep + workspace symbols pull context automatically.",
  },
  {
    key: "⌘⌥E",
    sub: "revision",
    name: "Edit",
    body: "Select code, state the change, review a true side-by-side diff. Keep or discard — nothing applies behind your back.",
  },
  {
    key: "default",
    sub: "autonomy",
    name: "Agent",
    body: "State the goal. It plans, edits across files, runs behind approval gates, and verifies before reporting.",
  },
];

const TOOLS = [
  {
    tag: "np++ toolkit",
    title: "Power-editing pack",
    body: "Keystroke macros, line ops, column mode with incrementing numbers, encoding/EOL controls, big-file mode, hot-exit.",
  },
  {
    tag: "hack layer",
    title: "Init script + packages",
    body: "Code that runs at boot and hot-reloads on save; a package generator with a live dev loop; Atom / NPP / Sublime keymaps.",
  },
  {
    tag: "continuity",
    title: "Sync + import",
    body: "Built-in Settings Sync, notify-only updates, and one-click import from VS Code, VSCodium, or Cursor.",
  },
];
