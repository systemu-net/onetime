/**
 * ProfileEditor — owner-side editor for /@handle, shown when is_owner.
 *
 * Tabs (Profile · Links · Privacy) on the left, a live preview that
 * renders the SAME <PublicProfile narrow> on the right. Text fields autosave on
 * blur; accent/privacy/link changes save immediately. Publish makes it live;
 * "View as visitor" opens the public view (/@handle?view=public).
 *
 * Plan tab + follow/analytics are Phase 3/4 — intentionally absent.
 */
import {
  deleteAvatarApi,
  logoutApi,
  updateAvatarApi,
} from "@/apis/authentication";
import { API_URL } from "@/apis/config";
import {
  checkHandle,
  getMyProfile,
  getProfileLinks,
  publishProfile,
  updateProfile,
  updateProfileLinks,
  type ProfileLinkInput,
  type ProfileUpdate,
} from "@/apis/profile";
import { LANDING_ROUTE, PLANS_ROUTE, profilePath } from "@/routes";
import type {
  AvailableLink,
  HandleCheck,
  NamedAccent,
  Profile,
  ProfileLinkRow,
  ProfilePrivacy,
} from "@/types";
import { invalidateUserCache } from "@/utils/userCache";
import {
  ArrowDown,
  ArrowUp,
  BadgeCheck,
  Check,
  Copy,
  CreditCard,
  ExternalLink,
  Eye,
  EyeOff,
  Globe,
  GripVertical,
  Lock,
  LogOut,
  MessageCircle,
  Monitor,
  Pin,
  Plus,
  Smartphone,
  Trash2,
  Upload,
  Users,
} from "lucide-react";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import { useCookies } from "react-cookie";
import { Link as RouterLink, useNavigate } from "react-router-dom";

import { Pagination } from "@/components/elements/Pagination";
import type { PaginationMeta } from "@/types/pagination";
import "./profile-editor.css";
import "./profile.css";
import { ColorWheel } from "./ColorWheel";
import PublicProfile, { type ProfileView } from "./PublicProfile";
import { SOCIAL_PLATFORM_MAP, SOCIAL_PLATFORMS } from "./socialPlatforms";

const ACCENTS: NamedAccent[] = [
  "violet",
  "mint",
  "coral",
  "peach",
  "lilac",
  "sun",
  "sky",
];
// Vivid representative hex per preset — used for the quick-pick chips and to
// seed the wheel when the active accent is a preset name.
const NAMED_ACCENT_HEX: Record<NamedAccent, string> = {
  violet: "#7c3aed",
  mint: "#10b981",
  coral: "#ef4444",
  peach: "#f59e0b",
  lilac: "#a855f7",
  sun: "#eab308",
  sky: "#0ea5e9",
};
const PRIVACY_ROWS: {
  key: keyof ProfilePrivacy;
  title: string;
  hint: string;
  Icon: typeof Globe;
}[] = [
  {
    key: "is_public",
    title: "Public profile",
    hint: "Anyone can view your @handle page.",
    Icon: Globe,
  },
  {
    key: "show_followers",
    title: "Show follower count",
    hint: "Display how many people follow you.",
    Icon: Users,
  },
  {
    key: "allow_follow",
    title: "Allow follows",
    hint: "Let visitors subscribe to your new links.",
    Icon: Users,
  },
  {
    key: "allow_messages",
    title: "Allow messages",
    hint: "Show a message button on your profile.",
    Icon: MessageCircle,
  },
];

// Max links a profile may curate (hard cap for now).
const MAX_LINKS = 10;

// Client-side sort options for the Links tab (mirrors the Link Governance
// search + order controls; fields available without a refetch).
const LINK_SORTS: { value: string; label: string }[] = [
  { value: "recent", label: "Recent" },
  { value: "clicks-desc", label: "Most clicks" },
  { value: "clicks-asc", label: "Fewest clicks" },
  { value: "title-asc", label: "Title A–Z" },
  { value: "title-desc", label: "Title Z–A" },
];

function sortLinksBy<T extends { title: string; clicks: number }>(
  items: T[],
  sort: string,
): T[] {
  const arr = [...items];
  switch (sort) {
    case "clicks-desc":
      return arr.sort((a, b) => b.clicks - a.clicks);
    case "clicks-asc":
      return arr.sort((a, b) => a.clicks - b.clicks);
    case "title-asc":
      return arr.sort((a, b) => a.title.localeCompare(b.title));
    case "title-desc":
      return arr.sort((a, b) => b.title.localeCompare(a.title));
    default:
      return arr; // "recent" — preserve as loaded
  }
}

type TabKey = "profile" | "social" | "links" | "privacy";
type SaveState = "idle" | "saving" | "saved";

export default function ProfileEditor() {
  const [cookies, , removeCookie] = useCookies(["token"]);
  const token = cookies.token as string;
  const navigate = useNavigate();

  const signOut = async () => {
    try {
      await logoutApi(token);
    } catch {
      /* sign out locally regardless of the API result */
    }
    invalidateUserCache();
    removeCookie("token");
    navigate(LANDING_ROUTE);
  };

  // Open the Stripe billing portal (moved here from the old Settings page).
  const openBilling = async () => {
    try {
      const res = await fetch(`${API_URL}/api/v1/billings`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: token },
      });
      if (!res.ok) throw new Error("Billing portal unavailable");
      const { url } = await res.json();
      window.location.href = url;
    } catch (err) {
      console.error(err);
    }
  };

  const [draft, setDraft] = useState<Profile | null>(null);
  const [links, setLinks] = useState<ProfileLinkRow[]>([]);
  const [available, setAvailable] = useState<AvailableLink[]>([]);
  const [linkQuery, setLinkQuery] = useState("");
  const [linkSort, setLinkSort] = useState("recent");
  const [availPage, setAvailPage] = useState(1);
  const [tab, setTab] = useState<TabKey>("profile");
  const [save, setSave] = useState<SaveState>("idle");
  const [published, setPublished] = useState(false);
  const [handleState, setHandleState] = useState<HandleCheck | null>(null);
  const [avatarBusy, setAvatarBusy] = useState(false);
  const [device, setDevice] = useState<"mobile" | "desktop">("mobile");
  const [previewCopied, setPreviewCopied] = useState(false);
  // Which social platforms are added (shown as icons). Seeded once from the
  // loaded profile (platforms that already have a value), then toggled by the
  // Social tab's platform grid.
  const [activeSocials, setActiveSocials] = useState<string[]>([]);
  const [dragSocial, setDragSocial] = useState<string | null>(null);
  const dragSocialRef = useRef<string | null>(null);
  const activeSocialsRef = useRef<string[]>([]);
  const socialsInit = useRef(false);
  // Start at the maximum (slider fully left) so the preview opens large and can
  // only be dragged right to shrink.
  const PREVIEW_MIN = 360;
  const PREVIEW_MAX = 860;
  const [previewW, setPreviewW] = useState<number>(PREVIEW_MAX);
  // Actual rendered width of the preview stage (may be < previewW when the
  // editor floor wins). Drives the device zoom so the frame never overflows.
  const [stageW, setStageW] = useState<number>(PREVIEW_MAX);
  const stageRef = useRef<HTMLDivElement>(null);
  const handleTimer = useRef<number | undefined>(undefined);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dragging = useRef(false);

  // Seed the active platforms from the loaded profile (once): use the saved
  // order when present, otherwise platforms that already have a value.
  useEffect(() => {
    if (!draft || socialsInit.current) return;
    socialsInit.current = true;
    const saved = (draft.social_order ?? []).filter(
      (k) => SOCIAL_PLATFORM_MAP[k],
    );
    const withValues = SOCIAL_PLATFORMS.filter(
      (p) => ((draft.socials?.[p.key] as string) ?? "").trim().length > 0,
    ).map((p) => p.key);
    const merged = [...saved, ...withValues.filter((k) => !saved.includes(k))];
    setActiveSocials(merged);
  }, [draft]);

  // Mirror the active order into a ref so drag-end can persist the latest.
  useEffect(() => {
    activeSocialsRef.current = activeSocials;
  }, [activeSocials]);

  // Reset the "Add a link" page when the search/sort changes.
  useEffect(() => {
    setAvailPage(1);
  }, [linkQuery, linkSort]);

  // Track the real preview-stage width (resizes with the divider AND the window).
  useEffect(() => {
    const el = stageRef.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver((entries) => {
      const w = entries[0]?.contentRect.width;
      if (w) setStageW(w);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [draft]);

  // Drag the divider to resize the live-preview column (mirrors /pages).
  const onHandleDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      dragging.current = true;
      const startX = e.clientX;
      const startW = previewW;
      const onMove = (ev: MouseEvent) => {
        if (!dragging.current) return;
        const delta = startX - ev.clientX;
        setPreviewW(
          Math.max(PREVIEW_MIN, Math.min(PREVIEW_MAX, startW + delta)),
        );
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
    },
    [previewW],
  );

  // Load the canonical owner data (full profile incl. privacy, then links).
  useEffect(() => {
    let active = true;
    getMyProfile(token)
      .then((p) => active && setDraft(p))
      .catch(() => {});
    getProfileLinks(token)
      .then((res) => {
        if (!active) return;
        setLinks(res.links);
        setAvailable(res.available_links);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [token]);

  if (!draft) {
    // Same seamless brand splash as the public /@handle page (no empty box).
    return (
      <div className="tlp tlp-splash">
        <div className="tlp-splash-mark">
          thin<span>.ly</span>
        </div>
        <div className="tlp-splash-tag">// governed · verified · safe</div>
      </div>
    );
  }

  const privacy: ProfilePrivacy = draft.privacy ?? {
    is_public: true,
    show_followers: true,
    allow_follow: true,
    allow_messages: false,
  };

  // The wheel always works in hex; map a preset name to its representative hex.
  const wheelValue = draft.accent.startsWith("#")
    ? draft.accent
    : (NAMED_ACCENT_HEX[draft.accent as NamedAccent] ?? NAMED_ACCENT_HEX.violet);

  // Links tab search + order. Search filters both lists; sort applies to the
  // "Add a link" list (the curated list keeps its manual order — that IS the
  // saved curation, so reordering is disabled while a search is active).
  const q = linkQuery.trim().toLowerCase();
  const matchesQuery = (title: string, slug: string) =>
    !q || title.toLowerCase().includes(q) || slug.toLowerCase().includes(q);
  const shownLinks = q
    ? links.filter((l) => matchesQuery(l.title, l.slug))
    : links;
  const shownAvailable = sortLinksBy(
    available.filter((a) => matchesQuery(a.title, a.slug)),
    linkSort,
  );
  // Client-side pagination for the "Add a link" list (same control as /governance).
  const AVAIL_PER_PAGE = 8;
  const availPages = Math.max(1, Math.ceil(shownAvailable.length / AVAIL_PER_PAGE));
  const availSafePage = Math.min(availPage, availPages);
  const pagedAvailable = shownAvailable.slice(
    (availSafePage - 1) * AVAIL_PER_PAGE,
    availSafePage * AVAIL_PER_PAGE,
  );
  const availMeta: PaginationMeta = {
    count: shownAvailable.length,
    page: availSafePage,
    limit: AVAIL_PER_PAGE,
    pages: availPages,
    next: availSafePage < availPages ? availSafePage + 1 : null,
    prev: availSafePage > 1 ? availSafePage - 1 : null,
  };

  const previewModel: ProfileView = {
    handle: draft.handle,
    display_name: draft.display_name,
    bio: draft.bio,
    location: draft.location,
    website: draft.website,
    accent: draft.accent,
    verified: draft.verified,
    socials: draft.socials,
    social_order: activeSocials,
    avatar_url: draft.avatar_url,
    created_at: draft.created_at,
    links,
  };

  // ── Saving ──────────────────────────────────────────────────────────────
  const persistProfile = async (patch: ProfileUpdate) => {
    setSave("saving");
    try {
      const updated = await updateProfile(token, patch);
      setDraft((d) => (d ? { ...d, ...updated } : updated));
      // A handle rename changes the user's @handle app-wide (nav link, dashboard
      // greeting) — drop the cached current-user so it refetches the new handle.
      if ("handle" in patch) invalidateUserCache();
      setSave("saved");
      window.setTimeout(() => setSave("idle"), 1600);
    } catch {
      setSave("idle");
    }
  };

  const persistLinks = async (rows: ProfileLinkRow[]) => {
    setLinks(rows); // optimistic
    const inputs: ProfileLinkInput[] = rows.map((l, i) => ({
      link_id: l.link_id,
      position: i,
      pinned: l.pinned,
      visible: l.visible,
      title_override: l.title_override,
      tag: l.tag,
    }));
    try {
      const res = await updateProfileLinks(token, inputs);
      setLinks(res.links);
      setAvailable(res.available_links);
    } catch {
      /* keep optimistic state */
    }
  };

  // Local field editing — controlled by draft, saved on blur.
  const setField = (key: keyof Profile, value: string) =>
    setDraft((d) => (d ? { ...d, [key]: value } : d));
  const setSocial = (key: string, value: string) =>
    setDraft((d) =>
      d ? { ...d, socials: { ...d.socials, [key]: value } } : d,
    );

  // Add/remove a platform. Order persists instantly; removing clears the value.
  const toggleSocial = (key: string) => {
    const adding = !activeSocials.includes(key);
    const next = adding
      ? [...activeSocials, key]
      : activeSocials.filter((k) => k !== key);
    setActiveSocials(next);
    if (adding) {
      persistProfile({ social_order: next });
    } else {
      setSocial(key, "");
      persistProfile({ social_order: next, socials: { [key]: "" } });
    }
  };

  // Drag & drop reordering. Rows reorder live as the dragged row moves over
  // them (no save); the final order persists once on drag end.
  const onSocialDragStart = (e: React.DragEvent, key: string) => {
    dragSocialRef.current = key; // ref = synchronous, so dragEnter can read it immediately
    setDragSocial(key);
    e.dataTransfer.effectAllowed = "move";
    const row = (e.currentTarget as HTMLElement).closest(".tlpe-social-field");
    if (row)
      e.dataTransfer.setDragImage(
        row,
        24,
        (row as HTMLElement).offsetHeight / 2,
      );
  };
  const moveSocialOver = (overKey: string) => {
    const dragKey = dragSocialRef.current;
    if (!dragKey || dragKey === overKey) return;
    setActiveSocials((cur) => {
      const from = cur.indexOf(dragKey);
      const to = cur.indexOf(overKey);
      if (from < 0 || to < 0) return cur;
      const next = [...cur];
      next.splice(from, 1);
      next.splice(to, 0, dragKey);
      return next;
    });
  };
  const onSocialDragEnd = () => {
    if (dragSocialRef.current)
      persistProfile({ social_order: activeSocialsRef.current });
    dragSocialRef.current = null;
    setDragSocial(null);
  };

  const onHandleChange = (value: string) => {
    const clean = value.toLowerCase().replace(/[^a-z0-9_.-]/g, "");
    setField("handle", clean);
    window.clearTimeout(handleTimer.current);
    handleTimer.current = window.setTimeout(() => {
      checkHandle(token, clean)
        .then(setHandleState)
        .catch(() => setHandleState(null));
    }, 400);
  };

  const onPublish = async () => {
    try {
      const p = await publishProfile(token);
      setDraft((d) => (d ? { ...d, ...p } : p));
      setPublished(true);
      window.setTimeout(() => setPublished(false), 2200);
    } catch {
      /* noop */
    }
  };

  // ── Avatar (reuses the CarrierWave /user/avatar endpoint that backs the
  //    hero image — not S3 presign, which is for page content images) ──────
  const onAvatarFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (!file || !file.type.startsWith("image/") || file.size > 5 * 1024 * 1024)
      return;

    setAvatarBusy(true);
    const [data, err] = await updateAvatarApi(token, file);
    if (!err && data?.avatar_url) {
      // cache-bust so the preview reflects the new image even if the URL repeats
      const url = `${data.avatar_url}${data.avatar_url.includes("?") ? "&" : "?"}v=${Date.now()}`;
      setDraft((d) => (d ? { ...d, avatar_url: url } : d));
      invalidateUserCache();
    }
    setAvatarBusy(false);
  };

  const onAvatarRemove = async () => {
    setAvatarBusy(true);
    const [, err] = await deleteAvatarApi(token);
    if (!err) {
      setDraft((d) => (d ? { ...d, avatar_url: null } : d));
      invalidateUserCache();
    }
    setAvatarBusy(false);
  };

  // ── Link mutations ───────────────────────────────────────────────────────
  const move = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= links.length) return;
    const next = [...links];
    [next[i], next[j]] = [next[j], next[i]];
    persistLinks(next);
  };
  const togglePin = (id: number) => {
    // Pins are independent — any number of links can be crowned.
    persistLinks(
      links.map((l) => (l.id === id ? { ...l, pinned: !l.pinned } : l)),
    );
  };
  const toggleVisible = (id: number) =>
    persistLinks(
      links.map((l) => (l.id === id ? { ...l, visible: !l.visible } : l)),
    );
  const removeLink = (id: number) =>
    persistLinks(links.filter((l) => l.id !== id));
  const addLink = (av: AvailableLink) => {
    if (links.length >= MAX_LINKS) return; // hard cap
    persistLinks([
      ...links,
      {
        id: -av.link_id, // temp; server returns the real row
        link_id: av.link_id,
        title: av.title,
        title_override: null,
        slug: av.slug,
        url: av.url,
        host: av.host,
        clicks: av.clicks,
        state: av.state,
        tag: null,
        pinned: false,
        visible: true,
        position: links.length,
        spark: [],
      },
    ]);
  };
  const editLinkTitle = (id: number, value: string) =>
    setLinks((ls) =>
      ls.map((l) =>
        l.id === id
          ? { ...l, title_override: value, title: value || l.title }
          : l,
      ),
    );

  const previewUrl = `thin.ly/@${draft.handle}`;
  const copyPreviewUrl = () => {
    navigator.clipboard?.writeText(`https://${previewUrl}`).catch(() => {});
    setPreviewCopied(true);
    window.setTimeout(() => setPreviewCopied(false), 1600);
  };

  // ── Render ─────────────────────────────────────────────────────────────
  return (
    <div className="tlp tlpe-shell">
      <header className="tlpe-header">
        <div>
          <h1 className="tlpe-header-title">Edit profile</h1>
          <div className="tlpe-header-handle">thin.ly/@{draft.handle}</div>
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
          <button
            type="button"
            className="tlpe-headerlink"
            onClick={openBilling}
          >
            <CreditCard size={14} /> Billing
          </button>
          <button type="button" className="tlpe-signout" onClick={signOut}>
            <LogOut size={14} /> Sign out
          </button>
          <RouterLink
            className="tlp-btn tlp-btn--ghost-dark tlp-btn--sm"
            to={`${profilePath(draft.handle)}?view=public`}
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
            {draft.published ? "Republish" : "Publish"}
          </button>
        </div>
      </header>

      <div
        className="tlpe-grid"
        style={{ "--tlpe-preview-w": `${previewW}px` } as CSSProperties}
      >
        {/* Editor */}
        <div className="tlpe-panel">
          <div className="tlpe-tabs">
            {(["profile", "social", "links", "privacy"] as TabKey[]).map(
              (t) => (
                <button
                  key={t}
                  type="button"
                  className={`tlpe-tab${tab === t ? " tlpe-tab--on" : ""}`}
                  onClick={() => setTab(t)}
                >
                  {t[0].toUpperCase() + t.slice(1)}
                </button>
              ),
            )}
          </div>

          {tab === "profile" && (
            <>
              <div className="tlpe-field tlpe-avatar-row">
                <div className="tlpe-avatar-preview">
                  {draft.avatar_url ? (
                    <img src={draft.avatar_url} alt="" />
                  ) : (
                    (draft.display_name || draft.handle)
                      .slice(0, 2)
                      .toUpperCase()
                  )}
                </div>
                <div className="tlpe-avatar-actions">
                  <button
                    type="button"
                    className="tlp-btn tlp-btn--primary tlp-btn--sm"
                    disabled={avatarBusy}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload size={14} />{" "}
                    {avatarBusy ? "Uploading…" : "Upload photo"}
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
                    <div className="tlpe-verify-title">You’re verified</div>
                    <div className="tlpe-verify-hint">
                      The blue checkmark shows next to your name on your public
                      profile — included with your plan.
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
                <div className={`tlpe-handle-field`}>
                  <span className="tlpe-handle-prefix">thin.ly/@</span>
                  <input
                    value={draft.handle}
                    onChange={(e) => onHandleChange(e.target.value)}
                    onBlur={() =>
                      handleState?.available &&
                      persistProfile({ handle: draft.handle })
                    }
                  />
                  {handleState && (
                    <span
                      className={`tlpe-handle-status ${handleState.available ? "tlpe-handle-status--ok" : "tlpe-handle-status--bad"}`}
                    >
                      {handleState.available ? "available" : handleState.reason}
                    </span>
                  )}
                </div>
              </div>

              <div className="tlpe-field">
                <div className="tlpe-label-row">
                  <label className="tlpe-label">Bio</label>
                  <span className="tlpe-hint">
                    {(draft.bio ?? "").length}/160
                  </span>
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
                    onBlur={() =>
                      persistProfile({ location: draft.location ?? "" })
                    }
                  />
                </div>
                <div className="tlpe-field">
                  <label className="tlpe-label">Website</label>
                  <input
                    className="tlpe-input"
                    value={draft.website ?? ""}
                    onChange={(e) => setField("website", e.target.value)}
                    onBlur={() =>
                      persistProfile({ website: draft.website ?? "" })
                    }
                  />
                </div>
              </div>
            </>
          )}

          {tab === "social" && (
            <>
              <div className="tlpe-social-head">
                <div className="tlpe-section-eyebrow" style={{ margin: 0 }}>
                  Add platforms
                </div>
                <p className="tlpe-hint">
                  Tap to add or remove — each saved platform shows as an icon on
                  your profile.
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
                  <p
                    className="tlpe-hint"
                    style={{ marginTop: -4, marginBottom: 10 }}
                  >
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
          )}

          {tab === "links" && (
            <>
              <div className="tlpe-links-toolbar">
                <div className="tlpe-links-search">
                  <span className="tlpe-links-search-icon" aria-hidden>⌕</span>
                  <input
                    className="tlpe-links-search-input"
                    placeholder="Search links…"
                    value={linkQuery}
                    onChange={(e) => setLinkQuery(e.target.value)}
                    aria-label="Search links"
                  />
                </div>
                <select
                  className="tlpe-links-sort"
                  value={linkSort}
                  onChange={(e) => setLinkSort(e.target.value)}
                  aria-label="Order links"
                >
                  {LINK_SORTS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="tlpe-links-head">
                <div className="tlpe-section-eyebrow" style={{ margin: 0 }}>
                  {q
                    ? `${shownLinks.length} of ${links.length} links`
                    : `${links.length} / ${MAX_LINKS} links · drag-free reorder`}
                </div>
              </div>
              {links.length === 0 && (
                <div className="tlpe-empty">
                  No links on your profile yet — add some below.
                </div>
              )}
              {links.length > 0 && shownLinks.length === 0 && (
                <div className="tlpe-empty">No links match “{linkQuery}”.</div>
              )}
              {shownLinks.map((l, i) => (
                <div
                  className={`tlpe-link${l.visible ? "" : " tlpe-link--hidden"}`}
                  key={l.id}
                >
                  <div className="tlpe-link-reorder">
                    <button
                      type="button"
                      className="tlpe-iconbtn"
                      disabled={!!q || i === 0}
                      onClick={() => move(i, -1)}
                      title={q ? "Clear search to reorder" : "Move up"}
                    >
                      <ArrowUp size={13} />
                    </button>
                    <button
                      type="button"
                      className="tlpe-iconbtn"
                      disabled={!!q || i === links.length - 1}
                      onClick={() => move(i, 1)}
                      title={q ? "Clear search to reorder" : "Move down"}
                    >
                      <ArrowDown size={13} />
                    </button>
                  </div>
                  <div className="tlpe-link-fields">
                    <input
                      className="tlpe-link-title-input"
                      value={l.title}
                      onChange={(e) => editLinkTitle(l.id, e.target.value)}
                      onBlur={() => persistLinks(links)}
                    />
                    <span className="tlpe-link-meta">
                      thin.ly/{l.slug} · {l.clicks} clicks · {l.state}
                    </span>
                  </div>
                  <button
                    type="button"
                    className={`tlpe-iconbtn${l.pinned ? " tlpe-iconbtn--on" : ""}`}
                    onClick={() => togglePin(l.id)}
                    title="Pin"
                  >
                    <Pin size={14} />
                  </button>
                  <button
                    type="button"
                    className={`tlpe-iconbtn${l.visible ? " tlpe-iconbtn--eye" : ""}`}
                    onClick={() => toggleVisible(l.id)}
                    title={l.visible ? "Hide" : "Show"}
                  >
                    {l.visible ? <Eye size={14} /> : <EyeOff size={14} />}
                  </button>
                  <button
                    type="button"
                    className="tlpe-iconbtn"
                    onClick={() => removeLink(l.id)}
                    title="Remove"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}

              {shownAvailable.length > 0 && (
                <>
                  <div className="tlpe-section-eyebrow">Add a link</div>
                  {links.length >= MAX_LINKS && (
                    <div className="tlpe-limit-note">
                      You’ve reached the {MAX_LINKS}-link limit. Remove one to add another.
                    </div>
                  )}
                  <div className="tlpe-add-list">
                    {pagedAvailable.map((av) => (
                      <div className="tlpe-add-row" key={av.link_id}>
                        <div className="tlpe-add-row-info">
                          <div style={{ fontSize: 14, fontWeight: 600 }}>
                            {av.title}
                          </div>
                          <span className="tlpe-link-meta">
                            thin.ly/{av.slug} · {av.clicks} clicks
                          </span>
                        </div>
                        <button
                          type="button"
                          className="tlp-btn tlp-btn--primary tlp-btn--sm"
                          onClick={() => addLink(av)}
                          disabled={links.length >= MAX_LINKS}
                          title={links.length >= MAX_LINKS ? `Maximum ${MAX_LINKS} links` : "Add to profile"}
                        >
                          <Plus size={14} /> Add
                        </button>
                      </div>
                    ))}
                  </div>
                  <Pagination meta={availMeta} onChange={setAvailPage} />
                </>
              )}
            </>
          )}

          {tab === "privacy" && (
            <div>
              {PRIVACY_ROWS.map(({ key, title, hint, Icon }) => (
                <div className="tlpe-toggle-row" key={key}>
                  <span className="tlpe-toggle-icon">
                    <Icon size={18} />
                  </span>
                  <div className="tlpe-toggle-text">
                    <div className="tlpe-toggle-title">{title}</div>
                    <div className="tlpe-toggle-hint">{hint}</div>
                  </div>
                  <button
                    type="button"
                    aria-label={title}
                    className={`tlpe-switch${privacy[key] ? " tlpe-switch--on" : ""}`}
                    onClick={() => {
                      const next = { ...privacy, [key]: !privacy[key] };
                      setDraft((d) => (d ? { ...d, privacy: next } : d));
                      persistProfile({ privacy: { [key]: next[key] } });
                    }}
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Live preview */}
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
                style={{
                  zoom: Math.max(0.5, Math.min(1, (stageW - 24) / 380)),
                }}
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
                      zoom: Math.max(
                        0.34,
                        Math.min(0.95, (stageW - 18) / 1000),
                      ),
                    }}
                  >
                    <PublicProfile profile={previewModel} promptVerify />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
