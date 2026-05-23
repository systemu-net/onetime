import "@/components/campaigns/campaigns.css";
import type { GovernanceLink } from "@/types/governance";
import { extractDomain } from "@/utils/transformers";
import { useState } from "react";
import { LuMousePointerClick } from "react-icons/lu";
import { TbWorld } from "react-icons/tb";
import { GovernanceBadge } from "./GovernanceBadge";
import { GOVERNANCE_TABLE_COLUMNS } from "./GovernanceLinksTable";

const MAX_CLICKS = 35_000;
function barPct(clicks: number, cap: number | null) {
  return cap
    ? Math.min(100, (clicks / cap) * 100)
    : Math.min(100, (clicks / MAX_CLICKS) * 100);
}

function splitShort(short: string): { domain: string; slug: string } {
  const stripped = short.replace(/^https?:\/\//i, "");
  const idx = stripped.indexOf("/");
  if (idx === -1) return { domain: stripped, slug: "" };
  return {
    domain: stripped.slice(0, idx),
    slug: stripped.slice(idx + 1),
  };
}

function formatClicks(n: number): string {
  if (n >= 1_000_000)
    return (n / 1_000_000).toFixed(1).replace(/\.0$/, "") + "m";
  if (n >= 1_000) return (n / 1_000).toFixed(1).replace(/\.0$/, "") + "k";
  return n.toString();
}

const STATE_STRIPE: Record<string, string> = {
  active: "#2a7a5c",
  paused: "#b5613c",
  expired: "#b54a31",
  draft: "#9a9aa8",
  archived: "#9a9aa8",
};

interface Props {
  link: GovernanceLink;
  flashingId?: string | null;
  onSelect: (link: GovernanceLink) => void;
  onDismiss: () => void;
}

export function GovernanceLastOpenedTable({
  link,
  flashingId,
  onSelect,
  onDismiss,
}: Props) {
  const [faviconError, setFaviconError] = useState(false);

  return (
    <div className="cc-panel-card">
      {/* Header — same pattern as Current Plan card on home page */}
      <div className="cc-panel-head">
        <span className="cc-panel-head-title">↩ Last Opened Link</span>
        <button
          onClick={onDismiss}
          title="Dismiss"
          className="w-6 h-6 flex items-center justify-center rounded border border-transparent text-neutral-400 hover:border-neutral-200 dark:hover:border-neutral-700 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-xs transition-colors"
        >
          ✕
        </button>
      </div>

      {/* Mobile / tablet card (< lg) — v7 styling, matches GovernanceLinksTable cards */}
      <div className="lg:hidden px-3 sm:px-4 py-3">
        {(() => {
          const { domain, slug } = splitShort(link.short);
          const destDisplay = link.dest.replace(/^https?:\/\//i, "");
          const stripe = STATE_STRIPE[link.state] ?? STATE_STRIPE.draft;
          return (
            <div
              data-last-opened-link-id={link.id}
              onClick={() => onSelect(link)}
              className={[
                "relative cursor-pointer rounded-2xl border bg-white dark:bg-neutral-900 overflow-hidden",
                "pl-4 pr-3 py-3.5",
                "shadow-[0_1px_0_rgba(0,0,0,0.02),0_2px_8px_rgba(0,0,0,0.03)]",
                "border-violet-400/50 ring-1 ring-violet-400/25",
                "transition-colors active:bg-neutral-50 dark:active:bg-neutral-800",
                link.id === flashingId ? "gov-link-row--flash" : "",
              ]
                .filter(Boolean)
                .join(" ")}
            >
              {/* Left state stripe — full-height, matches campaign-card accent */}
              <span
                aria-hidden
                className="absolute left-0 top-0 bottom-0 w-[4px]"
                style={{ background: stripe }}
              />

              {/* Header row: favicon + short link + pin marker */}
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="shrink-0">
                  {faviconError ? (
                    <div className="flex h-9 w-9 items-center justify-center rounded-full border border-neutral-200 dark:border-neutral-700 bg-neutral-100 dark:bg-neutral-800">
                      <TbWorld className="h-4 w-4 text-neutral-500 dark:text-neutral-400" />
                    </div>
                  ) : (
                    <img
                      alt={extractDomain(link.dest)}
                      draggable={false}
                      loading="lazy"
                      width="36"
                      height="36"
                      className="h-9 w-9 rounded-full border border-neutral-200 dark:border-neutral-700 bg-white object-cover"
                      src={`https://www.google.com/s2/favicons?sz=64&domain_url=${extractDomain(link.dest)}`}
                      onError={() => setFaviconError(true)}
                    />
                  )}
                </div>
                <span
                  className="min-w-0 flex-1 truncate text-[13.5px] leading-tight"
                  title={link.short}
                >
                  <span className="text-neutral-500 dark:text-neutral-400 font-medium">
                    {domain}
                  </span>
                  <span className="text-neutral-400 dark:text-neutral-600">
                    /
                  </span>
                  <span className="font-bold text-neutral-900 dark:text-neutral-100">
                    {slug}
                  </span>
                </span>
                <span
                  aria-label="Last opened"
                  title="Last opened"
                  className="shrink-0 inline-flex h-6 items-center gap-1 rounded-full bg-violet-50 dark:bg-violet-500/10 px-2 text-[10.5px] font-mono font-medium uppercase tracking-wide text-violet-600 dark:text-violet-300"
                >
                  ↩ Last
                </span>
              </div>

              {/* Destination block */}
              <a
                href={link.dest}
                target="_blank"
                rel="noreferrer"
                onClick={(e) => e.stopPropagation()}
                title={link.dest}
                className="mt-2.5 flex items-start gap-2 rounded-lg bg-neutral-100/80 dark:bg-neutral-800/60 px-3 py-2 text-[12.5px] leading-snug text-neutral-700 dark:text-neutral-300 hover:text-violet-600 dark:hover:text-violet-300 transition-colors"
              >
                <span
                  aria-hidden
                  className="shrink-0 text-neutral-400 font-medium"
                >
                  ↳
                </span>
                <span className="min-w-0 flex-1 line-clamp-2 break-all">
                  {destDisplay}
                </span>
              </a>

              {/* Meta row */}
              <div className="mt-2.5 flex items-center gap-1.5 min-w-0">
                <GovernanceBadge state={link.state} />
                {link.campaign && (
                  <span
                    className="min-w-0 truncate max-w-[40%] rounded-md border border-neutral-200 dark:border-white/[0.08] bg-neutral-50 dark:bg-neutral-800/60 px-2 py-[3px] font-mono text-[10.5px] text-neutral-600 dark:text-neutral-300"
                    title={link.campaign}
                  >
                    {link.campaign}
                  </span>
                )}
                {link.rulesCount > 0 && (
                  <span className="shrink-0 rounded-md border border-violet-200 dark:border-violet-500/30 bg-violet-50 dark:bg-violet-500/10 px-2 py-[3px] font-mono text-[10.5px] text-violet-600 dark:text-violet-300">
                    {link.rulesCount} rule{link.rulesCount > 1 ? "s" : ""}
                  </span>
                )}
                <span className="ml-auto inline-flex shrink-0 items-center gap-1.5 rounded-full border border-neutral-200 dark:border-white/[0.08] bg-neutral-50 dark:bg-neutral-800/60 px-2.5 py-[3px] text-[11px] text-neutral-600 dark:text-neutral-300">
                  <LuMousePointerClick
                    size={11}
                    strokeWidth={2}
                    className="text-[#4a7fb8]"
                  />
                  <strong className="font-mono font-bold text-neutral-900 dark:text-neutral-100">
                    {formatClicks(link.clicks)}
                  </strong>
                  {link.clicks === 1 ? "click" : "clicks"}
                </span>
              </div>

              {link.clicks > 0 && (
                <div className="mt-2.5 h-0.5 overflow-hidden rounded-full bg-neutral-200/70 dark:bg-neutral-800">
                  <div
                    className="gov-clicks-bar-fill h-full"
                    style={{ width: `${barPct(link.clicks, link.cap)}%` }}
                  />
                </div>
              )}
            </div>
          );
        })()}
      </div>

      {/* Table — identical widths and column structure to GovernanceLinksTable */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="w-full table-fixed min-w-0 md:min-w-[860px] lg:min-w-[1160px] xl:min-w-[1360px]">
          <thead>
            <tr className="border-b border-neutral-100 dark:border-white/[0.04]">
              {/* Matches the w-[56px] checkbox column in GovernanceLinksTable */}
              <th className="px-5 py-3 text-left w-[56px]" />
              {GOVERNANCE_TABLE_COLUMNS.map((col) => (
                <th
                  key={col.key}
                  className={`px-5 py-3 text-left text-[11px] font-medium uppercase tracking-[0.06em] text-neutral-400 font-mono ${col.className ?? ""}`}
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr
              data-last-opened-link-id={link.id}
              onClick={() => onSelect(link)}
              className={[
                "gov-link-row gov-link-row--last-opened cursor-pointer group",
                link.id === flashingId ? "gov-link-row--flash" : "",
              ]
                .filter(Boolean)
                .join(" ")}
              style={{
                ["--gov-row-accent" as string]:
                  link.linkCampaignColor ?? "transparent",
              }}
            >
              {/* Pin indicator — w-[56px] matches checkbox column in GovernanceLinksTable */}
              <td className="px-5 py-3.5 text-center text-[13px] text-violet-400 select-none w-[56px]">
                ↩
              </td>

              {/* Name + short code */}
              <td className="px-5 py-3.5">
                <div className="flex items-center gap-2">
                  <div className="shrink-0">
                    {faviconError ? (
                      <div className="rounded-full size-5 border border-neutral-200 dark:border-neutral-600 bg-neutral-100 dark:bg-neutral-700 flex items-center justify-center">
                        <TbWorld className="w-3 h-3 text-neutral-500 dark:text-neutral-400" />
                      </div>
                    ) : (
                      <img
                        alt={extractDomain(link.dest)}
                        draggable={false}
                        loading="lazy"
                        width="20"
                        height="20"
                        className="rounded-full size-5 border border-neutral-200 dark:border-neutral-600"
                        src={`https://www.google.com/s2/favicons?sz=64&domain_url=${extractDomain(link.dest)}`}
                        onError={() => setFaviconError(true)}
                      />
                    )}
                  </div>
                  <div className="font-medium text-[13.5px] text-neutral-900 dark:text-neutral-100 truncate">
                    {link.name}
                  </div>
                </div>
                <div className="mt-0.5">
                  <span className="font-mono text-[11.5px] px-1.5 py-0.5 rounded bg-violet-500/10 border border-violet-500/20 text-violet-400">
                    {link.short}
                  </span>
                </div>
              </td>

              {/* State badge */}
              <td className="px-5 py-3.5 hidden md:table-cell">
                <GovernanceBadge state={link.state} />
              </td>

              {/* Destination */}
              <td
                className="px-5 py-3.5 hidden md:table-cell w-[420px] xl:w-[520px]"
                onClick={(e) => e.stopPropagation()}
              >
                <a
                  href={link.dest}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-neutral-500 dark:text-neutral-300 truncate block hover:text-violet-500 dark:hover:text-violet-400 hover:underline"
                  title={link.dest}
                >
                  {link.dest}
                </a>
              </td>

              {/* Clicks */}
              <td className="px-5 py-3.5 hidden md:table-cell">
                <div className="w-24">
                  <div className="text-[12.5px] font-mono font-medium text-neutral-700 dark:text-neutral-300">
                    {link.clicks.toLocaleString()}
                  </div>
                  <div className="mt-1.5 h-0.5 rounded-full bg-neutral-200 dark:bg-neutral-700 overflow-hidden">
                    <div
                      className="gov-clicks-bar-fill h-full"
                      style={{ width: `${barPct(link.clicks, link.cap)}%` }}
                    />
                  </div>
                </div>
              </td>

              {/* Routing */}
              <td className="px-5 py-3.5 hidden lg:table-cell">
                {link.rulesCount > 0 ? (
                  <span className="text-xs font-mono text-violet-400">
                    {link.rulesCount} rule{link.rulesCount > 1 ? "s" : ""}
                  </span>
                ) : (
                  <span className="text-xs text-neutral-400">—</span>
                )}
              </td>

              {/* Campaign */}
              <td className="px-5 py-3.5 hidden lg:table-cell">
                {link.campaign ? (
                  <span className="text-xs px-2 py-0.5 rounded font-medium border border-neutral-200 dark:border-white/[0.08] bg-white/80 dark:bg-neutral-900/60 text-neutral-700 dark:text-neutral-200">
                    {link.campaign}
                  </span>
                ) : (
                  <span className="text-xs text-neutral-400">—</span>
                )}
              </td>

              {/* Empty actions cell */}
              <td className="w-0 p-0 hidden md:table-cell" />
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
