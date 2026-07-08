import { useCallback, useEffect, useRef, useState } from "react";

const PREVIEW_MIN = 360;
const PREVIEW_MAX = 860;

export function usePreviewResize() {
  const [previewW, setPreviewW] = useState<number>(PREVIEW_MAX);
  const [stageW, setStageW] = useState<number>(PREVIEW_MAX);
  const stageRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

  useEffect(() => {
    const el = stageRef.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver((entries) => {
      const w = entries[0]?.contentRect.width;
      if (w) setStageW(w);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const onHandleDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      dragging.current = true;
      const startX = e.clientX;
      const startW = previewW;
      const onMove = (ev: MouseEvent) => {
        if (!dragging.current) return;
        const delta = startX - ev.clientX;
        setPreviewW(
          Math.max(PREVIEW_MIN, Math.min(PREVIEW_MAX, startW + delta)),
        );
      };
      const onUp = () => {
        dragging.current = false;
        document.removeEventListener("mousemove", onMove);
        document.removeEventListener("mouseup", onUp);
        document.body.style.cursor = "";
        document.body.style.userSelect = "";
      };
      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";
      document.addEventListener("mousemove", onMove);
      document.addEventListener("mouseup", onUp);
    },
    [previewW],
  );

  return { previewW, stageW, stageRef, onHandleDown };
}
