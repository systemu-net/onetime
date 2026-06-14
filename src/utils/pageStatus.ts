/**
 * Single source of truth for a page's *publish* state.
 *
 * Why this exists: the dashboard (`/pages`) lists the **draft** record of each
 * page, whose raw `status` column is always `"DRAFT"` — a draft never flips to
 * `"PUBLISHED"`; instead it gains a separate published *version*. So reading
 * `page.status` to decide "is this live?" is always wrong on the dashboard.
 *
 * The backend exposes the real signals on every page payload:
 *   • `has_published_version` — true the instant a page is published, false the
 *     instant it is unpublished (does NOT wait for the async GitHub Pages job).
 *   • `published_url` — the live public URL, set only once the publish job
 *     finishes (and cleared on unpublish). This gates the "View live" link.
 *
 * Use these helpers everywhere a page's publish state is shown so the badge,
 * the "View live" button, the counts and the editor all agree.
 */
import type { Page } from '@/types';

export type PageStatus = 'draft' | 'publishing' | 'published';

/** True when the page is published (live) or in the process of going live. */
export function isPagePublished(page: Pick<Page, 'has_published_version' | 'published_url'>): boolean {
  return page.has_published_version === true || !!page.published_url;
}

/**
 * Resolve the page's publish state:
 *   - `draft`      — never published / has been unpublished
 *   - `publishing` — publish requested, async job hasn't produced a URL yet
 *   - `published`  — live, with a public URL
 */
export function getPageStatus(
  page: Pick<Page, 'has_published_version' | 'published_url'>,
): PageStatus {
  if (!isPagePublished(page)) return 'draft';
  return page.published_url ? 'published' : 'publishing';
}

/**
 * True when a live page has edits in its draft that haven't been published yet
 * (the draft was updated after the last publish).
 */
export function hasUnpublishedChanges(
  page: Pick<Page, 'has_published_version' | 'published_url' | 'updated_at' | 'published_at'>,
): boolean {
  if (!isPagePublished(page)) return false;
  if (!page.updated_at || !page.published_at) return false;
  return new Date(page.updated_at).getTime() > new Date(page.published_at).getTime();
}
