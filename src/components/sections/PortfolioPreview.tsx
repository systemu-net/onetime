import { renderPreview } from '@/apis/pages';
import type { Page } from '@/types';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useCookies } from 'react-cookie';

interface Props {
  title: string;
  description?: string;
  content: Page['content'];
  device?: 'desktop' | 'mobile';
  className?: string;
}

// Fixed logical viewports — the iframe renders a real browser viewport at this
// size (so `vh` units resolve correctly), then the whole thing is scaled to fit
// the panel width. The iframe scrolls internally (its scrollbar is hidden), so
// the preview behaves like a live mini-site you can scroll.
const VIEWPORT = {
  desktop: { w: 1280, h: 800 },
  mobile: { w: 390, h: 760 },
};

const PortfolioPreview: React.FC<Props> = ({ title, description, content, device = 'desktop', className }) => {
  const [cookies] = useCookies(['token']);
  const [html, setHtml] = useState('');
  const [loading, setLoading] = useState(true);
  const [scale, setScale] = useState(0.4);
  const wrapRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const { w: LW, h: LH } = VIEWPORT[device];

  // Debounced render whenever the content meaningfully changes.
  const key = JSON.stringify(content) + '|' + title + '|' + (description ?? '');
  useEffect(() => {
    let cancelled = false;
    const id = setTimeout(async () => {
      try {
        setLoading(true);
        const h = await renderPreview(cookies.token, { title, description, content });
        if (!cancelled) setHtml(h);
      } catch {
        /* keep previous frame */
      } finally {
        if (!cancelled) setLoading(false);
      }
    }, 450);
    return () => {
      cancelled = true;
      clearTimeout(id);
    };
  }, [key, cookies.token]); // eslint-disable-line react-hooks/exhaustive-deps

  // Fit the logical viewport width into the wrapper.
  useLayoutEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      setScale(Math.min(1, el.clientWidth / LW));
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [LW]);

  // Hide the iframe's own scrollbar (same-origin srcDoc) so scrolling looks clean.
  const onLoad = () => {
    try {
      const doc = iframeRef.current?.contentDocument as (Document & { __sbHidden?: boolean }) | undefined;
      if (doc && !doc.__sbHidden) {
        const st = doc.createElement('style');
        st.textContent = '*::-webkit-scrollbar{width:0;height:0;display:none}html{scrollbar-width:none;-ms-overflow-style:none}';
        doc.head?.appendChild(st);
        doc.__sbHidden = true;
      }
    } catch {
      /* not ready */
    }
  };

  const displayH = LH * scale;

  return (
    <div
      ref={wrapRef}
      className={className}
      style={{ position: 'relative', overflow: 'hidden', background: 'var(--pm-bg, #f4f4f5)', height: `${displayH}px` }}
    >
      {html && (
        <div style={{ width: `${LW * scale}px`, height: `${displayH}px`, margin: '0 auto', position: 'relative' }}>
          <iframe
            ref={iframeRef}
            title="Portfolio preview"
            srcDoc={html}
            sandbox="allow-scripts allow-same-origin allow-popups"
            onLoad={onLoad}
            style={{
              width: `${LW}px`,
              height: `${LH}px`,
              border: 'none',
              display: 'block',
              transform: `scale(${scale})`,
              transformOrigin: 'top left',
            }}
          />
        </div>
      )}
      {loading && (
        <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', pointerEvents: 'none' }}>
          <div style={{ width: 30, height: 30, borderRadius: '50%', border: '3px solid rgba(124,58,237,0.2)', borderTopColor: '#7c3aed', animation: 'cw-spin 0.8s linear infinite' }} />
        </div>
      )}
    </div>
  );
};

export default PortfolioPreview;
