/**
 * CreatePage — AI-driven page creation wizard (/pages/create).
 * Describe the page in natural language → Claude generates a full design
 * (theme, copy, link buttons, socials) → live preview → refine → create.
 *
 * Generation is server-side (POST /api/v1/brand_pages/generate, backed by
 * Claude). On "Create", the spec is persisted via the normal createPage +
 * resources APIs, then we jump straight into the editor.
 */
import { createPage, generatePage } from '@/apis/pages';
import { createResource } from '@/apis/resources';
import { uploadImageToS3 } from '@/apis/uploads';
import MainLayout from '@/components/layouts/MainLayout';
import Preview from '@/components/sections/Preview';
import PortfolioPreview from '@/components/sections/PortfolioPreview';
import { useNotification } from '@/Notifications';
import { PAGES_ROUTE } from '@/routes';
import type { Page, PageLink } from '@/types';
import { ArrowLeft, ImagePlus, Paperclip, RefreshCw, Sparkles, Wand2, X } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useCookies } from 'react-cookie';
import { useNavigate } from 'react-router-dom';

import '@/components/pages-mockup/pages-mockup.css';
import '@/components/pages-mockup/create-wizard.css';

// Shape returned by the generate endpoint.
type GeneratedLink = { title: string; url: string; color: string };
type GeneratedSpec = {
  title: string;
  description?: string;
  content: Page['content'];
  links?: GeneratedLink[];
  social?: Page['content']['social'];
};

type TemplateKind = 'links' | 'portfolio';

const EXAMPLES = [
  'An indie coffee roastery in Portland — warm and earthy. Links to the online shop, the cafe menu, wholesale enquiries, and Instagram.',
  "A techno DJ's link page — dark and neon. Links to Spotify, SoundCloud, upcoming gigs, and a booking email.",
  'A wedding photographer — soft, elegant, romantic. Portfolio, packages, booking calendar, and Instagram.',
  'A SaaS product launch — clean and modern. Demo video, pricing, docs, and a join-the-waitlist button.',
  'A personal trainer — bold and energetic. Free workout plan, 1:1 coaching, transformation gallery, TikTok.',
];

type Stage = 'compose' | 'generating' | 'result';

// Soft cap: typing past it is allowed, but a counter appears and generation is
// blocked until trimmed. Kept invisible below the cap so the field feels limitless.
const MAX_PROMPT = 500;

const CreatePage = () => {
  const [cookies] = useCookies(['token']);
  const navigate = useNavigate();
  const { addNotification } = useNotification();

  const [stage, setStage] = useState<Stage>('compose');
  const [template, setTemplate] = useState<TemplateKind>('links');
  const [prompt, setPrompt] = useState('');
  const [name, setName] = useState('');
  const [refine, setRefine] = useState('');
  const [spec, setSpec] = useState<GeneratedSpec | null>(null);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');

  // Up to 3 reference images. Each is an optimistic attachment "chip" (Anthropic
  // style) that shows a preview + progress immediately, then resolves to its S3
  // key/url once the direct upload finishes.
  type Upload = {
    id: string;
    name: string;
    previewUrl: string;
    status: 'uploading' | 'done' | 'error';
    key?: string;
    url?: string;
    error?: string;
  };
  const [uploads, setUploads] = useState<Upload[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dragDepth = useRef(0);

  const MAX_IMAGES = 3;
  const activeCount = uploads.filter((u) => u.status !== 'error').length;
  const isUploading = uploads.some((u) => u.status === 'uploading');
  const readyImages = uploads
    .filter((u) => u.status === 'done' && u.key && u.url)
    .map((u) => ({ key: u.key as string, url: u.url as string }));

  const handleFiles = (files: File[] | FileList | null) => {
    if (!files) return;
    const list = Array.from(files).filter((f) => f.type.startsWith('image/'));
    const room = MAX_IMAGES - activeCount;
    if (room <= 0 || list.length === 0) return;
    setError('');

    for (const file of list.slice(0, room)) {
      const id = `${file.name}-${file.size}-${Math.random().toString(36).slice(2, 8)}`;
      const previewUrl = URL.createObjectURL(file);
      setUploads((prev) => [...prev, { id, name: file.name, previewUrl, status: 'uploading' }]);

      uploadImageToS3(cookies.token, file)
        .then(({ key, url }) =>
          setUploads((prev) =>
            prev.map((u) => (u.id === id ? { ...u, status: 'done', key, url } : u)),
          ),
        )
        .catch((e) =>
          setUploads((prev) =>
            prev.map((u) =>
              u.id === id ? { ...u, status: 'error', error: e instanceof Error ? e.message : 'Upload failed' } : u,
            ),
          ),
        );
    }
  };

  const removeUpload = (id: string) =>
    setUploads((prev) => {
      const target = prev.find((u) => u.id === id);
      if (target?.previewUrl) URL.revokeObjectURL(target.previewUrl);
      return prev.filter((u) => u.id !== id);
    });

  const onDragEnter = (e: React.DragEvent) => {
    if (!Array.from(e.dataTransfer.types || []).includes('Files')) return;
    e.preventDefault();
    dragDepth.current += 1;
    setDragActive(true);
  };
  const onDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    dragDepth.current -= 1;
    if (dragDepth.current <= 0) {
      dragDepth.current = 0;
      setDragActive(false);
    }
  };
  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    dragDepth.current = 0;
    setDragActive(false);
    handleFiles(e.dataTransfer.files);
  };
  const onPaste = (e: React.ClipboardEvent) => {
    const files = Array.from(e.clipboardData?.items || [])
      .filter((i) => i.type.startsWith('image/'))
      .map((i) => i.getAsFile())
      .filter((f): f is File => !!f);
    if (files.length) {
      e.preventDefault();
      handleFiles(files);
    }
  };

  const promptOverLimit = prompt.length > MAX_PROMPT;

  const runGenerate = async (fullPrompt: string) => {
    if (!fullPrompt.trim() || fullPrompt.length > MAX_PROMPT) return;
    setError('');
    setStage('generating');
    try {
      const result: GeneratedSpec = await generatePage(cookies.token, fullPrompt.trim(), name.trim(), readyImages, template);
      setSpec(result);
      setStage('result');
    } catch (e) {
      console.error(e);
      setError(e instanceof Error ? e.message : 'Generation failed. Please try again.');
      setStage(spec ? 'result' : 'compose');
    }
  };

  const onRefine = async () => {
    if (!refine.trim() || !spec) return;
    const combined = `${prompt}\n\nRefinement to apply to the existing design: ${refine.trim()}`;
    setRefine('');
    await runGenerate(combined);
  };

  const isPortfolio = spec?.content?.template === 'portfolio';

  const previewContent = useMemo<Page['content'] | null>(() => {
    if (!spec) return null;
    return { ...spec.content, social: spec.social ?? spec.content.social ?? {} };
  }, [spec]);

  const previewLinks = useMemo<PageLink[]>(() => {
    if (!spec) return [];
    return (spec.links ?? []).map((l, i) => ({
      id: String(i),
      label: l.title,
      color: l.color,
      link: l.url,
    }));
  }, [spec]);

  const createTheRealPage = async () => {
    if (!spec || !previewContent) return;
    setCreating(true);
    setError('');
    try {
      const page = await createPage(cookies.token, {
        brand_page: {
          title: spec.title,
          description: spec.description,
          content: previewContent,
        },
      });

      // Create the generated link buttons as resources, preserving order.
      // (Portfolio pages have no link resources — their content is self-contained.)
      const links = spec.links ?? [];
      for (let i = 0; i < links.length; i++) {
        const l = links[i];
        try {
          await createResource(cookies.token, page.lookup_code, {
            link: { original_url: l.url, title: l.title },
            resource: { sort_order: i, color: l.color },
          });
        } catch (linkErr) {
          console.error('Failed to create link', l, linkErr);
        }
      }

      addNotification('Page created with AI ✨', 'success');
      navigate(`${PAGES_ROUTE}/${page.lookup_code}`);
    } catch (e) {
      console.error(e);
      setError(e instanceof Error ? e.message : 'Could not create the page.');
      setCreating(false);
    }
  };

  return (
    <MainLayout>
      <div className="cw-shell">
        {stage === 'compose' && (
          <>
            <div className="cw-hero">
              <span className="cw-eyebrow">
                <Sparkles size={14} strokeWidth={2.5} /> AI page builder
              </span>
              <h1 className="cw-h1">
                Describe it. We'll <span className="cw-h1-accent">design it.</span>
              </h1>
              <p className="cw-subtitle">
                Tell us about your page in a sentence or two — Claude builds a complete,
                on-brand {template === 'portfolio' ? 'portfolio site' : 'link-in-bio'} you can preview, tweak, and publish.
              </p>
              <div className="cw-template-toggle">
                <button
                  type="button"
                  className={`cw-tpl${template === 'links' ? ' cw-tpl--on' : ''}`}
                  onClick={() => setTemplate('links')}
                >
                  🔗 Link-in-bio
                </button>
                <button
                  type="button"
                  className={`cw-tpl${template === 'portfolio' ? ' cw-tpl--on' : ''}`}
                  onClick={() => setTemplate('portfolio')}
                >
                  ✦ Portfolio site
                </button>
              </div>
            </div>

            <div
              className={`cw-composer${dragActive ? ' cw-composer--drag' : ''}`}
              onDragEnter={onDragEnter}
              onDragOver={(e) => {
                if (Array.from(e.dataTransfer.types || []).includes('Files')) e.preventDefault();
              }}
              onDragLeave={onDragLeave}
              onDrop={onDrop}
            >
              {dragActive && (
                <div className="cw-drop-overlay">
                  <ImagePlus size={26} strokeWidth={2} />
                  <span>Drop images to blend into your design</span>
                </div>
              )}

              <textarea
                className="cw-textarea"
                autoFocus
                placeholder="e.g. A link page for my ceramics studio — calm, minimal, earthy tones. Links to my shop, upcoming workshops, my newsletter, and Instagram."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onPaste={onPaste}
                onKeyDown={(e) => {
                  if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') runGenerate(prompt);
                }}
              />

              {promptOverLimit && (
                <div className="cw-counter" aria-live="polite">
                  {prompt.length}/{MAX_PROMPT}
                </div>
              )}

              {uploads.length > 0 && (
                <div className="cw-attachments">
                  {uploads.map((u) => (
                    <div
                      key={u.id}
                      className={`cw-attach${u.status === 'error' ? ' cw-attach--error' : ''}`}
                      title={u.status === 'error' ? u.error : u.name}
                    >
                      <div className="cw-attach-thumb" style={{ backgroundImage: `url("${u.previewUrl}")` }}>
                        {u.status === 'uploading' && <span className="cw-attach-spin" />}
                      </div>
                      <div className="cw-attach-meta">
                        <div className="cw-attach-name">{u.name}</div>
                        <div className="cw-attach-sub">
                          {u.status === 'uploading' ? 'Uploading…' : u.status === 'error' ? 'Failed' : 'Image'}
                        </div>
                      </div>
                      <button
                        type="button"
                        className="cw-attach-x"
                        onClick={() => removeUpload(u.id)}
                        aria-label="Remove image"
                      >
                        <X size={13} strokeWidth={2.5} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/gif,image/webp"
                multiple
                hidden
                onChange={(e) => {
                  handleFiles(e.target.files);
                  e.target.value = '';
                }}
              />

              <div className="cw-composer-foot">
                <button
                  type="button"
                  className="cw-attach-btn"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={activeCount >= MAX_IMAGES}
                  title={activeCount >= MAX_IMAGES ? 'Up to 3 images' : 'Attach images'}
                  aria-label="Attach images"
                >
                  <Paperclip size={18} strokeWidth={2} />
                </button>
                <input
                  className="cw-name-input"
                  placeholder="Page name (optional)"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
                <button
                  type="button"
                  className="cw-generate-btn"
                  onClick={() => runGenerate(prompt)}
                  disabled={!prompt.trim() || isUploading || promptOverLimit}
                >
                  <Wand2 size={17} strokeWidth={2.4} />
                  {isUploading ? 'Uploading…' : 'Generate my page'}
                </button>
              </div>
            </div>

            <div className="cw-examples">
              <div className="cw-examples-label">Need inspiration? Try one of these:</div>
              <div className="cw-chips">
                {EXAMPLES.map((ex) => (
                  <button key={ex} type="button" className="cw-chip" onClick={() => setPrompt(ex)}>
                    {ex.split(' — ')[0]}
                  </button>
                ))}
              </div>
            </div>

            {error && (
              <p className="cw-error" style={{ textAlign: 'center' }}>
                {error}
              </p>
            )}
          </>
        )}

        {stage === 'generating' && <GeneratingState template={template} />}

        {stage === 'result' && spec && previewContent && (
          <>
            <div className="cw-hero" style={{ marginBottom: 18 }}>
              <h1 className="cw-h1" style={{ fontSize: 'clamp(24px, 4vw, 34px)' }}>
                Here's your <span className="cw-h1-accent">page</span>
              </h1>
              <p className="cw-subtitle">Fine-tune the basics or ask for changes, then create it.</p>
            </div>

            <div className={`cw-result${isPortfolio ? ' cw-result--wide' : ''}`}>
              <div>
                <div className="cw-panel">
                  <h3 className="cw-panel-title">Basics</h3>
                  <div className="cw-field">
                    <label className="cw-field-label">Title</label>
                    <input
                      className="cw-input"
                      maxLength={40}
                      value={spec.title}
                      onChange={(e) => setSpec({ ...spec, title: e.target.value })}
                    />
                  </div>
                  <div className="cw-field" style={{ marginBottom: 0 }}>
                    <label className="cw-field-label">Tagline</label>
                    <input
                      className="cw-input"
                      maxLength={40}
                      value={spec.description ?? ''}
                      onChange={(e) => setSpec({ ...spec, description: e.target.value })}
                    />
                  </div>
                </div>

                {isPortfolio ? (
                  <div className="cw-panel">
                    <h3 className="cw-panel-title">What's inside</h3>
                    <div className="cw-linklist">
                      <div className="cw-link-chip">
                        <span className="cw-link-dot" style={{ background: spec.content.accent || '#e8541e' }} />
                        <div className="cw-link-meta">
                          <div className="cw-link-title">{spec.content.portfolio?.work?.length ?? 0} projects · {spec.content.portfolio?.capabilities?.length ?? 0} capabilities</div>
                          <div className="cw-link-url">{spec.content.portfolio?.eyebrow}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="cw-panel">
                    <h3 className="cw-panel-title">{(spec.links ?? []).length} generated links</h3>
                    <div className="cw-linklist">
                      {(spec.links ?? []).map((l, i) => (
                        <div key={i} className="cw-link-chip">
                          <span className="cw-link-dot" style={{ background: l.color }} />
                          <div className="cw-link-meta">
                            <div className="cw-link-title">{l.title}</div>
                            <div className="cw-link-url">{l.url}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="cw-panel">
                  <h3 className="cw-panel-title">Refine with AI</h3>
                  <div className="cw-refine-row">
                    <input
                      className="cw-input"
                      placeholder='e.g. "make it darker" or "add a podcast link"'
                      value={refine}
                      onChange={(e) => setRefine(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') onRefine();
                      }}
                    />
                    <button type="button" className="cw-ghost-btn" onClick={onRefine} disabled={!refine.trim()}>
                      <Sparkles size={15} strokeWidth={2.4} /> Apply
                    </button>
                  </div>
                </div>

                <div className="cw-actions">
                  <button type="button" className="cw-generate-btn" onClick={createTheRealPage} disabled={creating}>
                    {creating ? 'Creating…' : 'Create this page →'}
                  </button>
                  <button type="button" className="cw-ghost-btn" onClick={() => runGenerate(prompt)} disabled={creating}>
                    <RefreshCw size={15} strokeWidth={2.4} /> Regenerate
                  </button>
                  <button
                    type="button"
                    className="cw-ghost-btn"
                    onClick={() => {
                      setStage('compose');
                      setSpec(null);
                      setError('');
                    }}
                    disabled={creating}
                  >
                    <ArrowLeft size={15} strokeWidth={2.4} /> Start over
                  </button>
                </div>

                {error && <p className="cw-error">{error}</p>}
              </div>

              <div className="cw-preview-side">
                {isPortfolio ? (
                  <div className="cw-browser">
                    <div className="cw-browser-bar">
                      <span className="cw-dot" /><span className="cw-dot" /><span className="cw-dot" />
                      <span className="cw-browser-url">{spec.title.toLowerCase().replace(/\s+/g, '') || 'portfolio'}.thin.ly</span>
                    </div>
                    <PortfolioPreview
                      title={spec.title}
                      description={spec.description}
                      content={previewContent}
                      device="desktop"
                      className="cw-browser-frame"
                    />
                  </div>
                ) : (
                  <div className="cw-preview-frame">
                    <Preview
                      title={spec.title}
                      description={spec.description}
                      content={previewContent}
                      links={previewLinks}
                    />
                  </div>
                )}
                <p className="cw-preview-hint">Live preview · you can edit everything after creating</p>
              </div>
            </div>
          </>
        )}
      </div>
    </MainLayout>
  );
};

// ─── Generating state — a template-aware "the AI is designing" experience ──────

const GEN_STEPS: Record<TemplateKind, string[]> = {
  links: ['Choosing a palette', 'Composing the layout', 'Writing your bio', 'Placing your links', 'Polishing the details'],
  portfolio: ['Art-directing your site', 'Choosing the typography', 'Curating selected work', 'Composing the sections', 'Adding the finishing motion'],
};

function GeneratingState({ template }: { template: TemplateKind }) {
  const steps = GEN_STEPS[template];
  const [i, setI] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setI((v) => (v + 1) % steps.length), 1500);
    return () => clearInterval(id);
  }, [steps.length]);

  return (
    <div className="cw-gen">
      <div className="cw-gen-aura" aria-hidden>
        <span className="cw-aura cw-aura-1" />
        <span className="cw-aura cw-aura-2" />
        <span className="cw-aura cw-aura-3" />
      </div>

      <div className="cw-gen-inner">
        <div className="cw-gen-eyebrow">
          <span className="cw-gen-orb" /> {template === 'portfolio' ? 'Designing your portfolio' : 'Designing your page'}
        </div>

        {template === 'portfolio' ? <SkeletonBrowser /> : <SkeletonPhone />}

        <div className="cw-gen-status">
          <span key={i} className="cw-gen-step">
            <span className="cw-gen-spark">✦</span> {steps[i]}…
          </span>
        </div>

        <div className="cw-gen-bar" aria-hidden>
          <span />
        </div>

        <div className="cw-gen-dots" aria-hidden>
          {steps.map((_, n) => (
            <span key={n} className={`cw-gen-dot${n === i ? ' on' : ''}${n < i ? ' done' : ''}`} />
          ))}
        </div>
      </div>
    </div>
  );
}

function SkeletonPhone() {
  return (
    <div className="cw-sk-phone">
      <div className="cw-sk-notch" />
      <div className="cw-sk sk-avatar" style={{ animationDelay: '0s' }} />
      <div className="cw-sk sk-title" style={{ animationDelay: '.08s' }} />
      <div className="cw-sk sk-sub" style={{ animationDelay: '.14s' }} />
      <div className="cw-sk-socials">
        <div className="cw-sk sk-dot" style={{ animationDelay: '.2s' }} />
        <div className="cw-sk sk-dot" style={{ animationDelay: '.26s' }} />
        <div className="cw-sk sk-dot" style={{ animationDelay: '.32s' }} />
      </div>
      <div className="cw-sk sk-btn" style={{ animationDelay: '.4s' }} />
      <div className="cw-sk sk-btn" style={{ animationDelay: '.5s' }} />
      <div className="cw-sk sk-btn" style={{ animationDelay: '.6s' }} />
      <div className="cw-sk sk-btn" style={{ animationDelay: '.7s' }} />
    </div>
  );
}

function SkeletonBrowser() {
  return (
    <div className="cw-sk-browser">
      <div className="cw-sk-bar">
        <span /><span /><span />
      </div>
      <div className="cw-sk-screen">
        <div className="cw-sk sk-hero" style={{ animationDelay: '.05s' }} />
        <div className="cw-sk sk-hero2" style={{ animationDelay: '.18s' }} />
        <div className="cw-sk sk-line" style={{ animationDelay: '.3s' }} />
        <div className="cw-sk-row">
          <div className="cw-sk sk-chip" style={{ animationDelay: '.42s' }} />
          <div className="cw-sk sk-chip" style={{ animationDelay: '.48s' }} />
          <div className="cw-sk sk-chip" style={{ animationDelay: '.54s' }} />
        </div>
        <div className="cw-sk sk-wide" style={{ animationDelay: '.66s' }} />
        <div className="cw-sk sk-wide" style={{ animationDelay: '.76s' }} />
      </div>
    </div>
  );
}

export default CreatePage;
