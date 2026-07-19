import type { ReactNode } from "react";

/**
 * Section eyebrow: a line-number marker + the label. Structural, not decorative —
 * it tells you where you are in the file. Ported from levelcode.dev.
 */
export default function Line({ no, children }: { no: string; children: ReactNode }) {
  return (
    <div className="mb-5 flex items-baseline gap-3">
      <span className="lineno">L{no}</span>
      <span className="font-mono text-[12px] uppercase tracking-[0.18em] text-flame">{children}</span>
    </div>
  );
}
