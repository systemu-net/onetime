// Generate public/llms.txt — the machine-readable index of the LevelCode docs,
// following the llms.txt convention (https://llmstxt.org). An agent fetches this
// one file to discover every page before deciding what to read.
//
// It is generated from src/levelcode/docs/nav.ts, the same list the sidebar
// renders, so a page can never be in the navigation and missing from the index.
// Run as part of `npm run build` (prebuild), so the file can't go stale.
//
// Vite copies public/ to the dist root, and scripts/sync-to-thinly.mjs pushes it
// on to the Rails app, which serves it at levelcode.ai/llms.txt.

import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, "..");
const NAV = join(root, "src", "levelcode", "docs", "nav.ts");
const OUT = join(root, "public", "llms.txt");

const SITE = "https://levelcode.ai";

const INTRO = `# LevelCode

> LevelCode is an AI-native, hackable code editor for macOS, built on Code-OSS (MIT). It reads your codebase, edits across files, runs commands behind approval gates, and verifies its own work — using your own provider API key, a local model via Ollama, or a metered LevelCode Cloud plan.

- macOS only. Apple Silicon and Intel.
- Four AI systems share one provider configuration: Chat, Agent, Edit, and Autocomplete.
- Agent edits apply immediately and are reversible per file (Keep/Undo) and per turn (checkpoints). Shell commands require approval unless Autopilot is on.
- Supported providers: Anthropic, OpenAI, OpenRouter, Groq, Together, Fireworks, DeepSeek, xAI, Mistral, any OpenAI-compatible endpoint, and local Ollama. Agent mode requires tool-calling and does not run on Ollama.
- Extensions come from Open VSX, not the Microsoft marketplace.
- Settings Sync is NOT currently available, despite older README text saying otherwise.
`;

// nav.ts is TypeScript, so it can't be imported from a plain node script without a
// build step. Parsing the object literals keeps this dependency-free; the shapes
// are fixed by the DocGroup/DocLink types next door.
function parseNav(source) {
  const body = source.slice(source.indexOf("export const DOCS_NAV"));
  const groups = [];

  const groupRe = /group:\s*"((?:[^"\\]|\\.)*)"/g;
  const itemRe = /\{\s*title:\s*"((?:[^"\\]|\\.)*)",\s*href:\s*"((?:[^"\\]|\\.)*)",\s*blurb:\s*\n?\s*"((?:[^"\\]|\\.)*)",?\s*\}/g;

  const marks = [...body.matchAll(groupRe)];
  for (let i = 0; i < marks.length; i++) {
    const start = marks[i].index;
    const end = i + 1 < marks.length ? marks[i + 1].index : body.length;
    const slice = body.slice(start, end);
    const items = [...slice.matchAll(itemRe)].map((m) => ({
      title: m[1],
      href: m[2],
      blurb: m[3].replace(/\\"/g, '"'),
    }));
    groups.push({ group: marks[i][1], items });
  }
  return groups;
}

const nav = parseNav(readFileSync(NAV, "utf8"));

const total = nav.reduce((n, g) => n + g.items.length, 0);
if (total === 0) {
  console.error("gen-llms-txt: parsed 0 pages from nav.ts — refusing to write an empty index.");
  process.exit(1);
}

const sections = nav.map(
  (g) => `## ${g.group}\n\n${g.items.map((i) => `- [${i.title}](${SITE}${i.href}): ${i.blurb}`).join("\n")}`,
);

writeFileSync(OUT, `${INTRO}\n${sections.join("\n\n")}\n`);
console.log(`gen-llms-txt: wrote public/llms.txt (${nav.length} groups, ${total} pages)`);
