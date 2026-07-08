import type { ProfileUpdate } from "@/apis/profile";
import type { Profile } from "@/types";
import { GripVertical, Trash2 } from "lucide-react";
import { SOCIAL_PLATFORM_MAP, SOCIAL_PLATFORMS } from "../socialPlatforms";

interface Props {
  draft: Profile;
  activeSocials: string[];
  dragSocial: string | null;
  setSocial: (key: string, value: string) => void;
  toggleSocial: (key: string) => void;
  onSocialDragStart: (e: React.DragEvent, key: string) => void;
  moveSocialOver: (overKey: string) => void;
  onSocialDragEnd: () => void;
  persistProfile: (patch: ProfileUpdate) => Promise<void>;
}

export function SocialTab({
  draft,
  activeSocials,
  dragSocial,
  setSocial,
  toggleSocial,
  onSocialDragStart,
  moveSocialOver,
  onSocialDragEnd,
  persistProfile,
}: Props) {
  return (
    <>
      <div className="tlpe-social-head">
        <div className="tlpe-section-eyebrow" style={{ margin: 0 }}>
          Add platforms
        </div>
        <p className="tlpe-hint">
          Tap to add or remove — each saved platform shows as an icon on your
          profile.
        </p>
      </div>

      <div className="tlpe-platform-grid">
        {SOCIAL_PLATFORMS.map(({ key, label, Icon, color }) => {
          const on = activeSocials.includes(key);
          return (
            <button
              type="button"
              key={key}
              className={`tlpe-platform${on ? " tlpe-platform--on" : ""}`}
              onClick={() => toggleSocial(key)}
              title={on ? `Remove ${label}` : `Add ${label}`}
            >
              <span
                className="tlpe-platform-icon"
                style={{ background: color }}
              >
                <Icon />
              </span>
              <span className="tlpe-platform-label">{label}</span>
            </button>
          );
        })}
      </div>

      {activeSocials.length > 0 && (
        <>
          <div className="tlpe-section-eyebrow">Your social icons</div>
          <p className="tlpe-hint" style={{ marginTop: -4, marginBottom: 10 }}>
            Drag to reorder · enter the handle or URL for each platform.
          </p>
          <div className="tlpe-socials">
            {activeSocials.map((key) => {
              const p = SOCIAL_PLATFORM_MAP[key];
              if (!p) return null;
              const { label, Icon, color, placeholder } = p;
              return (
                <div
                  className={`tlpe-social-field${dragSocial === key ? " tlpe-social-field--dragging" : ""}`}
                  key={key}
                  onDragEnter={() => moveSocialOver(key)}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    onSocialDragEnd();
                  }}
                >
                  <span
                    className="tlpe-social-grip"
                    draggable
                    onDragStart={(e) => onSocialDragStart(e, key)}
                    onDragEnd={onSocialDragEnd}
                    title="Drag to reorder"
                    aria-label="Drag to reorder"
                  >
                    <GripVertical size={15} />
                  </span>
                  <span
                    className="tlpe-social-icon"
                    style={{ color }}
                    aria-hidden
                  >
                    <Icon />
                  </span>
                  <input
                    className="tlpe-social-input"
                    aria-label={label}
                    title={label}
                    autoComplete="off"
                    placeholder={placeholder}
                    value={(draft.socials?.[key] as string) ?? ""}
                    onChange={(e) => setSocial(key, e.target.value)}
                    onBlur={() =>
                      persistProfile({
                        socials: { [key]: draft.socials?.[key] ?? "" },
                      })
                    }
                  />
                  <button
                    type="button"
                    className="tlpe-iconbtn"
                    onClick={() => toggleSocial(key)}
                    title={`Remove ${label}`}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              );
            })}
          </div>
        </>
      )}
    </>
  );
}
