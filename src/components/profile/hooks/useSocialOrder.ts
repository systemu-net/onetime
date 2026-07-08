import type { ProfileUpdate } from "@/apis/profile";
import type { Profile } from "@/types";
import { useCallback, useEffect, useRef, useState } from "react";
import { SOCIAL_PLATFORM_MAP, SOCIAL_PLATFORMS } from "../socialPlatforms";

export function useSocialOrder(
  draft: Profile | null,
  persistProfile: (patch: ProfileUpdate) => Promise<void>,
) {
  const [activeSocials, setActiveSocials] = useState<string[]>([]);
  const [dragSocial, setDragSocial] = useState<string | null>(null);
  const dragSocialRef = useRef<string | null>(null);
  const activeSocialsRef = useRef<string[]>([]);
  const socialsInit = useRef(false);

  // Seed active platforms from the loaded profile (once).
  useEffect(() => {
    if (!draft || socialsInit.current) return;
    socialsInit.current = true;
    const saved = (draft.social_order ?? []).filter(
      (k) => SOCIAL_PLATFORM_MAP[k],
    );
    const withValues = SOCIAL_PLATFORMS.filter(
      (p) => ((draft.socials?.[p.key] as string) ?? "").trim().length > 0,
    ).map((p) => p.key);
    const merged = [...saved, ...withValues.filter((k) => !saved.includes(k))];
    setActiveSocials(merged);
  }, [draft]);

  // Mirror order into ref so drag-end can read the latest.
  useEffect(() => {
    activeSocialsRef.current = activeSocials;
  }, [activeSocials]);

  const onSocialDragStart = (e: React.DragEvent, key: string) => {
    dragSocialRef.current = key;
    setDragSocial(key);
    e.dataTransfer.effectAllowed = "move";
    const row = (e.currentTarget as HTMLElement).closest(".tlpe-social-field");
    if (row)
      e.dataTransfer.setDragImage(
        row,
        24,
        (row as HTMLElement).offsetHeight / 2,
      );
  };

  const moveSocialOver = (overKey: string) => {
    const dragKey = dragSocialRef.current;
    if (!dragKey || dragKey === overKey) return;
    setActiveSocials((cur) => {
      const from = cur.indexOf(dragKey);
      const to = cur.indexOf(overKey);
      if (from < 0 || to < 0) return cur;
      const next = [...cur];
      next.splice(from, 1);
      next.splice(to, 0, dragKey);
      return next;
    });
  };

  const onSocialDragEnd = useCallback(() => {
    if (dragSocialRef.current)
      persistProfile({ social_order: activeSocialsRef.current });
    dragSocialRef.current = null;
    setDragSocial(null);
  }, [persistProfile]);

  return {
    activeSocials,
    setActiveSocials,
    dragSocial,
    onSocialDragStart,
    moveSocialOver,
    onSocialDragEnd,
  };
}
