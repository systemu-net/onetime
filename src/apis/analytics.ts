import { API_URL } from "./config";

export type TimelinePeriod = "24h" | "7d" | "30d" | "all";
export type TimelineGranularity = "hour" | "day" | "month";

export interface TimelinePoint {
  at: string; // human-readable bucket label e.g. "Mon", "14:00", "Jan"
  starts_at: string; // ISO8601 timestamp at bucket start
  clicks: number;
}

export interface ClicksTimeline {
  period: TimelinePeriod;
  granularity: TimelineGranularity;
  total_clicks: number;
  avg_per_day: number;
  points: TimelinePoint[];
}

/**
 * Aggregate click counts over time for the current user.
 * Returns a fully-filled series (zero buckets included).
 */
export const fetchClicksTimeline = async (
  jwtToken: string,
  period: TimelinePeriod = "7d",
): Promise<ClicksTimeline | null> => {
  try {
    const res = await fetch(
      `${API_URL}/api/v1/analytics/clicks_timeline?period=${period}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: jwtToken,
        },
      },
    );
    if (!res.ok) return null;
    return (await res.json()) as ClicksTimeline;
  } catch {
    return null;
  }
};
