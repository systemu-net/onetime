import {
  deleteAvatarApi,
  logoutApi,
  updateAvatarApi,
} from "@/apis/authentication";
import { API_URL } from "@/apis/config";
import {
  checkHandle,
  getMyProfile,
  getProfileLinks,
  publishProfile,
  updateProfile,
  updateProfileLinks,
  type ProfileLinkInput,
  type ProfileUpdate,
} from "@/apis/profile";
import { LANDING_ROUTE } from "@/routes";
import type {
  AvailableLink,
  HandleCheck,
  Profile,
  ProfileLinkRow,
} from "@/types";
import { invalidateUserCache } from "@/utils/userCache";
import { useCallback, useEffect, useRef, useState } from "react";
import { useCookies } from "react-cookie";
import { useNavigate } from "react-router-dom";

export type SaveState = "idle" | "saving" | "saved";

export function useProfileEditor() {
  const [cookies, , removeCookie] = useCookies(["token"]);
  const token = cookies.token as string;
  const navigate = useNavigate();

  const [draft, setDraft] = useState<Profile | null>(null);
  const [links, setLinks] = useState<ProfileLinkRow[]>([]);
  const [available, setAvailable] = useState<AvailableLink[]>([]);
  const [save, setSave] = useState<SaveState>("idle");
  const [published, setPublished] = useState(false);
  const [handleState, setHandleState] = useState<HandleCheck | null>(null);
  const [avatarBusy, setAvatarBusy] = useState(false);

  const handleTimer = useRef<number | undefined>(undefined);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── Data loading ──────────────────────────────────────────────────────
  useEffect(() => {
    let active = true;
    getMyProfile(token)
      .then((p) => active && setDraft(p))
      .catch(() => {});
    getProfileLinks(token)
      .then((res) => {
        if (!active) return;
        setLinks(res.links);
        setAvailable(res.available_links);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [token]);

  // ── Auth actions ──────────────────────────────────────────────────────
  const signOut = async () => {
    try {
      await logoutApi(token);
    } catch {
      /* sign out locally regardless */
    }
    invalidateUserCache();
    removeCookie("token");
    navigate(LANDING_ROUTE);
  };

  const openBilling = async () => {
    try {
      const res = await fetch(`${API_URL}/api/v1/billings`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: token },
      });
      if (!res.ok) throw new Error("Billing portal unavailable");
      const { url } = await res.json();
      window.location.href = url;
    } catch (err) {
      console.error(err);
    }
  };

  // ── Persist helpers ───────────────────────────────────────────────────
  const persistProfile = useCallback(
    async (patch: ProfileUpdate) => {
      setSave("saving");
      try {
        const updated = await updateProfile(token, patch);
        setDraft((d) => (d ? { ...d, ...updated } : updated));
        if ("handle" in patch) invalidateUserCache();
        setSave("saved");
        window.setTimeout(() => setSave("idle"), 1600);
      } catch {
        setSave("idle");
      }
    },
    [token],
  );

  const persistLinks = useCallback(
    async (rows: ProfileLinkRow[]) => {
      setLinks(rows); // optimistic
      const inputs: ProfileLinkInput[] = rows.map((l, i) => ({
        link_id: l.link_id,
        position: i,
        pinned: l.pinned,
        visible: l.visible,
        title_override: l.title_override,
        tag: l.tag,
      }));
      try {
        const res = await updateProfileLinks(token, inputs);
        setLinks(res.links);
        setAvailable(res.available_links);
      } catch {
        /* keep optimistic state */
      }
    },
    [token],
  );

  // ── Field helpers ─────────────────────────────────────────────────────
  const setField = (key: keyof Profile, value: string) =>
    setDraft((d) => (d ? { ...d, [key]: value } : d));

  const setSocial = (key: string, value: string) =>
    setDraft((d) =>
      d ? { ...d, socials: { ...d.socials, [key]: value } } : d,
    );

  const onHandleChange = (value: string) => {
    const clean = value.toLowerCase().replace(/[^a-z0-9_.-]/g, "");
    setField("handle", clean);
    window.clearTimeout(handleTimer.current);
    handleTimer.current = window.setTimeout(() => {
      checkHandle(token, clean)
        .then(setHandleState)
        .catch(() => setHandleState(null));
    }, 400);
  };

  const onPublish = async () => {
    try {
      const p = await publishProfile(token);
      setDraft((d) => (d ? { ...d, ...p } : p));
      setPublished(true);
      window.setTimeout(() => setPublished(false), 2200);
    } catch {
      /* noop */
    }
  };

  // ── Avatar ────────────────────────────────────────────────────────────
  const onAvatarFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (!file || !file.type.startsWith("image/") || file.size > 5 * 1024 * 1024)
      return;
    setAvatarBusy(true);
    const [data, err] = await updateAvatarApi(token, file);
    if (!err && data?.avatar_url) {
      const url = `${data.avatar_url}${data.avatar_url.includes("?") ? "&" : "?"}v=${Date.now()}`;
      setDraft((d) => (d ? { ...d, avatar_url: url } : d));
      invalidateUserCache();
    }
    setAvatarBusy(false);
  };

  const onAvatarRemove = async () => {
    setAvatarBusy(true);
    const [, err] = await deleteAvatarApi(token);
    if (!err) {
      setDraft((d) => (d ? { ...d, avatar_url: null } : d));
      invalidateUserCache();
    }
    setAvatarBusy(false);
  };

  // ── Link mutations ────────────────────────────────────────────────────
  const MAX_LINKS = 10;

  const moveLink = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= links.length) return;
    const next = [...links];
    [next[i], next[j]] = [next[j], next[i]];
    persistLinks(next);
  };
  const togglePin = (id: number) =>
    persistLinks(
      links.map((l) => (l.id === id ? { ...l, pinned: !l.pinned } : l)),
    );
  const toggleVisible = (id: number) =>
    persistLinks(
      links.map((l) => (l.id === id ? { ...l, visible: !l.visible } : l)),
    );
  const removeLink = (id: number) =>
    persistLinks(links.filter((l) => l.id !== id));
  const addLink = (av: AvailableLink) => {
    if (links.length >= MAX_LINKS) return;
    persistLinks([
      ...links,
      {
        id: -av.link_id,
        link_id: av.link_id,
        title: av.title,
        title_override: null,
        slug: av.slug,
        url: av.url,
        host: av.host,
        clicks: av.clicks,
        state: av.state,
        tag: null,
        pinned: false,
        visible: true,
        position: links.length,
        spark: [],
      },
    ]);
  };
  const editLinkTitle = (id: number, value: string) =>
    setLinks((ls) =>
      ls.map((l) =>
        l.id === id
          ? { ...l, title_override: value, title: value || l.title }
          : l,
      ),
    );

  return {
    token,
    draft,
    setDraft,
    links,
    available,
    save,
    published,
    handleState,
    avatarBusy,
    fileInputRef,
    signOut,
    openBilling,
    persistProfile,
    persistLinks,
    setField,
    setSocial,
    onHandleChange,
    onPublish,
    onAvatarFile,
    onAvatarRemove,
    MAX_LINKS,
    moveLink,
    togglePin,
    toggleVisible,
    removeLink,
    addLink,
    editLinkTitle,
  };
}
