import type { PaginationMeta } from "@/types/pagination";

interface PaginationProps {
  meta: PaginationMeta;
  onChange: (page: number) => void;
}

export function Pagination({ meta, onChange }: PaginationProps) {
  if (meta.pages <= 1) return null;

  const pages = buildPageWindow(meta.page, meta.pages);

  return (
    <div className="flex items-center justify-between gap-3 px-1 py-4 text-sm select-none">
      {/* Left: record count */}
      <span className="text-xs text-neutral-400 shrink-0">
        {rangeLabel(meta)} of {meta.count.toLocaleString()}
      </span>

      {/* Centre: page buttons */}
      <div className="flex items-center gap-1">
        <PageBtn
          label="←"
          title="Previous page"
          disabled={!meta.prev}
          onClick={() => meta.prev && onChange(meta.prev)}
        />

        {pages.map((entry, i) =>
          entry === "…" ? (
            <span
              key={`ellipsis-${i}`}
              className="w-7 text-center text-neutral-400 text-xs"
            >
              …
            </span>
          ) : (
            <PageBtn
              key={entry}
              label={String(entry)}
              active={entry === meta.page}
              onClick={() => onChange(entry as number)}
            />
          ),
        )}

        <PageBtn
          label="→"
          title="Next page"
          disabled={!meta.next}
          onClick={() => meta.next && onChange(meta.next)}
        />
      </div>

      {/* Right: page x of y */}
      <span className="text-xs text-neutral-400 shrink-0">
        Page {meta.page} / {meta.pages}
      </span>
    </div>
  );
}

// ── Helpers ────────────────────────────────────────────────────────────────────

function rangeLabel(meta: PaginationMeta): string {
  const from = (meta.page - 1) * meta.limit + 1;
  const to   = Math.min(meta.page * meta.limit, meta.count);
  return `${from.toLocaleString()}–${to.toLocaleString()}`;
}

/** Returns a compact window: always show first, last, current ±1, with "…" gaps. */
function buildPageWindow(current: number, total: number): (number | "…")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

  const near = new Set([1, total, current - 1, current, current + 1].filter(
    (p) => p >= 1 && p <= total,
  ));
  const sorted = [...near].sort((a, b) => a - b);

  const result: (number | "…")[] = [];
  let prev = 0;
  for (const p of sorted) {
    if (p - prev > 1) result.push("…");
    result.push(p);
    prev = p;
  }
  return result;
}

function PageBtn({
  label,
  title,
  active,
  disabled,
  onClick,
}: {
  label: string;
  title?: string;
  active?: boolean;
  disabled?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      title={title ?? label}
      disabled={disabled}
      onClick={onClick}
      className={[
        "min-w-[28px] h-7 px-1.5 rounded-md text-xs font-medium transition-colors",
        active
          ? "bg-violet-500 text-white"
          : disabled
            ? "text-neutral-300 dark:text-neutral-600 cursor-not-allowed"
            : "text-neutral-500 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:text-neutral-800 dark:hover:text-neutral-100",
      ].join(" ")}
    >
      {label}
    </button>
  );
}
