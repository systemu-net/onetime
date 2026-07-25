// <Kbd keys="cmd+alt+i" /> — keyboard shortcuts, which this product has a lot of.
// Authors write the VS Code spelling (the same string that appears in
// keybindings.json) and it renders as macOS keycaps, so the docs and the
// keybinding file can never drift into two different notations.

const GLYPHS: Record<string, string> = {
  cmd: "⌘",
  command: "⌘",
  meta: "⌘",
  ctrl: "⌃",
  control: "⌃",
  alt: "⌥",
  option: "⌥",
  opt: "⌥",
  shift: "⇧",
  enter: "↩",
  return: "↩",
  tab: "⇥",
  escape: "⎋",
  esc: "⎋",
  space: "Space",
  backspace: "⌫",
  delete: "⌦",
  up: "↑",
  down: "↓",
  left: "←",
  right: "→",
};

function cap(part: string): string {
  const k = part.trim().toLowerCase();
  if (GLYPHS[k]) return GLYPHS[k];
  return part.trim().length === 1 ? part.trim().toUpperCase() : part.trim();
}

export default function Kbd({ keys }: { keys: string }) {
  // "cmd+alt+i" → ⌘⌥I. A chord ("cmd+k cmd+s") is space-separated; each half
  // becomes its own cap group with a thin gap, matching how VS Code shows them.
  const chords = keys.trim().split(/\s+/);

  return (
    <span className="inline-flex items-baseline gap-1 whitespace-nowrap align-baseline">
      {chords.map((chord, ci) => (
        <kbd
          key={`${chord}-${ci}`}
          className="inline-flex items-center rounded-[4px] border border-[var(--c-line)] bg-[var(--c-surface)] px-[6px] py-[2px] font-mono text-[12.5px] font-medium text-[var(--c-text)]"
        >
          {chord.split("+").map(cap).join("")}
        </kbd>
      ))}
    </span>
  );
}
