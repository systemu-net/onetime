import { Pagination } from "@/components/elements/Pagination";
import type { AvailableLink, ProfileLinkRow } from "@/types";
import type { PaginationMeta } from "@/types/pagination";
import {
  ArrowDown,
  ArrowUp,
  Eye,
  EyeOff,
  Pin,
  Plus,
  Trash2,
} from "lucide-react";
import { useEffect, useState } from "react";

const LINK_SORTS = [
  { value: "recent", label: "Recent" },
  { value: "clicks-desc", label: "Most clicks" },
  { value: "clicks-asc", label: "Fewest clicks" },
  { value: "title-asc", label: "Title A–Z" },
  { value: "title-desc", label: "Title Z–A" },
];

function sortLinksBy<T extends { title: string; clicks: number }>(
  items: T[],
  sort: string,
): T[] {
  const arr = [...items];
  switch (sort) {
    case "clicks-desc":
      return arr.sort((a, b) => b.clicks - a.clicks);
    case "clicks-asc":
      return arr.sort((a, b) => a.clicks - b.clicks);
    case "title-asc":
      return arr.sort((a, b) => a.title.localeCompare(b.title));
    case "title-desc":
      return arr.sort((a, b) => b.title.localeCompare(a.title));
    default:
      return arr;
  }
}

const AVAIL_PER_PAGE = 8;

interface Props {
  links: ProfileLinkRow[];
  available: AvailableLink[];
  maxLinks: number;
  moveLink: (i: number, dir: -1 | 1) => void;
  togglePin: (id: number) => void;
  toggleVisible: (id: number) => void;
  removeLink: (id: number) => void;
  addLink: (av: AvailableLink) => void;
  editLinkTitle: (id: number, value: string) => void;
  persistLinks: (rows: ProfileLinkRow[]) => Promise<void>;
}

export function LinksTab({
  links,
  available,
  maxLinks,
  moveLink,
  togglePin,
  toggleVisible,
  removeLink,
  addLink,
  editLinkTitle,
  persistLinks,
}: Props) {
  const [linkQuery, setLinkQuery] = useState("");
  const [linkSort, setLinkSort] = useState("recent");
  const [availPage, setAvailPage] = useState(1);

  useEffect(() => {
    setAvailPage(1);
  }, [linkQuery, linkSort]);

  const q = linkQuery.trim().toLowerCase();
  const matchesQuery = (title: string, slug: string) =>
    !q || title.toLowerCase().includes(q) || slug.toLowerCase().includes(q);

  const shownLinks = q
    ? links.filter((l) => matchesQuery(l.title, l.slug))
    : links;
  const shownAvailable = sortLinksBy(
    available.filter((a) => matchesQuery(a.title, a.slug)),
    linkSort,
  );

  const availPages = Math.max(
    1,
    Math.ceil(shownAvailable.length / AVAIL_PER_PAGE),
  );
  const availSafePage = Math.min(availPage, availPages);
  const pagedAvailable = shownAvailable.slice(
    (availSafePage - 1) * AVAIL_PER_PAGE,
    availSafePage * AVAIL_PER_PAGE,
  );
  const availMeta: PaginationMeta = {
    count: shownAvailable.length,
    page: availSafePage,
    limit: AVAIL_PER_PAGE,
    pages: availPages,
    next: availSafePage < availPages ? availSafePage + 1 : null,
    prev: availSafePage > 1 ? availSafePage - 1 : null,
  };

  return (
    <>
      <div className="tlpe-links-toolbar">
        <div className="tlpe-links-search">
          <span className="tlpe-links-search-icon" aria-hidden>
            ⌕
          </span>
          <input
            className="tlpe-links-search-input"
            placeholder="Search links…"
            value={linkQuery}
            onChange={(e) => setLinkQuery(e.target.value)}
            aria-label="Search links"
          />
        </div>
        <select
          className="tlpe-links-sort"
          value={linkSort}
          onChange={(e) => setLinkSort(e.target.value)}
          aria-label="Order links"
        >
          {LINK_SORTS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>

      <div className="tlpe-links-head">
        <div className="tlpe-section-eyebrow" style={{ margin: 0 }}>
          {q
            ? `${shownLinks.length} of ${links.length} links`
            : `${links.length} / ${maxLinks} links · drag-free reorder`}
        </div>
      </div>

      {links.length === 0 && (
        <div className="tlpe-empty">
          No links on your profile yet — add some below.
        </div>
      )}
      {links.length > 0 && shownLinks.length === 0 && (
        <div className="tlpe-empty">No links match "{linkQuery}".</div>
      )}

      {shownLinks.map((l, i) => (
        <div
          className={`tlpe-link${l.visible ? "" : " tlpe-link--hidden"}`}
          key={l.id}
        >
          <div className="tlpe-link-reorder">
            <button
              type="button"
              className="tlpe-iconbtn"
              disabled={!!q || i === 0}
              onClick={() => moveLink(i, -1)}
              title={q ? "Clear search to reorder" : "Move up"}
            >
              <ArrowUp size={13} />
            </button>
            <button
              type="button"
              className="tlpe-iconbtn"
              disabled={!!q || i === links.length - 1}
              onClick={() => moveLink(i, 1)}
              title={q ? "Clear search to reorder" : "Move down"}
            >
              <ArrowDown size={13} />
            </button>
          </div>
          <div className="tlpe-link-fields">
            <input
              className="tlpe-link-title-input"
              value={l.title}
              onChange={(e) => editLinkTitle(l.id, e.target.value)}
              onBlur={() => persistLinks(links)}
            />
            <span className="tlpe-link-meta">
              thin.ly/{l.slug} · {l.clicks} clicks · {l.state}
            </span>
          </div>
          <button
            type="button"
            className={`tlpe-iconbtn${l.pinned ? " tlpe-iconbtn--on" : ""}`}
            onClick={() => togglePin(l.id)}
            title="Pin"
          >
            <Pin size={14} />
          </button>
          <button
            type="button"
            className={`tlpe-iconbtn${l.visible ? " tlpe-iconbtn--eye" : ""}`}
            onClick={() => toggleVisible(l.id)}
            title={l.visible ? "Hide" : "Show"}
          >
            {l.visible ? <Eye size={14} /> : <EyeOff size={14} />}
          </button>
          <button
            type="button"
            className="tlpe-iconbtn"
            onClick={() => removeLink(l.id)}
            title="Remove"
          >
            <Trash2 size={14} />
          </button>
        </div>
      ))}

      {shownAvailable.length > 0 && (
        <>
          <div className="tlpe-section-eyebrow">Add a link</div>
          {links.length >= maxLinks && (
            <div className="tlpe-limit-note">
              You've reached the {maxLinks}-link limit. Remove one to add
              another.
            </div>
          )}
          <div className="tlpe-add-list">
            {pagedAvailable.map((av) => (
              <div className="tlpe-add-row" key={av.link_id}>
                <div className="tlpe-add-row-info">
                  <div style={{ fontSize: 14, fontWeight: 600 }}>
                    {av.title}
                  </div>
                  <span className="tlpe-link-meta">
                    thin.ly/{av.slug} · {av.clicks} clicks
                  </span>
                </div>
                <button
                  type="button"
                  className="tlp-btn tlp-btn--primary tlp-btn--sm"
                  onClick={() => addLink(av)}
                  disabled={links.length >= maxLinks}
                  title={
                    links.length >= maxLinks
                      ? `Maximum ${maxLinks} links`
                      : "Add to profile"
                  }
                >
                  <Plus size={14} /> Add
                </button>
              </div>
            ))}
          </div>
          <Pagination meta={availMeta} onChange={setAvailPage} />
        </>
      )}
    </>
  );
}
