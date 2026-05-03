import type { RoutingRule } from "@/types/governance";

interface RoutingRulesPanelProps {
  rules: RoutingRule[];
  loading: boolean;
  onDeleteRule: (ruleId: number) => void;
  onAddRule: () => void;
}

export function RoutingRulesPanel({
  rules,
  loading,
  onDeleteRule,
  onAddRule,
}: RoutingRulesPanelProps) {
  const splitRule = rules.find((r) => r.type === "percentage");
  const splitWeight = splitRule?.weight ?? 50;

  return (
    <div className="flex flex-col gap-4">
      {/* Controls row */}
      <div className="flex items-center justify-between">
        <p className="text-xs text-neutral-400">
          Rules evaluated in order — first match wins.
        </p>
        <button
          onClick={onAddRule}
          className="text-xs px-3 py-1.5 rounded-lg bg-violet-600 hover:bg-violet-500 text-white transition-colors"
        >
          + Add Rule
        </button>
      </div>

      {/* Rules list */}
      {loading ? (
        <p className="text-xs text-neutral-400 py-4 text-center">
          Loading rules…
        </p>
      ) : rules.length === 0 ? (
        <div className="py-8 text-center text-neutral-400 rounded-xl border border-dashed border-neutral-700">
          <div className="text-3xl mb-2 opacity-40">⊕</div>
          <p className="text-sm">No routing rules.</p>
          <p className="text-xs mt-1">
            Add geo, device, time, or A/B split rules.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {rules.map((r) => (
            <div
              key={r.id}
              className="rounded-lg border border-neutral-200 dark:border-white/[0.07] bg-neutral-50 dark:bg-neutral-800/60 p-3 flex items-start gap-3 hover:border-neutral-300 dark:hover:border-white/[0.12] transition-colors"
            >
              <span className={`gov-rule-pill gov-rule-${r.type} mt-0.5`}>
                {r.type}
              </span>
              <div className="flex-1 min-w-0">
                <div className="text-[12.5px] text-neutral-600 dark:text-neutral-300 leading-snug">
                  {r.desc}
                </div>
                <div className="text-[11.5px] text-violet-400 font-mono mt-1 truncate">
                  → {r.dest.length > 48 ? r.dest.slice(0, 48) + "…" : r.dest}
                </div>
                {r.type === "percentage" && (
                  <div className="flex items-center gap-2 mt-2">
                    <div className="flex-1 h-1 rounded-full bg-neutral-200 dark:bg-neutral-700 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-violet-500 to-purple-400"
                        style={{ width: `${r.weight ?? 50}%` }}
                      />
                    </div>
                    <span className="text-[11px] font-mono text-neutral-400 w-8 text-right">
                      {r.weight ?? 50}%
                    </span>
                  </div>
                )}
              </div>
              <button
                title="Remove rule"
                onClick={() => onDeleteRule(r.id)}
                className="text-neutral-400 hover:text-red-400 hover:bg-red-500/10 w-7 h-7 rounded-md flex items-center justify-center transition-colors text-sm shrink-0"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}

      {/* A/B split preview */}
      {rules.length > 0 && splitRule && (
        <div className="rounded-xl border border-neutral-200 dark:border-white/[0.06] overflow-hidden">
          <div className="px-4 py-2.5 border-b border-neutral-200 dark:border-white/[0.06] bg-neutral-50 dark:bg-neutral-800/40">
            <span className="text-[11px] font-semibold uppercase tracking-[0.05em] text-neutral-400 font-mono">
              A/B Split Preview
            </span>
          </div>
          <div className="p-4">
            <div className="flex h-6 rounded-md overflow-hidden gap-0.5">
              <div
                title={`Variant A — ${100 - splitWeight}%`}
                className="bg-violet-500/80"
                style={{ flex: 100 - splitWeight }}
              />
              <div
                title={`Variant B — ${splitWeight}%`}
                className="bg-purple-400/80"
                style={{ flex: splitWeight }}
              />
            </div>
            <div className="flex justify-between mt-2 text-[11px] font-mono text-neutral-400">
              <span>◼ Variant A ({100 - splitWeight}%)</span>
              <span>◼ Variant B ({splitWeight}%)</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
