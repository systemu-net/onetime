import { useEffect, useState } from "react";
import LevelNav from "../components/LevelNav";
// One implementation, shared with the landing page — which needs the same question answered
// before it can decide whether a Download button is even a sensible primary action.
import { detectMac, type Detected } from "../platform";

// Direct links to the latest published macOS builds. GitHub's /releases/latest/download/<asset>
// alias always 302s to the newest published (non-prerelease) asset of that exact name.
// NOTE: these resolve for anonymous users only once (a) the repo/releases are public and
// (b) a release is published carrying assets named exactly LevelCode-arm64.dmg / LevelCode-x64.dmg.
const RELEASES = "https://github.com/levelcodeai/levelcode/releases/latest";
const DMG = {
  arm64: `${RELEASES}/download/LevelCode-arm64.dmg`,
  x64: `${RELEASES}/download/LevelCode-x64.dmg`,
} as const;

export default function DownloadPage() {
  const [detected, setDetected] = useState<Detected>("unknown-mac");

  useEffect(() => {
    let alive = true;
    detectMac().then((d) => {
      if (alive) setDetected(d);
    });
    return () => {
      alive = false;
    };
  }, []);

  const primaryArch: "arm64" | "x64" = detected === "x64" ? "x64" : "arm64";
  const primaryLabel = primaryArch === "arm64" ? "Apple Silicon" : "Intel";
  const notMac = detected === "not-mac";

  return (
    <>
      <LevelNav />
      <main className="mx-auto max-w-3xl px-5 py-24">
        <div className="lineno mb-4">06 · download</div>
        <h1 className="font-display text-[clamp(2rem,5vw,3.2rem)] font-semibold leading-[1.04] tracking-tightest text-balance">
          Download <span className="pp">LevelCode</span> for macOS
        </h1>
        <p className="mt-5 max-w-xl text-[17px] leading-relaxed text-sub pretty">
          The AI-native editor — your plan, keys, and usage in one place. Universal on any modern Mac; pick
          Intel if you’re on an older one.
        </p>

        {notMac ? (
          <div className="surface mt-8 p-5 text-[14px] text-sub">
            LevelCode is a macOS app for now. Grab it on your Mac — or download a build below to move over.
          </div>
        ) : null}

        <div className="mt-9 flex flex-col items-start gap-3">
          <a href={DMG[primaryArch]} className="btn-primary text-[15px]" download>
            Download for {primaryLabel} Mac
          </a>
          <p className="font-mono text-[12px] text-faint">Universal .dmg · latest release · macOS 12 Monterey or later</p>
        </div>

        <div className="mt-10 lineno">all builds</div>
        <div className="mt-3 flex flex-wrap gap-3">
          <a href={DMG.arm64} className="btn-ghost text-[14px]" download>
            Apple Silicon (M1–M4)
          </a>
          <a href={DMG.x64} className="btn-ghost text-[14px]" download>
            Intel Mac (x64)
          </a>
        </div>
        <p className="mt-4 font-mono text-[12px] text-faint">
          Not sure which Mac you have? Apple menu  → About This Mac. “Apple M…” chip → Apple Silicon; “Intel” → Intel.
        </p>
      </main>
    </>
  );
}
