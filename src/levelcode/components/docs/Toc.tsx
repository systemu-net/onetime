import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

// The "On this page" rail. Headings are read from the rendered article rather
// than passed in as data — rehype-slug has already put a stable id on each one,
// so there is no second list of headings to keep in sync with the MDX.
//
// `revision` comes from the layout's MutationObserver: the doc pages live in a
// lazy chunk, so on first paint the article is empty and a pathname-only
// dependency would leave the rail permanently blank.

type Heading = { id: string; text: string; level: number };

export default function Toc({ revision = 0 }: { revision?: number }) {
  const { pathname } = useLocation();
  const [headings, setHeadings] = useState<Heading[]>([]);
  const [active, setActive] = useState<string>("");

  // Re-read the headings whenever the article changes. The equality check keeps
  // unrelated mutations — opening an accordion, switching a tab — from causing a
  // pointless re-render on every one.
  useEffect(() => {
    const article = document.querySelector("article");
    if (!article) return;

    const found = Array.from(article.querySelectorAll<HTMLHeadingElement>("h2[id], h3[id]")).map(
      (el) => {
        // Headings carry a trailing "#" permalink; clone and strip it so the rail
        // reads "Get started", not "Get started#".
        const clone = el.cloneNode(true) as HTMLElement;
        clone.querySelectorAll("a").forEach((a) => a.remove());
        return {
          id: el.id,
          text: (clone.textContent ?? "").trim(),
          level: Number(el.tagName[1]),
        };
      },
    );

    setHeadings((prev) =>
      prev.length === found.length && prev.every((h, i) => h.id === found[i].id) ? prev : found,
    );
  }, [pathname, revision]);

  // Scroll spy. The active item is whichever heading most recently crossed the top
  // band of the viewport, which behaves better than an IntersectionObserver ratio
  // when a short section sits between two long ones.
  useEffect(() => {
    if (headings.length === 0) return;

    const onScroll = () => {
      // 120px down from the top: below the sticky nav, so the heading you are
      // "at" is the one you can actually read.
      const probe = 120;
      let current = headings[0].id;
      for (const h of headings) {
        const el = document.getElementById(h.id);
        if (el && el.getBoundingClientRect().top <= probe) current = h.id;
      }
      // At the very bottom nothing new can cross the probe, so the last section
      // would never light up — force it.
      if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 2) {
        current = headings[headings.length - 1].id;
      }
      setActive(current);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [headings]);

  if (headings.length < 2) return null;

  return (
    <nav aria-labelledby="toc-heading" className="text-[13.5px]">
      <p id="toc-heading" className="mb-3 font-semibold text-[var(--c-text)]">
        On this page
      </p>
      <ul className="space-y-1.5 border-l border-[var(--c-line)]">
        {headings.map((h) => (
          <li key={h.id}>
            <a
              href={`#${h.id}`}
              aria-current={active === h.id ? "location" : undefined}
              className={`-ml-px block border-l py-0.5 leading-snug transition-colors ${
                h.level === 3 ? "pl-6" : "pl-3"
              } ${
                active === h.id
                  ? "border-[var(--c-accent)] text-[var(--c-accent)]"
                  : "border-transparent text-[var(--c-text2)] hover:text-[var(--c-text)]"
              }`}
            >
              {h.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
