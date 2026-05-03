import type { CreateGovernedLinkPayload, LinkState } from "@/types/governance";
import { useEffect, useMemo, useState } from "react";

interface NewGovernedLinkModalProps {
  isOpen: boolean;
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (payload: CreateGovernedLinkPayload) => Promise<void>;
}

const INITIAL_STATE: LinkState = "active";

export function NewGovernedLinkModal({
  isOpen,
  isSubmitting,
  onClose,
  onSubmit,
}: NewGovernedLinkModalProps) {
  const [originalUrl, setOriginalUrl] = useState("");
  const [title, setTitle] = useState("");
  const [state, setState] = useState<LinkState>(INITIAL_STATE);
  const [clickCap, setClickCap] = useState("");
  const [activatesAt, setActivatesAt] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isOpen) {
      setOriginalUrl("");
      setTitle("");
      setState(INITIAL_STATE);
      setClickCap("");
      setActivatesAt("");
      setExpiresAt("");
      setError("");
    }
  }, [isOpen]);

  const parsedClickCap = useMemo(() => {
    if (!clickCap.trim()) return undefined;
    const num = Number(clickCap);
    return Number.isFinite(num) ? num : NaN;
  }, [clickCap]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");

    if (!originalUrl.trim()) {
      setError("Destination URL is required.");
      return;
    }

    try {
      new URL(originalUrl.trim());
    } catch {
      setError("Please enter a valid URL (e.g., https://example.com).");
      return;
    }

    if (
      parsedClickCap !== undefined &&
      (!Number.isInteger(parsedClickCap) || parsedClickCap <= 0)
    ) {
      setError("Click cap must be a positive integer.");
      return;
    }

    if (activatesAt && expiresAt) {
      const a = new Date(activatesAt).getTime();
      const e = new Date(expiresAt).getTime();
      if (Number.isFinite(a) && Number.isFinite(e) && e <= a) {
        setError("Expiry must be later than activation time.");
        return;
      }
    }

    const payload: CreateGovernedLinkPayload = {
      originalUrl: originalUrl.trim(),
      title: title.trim() || undefined,
      state,
      clickCap: parsedClickCap,
      activatesAt: activatesAt
        ? new Date(activatesAt).toISOString()
        : undefined,
      expiresAt: expiresAt ? new Date(expiresAt).toISOString() : undefined,
    };

    await onSubmit(payload);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-xl rounded-xl border border-neutral-200 dark:border-white/[0.08] bg-white dark:bg-neutral-900 shadow-2xl overflow-hidden">
        <div className="flex items-start justify-between gap-4 border-b border-neutral-200 dark:border-white/[0.06] px-5 py-4">
          <div>
            <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">
              New Governed Link
            </h3>
            <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
              Create a link with governance controls enabled from day one.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="h-8 w-8 rounded-md border border-neutral-200 dark:border-neutral-700 text-neutral-500 hover:text-neutral-700 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {error && (
            <div className="rounded-lg border border-red-200 dark:border-red-500/30 bg-red-50 dark:bg-red-500/10 px-3 py-2 text-sm text-red-700 dark:text-red-300">
              {error}
            </div>
          )}

          <div>
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-[0.04em] text-neutral-500">
              Destination URL *
            </label>
            <input
              type="url"
              value={originalUrl}
              onChange={(e) => setOriginalUrl(e.target.value)}
              placeholder="https://example.com/landing"
              className="gov-field-input"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-[0.04em] text-neutral-500">
              Link Name (optional)
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Campaign Landing Link"
              className="gov-field-input"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-[0.04em] text-neutral-500">
                Initial State
              </label>
              <select
                value={state}
                onChange={(e) => setState(e.target.value as LinkState)}
                className="gov-field-input"
              >
                <option value="draft">Draft</option>
                <option value="active">Active</option>
                <option value="paused">Paused</option>
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-[0.04em] text-neutral-500">
                Click Cap (optional)
              </label>
              <input
                type="number"
                min={1}
                step={1}
                value={clickCap}
                onChange={(e) => setClickCap(e.target.value)}
                placeholder="10000"
                className="gov-field-input"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-[0.04em] text-neutral-500">
                Activates At (optional)
              </label>
              <input
                type="datetime-local"
                value={activatesAt}
                onChange={(e) => setActivatesAt(e.target.value)}
                className="gov-field-input"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-[0.04em] text-neutral-500">
                Expires At (optional)
              </label>
              <input
                type="datetime-local"
                value={expiresAt}
                onChange={(e) => setExpiresAt(e.target.value)}
                className="gov-field-input"
              />
            </div>
          </div>

          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-sm rounded-lg border border-neutral-300 dark:border-neutral-600 text-neutral-700 dark:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors disabled:opacity-60"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 text-sm rounded-lg bg-violet-600 hover:bg-violet-500 text-white transition-colors disabled:opacity-60"
            >
              {isSubmitting ? "Creating..." : "Create Governed Link"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
