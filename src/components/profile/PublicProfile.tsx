/**
 * PublicProfile — the thin.ly/@handle "digital business card".
 *
 * An editorial, awwwards-leaning presence page: oversized display type, a serif
 * lead, a governed-trust marquee, and refined link rows — built on the thin.ly
 * design tokens. The SINGLE renderer used by both the public page and the owner
 * editor's live preview, so the two can't drift. Scales via container queries,
 * so it looks right full-width or inside the editor's narrow preview frame.
 *
 * Phase 1+2 scope: Follow / Message / followers are Phase 3 (seams marked).
 */
import { API_URL, SHORT_URL } from "@/apis/config";
import { PLANS_ROUTE } from "@/routes";
import type { Accent, ProfileLinkRow, ProfileSocials } from "@/types";
import {
  ArrowDownRight,
  ArrowUpRight,
  BadgeCheck,
  CalendarDays,
  Check,
  Crown,
  Globe,
  MapPin,
  Share2,
  ShieldCheck,
} from "lucide-react";
import { type CSSProperties, type MouseEvent, useRef, useState } from "react";
import { FaGlobe } from "react-icons/fa6";
import { Link as RouterLink } from "react-router-dom";

import { SOCIAL_PLATFORM_MAP, SOCIAL_PLATFORMS, socialHref } from "./socialPlatforms";
import "./profile.css";

export type ProfileView = {
  handle: string;
  display_name?: string | null;
  bio?: string | null;
  location?: string | null;
  website?: string | null;
  accent: Accent;
  verified?: boolean;
  socials?: ProfileSocials;
  social_order?: string[];
  avatar_url?: string | null;
  created_at?: string;
  links?: ProfileLinkRow[];
};

const TONES: Accent[] = ["lilac", "mint", "coral", "peach", "sun", "sky"];

function initials(text: string): string {
  const cleaned = text.replace(/[^a-zA-Z0-9 ]/g, " ").trim();
  const parts = cleaned.split(/\s+/).filter(Boolean);
  const letters =
    parts.length >= 2 ? parts[0][0] + parts[1][0] : cleaned.slice(0, 2);
  return letters.toUpperCase() || "@";
}
function toneFor(key: string): Accent {
  const seed = (key.charCodeAt(0) || 0) + key.length;
  return TONES[seed % TONES.length];
}
function formatCount(n: number): string {
  return n >= 1000 ? `${(n / 1000).toFixed(1).replace(".0", "")}k` : `${n}`;
}
function yearFrom(iso?: string): string | null {
  if (!iso) return null;
  const y = new Date(iso).getFullYear();
  return Number.isFinite(y) ? `${y}` : null;
}
function num(n: number): string {
  return n < 10 ? `0${n}` : `${n}`;
}
// Always route through the thin.ly short URL so the click is tracked (the
// /:lookup_code redirect logs it, then forwards) — never the raw long URL.
function shortUrlFor(slug: string): string {
  return `${SHORT_URL}/${slug}`;
}

function Sparkline({ data, accent }: { data: number[]; accent: Accent }) {
  // Hide entirely when there's no recent traffic — empty bars read as noise.
  if (!data?.length || data.every((v) => v === 0)) return null;
  const peak = Math.max(1, ...data);
  return (
    <div className="tlp-spark" aria-hidden>
      {data.map((v, i) => (
        <span
          key={i}
          style={{
            height: `${Math.max(6, (v / peak) * 100)}%`,
            background: `var(--${accent}-d)`,
          }}
        />
      ))}
    </div>
  );
}

function LinkRow({
  link,
  index,
  pinned,
}: {
  link: ProfileLinkRow;
  index: number;
  pinned?: boolean;
}) {
  const tone = toneFor(link.slug || link.title);
  return (
    <a
      className={`tlp-row${pinned ? " tlp-row--pinned" : ""}`}
      href={shortUrlFor(link.slug)}
      target="_blank"
      rel="noopener noreferrer"
      style={{ "--row-accent": `var(--${tone}-d)` } as CSSProperties}
    >
      <span className="tlp-row-index">{num(index)}</span>
      <span className="tlp-row-body">
        <span className="tlp-row-title">
          {pinned && (
            <Crown
              className="tlp-row-crown"
              size={16}
              fill="currentColor"
              aria-label="Pinned"
            />
          )}
          {link.title}
        </span>
        <span className="tlp-row-slug">
          thin.ly/<b>{link.slug}</b>
          {link.tag && <em className="tlp-row-tag">{link.tag}</em>}
        </span>
      </span>
      <Sparkline data={link.spark} accent={tone} />
      <span className="tlp-row-clicks">
        <b>{formatCount(link.clicks)}</b>
        <i>clicks</i>
      </span>
      <span className="tlp-row-go">
        <ArrowUpRight size={18} strokeWidth={2} />
      </span>
    </a>
  );
}

export default function PublicProfile({
  profile,
  narrow = false,
  promptVerify = false,
}: {
  profile: ProfileView;
  narrow?: boolean;
  // Owner-editing context: when the profile isn't verified yet, show a clickable
  // "Get verified" pill next to the name (X-style) that routes to the plans page.
  promptVerify?: boolean;
}) {
  const [copied, setCopied] = useState(false);
  const [qrOk, setQrOk] = useState(true);
  const heroRef = useRef<HTMLElement>(null);

  // Cursor-follow spotlight (desktop hover) — sets CSS vars on the hero node
  // directly so we don't re-render on every pointer move.
  const onHeroMove = (e: MouseEvent<HTMLElement>) => {
    const el = heroRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    el.style.setProperty("--spot-x", `${e.clientX - r.left}px`);
    el.style.setProperty("--spot-y", `${e.clientY - r.top}px`);
  };

  const qrSrc = `${API_URL}/api/v1/profiles/${encodeURIComponent(profile.handle)}/qr`;

  const accent = profile.accent || "violet";
  const name = profile.display_name?.trim() || profile.handle;
  // Scale the display size down for long names so they don't overflow / break
  // mid-word (e.g. a long single-word handle). cqi keeps it responsive.
  const nameLen = name.length;
  const nameSize =
    nameLen <= 8
      ? "clamp(40px, 12cqi, 82px)"
      : nameLen <= 13
        ? "clamp(34px, 9.5cqi, 60px)"
        : nameLen <= 20
          ? "clamp(28px, 7cqi, 46px)"
          : "clamp(24px, 5.5cqi, 38px)";
  const joined = yearFrom(profile.created_at);
  const website = profile.website?.replace(/^https?:\/\//, "") || null;

  const live = (profile.links ?? []).filter(
    (l) => l.visible !== false && l.state === "active",
  );
  // All pinned links float to the top (each marked with a golden crown); order
  // is otherwise preserved.
  const ordered = [
    ...live.filter((l) => l.pinned),
    ...live.filter((l) => !l.pinned),
  ];
  const totalClicks = live.reduce((sum, l) => sum + (l.clicks || 0), 0);

  // Present socials, ordered by the owner's saved order (social_order), with any
  // remaining platforms appended in the canonical order.
  const socialKeyOrder = [
    ...(profile.social_order ?? []),
    ...SOCIAL_PLATFORMS.map((p) => p.key).filter((k) => !(profile.social_order ?? []).includes(k)),
  ];
  const socials = socialKeyOrder
    .map((key) => [key, profile.socials?.[key]] as const)
    .filter(([, v]) => typeof v === "string" && v.trim().length > 0) as [string, string][];

  const shareUrl = `https://thin.ly/@${profile.handle}`;
  const onShare = () => {
    if (navigator.share) {
      navigator.share({ title: name, url: shareUrl }).catch(() => {});
      return;
    }
    navigator.clipboard
      ?.writeText(shareUrl)
      .then(() => {
        setCopied(true);
        window.setTimeout(() => setCopied(false), 1800);
      })
      .catch(() => {});
  };

  return (
    <div
      className={`tlp tlp-profile${narrow ? " tlp-profile--narrow" : ""}`}
      style={
        (accent.startsWith("#")
          ? {
              // Custom hex from the color wheel — derive a light tint + dark shade.
              "--accent": accent,
              "--accent-3": `color-mix(in srgb, ${accent} 14%, #fff)`,
              "--accent-d": `color-mix(in srgb, ${accent} 72%, #000)`,
            }
          : {
              "--accent": `var(--${accent})`,
              "--accent-3": `var(--${accent}-3)`,
              "--accent-d": `var(--${accent}-d)`,
            }) as CSSProperties
      }
    >
      <div className="tlp-grain" aria-hidden />

      {/* ── Hero ── */}
      <header className="tlp-hero" ref={heroRef} onMouseMove={onHeroMove}>
        <div className="tlp-hero-spot" aria-hidden />
        <div className="tlp-hero-top">
          <span className="tlp-eyebrow tlp-status">
            <span className="tlp-dot" /> thin.ly profile
          </span>
        </div>

        <div className="tlp-hero-grid">
          <div className="tlp-hero-text">
            <div className="tlp-eyebrow tlp-role">
              // link-in-bio · governed presence
            </div>
            <div className="tlp-name-row">
              <h1 className="tlp-name" style={{ fontSize: nameSize }}>
                {name}
              </h1>
              {profile.verified ? (
                <BadgeCheck className="tlp-verified" aria-label="Verified" />
              ) : promptVerify ? (
                <RouterLink
                  to={PLANS_ROUTE}
                  className="tlp-getverified"
                  title="Get the blue verified badge"
                >
                  <BadgeCheck size={15} /> Get verified
                </RouterLink>
              ) : null}
            </div>
            <a
              className="tlp-handle"
              href={shareUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              thin.ly/<b>@{profile.handle}</b>
            </a>
            {profile.bio && <p className="tlp-lead">{profile.bio}</p>}

            {(website || profile.location || joined) && (
              <div className="tlp-meta">
                {website && (
                  <a
                    className="tlp-meta-item"
                    href={`https://${website}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Globe size={14} /> {website}
                  </a>
                )}
                {profile.location && (
                  <span className="tlp-meta-item">
                    <MapPin size={14} /> {profile.location}
                  </span>
                )}
                {joined && (
                  <span className="tlp-meta-item">
                    <CalendarDays size={14} /> Joined {joined}
                  </span>
                )}
              </div>
            )}

            {socials.length > 0 && (
              <div className="tlp-socials">
                <div className="tlp-socials-row">
                  {socials.map(([key, value]) => {
                    const platform = SOCIAL_PLATFORM_MAP[key];
                    const Icon = platform?.Icon ?? FaGlobe;
                    return (
                      <a
                        key={key}
                        className="tlp-social-chip"
                        href={socialHref(key, value)}
                        target="_blank"
                        rel="noopener noreferrer"
                        title={platform?.label ?? key}
                      >
                        <Icon size={17} />
                      </a>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="tlp-actions">
              {/* Phase 3: Follow / Message land here. */}
              <button
                type="button"
                className="tlp-btn tlp-btn--accent"
                onClick={onShare}
              >
                {copied ? <Check size={16} /> : <Share2 size={16} />}
                {copied ? "Copied" : "Share"}
              </button>
              {live.length > 0 && (
                <a className="tlp-btn tlp-btn--ghost" href="#links">
                  View links <ArrowDownRight size={16} />
                </a>
              )}
            </div>

            <div className="tlp-stats">
              <span className="tlp-stat">
                <b>{live.length}</b>
                <i>Links</i>
              </span>
              <span className="tlp-stat">
                <b>{formatCount(totalClicks)}</b>
                <i>Clicks</i>
              </span>
              {/* Phase 3: Followers / Following. */}
            </div>
          </div>

          <div className="tlp-hero-aside">
            <div className="tlp-avatar-ring">
              <div className="tlp-avatar-gap">
                {profile.avatar_url ? (
                  <img
                    className="tlp-avatar-img"
                    src={profile.avatar_url}
                    alt={name}
                  />
                ) : (
                  <span className="tlp-avatar-mono">{initials(name)}</span>
                )}
              </div>
            </div>

            {!narrow && qrOk && (
              <div className="tlp-qr">
                <img
                  src={qrSrc}
                  alt={`QR code for thin.ly/@${profile.handle}`}
                  loading="lazy"
                  onError={() => setQrOk(false)}
                />
                <span className="tlp-eyebrow">Scan to connect</span>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ── Governed-trust marquee ── */}
      <div className="tlp-marquee" aria-hidden>
        <div className="tlp-marquee-track">
          {Array.from({ length: 2 }).map((_, k) => (
            <span key={k} className="tlp-marquee-group">
              {[
                "Governed",
                "Checked",
                "Safe to click",
                "Verified",
                "No dead links",
                "Built on thin.ly",
              ].map((w) => (
                <span key={w}>
                  {w} <i>✦</i>
                </span>
              ))}
            </span>
          ))}
        </div>
      </div>

      {/* ── Links ── */}
      <section className="tlp-links-section" id="links">
        <div className="tlp-section-head">
          <h2 className="tlp-section-title">Links</h2>
          <span className="tlp-eyebrow">
            {live.length} {live.length === 1 ? "link" : "links"} · all verified
            safe
          </span>
        </div>

        {live.length === 0 ? (
          <div className="tlp-empty-editorial">
            <ShieldCheck size={22} />
            <p>
              This presence is just getting started — governed links are on the
              way.
            </p>
          </div>
        ) : (
          <ol className="tlp-link-list">
            {ordered.map((link, i) => (
              <li key={link.id}>
                <LinkRow link={link} index={i + 1} pinned={!!link.pinned} />
              </li>
            ))}
          </ol>
        )}
      </section>
    </div>
  );
}

// Private-profile placeholder (the public endpoint returns a minimal payload).
export function PrivateProfileCard({ name }: { name?: string | null }) {
  return (
    <div className="tlp tlp-profile tlp-private-wrap">
      <div className="tlp-private">
        <span className="tlp-private-icon">
          <ShieldCheck size={26} />
        </span>
        <div className="tlp-private-title">
          {name || "This presence"} is private
        </div>
        <p>The owner hasn’t opened this profile to the public yet.</p>
      </div>
    </div>
  );
}
