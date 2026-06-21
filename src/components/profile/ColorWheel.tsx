/**
 * ColorWheel — a custom HSV color picker for the profile accent.
 *
 * Hue is the angle around the wheel, saturation the radius (white centre →
 * vivid edge), and a brightness slider sets value. Dragging fires `onChange`
 * continuously (for live preview) and `onCommit` once on release (to persist).
 */
import { useRef, type PointerEvent } from "react";

import "./color-wheel.css";

// ── color math ───────────────────────────────────────────────────────────────
function hsvToRgb(h: number, s: number, v: number): [number, number, number] {
  const c = v * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = v - c;
  let r = 0,
    g = 0,
    b = 0;
  if (h < 60) [r, g, b] = [c, x, 0];
  else if (h < 120) [r, g, b] = [x, c, 0];
  else if (h < 180) [r, g, b] = [0, c, x];
  else if (h < 240) [r, g, b] = [0, x, c];
  else if (h < 300) [r, g, b] = [x, 0, c];
  else [r, g, b] = [c, 0, x];
  return [
    Math.round((r + m) * 255),
    Math.round((g + m) * 255),
    Math.round((b + m) * 255),
  ];
}

function rgbToHex(r: number, g: number, b: number): string {
  return `#${[r, g, b].map((n) => n.toString(16).padStart(2, "0")).join("")}`;
}

function hexToHsv(hex: string): { h: number; s: number; v: number } {
  let c = (hex || "").replace("#", "").trim();
  if (c.length === 3) c = c.split("").map((ch) => ch + ch).join("");
  if (c.length !== 6) return { h: 265, s: 0.7, v: 0.93 }; // sensible fallback (violet-ish)
  const r = parseInt(c.slice(0, 2), 16) / 255;
  const g = parseInt(c.slice(2, 4), 16) / 255;
  const b = parseInt(c.slice(4, 6), 16) / 255;
  const max = Math.max(r, g, b),
    min = Math.min(r, g, b);
  const d = max - min;
  let h = 0;
  if (d !== 0) {
    if (max === r) h = ((g - b) / d) % 6;
    else if (max === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
    h *= 60;
    if (h < 0) h += 360;
  }
  return { h, s: max === 0 ? 0 : d / max, v: max };
}

export function ColorWheel({
  value,
  onChange,
  onCommit,
}: {
  value: string;
  onChange: (hex: string) => void;
  onCommit?: (hex: string) => void;
}) {
  const wheelRef = useRef<HTMLDivElement>(null);
  const { h, s, v } = hexToHsv(value);

  const colorFromPoint = (clientX: number, clientY: number, vv: number) => {
    const el = wheelRef.current;
    if (!el) return value;
    const r = el.getBoundingClientRect();
    const cx = r.left + r.width / 2;
    const cy = r.top + r.height / 2;
    const dx = clientX - cx;
    const dy = clientY - cy;
    const hue = (Math.atan2(dy, dx) * (180 / Math.PI) + 90 + 360) % 360;
    const sat = Math.min(1, Math.hypot(dx, dy) / (r.width / 2));
    return rgbToHex(...hsvToRgb(hue, sat, vv));
  };

  const onWheelDown = (e: PointerEvent<HTMLDivElement>) => {
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
    onChange(colorFromPoint(e.clientX, e.clientY, v || 1));
    const move = (ev: globalThis.PointerEvent) =>
      onChange(colorFromPoint(ev.clientX, ev.clientY, v || 1));
    const up = (ev: globalThis.PointerEvent) => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      onCommit?.(colorFromPoint(ev.clientX, ev.clientY, v || 1));
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
  };

  // Knob position (percentages within the wheel box).
  const ang = ((h - 90) * Math.PI) / 180;
  const knobX = 50 + Math.cos(ang) * s * 50;
  const knobY = 50 + Math.sin(ang) * s * 50;
  const pureHue = rgbToHex(...hsvToRgb(h, 1, 1));

  return (
    <div className="cw">
      <div className="cw-wheel" ref={wheelRef} onPointerDown={onWheelDown}>
        <div
          className="cw-knob"
          style={{ left: `${knobX}%`, top: `${knobY}%`, background: value }}
        />
      </div>

      <div className="cw-controls">
        <span className="cw-swatch" style={{ background: value }} />
        <div className="cw-controls-main">
          <input
            type="range"
            className="cw-value"
            min={0}
            max={100}
            value={Math.round(v * 100)}
            aria-label="Brightness"
            style={{
              background: `linear-gradient(90deg, #000, ${pureHue})`,
            }}
            onChange={(e) =>
              onChange(rgbToHex(...hsvToRgb(h, s, Number(e.target.value) / 100)))
            }
            onPointerUp={() => onCommit?.(value)}
          />
          <span className="cw-hex">{value.toUpperCase()}</span>
        </div>
      </div>
    </div>
  );
}
