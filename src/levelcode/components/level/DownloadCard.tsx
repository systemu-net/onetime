// The download section, ported from levelcode.dev. The DMG buttons point at the same GitHub release
// assets the account app's /ai/download page uses (arch-detecting page → these exact files).
const RELEASES = "https://github.com/levelcodeai/levelcode/releases/latest";
const DMG_ARM = `${RELEASES}/download/LevelCode-arm64.dmg`;
const DMG_X64 = `${RELEASES}/download/LevelCode-x64.dmg`;

export default function DownloadCard() {
  return (
    <div className="w-full max-w-2xl text-left">
      <div className="surface p-8">
        <h3 className="font-display text-xl font-semibold text-frost">Install in one drag</h3>
        <p className="mt-2 text-[15px] leading-relaxed text-ghost pretty">
          Download the <span className="font-mono text-[13px]">.dmg</span>, open it, drag LevelCode to
          Applications. Add your API key — or point it at local Ollama — and the editor starts editing with
          you.
        </p>

        <div className="mt-6 flex flex-wrap gap-3">
          <a href={DMG_ARM} className="btn-primary" download>
            <AppleMark />
            Download for Apple Silicon
          </a>
          <a href={DMG_X64} className="btn-ghost" download>
            <AppleMark />
            Intel Mac
          </a>
        </div>

        <p className="mt-4 font-mono text-[12px] text-ghost/70">
          free · MIT · no account required ·{" "}
          <a
            href={RELEASES}
            target="_blank"
            rel="noreferrer"
            className="underline decoration-line underline-offset-4 transition-colors hover:text-frost"
          >
            all releases →
          </a>
        </p>
      </div>
    </div>
  );
}

function AppleMark() {
  return (
    <svg viewBox="0 0 814 1000" width="14" height="14" fill="currentColor" aria-hidden>
      <path d="M788 341c-6 4-107 61-107 187 0 146 128 198 132 199-1 3-20 70-67 138-42 60-86 120-153 120s-84-39-161-39c-75 0-102 40-163 40s-104-56-153-124C60 782 13 660 13 544c0-186 121-285 240-285 63 0 116 42 156 42 38 0 97-44 169-44 27 0 125 2 210 84zM554 172c31-37 53-88 53-139 0-7-1-14-2-20-50 2-110 34-146 76-29 32-55 83-55 135 0 8 1 16 2 18 3 1 8 2 13 2 45 0 102-30 135-72z" />
    </svg>
  );
}
