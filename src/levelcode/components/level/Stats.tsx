import { useEffect, useRef, useState } from "react";

/**
 * A compact metrics strip that counts up the first time it scrolls into view. Ported from levelcode.dev.
 * Honors reduced-motion by showing final values immediately.
 */

type Stat = { value: number; suffix?: string; prefix?: string; label: string };

const STATS: Stat[] = [
  { value: 0, suffix: " ", label: "telemetry events phoned home" },
  { value: 0, suffix: " ", label: "servers between you and your model" },
  { value: 10, suffix: "+", label: "providers · hundreds of models" },
  { value: 100, suffix: "%", label: "of AI runs on your own key" },
];

function useCountUp(target: number, run: boolean, ms = 1100) {
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!run) return;
    if (typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setN(target);
      return;
    }
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / ms);
      const eased = 1 - Math.pow(1 - t, 3);
      setN(Math.round(eased * target));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, run, ms]);
  return n;
}

function StatCell({ stat, run }: { stat: Stat; run: boolean }) {
  const n = useCountUp(stat.value, run);
  return (
    <div className="border-t border-rule pt-4">
      <div className="font-display text-[clamp(2rem,5vw,3rem)] font-bold leading-none tracking-tightest text-ink tabular-nums">
        {stat.prefix}
        {n}
        <span className="text-flame">{stat.suffix}</span>
      </div>
      <p className="mt-2 font-mono text-[12px] leading-snug text-faint">{stat.label}</p>
    </div>
  );
}

export default function Stats() {
  const ref = useRef<HTMLDivElement | null>(null);
  const [run, setRun] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setRun(true);
          io.disconnect();
        }
      },
      { rootMargin: "-10% 0px -10% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={ref} className="grid grid-cols-2 gap-x-8 gap-y-8 md:grid-cols-4">
      {STATS.map((stat) => (
        <StatCell key={stat.label} stat={stat} run={run} />
      ))}
    </div>
  );
}
