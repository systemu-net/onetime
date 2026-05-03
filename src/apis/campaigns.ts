import type {
  Campaign,
  CampaignCreatePayload,
  CampaignLink,
  CampaignState,
  CampaignUpdatePayload,
} from "@/types/campaigns";
import { API_URL } from "./config";

function inferCampaignType(
  name: string,
): "launch" | "sale" | "event" | "content" | "retargeting" | "affiliate" {
  const normalized = name.toLowerCase();
  if (normalized.includes("sale") || normalized.includes("promo"))
    return "sale";
  if (normalized.includes("event") || normalized.includes("conference"))
    return "event";
  if (normalized.includes("content") || normalized.includes("blog"))
    return "content";
  if (normalized.includes("retarget")) return "retargeting";
  if (normalized.includes("affiliate") || normalized.includes("partner"))
    return "affiliate";
  return "launch";
}

function mapCampaignLink(raw: Record<string, unknown>): CampaignLink {
  return {
    id: raw.id as number,
    lookupCode: (raw.lookup_code as string) ?? "",
    originalUrl: (raw.original_url as string) ?? "",
    title: (raw.title as string) ?? undefined,
    state: (raw.state as CampaignLink["state"]) ?? "draft",
    clicksCount: (raw.clicks_count as number) ?? 0,
  };
}

function mapCampaign(raw: Record<string, unknown>): Campaign {
  const linksRaw = (raw.links as Record<string, unknown>[] | undefined) ?? [];

  return {
    id: raw.id as number,
    name: (raw.name as string) ?? "Untitled Campaign",
    description: (raw.description as string) ?? "",
    state: (raw.state as CampaignState) ?? "active",
    accentColor: (raw.accent_color as string) ?? "#7c3aed",
    linksCount: (raw.links_count as number) ?? linksRaw.length,
    totalClicks:
      (raw.total_clicks as number) ??
      linksRaw.reduce(
        (sum, link) => sum + ((link.clicks_count as number) ?? 0),
        0,
      ),
    createdAt: (raw.created_at as string) ?? new Date().toISOString(),
    updatedAt: (raw.updated_at as string) ?? new Date().toISOString(),
    links: linksRaw.map(mapCampaignLink),
  };
}

async function req<T>(
  token: string,
  method: string,
  path: string,
  body?: unknown,
): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      Authorization: token,
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (response.status === 204) return null as T;

  const data = await response.json();

  if (!response.ok) {
    const errorData = data as {
      error?: string;
      message?: string;
      errors?: string[];
    };
    const message =
      errorData.error ??
      errorData.message ??
      errorData.errors?.join(", ") ??
      `HTTP ${response.status}`;
    throw new Error(message);
  }

  return data as T;
}

export async function fetchCampaigns(token: string): Promise<Campaign[]> {
  const data = await req<{ campaigns: Record<string, unknown>[] }>(
    token,
    "GET",
    "/api/v1/campaigns",
  );
  return (data.campaigns ?? []).map(mapCampaign);
}

export async function fetchCampaign(
  token: string,
  id: number,
): Promise<Campaign> {
  const data = await req<Record<string, unknown>>(
    token,
    "GET",
    `/api/v1/campaigns/${id}`,
  );
  return mapCampaign(data);
}

export async function createCampaign(
  token: string,
  payload: CampaignCreatePayload,
): Promise<Campaign> {
  const data = await req<Record<string, unknown>>(
    token,
    "POST",
    "/api/v1/campaigns",
    {
      campaign: {
        name: payload.name,
        description: payload.description ?? "",
        state: payload.state,
        accent_color: payload.color,
      },
    },
  );

  const mapped = mapCampaign(data);
  return {
    ...mapped,
    accentColor: mapped.accentColor || payload.color || "#7c3aed",
  };
}

export async function updateCampaign(
  token: string,
  id: number,
  payload: CampaignUpdatePayload,
): Promise<Campaign> {
  const data = await req<Record<string, unknown>>(
    token,
    "PATCH",
    `/api/v1/campaigns/${id}`,
    {
      campaign: {
        ...payload,
        accent_color: payload.color,
      },
    },
  );

  return mapCampaign(data);
}

export async function deleteCampaign(token: string, id: number): Promise<void> {
  await req(token, "DELETE", `/api/v1/campaigns/${id}`);
}

export async function pauseCampaign(
  token: string,
  id: number,
  reason?: string,
): Promise<void> {
  await req(token, "POST", `/api/v1/campaigns/${id}/pause`, { reason });
}

export async function resumeCampaign(
  token: string,
  id: number,
  reason?: string,
): Promise<void> {
  await req(token, "POST", `/api/v1/campaigns/${id}/resume`, { reason });
}

export function getCampaignType(name: string) {
  return inferCampaignType(name);
}
