import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { captureAttribution } from "./attribution";
import "./globals.css";

// First-touch campaign attribution — record the marketing channel (?linkedin=…/?youtube=…/utm_*) before
// render, so it's known at sign-in even after the visitor navigates around. Best-effort; never throws.
captureAttribution();

// The LevelCode Cloud account app mounts under /ai on every host (owner decision:
// the /ai prefix never collides with the 7-char shortcode lookup). Rails serves
// this shell (app/views/static/ui_levelcode.html) for /ai and levelcode hosts.
//
// DEV: `npm run dev` → open http://localhost:<port>/ai (the vite.config rewrite
// serves this entry there, with HMR). The API + /ai server routes are proxied to
// the backend (VITE_BACKEND, default the ngrok tunnel) so it's same-origin — no
// CORS, and the session cookie works. Open /ai, NOT /levelcode.html (basename "/ai"
// can't match that path → blank).
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter basename="/ai">
      <App />
    </BrowserRouter>
  </StrictMode>,
);
