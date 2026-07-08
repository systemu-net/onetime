import type { ProfileUpdate } from "@/apis/profile";
import { PLANS_ROUTE } from "@/routes";
import type { NamedAccent, Profile } from "@/types";
import { BadgeCheck, Trash2, Upload } from "lucide-react";
import { Link as RouterLink } from "react-router-dom";
import { ColorWheel } from "../ColorWheel";

const ACCENTS: NamedAccent[] = [
  "violet",
  "mint",
  "coral",
  "peach",
  "lilac",
  "sun",
  "sky",
];

export const NAMED_ACCENT_HEX: Record<NamedAccent, string> = {
  violet: "#7c3aed",
  mint: "#10b981",
  coral: "#ef4444",
  peach: "#f59e0b",
  lilac: "#a855f7",
  sun: "#eab308",
  sky: "#0ea5e9",
};

interface Props {
  draft: Profile;
  handleState: { available: boolean; reason?: string } | null;
  avatarBusy: boolean;
  fileInputRef: React.RefObject<HTMLInputElement>;
  setField: (key: keyof Profile, value: string) => void;
  setDraft: React.Dispatch<React.SetStateAction<Profile | null>>;
  onHandleChange: (value: string) => void;
  persistProfile: (patch: ProfileUpdate) => Promise<void>;
  onAvatarFile: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onAvatarRemove: () => void;
}

export function ProfileTab({
  draft,
  handleState,
  avatarBusy,
  fileInputRef,
  setField,
  setDraft,
  onHandleChange,
  persistProfile,
  onAvatarFile,
  onAvatarRemove,
}: Props) {
  const wheelValue = draft.accent.startsWith("#")
    ? draft.accent
    : (NAMED_ACCENT_HEX[draft.accent as NamedAccent] ??
      NAMED_ACCENT_HEX.violet);

  return (
    <>
      <div className="tlpe-field tlpe-avatar-row">
        <div className="tlpe-avatar-preview">
          {draft.avatar_url ? (
            <img src={draft.avatar_url} alt="" />
          ) : (
            (draft.display_name || draft.handle).slice(0, 2).toUpperCase()
          )}
        </div>
        <div className="tlpe-avatar-actions">
          <button
            type="button"
            className="tlp-btn tlp-btn--primary tlp-btn--sm"
            disabled={avatarBusy}
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload size={14} /> {avatarBusy ? "Uploading…" : "Upload photo"}
          </button>
          {draft.avatar_url && (
            <button
              type="button"
              className="tlpe-iconbtn"
              disabled={avatarBusy}
              onClick={onAvatarRemove}
              title="Remove photo"
            >
              <Trash2 size={14} />
            </button>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            hidden
            onChange={onAvatarFile}
          />
          <span className="tlpe-hint">PNG/JPG, up to 5MB</span>
        </div>
      </div>

      {draft.verified ? (
        <div className="tlpe-verify tlpe-verify--on">
          <BadgeCheck className="tlpe-verify-mark" size={30} strokeWidth={2} />
          <div className="tlpe-verify-text">
            <div className="tlpe-verify-title">You're verified</div>
            <div className="tlpe-verify-hint">
              The blue checkmark shows next to your name on your public profile
              — included with your plan.
            </div>
          </div>
        </div>
      ) : (
        <div className="tlpe-verify tlpe-verify--cta">
          <BadgeCheck
            className="tlpe-verify-mark tlpe-verify-mark--muted"
            size={30}
            strokeWidth={2}
          />
          <div className="tlpe-verify-text">
            <div className="tlpe-verify-title">Get verified</div>
            <div className="tlpe-verify-hint">
              Add the blue checkmark to your profile and stand out as
              recognized. Included with any paid plan.
            </div>
          </div>
          <RouterLink
            to={PLANS_ROUTE}
            className="tlp-btn tlp-btn--accent tlp-btn--sm tlpe-verify-btn"
          >
            <BadgeCheck size={15} /> Get verified
          </RouterLink>
        </div>
      )}

      <div className="tlpe-field">
        <label className="tlpe-label">Display name</label>
        <input
          className="tlpe-input"
          value={draft.display_name ?? ""}
          onChange={(e) => setField("display_name", e.target.value)}
          onBlur={() =>
            persistProfile({ display_name: draft.display_name ?? "" })
          }
        />
      </div>

      <div className="tlpe-field">
        <label className="tlpe-label">Handle</label>
        <div className="tlpe-handle-field">
          <span className="tlpe-handle-prefix">thin.ly/@</span>
          <input
            value={draft.handle}
            onChange={(e) => onHandleChange(e.target.value)}
            onBlur={() =>
              handleState?.available && persistProfile({ handle: draft.handle })
            }
          />
          {handleState && (
            <span
              className={`tlpe-handle-status ${
                handleState.available
                  ? "tlpe-handle-status--ok"
                  : "tlpe-handle-status--bad"
              }`}
            >
              {handleState.available ? "available" : handleState.reason}
            </span>
          )}
        </div>
      </div>

      <div className="tlpe-field">
        <div className="tlpe-label-row">
          <label className="tlpe-label">Bio</label>
          <span className="tlpe-hint">{(draft.bio ?? "").length}/160</span>
        </div>
        <textarea
          className="tlpe-textarea"
          maxLength={160}
          value={draft.bio ?? ""}
          onChange={(e) => setField("bio", e.target.value)}
          onBlur={() => persistProfile({ bio: draft.bio ?? "" })}
        />
      </div>

      <div className="tlpe-section-eyebrow">Appearance</div>
      <div className="tlpe-field">
        <label className="tlpe-label">Accent color</label>
        <ColorWheel
          value={wheelValue}
          onChange={(hex) => setDraft((d) => (d ? { ...d, accent: hex } : d))}
          onCommit={(hex) => persistProfile({ accent: hex })}
        />
        <div className="tlpe-presets">
          {ACCENTS.map((a) => (
            <button
              key={a}
              type="button"
              title={a}
              className={`tlpe-preset${draft.accent === a ? " tlpe-preset--on" : ""}`}
              style={{ background: NAMED_ACCENT_HEX[a] }}
              onClick={() => {
                setDraft((d) => (d ? { ...d, accent: a } : d));
                persistProfile({ accent: a });
              }}
            />
          ))}
        </div>
      </div>

      <div className="tlpe-grid2" style={{ marginTop: 18 }}>
        <div className="tlpe-field">
          <label className="tlpe-label">Location</label>
          <input
            className="tlpe-input"
            value={draft.location ?? ""}
            onChange={(e) => setField("location", e.target.value)}
            onBlur={() => persistProfile({ location: draft.location ?? "" })}
          />
        </div>
        <div className="tlpe-field">
          <label className="tlpe-label">Website</label>
          <input
            className="tlpe-input"
            value={draft.website ?? ""}
            onChange={(e) => setField("website", e.target.value)}
            onBlur={() => persistProfile({ website: draft.website ?? "" })}
          />
        </div>
      </div>
    </>
  );
}
