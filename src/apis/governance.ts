import type {
  AuditLogEntry,
  CreateGovernedLinkPayload,
  GovernanceLink,
  LinkState,
  RoutingRule,
  RuleType,
} from "../types/governance";
import { API_URL, SHORT_URL } from "./config";

// ── Helpers ────────────────────────────────────────────────────────────────────

function generateRuleDesc(rule: Record<string, unknown>): string {
  const rt = rule.rule_type as string;
  const c = (rule.conditions as Record<string, unknown>) ?? {};
  if (rt === "geo")
    return `Geo: ${[c.country_code, c.region, c.city].filter(Boolean).join(", ")} → redirect`;
  if (rt === "device") return `Device: ${c.device_type ?? "unknown"} users`;
  if (rt === "time")
    return `Time window: ${c.start_time ?? "—"} – ${c.end_time ?? "—"}`;
  if (rt === "split") return `A/B split — ${c.weight ?? 50}% of traffic`;
  return rt;
}

function mapRule(raw: Record<string, unknown>): RoutingRule {
  const c = (raw.conditions as Record<string, unknown>) ?? {};
  return {
    id: raw.id as number,
    type: (raw.rule_type as RuleType) ?? "geo",
    dest: (raw.destination_url as string) ?? "",
    desc: generateRuleDesc(raw),
    weight: c.weight as number | undefined,
  };
}

function mapAuditLog(raw: Record<string, unknown>): AuditLogEntry {
  const ACTION_META: Record<string, { label: string; color: string }> = {
    state_change: { label: "State changed", color: "#7c3aed" },
    destination_update: { label: "Destination updated", color: "#3b82f6" },
    rule_added: { label: "Routing rule added", color: "#10b981" },
    rule_updated: { label: "Routing rule updated", color: "#22c55e" },
    rule_removed: { label: "Routing rule removed", color: "#f59e0b" },
    campaign_assigned: { label: "Campaign changed", color: "#3b82f6" },
    campaign_changed: { label: "Campaign changed", color: "#3b82f6" },
    password_toggled: { label: "Password toggled", color: "#ef4444" },
    cap_reached: { label: "Click cap reached", color: "#ef4444" },
    link_created: { label: "Link created", color: "#10b981" },
  };

  const action = raw.action as string;
  const meta = ACTION_META[action] ?? {
    label: action.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
    color: "#9090aa",
  };

  const createdAt = new Date(raw.created_at as string);
  const diffMs = Date.now() - createdAt.getTime();
  const mins = Math.floor(diffMs / 60_000);
  const hrs = Math.floor(mins / 60);
  const days = Math.floor(hrs / 24);
  const timeStr =
    days > 0
      ? `${days}d ago`
      : hrs > 0
        ? `${hrs}h ago`
        : mins > 0
          ? `${mins}m ago`
          : "just now";

  const before = (raw.before_state as Record<string, unknown> | null) ?? null;
  const after = (raw.after_state as Record<string, unknown> | null) ?? null;

  let detail = "";
  if (before && after) {
    const prevCampaign = before.campaign_name as string | undefined;
    const nextCampaign = after.campaign_name as string | undefined;
    const prevState = before.state as string | undefined;
    const nextState = after.state as string | undefined;
    if (action === "campaign_assigned" || action === "campaign_changed") {
      detail = `${prevCampaign ?? "Unassigned"} → ${nextCampaign ?? "Unassigned"}`;
    } else if (prevState || nextState) {
      detail = `${prevState ?? "—"} → ${nextState ?? "—"}`;
    } else {
      const prevDest = before.destination_url as string | undefined;
      const nextDest = after.destination_url as string | undefined;
      if (prevDest || nextDest) {
        detail = `${prevDest ?? "—"} → ${nextDest ?? "—"}`;
      }
    }
  }

  if (!detail) {
    detail = (raw.reason as string) ?? "";
  }

  return {
    id: raw.id as number,
    action: meta.label,
    detail,
    time: timeStr,
    color: meta.color,
  };
}

function mapLink(raw: Record<string, unknown>): GovernanceLink {
  return {
    id: raw.lookup_code as string,
    lookup_code: raw.lookup_code as string,
    name: (raw.title as string) || (raw.lookup_code as string),
    dest: (raw.original_url as string) ?? "",
    short: `${SHORT_URL}/${raw.lookup_code}`,
    state: (raw.state as LinkState) ?? "draft",
    clicks: (raw.clicks_count as number) ?? 0,
    cap: (raw.click_cap as number | null) ?? null,
    governance: (raw.governance_enabled as boolean) ?? false,
    activatesAt: (raw.activates_at as string | null) ?? null,
    expiresAt: (raw.expires_at as string | null) ?? null,
    pausedRedirectUrl: (raw.paused_redirect_url as string | null) ?? null,
    expiredRedirectUrl: (raw.expired_redirect_url as string | null) ?? null,
    campaign: null,
    linkCampaignId: (raw.link_campaign_id as number | null) ?? null,
    linkCampaignColor: null,
    qrImageUrl: null,
    rules: [],
  };
}

// ── Base request ───────────────────────────────────────────────────────────────

async function req<T>(
  jwtToken: string,
  method: string,
  path: string,
  body?: unknown,
): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      Authorization: jwtToken,
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  if (res.status === 204) return null as T;
  const data = await res.json();
  if (!res.ok) {
    const asObj = data as {
      error?: string;
      message?: string;
      errors?: string[];
    };
    const msg =
      asObj.error ??
      asObj.message ??
      asObj.errors?.join(", ") ??
      `HTTP ${res.status}`;
    throw new Error(msg);
  }
  return data as T;
}

// ── Exported API functions ─────────────────────────────────────────────────────

export async function fetchGovernanceLinks(
  jwtToken: string,
): Promise<GovernanceLink[]> {
  const data = await req<{ links: Record<string, unknown>[] }>(
    jwtToken,
    "GET",
    "/api/v1/links",
  );
  return (data.links ?? []).map(mapLink);
}

export async function createGovernedLink(
  jwtToken: string,
  payload: CreateGovernedLinkPayload,
): Promise<GovernanceLink> {
  const body = {
    link: {
      original_url: payload.originalUrl,
      title: payload.title,
      state: payload.state,
      governance_enabled: true,
      click_cap: payload.clickCap,
      activates_at: payload.activatesAt,
      expires_at: payload.expiresAt,
      link_campaign_id: payload.linkCampaignId,
    },
  };

  const data = await req<{ link: Record<string, unknown> }>(
    jwtToken,
    "POST",
    "/api/v1/links",
    body,
  );

  // Create response does not include original_url, so preserve user-submitted destination.
  return mapLink({
    ...(data.link ?? {}),
    original_url: payload.originalUrl,
    governance_enabled: true,
    state: payload.state,
    click_cap: payload.clickCap ?? null,
    activates_at: payload.activatesAt ?? null,
    expires_at: payload.expiresAt ?? null,
    title: payload.title ?? (data.link?.title as string | undefined),
  });
}

export async function transitionLink(
  jwtToken: string,
  lookupCode: string,
  state: LinkState,
  reason?: string,
): Promise<void> {
  await req(
    jwtToken,
    "PATCH",
    `/api/v1/links/${lookupCode}/governance/transition`,
    { state, reason },
  );
}

export async function pauseAllGovernedLinks(
  jwtToken: string,
  reason?: string,
): Promise<{
  pausedCount: number;
  pausedLookupCodes: string[];
  message?: string;
}> {
  const data = await req<{
    paused_count?: number;
    paused_lookup_codes?: string[];
    message?: string;
  }>(jwtToken, "POST", "/api/v1/links/governance/pause_all", { reason });

  return {
    pausedCount: data.paused_count ?? 0,
    pausedLookupCodes: data.paused_lookup_codes ?? [],
    message: data.message,
  };
}

export async function updateDestination(
  jwtToken: string,
  lookupCode: string,
  destinationUrl: string,
  reason?: string,
): Promise<void> {
  await req(
    jwtToken,
    "PATCH",
    `/api/v1/links/${lookupCode}/governance/destination`,
    {
      destination_url: destinationUrl,
      reason,
    },
  );
}

export async function updateLinkName(
  jwtToken: string,
  lookupCode: string,
  title: string,
): Promise<void> {
  await req(jwtToken, "PATCH", `/api/v1/links/${lookupCode}`, {
    link: {
      title,
    },
  });
}

export async function updateFallbackUrls(
  jwtToken: string,
  lookupCode: string,
  pausedRedirectUrl: string,
  expiredRedirectUrl: string,
): Promise<void> {
  await req(jwtToken, "PATCH", `/api/v1/links/${lookupCode}`, {
    link: {
      paused_redirect_url:
        pausedRedirectUrl.trim() === "" ? null : pausedRedirectUrl.trim(),
      expired_redirect_url:
        expiredRedirectUrl.trim() === "" ? null : expiredRedirectUrl.trim(),
    },
  });
}

export async function updateClickCap(
  jwtToken: string,
  lookupCode: string,
  clickCap: number | null,
): Promise<void> {
  await req(jwtToken, "PATCH", `/api/v1/links/${lookupCode}`, {
    link: {
      click_cap: clickCap,
    },
  });
}

export async function updateLifecycleSchedule(
  jwtToken: string,
  lookupCode: string,
  activatesAt: string | null,
  expiresAt: string | null,
): Promise<void> {
  await req(jwtToken, "PATCH", `/api/v1/links/${lookupCode}`, {
    link: {
      activates_at: activatesAt,
      expires_at: expiresAt,
    },
  });
}

export async function assignLinkToCampaign(
  jwtToken: string,
  lookupCode: string,
  campaignId: number | null,
): Promise<void> {
  await req(jwtToken, "PATCH", `/api/v1/links/${lookupCode}`, {
    link: {
      link_campaign_id: campaignId,
    },
  });
}

export async function fetchAuditLog(
  jwtToken: string,
  lookupCode: string,
): Promise<AuditLogEntry[]> {
  const data = await req<{ logs: Record<string, unknown>[] }>(
    jwtToken,
    "GET",
    `/api/v1/links/${lookupCode}/governance/audit_log`,
  );
  return (data.logs ?? []).map(mapAuditLog);
}

export async function fetchRoutingRules(
  jwtToken: string,
  lookupCode: string,
): Promise<RoutingRule[]> {
  const data = await req<{ routing_rules: Record<string, unknown>[] }>(
    jwtToken,
    "GET",
    `/api/v1/links/${lookupCode}/routing_rules`,
  );
  return (data.routing_rules ?? []).map(mapRule);
}

export async function deleteRoutingRule(
  jwtToken: string,
  lookupCode: string,
  ruleId: number,
): Promise<void> {
  await req(
    jwtToken,
    "DELETE",
    `/api/v1/links/${lookupCode}/routing_rules/${ruleId}`,
  );
}

export async function deleteGovernedLink(
  jwtToken: string,
  lookupCode: string,
): Promise<void> {
  await req(jwtToken, "DELETE", `/api/v1/links/${lookupCode}`);
}
