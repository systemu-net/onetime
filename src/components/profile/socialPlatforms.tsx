/**
 * Social platforms for the @handle profile — single source of truth shared by
 * the editor's Social tab and the public renderer. Each platform stores a
 * handle or full URL; `socialHref` turns a stored value into an outbound link.
 *
 * The backend persists any key listed in Profile::SOCIAL_KEYS (keep the two in
 * sync when adding platforms).
 */
import type { IconType } from "react-icons";
import {
  FaBluesky,
  FaDiscord,
  FaEnvelope,
  FaFacebookF,
  FaGithub,
  FaGlobe,
  FaInstagram,
  FaLinkedinIn,
  FaMastodon,
  FaSpotify,
  FaTelegram,
  FaThreads,
  FaTiktok,
  FaXTwitter,
  FaYoutube,
} from "react-icons/fa6";
import { SiSubstack } from "react-icons/si";

export type SocialPlatform = {
  key: string;
  label: string;
  Icon: IconType;
  color: string;
  // Prefix that turns a bare handle into a URL. Omit when the value is itself a
  // full URL (mastodon/substack/discord) or an email.
  base?: string;
  placeholder: string;
};

export const SOCIAL_PLATFORMS: SocialPlatform[] = [
  { key: "instagram", label: "Instagram", Icon: FaInstagram, color: "#E4405F", base: "https://instagram.com/", placeholder: "username" },
  { key: "x", label: "X", Icon: FaXTwitter, color: "#0f0f0f", base: "https://x.com/", placeholder: "@handle" },
  { key: "tiktok", label: "TikTok", Icon: FaTiktok, color: "#0f0f0f", base: "https://tiktok.com/@", placeholder: "username" },
  { key: "facebook", label: "Facebook", Icon: FaFacebookF, color: "#1877F2", base: "https://facebook.com/", placeholder: "username" },
  { key: "linkedin", label: "LinkedIn", Icon: FaLinkedinIn, color: "#0A66C2", base: "https://linkedin.com/in/", placeholder: "username" },
  { key: "youtube", label: "YouTube", Icon: FaYoutube, color: "#FF0000", base: "https://youtube.com/@", placeholder: "handle" },
  { key: "spotify", label: "Spotify", Icon: FaSpotify, color: "#1DB954", base: "https://open.spotify.com/user/", placeholder: "username or URL" },
  { key: "threads", label: "Threads", Icon: FaThreads, color: "#0f0f0f", base: "https://threads.net/@", placeholder: "username" },
  { key: "bluesky", label: "Bluesky", Icon: FaBluesky, color: "#0285FF", base: "https://bsky.app/profile/", placeholder: "handle.bsky.social" },
  { key: "mastodon", label: "Mastodon", Icon: FaMastodon, color: "#6364FF", placeholder: "https://instance/@you" },
  { key: "substack", label: "Substack", Icon: SiSubstack, color: "#FF6719", placeholder: "https://you.substack.com" },
  { key: "discord", label: "Discord", Icon: FaDiscord, color: "#5865F2", placeholder: "invite URL" },
  { key: "telegram", label: "Telegram", Icon: FaTelegram, color: "#26A5E4", base: "https://t.me/", placeholder: "username" },
  { key: "github", label: "GitHub", Icon: FaGithub, color: "#0f0f0f", base: "https://github.com/", placeholder: "username" },
  { key: "email", label: "Email", Icon: FaEnvelope, color: "#6b7280", placeholder: "you@email.com" },
  { key: "website", label: "Website", Icon: FaGlobe, color: "#6b7280", placeholder: "https://yoursite.com" },
];

export const SOCIAL_PLATFORM_MAP: Record<string, SocialPlatform> =
  Object.fromEntries(SOCIAL_PLATFORMS.map((p) => [p.key, p]));

// Turn a stored handle/URL into an outbound href.
export function socialHref(key: string, value: string): string {
  const v = (value ?? "").trim();
  if (!v) return "#";
  if (key === "email") return v.startsWith("mailto:") ? v : `mailto:${v}`;
  if (/^https?:\/\//i.test(v)) return v;
  const base = SOCIAL_PLATFORM_MAP[key]?.base;
  return base ? `${base}${v.replace(/^@/, "")}` : `https://${v}`;
}
