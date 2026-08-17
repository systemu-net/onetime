// What the visitor is holding, and therefore what we can honestly offer them.
//
// LevelCode ships one artifact: a macOS .dmg, Apple Silicon or Intel. On anything else — a phone, a
// tablet, Windows, Linux — a Download button is a dead end dressed as the primary action. So the
// landing page asks this before deciding what its main call to action should be.
//
// Split in two on purpose:
//
//   isMacDevice()  SYNCHRONOUS. Answers only "is this a Mac at all", which is all the UI needs to
//                  choose a CTA. It has to be sync: an async answer means the page renders Download,
//                  then swaps it for something else a frame later, and a primary button that changes
//                  under the reader's thumb is worse than either version of it.
//
//   detectMac()    ASYNC, and only for the ARCHITECTURE. The probes it needs (Chromium's
//                  high-entropy hints, a WebGL renderer string) are genuinely async or expensive, and
//                  nothing depends on them until a Mac visitor is already looking at a download page.
//
// Both are best-effort by design: the UI always exposes every build regardless of what these say.

export type Detected = "arm64" | "x64" | "unknown-mac" | "not-mac";

/**
 * Is this a Mac? Synchronous, so a caller can decide layout on the first render.
 *
 * iPadOS deliberately reports itself as "MacIntel", which is why the touch-point check is here and
 * not an afterthought: without it every iPad — the most likely tablet to open this page — is told to
 * download a desktop binary it cannot run.
 */
export function isMacDevice(): boolean {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent || "";
  const isMac = /Mac/i.test(navigator.platform || "") || /Macintosh/.test(ua);
  const isIpad = isMac && (navigator.maxTouchPoints ?? 0) > 1;
  return isMac && !isIpad;
}

/** Best-effort architecture detection — layered, never blocking, and never the only way to a build. */
export async function detectMac(): Promise<Detected> {
  if (!isMacDevice()) return "not-mac";

  const nav = navigator as Navigator & {
    userAgentData?: { getHighEntropyValues?: (hints: string[]) => Promise<{ architecture?: string }> };
  };

  // 1) Chromium high-entropy hints (async; undefined in Safari/Firefox).
  try {
    const hi = await nav.userAgentData?.getHighEntropyValues?.(["architecture"]);
    if (hi?.architecture === "arm") return "arm64";
    if (hi?.architecture === "x86") return "x64";
  } catch {
    /* fall through */
  }

  // 2) WebGL renderer (works in Safari/Firefox/Chromium). Apple GPU ⇒ Apple Silicon.
  try {
    const canvas = document.createElement("canvas");
    const gl = (canvas.getContext("webgl") || canvas.getContext("experimental-webgl")) as WebGLRenderingContext | null;
    const ext = gl?.getExtension("WEBGL_debug_renderer_info");
    const r = ext && gl ? String(gl.getParameter(ext.UNMASKED_RENDERER_WEBGL)) : "";
    if (/apple/i.test(r)) return "arm64";
    if (/intel|amd|radeon/i.test(r)) return "x64";
  } catch {
    /* fall through */
  }

  return "unknown-mac"; // default the CTA to Apple Silicon (every Mac since late-2020)
}
