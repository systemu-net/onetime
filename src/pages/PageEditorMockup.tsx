/**
 * PageEditorMockup — static visual mockup of the redesigned page editor.
 * Route: /pages-mockup/edit
 *
 * What's interactive:
 *   • Tab switching, inline title rename
 *   • Resizable preview panel (drag the handle between center & right)
 *   • Add link via quick-add buttons (mock)
 *   • Edit link title/url inline, delete link
 *   • Per-button style popover with color/gradient/shape/size overrides — applies live to preview
 *   • Device toggle, click counts visible per button
 *
 * What's a visual stub (showing design intent):
 *   • Design / Social / Analytics tabs render their layout but don't fully persist
 */
import MainLayout from "@/components/layouts/MainLayout";
import Preview from "@/components/sections/Preview";
import type { Page, PageLink } from "@/types";
import {
  ArrowLeft,
  BarChart3,
  Check,
  ChevronRight,
  Copy,
  Download,
  ExternalLink,
  Eye,
  FileText,
  GripVertical,
  Image as ImageIcon,
  Link as LinkIcon,
  Monitor,
  MoreVertical,
  Palette,
  Pencil,
  Plus,
  Share2,
  Smartphone,
  Sparkles,
  Trash2,
  Video,
  X,
} from "lucide-react";
import {
  type CSSProperties,
  type KeyboardEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Link as RouterLink } from "react-router-dom";

import "@/components/pages-mockup/pages-mockup.css";
import "@/components/pages-mockup/editor-mockup.css";

// ─── Per-link style override type ──────────────────────────────────────────

type ButtonShape = "inherit" | "squared" | "rounded" | "rounded-full";
type ButtonSize = "sm" | "md" | "lg";

type LinkStyle = {
  mode: "inherit" | "custom";
  bgType: "solid" | "gradient";
  bgColor: string;
  gradStart: string;
  gradEnd: string;
  textColor: string;
  shape: ButtonShape;
  size: ButtonSize;
};

const DEFAULT_STYLE: LinkStyle = {
  mode: "inherit",
  bgType: "solid",
  bgColor: "#7c3aed",
  gradStart: "#ec4899",
  gradEnd: "#7c3aed",
  textColor: "#ffffff",
  shape: "inherit",
  size: "md",
};

type EditorLink = {
  id: string;
  emoji: string;
  title: string;
  url: string;
  clicks: number;
  spark: number[];
  ctr: number;
  style: LinkStyle;
};

const MOCK_LINKS: EditorLink[] = [
  {
    id: "a",
    emoji: "📝",
    title: "Visit my Medium",
    url: "https://medium.com/@me",
    clicks: 412,
    spark: [12, 18, 22, 28, 30, 32, 38, 42, 45, 50, 52, 60, 65, 71],
    ctr: 17.2,
    style: {
      ...DEFAULT_STYLE,
      mode: "custom",
      bgType: "gradient",
      gradStart: "#a855f7",
      gradEnd: "#ec4899",
    },
  },
  {
    id: "b",
    emoji: "🎓",
    title: "Latest course",
    url: "https://learn.example.com/course",
    clicks: 318,
    spark: [10, 12, 18, 22, 28, 30, 35, 40, 42, 48, 52, 56, 60, 65],
    ctr: 13.4,
    style: { ...DEFAULT_STYLE },
  },
  {
    id: "c",
    emoji: "🐦",
    title: "Twitter / X",
    url: "https://x.com/me",
    clicks: 264,
    spark: [22, 24, 20, 26, 28, 24, 30, 28, 32, 30, 34, 32, 36, 38],
    ctr: 11.1,
    style: { ...DEFAULT_STYLE, mode: "custom", bgColor: "#0ea5e9" },
  },
  {
    id: "d",
    emoji: "✉️",
    title: "Get the newsletter",
    url: "https://newsletter.example.com",
    clicks: 198,
    spark: [8, 10, 12, 14, 18, 20, 22, 24, 26, 28, 30, 32, 34, 38],
    ctr: 8.3,
    style: { ...DEFAULT_STYLE },
  },
  {
    id: "e",
    emoji: "💎",
    title: "Premium membership",
    url: "https://example.com/premium",
    clicks: 55,
    spark: [2, 3, 2, 4, 5, 4, 6, 7, 8, 9, 10, 12, 14, 15],
    ctr: 2.3,
    style: { ...DEFAULT_STYLE, mode: "custom", bgType: "gradient", gradStart: "#f59e0b", gradEnd: "#ec4899" },
  },
];

const COLOR_PRESETS = [
  "#0f172a", "#7c3aed", "#a855f7", "#ec4899",
  "#f59e0b", "#10b981", "#06b6d4", "#3b82f6",
  "#84cc16", "#ef4444", "#f97316", "#6366f1",
  "#14b8a6", "#fbbf24", "#d946ef", "#ffffff",
];

const GRADIENT_PRESETS: Array<[string, string]> = [
  ["#ec4899", "#7c3aed"],
  ["#06b6d4", "#3b82f6"],
  ["#84cc16", "#10b981"],
  ["#f59e0b", "#ec4899"],
  ["#a855f7", "#6366f1"],
  ["#fbbf24", "#f97316"],
  ["#14b8a6", "#06b6d4"],
  ["#0f172a", "#7c3aed"],
];

const BG_PRESETS: Array<{ name: string; bg: string }> = [
  { name: "Lilac", bg: "linear-gradient(160deg, #ec4899, #7c3aed)" },
  { name: "Ocean", bg: "linear-gradient(160deg, #06b6d4, #3b82f6)" },
  { name: "Mint", bg: "linear-gradient(160deg, #84cc16, #10b981)" },
  { name: "Peach", bg: "linear-gradient(160deg, #fbbf24, #f97316)" },
  { name: "Night", bg: "#0f172a" },
  { name: "Cream", bg: "#fef3c7" },
  { name: "Ink", bg: "#18181b" },
  { name: "Blossom", bg: "linear-gradient(160deg, #fda4af, #f472b6)" },
];

const PLATFORMS = [
  { id: "ig", name: "Instagram", icon: "📷", color: "#E1306C" },
  { id: "x", name: "X", icon: "𝕏", color: "#000000" },
  { id: "tiktok", name: "TikTok", icon: "♪", color: "#000000" },
  { id: "yt", name: "YouTube", icon: "▶", color: "#FF0000" },
  { id: "fb", name: "Facebook", icon: "f", color: "#1877F2" },
  { id: "linkedin", name: "LinkedIn", icon: "in", color: "#0A66C2" },
  { id: "threads", name: "Threads", icon: "@", color: "#000000" },
  { id: "bluesky", name: "Bluesky", icon: "☁", color: "#0085FF" },
  { id: "mastodon", name: "Mastodon", icon: "M", color: "#6364FF" },
  { id: "substack", name: "Substack", icon: "S", color: "#FF6719" },
  { id: "discord", name: "Discord", icon: "D", color: "#5865F2" },
  { id: "telegram", name: "Telegram", icon: "✈", color: "#26A5E4" },
  { id: "whatsapp", name: "WhatsApp", icon: "✓", color: "#25D366" },
  { id: "github", name: "GitHub", icon: "⌥", color: "#181717" },
  { id: "email", name: "Email", icon: "✉", color: "#71717a" },
  { id: "custom", name: "Custom URL", icon: "→", color: "#a855f7" },
];

// ─── Helpers ───────────────────────────────────────────────────────────────

function resolveLinkBg(style: LinkStyle, fallback: string): string {
  if (style.mode === "inherit") return fallback;
  if (style.bgType === "gradient")
    return `linear-gradient(135deg, ${style.gradStart}, ${style.gradEnd})`;
  return style.bgColor;
}

// Map our editor links → PageLink shape consumed by Preview.
// Each link gets its `color` set to a CSS value that the Preview will use.
function toPageLinks(links: EditorLink[], pageDefault: string): PageLink[] {
  return links.map((l) => ({
    id: l.id,
    label: l.title,
    color: resolveLinkBg(l.style, pageDefault),
    link: l.url,
  }));
}

// ─── Top bar ───────────────────────────────────────────────────────────────

interface TopBarProps {
  title: string;
  onTitleChange: (t: string) => void;
  status: "DRAFT" | "PUBLISHED";
  lookupCode: string;
  saved: boolean;
}

function TopBar({
  title,
  onTitleChange,
  status,
  lookupCode,
  saved,
}: TopBarProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(title);

  const commit = () => {
    if (draft.trim()) onTitleChange(draft.trim());
    else setDraft(title);
    setEditing(false);
  };
  const onKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") commit();
    if (e.key === "Escape") {
      setDraft(title);
      setEditing(false);
    }
  };

  return (
    <div className="em-topbar">
      <RouterLink to="/pages-mockup" className="em-back">
        <ArrowLeft size={14} strokeWidth={2.4} />
        Pages
      </RouterLink>
      <div className="em-title-block">
        <div className="em-title-row">
          {editing ? (
            <input
              autoFocus
              className="em-title-input"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onBlur={commit}
              onKeyDown={onKey}
            />
          ) : (
            <>
              <h1 className="em-title">{title}</h1>
              <button
                type="button"
                className="em-rename-btn"
                title="Rename"
                onClick={() => setEditing(true)}
              >
                <Pencil size={12} strokeWidth={2} />
              </button>
            </>
          )}
        </div>
        <div className="em-meta-row">
          <span
            className={
              status === "PUBLISHED"
                ? "em-status-pill em-status-live"
                : "em-status-pill em-status-draft"
            }
          >
            {status === "PUBLISHED" ? "● Live" : "✎ Draft"}
          </span>
          <span className="em-meta-slug">thin.ly/{lookupCode}</span>
          {saved && <span className="em-saved-flash">All changes saved</span>}
        </div>
      </div>
      <div className="em-topbar-actions">
        <button type="button" className="pm-btn pm-btn-ghost pm-btn-sm">
          <ExternalLink size={12} strokeWidth={2} />
          View live
        </button>
        <button type="button" className="pm-btn pm-btn-primary pm-btn-sm">
          {status === "PUBLISHED" ? "▶ Republish" : "▶ Publish"}
        </button>
      </div>
    </div>
  );
}

// ─── Tab bar ───────────────────────────────────────────────────────────────

type TabKey = "content" | "design" | "social" | "analytics";

interface TabBarProps {
  active: TabKey;
  onChange: (t: TabKey) => void;
  linksCount: number;
  socialsCount: number;
}

function TabBar({ active, onChange, linksCount, socialsCount }: TabBarProps) {
  const tabs: Array<{ key: TabKey; label: string; icon: JSX.Element; count?: number }> = [
    { key: "content", label: "Content", icon: <LinkIcon size={14} strokeWidth={2} />, count: linksCount },
    { key: "design", label: "Design", icon: <Palette size={14} strokeWidth={2} /> },
    { key: "social", label: "Social", icon: <Share2 size={14} strokeWidth={2} />, count: socialsCount },
    { key: "analytics", label: "Analytics", icon: <BarChart3 size={14} strokeWidth={2} /> },
  ];
  return (
    <div className="em-tabbar">
      {tabs.map((t) => (
        <button
          key={t.key}
          type="button"
          className={`em-tab${active === t.key ? " em-tab--active" : ""}`}
          onClick={() => onChange(t.key)}
        >
          {t.icon}
          {t.label}
          {t.count != null && <span className="em-tab-count">{t.count}</span>}
        </button>
      ))}
    </div>
  );
}

// ─── Style Popover ─────────────────────────────────────────────────────────

interface StylePopoverProps {
  anchor: { top: number; left: number };
  style: LinkStyle;
  onChange: (s: LinkStyle) => void;
  onClose: () => void;
  onReset: () => void;
}

function StylePopover({ anchor, style, onChange, onClose, onReset }: StylePopoverProps) {
  const setBgType = (bgType: "solid" | "gradient") =>
    onChange({ ...style, mode: "custom", bgType });
  const setBg = (bgColor: string) =>
    onChange({ ...style, mode: "custom", bgColor });
  const setGrad = (s: string, e: string) =>
    onChange({ ...style, mode: "custom", gradStart: s, gradEnd: e });
  const setText = (textColor: string) =>
    onChange({ ...style, mode: "custom", textColor });
  const setShape = (shape: ButtonShape) =>
    onChange({ ...style, mode: "custom", shape });
  const setSize = (size: ButtonSize) =>
    onChange({ ...style, mode: "custom", size });
  const setMode = (mode: LinkStyle["mode"]) => onChange({ ...style, mode });

  return (
    <>
      <div className="em-popover-backdrop" onClick={onClose} />
      <div
        className="em-popover"
        style={{ top: anchor.top, left: anchor.left }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
          <div>
            <h3 className="em-popover-title">
              <Sparkles size={14} strokeWidth={2} style={{ verticalAlign: "-3px", marginRight: 6, color: "#7c3aed" }} />
              Customize this button
            </h3>
            <p className="em-popover-sub">
              Overrides the page default for this button only
            </p>
          </div>
          <button
            type="button"
            className="em-link-menu"
            onClick={onClose}
            aria-label="Close"
          >
            <X size={14} strokeWidth={2} />
          </button>
        </div>

        <div className="em-pop-section">
          <div className="em-pop-label">Mode</div>
          <div className="em-pop-segmented">
            <button
              type="button"
              className={`em-pop-seg${style.mode === "inherit" ? " em-pop-seg--on" : ""}`}
              onClick={() => setMode("inherit")}
            >
              Inherit
            </button>
            <button
              type="button"
              className={`em-pop-seg${style.mode === "custom" ? " em-pop-seg--on" : ""}`}
              onClick={() => setMode("custom")}
            >
              Custom
            </button>
          </div>
        </div>

        {style.mode === "custom" && (
          <>
            <div className="em-pop-section">
              <div className="em-pop-label">Background</div>
              <div className="em-pop-segmented" style={{ marginBottom: 10 }}>
                <button
                  type="button"
                  className={`em-pop-seg${style.bgType === "solid" ? " em-pop-seg--on" : ""}`}
                  onClick={() => setBgType("solid")}
                >
                  Solid
                </button>
                <button
                  type="button"
                  className={`em-pop-seg${style.bgType === "gradient" ? " em-pop-seg--on" : ""}`}
                  onClick={() => setBgType("gradient")}
                >
                  Gradient
                </button>
              </div>

              {style.bgType === "solid" ? (
                <>
                  <div className="em-color-row">
                    <input
                      type="color"
                      className="em-color-input"
                      value={style.bgColor}
                      onChange={(e) => setBg(e.target.value)}
                    />
                    <span style={{ fontSize: 12, color: "var(--pm-mute)" }}>
                      {style.bgColor.toUpperCase()}
                    </span>
                  </div>
                  <div className="em-color-presets">
                    {COLOR_PRESETS.map((c) => (
                      <button
                        key={c}
                        type="button"
                        className={`em-color-swatch${style.bgColor === c ? " em-color-swatch--on" : ""}`}
                        style={{ "--em-swatch": c } as CSSProperties}
                        onClick={() => setBg(c)}
                        aria-label={c}
                      />
                    ))}
                  </div>
                </>
              ) : (
                <>
                  <div className="em-color-row">
                    <input
                      type="color"
                      className="em-color-input"
                      value={style.gradStart}
                      onChange={(e) => setGrad(e.target.value, style.gradEnd)}
                    />
                    <ChevronRight size={14} className="em-color-arrow" />
                    <input
                      type="color"
                      className="em-color-input"
                      value={style.gradEnd}
                      onChange={(e) => setGrad(style.gradStart, e.target.value)}
                    />
                  </div>
                  <div className="em-color-presets" style={{ gridTemplateColumns: "repeat(4, 1fr)" }}>
                    {GRADIENT_PRESETS.map(([s, e]) => {
                      const sel = style.gradStart === s && style.gradEnd === e;
                      return (
                        <button
                          key={`${s}-${e}`}
                          type="button"
                          className={`em-color-swatch${sel ? " em-color-swatch--on" : ""}`}
                          style={{
                            "--em-swatch": `linear-gradient(135deg, ${s}, ${e})`,
                          } as CSSProperties}
                          onClick={() => setGrad(s, e)}
                          aria-label={`${s} → ${e}`}
                        />
                      );
                    })}
                  </div>
                </>
              )}
            </div>

            <div className="em-pop-section">
              <div className="em-pop-label">Text color</div>
              <div className="em-color-row">
                <input
                  type="color"
                  className="em-color-input"
                  value={style.textColor}
                  onChange={(e) => setText(e.target.value)}
                />
                <span style={{ fontSize: 12, color: "var(--pm-mute)" }}>
                  {style.textColor.toUpperCase()}
                </span>
              </div>
            </div>

            <div className="em-pop-section">
              <div className="em-pop-label">Shape</div>
              <div className="em-pop-segmented">
                {(["inherit", "squared", "rounded", "rounded-full"] as ButtonShape[]).map((s) => (
                  <button
                    key={s}
                    type="button"
                    className={`em-pop-seg${style.shape === s ? " em-pop-seg--on" : ""}`}
                    onClick={() => setShape(s)}
                  >
                    {s === "inherit" ? "—" : s === "rounded-full" ? "Pill" : s.charAt(0).toUpperCase() + s.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            <div className="em-pop-section">
              <div className="em-pop-label">Size</div>
              <div className="em-pop-segmented">
                {(["sm", "md", "lg"] as ButtonSize[]).map((s) => (
                  <button
                    key={s}
                    type="button"
                    className={`em-pop-seg${style.size === s ? " em-pop-seg--on" : ""}`}
                    onClick={() => setSize(s)}
                  >
                    {s.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}

        <div className="em-pop-footer">
          <button type="button" className="em-pop-reset" onClick={onReset}>
            ↺ Reset to default
          </button>
          <button type="button" className="pm-btn pm-btn-primary pm-btn-sm" onClick={onClose}>
            <Check size={12} strokeWidth={2.5} />
            Done
          </button>
        </div>
      </div>
    </>
  );
}

// ─── Content tab ───────────────────────────────────────────────────────────

interface ContentTabProps {
  links: EditorLink[];
  setLinks: (l: EditorLink[]) => void;
}

function ContentTab({ links, setLinks }: ContentTabProps) {
  const [popoverFor, setPopoverFor] = useState<string | null>(null);
  const [anchor, setAnchor] = useState<{ top: number; left: number }>({
    top: 0,
    left: 0,
  });

  const openPopover = (id: string, rect: DOMRect) => {
    // Anchor below the chip, but flip up if not enough space.
    const top = rect.bottom + window.scrollY + 8;
    const left = Math.max(
      16,
      Math.min(rect.left + window.scrollX, window.innerWidth - 340),
    );
    setAnchor({ top, left });
    setPopoverFor(id);
  };

  const updateLink = (id: string, patch: Partial<EditorLink>) => {
    setLinks(links.map((l) => (l.id === id ? { ...l, ...patch } : l)));
  };

  const updateStyle = (id: string, style: LinkStyle) => updateLink(id, { style });

  const addLink = (emoji: string, title: string) => {
    setLinks([
      ...links,
      {
        id: Math.random().toString(36).slice(2, 8),
        emoji,
        title,
        url: "https://",
        clicks: 0,
        spark: Array(14).fill(0),
        ctr: 0,
        style: { ...DEFAULT_STYLE },
      },
    ]);
  };

  const deleteLink = (id: string) => setLinks(links.filter((l) => l.id !== id));

  const active = links.find((l) => l.id === popoverFor) ?? null;

  return (
    <>
      <div className="em-card">
        <h2 className="em-card-title">
          <Plus size={16} strokeWidth={2.4} style={{ color: "#7c3aed" }} />
          Quick add
        </h2>
        <p className="em-card-subtitle">
          Pick a content type — it'll appear at the bottom of your list
        </p>
        <div className="em-quickadd">
          <button
            type="button"
            className="em-quickadd-btn"
            onClick={() => addLink("🔗", "New link")}
          >
            <span
              className="em-quickadd-icon"
              style={{ "--em-qa-from": "#7c3aed", "--em-qa-to": "#a855f7" } as CSSProperties}
            >
              <LinkIcon size={16} strokeWidth={2.4} />
            </span>
            <span className="em-quickadd-label">Link</span>
          </button>
          <button
            type="button"
            className="em-quickadd-btn"
            onClick={() => addLink("🖼", "New image")}
          >
            <span
              className="em-quickadd-icon"
              style={{ "--em-qa-from": "#06b6d4", "--em-qa-to": "#3b82f6" } as CSSProperties}
            >
              <ImageIcon size={16} strokeWidth={2.4} />
            </span>
            <span className="em-quickadd-label">Image</span>
          </button>
          <button
            type="button"
            className="em-quickadd-btn"
            onClick={() => addLink("🎬", "New video")}
          >
            <span
              className="em-quickadd-icon"
              style={{ "--em-qa-from": "#ec4899", "--em-qa-to": "#f97316" } as CSSProperties}
            >
              <Video size={16} strokeWidth={2.4} />
            </span>
            <span className="em-quickadd-label">Video</span>
          </button>
          <button
            type="button"
            className="em-quickadd-btn"
            onClick={() => addLink("📄", "New file")}
          >
            <span
              className="em-quickadd-icon"
              style={{ "--em-qa-from": "#84cc16", "--em-qa-to": "#10b981" } as CSSProperties}
            >
              <FileText size={16} strokeWidth={2.4} />
            </span>
            <span className="em-quickadd-label">File / PDF</span>
          </button>
          <button
            type="button"
            className="em-quickadd-btn"
            onClick={() => addLink("✨", "New section")}
          >
            <span
              className="em-quickadd-icon"
              style={{ "--em-qa-from": "#f59e0b", "--em-qa-to": "#ec4899" } as CSSProperties}
            >
              <Sparkles size={16} strokeWidth={2.4} />
            </span>
            <span className="em-quickadd-label">Header</span>
          </button>
        </div>
      </div>

      <div className="em-card">
        <h2 className="em-card-title">
          <LinkIcon size={16} strokeWidth={2.4} style={{ color: "#7c3aed" }} />
          Your links
        </h2>
        <p className="em-card-subtitle">
          Drag to reorder · click 🎨 Style to customize a single button · click counts shown live
        </p>

        <div className="em-links">
          {links.map((l, idx) => {
            const bg = resolveLinkBg(l.style, "linear-gradient(135deg, #ec4899, #7c3aed)");
            const isCustom = l.style.mode === "custom";
            return (
              <div key={l.id}>
                {idx > 0 && (
                  <div className="em-insert">
                    <button
                      type="button"
                      className="em-insert-btn"
                      onClick={() => addLink("🔗", "New link")}
                      title="Insert link here"
                    >
                      <Plus size={12} strokeWidth={3} />
                    </button>
                  </div>
                )}
                <div className="em-link-row">
                  <span className="em-link-drag" title="Drag to reorder">
                    <GripVertical size={16} strokeWidth={2} />
                  </span>
                  <span
                    className="em-link-icon"
                    style={{ "--em-link-bg": bg } as CSSProperties}
                  >
                    {l.emoji}
                  </span>
                  <div className="em-link-info">
                    <input
                      type="text"
                      className="em-link-title"
                      value={l.title}
                      onChange={(e) => updateLink(l.id, { title: e.target.value })}
                      style={{
                        border: "none",
                        background: "transparent",
                        outline: "none",
                        padding: 0,
                        fontFamily: "inherit",
                        width: "100%",
                      }}
                    />
                    <input
                      type="text"
                      className="em-link-url"
                      value={l.url}
                      onChange={(e) => updateLink(l.id, { url: e.target.value })}
                      style={{
                        border: "none",
                        background: "transparent",
                        outline: "none",
                        padding: 0,
                        fontFamily: "inherit",
                        width: "100%",
                      }}
                    />
                  </div>
                  <span className="em-link-clicks" title="Clicks this period">
                    <Eye size={11} strokeWidth={2.5} />
                    {l.clicks.toLocaleString()}
                  </span>
                  <div className="em-link-actions">
                    <button
                      type="button"
                      className={`em-style-chip${isCustom ? " em-style-chip--custom" : ""}`}
                      onClick={(e) => {
                        const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
                        openPopover(l.id, rect);
                      }}
                    >
                      <Palette size={12} strokeWidth={2} />
                      {isCustom ? "Custom" : "Style"}
                    </button>
                    <button
                      type="button"
                      className="em-link-menu"
                      title="Delete"
                      onClick={() => deleteLink(l.id)}
                    >
                      <Trash2 size={13} strokeWidth={2} />
                    </button>
                    <button type="button" className="em-link-menu" title="More">
                      <MoreVertical size={14} strokeWidth={2} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {active && (
        <StylePopover
          anchor={anchor}
          style={active.style}
          onChange={(s) => updateStyle(active.id, s)}
          onClose={() => setPopoverFor(null)}
          onReset={() => updateStyle(active.id, { ...DEFAULT_STYLE })}
        />
      )}
    </>
  );
}

// ─── Design tab (visual stub) ──────────────────────────────────────────────

function DesignTab() {
  const [bg, setBg] = useState(0);
  const [shape, setShape] = useState<"squared" | "rounded" | "rounded-full">("rounded");
  return (
    <div className="em-design-grid">
      <div className="em-card">
        <h2 className="em-card-title">Background</h2>
        <p className="em-card-subtitle">Solid color, gradient, image, or pattern</p>
        <div className="em-pop-segmented" style={{ marginBottom: 12 }}>
          <button type="button" className="em-pop-seg em-pop-seg--on">Gradient</button>
          <button type="button" className="em-pop-seg">Solid</button>
          <button type="button" className="em-pop-seg">Image</button>
          <button type="button" className="em-pop-seg">Pattern</button>
        </div>
        <div className="em-bg-presets">
          {BG_PRESETS.map((p, i) => (
            <button
              key={p.name}
              type="button"
              className={`em-bg-swatch${bg === i ? " em-bg-swatch--on" : ""}`}
              style={{ "--em-bg-swatch": p.bg } as CSSProperties}
              onClick={() => setBg(i)}
              title={p.name}
            />
          ))}
        </div>
      </div>

      <div className="em-card">
        <h2 className="em-card-title">Typography</h2>
        <p className="em-card-subtitle">Headings and body text styles</p>
        <div className="em-pop-section">
          <div className="em-pop-label">Font family</div>
          <select className="em-text-input" defaultValue="Inter">
            <option>Inter</option>
            <option>Bricolage Grotesque</option>
            <option>Syne</option>
            <option>Geist</option>
            <option>Rubik</option>
          </select>
        </div>
        <div className="em-pop-section">
          <div className="em-pop-label">Heading weight</div>
          <div className="em-pop-segmented">
            <button type="button" className="em-pop-seg">Light</button>
            <button type="button" className="em-pop-seg em-pop-seg--on">Regular</button>
            <button type="button" className="em-pop-seg">Bold</button>
            <button type="button" className="em-pop-seg">Black</button>
          </div>
        </div>
      </div>

      <div className="em-card">
        <h2 className="em-card-title">Default button style</h2>
        <p className="em-card-subtitle">
          Cascades to every button unless overridden per-button on the Content tab
        </p>
        <div className="em-pop-section">
          <div className="em-pop-label">Shape</div>
          <div className="em-shape-row">
            {(["squared", "rounded", "rounded-full"] as const).map((s) => (
              <button
                key={s}
                type="button"
                className={`em-shape-btn${shape === s ? " em-shape-btn--on" : ""}`}
                onClick={() => setShape(s)}
              >
                <div
                  className="em-shape-preview"
                  style={{
                    borderRadius:
                      s === "squared" ? 0 : s === "rounded" ? 6 : 999,
                  }}
                />
                <span>{s === "rounded-full" ? "Pill" : s}</span>
              </button>
            ))}
          </div>
        </div>
        <div className="em-pop-section">
          <div className="em-pop-label">Default fill</div>
          <div className="em-color-presets" style={{ gridTemplateColumns: "repeat(8, 1fr)" }}>
            {COLOR_PRESETS.map((c) => (
              <button
                key={c}
                type="button"
                className="em-color-swatch"
                style={{ "--em-swatch": c } as CSSProperties}
                aria-label={c}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="em-card">
        <h2 className="em-card-title">Density</h2>
        <p className="em-card-subtitle">Spacing between buttons</p>
        <div className="em-pop-segmented">
          <button type="button" className="em-pop-seg">Compact</button>
          <button type="button" className="em-pop-seg em-pop-seg--on">Regular</button>
          <button type="button" className="em-pop-seg">Comfortable</button>
        </div>
      </div>
    </div>
  );
}

// ─── Social tab (visual stub) ──────────────────────────────────────────────

interface SocialEntry {
  platform: string;
  url: string;
  color: string;
  shape: "circle" | "square" | "pill";
}

interface SocialTabProps {
  socials: SocialEntry[];
  setSocials: (s: SocialEntry[]) => void;
}

function SocialTab({ socials, setSocials }: SocialTabProps) {
  const addedIds = new Set(socials.map((s) => s.platform));

  const togglePlatform = (id: string) => {
    if (addedIds.has(id)) {
      setSocials(socials.filter((s) => s.platform !== id));
    } else {
      const p = PLATFORMS.find((x) => x.id === id);
      setSocials([
        ...socials,
        {
          platform: id,
          url: "",
          color: p?.color ?? "#7c3aed",
          shape: "circle",
        },
      ]);
    }
  };

  return (
    <>
      <div className="em-card">
        <h2 className="em-card-title">Add platforms</h2>
        <p className="em-card-subtitle">Tap to add or remove · drag rows below to reorder</p>
        <div className="em-platform-grid">
          {PLATFORMS.map((p) => (
            <button
              key={p.id}
              type="button"
              className={`em-platform-btn${addedIds.has(p.id) ? " em-platform-btn--added" : ""}`}
              onClick={() => togglePlatform(p.id)}
            >
              <span
                className="em-social-icon"
                style={{ background: p.color, fontWeight: 700 }}
              >
                {p.icon}
              </span>
              <span className="em-platform-name">{p.name}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="em-card">
        <h2 className="em-card-title">Your social icons</h2>
        <p className="em-card-subtitle">
          Customize each icon's color, shape, and URL — independently
        </p>
        {socials.length === 0 ? (
          <div style={{ padding: 22, color: "var(--pm-mute)", textAlign: "center", fontSize: 13 }}>
            Tap a platform above to add it.
          </div>
        ) : (
          socials.map((s, i) => {
            const p = PLATFORMS.find((x) => x.id === s.platform);
            return (
              <div key={s.platform} className="em-social-row">
                <span className="em-link-drag">
                  <GripVertical size={14} strokeWidth={2} />
                </span>
                <span
                  className="em-social-icon"
                  style={{
                    background: s.color,
                    fontWeight: 700,
                    borderRadius:
                      s.shape === "circle"
                        ? "50%"
                        : s.shape === "pill"
                          ? 999
                          : 8,
                  }}
                >
                  {p?.icon}
                </span>
                <input
                  className="em-text-input"
                  placeholder={`Your ${p?.name} URL`}
                  value={s.url}
                  onChange={(e) =>
                    setSocials(
                      socials.map((x, j) => (j === i ? { ...x, url: e.target.value } : x)),
                    )
                  }
                />
                <input
                  type="color"
                  className="em-color-input"
                  value={s.color}
                  onChange={(e) =>
                    setSocials(
                      socials.map((x, j) => (j === i ? { ...x, color: e.target.value } : x)),
                    )
                  }
                />
                <div className="em-pop-segmented" style={{ padding: 2 }}>
                  {(["circle", "square", "pill"] as const).map((sh) => (
                    <button
                      key={sh}
                      type="button"
                      className={`em-pop-seg${s.shape === sh ? " em-pop-seg--on" : ""}`}
                      style={{ fontSize: 10, padding: "4px 8px" }}
                      onClick={() =>
                        setSocials(
                          socials.map((x, j) => (j === i ? { ...x, shape: sh } : x)),
                        )
                      }
                    >
                      {sh}
                    </button>
                  ))}
                </div>
                <button
                  type="button"
                  className="em-link-menu"
                  onClick={() => setSocials(socials.filter((_, j) => j !== i))}
                  title="Remove"
                >
                  <Trash2 size={13} strokeWidth={2} />
                </button>
                <button type="button" className="em-link-menu" title="More">
                  <MoreVertical size={14} strokeWidth={2} />
                </button>
              </div>
            );
          })
        )}
      </div>
    </>
  );
}

// ─── Analytics tab (visual stub) ───────────────────────────────────────────

function AnalyticsTab({ links }: { links: EditorLink[] }) {
  const total = links.reduce((s, l) => s + l.clicks, 0);
  const peak = Math.max(1, ...links.flatMap((l) => l.spark));
  const top = [...links].sort((a, b) => b.clicks - a.clicks)[0];

  return (
    <>
      <div className="em-an-toolbar">
        <div className="em-pop-segmented">
          <button type="button" className="em-pop-seg">7d</button>
          <button type="button" className="em-pop-seg em-pop-seg--on">30d</button>
          <button type="button" className="em-pop-seg">90d</button>
          <button type="button" className="em-pop-seg">All</button>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button type="button" className="pm-btn pm-btn-ghost pm-btn-sm">
            📅 Custom range
          </button>
          <button type="button" className="pm-btn pm-btn-ghost pm-btn-sm">
            <Download size={12} strokeWidth={2} />
            Export CSV
          </button>
        </div>
      </div>

      <div className="em-an-stats">
        <div className="em-an-stat">
          <div className="em-an-stat-label">Total clicks</div>
          <div className="em-an-stat-value" style={{ color: "#7c3aed" }}>
            {total.toLocaleString()}
          </div>
          <div className="em-an-stat-sub">▲ 18% vs prev period</div>
        </div>
        <div className="em-an-stat">
          <div className="em-an-stat-label">Unique visitors</div>
          <div className="em-an-stat-value" style={{ color: "#06b6d4" }}>
            {Math.round(total * 0.42).toLocaleString()}
          </div>
          <div className="em-an-stat-sub">▲ 12% vs prev period</div>
        </div>
        <div className="em-an-stat">
          <div className="em-an-stat-label">Top button</div>
          <div className="em-an-stat-value" style={{ color: "#ec4899" }}>
            {top?.title.split(" ").slice(0, 2).join(" ") ?? "—"}
          </div>
          <div className="em-an-stat-sub">
            {top ? `${top.clicks} clicks · ${top.ctr}% CTR` : "—"}
          </div>
        </div>
        <div className="em-an-stat">
          <div className="em-an-stat-label">Avg CTR</div>
          <div className="em-an-stat-value" style={{ color: "#84cc16" }}>
            {(links.reduce((s, l) => s + l.ctr, 0) / Math.max(1, links.length)).toFixed(1)}%
          </div>
          <div className="em-an-stat-sub">across all buttons</div>
        </div>
      </div>

      <div className="em-card" style={{ padding: 0 }}>
        <table className="em-an-table">
          <thead>
            <tr>
              <th style={{ width: "34%" }}>Button</th>
              <th>Status</th>
              <th>Clicks</th>
              <th>CTR %</th>
              <th>Last 14 days</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {[...links]
              .sort((a, b) => b.clicks - a.clicks)
              .map((l) => {
                const bg = resolveLinkBg(l.style, "linear-gradient(135deg, #ec4899, #7c3aed)");
                return (
                  <tr key={l.id}>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <span
                          className="em-link-icon"
                          style={{
                            "--em-link-bg": bg,
                            width: 28,
                            height: 28,
                            fontSize: 13,
                            borderRadius: 8,
                          } as CSSProperties}
                        >
                          {l.emoji}
                        </span>
                        <span style={{ fontWeight: 600 }}>{l.title}</span>
                      </div>
                    </td>
                    <td>
                      <span className="em-status-pill em-status-live">● Active</span>
                    </td>
                    <td style={{ fontWeight: 700 }}>{l.clicks.toLocaleString()}</td>
                    <td>{l.ctr.toFixed(1)}</td>
                    <td>
                      <div className="em-an-spark">
                        {l.spark.map((v, i) => (
                          <div
                            key={i}
                            className="em-an-spark-bar"
                            style={{
                              height: `${Math.max(8, (v / peak) * 100)}%`,
                            }}
                          />
                        ))}
                      </div>
                    </td>
                    <td>
                      <button type="button" className="em-evolve-link">
                        View evolution
                      </button>
                    </td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>
    </>
  );
}

// ─── Top-level page ────────────────────────────────────────────────────────

export default function PageEditorMockup() {
  const [tab, setTab] = useState<TabKey>("content");
  const [title, setTitle] = useState("My Personal Links");
  const [links, setLinks] = useState<EditorLink[]>(MOCK_LINKS);
  const [socials, setSocials] = useState<SocialEntry[]>([
    { platform: "ig", url: "https://instagram.com/me", color: "#E1306C", shape: "circle" },
    { platform: "x", url: "https://x.com/me", color: "#000000", shape: "circle" },
    { platform: "linkedin", url: "https://linkedin.com/in/me", color: "#0A66C2", shape: "circle" },
  ]);
  const [device, setDevice] = useState<"mobile" | "desktop">("mobile");
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(true);

  // Pretend "save" any time anything changes
  useEffect(() => {
    setSaved(false);
    const t = setTimeout(() => setSaved(true), 700);
    return () => clearTimeout(t);
  }, [title, links, socials]);

  // ── Resizable preview ───────────────────────────────────────────────────
  const [previewW, setPreviewW] = useState<number>(() => {
    const stored = Number(localStorage.getItem("em-preview-w"));
    return Number.isFinite(stored) && stored >= 280 && stored <= 680
      ? stored
      : 380;
  });
  const dragging = useRef(false);

  useEffect(() => {
    localStorage.setItem("em-preview-w", String(previewW));
  }, [previewW]);

  const onHandleDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    dragging.current = true;
    const startX = e.clientX;
    const startW = previewW;
    const onMove = (ev: MouseEvent) => {
      if (!dragging.current) return;
      // Drag right = grow center / shrink preview; drag left = grow preview
      const delta = startX - ev.clientX;
      const next = Math.max(280, Math.min(680, startW + delta));
      setPreviewW(next);
    };
    const onUp = () => {
      dragging.current = false;
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseup", onUp);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onUp);
  }, [previewW]);

  // ── Build the Page shape Preview expects ────────────────────────────────
  const pageContent = useMemo<Page["content"]>(() => {
    return {
      button: "rounded-lg",
      buttonColor: "#ffffff",
      textColor: "#ffffff",
      background: "",
      backgroundType: "gradient",
      gradientStart: "#7c3aed",
      gradientEnd: "#ec4899",
      gradientDirection: "to bottom",
      fontFamily: "Inter, sans-serif",
      social: socials.reduce((acc, s) => {
        // Map our platform ids to the existing Page social keys where possible
        if (s.platform === "ig") acc.ig = s.url;
        else if (s.platform === "fb") acc.fb = s.url;
        else if (s.platform === "tiktok") acc.tiktok = s.url;
        else if (s.platform === "linkedin") acc.linkedin = s.url;
        return acc;
      }, {} as Page["content"]["social"]),
    };
  }, [socials]);

  const previewLinks = useMemo(
    () => toPageLinks(links, "#3b82f6"),
    [links],
  );

  const copyUrl = () => {
    navigator.clipboard?.writeText("https://thin.ly/abc1234").catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <MainLayout>
      <div className="em-shell pm-shell" style={{ padding: 0 }}>
        <TopBar
          title={title}
          onTitleChange={setTitle}
          status="PUBLISHED"
          lookupCode="abc1234"
          saved={saved}
        />
        <TabBar
          active={tab}
          onChange={setTab}
          linksCount={links.length}
          socialsCount={socials.length}
        />

        <div
          className="em-body"
          style={{ "--em-preview-w": `${previewW}px` } as CSSProperties}
        >
          <div className="em-center">
            {tab === "content" && (
              <ContentTab links={links} setLinks={setLinks} />
            )}
            {tab === "design" && <DesignTab />}
            {tab === "social" && (
              <SocialTab socials={socials} setSocials={setSocials} />
            )}
            {tab === "analytics" && <AnalyticsTab links={links} />}
          </div>

          <div className="em-right">
            <div
              className="em-handle"
              onMouseDown={onHandleDown}
              aria-label="Resize preview"
              title="Drag to resize preview"
            />

            <div className="em-preview-head">
              <div className="em-device">
                <button
                  type="button"
                  className={`em-device-btn${device === "mobile" ? " em-device-btn--active" : ""}`}
                  onClick={() => setDevice("mobile")}
                  title="Mobile"
                >
                  <Smartphone size={14} strokeWidth={2} />
                </button>
                <button
                  type="button"
                  className={`em-device-btn${device === "desktop" ? " em-device-btn--active" : ""}`}
                  onClick={() => setDevice("desktop")}
                  title="Desktop"
                >
                  <Monitor size={14} strokeWidth={2} />
                </button>
              </div>
              <button type="button" className="em-preview-url" onClick={copyUrl}>
                {copied ? <Check size={12} /> : <Copy size={12} />}
                thin.ly/abc1234
              </button>
            </div>

            <div className="em-preview-stage">
              <div className="em-preview-phone">
                <div className="pm-phone-notch" />
                <div className="pm-phone-screen">
                  <div className="pm-phone-screen-inner">
                    <Preview
                      title={title}
                      description="Everything I create, in one place."
                      content={pageContent}
                      links={previewLinks}
                    />
                  </div>
                  <div className="pm-phone-shine" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
