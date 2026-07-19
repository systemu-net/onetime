import { useEffect, useRef } from "react";

/**
 * The LevelCode agent constellation: rings of orbiting capability nodes drawn in the brand rise ramp
 * (violet → blue → ice). Each node is an agent skill (plan / edit / run / verify / chat / skill).
 * Electrons accelerate when the user scrolls. No nucleus — the headline sits at the center.
 *
 * Ported verbatim from levelcode.dev. Colors come from the --viz-* / --accent-rgb CSS variables
 * (globals.css sets the light-theme ramp so they read on the cream canvas). Canvas + rAF, DPR-aware,
 * no dependencies. Under prefers-reduced-motion a single static frame is drawn and the loop never starts.
 */

type Electron = { a: number; label: string };
type Orbit = {
  tilt: number;
  rx: number;
  ry: number;
  speed: number;
  viz: 1 | 2 | 3;
  electrons: Electron[];
};

const ORBITS: Orbit[] = [
  {
    tilt: -0.52,
    rx: 0.46,
    ry: 0.16,
    speed: 0.5,
    viz: 1,
    electrons: [
      { a: 0.3, label: "plan" },
      { a: Math.PI + 0.6, label: "verify" },
    ],
  },
  {
    tilt: 0.55,
    rx: 0.42,
    ry: 0.15,
    speed: -0.38,
    viz: 2,
    electrons: [
      { a: 1.4, label: "edit" },
      { a: 4.2, label: "chat" },
    ],
  },
  {
    tilt: 1.38,
    rx: 0.44,
    ry: 0.17,
    speed: 0.3,
    viz: 3,
    electrons: [
      { a: 2.6, label: "run" },
      { a: 5.6, label: "skill" },
    ],
  },
];

export default function LevelCanvas({ className = "", labels = true }: { className?: string; labels?: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let size = 0;
    let dpr = 1;
    const state = ORBITS.map((o) => o.electrons.map((e) => e.a));

    let colors = ["#7d6bff", "#5fb4ff", "#a8ecff"];
    let grid = "rgba(125, 107, 255, 0.05)";
    const readTheme = () => {
      const cs = getComputedStyle(document.documentElement);
      colors = [1, 2, 3].map((i) => cs.getPropertyValue(`--viz-${i}`).trim() || colors[i - 1]);
      const accent = cs.getPropertyValue("--accent-rgb").trim();
      if (accent) grid = `rgba(${accent.split(/\s+/).join(", ")}, 0.05)`;
    };
    readTheme();
    const mo = new MutationObserver(() => {
      readTheme();
      if (reduced) draw();
    });
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });

    const resize = () => {
      const rect = canvas.parentElement?.getBoundingClientRect();
      size = Math.min(720, rect ? Math.min(rect.width, rect.height) : 640);
      dpr = Math.min(2, window.devicePixelRatio || 1);
      canvas.width = size * dpr;
      canvas.height = size * dpr;
      canvas.style.width = `${size}px`;
      canvas.style.height = `${size}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const orbitPoint = (o: Orbit, a: number) => {
      const c = size / 2;
      const x0 = Math.cos(a) * o.rx * size;
      const y0 = Math.sin(a) * o.ry * size;
      const ct = Math.cos(o.tilt);
      const st = Math.sin(o.tilt);
      return { x: c + x0 * ct - y0 * st, y: c + x0 * st + y0 * ct };
    };

    const draw = () => {
      const c = size / 2;
      ctx.clearRect(0, 0, size, size);

      ctx.save();
      ctx.translate(c, c);
      ctx.strokeStyle = grid;
      ctx.lineWidth = 1;
      const step = size / 18;
      for (let i = -10; i <= 10; i++) {
        ctx.beginPath();
        ctx.moveTo(i * step, -c);
        ctx.lineTo(i * step, c);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(-c, i * step);
        ctx.lineTo(c, i * step);
        ctx.stroke();
      }
      ctx.restore();

      ORBITS.forEach((o) => {
        ctx.save();
        ctx.translate(c, c);
        ctx.rotate(o.tilt);
        ctx.strokeStyle = colors[o.viz - 1] + "4d";
        ctx.lineWidth = 1;
        ctx.setLineDash([3, 7]);
        ctx.beginPath();
        ctx.ellipse(0, 0, o.rx * size, o.ry * size, 0, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      });

      ORBITS.forEach((o, oi) => {
        const color = colors[o.viz - 1];
        o.electrons.forEach((e, ei) => {
          const a = state[oi][ei];
          const dir = Math.sign(o.speed) || 1;
          for (let k = 14; k >= 1; k--) {
            const pt = orbitPoint(o, a - dir * k * 0.045);
            ctx.globalAlpha = 0.45 * (1 - k / 15);
            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.arc(pt.x, pt.y, 2.4 * (1 - k / 18), 0, Math.PI * 2);
            ctx.fill();
          }
          ctx.globalAlpha = 1;
          const pt = orbitPoint(o, a);
          ctx.save();
          ctx.shadowColor = color;
          ctx.shadowBlur = 14;
          ctx.fillStyle = color;
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, 5.4, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = "#ffffff";
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, 2.2, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
          if (labels) {
            ctx.fillStyle = color;
            ctx.font = "10px ui-monospace, monospace";
            ctx.textAlign = "left";
            ctx.textBaseline = "middle";
            ctx.fillText(e.label, pt.x + 11, pt.y - 1);
          }
        });
      });
    };

    resize();
    window.addEventListener("resize", resize);

    if (reduced) {
      draw();
      return () => {
        mo.disconnect();
        window.removeEventListener("resize", resize);
      };
    }

    let raf = 0;
    let last = performance.now();
    let lastScroll = window.scrollY;
    let boost = 1;

    const tick = (now: number) => {
      raf = requestAnimationFrame(tick);
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const dy = Math.abs(window.scrollY - lastScroll);
      lastScroll = window.scrollY;
      boost = Math.min(4, boost + dy * 0.012);
      boost += (1 - boost) * 0.03;
      ORBITS.forEach((o, oi) => {
        o.electrons.forEach((_, ei) => {
          state[oi][ei] += o.speed * boost * dt * 2;
        });
      });
      const rect = canvas.getBoundingClientRect();
      if (rect.bottom < -100 || rect.top > window.innerHeight + 100) return;
      draw();
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      mo.disconnect();
      window.removeEventListener("resize", resize);
    };
  }, [labels]);

  return <canvas ref={canvasRef} aria-hidden className={`pointer-events-none ${className}`} />;
}
