import { uploadImageToS3 } from '@/apis/uploads';
import type { Page, PortfolioCapability, PortfolioContent, PortfolioWork } from '@/types';
import { GripVertical, Plus, Trash2 } from 'lucide-react';
import { useRef, useState, type CSSProperties } from 'react';
import { useCookies } from 'react-cookie';

interface Props {
  page: Page;
  onChange: (p: Page) => void;
}

const SOCIALS: { id: keyof NonNullable<PortfolioContent['social']>; label: string }[] = [
  { id: 'ig', label: 'Instagram' },
  { id: 'x', label: 'X / Twitter' },
  { id: 'linkedin', label: 'LinkedIn' },
  { id: 'fb', label: 'Facebook' },
  { id: 'tiktok', label: 'TikTok' },
];

const PortfolioEditor: React.FC<Props> = ({ page, onChange }) => {
  const [cookies] = useCookies(['token']);
  const c = page.content;
  const pf: PortfolioContent = c.portfolio || {};

  const setContent = (patch: Partial<Page['content']>) => onChange({ ...page, content: { ...c, ...patch } });
  const setPf = (patch: Partial<PortfolioContent>) => setContent({ portfolio: { ...pf, ...patch } });

  const work = pf.work || [];
  const caps = pf.capabilities || [];
  const about = pf.about || [];
  const social = pf.social || c.social || {};

  const setWork = (w: PortfolioWork[]) => setPf({ work: w });
  const setCaps = (x: PortfolioCapability[]) => setPf({ capabilities: x });

  const [uploadingIdx, setUploadingIdx] = useState<number | null>(null);
  const fileRefs = useRef<Record<number, HTMLInputElement | null>>({});

  const uploadWorkImage = async (i: number, file?: File | null) => {
    if (!file) return;
    setUploadingIdx(i);
    try {
      const { url } = await uploadImageToS3(cookies.token, file);
      setWork(work.map((w, j) => (j === i ? { ...w, image: url } : w)));
    } catch (e) {
      console.error('Work image upload failed', e);
    } finally {
      setUploadingIdx(null);
    }
  };

  return (
    <>
      {/* Identity & accent */}
      <div className="em-card">
        <h2 className="em-card-title">Identity</h2>
        <p className="em-card-subtitle">The mark, role, and accent color of your site</p>
        <div className="pf-row">
          <Field label="Monogram" value={pf.monogram || ''} onChange={(v) => setPf({ monogram: v })} placeholder="M.I" />
          <div className="em-pop-section" style={{ flex: 1 }}>
            <div className="em-pop-label">Accent</div>
            <div className="em-color-row">
              <input type="color" className="em-color-input" value={c.accent || '#e8541e'} onChange={(e) => setContent({ accent: e.target.value })} />
              <span style={{ fontSize: 12, color: 'var(--pm-mute)' }}>{(c.accent || '#e8541e').toUpperCase()}</span>
            </div>
          </div>
        </div>
        <Field label="Role / eyebrow" value={pf.eyebrow || ''} onChange={(v) => setPf({ eyebrow: v })} placeholder="Independent UI/UX Designer" />
      </div>

      {/* Hero */}
      <div className="em-card">
        <h2 className="em-card-title">Hero</h2>
        <p className="em-card-subtitle">The two big name lines and your positioning</p>
        <div className="pf-row">
          <Field label="Name line 1" value={pf.firstName || ''} onChange={(v) => setPf({ firstName: v })} placeholder="MAE" />
          <Field label="Name line 2" value={pf.lastName || ''} onChange={(v) => setPf({ lastName: v })} placeholder="ITO" />
        </div>
        <Field label="Tagline" value={pf.tagline || ''} onChange={(v) => setPf({ tagline: v })} placeholder="Calm interfaces for ambitious products." />
        <div className="pf-row">
          <Field label="Location" value={pf.location || ''} onChange={(v) => setPf({ location: v })} placeholder="Kyoto, JP" />
          <Field label="Timezone (IANA)" value={pf.timezone || ''} onChange={(v) => setPf({ timezone: v })} placeholder="Asia/Tokyo" />
        </div>
        <div className="pf-row">
          <Field label="Coordinates" value={pf.coordinates || ''} onChange={(v) => setPf({ coordinates: v })} placeholder="35.0116° N / 135.7681° E" />
          <Field label="Availability" value={pf.availability || ''} onChange={(v) => setPf({ availability: v })} placeholder="Booking Q3 — 2026" />
        </div>
        <Field
          label="Marquee services (comma-separated)"
          value={(pf.services || []).join(', ')}
          onChange={(v) => setPf({ services: v.split(',').map((s) => s.trim()).filter(Boolean) })}
          placeholder="Interaction, Art direction, Prototyping"
        />
      </div>

      {/* About */}
      <div className="em-card">
        <h2 className="em-card-title">About</h2>
        <div className="em-pop-section">
          <div className="em-pop-label">Statement (one strong sentence)</div>
          <textarea className="em-text-input" rows={2} value={pf.statement || ''} onChange={(e) => setPf({ statement: e.target.value })} />
        </div>
        <div className="em-pop-section">
          <div className="em-pop-label">Paragraph 1</div>
          <textarea className="em-text-input" rows={3} value={about[0] || ''} onChange={(e) => setPf({ about: [e.target.value, about[1] || ''] })} />
        </div>
        <div className="em-pop-section">
          <div className="em-pop-label">Paragraph 2</div>
          <textarea className="em-text-input" rows={3} value={about[1] || ''} onChange={(e) => setPf({ about: [about[0] || '', e.target.value] })} />
        </div>
      </div>

      {/* Selected work */}
      <div className="em-card">
        <h2 className="em-card-title">Selected work</h2>
        <p className="em-card-subtitle">Projects shown in the editorial list (hover shows the image)</p>
        {work.map((w, i) => (
          <div key={i} className="pf-item">
            <span className="em-link-drag"><GripVertical size={15} strokeWidth={2} /></span>
            <div style={{ flex: 1 }}>
              <input className="em-text-input" style={{ marginBottom: 6 }} placeholder="Project title" value={w.title} onChange={(e) => setWork(work.map((x, j) => (j === i ? { ...x, title: e.target.value } : x)))} />
              <div className="pf-row" style={{ gap: 6 }}>
                <input className="em-text-input" placeholder="Sector · Discipline" value={w.category || ''} onChange={(e) => setWork(work.map((x, j) => (j === i ? { ...x, category: e.target.value } : x)))} />
                <input className="em-text-input" style={{ maxWidth: 90 }} placeholder="Year" value={w.year || ''} onChange={(e) => setWork(work.map((x, j) => (j === i ? { ...x, year: e.target.value } : x)))} />
              </div>
            </div>
            <button
              type="button"
              className="pm-btn pm-btn-ghost pm-btn-sm"
              onClick={() => fileRefs.current[i]?.click()}
              title="Hover image"
              style={w.image ? ({ '--em-link-bg': '', backgroundImage: `url("${w.image}")`, backgroundSize: 'cover', color: 'transparent', minWidth: 40 } as CSSProperties) : undefined}
            >
              {uploadingIdx === i ? '…' : w.image ? '·' : 'Img'}
            </button>
            <input ref={(el) => (fileRefs.current[i] = el)} type="file" accept="image/png,image/jpeg,image/gif,image/webp" hidden onChange={(e) => { uploadWorkImage(i, e.target.files?.[0]); e.target.value = ''; }} />
            <button type="button" className="em-link-menu" onClick={() => setWork(work.filter((_, j) => j !== i))} title="Remove"><Trash2 size={13} strokeWidth={2} /></button>
          </div>
        ))}
        <button type="button" className="pm-btn pm-btn-ghost pm-btn-sm" style={{ marginTop: 10 }} onClick={() => setWork([...work, { title: 'New project', category: '', year: '' }])}>
          <Plus size={13} strokeWidth={2.5} /> Add project
        </button>
      </div>

      {/* Capabilities */}
      <div className="em-card">
        <h2 className="em-card-title">Capabilities</h2>
        {caps.map((cap, i) => (
          <div key={i} className="pf-item">
            <div style={{ flex: 1 }}>
              <input className="em-text-input" style={{ marginBottom: 6 }} placeholder="Capability" value={cap.title} onChange={(e) => setCaps(caps.map((x, j) => (j === i ? { ...x, title: e.target.value } : x)))} />
              <input className="em-text-input" placeholder="One short sentence" value={cap.description || ''} onChange={(e) => setCaps(caps.map((x, j) => (j === i ? { ...x, description: e.target.value } : x)))} />
            </div>
            <button type="button" className="em-link-menu" onClick={() => setCaps(caps.filter((_, j) => j !== i))} title="Remove"><Trash2 size={13} strokeWidth={2} /></button>
          </div>
        ))}
        <button type="button" className="pm-btn pm-btn-ghost pm-btn-sm" style={{ marginTop: 10 }} onClick={() => setCaps([...caps, { title: 'New capability', description: '' }])}>
          <Plus size={13} strokeWidth={2.5} /> Add capability
        </button>
      </div>

      {/* Contact */}
      <div className="em-card">
        <h2 className="em-card-title">Contact</h2>
        <Field label="Email" value={pf.email || ''} onChange={(v) => setPf({ email: v })} placeholder="hello@studio.com" />
        {SOCIALS.map((s) => (
          <Field
            key={s.id}
            label={s.label}
            value={social[s.id] || ''}
            onChange={(v) => setPf({ social: { ...social, [s.id]: v || undefined } })}
            placeholder={`https://…`}
          />
        ))}
      </div>
    </>
  );
};

function Field({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <div className="em-pop-section" style={{ flex: 1 }}>
      <div className="em-pop-label">{label}</div>
      <input className="em-text-input" value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}

export default PortfolioEditor;
