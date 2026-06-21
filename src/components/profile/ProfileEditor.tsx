/**
 * ProfileEditor — owner-side editor for /@handle, shown when is_owner.
 *
 * Tabs (Profile · Links · Appearance · Privacy) on the left, a live preview that
 * renders the SAME <PublicProfile narrow> on the right. Text fields autosave on
 * blur; accent/privacy/link changes save immediately. Publish makes it live;
 * "View as visitor" opens the public view (/@handle?view=public).
 *
 * Plan tab + follow/analytics are Phase 3/4 — intentionally absent.
 */
import {
  checkHandle,
  getMyProfile,
  getProfileLinks,
  publishProfile,
  updateProfile,
  updateProfileLinks,
  type ProfileLinkInput,
  type ProfileUpdate,
} from '@/apis/profile';
import { deleteAvatarApi, logoutApi, updateAvatarApi } from '@/apis/authentication';
import { API_URL } from '@/apis/config';
import { LANDING_ROUTE, PLANS_ROUTE, profilePath } from '@/routes';
import type {
  Accent,
  AvailableLink,
  HandleCheck,
  Profile,
  ProfileLinkRow,
  ProfilePrivacy,
} from '@/types';
import { invalidateUserCache } from '@/utils/userCache';
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
} from 'lucide-react';
import { type CSSProperties, useCallback, useEffect, useRef, useState } from 'react';
import { useCookies } from 'react-cookie';
import type { IconType } from 'react-icons';
import {
  FaInstagram,
  FaSpotify,
  FaTiktok,
  FaXTwitter,
  FaYoutube,
} from 'react-icons/fa6';
import { Link as RouterLink, useNavigate } from 'react-router-dom';

import PublicProfile, { type ProfileView } from './PublicProfile';
import './profile.css';
import './profile-editor.css';

const ACCENTS: Accent[] = ['violet', 'mint', 'coral', 'peach', 'lilac', 'sun', 'sky'];
const SOCIALS: {
  key: keyof NonNullable<Profile['socials']>;
  label: string;
  Icon: IconType;
  color: string;
}[] = [
  { key: 'instagram', label: 'Instagram', Icon: FaInstagram, color: '#E4405F' },
  { key: 'youtube', label: 'YouTube', Icon: FaYoutube, color: '#FF0000' },
  { key: 'spotify', label: 'Spotify', Icon: FaSpotify, color: '#1DB954' },
  { key: 'tiktok', label: 'TikTok', Icon: FaTiktok, color: 'var(--ink-1)' },
  { key: 'x', label: 'X', Icon: FaXTwitter, color: 'var(--ink-1)' },
];
const PRIVACY_ROWS: { key: keyof ProfilePrivacy; title: string; hint: string; Icon: typeof Globe }[] = [
  { key: 'is_public', title: 'Public profile', hint: 'Anyone can view your @handle page.', Icon: Globe },
  { key: 'show_followers', title: 'Show follower count', hint: 'Display how many people follow you.', Icon: Users },
  { key: 'allow_follow', title: 'Allow follows', hint: 'Let visitors subscribe to your new links.', Icon: Users },
  { key: 'allow_messages', title: 'Allow messages', hint: 'Show a message button on your profile.', Icon: MessageCircle },
];

type TabKey = 'profile' | 'links' | 'appearance' | 'privacy';
type SaveState = 'idle' | 'saving' | 'saved';

export default function ProfileEditor() {
  const [cookies, , removeCookie] = useCookies(['token']);
  const token = cookies.token as string;
  const navigate = useNavigate();

  const signOut = async () => {
    try {
      await logoutApi(token);
    } catch {
      /* sign out locally regardless of the API result */
    }
    invalidateUserCache();
    removeCookie('token');
    navigate(LANDING_ROUTE);
  };

  // Open the Stripe billing portal (moved here from the old Settings page).
  const openBilling = async () => {
    try {
      const res = await fetch(`${API_URL}/api/v1/billings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: token },
      });
      if (!res.ok) throw new Error('Billing portal unavailable');
      const { url } = await res.json();
      window.location.href = url;
    } catch (err) {
      console.error(err);
    }
  };

  const [draft, setDraft] = useState<Profile | null>(null);
  const [links, setLinks] = useState<ProfileLinkRow[]>([]);
  const [available, setAvailable] = useState<AvailableLink[]>([]);
  const [tab, setTab] = useState<TabKey>('profile');
  const [save, setSave] = useState<SaveState>('idle');
  const [published, setPublished] = useState(false);
  const [handleState, setHandleState] = useState<HandleCheck | null>(null);
  const [avatarBusy, setAvatarBusy] = useState(false);
  const [device, setDevice] = useState<'mobile' | 'desktop'>('mobile');
  const [previewCopied, setPreviewCopied] = useState(false);
  const [previewW, setPreviewW] = useState<number>(() => {
    const stored = Number(localStorage.getItem('tlpe-preview-w'));
    return Number.isFinite(stored) && stored >= 360 && stored <= 860 ? stored : 600;
  });
  const handleTimer = useRef<number | undefined>(undefined);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dragging = useRef(false);

  useEffect(() => {
    localStorage.setItem('tlpe-preview-w', String(previewW));
  }, [previewW]);

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
        setPreviewW(Math.max(360, Math.min(860, startW + delta)));
      };
      const onUp = () => {
        dragging.current = false;
        document.removeEventListener('mousemove', onMove);
        document.removeEventListener('mouseup', onUp);
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
      };
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
      document.addEventListener('mousemove', onMove);
      document.addEventListener('mouseup', onUp);
    },
    [previewW],
  );

  // Load the canonical owner data (full profile incl. privacy, then links).
  useEffect(() => {
    let active = true;
    getMyProfile(token).then((p) => active && setDraft(p)).catch(() => {});
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

  const previewModel: ProfileView = {
    handle: draft.handle,
    display_name: draft.display_name,
    bio: draft.bio,
    location: draft.location,
    website: draft.website,
    accent: draft.accent,
    verified: draft.verified,
    socials: draft.socials,
    avatar_url: draft.avatar_url,
    created_at: draft.created_at,
    links,
  };

  // ── Saving ──────────────────────────────────────────────────────────────
  const persistProfile = async (patch: ProfileUpdate) => {
    setSave('saving');
    try {
      const updated = await updateProfile(token, patch);
      setDraft((d) => (d ? { ...d, ...updated } : updated));
      // A handle rename changes the user's @handle app-wide (nav link, dashboard
      // greeting) — drop the cached current-user so it refetches the new handle.
      if ('handle' in patch) invalidateUserCache();
      setSave('saved');
      window.setTimeout(() => setSave('idle'), 1600);
    } catch {
      setSave('idle');
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
  const setField = (key: keyof Profile, value: string) => setDraft((d) => (d ? { ...d, [key]: value } : d));
  const setSocial = (key: string, value: string) =>
    setDraft((d) => (d ? { ...d, socials: { ...d.socials, [key]: value } } : d));

  const onHandleChange = (value: string) => {
    const clean = value.toLowerCase().replace(/[^a-z0-9_.-]/g, '');
    setField('handle', clean);
    window.clearTimeout(handleTimer.current);
    handleTimer.current = window.setTimeout(() => {
      checkHandle(token, clean).then(setHandleState).catch(() => setHandleState(null));
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
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (!file || !file.type.startsWith('image/') || file.size > 5 * 1024 * 1024) return;

    setAvatarBusy(true);
    const [data, err] = await updateAvatarApi(token, file);
    if (!err && data?.avatar_url) {
      // cache-bust so the preview reflects the new image even if the URL repeats
      const url = `${data.avatar_url}${data.avatar_url.includes('?') ? '&' : '?'}v=${Date.now()}`;
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
    persistLinks(links.map((l) => (l.id === id ? { ...l, pinned: !l.pinned } : l)));
  };
  const toggleVisible = (id: number) =>
    persistLinks(links.map((l) => (l.id === id ? { ...l, visible: !l.visible } : l)));
  const removeLink = (id: number) => persistLinks(links.filter((l) => l.id !== id));
  const addLink = (av: AvailableLink) =>
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
  const editLinkTitle = (id: number, value: string) =>
    setLinks((ls) => ls.map((l) => (l.id === id ? { ...l, title_override: value, title: value || l.title } : l)));

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
            save !== 'idle' && <span className="tlpe-flash">{save === 'saving' ? 'Saving…' : 'Saved'}</span>
          )}
          <button type="button" className="tlpe-headerlink" onClick={openBilling}>
            <CreditCard size={14} /> Billing
          </button>
          <button type="button" className="tlpe-signout" onClick={signOut}>
            <LogOut size={14} /> Sign out
          </button>
          <RouterLink className="tlp-btn tlp-btn--ghost-dark tlp-btn--sm" to={`${profilePath(draft.handle)}?view=public`} style={{ color: 'var(--ink-1)', borderColor: 'var(--line-1)', background: 'var(--canvas-2)' }}>
            <ExternalLink size={14} /> View as visitor
          </RouterLink>
          <button type="button" className="tlp-btn tlp-btn--accent tlp-btn--sm" onClick={onPublish}>
            {draft.published ? 'Republish' : 'Publish'}
          </button>
        </div>
      </header>

      <div className="tlpe-grid" style={{ '--tlpe-preview-w': `${previewW}px` } as CSSProperties}>
        {/* Editor */}
        <div className="tlpe-panel">
          <div className="tlpe-tabs">
            {(['profile', 'links', 'appearance', 'privacy'] as TabKey[]).map((t) => (
              <button key={t} type="button" className={`tlpe-tab${tab === t ? ' tlpe-tab--on' : ''}`} onClick={() => setTab(t)}>
                {t[0].toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>

          {tab === 'profile' && (
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
                  <button type="button" className="tlp-btn tlp-btn--primary tlp-btn--sm" disabled={avatarBusy} onClick={() => fileInputRef.current?.click()}>
                    <Upload size={14} /> {avatarBusy ? 'Uploading…' : 'Upload photo'}
                  </button>
                  {draft.avatar_url && (
                    <button type="button" className="tlpe-iconbtn" disabled={avatarBusy} onClick={onAvatarRemove} title="Remove photo">
                      <Trash2 size={14} />
                    </button>
                  )}
                  <input ref={fileInputRef} type="file" accept="image/*" hidden onChange={onAvatarFile} />
                  <span className="tlpe-hint">PNG/JPG, up to 5MB</span>
                </div>
              </div>

              <div className="tlpe-field">
                <label className="tlpe-label">Display name</label>
                <input
                  className="tlpe-input"
                  value={draft.display_name ?? ''}
                  onChange={(e) => setField('display_name', e.target.value)}
                  onBlur={() => persistProfile({ display_name: draft.display_name ?? '' })}
                />
              </div>

              <div className="tlpe-field">
                <label className="tlpe-label">Handle</label>
                <div className={`tlpe-handle-field`}>
                  <span className="tlpe-handle-prefix">thin.ly/@</span>
                  <input
                    value={draft.handle}
                    onChange={(e) => onHandleChange(e.target.value)}
                    onBlur={() => handleState?.available && persistProfile({ handle: draft.handle })}
                  />
                  {handleState && (
                    <span className={`tlpe-handle-status ${handleState.available ? 'tlpe-handle-status--ok' : 'tlpe-handle-status--bad'}`}>
                      {handleState.available ? 'available' : handleState.reason}
                    </span>
                  )}
                </div>
              </div>

              <div className="tlpe-field">
                <div className="tlpe-label-row">
                  <label className="tlpe-label">Bio</label>
                  <span className="tlpe-hint">{(draft.bio ?? '').length}/160</span>
                </div>
                <textarea
                  className="tlpe-textarea"
                  maxLength={160}
                  value={draft.bio ?? ''}
                  onChange={(e) => setField('bio', e.target.value)}
                  onBlur={() => persistProfile({ bio: draft.bio ?? '' })}
                />
              </div>

              <div className="tlpe-grid2">
                <div className="tlpe-field">
                  <label className="tlpe-label">Location</label>
                  <input className="tlpe-input" value={draft.location ?? ''} onChange={(e) => setField('location', e.target.value)} onBlur={() => persistProfile({ location: draft.location ?? '' })} />
                </div>
                <div className="tlpe-field">
                  <label className="tlpe-label">Website</label>
                  <input className="tlpe-input" value={draft.website ?? ''} onChange={(e) => setField('website', e.target.value)} onBlur={() => persistProfile({ website: draft.website ?? '' })} />
                </div>
              </div>

              <div className="tlpe-section-eyebrow">Social links</div>
              <div className="tlpe-socials">
                {SOCIALS.map(({ key, label, Icon, color }) => (
                  <div className="tlpe-social-field" key={key}>
                    <span className="tlpe-social-icon" style={{ color }} aria-hidden>
                      <Icon />
                    </span>
                    <input
                      className="tlpe-social-input"
                      aria-label={label}
                      title={label}
                      placeholder={key === 'x' ? '@handle' : 'username'}
                      value={(draft.socials?.[key] as string) ?? ''}
                      onChange={(e) => setSocial(key, e.target.value)}
                      onBlur={() => persistProfile({ socials: { [key]: draft.socials?.[key] ?? '' } })}
                    />
                  </div>
                ))}
              </div>
            </>
          )}

          {tab === 'links' && (
            <>
              <div className="tlpe-links-head">
                <div className="tlpe-section-eyebrow" style={{ margin: 0 }}>{links.length} links · drag-free reorder</div>
              </div>
              {links.length === 0 && <div className="tlpe-empty">No links on your profile yet — add some below.</div>}
              {links.map((l, i) => (
                <div className={`tlpe-link${l.visible ? '' : ' tlpe-link--hidden'}`} key={l.id}>
                  <div className="tlpe-link-reorder">
                    <button type="button" className="tlpe-iconbtn" disabled={i === 0} onClick={() => move(i, -1)} title="Move up"><ArrowUp size={13} /></button>
                    <button type="button" className="tlpe-iconbtn" disabled={i === links.length - 1} onClick={() => move(i, 1)} title="Move down"><ArrowDown size={13} /></button>
                  </div>
                  <div className="tlpe-link-fields">
                    <input
                      className="tlpe-link-title-input"
                      value={l.title}
                      onChange={(e) => editLinkTitle(l.id, e.target.value)}
                      onBlur={() => persistLinks(links)}
                    />
                    <span className="tlpe-link-meta">thin.ly/{l.slug} · {l.clicks} clicks · {l.state}</span>
                  </div>
                  <button type="button" className={`tlpe-iconbtn${l.pinned ? ' tlpe-iconbtn--on' : ''}`} onClick={() => togglePin(l.id)} title="Pin"><Pin size={14} /></button>
                  <button type="button" className={`tlpe-iconbtn${l.visible ? ' tlpe-iconbtn--eye' : ''}`} onClick={() => toggleVisible(l.id)} title={l.visible ? 'Hide' : 'Show'}>{l.visible ? <Eye size={14} /> : <EyeOff size={14} />}</button>
                  <button type="button" className="tlpe-iconbtn" onClick={() => removeLink(l.id)} title="Remove"><Trash2 size={14} /></button>
                </div>
              ))}

              {available.length > 0 && (
                <>
                  <div className="tlpe-section-eyebrow">Add a link</div>
                  <div className="tlpe-add-list">
                    {available.map((av) => (
                      <div className="tlpe-add-row" key={av.link_id}>
                        <div className="tlpe-add-row-info">
                          <div style={{ fontSize: 14, fontWeight: 600 }}>{av.title}</div>
                          <span className="tlpe-link-meta">thin.ly/{av.slug} · {av.clicks} clicks</span>
                        </div>
                        <button type="button" className="tlp-btn tlp-btn--primary tlp-btn--sm" onClick={() => addLink(av)}><Plus size={14} /> Add</button>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </>
          )}

          {tab === 'appearance' && (
            <div className="tlpe-field">
              <label className="tlpe-label">Accent color</label>
              <div className="tlpe-swatches">
                {ACCENTS.map((a) => (
                  <button
                    key={a}
                    type="button"
                    title={a}
                    className={`tlpe-swatch${draft.accent === a ? ' tlpe-swatch--on' : ''}`}
                    style={{ background: `linear-gradient(135deg, var(--violet-500), var(--${a}))` }}
                    onClick={() => {
                      setDraft((d) => (d ? { ...d, accent: a } : d));
                      persistProfile({ accent: a });
                    }}
                  />
                ))}
              </div>
              <div className="tlpe-guardrail">
                <Check size={13} /> WCAG contrast preserved on every theme
              </div>

              <div className="tlpe-verify" style={{ marginTop: 24 }}>
                <label className="tlpe-label">Verification</label>
                {draft.verified ? (
                  <div className="tlpe-verify-on">
                    <BadgeCheck size={20} />
                    <div>
                      <div className="tlpe-verify-title">You’re verified</div>
                      <div className="tlpe-verify-hint">The blue badge shows on your public profile — included with your plan.</div>
                    </div>
                  </div>
                ) : (
                  <div className="tlpe-verify-cta">
                    <BadgeCheck size={22} className="tlpe-verify-icon" />
                    <div className="tlpe-verify-text">
                      <div className="tlpe-verify-title">Get verified</div>
                      <div className="tlpe-verify-hint">Add the blue verified badge to your profile with any paid plan.</div>
                    </div>
                    <RouterLink to={PLANS_ROUTE} className="tlp-btn tlp-btn--accent tlp-btn--sm">
                      <BadgeCheck size={15} /> Get verified
                    </RouterLink>
                  </div>
                )}
              </div>
            </div>
          )}

          {tab === 'privacy' && (
            <div>
              {PRIVACY_ROWS.map(({ key, title, hint, Icon }) => (
                <div className="tlpe-toggle-row" key={key}>
                  <span className="tlpe-toggle-icon"><Icon size={18} /></span>
                  <div className="tlpe-toggle-text">
                    <div className="tlpe-toggle-title">{title}</div>
                    <div className="tlpe-toggle-hint">{hint}</div>
                  </div>
                  <button
                    type="button"
                    aria-label={title}
                    className={`tlpe-switch${privacy[key] ? ' tlpe-switch--on' : ''}`}
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
          <div className="tlpe-handle" onMouseDown={onHandleDown} aria-label="Resize preview" title="Drag to resize preview" />
          <div className="tlpe-preview-eyebrow">
            <span className="tlp-eyebrow">Live preview</span>
            <span className="tlp-eyebrow" style={{ color: privacy.is_public ? 'var(--mint-d)' : 'var(--coral-d)' }}>
              {privacy.is_public ? 'Public' : 'Private'}
            </span>
          </div>

          <div className="tlpe-preview-head">
            <div className="tlpe-device">
              <button
                type="button"
                className={`tlpe-device-btn${device === 'mobile' ? ' tlpe-device-btn--on' : ''}`}
                onClick={() => setDevice('mobile')}
                title="Mobile preview"
              >
                <Smartphone size={14} strokeWidth={2} />
              </button>
              <button
                type="button"
                className={`tlpe-device-btn${device === 'desktop' ? ' tlpe-device-btn--on' : ''}`}
                onClick={() => setDevice('desktop')}
                title="Desktop preview"
              >
                <Monitor size={14} strokeWidth={2} />
              </button>
            </div>
            <button type="button" className="tlpe-preview-url" onClick={copyPreviewUrl} title="Copy your profile link">
              {previewCopied ? <Check size={12} /> : <Copy size={12} />}
              {previewUrl}
            </button>
          </div>

          <div className="tlpe-preview-stage">
            {!privacy.is_public ? (
              <div className="tlpe-private-note">
                <Lock size={26} style={{ color: 'var(--ink-4)' }} />
                <p>Your profile is private — only you can see it.</p>
              </div>
            ) : device === 'mobile' ? (
              <div
                className="tlpe-dev-phone"
                style={{ zoom: Math.max(0.5, Math.min(1, (previewW - 40) / 380)) }}
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
                  <span /><span /><span />
                  <span className="tlpe-dev-url"><Lock size={10} /> {previewUrl}</span>
                </div>
                <div className="tlpe-dev-desktop-scroll">
                  <div
                    className="tlpe-dev-desktop"
                    style={{ zoom: Math.max(0.34, Math.min(0.86, (previewW - 22) / 1000)) }}
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
