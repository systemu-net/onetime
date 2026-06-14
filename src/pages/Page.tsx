/**
 * Page editor — the live /pages/:lookup_code editor.
 * Visual design ported from PageEditorMockup (/pages-mockup/edit); wired to real data.
 *
 * Real & wired: load/save (getPage, autosave updatePage, Cmd/Ctrl+S), publish /
 * unpublish, links via the Resources API (add / edit / delete / drag-reorder,
 * live click counts), design controls (background, font, button shape, colors),
 * social links (the 5 platforms the backend stores), profile image + about.
 * Visual stubs (per the agreed scope): the Analytics tab, per-link style
 * overrides beyond color, extra social platforms, and the image/pattern
 * background, heading-weight, and density controls.
 */
import { API_URL } from '@/apis/config';
import { getPage, updatePage } from '@/apis/pages';
import { publishPage, unpublishPage } from '@/apis/publish';
import { uploadImageToS3 } from '@/apis/uploads';
import AddLinkModal from '@/components/elements/AddLinkModal';
import EditLinkModal from '@/components/elements/EditLinkModal';
import ImageUploadModal from '@/components/elements/ImageUploadModal';
import MainLayout from '@/components/layouts/MainLayout';
import Preview from '@/components/sections/Preview';
import PortfolioEditor from '@/components/sections/PortfolioEditor';
import PortfolioPreview from '@/components/sections/PortfolioPreview';
import { PAGES_ROUTE } from '@/routes';
import { Page, PageLink, Resource } from '@/types';
import {
  ArrowLeft,
  BarChart3,
  Check,
  Copy,
  Download,
  ExternalLink,
  Eye,
  FileText,
  GripVertical,
  Image as ImageIcon,
  Link as LinkIcon,
  Monitor,
  Palette,
  Pencil,
  Plus,
  Share2,
  Smartphone,
  Sparkles,
  Trash2,
  Video,
} from 'lucide-react';
import {
  type CSSProperties,
  type KeyboardEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useCookies } from 'react-cookie';
import { Link as RouterLink, useParams } from 'react-router-dom';
import { TbWorld } from 'react-icons/tb';

import {
  closestCenter,
  DndContext,
  DragEndEvent,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

import { useResources } from '../hooks/useResources';
import { extractDomain } from '../utils/transformers';

import '@/components/pages-mockup/pages-mockup.css';
import '@/components/pages-mockup/editor-mockup.css';

// ─── Static option sets ───────────────────────────────────────────────────────

const FONT_OPTIONS: { id: string; title: string }[] = [
  { id: 'rubik', title: 'Rubik' },
  { id: 'mono', title: 'Monospace' },
  { id: "'Courier New', monospace", title: 'Courier New' },
  { id: "'Brush Script MT', cursive", title: 'Brush Script' },
];

const SHAPE_OPTIONS: { id: Page['content']['button']; title: string; radius: number }[] = [
  { id: 'squared', title: 'Square', radius: 0 },
  { id: 'rounded-sm', title: 'Small', radius: 4 },
  { id: 'rounded', title: 'Rounded', radius: 8 },
  { id: 'rounded-lg', title: 'Large', radius: 14 },
  { id: 'rounded-full', title: 'Pill', radius: 999 },
];

const GRADIENT_DIRECTIONS: { id: NonNullable<Page['content']['gradientDirection']>; title: string }[] = [
  { id: 'to right', title: 'Left → Right' },
  { id: 'to bottom', title: 'Top → Bottom' },
  { id: 'to top right', title: 'Diagonal ↗' },
  { id: 'to bottom left', title: 'Diagonal ↙' },
];

const COLOR_PRESETS = [
  '#0f172a', '#7c3aed', '#a855f7', '#ec4899',
  '#f59e0b', '#10b981', '#06b6d4', '#3b82f6',
  '#84cc16', '#ef4444', '#f97316', '#6366f1',
  '#14b8a6', '#fbbf24', '#d946ef', '#ffffff',
];

type BgPreset =
  | { name: string; type: 'gradient'; start: string; end: string }
  | { name: string; type: 'color'; color: string };

const BG_PRESETS: BgPreset[] = [
  { name: 'Lilac', type: 'gradient', start: '#ec4899', end: '#7c3aed' },
  { name: 'Ocean', type: 'gradient', start: '#06b6d4', end: '#3b82f6' },
  { name: 'Mint', type: 'gradient', start: '#84cc16', end: '#10b981' },
  { name: 'Peach', type: 'gradient', start: '#fbbf24', end: '#f97316' },
  { name: 'Night', type: 'color', color: '#0f172a' },
  { name: 'Cream', type: 'color', color: '#fef3c7' },
  { name: 'Ink', type: 'color', color: '#18181b' },
  { name: 'Blossom', type: 'gradient', start: '#fda4af', end: '#f472b6' },
];

// Social platforms — the first five persist (backend social keys); the rest are
// visual stubs that show design intent but aren't stored yet.
type SocialKey = 'ig' | 'x' | 'tiktok' | 'fb' | 'linkedin';
const SUPPORTED: SocialKey[] = ['ig', 'x', 'tiktok', 'fb', 'linkedin'];

const PLATFORMS: { id: string; name: string; icon: string; color: string }[] = [
  { id: 'ig', name: 'Instagram', icon: '📷', color: '#E1306C' },
  { id: 'x', name: 'X', icon: '𝕏', color: '#000000' },
  { id: 'tiktok', name: 'TikTok', icon: '♪', color: '#000000' },
  { id: 'fb', name: 'Facebook', icon: 'f', color: '#1877F2' },
  { id: 'linkedin', name: 'LinkedIn', icon: 'in', color: '#0A66C2' },
  { id: 'yt', name: 'YouTube', icon: '▶', color: '#FF0000' },
  { id: 'threads', name: 'Threads', icon: '@', color: '#000000' },
  { id: 'bluesky', name: 'Bluesky', icon: '☁', color: '#0085FF' },
  { id: 'mastodon', name: 'Mastodon', icon: 'M', color: '#6364FF' },
  { id: 'substack', name: 'Substack', icon: 'S', color: '#FF6719' },
  { id: 'discord', name: 'Discord', icon: 'D', color: '#5865F2' },
  { id: 'telegram', name: 'Telegram', icon: '✈', color: '#26A5E4' },
  { id: 'github', name: 'GitHub', icon: '⌥', color: '#181717' },
  { id: 'email', name: 'Email', icon: '✉', color: '#71717a' },
];

// ─── Sortable link row ────────────────────────────────────────────────────────

function SortableLinkRow({
  resource,
  onEdit,
  onRemove,
}: {
  resource: Resource;
  onEdit: (r: Resource) => void;
  onRemove: (id: number) => Promise<void>;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: resource.id,
  });
  const [faviconError, setFaviconError] = useState(false);
  const style: CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };
  const url = resource.linkable.original_url;
  const title = resource.linkable.title || extractDomain(url);
  const bg = resource.color || '#3b82f6';

  return (
    <div ref={setNodeRef} style={style} className="em-link-row">
      <span className="em-link-drag" title="Drag to reorder" {...attributes} {...listeners}>
        <GripVertical size={16} strokeWidth={2} />
      </span>
      <span className="em-link-icon" style={{ '--em-link-bg': bg } as CSSProperties}>
        {faviconError ? (
          <TbWorld className="w-4 h-4" />
        ) : (
          <img
            alt=""
            draggable="false"
            loading="lazy"
            width={18}
            height={18}
            style={{ borderRadius: 4 }}
            src={`https://www.google.com/s2/favicons?sz=64&domain_url=${extractDomain(url)}`}
            onError={() => setFaviconError(true)}
          />
        )}
      </span>
      <button
        type="button"
        className="em-link-info"
        onClick={() => onEdit(resource)}
        title="Edit link"
        style={{ flex: 1, border: 'none', background: 'transparent', padding: 0, textAlign: 'left', cursor: 'pointer', font: 'inherit' }}
      >
        <div className="em-link-title">{title}</div>
        <div className="em-link-url">{url}</div>
      </button>
      <span className="em-link-clicks" title="Clicks">
        <Eye size={11} strokeWidth={2.5} />
        {(resource.linkable.clicks_count ?? 0).toLocaleString()}
      </span>
      <div className="em-link-actions">
        <button type="button" className="em-style-chip" onClick={() => onEdit(resource)}>
          <Palette size={12} strokeWidth={2} />
          Style
        </button>
        <button
          type="button"
          className="em-link-menu"
          title="Delete"
          onClick={async () => {
            try {
              await onRemove(resource.id);
            } catch (e) {
              console.error('Error removing resource:', e);
            }
          }}
        >
          <Trash2 size={13} strokeWidth={2} />
        </button>
      </div>
    </div>
  );
}

// ─── Top bar ──────────────────────────────────────────────────────────────────

function TopBar({
  page,
  onTitleChange,
  saved,
  onPublish,
  publishing,
}: {
  page: Page;
  onTitleChange: (t: string) => void;
  saved: boolean;
  onPublish: () => void;
  publishing: boolean;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(page.title);
  useEffect(() => setDraft(page.title), [page.title]);

  const commit = () => {
    if (draft.trim()) onTitleChange(draft.trim());
    else setDraft(page.title);
    setEditing(false);
  };
  const onKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') commit();
    if (e.key === 'Escape') {
      setDraft(page.title);
      setEditing(false);
    }
  };
  const isPublished = !!page.published_url;

  return (
    <div className="em-topbar">
      <RouterLink to={PAGES_ROUTE} className="em-back">
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
              maxLength={40}
              onChange={(e) => setDraft(e.target.value)}
              onBlur={commit}
              onKeyDown={onKey}
            />
          ) : (
            <>
              <h1 className="em-title">{page.title}</h1>
              <button type="button" className="em-rename-btn" title="Rename" onClick={() => setEditing(true)}>
                <Pencil size={12} strokeWidth={2} />
              </button>
            </>
          )}
        </div>
        <div className="em-meta-row">
          <span className={isPublished ? 'em-status-pill em-status-live' : 'em-status-pill em-status-draft'}>
            {isPublished ? '● Live' : '✎ Draft'}
          </span>
          <span className="em-meta-slug">thin.ly/{page.lookup_code}</span>
          {saved && <span className="em-saved-flash">All changes saved</span>}
        </div>
      </div>
      <div className="em-topbar-actions">
        <a
          className={`pm-btn pm-btn-ghost pm-btn-sm${page.published_url ? '' : ' pm-btn-disabled'}`}
          href={page.published_url || undefined}
          target="_blank"
          rel="noopener noreferrer"
          aria-disabled={!page.published_url}
          onClick={(e) => {
            if (!page.published_url) e.preventDefault();
          }}
        >
          <ExternalLink size={12} strokeWidth={2} />
          View live
        </a>
        <button type="button" className="pm-btn pm-btn-primary pm-btn-sm" onClick={onPublish} disabled={publishing}>
          {publishing ? '…' : isPublished ? '▶ Republish' : '▶ Publish'}
        </button>
      </div>
    </div>
  );
}

// ─── Tab bar ──────────────────────────────────────────────────────────────────

type TabKey = 'content' | 'design' | 'social' | 'analytics';

function TabBar({
  active,
  onChange,
  linksCount,
  socialsCount,
}: {
  active: TabKey;
  onChange: (t: TabKey) => void;
  linksCount: number;
  socialsCount: number;
}) {
  const tabs: { key: TabKey; label: string; icon: JSX.Element; count?: number }[] = [
    { key: 'content', label: 'Content', icon: <LinkIcon size={14} strokeWidth={2} />, count: linksCount },
    { key: 'design', label: 'Design', icon: <Palette size={14} strokeWidth={2} /> },
    { key: 'social', label: 'Social', icon: <Share2 size={14} strokeWidth={2} />, count: socialsCount },
    { key: 'analytics', label: 'Analytics', icon: <BarChart3 size={14} strokeWidth={2} /> },
  ];
  return (
    <div className="em-tabbar">
      {tabs.map((t) => (
        <button
          key={t.key}
          type="button"
          className={`em-tab${active === t.key ? ' em-tab--active' : ''}`}
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

// ─── Content tab ──────────────────────────────────────────────────────────────

function ContentTab({
  resources,
  loading,
  error,
  onAddClick,
  onEdit,
  onRemove,
  sensors,
  onDragStart,
  onDragEnd,
}: {
  resources: Resource[];
  loading: boolean;
  error: string | null;
  onAddClick: () => void;
  onEdit: (r: Resource) => void;
  onRemove: (id: number) => Promise<void>;
  sensors: ReturnType<typeof useSensors>;
  onDragStart: () => void;
  onDragEnd: (e: DragEndEvent) => void;
}) {
  const quickAdd: { label: string; icon: JSX.Element; from: string; to: string; enabled: boolean }[] = [
    { label: 'Link', icon: <LinkIcon size={16} strokeWidth={2.4} />, from: '#7c3aed', to: '#a855f7', enabled: true },
    { label: 'Image', icon: <ImageIcon size={16} strokeWidth={2.4} />, from: '#06b6d4', to: '#3b82f6', enabled: false },
    { label: 'Video', icon: <Video size={16} strokeWidth={2.4} />, from: '#ec4899', to: '#f97316', enabled: false },
    { label: 'File / PDF', icon: <FileText size={16} strokeWidth={2.4} />, from: '#84cc16', to: '#10b981', enabled: false },
    { label: 'Header', icon: <Sparkles size={16} strokeWidth={2.4} />, from: '#f59e0b', to: '#ec4899', enabled: false },
  ];

  return (
    <>
      <div className="em-card">
        <h2 className="em-card-title">
          <Plus size={16} strokeWidth={2.4} style={{ color: '#7c3aed' }} />
          Quick add
        </h2>
        <p className="em-card-subtitle">Pick a content type — it'll appear at the bottom of your list</p>
        <div className="em-quickadd">
          {quickAdd.map((q) => (
            <button
              key={q.label}
              type="button"
              className={`em-quickadd-btn${q.enabled ? '' : ' pm-btn-disabled'}`}
              onClick={q.enabled ? onAddClick : undefined}
              disabled={!q.enabled}
              title={q.enabled ? undefined : 'Coming soon'}
            >
              <span className="em-quickadd-icon" style={{ '--em-qa-from': q.from, '--em-qa-to': q.to } as CSSProperties}>
                {q.icon}
              </span>
              <span className="em-quickadd-label">{q.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="em-card">
        <h2 className="em-card-title">
          <LinkIcon size={16} strokeWidth={2.4} style={{ color: '#7c3aed' }} />
          Your links
        </h2>
        <p className="em-card-subtitle">Drag to reorder · click a link to edit its title, URL & color</p>

        {error && <p className="text-red-500 text-sm mb-2">Error loading links: {error}</p>}

        {loading ? (
          <div className="text-center py-8 text-sm" style={{ color: 'var(--pm-mute)' }}>
            Loading links…
          </div>
        ) : resources.length === 0 ? (
          <div className="text-center py-8 text-sm" style={{ color: 'var(--pm-mute)' }}>
            No links yet. Use “Link” above to add one.
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={onDragStart}
            onDragEnd={onDragEnd}
          >
            <SortableContext items={resources.map((r) => r.id)} strategy={verticalListSortingStrategy}>
              <div className="em-links">
                {resources.map((r) => (
                  <SortableLinkRow key={r.id} resource={r} onEdit={onEdit} onRemove={onRemove} />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </div>
    </>
  );
}

// ─── Design tab ───────────────────────────────────────────────────────────────

function DesignTab({
  page,
  onChange,
  onOpenImage,
}: {
  page: Page;
  onChange: (p: Page) => void;
  onOpenImage: () => void;
}) {
  const c = page.content;
  const setContent = (patch: Partial<Page['content']>) =>
    onChange({ ...page, content: { ...page.content, ...patch } });

  const bgType = c.backgroundType || 'color';

  const [cookies] = useCookies(['token']);
  const bgInputRef = useRef<HTMLInputElement>(null);
  const [bgUploading, setBgUploading] = useState(false);

  const uploadBackground = async (file?: File | null) => {
    if (!file) return;
    setBgUploading(true);
    try {
      const { url } = await uploadImageToS3(cookies.token, file);
      setContent({ backgroundType: 'image', backgroundImage: url });
    } catch (e) {
      console.error('Background upload failed', e);
    } finally {
      setBgUploading(false);
    }
  };

  return (
    <div className="em-design-grid">
      {/* Profile */}
      <div className="em-card">
        <h2 className="em-card-title">Profile</h2>
        <p className="em-card-subtitle">Avatar, name and tagline shown at the top of your page</p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 14 }}>
          {c.profileImage ? (
            <img
              src={c.profileImage}
              alt="Profile"
              style={{ width: 56, height: 56, borderRadius: '50%', objectFit: 'cover' }}
            />
          ) : (
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: '50%',
                background: 'linear-gradient(135deg,#7c3aed,#ec4899)',
                display: 'grid',
                placeItems: 'center',
                color: '#fff',
                fontWeight: 700,
                fontSize: 22,
              }}
            >
              {(page.title || '★').charAt(0).toUpperCase()}
            </div>
          )}
          <div style={{ display: 'flex', gap: 8 }}>
            <button type="button" className="pm-btn pm-btn-ghost pm-btn-sm" onClick={onOpenImage}>
              {c.profileImage ? 'Change' : 'Add image'}
            </button>
            {c.profileImage && (
              <button
                type="button"
                className="pm-btn pm-btn-ghost pm-btn-sm"
                onClick={() => setContent({ profileImage: undefined })}
              >
                Remove
              </button>
            )}
          </div>
        </div>
        <div className="em-pop-section">
          <div className="em-pop-label">Title</div>
          <input
            className="em-text-input"
            maxLength={40}
            value={page.title}
            onChange={(e) => onChange({ ...page, title: e.target.value })}
          />
        </div>
        <div className="em-pop-section">
          <div className="em-pop-label">Tagline</div>
          <input
            className="em-text-input"
            maxLength={40}
            value={page.description || ''}
            onChange={(e) => onChange({ ...page, description: e.target.value })}
          />
        </div>
      </div>

      {/* Background */}
      <div className="em-card">
        <h2 className="em-card-title">Background</h2>
        <p className="em-card-subtitle">Solid color, gradient, or a full-bleed image</p>
        <div className="em-pop-segmented" style={{ marginBottom: 12 }}>
          <button
            type="button"
            className={`em-pop-seg${bgType === 'gradient' ? ' em-pop-seg--on' : ''}`}
            onClick={() => setContent({ backgroundType: 'gradient' })}
          >
            Gradient
          </button>
          <button
            type="button"
            className={`em-pop-seg${bgType === 'color' ? ' em-pop-seg--on' : ''}`}
            onClick={() => setContent({ backgroundType: 'color' })}
          >
            Solid
          </button>
          <button
            type="button"
            className={`em-pop-seg${bgType === 'image' ? ' em-pop-seg--on' : ''}`}
            onClick={() => (c.backgroundImage ? setContent({ backgroundType: 'image' }) : bgInputRef.current?.click())}
          >
            Image
          </button>
          <button type="button" className="em-pop-seg pm-btn-disabled" disabled title="Coming soon">
            Pattern
          </button>
        </div>

        <input
          ref={bgInputRef}
          type="file"
          accept="image/png,image/jpeg,image/gif,image/webp"
          hidden
          onChange={(e) => {
            uploadBackground(e.target.files?.[0]);
            e.target.value = '';
          }}
        />

        {bgType === 'image' ? (
          <div>
            {c.backgroundImage && (
              <div
                style={{
                  height: 120,
                  borderRadius: 12,
                  backgroundImage: `linear-gradient(rgba(0,0,0,0.35),rgba(0,0,0,0.55)), url("${c.backgroundImage}")`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  marginBottom: 10,
                }}
              />
            )}
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                type="button"
                className="pm-btn pm-btn-ghost pm-btn-sm"
                onClick={() => bgInputRef.current?.click()}
                disabled={bgUploading}
              >
                {bgUploading ? 'Uploading…' : c.backgroundImage ? 'Replace image' : 'Upload image'}
              </button>
              {c.backgroundImage && (
                <button
                  type="button"
                  className="pm-btn pm-btn-ghost pm-btn-sm"
                  onClick={() => setContent({ backgroundType: 'gradient', backgroundImage: undefined })}
                >
                  Remove
                </button>
              )}
            </div>
          </div>
        ) : bgType === 'color' ? (
          <div className="em-color-row">
            <input
              type="color"
              className="em-color-input"
              value={c.backgroundColor || '#ffffff'}
              onChange={(e) => setContent({ backgroundColor: e.target.value })}
            />
            <span style={{ fontSize: 12, color: 'var(--pm-mute)' }}>
              {(c.backgroundColor || '#ffffff').toUpperCase()}
            </span>
          </div>
        ) : (
          <>
            <div className="em-color-row">
              <input
                type="color"
                className="em-color-input"
                value={c.gradientStart || '#7c3aed'}
                onChange={(e) => setContent({ gradientStart: e.target.value })}
              />
              <input
                type="color"
                className="em-color-input"
                value={c.gradientEnd || '#ec4899'}
                onChange={(e) => setContent({ gradientEnd: e.target.value })}
              />
            </div>
            <div className="em-pop-section">
              <div className="em-pop-label">Direction</div>
              <select
                className="em-text-input"
                value={c.gradientDirection || 'to bottom'}
                onChange={(e) =>
                  setContent({ gradientDirection: e.target.value as Page['content']['gradientDirection'] })
                }
              >
                {GRADIENT_DIRECTIONS.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.title}
                  </option>
                ))}
              </select>
            </div>
          </>
        )}

        {bgType !== 'image' && (
          <div className="em-bg-presets" style={{ marginTop: 12 }}>
            {BG_PRESETS.map((p) => {
              const swatch =
                p.type === 'gradient' ? `linear-gradient(160deg, ${p.start}, ${p.end})` : p.color;
              const apply = () =>
                p.type === 'gradient'
                  ? setContent({ backgroundType: 'gradient', gradientStart: p.start, gradientEnd: p.end })
                  : setContent({ backgroundType: 'color', backgroundColor: p.color });
              return (
                <button
                  key={p.name}
                  type="button"
                  className="em-bg-swatch"
                  style={{ '--em-bg-swatch': swatch } as CSSProperties}
                  onClick={apply}
                  title={p.name}
                />
              );
            })}
          </div>
        )}
      </div>

      {/* Typography */}
      <div className="em-card">
        <h2 className="em-card-title">Typography</h2>
        <p className="em-card-subtitle">Font and text color</p>
        <div className="em-pop-section">
          <div className="em-pop-label">Font family</div>
          <select
            className="em-text-input"
            value={c.fontFamily || 'rubik'}
            onChange={(e) => setContent({ fontFamily: e.target.value })}
          >
            {FONT_OPTIONS.map((f) => (
              <option key={f.id} value={f.id}>
                {f.title}
              </option>
            ))}
          </select>
        </div>
        <div className="em-pop-section">
          <div className="em-pop-label">Text color</div>
          <div className="em-color-row">
            <input
              type="color"
              className="em-color-input"
              value={c.textColor || '#000000'}
              onChange={(e) => setContent({ textColor: e.target.value })}
            />
            <span style={{ fontSize: 12, color: 'var(--pm-mute)' }}>{(c.textColor || '#000000').toUpperCase()}</span>
          </div>
        </div>
        <div className="em-pop-section">
          <div className="em-pop-label">Heading weight</div>
          <div className="em-pop-segmented">
            {['Light', 'Regular', 'Bold', 'Black'].map((w, i) => (
              <button
                key={w}
                type="button"
                className={`em-pop-seg pm-btn-disabled${i === 2 ? ' em-pop-seg--on' : ''}`}
                disabled
                title="Coming soon"
              >
                {w}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Default button style */}
      <div className="em-card">
        <h2 className="em-card-title">Button style</h2>
        <p className="em-card-subtitle">Shape and text color applied to every button</p>
        <div className="em-pop-section">
          <div className="em-pop-label">Shape</div>
          <div className="em-shape-row">
            {SHAPE_OPTIONS.map((s) => (
              <button
                key={s.id}
                type="button"
                className={`em-shape-btn${c.button === s.id ? ' em-shape-btn--on' : ''}`}
                onClick={() => setContent({ button: s.id })}
              >
                <div className="em-shape-preview" style={{ borderRadius: s.radius }} />
                <span>{s.title}</span>
              </button>
            ))}
          </div>
        </div>
        <div className="em-pop-section">
          <div className="em-pop-label">Button text color</div>
          <div className="em-color-row">
            <input
              type="color"
              className="em-color-input"
              value={c.buttonColor || '#ffffff'}
              onChange={(e) => setContent({ buttonColor: e.target.value })}
            />
            <span style={{ fontSize: 12, color: 'var(--pm-mute)' }}>
              {(c.buttonColor || '#ffffff').toUpperCase()}
            </span>
          </div>
        </div>
        <div className="em-pop-section">
          <div className="em-pop-label">Quick fill presets</div>
          <div className="em-color-presets" style={{ gridTemplateColumns: 'repeat(8, 1fr)' }}>
            {COLOR_PRESETS.map((col) => (
              <button
                key={col}
                type="button"
                className="em-color-swatch"
                style={{ '--em-swatch': col } as CSSProperties}
                onClick={() => setContent({ buttonColor: col })}
                aria-label={col}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Density (stub) */}
      <div className="em-card">
        <h2 className="em-card-title">Density</h2>
        <p className="em-card-subtitle">Spacing between buttons</p>
        <div className="em-pop-segmented">
          {['Compact', 'Regular', 'Comfortable'].map((d, i) => (
            <button
              key={d}
              type="button"
              className={`em-pop-seg pm-btn-disabled${i === 1 ? ' em-pop-seg--on' : ''}`}
              disabled
              title="Coming soon"
            >
              {d}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Social tab ───────────────────────────────────────────────────────────────

function SocialTab({ page, onChange }: { page: Page; onChange: (p: Page) => void }) {
  const social = page.content.social || {};
  const isActive = (id: string) => SUPPORTED.includes(id as SocialKey) && social[id as SocialKey] !== undefined;

  const setSocial = (next: Page['content']['social']) =>
    onChange({ ...page, content: { ...page.content, social: next } });

  const toggle = (id: string) => {
    if (!SUPPORTED.includes(id as SocialKey)) return; // stub platforms aren't stored
    const key = id as SocialKey;
    const next = { ...social };
    if (next[key] !== undefined) delete next[key];
    else next[key] = '';
    setSocial(next);
  };

  const setUrl = (key: SocialKey, url: string) => setSocial({ ...social, [key]: url });
  const remove = (key: SocialKey) => {
    const next = { ...social };
    delete next[key];
    setSocial(next);
  };

  const activeKeys = SUPPORTED.filter((k) => social[k] !== undefined);

  return (
    <>
      <div className="em-card">
        <h2 className="em-card-title">Add platforms</h2>
        <p className="em-card-subtitle">
          Tap to add or remove. The first five save to your page; the rest are coming soon.
        </p>
        <div className="em-platform-grid">
          {PLATFORMS.map((p) => {
            const supported = SUPPORTED.includes(p.id as SocialKey);
            return (
              <button
                key={p.id}
                type="button"
                className={`em-platform-btn${isActive(p.id) ? ' em-platform-btn--added' : ''}${supported ? '' : ' pm-btn-disabled'}`}
                onClick={() => toggle(p.id)}
                disabled={!supported}
                title={supported ? undefined : 'Coming soon'}
              >
                <span className="em-social-icon" style={{ background: p.color, fontWeight: 700 }}>
                  {p.icon}
                </span>
                <span className="em-platform-name">{p.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="em-card">
        <h2 className="em-card-title">Your social icons</h2>
        <p className="em-card-subtitle">Enter the URL for each platform you've added</p>
        {activeKeys.length === 0 ? (
          <div style={{ padding: 22, color: 'var(--pm-mute)', textAlign: 'center', fontSize: 13 }}>
            Tap a platform above to add it.
          </div>
        ) : (
          activeKeys.map((key) => {
            const p = PLATFORMS.find((x) => x.id === key)!;
            return (
              <div key={key} className="em-social-row">
                <span className="em-social-icon" style={{ background: p.color, fontWeight: 700, borderRadius: '50%' }}>
                  {p.icon}
                </span>
                <input
                  className="em-text-input"
                  placeholder={`Your ${p.name} URL`}
                  value={social[key] || ''}
                  onChange={(e) => setUrl(key, e.target.value)}
                />
                <button type="button" className="em-link-menu" onClick={() => remove(key)} title="Remove">
                  <Trash2 size={13} strokeWidth={2} />
                </button>
              </div>
            );
          })
        )}
      </div>
    </>
  );
}

// ─── Analytics tab (visual stub) ──────────────────────────────────────────────

function AnalyticsTab({ resources }: { resources: Resource[] }) {
  const rows = resources.map((r) => ({
    title: r.linkable.title || extractDomain(r.linkable.original_url),
    color: r.color || '#3b82f6',
    clicks: r.linkable.clicks_count ?? 0,
  }));
  const total = rows.reduce((s, r) => s + r.clicks, 0);
  const top = [...rows].sort((a, b) => b.clicks - a.clicks)[0];

  return (
    <>
      <div className="em-an-toolbar">
        <div className="em-pop-segmented">
          {['7d', '30d', '90d', 'All'].map((t, i) => (
            <button key={t} type="button" className={`em-pop-seg pm-btn-disabled${i === 1 ? ' em-pop-seg--on' : ''}`} disabled title="Coming soon">
              {t}
            </button>
          ))}
        </div>
        <button type="button" className="pm-btn pm-btn-ghost pm-btn-sm pm-btn-disabled" disabled title="Coming soon">
          <Download size={12} strokeWidth={2} />
          Export CSV
        </button>
      </div>

      <div className="em-an-stats">
        <div className="em-an-stat">
          <div className="em-an-stat-label">Total link clicks</div>
          <div className="em-an-stat-value" style={{ color: '#7c3aed' }}>{total.toLocaleString()}</div>
          <div className="em-an-stat-sub">all time</div>
        </div>
        <div className="em-an-stat">
          <div className="em-an-stat-label">Links</div>
          <div className="em-an-stat-value" style={{ color: '#06b6d4' }}>{rows.length}</div>
          <div className="em-an-stat-sub">on this page</div>
        </div>
        <div className="em-an-stat">
          <div className="em-an-stat-label">Top button</div>
          <div className="em-an-stat-value" style={{ color: '#ec4899' }}>
            {top?.title.split(' ').slice(0, 2).join(' ') ?? '—'}
          </div>
          <div className="em-an-stat-sub">{top ? `${top.clicks} clicks` : '—'}</div>
        </div>
        <div className="em-an-stat">
          <div className="em-an-stat-label">Page views</div>
          <div className="em-an-stat-value" style={{ color: '#84cc16' }}>—</div>
          <div className="em-an-stat-sub">coming soon</div>
        </div>
      </div>

      <div className="em-card" style={{ padding: 0 }}>
        <table className="em-an-table">
          <thead>
            <tr>
              <th style={{ width: '50%' }}>Button</th>
              <th>Status</th>
              <th>Clicks</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {[...rows]
              .sort((a, b) => b.clicks - a.clicks)
              .map((r, i) => (
                <tr key={i}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span
                        className="em-link-icon"
                        style={{ '--em-link-bg': r.color, width: 28, height: 28, fontSize: 13, borderRadius: 8 } as CSSProperties}
                      />
                      <span style={{ fontWeight: 600 }}>{r.title}</span>
                    </div>
                  </td>
                  <td>
                    <span className="em-status-pill em-status-live">● Active</span>
                  </td>
                  <td style={{ fontWeight: 700 }}>{r.clicks.toLocaleString()}</td>
                  <td>
                    <button type="button" className="em-evolve-link pm-btn-disabled" disabled>
                      View evolution
                    </button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

// ─── Top-level editor ─────────────────────────────────────────────────────────

const SinglePage = () => {
  const { lookup_code } = useParams();
  const [cookies] = useCookies(['token']);
  const [page, setPage] = useState<Page | null>(null);
  const [, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [lastSavedPageState, setLastSavedPageState] = useState<Page | null>(null);

  const [tab, setTab] = useState<TabKey>('content');
  const [device, setDevice] = useState<'mobile' | 'desktop'>('mobile');
  const [copied, setCopied] = useState(false);
  const [publishing, setPublishing] = useState(false);

  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingResource, setEditingResource] = useState<Resource | null>(null);

  const {
    resources,
    loading: resourcesLoading,
    error: resourcesError,
    remove: removeResource,
    update: updateResource,
    reorder: reorderResources,
    refetch: refetchResources,
  } = useResources(lookup_code);

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const [isDragging, setIsDragging] = useState(false);
  useEffect(() => {
    document.body.style.overflow = isDragging ? 'hidden' : '';
    document.body.style.touchAction = isDragging ? 'none' : '';
    return () => {
      document.body.style.overflow = '';
      document.body.style.touchAction = '';
    };
  }, [isDragging]);

  // ── Load page ────────────────────────────────────────────────────────────
  useEffect(() => {
    const fetchPage = async () => {
      try {
        const res: Page = await getPage(cookies.token, lookup_code);
        setPage(res);
        setLastSavedPageState(res);
        setHasUnsavedChanges(false);
      } catch (error) {
        console.error(error);
        setError('An error occurred while fetching page.');
      }
    };
    if (cookies.token) fetchPage();
  }, [cookies.token, lookup_code]);

  // The editor's preview panel is portrait, so portfolio pages preview best in
  // the mobile viewport by default (fills it); desktop stays one tap away.
  useEffect(() => {
    if (page?.content?.template === 'portfolio') setDevice('mobile');
  }, [page?.content?.template]);

  // ── Save plumbing ──────────────────────────────────────────────────────────
  const hasPageChanged = useCallback((cur: Page, saved: Page | null): boolean => {
    if (!saved) return true;
    return (
      cur.title !== saved.title ||
      cur.description !== saved.description ||
      JSON.stringify(cur.content) !== JSON.stringify(saved.content)
    );
  }, []);

  const handleSave = useCallback(
    async (force = false) => {
      if (!page || !cookies.token) return;
      if (!force && !hasPageChanged(page, lastSavedPageState)) return;
      if ((page.title && page.title.length > 40) || (page.description && page.description.length > 40)) {
        setError('Title and description must be 40 characters or less.');
        return;
      }
      setIsLoading(true);
      setError('');
      try {
        const updated = await updatePage(cookies.token, lookup_code, {
          title: page.title,
          description: page.description,
          content: page.content,
        });
        setPage((prev) => ({ ...(prev as Page), ...updated }));
        setLastSavedPageState((prev) => ({ ...(prev as Page), ...updated }));
        setHasUnsavedChanges(false);
      } catch (error) {
        console.error('Error updating page:', error);
        setError(error instanceof Error ? error.message : 'An error occurred while saving the page.');
      } finally {
        setIsLoading(false);
      }
    },
    [page, cookies.token, lookup_code, hasPageChanged, lastSavedPageState],
  );

  // Auto-save 3s after the last change
  useEffect(() => {
    if (!hasUnsavedChanges || !page) return;
    const t = setTimeout(() => handleSave(false), 3000);
    return () => clearTimeout(t);
  }, [hasUnsavedChanges, handleSave, page]);

  // Cmd/Ctrl+S
  useEffect(() => {
    const onKeyDown = (e: globalThis.KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault();
        handleSave(true);
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [handleSave]);

  const handlePageChange = useCallback(
    (updated: Page) => {
      setPage(updated);
      setHasUnsavedChanges(hasPageChanged(updated, lastSavedPageState));
    },
    [lastSavedPageState, hasPageChanged],
  );

  // ── Publish / unpublish ────────────────────────────────────────────────────
  const handlePublishToggle = useCallback(async () => {
    if (!page || !cookies.token || publishing) return;
    setPublishing(true);
    try {
      const isPublished = !!page.published_url;
      if (isPublished) {
        if (!page.published_lookup_code) return;
        if (!confirm('Unpublish this page? It will no longer be accessible via its public URL.')) return;
        const res = await unpublishPage(cookies.token, page.published_lookup_code);
        if (res.success && res.data) {
          const next = { ...page, ...res.data };
          setPage(next);
          setLastSavedPageState(next);
        }
      } else {
        const res = await publishPage(cookies.token, page.lookup_code);
        if (res.success && res.data) {
          const next = { ...page, ...res.data };
          setPage(next);
          setLastSavedPageState(next);
        }
      }
    } catch (e) {
      console.error('Publish toggle failed:', e);
    } finally {
      setPublishing(false);
    }
  }, [page, cookies.token, publishing]);

  // ── Drag reorder ───────────────────────────────────────────────────────────
  const handleDragEnd = async (event: DragEndEvent) => {
    setIsDragging(false);
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = resources.findIndex((r) => r.id === active.id);
    const newIndex = resources.findIndex((r) => r.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;
    const reordered = arrayMove(resources, oldIndex, newIndex);
    try {
      await reorderResources(reordered.map((r, i) => ({ id: r.id, sort_order: i })));
    } catch (e) {
      console.error('Error reordering resources:', e);
    }
  };

  // ── Resizable preview ──────────────────────────────────────────────────────
  const [previewW, setPreviewW] = useState<number>(() => {
    const stored = Number(localStorage.getItem('em-preview-w'));
    return Number.isFinite(stored) && stored >= 280 && stored <= 680 ? stored : 380;
  });
  const dragging = useRef(false);
  useEffect(() => {
    localStorage.setItem('em-preview-w', String(previewW));
  }, [previewW]);

  const onHandleDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      dragging.current = true;
      const startX = e.clientX;
      const startW = previewW;
      const onMove = (ev: MouseEvent) => {
        if (!dragging.current) return;
        const delta = startX - ev.clientX;
        setPreviewW(Math.max(280, Math.min(680, startW + delta)));
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

  // ── Preview links from resources ────────────────────────────────────────────
  const pageLinks: PageLink[] = useMemo(
    () =>
      (resources || []).map((r) => ({
        id: r.linkable.lookup_code,
        label: r.linkable.title || extractDomain(r.linkable.original_url),
        link: `${API_URL}/${r.linkable.lookup_code}`,
        color: r.color || '#3b82f6',
        description: r.linkable.description || undefined,
      })),
    [resources],
  );

  const socialsCount = useMemo(
    () => (page ? Object.values(page.content.social || {}).filter((v) => v !== undefined).length : 0),
    [page],
  );

  const copyUrl = () => {
    const url = page?.published_url || `https://thin.ly/${page?.lookup_code}`;
    navigator.clipboard?.writeText(url).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  if (!page) {
    return (
      <MainLayout>
        <div className="pm-shell" style={{ display: 'grid', placeItems: 'center', minHeight: '60vh' }}>
          <p style={{ color: 'var(--pm-mute)' }}>Loading page…</p>
        </div>
      </MainLayout>
    );
  }

  const saved = !hasUnsavedChanges && !isLoading;
  const slugUrl = (page.published_url || `https://thin.ly/${page.lookup_code}`).replace('https://', '');
  const isPortfolio = page.content.template === 'portfolio';

  if (isPortfolio) {
    return (
      <MainLayout>
        <div className="em-shell pm-shell" style={{ padding: 0 }}>
          <TopBar
            page={page}
            onTitleChange={(t) => handlePageChange({ ...page, title: t })}
            saved={saved}
            onPublish={handlePublishToggle}
            publishing={publishing}
          />
          <div className="em-body" style={{ '--em-preview-w': `${previewW}px` } as CSSProperties}>
            <div className="em-center">
              <PortfolioEditor page={page} onChange={handlePageChange} />
            </div>
            <div className="em-right">
              <div className="em-handle" onMouseDown={onHandleDown} aria-label="Resize preview" title="Drag to resize preview" />
              <div className="em-preview-head">
                <div className="em-device">
                  <button type="button" className={`em-device-btn${device === 'mobile' ? ' em-device-btn--active' : ''}`} onClick={() => setDevice('mobile')} title="Mobile">
                    <Smartphone size={14} strokeWidth={2} />
                  </button>
                  <button type="button" className={`em-device-btn${device === 'desktop' ? ' em-device-btn--active' : ''}`} onClick={() => setDevice('desktop')} title="Desktop">
                    <Monitor size={14} strokeWidth={2} />
                  </button>
                </div>
                <button type="button" className="em-preview-url" onClick={copyUrl}>
                  {copied ? <Check size={12} /> : <Copy size={12} />}
                  {slugUrl}
                </button>
              </div>
              <div className="em-preview-stage">
                {device === 'mobile' ? (
                  <div className="em-dev-phone">
                    <div className="em-dev-notch" />
                    <div className="em-dev-screen">
                      <PortfolioPreview
                        title={page.title}
                        description={page.description}
                        content={page.content}
                        device="mobile"
                        className="em-dev-fill"
                      />
                      <div className="em-dev-shine" />
                    </div>
                  </div>
                ) : (
                  <div className="em-dev-browser">
                    <div className="em-dev-bar">
                      <span /><span /><span />
                      <span className="em-dev-url">{slugUrl}</span>
                    </div>
                    <PortfolioPreview
                      title={page.title}
                      description={page.description}
                      content={page.content}
                      device="desktop"
                      className="em-dev-fill"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        <ImageUploadModal
          isOpen={isImageModalOpen}
          onClose={() => setIsImageModalOpen(false)}
          onSave={(imageUrl) => handlePageChange({ ...page, content: { ...page.content, profileImage: imageUrl || undefined } })}
          currentImage={page.content.profileImage}
        />
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="em-shell pm-shell" style={{ padding: 0 }}>
        <TopBar
          page={page}
          onTitleChange={(t) => handlePageChange({ ...page, title: t })}
          saved={saved}
          onPublish={handlePublishToggle}
          publishing={publishing}
        />
        <TabBar active={tab} onChange={setTab} linksCount={resources.length} socialsCount={socialsCount} />

        <div className="em-body" style={{ '--em-preview-w': `${previewW}px` } as CSSProperties}>
          <div className="em-center">
            {tab === 'content' && (
              <ContentTab
                resources={resources}
                loading={resourcesLoading}
                error={resourcesError}
                onAddClick={() => setIsLinkModalOpen(true)}
                onEdit={(r) => {
                  setEditingResource(r);
                  setIsEditModalOpen(true);
                }}
                onRemove={removeResource}
                sensors={sensors}
                onDragStart={() => setIsDragging(true)}
                onDragEnd={handleDragEnd}
              />
            )}
            {tab === 'design' && (
              <DesignTab page={page} onChange={handlePageChange} onOpenImage={() => setIsImageModalOpen(true)} />
            )}
            {tab === 'social' && <SocialTab page={page} onChange={handlePageChange} />}
            {tab === 'analytics' && <AnalyticsTab resources={resources} />}
          </div>

          <div className="em-right">
            <div className="em-handle" onMouseDown={onHandleDown} aria-label="Resize preview" title="Drag to resize preview" />

            <div className="em-preview-head">
              <div className="em-device">
                <button
                  type="button"
                  className={`em-device-btn${device === 'mobile' ? ' em-device-btn--active' : ''}`}
                  onClick={() => setDevice('mobile')}
                  title="Mobile"
                >
                  <Smartphone size={14} strokeWidth={2} />
                </button>
                <button
                  type="button"
                  className={`em-device-btn${device === 'desktop' ? ' em-device-btn--active' : ''}`}
                  onClick={() => setDevice('desktop')}
                  title="Desktop"
                >
                  <Monitor size={14} strokeWidth={2} />
                </button>
              </div>
              <button type="button" className="em-preview-url" onClick={copyUrl}>
                {copied ? <Check size={12} /> : <Copy size={12} />}
                {slugUrl}
              </button>
            </div>

            <div className="em-preview-stage">
              <div className="em-preview-phone">
                <div className="pm-phone-notch" />
                <div className="pm-phone-screen">
                  <div className="pm-phone-screen-inner">
                    <Preview
                      title={page.title}
                      description={page.description}
                      content={page.content}
                      links={pageLinks}
                    />
                  </div>
                  <div className="pm-phone-shine" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <ImageUploadModal
        isOpen={isImageModalOpen}
        onClose={() => setIsImageModalOpen(false)}
        onSave={(imageUrl) =>
          handlePageChange({ ...page, content: { ...page.content, profileImage: imageUrl || undefined } })
        }
        currentImage={page.content.profileImage}
        title={page.content.profileImage ? 'Edit image' : 'Add image'}
      />

      <AddLinkModal
        isOpen={isLinkModalOpen}
        onClose={() => setIsLinkModalOpen(false)}
        lookupCode={lookup_code}
        onAddResource={async () => {
          await refetchResources();
        }}
      />

      {editingResource && (
        <EditLinkModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setEditingResource(null);
          }}
          resource={editingResource}
          onUpdate={updateResource}
        />
      )}
    </MainLayout>
  );
};

export default SinglePage;
