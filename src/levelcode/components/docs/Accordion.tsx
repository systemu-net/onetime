import { useEffect, useRef, useState, type ReactNode } from "react";
import { scrollToElement } from "./scrollToElement";

// <AccordionGroup> / <Accordion title="…"> — collapsed detail that would
// otherwise bury the main thread of a page (per-error fixes, the long tail of
// settings). Built on native <details>, so it opens without JavaScript, works
// with in-page find, and prints expanded.
//
// Each one gets an id slugified from its title, matching the scheme rehype-slug
// uses for headings, so other pages can deep-link a single entry
// (/docs/troubleshooting#macos-blocks-the-app-on-first-launch). The one piece of
// JS here opens the targeted entry on arrival — without it the link would land
// on a closed row and look broken.

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

export function Accordion({
  title,
  defaultOpen = false,
  children,
}: {
  title: string;
  defaultOpen?: boolean;
  children: ReactNode;
}) {
  const id = slugify(title);
  const ref = useRef<HTMLDetailsElement>(null);
  const [open, setOpen] = useState(defaultOpen);

  useEffect(() => {
    const openIfTargeted = () => {
      if (decodeURIComponent(window.location.hash.slice(1)) !== id) return;
      setOpen(true);
      // Let the row expand before scrolling, or we land at the pre-open offset.
      // The layout retries this too, which is what covers a background tab, where
      // rAF does not fire.
      requestAnimationFrame(() => {
        if (ref.current) scrollToElement(ref.current);
      });
    };
    openIfTargeted();
    window.addEventListener("hashchange", openIfTargeted);
    return () => window.removeEventListener("hashchange", openIfTargeted);
  }, [id]);

  return (
    <details
      ref={ref}
      id={id}
      open={open}
      onToggle={(e) => setOpen((e.currentTarget as HTMLDetailsElement).open)}
      className="group scroll-mt-8 border-b border-[var(--c-line)] last:border-b-0 [&_>_summary_>_svg]:open:rotate-90"
    >
      <summary className="flex cursor-pointer list-none items-center gap-2 py-3 text-[15px] font-medium text-[var(--c-text)] marker:content-none hover:text-[var(--c-accent)] [&::-webkit-details-marker]:hidden">
        <svg
          viewBox="0 0 16 16"
          width="12"
          height="12"
          fill="currentColor"
          aria-hidden
          className="shrink-0 text-[var(--c-text3)] transition-transform duration-150"
        >
          <path d="M6.22 3.22a.75.75 0 0 1 1.06 0l4.25 4.25a.75.75 0 0 1 0 1.06l-4.25 4.25a.75.75 0 0 1-1.06-1.06L9.94 8 6.22 4.28a.75.75 0 0 1 0-1.06Z" />
        </svg>
        {title}
      </summary>
      <div className="pb-4 pl-[20px]">{children}</div>
    </details>
  );
}

export function AccordionGroup({ children }: { children: ReactNode }) {
  return <div className="my-6 rounded-md border border-[var(--c-line)] px-4">{children}</div>;
}
