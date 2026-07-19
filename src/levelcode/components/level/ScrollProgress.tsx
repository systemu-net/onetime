import { useEffect, useState } from "react";

/** Thin reading-progress bar pinned to the top of the viewport. Ported from levelcode.dev. */
export default function ScrollProgress() {
  const [pct, setPct] = useState(0);

  useEffect(() => {
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const h = document.documentElement.scrollHeight - window.innerHeight;
        setPct(h > 0 ? Math.min(1, window.scrollY / h) : 0);
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <div aria-hidden className="pointer-events-none fixed inset-x-0 top-0 z-[60] h-[2px]">
      <div
        className="h-full bg-flame/90 transition-[width] duration-150 ease-out"
        style={{ width: `${pct * 100}%` }}
      />
    </div>
  );
}
