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
//
// `requiresWebEditor` marks a page about something the backend can switch off (the
// browser edition). While it is off the page is left out of the sidebar and the
// pager at runtime, and out of public/llms.txt at build time, so it is exactly as
// invisible as every other entry point to that feature. The page still answers at
// its own address. Delete the flag to list it unconditionally.

export type DocLink = {
  title: string;
  href: string;
  blurb: string;
  requiresWebEditor?: boolean;
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
      {
        title: "In your browser",
        href: "/docs/browser",
        blurb:
          "Open LevelCode in a browser tab, choose a folder or a scratch workspace, and see what stays in the Mac app.",
        requiresWebEditor: true,
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
        title: "Customization",
        href: "/docs/customization",
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

/** Flat list in sidebar order, every page. Used to look a page up by its address. */
export const DOCS_FLAT: DocLink[] = DOCS_NAV.flatMap((g) => g.items);

/** What the backend currently offers; pages marked `requiresWebEditor` need the first. */
export type DocsAvailability = { webEditor: boolean };

const listed = (d: DocLink, a: DocsAvailability) => !d.requiresWebEditor || a.webEditor;

/** The tree as a reader should see it right now: gated pages out, and a group left empty out. */
export function visibleDocsNav(a: DocsAvailability): DocGroup[] {
  return DOCS_NAV.map((g) => ({ ...g, items: g.items.filter((d) => listed(d, a)) })).filter(
    (g) => g.items.length > 0,
  );
}

/**
 * The page before and after `href` in reading order, for the footer pager. A gated page that is not
 * listed neither appears as a neighbour nor has neighbours of its own: the pager steps through what
 * the sidebar shows.
 */
export function docNeighbors(
  href: string,
  a: DocsAvailability = { webEditor: false },
): { prev: DocLink | null; next: DocLink | null } {
  const flat = DOCS_FLAT.filter((d) => listed(d, a));
  const i = flat.findIndex((d) => d.href === href);
  if (i === -1) return { prev: null, next: null };
  return {
    prev: i > 0 ? flat[i - 1] : null,
    next: i < flat.length - 1 ? flat[i + 1] : null,
  };
}
