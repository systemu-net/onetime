import { CreditCard, ExternalLink, LogOut } from "lucide-react";
import { Link as RouterLink } from "react-router-dom";
import type { SaveState } from "./hooks/useProfileEditor";

interface Props {
  handle: string;
  isPublished: boolean;
  save: SaveState;
  published: boolean;
  onPublish: () => void;
  onBilling: () => void;
  onSignOut: () => void;
  profilePath: string;
}

export function EditorHeader({
  handle,
  isPublished,
  save,
  published,
  onPublish,
  onBilling,
  onSignOut,
  profilePath,
}: Props) {
  return (
    <header className="tlpe-header">
      <div>
        <h1 className="tlpe-header-title">Edit profile</h1>
        <div className="tlpe-header-handle">thin.ly/@{handle}</div>
      </div>
      <div className="tlpe-header-actions">
        {published ? (
          <span className="tlpe-flash tlpe-flash--ok">Published ✓</span>
        ) : (
          save !== "idle" && (
            <span className="tlpe-flash">
              {save === "saving" ? "Saving…" : "Saved"}
            </span>
          )
        )}
        <button type="button" className="tlpe-headerlink" onClick={onBilling}>
          <CreditCard size={14} /> Billing
        </button>
        <button type="button" className="tlpe-signout" onClick={onSignOut}>
          <LogOut size={14} /> Sign out
        </button>
        <RouterLink
          className="tlp-btn tlp-btn--ghost-dark tlp-btn--sm"
          to={`${profilePath}?view=public`}
          style={{
            color: "var(--ink-1)",
            borderColor: "var(--line-1)",
            background: "var(--canvas-2)",
          }}
        >
          <ExternalLink size={14} /> View as visitor
        </RouterLink>
        <button
          type="button"
          className="tlp-btn tlp-btn--accent tlp-btn--sm"
          onClick={onPublish}
        >
          {isPublished ? "Republish" : "Publish"}
        </button>
      </div>
    </header>
  );
}
