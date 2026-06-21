import { API_URL } from "./config";
import type {
  HandleCheck,
  Profile,
  ProfileLinkRow,
  ProfileLinksResponse,
  ProfilePrivacy,
  ProfileSocials,
  PublicProfileResponse,
} from "../types";

const authHeaders = (token: string) => ({
  "Content-Type": "application/json",
  Authorization: token,
});

// Fields the owner can patch. socials/privacy are merged server-side, so
// partial objects are fine.
export type ProfileUpdate = Partial<{
  handle: string;
  display_name: string;
  bio: string;
  location: string;
  website: string;
  accent: string;
  socials: ProfileSocials;
  privacy: Partial<ProfilePrivacy>;
}>;

// One curation item sent to PATCH /profile/links.
export type ProfileLinkInput = {
  link_id: number;
  position: number;
  pinned?: boolean;
  visible?: boolean;
  title_override?: string | null;
  tag?: string | null;
};

// ─── Owner ──────────────────────────────────────────────────────────────────

export const getMyProfile = async (token: string): Promise<Profile> => {
  const res = await fetch(`${API_URL}/api/v1/profile`, { headers: authHeaders(token) });
  if (!res.ok) throw new Error("Failed to load profile");
  return (await res.json()) as Profile;
};

export const updateProfile = async (token: string, patch: ProfileUpdate): Promise<Profile> => {
  const res = await fetch(`${API_URL}/api/v1/profile`, {
    method: "PATCH",
    headers: authHeaders(token),
    body: JSON.stringify({ profile: patch }),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error((data.errors || ["Failed to update profile"]).join(", "));
  }
  return (await res.json()) as Profile;
};

export const publishProfile = async (token: string): Promise<Profile> => {
  const res = await fetch(`${API_URL}/api/v1/profile/publish`, {
    method: "POST",
    headers: authHeaders(token),
  });
  if (!res.ok) throw new Error("Failed to publish profile");
  return (await res.json()) as Profile;
};

export const checkHandle = async (token: string, handle: string): Promise<HandleCheck> => {
  const res = await fetch(
    `${API_URL}/api/v1/handles/check?handle=${encodeURIComponent(handle)}`,
    { headers: authHeaders(token) },
  );
  if (!res.ok) throw new Error("Failed to check handle");
  return (await res.json()) as HandleCheck;
};

export const getProfileLinks = async (token: string): Promise<ProfileLinksResponse> => {
  const res = await fetch(`${API_URL}/api/v1/profile/links`, { headers: authHeaders(token) });
  if (!res.ok) throw new Error("Failed to load profile links");
  return (await res.json()) as ProfileLinksResponse;
};

export const updateProfileLinks = async (
  token: string,
  links: ProfileLinkInput[],
): Promise<ProfileLinksResponse> => {
  const res = await fetch(`${API_URL}/api/v1/profile/links`, {
    method: "PATCH",
    headers: authHeaders(token),
    body: JSON.stringify({ links }),
  });
  if (!res.ok) throw new Error("Failed to save links");
  return (await res.json()) as ProfileLinksResponse;
};

// ─── Public (by handle) ───────────────────────────────────────────────────

// Token is optional — when present the API sets is_owner so an owner can
// "view as visitor". Handle may include dots; the leading @ is stripped.
export const getPublicProfile = async (
  handle: string,
  token?: string,
): Promise<PublicProfileResponse> => {
  const clean = handle.replace(/^@/, "");
  const res = await fetch(`${API_URL}/api/v1/profiles/${encodeURIComponent(clean)}`, {
    headers: token ? { Authorization: token } : undefined,
  });
  if (res.status === 404) throw new Error("not_found");
  if (!res.ok) throw new Error("Failed to load profile");
  return (await res.json()) as PublicProfileResponse;
};

// Type guard for the private placeholder payload.
export const isPrivateProfile = (
  p: PublicProfileResponse,
): p is Extract<PublicProfileResponse, { private: true }> =>
  (p as { private?: boolean }).private === true;

export type { ProfileLinkRow };
