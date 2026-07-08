import { useEffect, useState } from "react";
import { api, type AccountProfile } from "./api";

export type SessionState = {
  loading: boolean;
  profile: AccountProfile | null;
};

// Probe the Devise session by fetching the account profile (SPEC §3
// GET /account/profile). A 401 means signed-out — surfaced as profile: null.
// The httpOnly session cookie is never read by JS; this is the display-only
// probe the nav + protected pages use.
export function useSession(): SessionState {
  const [state, setState] = useState<SessionState>({ loading: true, profile: null });

  useEffect(() => {
    let alive = true;
    api<AccountProfile>("/api/levelcode/v1/account/profile")
      .then((profile) => {
        if (alive) setState({ loading: false, profile });
      })
      .catch(() => {
        if (alive) setState({ loading: false, profile: null });
      });
    return () => {
      alive = false;
    };
  }, []);

  return state;
}

// Two-letter avatar fallback from a display name or email.
export function initials(name?: string | null, email?: string | null): string {
  const src = (name || email || "").trim();
  if (!src) return "··";
  const parts = src.split(/[\s@._-]+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return src.slice(0, 2).toUpperCase();
}
