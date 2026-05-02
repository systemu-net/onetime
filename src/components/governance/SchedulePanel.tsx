import { updateClickCap, updateLifecycleSchedule } from "@/apis/governance";
import type { GovernanceLink } from "@/types/governance";
import { useEffect, useState } from "react";
import { useCookies } from "react-cookie";

interface SchedulePanelProps {
  link: GovernanceLink;
  onUpdateLink: (patch: Partial<GovernanceLink>) => void;
  onToast: (
    msg: string,
    type?: "success" | "info" | "error" | "warning",
  ) => void;
}

export function SchedulePanel({
  link,
  onUpdateLink,
  onToast,
}: SchedulePanelProps) {
  const [cookies] = useCookies(["token"]);
  const token = cookies.token as string;

  const [activatesAtInput, setActivatesAtInput] = useState<string>("");
  const [expiresAtInput, setExpiresAtInput] = useState<string>("");
  const [savingSchedule, setSavingSchedule] = useState(false);
  const [capInput, setCapInput] = useState<string>(
    link.cap === null ? "0" : String(link.cap),
  );
  const [savingCap, setSavingCap] = useState(false);

  useEffect(() => {
    setActivatesAtInput(toDatetimeLocalValue(link.activatesAt));
    setExpiresAtInput(toDatetimeLocalValue(link.expiresAt));
    setCapInput(link.cap === null ? "0" : String(link.cap));
  }, [link.activatesAt, link.expiresAt, link.cap]);

  const handleSaveSchedule = async () => {
    const activatesIso = activatesAtInput
      ? new Date(activatesAtInput).toISOString()
      : null;
    const expiresIso = expiresAtInput
      ? new Date(expiresAtInput).toISOString()
      : null;

    if (
      activatesIso &&
      expiresIso &&
      new Date(expiresIso).getTime() <= new Date(activatesIso).getTime()
    ) {
      onToast("Expires At must be later than Activates At.", "error");
      return;
    }

    setSavingSchedule(true);
    try {
      await updateLifecycleSchedule(
        token,
        link.lookup_code,
        activatesIso,
        expiresIso,
      );
      onUpdateLink({ activatesAt: activatesIso, expiresAt: expiresIso });
      onToast("Schedule updated", "success");
    } catch (err) {
      onToast((err as Error).message, "error");
    } finally {
      setSavingSchedule(false);
    }
  };

  const handleSaveCap = async () => {
    const parsed = Number(capInput);

    if (!Number.isFinite(parsed) || parsed < 0 || !Number.isInteger(parsed)) {
      onToast(
        "Click cap must be a whole number greater than or equal to 0.",
        "error",
      );
      return;
    }

    const capValue = parsed === 0 ? null : parsed;

    setSavingCap(true);
    try {
      await updateClickCap(token, link.lookup_code, capValue);
      onUpdateLink({ cap: capValue });
      onToast("Click cap saved", "success");
    } catch (err) {
      onToast((err as Error).message, "error");
    } finally {
      setSavingCap(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Lifecycle schedule */}
      <SectionCard title="Lifecycle Schedule">
        <div className="grid grid-cols-2 gap-3">
          <FieldRow label="Activates At">
            <input
              type="datetime-local"
              className="gov-field-input"
              value={activatesAtInput}
              onChange={(e) => setActivatesAtInput(e.target.value)}
            />
          </FieldRow>
          <FieldRow label="Expires At">
            <input
              type="datetime-local"
              className="gov-field-input"
              value={expiresAtInput}
              onChange={(e) => setExpiresAtInput(e.target.value)}
            />
          </FieldRow>
        </div>
        <ActionButton onClick={handleSaveSchedule} disabled={savingSchedule}>
          Save Schedule
        </ActionButton>
      </SectionCard>

      {/* Click cap */}
      <SectionCard title="Click Cap">
        <FieldRow label="Auto-pause after N clicks (0 = unlimited)">
          <input
            type="number"
            className="gov-field-input"
            value={capInput}
            onChange={(e) => setCapInput(e.target.value)}
            min={0}
          />
        </FieldRow>
        <ActionButton onClick={handleSaveCap} disabled={savingCap}>
          Save Cap
        </ActionButton>
      </SectionCard>

      {/* Webhooks */}
      <SectionCard title="Webhooks">
        <FieldRow label="Notify URL on state changes">
          <input
            className="gov-field-input"
            placeholder="https://hooks.yourapp.com/thinly"
          />
        </FieldRow>
        <ActionButton onClick={() => onToast("Webhook saved", "success")}>
          Save Webhook
        </ActionButton>
      </SectionCard>
    </div>
  );
}

function toDatetimeLocalValue(iso: string | null): string {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  const tzOffsetMs = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - tzOffsetMs).toISOString().slice(0, 16);
}

// ── Local helpers ──────────────────────────────────────────────────────────────

function SectionCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-neutral-200 dark:border-white/[0.06] overflow-hidden">
      <div className="px-4 py-2.5 border-b border-neutral-200 dark:border-white/[0.06] bg-neutral-50 dark:bg-neutral-800/40">
        <span className="text-[11px] font-semibold uppercase tracking-[0.05em] text-neutral-400 font-mono">
          {title}
        </span>
      </div>
      <div className="p-4 flex flex-col gap-3">{children}</div>
    </div>
  );
}

function FieldRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[11px] font-medium uppercase tracking-[0.05em] text-neutral-400">
        {label}
      </label>
      {children}
    </div>
  );
}

function ActionButton({
  children,
  onClick,
  disabled = false,
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="self-start text-xs px-3 py-1.5 rounded-lg border border-neutral-300 dark:border-neutral-600 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors mt-1 disabled:opacity-60"
    >
      {children}
    </button>
  );
}
