import type { CampaignCreatePayload } from "@/types/campaigns";
import { useState } from "react";

const CAMPAIGN_TYPES = [
  "launch",
  "sale",
  "event",
  "content",
  "retargeting",
  "affiliate",
] as const;
const PALETTE = [
  "#7c3aed",
  "#ec4899",
  "#3b82f6",
  "#10b981",
  "#f59e0b",
  "#06b6d4",
  "#f97316",
  "#8b5cf6",
];
const ICONS = [
  "🚀",
  "⚡",
  "🎯",
  "💎",
  "🔥",
  "🛒",
  "📣",
  "🎪",
  "🌟",
  "💡",
  "🎬",
  "🏆",
];

interface NewCampaignModalProps {
  open: boolean;
  onClose: () => void;
  onCreate: (payload: CampaignCreatePayload) => Promise<void>;
}

export function NewCampaignModal({
  open,
  onClose,
  onCreate,
}: NewCampaignModalProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<(typeof CAMPAIGN_TYPES)[number]>("launch");
  const [icon, setIcon] = useState(ICONS[0]);
  const [color, setColor] = useState(PALETTE[0]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (!open) return null;

  const handleCreate = async () => {
    if (!name.trim()) return;

    setSubmitting(true);
    try {
      await onCreate({
        name: name.trim(),
        description: description.trim(),
        type,
        icon,
        color,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
      });
      setName("");
      setDescription("");
      setType("launch");
      setIcon(ICONS[0]);
      setColor(PALETTE[0]);
      setStartDate("");
      setEndDate("");
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="gov-modal-overlay" onClick={onClose}>
      <div className="gov-modal" onClick={(event) => event.stopPropagation()}>
        <div className="gov-modal-header">
          <h3>New Campaign</h3>
          <button onClick={onClose} className="gov-icon-btn">
            x
          </button>
        </div>
        <div className="gov-modal-body">
          <label className="gov-form-field">
            <span className="gov-form-label">Campaign Name</span>
            <input
              className="gov-field-input"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="e.g. Summer Sale 2025"
              autoFocus
            />
          </label>

          <div className="gov-form-grid-2">
            <label className="gov-form-field">
              <span className="gov-form-label">Type</span>
              <select
                className="gov-field-input"
                value={type}
                onChange={(event) =>
                  setType(event.target.value as (typeof CAMPAIGN_TYPES)[number])
                }
              >
                {CAMPAIGN_TYPES.map((option) => (
                  <option key={option} value={option}>
                    {option.charAt(0).toUpperCase() + option.slice(1)}
                  </option>
                ))}
              </select>
            </label>

            <div className="gov-form-field">
              <span className="gov-form-label">Accent Color</span>
              <div className="gov-color-row">
                {PALETTE.map((item) => (
                  <button
                    key={item}
                    type="button"
                    className={`gov-color-opt ${color === item ? "gov-color-opt-selected" : ""}`}
                    style={{ background: item }}
                    onClick={() => setColor(item)}
                    aria-label={`Select accent ${item}`}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="gov-form-field">
            <span className="gov-form-label">Icon</span>
            <div className="gov-icon-grid">
              {ICONS.map((item) => (
                <button
                  key={item}
                  type="button"
                  className={`gov-icon-opt ${icon === item ? "gov-icon-opt-selected" : ""}`}
                  onClick={() => setIcon(item)}
                  aria-label={`Select icon ${item}`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          <div className="gov-form-grid-2">
            <label className="gov-form-field">
              <span className="gov-form-label">Start Date</span>
              <div className="gov-date-field">
                <input
                  type="date"
                  className="gov-field-input gov-date-input"
                  value={startDate}
                  onChange={(event) => setStartDate(event.target.value)}
                />
              </div>
            </label>
            <label className="gov-form-field">
              <span className="gov-form-label">End Date (Optional)</span>
              <div className="gov-date-field">
                <input
                  type="date"
                  className="gov-field-input gov-date-input"
                  value={endDate}
                  onChange={(event) => setEndDate(event.target.value)}
                />
              </div>
            </label>
          </div>

          <label className="gov-form-field">
            <span className="gov-form-label">Description (Optional)</span>
            <textarea
              className="gov-field-input gov-textarea"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="What is this campaign for?"
            />
          </label>
        </div>
        <div className="gov-modal-actions">
          <button onClick={onClose} className="gov-secondary-btn">
            Cancel
          </button>
          <button
            onClick={handleCreate}
            disabled={submitting || !name.trim()}
            className="gov-primary-btn"
          >
            {submitting ? "Creating..." : "Create Campaign"}
          </button>
        </div>
      </div>
    </div>
  );
}
