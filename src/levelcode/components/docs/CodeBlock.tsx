import { useEffect, useRef, useState, type ComponentPropsWithoutRef } from "react";

// The frame around every fenced code block.
//
// rehype-pretty-code rewrites each ```fence``` into
// `<figure data-rehype-pretty-code-figure><pre data-language="…">…</pre></figure>`
// and has already emitted the highlighted tokens at build time, so this owns only
// the chrome: the pane, the language tag, and the copy button. Both the text and
// the language are read off the live DOM node rather than from props, because the
// language sits on the inner <pre> and the tokens are nested spans — reading the
// node keeps this agnostic about that shape.
//
// The pane stays One Dark in BOTH themes: it is a picture of the editor, and the
// editor's code panes do not turn light.

export default function CodeBlock({ children, ...props }: ComponentPropsWithoutRef<"figure">) {
  const ref = useRef<HTMLElement>(null);
  const [copied, setCopied] = useState(false);
  const [lang, setLang] = useState<string | null>(null);

  useEffect(() => {
    setLang(ref.current?.querySelector("pre")?.getAttribute("data-language") ?? null);
  }, []);

  async function copy() {
    const text = ref.current?.querySelector("pre")?.textContent ?? "";
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      /* clipboard unavailable (insecure origin / denied) — leave the label alone */
    }
  }

  // Note on the [&_code]: resets — the `code` mapping in mdxComponents styles
  // INLINE code (border, padding, tinted background). MDX maps by tag name with
  // no notion of nesting, so it also lands on the <code> inside a fence and draws
  // a second box within this frame; these strip it back off.
  return (
    <figure
      ref={ref}
      {...props}
      className="group relative my-5 overflow-hidden rounded-md border border-black/20 bg-[#0d1321] [&_code]:grid [&_code]:rounded-none [&_code]:border-0 [&_code]:bg-transparent [&_code]:p-0 [&_code]:font-mono [&_code]:text-[13.5px] [&_code]:leading-[1.65] [&_pre]:overflow-x-auto [&_pre]:bg-transparent [&_pre]:py-4 [&_[data-line]]:px-4"
    >
      <div className="absolute right-2 top-2 z-10 flex items-center gap-2">
        {lang ? (
          <span className="select-none font-mono text-[11px] uppercase tracking-wide text-[#7d8695] opacity-0 transition-opacity group-hover:opacity-100">
            {lang}
          </span>
        ) : null}
        <button
          type="button"
          onClick={copy}
          aria-label={copied ? "Copied to clipboard" : "Copy code"}
          className="rounded-[4px] border border-white/10 bg-white/5 px-2 py-1 font-mono text-[11px] text-[#b9c0cb] opacity-0 transition-all hover:border-white/25 hover:bg-white/10 focus-visible:opacity-100 group-hover:opacity-100"
        >
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      {children}
    </figure>
  );
}
