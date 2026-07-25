// Why this exists instead of `el.scrollIntoView()`:
//
// globals.css sets `body { overflow-x: hidden }`. The CSS spec says that when one
// axis is not `visible`, the other computes to `auto` — so the body becomes a
// scroll container. Its clientHeight equals its scrollHeight, so it can never
// actually scroll, but scrollIntoView still walks up to it as the nearest
// scrollable ancestor and silently does nothing. The viewport (documentElement)
// is what really scrolls, so anchor jumps have to target the window explicitly.
//
// `behavior: "instant"` is deliberate: globals.css also sets
// `scroll-behavior: smooth`, which is right for clicking an on-this-page link but
// wrong for arriving at a page, where it would glide down from the previous
// scroll position.

/**
 * Scroll the viewport so `el` sits just below the top edge.
 *
 * Returns whether it actually landed. It can fail legitimately: the doc pages
 * arrive in a lazy chunk, so an early attempt happens while the document is still
 * short, and the browser clamps the scroll to the current maximum. Callers use the
 * result to decide whether to try again once more content has rendered — without
 * it, a deep link silently stays at the top of the page.
 */
export function scrollToElement(el: Element, offset = 24): boolean {
  const want = Math.max(0, el.getBoundingClientRect().top + window.scrollY - offset);
  window.scrollTo({ top: want, behavior: "instant" });
  // `behavior: "instant"` updates scrollY synchronously, so this reads the real
  // outcome rather than a value mid-animation.
  return Math.abs(window.scrollY - want) <= 2;
}

/** Jump to the top of the page. */
export function scrollToTop(): void {
  window.scrollTo({ top: 0, behavior: "instant" });
}
