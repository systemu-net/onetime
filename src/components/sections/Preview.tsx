import { SHORT_URL } from '@/apis/config';
import { Page, PageLink } from '@/types';
import React from 'react';
import { FaFacebook, FaInstagram, FaLinkedin, FaTiktok } from 'react-icons/fa';
import { FaXTwitter } from 'react-icons/fa6';

interface PreviewProps {
    title: string;
    description?: string;
    content: Page['content'];
    links?: PageLink[];
    previewIcon?: boolean;
}

export const socialIcons = {
    fb: <FaFacebook className="w-6 h-6" />,
    tiktok: <FaTiktok className="w-6 h-6" />,
    ig: <FaInstagram className="w-6 h-6" />,
    linkedin: <FaLinkedin className="w-6 h-6" />,
    x: <FaXTwitter className="w-6 h-6" />,
};

// Map the saved button style to a radius class that matches the published page.
const radiusClass: Record<string, string> = {
    squared: 'rounded-none',
    'rounded-sm': 'rounded-md',
    rounded: 'rounded-xl',
    'rounded-lg': 'rounded-2xl',
    'rounded-full': 'rounded-full',
};

// Scoped styles so the preview matches the published "Aurora Glass" page
// without leaking into the rest of the app.
const previewStyles = `
.tlp-root { position: relative; overflow: hidden; isolation: isolate; }
.tlp-orb { position: absolute; border-radius: 9999px; filter: blur(34px); opacity: 0.55; mix-blend-mode: screen; pointer-events: none; }
.tlp-orb-1 { width: 220px; height: 220px; top: -70px; left: -60px; background: var(--tlp-a1); animation: tlpDrift1 18s ease-in-out infinite; }
.tlp-orb-2 { width: 200px; height: 200px; bottom: -70px; right: -60px; background: var(--tlp-a2); animation: tlpDrift2 22s ease-in-out infinite; }
.tlp-orb-3 { width: 170px; height: 170px; top: 38%; left: 40%; background: var(--tlp-a3); animation: tlpDrift3 26s ease-in-out infinite; }
.tlp-vignette { position: absolute; inset: 0; pointer-events: none; background:
    radial-gradient(120% 70% at 50% -10%, rgba(255,255,255,0.10), transparent 60%),
    radial-gradient(120% 90% at 50% 115%, rgba(0,0,0,0.45), transparent 55%); }
.tlp-glass { position: relative; z-index: 1; background: rgba(255,255,255,0.07);
    backdrop-filter: blur(14px) saturate(1.4); -webkit-backdrop-filter: blur(14px) saturate(1.4);
    border: 1px solid rgba(255,255,255,0.14);
    box-shadow: 0 24px 60px -28px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.18); }
.tlp-avatar-wrap { position: relative; width: 104px; height: 104px; display: grid; place-items: center; animation: tlpFloat 6s ease-in-out infinite; }
.tlp-avatar-wrap::before { content: ""; position: absolute; inset: -3px; border-radius: 9999px;
    background: conic-gradient(from 0deg, var(--tlp-a1), var(--tlp-a2), var(--tlp-a3), var(--tlp-a1)); animation: tlpSpin 6s linear infinite; }
.tlp-avatar-wrap::after { content: ""; position: absolute; inset: -14px; border-radius: 9999px; z-index: -1;
    background: radial-gradient(closest-side, color-mix(in srgb, var(--tlp-a1) 45%, transparent), transparent 70%); }
.tlp-avatar, .tlp-fallback { position: relative; width: 92px; height: 92px; border-radius: 9999px; object-fit: cover; z-index: 1; }
.tlp-fallback { display: grid; place-items: center; font-weight: 700; font-size: 2rem; color: #fff; text-transform: uppercase;
    background: linear-gradient(135deg, var(--tlp-a1), var(--tlp-a2)); }
.tlp-verified { position: absolute; right: 2px; bottom: 2px; width: 26px; height: 26px; z-index: 2; border-radius: 9999px;
    background: linear-gradient(135deg, var(--tlp-a3), var(--tlp-a1)); display: grid; place-items: center;
    box-shadow: 0 4px 12px rgba(0,0,0,0.35); border: 2px solid rgba(255,255,255,0.85); }
.tlp-social { width: 42px; height: 42px; display: grid; place-items: center; border-radius: 9999px;
    background: rgba(255,255,255,0.10); border: 1px solid rgba(255,255,255,0.16);
    transition: transform .25s cubic-bezier(.22,1,.36,1), background .25s, box-shadow .25s; }
.tlp-social:hover { transform: translateY(-4px) scale(1.06); background: rgba(255,255,255,0.18); box-shadow: 0 10px 22px -8px rgba(0,0,0,0.5); }
.tlp-link { position: relative; display: flex; align-items: center; justify-content: center; min-height: 52px; padding: .8rem 1.1rem;
    font-weight: 600; text-align: center; overflow: hidden; isolation: isolate;
    border: 1px solid rgba(255,255,255,0.14);
    box-shadow: 0 10px 26px -12px color-mix(in srgb, var(--tlp-btn, #3b82f6) 70%, transparent), inset 0 1px 0 rgba(255,255,255,0.22);
    transition: transform .28s cubic-bezier(.22,1,.36,1), box-shadow .28s, filter .28s; }
.tlp-link::after { content: ""; position: absolute; top: 0; left: -120%; width: 60%; height: 100%;
    background: linear-gradient(115deg, transparent, rgba(255,255,255,0.45), transparent); transform: skewX(-18deg); transition: left .6s ease; z-index: 2; }
.tlp-link:hover { transform: translateY(-3px) scale(1.015); filter: brightness(1.04);
    box-shadow: 0 18px 38px -12px color-mix(in srgb, var(--tlp-btn, #3b82f6) 85%, transparent), inset 0 1px 0 rgba(255,255,255,0.3); }
.tlp-link:hover::after { left: 130%; }
.tlp-reveal { opacity: 0; animation: tlpFadeUp .7s cubic-bezier(.22,1,.36,1) forwards; }
@keyframes tlpFadeUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
@keyframes tlpSpin { to { transform: rotate(360deg); } }
@keyframes tlpFloat { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-6px); } }
@keyframes tlpDrift1 { 0%,100% { transform: translate(0,0) scale(1); } 50% { transform: translate(30px,24px) scale(1.12); } }
@keyframes tlpDrift2 { 0%,100% { transform: translate(0,0) scale(1); } 50% { transform: translate(-26px,-18px) scale(1.1); } }
@keyframes tlpDrift3 { 0%,100% { transform: translate(0,0) scale(1); } 50% { transform: translate(-18px,26px) scale(1.15); } }
@media (prefers-reduced-motion: reduce) {
    .tlp-orb, .tlp-avatar-wrap, .tlp-avatar-wrap::before { animation: none !important; }
    .tlp-reveal { opacity: 1; animation: none !important; }
}
`;

let stylesInjected = false;

const Preview: React.FC<PreviewProps> = ({
    title,
    description,
    links,
    content,
    previewIcon,
}) => {
    const {
        backgroundType,
        backgroundColor,
        gradientStart,
        gradientEnd,
        gradientDirection,
        buttonColor,
        textColor,
        button: buttonStyle,
        fontFamily,
        social,
        profileImage,
        backgroundImage,
    } = content;

    // Inject scoped styles once.
    if (typeof document !== 'undefined' && !stylesInjected) {
        const tag = document.createElement('style');
        tag.setAttribute('data-tlp-preview', '');
        tag.textContent = previewStyles;
        document.head.appendChild(tag);
        stylesInjected = true;
    }

    // --- Bolder art direction (mirrors app/views/link_in_bio/static.html.erb) ---
    const hasImageBg = backgroundType === 'image' && !!backgroundImage;
    const isDefaultBg =
        !hasImageBg &&
        backgroundType !== 'gradient' &&
        (backgroundColor || '').toLowerCase() === '#ffffff';
    const isDefaultText = (textColor || '').toLowerCase() === '#000000';

    const backgroundStyle = hasImageBg
        ? `linear-gradient(180deg, rgba(0,0,0,0.45), rgba(0,0,0,0.62)), url("${(backgroundImage || '').replace(/["'()\s<>]/g, '')}") center center / cover no-repeat`
        : backgroundType === 'gradient'
            ? `linear-gradient(${gradientDirection || 'to right'}, ${gradientStart || '#ffffff'}, ${gradientEnd || '#000000'})`
            : isDefaultBg
                ? 'radial-gradient(140% 120% at 50% -10%, #1b1438 0%, #0a0a12 55%, #07070d 100%)'
                : backgroundColor || '#ffffff';

    const effectiveText = hasImageBg ? (textColor || '#ffffff') : isDefaultBg && isDefaultText ? '#f4f4f8' : textColor;
    const accent1 =
        (buttonColor || '').toLowerCase() === '#000000' ? '#7c5cff' : buttonColor;

    const radius = radiusClass[buttonStyle] ?? 'rounded-xl';

    const sizeClass = previewIcon ? 'h-[500px]' : 'h-[558px]';
    const accentVars = {
        '--tlp-a1': accent1,
        '--tlp-a2': '#ff7ac6',
        '--tlp-a3': '#46e0d0',
    } as React.CSSProperties;

    const monogram = (title || '').trim().charAt(0) || '★';

    return (
        <div
            style={{ background: backgroundStyle, fontFamily, ...accentVars }}
            className={`tlp-root w-[298px] rounded-3xl ${sizeClass}`}
        >
            <span className="tlp-orb tlp-orb-1" aria-hidden />
            <span className="tlp-orb tlp-orb-2" aria-hidden />
            <span className="tlp-orb tlp-orb-3" aria-hidden />
            <span className="tlp-vignette" aria-hidden />

            <div
                className={`tlp-glass scrollbar-hidden h-full overflow-y-auto rounded-3xl px-5 py-9`}
                style={{ color: effectiveText }}
            >
                <div className="flex flex-col items-center gap-3">
                    <div className="tlp-reveal" style={{ animationDelay: '0.05s' }}>
                        <div className="tlp-avatar-wrap">
                            {profileImage ? (
                                <img className="tlp-avatar" src={profileImage} alt={title} />
                            ) : (
                                <div className="tlp-fallback">{monogram}</div>
                            )}
                            <span className="tlp-verified" title="Verified">
                                <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                            </span>
                        </div>
                    </div>
                    <h1 className="tlp-reveal break-words text-center text-[1.45rem] font-bold leading-tight" style={{ animationDelay: '0.12s', letterSpacing: '-0.02em' }}>{title}</h1>
                    {description && (
                        <p className="tlp-reveal -mt-1 max-w-[18rem] break-words text-center text-[0.9rem] opacity-80" style={{ animationDelay: '0.18s' }}>{description}</p>
                    )}
                </div>

                {!previewIcon && social && Object.values(social).some(Boolean) && (
                    <div className="tlp-reveal mt-6 flex flex-wrap content-center justify-center gap-3" style={{ animationDelay: '0.24s' }}>
                        {Object.entries(social).map(([key, link]) =>
                            link ? (
                                <a
                                    key={key}
                                    href={link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="tlp-social text-current"
                                    style={{ color: effectiveText }}
                                >
                                    {socialIcons[key as keyof typeof socialIcons]}
                                </a>
                            ) : null
                        )}
                    </div>
                )}

                {links && (
                    <div className="mt-7 grid grid-cols-1 gap-3">
                        {links.map((button, index) => (
                            <a
                                key={button.id}
                                href={button.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                title={button.description || button.label}
                                style={{
                                    ['--tlp-btn' as string]: button.color,
                                    backgroundColor: button.color,
                                    color: buttonColor,
                                    animationDelay: `${0.3 + index * 0.07}s`,
                                }}
                                className={`tlp-link tlp-reveal ${radius}`}
                            >
                                <span className="relative z-[3]">{button.label}</span>
                            </a>
                        ))}
                    </div>
                )}

                {previewIcon && (
                    <div className="mt-12 grid grid-cols-1 gap-3 text-center font-semibold">
                        {[1, 2, 3].map((_, index) => (
                            <span
                                key={index}
                                style={{ ['--tlp-btn' as string]: '#7c5cff', backgroundColor: 'rgba(255,255,255,0.12)' }}
                                className={`tlp-link pointer-events-none ${radius}`}
                            >
                                <span className="relative z-[3]">{SHORT_URL}</span>
                            </span>
                        ))}
                    </div>
                )}

                <div className="mt-10 text-center">
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/10 px-3 py-1 text-[0.72rem]" style={{ color: effectiveText }}>
                        Powered by <strong>Thin.ly</strong>
                    </span>
                </div>
            </div>
        </div>
    );
};

export default Preview;
