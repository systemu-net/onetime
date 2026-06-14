import type { Page } from '@/types';
import type { CSSProperties } from 'react';

// A lightweight, static thumbnail of a portfolio page's hero — same 298×558
// footprint as <Preview> so it drops into the dashboard phone frame and scales
// identically. No iframe / WebGL / GSAP, so it's safe to render in a long list.
const PortfolioThumb: React.FC<{ title: string; content: Page['content'] }> = ({ title, content }) => {
  const pf = content.portfolio || {};
  const accent = content.accent || '#9c5a4e';
  const first = pf.firstName || title?.split(' ')[0] || 'Studio';
  const last = pf.lastName || title?.split(' ').slice(1).join(' ') || '';
  const role = pf.eyebrow || '';
  const tagline = pf.tagline || content.portfolio?.tagline || '';
  const mono = pf.monogram || (title || 'P').slice(0, 3).toUpperCase();

  const serif = '"Fraunces", "Bricolage Grotesque", Georgia, serif';
  const mono$: CSSProperties = { fontFamily: 'ui-monospace, monospace', letterSpacing: '0.04em' };

  // Faint topographic contour texture echoing the live page.
  const topo =
    "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='240' height='240'%3E%3Cg fill='none' stroke='%23000' stroke-opacity='0.05'%3E%3Cpath d='M-20 60 Q60 20 140 70 T320 60'/%3E%3Cpath d='M-20 110 Q70 70 150 120 T320 110'/%3E%3Cpath d='M-20 160 Q60 120 150 170 T320 160'/%3E%3Cpath d='M-20 210 Q80 170 160 215 T320 210'/%3E%3C/g%3E%3C/svg%3E\")";

  return (
    <div
      style={{
        width: 298,
        height: 558,
        borderRadius: 24,
        background: `${topo}, #efeae0`,
        backgroundSize: 'cover',
        color: '#16140f',
        fontFamily: serif,
        padding: '22px 18px',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', ...mono$, fontSize: 9, color: '#46423a' }}>
        <span>
          {mono} <span style={{ color: accent }}>©2026</span>
        </span>
        <span>{(pf.location || '').toUpperCase()}</span>
      </div>

      <div style={{ marginTop: 'auto' }}>
        {role && (
          <div style={{ ...mono$, fontSize: 8.5, letterSpacing: '0.16em', textTransform: 'uppercase', color: '#46423a', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
            <span style={{ width: 5, height: 5, borderRadius: '50%', background: accent, flexShrink: 0 }} />
            {role}
          </div>
        )}
        <div style={{ fontSize: 60, lineHeight: 0.84, fontWeight: 340, letterSpacing: '-0.02em', wordBreak: 'break-word' }}>{first}</div>
        {last && (
          <div style={{ fontSize: 60, lineHeight: 0.86, fontStyle: 'italic', color: accent, letterSpacing: '-0.02em', wordBreak: 'break-word' }}>{last}</div>
        )}
        {tagline && <div style={{ fontSize: 14, lineHeight: 1.3, marginTop: 18, maxWidth: '82%' }}>{tagline}</div>}
      </div>

      <div style={{ ...mono$, fontSize: 8, color: '#8c8678', marginTop: 16 }}>{(pf.availability || '').toUpperCase()}</div>
    </div>
  );
};

export default PortfolioThumb;
