import mdx from "@mdx-js/rollup";
import react from "@vitejs/plugin-react";
import path from "path";
import rehypePrettyCode from "rehype-pretty-code";
import rehypeSlug from "rehype-slug";
import remarkGfm from "remark-gfm";
import { defineConfig, Plugin } from "vite";

function injectRuntimeEnv(): Plugin {
  return {
    name: "inject-runtime-env",
    transformIndexHtml(html) {
      const clientId =
        process.env.GOOGLE_CLIENT_ID || process.env.VITE_GOOGLE_CLIENT_ID || "";
      const envScript = `<script>window.__ENV__ = ${JSON.stringify({ GOOGLE_CLIENT_ID: clientId })};</script>`;
      return html.replace("</head>", `  ${envScript}\n</head>`);
    },
  };
}

// LevelCode Cloud SERVER endpoints (Rails). In prod Rails serves these directly; in
// dev they're proxied to the backend (see server.proxy below). Everything ELSE
// under /ai/* is a client route → the SPA shell.
const AI_SERVER_PREFIXES = ["/ai/auth", "/ai/checkout", "/ai/billing", "/ai/signout", "/ai/csrf"];

function isAiServerPath(url: string): boolean {
  return AI_SERVER_PREFIXES.some((p) => url === p || url.startsWith(`${p}/`) || url.startsWith(`${p}?`));
}

// Dev only: serve the LevelCode Cloud entry (levelcode.html) for /ai and /ai/* client
// routes so the account app runs with HMR at http://localhost:<port>/ai — matching
// how Rails serves it in prod (BrowserRouter basename="/ai"). The /ai SERVER
// endpoints (AI_SERVER_PREFIXES) are excluded — they hit server.proxy instead.
function serveLevelcodeUnderAi(): Plugin {
  return {
    name: "serve-levelcode-under-ai",
    apply: "serve",
    configureServer(server) {
      server.middlewares.use((req, _res, next) => {
        const url = req.url || "";
        const isAiPath = url === "/ai" || url.startsWith("/ai/") || url.startsWith("/ai?");
        if (isAiPath && !isAiServerPath(url)) {
          req.url = "/levelcode.html";
        }
        next();
      });
    },
  };
}

// Dev backend for the proxy. Default: the ngrok tunnel to your local Rails
// (matches src/apis/config.js). Override with VITE_BACKEND=http://localhost:3000
// if you run Rails directly.
const DEV_BACKEND = process.env.VITE_BACKEND || "https://thinly.ngrok.app";
const DEV_BACKEND_ORIGIN = new URL(DEV_BACKEND).origin;

// Same-origin dev: proxy the API + the /ai server endpoints to the backend so the
// browser sees localhost:<port> (no CORS, and the Devise session cookie works).
// The levelcode app uses relative URLs (api.ts API_BASE=""), so its calls flow here;
// the thin.ly app uses absolute URLs and is unaffected.
const devProxy = Object.fromEntries(
  ["/api", "/users", ...AI_SERVER_PREFIXES].map((prefix) => [
    prefix,
    {
      target: DEV_BACKEND,
      changeOrigin: true,
      secure: false,
      cookieDomainRewrite: "",
      headers: {
        "ngrok-skip-browser-warning": "true",
        // Rails' CSRF Origin check compares the Origin header to request.base_url.
        // changeOrigin makes the backend see its OWN host, but the browser's Origin
        // is localhost:<port> → mismatch → 422. Rewrite Origin to match the backend
        // (dev only; the proxy is trusted).
        origin: DEV_BACKEND_ORIGIN,
      },
    },
  ]),
);

// The LevelCode docs (/ai/docs → levelcode.ai/docs) are authored as MDX under
// src/levelcode/docs. remark-gfm buys tables; rehype-slug puts an id on every
// heading for the on-this-page rail; rehype-pretty-code highlights fences with
// Shiki AT BUILD TIME, so no highlighting runtime ships to the browser.
// `providerImportSource` wires MDXProvider, which is how a page can use <Tabs>,
// <Steps> or <Kbd> with no import (see DocsLayout).
const mdxPlugin: Plugin = {
  enforce: "pre", // .mdx must compile to JSX before plugin-react sees it
  ...mdx({
    providerImportSource: "@mdx-js/react",
    remarkPlugins: [remarkGfm],
    rehypePlugins: [
      rehypeSlug,
      [
        rehypePrettyCode,
        // One Dark is the editor's own palette; the pane color belongs to the
        // CodeBlock component, not the highlighter theme.
        { theme: "one-dark-pro", keepBackground: false, defaultLang: "text" },
      ],
    ],
  }),
};

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    mdxPlugin,
    // .mdx joins the react plugin's include so Fast Refresh covers doc pages too
    react({ include: /\.(jsx|js|mdx|md|tsx|ts)$/ }),
    injectRuntimeEnv(),
    serveLevelcodeUnderAi(),
  ],
  // Multi-page build: the thin.ly shortener SPA (index.html) and the LevelCode Cloud
  // account app (levelcode.html). Vite auto-extracts the shared chunks; Rails serves
  // the right shell per Host (see thin.ly StaticController#ui).
  build: {
    rollupOptions: {
      input: {
        main: path.resolve(import.meta.dirname, "index.html"),
        levelcode: path.resolve(import.meta.dirname, "levelcode.html"),
      },
    },
  },
  server: {
    port: 4000,
    proxy: devProxy,
  },
  resolve: {
    alias: {
      "@": path.join(import.meta.dirname, "src"),
    },
  },
  define: {
    "process.env": process.env,
  },
});
