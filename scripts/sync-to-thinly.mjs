// Sync the built Vite apps into the thin.ly Rails app. Run after `npm run build`.
//
//   dist/assets/*     -> thin.ly/public/assets/                       (both brands' bundles)
//   dist/index.html   -> thin.ly/app/views/static/ui.html            (thin.ly shortener shell)
//   dist/levelcode.html  -> thin.ly/app/views/static/ui_levelcode.html.erb (LevelCode Cloud shell)
//
// The levelcode shell is written as ERB so Rails can inject <%= csrf_meta_tags %>
// (the SPA reads that token for its state-changing POSTs). Both shells get a
// window.__ENV__.BRAND marker. Point at a non-sibling checkout with THINLY_DIR=…
//
// Usage:  node scripts/sync-to-thinly.mjs

import { cpSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const onetime = join(here, "..");
const dist = join(onetime, "dist");
const thinly = process.env.THINLY_DIR || join(onetime, "..", "thin.ly");

if (!existsSync(join(dist, "levelcode.html"))) {
  console.error("dist/levelcode.html not found — run `npm run build` first.");
  process.exit(1);
}
if (!existsSync(thinly)) {
  console.error(`thin.ly not found at ${thinly} — set THINLY_DIR.`);
  process.exit(1);
}

const publicAssets = join(thinly, "public", "assets");
const views = join(thinly, "app", "views", "static");

// 1. Assets (hashed; safe to wipe — public/assets is gitignored + fully rebuilt).
rmSync(publicAssets, { recursive: true, force: true });
mkdirSync(publicAssets, { recursive: true });
cpSync(join(dist, "assets"), publicAssets, { recursive: true });

// 2. thin.ly shell — verbatim, plus BRAND marker.
writeFileSync(join(views, "ui.html"), withBrand(readFileSync(join(dist, "index.html"), "utf8"), "thinly"));

// 3. LevelCode Cloud shell — inject csrf_meta_tags (ERB) + BRAND.
let levelcode = readFileSync(join(dist, "levelcode.html"), "utf8");
levelcode = levelcode.replace("</head>", "  <%= csrf_meta_tags %>\n</head>");
writeFileSync(join(views, "ui_levelcode.html.erb"), withBrand(levelcode, "levelcode"));

console.log(`Synced onetime → ${thinly} (ui.html, ui_levelcode.html.erb, public/assets/).`);

// Replace the Vite-baked window.__ENV__ with one that also carries BRAND (and,
// for levelcode, an empty API_BASE so the client uses same-origin relative URLs).
function withBrand(html, brand) {
  const extra = brand === "levelcode" ? { API_BASE: "" } : {};
  return html.replace(/<script>window\.__ENV__ = (\{[\s\S]*?\});<\/script>/, (_m, json) => {
    let env = {};
    try {
      env = JSON.parse(json);
    } catch {
      env = {};
    }
    return `<script>window.__ENV__ = ${JSON.stringify({ ...env, ...extra, BRAND: brand })};</script>`;
  });
}
