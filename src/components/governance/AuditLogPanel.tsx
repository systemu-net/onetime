import type { AuditLogEntry } from "@/types/governance";

interface AuditLogPanelProps {
  events: AuditLogEntry[];
  loading: boolean;
  onExport: () => void;
}

export function AuditLogPanel({
  events,
  loading,
  onExport,
}: AuditLogPanelProps) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <p className="text-xs text-neutral-400">
          Immutable governance log. All times in UTC.
        </p>
        <button
          onClick={onExport}
          className="text-xs px-3 py-1.5 rounded-lg border border-neutral-700 text-neutral-300 hover:bg-neutral-800 transition-colors"
        >
          Export CSV
        </button>
      </div>

      <div className="rounded-xl border border-neutral-200 dark:border-white/[0.06] bg-neutral-50 dark:bg-neutral-900 overflow-hidden">
        <div className="p-4">
          {loading ? (
            <p className="text-xs text-neutral-400 py-4 text-center">
              Loading audit log…
            </p>
          ) : events.length === 0 ? (
            <div className="py-8 text-center text-neutral-400">
              <div className="text-4xl mb-3 opacity-40">☰</div>
              <p className="text-sm">No governance events yet.</p>
            </div>
          ) : (
            <div className="flex flex-col divide-y divide-neutral-100 dark:divide-white/[0.04]">
              {events.map((e) => (
                <div key={e.id} className="flex gap-3 py-2.5">
                  <div
                    className="gov-audit-dot mt-1"
                    style={{
                      background: e.color,
                      boxShadow: `0 0 8px ${e.color}`,
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="text-[12.5px] font-medium text-neutral-800 dark:text-neutral-100">
                      {e.action}
                    </div>
                    {e.detail && (
                      <div className="text-[11.5px] text-neutral-400 font-mono mt-0.5 truncate">
                        {e.detail}
                      </div>
                    )}
                  </div>
                  <div className="text-[11px] text-neutral-400 font-mono shrink-0">
                    {e.time}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
