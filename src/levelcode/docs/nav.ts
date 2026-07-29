// The single source of truth for the docs tree.
//
// Three consumers read this, so a page added here shows up everywhere at once:
// the sidebar (components/docs/Sidebar), the prev/next pager, and the
// machine-readable index generated into public/llms.txt by
// scripts/gen-llms-txt.mjs.
//
// Hrefs are SPA paths relative to the /ai basename set in main.tsx, so "/docs"
// is served publicly as levelcode.ai/docs (the same arrangement as /terms and
// /privacy).
//
// `blurb` is a one-line summary written for BOTH humans (card subtitles) and
// models (the llms.txt index) — make it say what the page actually answers.

export type DocLink = {
  title: string;
  href: string;
  blurb: string;
};

export type DocGroup = {
  group: string;
  items: DocLink[];
};

export const DOCS_NAV: DocGroup[] = [
  {
    group: "Get started",
    items: [
      {
        title: "Overview",
        href: "/docs",
        blurb: "What LevelCode is, how the AI layer is wired, and where to go next.",
      },
      {
        title: "Quickstart",
        href: "/docs/quickstart",
        blurb:
          "Install the editor, connect a model provider, and run your first agent task end to end.",
      },
      {
        title: "Install and setup",
        href: "/docs/setup",
        blurb:
          "Download and verify a build, run from source, and handle macOS first-launch prompts.",
      },
    ],
  },
  {
    group: "AI",
    items: [
      {
        title: "Chat",
        href: "/docs/chat",
        blurb:
          "Ask questions about your codebase, with context pulled in automatically or pinned by hand.",
      },
      {
        title: "Agent",
        href: "/docs/agent",
        blurb:
          "The autonomous loop: planning, multi-file edits, approval-gated commands, self-verification, and checkpoints.",
      },
      {
        title: "Edit",
        href: "/docs/edit",
        blurb: "Select code, describe the change, and review it as a diff before anything lands.",
      },
      {
        title: "Autocomplete",
        href: "/docs/autocomplete",
        blurb: "Inline ghost-text completion as you type, and how to tune it.",
      },
      {
        title: "Providers and models",
        href: "/docs/providers",
        blurb:
          "Bring your own key for any supported provider, run models locally with Ollama, or use the metered gateway.",
      },
    ],
  },
  {
    group: "MCP",
    items: [
      {
        title: "MCP servers",
        href: "/docs/mcp",
        blurb:
          "Connect Model Context Protocol servers to give the agent tools LevelCode doesn't ship, and the approval model that governs them.",
      },
      {
        title: "Server recipes",
        href: "/docs/mcp-recipes",
        blurb:
          "Working configurations for GitHub, the filesystem, image generation, and hosted servers — plus how to keep API tokens out of settings.json.",
      },
    ],
  },
  {
    group: "The editor",
    items: [
      {
        title: "Power editing",
        href: "/docs/power-editing",
        blurb:
          "The Notepad++ pack: macros, column mode, line operations, encoding and line-ending control, big-file mode.",
      },
      {
        title: "Hackability",
        href: "/docs/hackability",
        blurb: "The init script, package authoring with hot reload, keymap presets, and themes.",
      },
      {
        title: "Import and updates",
        href: "/docs/import-and-updates",
        blurb:
          "Bring your settings over from VS Code, VSCodium, or Cursor, install extensions from Open VSX, and stay on the latest build.",
      },
    ],
  },
  {
    group: "Account",
    items: [
      {
        title: "Cloud and billing",
        href: "/docs/cloud",
        blurb:
          "Sign in, understand credits and usage, and decide between your own key and the metered gateway.",
      },
    ],
  },
  {
    group: "Help",
    items: [
      {
        title: "Troubleshooting",
        href: "/docs/troubleshooting",
        blurb:
          "Fixes for first-launch blocks, provider and key errors, agent and terminal problems, and update failures.",
      },
    ],
  },
];

/** Flat list in sidebar order — used for prev/next and the llms.txt index. */
export const DOCS_FLAT: DocLink[] = DOCS_NAV.flatMap((g) => g.items);

/** The page before and after `href` in reading order, for the footer pager. */
export function docNeighbors(href: string): { prev: DocLink | null; next: DocLink | null } {
  const i = DOCS_FLAT.findIndex((d) => d.href === href);
  if (i === -1) return { prev: null, next: null };
  return {
    prev: i > 0 ? DOCS_FLAT[i - 1] : null,
    next: i < DOCS_FLAT.length - 1 ? DOCS_FLAT[i + 1] : null,
  };
}
