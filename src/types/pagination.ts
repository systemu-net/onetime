export interface PaginationMeta {
  count: number;
  page: number;
  limit: number;
  pages: number;
  next: number | null;
  prev: number | null;
}

export interface LinkStats {
  total: number;
  active: number;
  paused: number;
  expired: number;
  draft: number;
  totalClicks: number;
}
