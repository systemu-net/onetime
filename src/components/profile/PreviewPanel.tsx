import type { ProfilePrivacy } from "@/types";
import { Check, Copy, Lock, Monitor, Smartphone } from "lucide-react";
import { useState } from "react";
import PublicProfile, { type ProfileView } from "./PublicProfile";

interface Props {
  previewModel: ProfileView;
  previewW: number;
  stageW: number;
  stageRef: React.RefObject<HTMLDivElement>;
  privacy: ProfilePrivacy;
  onHandleDown: (e: React.MouseEvent) => void;
  previewUrl: string;
}

export function PreviewPanel({
  previewModel,
  stageW,
  stageRef,
  privacy,
  onHandleDown,
  previewUrl,
}: Props) {
  const [device, setDevice] = useState<"mobile" | "desktop">("mobile");
  const [previewCopied, setPreviewCopied] = useState(false);

  const copyPreviewUrl = () => {
    navigator.clipboard?.writeText(`https://${previewUrl}`).catch(() => {});
    setPreviewCopied(true);
    window.setTimeout(() => setPreviewCopied(false), 1600);
  };

  return (
    <div className="tlpe-preview">
      <div
        className="tlpe-handle"
        onMouseDown={onHandleDown}
        aria-label="Resize preview"
        title="Drag to resize preview"
      />
      <div className="tlpe-preview-eyebrow">
        <span className="tlp-eyebrow">Live preview</span>
        <span
          className="tlp-eyebrow"
          style={{
            color: privacy.is_public ? "var(--mint-d)" : "var(--coral-d)",
          }}
        >
          {privacy.is_public ? "Public" : "Private"}
        </span>
      </div>

      <div className="tlpe-preview-head">
        <div className="tlpe-device">
          <button
            type="button"
            className={`tlpe-device-btn${device === "mobile" ? " tlpe-device-btn--on" : ""}`}
            onClick={() => setDevice("mobile")}
            title="Mobile preview"
          >
            <Smartphone size={14} strokeWidth={2} />
          </button>
          <button
            type="button"
            className={`tlpe-device-btn${device === "desktop" ? " tlpe-device-btn--on" : ""}`}
            onClick={() => setDevice("desktop")}
            title="Desktop preview"
          >
            <Monitor size={14} strokeWidth={2} />
          </button>
        </div>
        <button
          type="button"
          className="tlpe-preview-url"
          onClick={copyPreviewUrl}
          title="Copy your profile link"
        >
          {previewCopied ? <Check size={12} /> : <Copy size={12} />}
          {previewUrl}
        </button>
      </div>

      <div className="tlpe-preview-stage" ref={stageRef}>
        {!privacy.is_public ? (
          <div className="tlpe-private-note">
            <Lock size={26} style={{ color: "var(--ink-4)" }} />
            <p>Your profile is private — only you can see it.</p>
          </div>
        ) : device === "mobile" ? (
          <div
            className="tlpe-dev-phone"
            style={{ zoom: Math.max(0.5, Math.min(1, (stageW - 24) / 380)) }}
          >
            <div className="tlpe-dev-notch" />
            <div className="tlpe-dev-screen">
              <PublicProfile profile={previewModel} narrow promptVerify />
              <div className="tlpe-dev-shine" />
            </div>
          </div>
        ) : (
          <div className="tlpe-dev-browser">
            <div className="tlpe-dev-bar">
              <span />
              <span />
              <span />
              <span className="tlpe-dev-url">
                <Lock size={10} /> {previewUrl}
              </span>
            </div>
            <div className="tlpe-dev-desktop-scroll">
              <div
                className="tlpe-dev-desktop"
                style={{
                  zoom: Math.max(0.34, Math.min(0.95, (stageW - 18) / 1000)),
                }}
              >
                <PublicProfile profile={previewModel} promptVerify />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
