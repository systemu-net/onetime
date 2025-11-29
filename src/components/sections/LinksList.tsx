import { deleteLink } from '@/apis/shorten';
import { Link as LinkType } from '@/types';
import { extractDomain } from '@/utils/transformers';
import { EllipsisVerticalIcon } from '@heroicons/react/20/solid';
import { useState } from 'react';
import { useCookies } from 'react-cookie';
import { HiArrowUturnRight } from "react-icons/hi2";
import { IoCopyOutline } from 'react-icons/io5';
import { MdDelete, MdEdit } from 'react-icons/md';
import { RiQrCodeLine } from 'react-icons/ri';
import { Link as RouterLink } from 'react-router-dom';
import { API_URL, SHORT_URL } from '../../apis/config';
import {
  Dropdown,
  DropdownButton,
  DropdownDivider,
  DropdownItem,
  DropdownLabel,
  DropdownMenu,
  DropdownShortcut,
} from '../elements/dropdown';
import { ClicksIcon } from '../icons/ClicksIcon';

type LinksListProps = {
  fetchLinks: () => Promise<void>;
  shortenedUrls: LinkType[];
};

export const LinksList: React.FC<LinksListProps> = ({
  fetchLinks,
  shortenedUrls,
}) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [cookies] = useCookies(['token']);
  const [copied, setCopied] = useState<string | null>(null);

  const handleDelete = async (lookup_code: string) => {
    try {
      setLoading(true);
      const [response, error] = await deleteLink(cookies.token, lookup_code);

      if (error) {
        setLoading(false);
      } else {
        if (response instanceof Response && response.ok) {
          fetchLinks();
        } else {
          setLoading(false);
        }
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (lookup_code: string) => {
    const shortUrl = `${API_URL}/${lookup_code}`;
    navigator.clipboard.writeText(shortUrl);
    setCopied(lookup_code);
    setTimeout(() => {
      setCopied(null);
    }, 2000);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 24) {
      return `${diffInHours}h`;
    } else if (diffInHours < 48) {
      return '1d';
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  return (
    <div className="w-full">
      <ul className="group/card-list w-full flex flex-col gap-2">
        {shortenedUrls.map((item) => (
          <li
            key={item.lookup_code}
            className="w-full group/card border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 border rounded-xl transition-all hover:shadow-md overflow-hidden"
          >
            <RouterLink 
              to={item.lookup_code}
              className="flex items-center gap-3 sm:gap-5 px-4 py-2.5 text-sm no-underline cursor-default"
            >
              {/* Left section - Link info */}
              <div className="min-w-0 grow">
                <div className="flex items-center gap-3">
                  {/* Favicon */}
                  <div className="shrink-0">
                    <img
                      alt={extractDomain(item.original_url)}
                      draggable="false"
                      loading="lazy"
                      width="20"
                      height="20"
                      className="rounded-full size-5 border border-neutral-200 dark:border-neutral-600"
                      src={`https://www.google.com/s2/favicons?sz=64&domain_url=${extractDomain(item.original_url)}`}
                    />
                  </div>

                  {/* Link details */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="font-semibold text-neutral-800 dark:text-neutral-100 group-hover/card:text-black dark:group-hover/card:text-white transition-colors truncate">
                        {SHORT_URL.replace(/^https?:\/\//, '')}/{item.lookup_code}
                      </span>
                      
                      {/* Copy button */}
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleCopy(item.lookup_code);
                        }}
                        className="group/copy rounded-full transition-all duration-75 bg-transparent hover:bg-neutral-100 dark:hover:bg-neutral-700 active:bg-neutral-200 dark:active:bg-neutral-600 p-1.5 relative z-10"
                        type="button"
                      >
                        <span className="sr-only">Copy</span>
                        {copied === item.lookup_code ? (
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={2}
                            stroke="currentColor"
                            className="w-3.5 h-3.5 text-green-600"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M4.5 12.75l6 6 9-13.5"
                            />
                          </svg>
                        ) : (
                          <svg
                            fill="none"
                            shapeRendering="geometricPrecision"
                            stroke="currentColor"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            viewBox="0 0 24 24"
                            className="h-3.5 w-3.5 text-neutral-600 dark:text-neutral-400"
                          >
                            <path d="M8 17.929H6c-1.105 0-2-.912-2-2.036V5.036C4 3.91 4.895 3 6 3h8c1.105 0 2 .911 2 2.036v1.866m-6 .17h8c1.105 0 2 .91 2 2.035v10.857C20 21.09 19.105 22 18 22h-8c-1.105 0-2-.911-2-2.036V9.107c0-1.124.895-2.036 2-2.036z"></path>
                          </svg>
                        )}
                      </button>
                    </div>

                    {/* Destination URL */}
                    <div className="flex items-center gap-1 text-xs sm:text-sm">
                      <HiArrowUturnRight className="w-3 h-3 shrink-0 text-neutral-400 dark:text-neutral-500 scale-y-[-1]" />
                      <span className="truncate text-neutral-500 dark:text-neutral-400 group-hover/card:text-neutral-700 dark:group-hover/card:text-neutral-300">
                        {item.original_url}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right section - Actions */}
              <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                {/* Date - hidden on mobile */}
                <span className="hidden sm:block text-neutral-400 dark:text-neutral-500 text-xs">
                  {formatDate(item.created_at)}
                </span>

                {/* Clicks badge */}
                <div
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                  className="block overflow-hidden rounded-md border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900 p-0.5 text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 transition-colors hover:bg-neutral-100 dark:hover:bg-neutral-800 relative z-10"
                >
                  <div className="flex items-center gap-1 px-1.5 sm:px-2 py-0.5">
                    <ClicksIcon className="h-3.5 w-3.5 shrink-0 text-blue-500" />
                    <span className="whitespace-nowrap">
                      {item.clicks_count ?? 0} {(item.clicks_count ?? 0) === 1 ? 'click' : 'clicks'}
                    </span>
                  </div>
                </div>

                {/* More menu */}
                <div
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                  className="relative z-50"
                >
                  <Dropdown>
                    <DropdownButton
                      plain
                      aria-label="More options"
                      className="flex items-center justify-center rounded-md border border-transparent hover:border-neutral-200 dark:hover:border-neutral-700 transition-all h-8 px-1.5"
                    >
                      <EllipsisVerticalIcon className="w-5 h-5" />
                    </DropdownButton>
                    <DropdownMenu anchor="bottom end" className="z-50">
                      <DropdownItem>
                        <MdEdit data-slot="icon" />
                        <DropdownLabel>Edit</DropdownLabel>
                        <DropdownShortcut keys="E" />
                      </DropdownItem>

                      <DropdownItem>
                        <RiQrCodeLine data-slot="icon" />
                        <DropdownLabel>QR Code</DropdownLabel>
                        <DropdownShortcut keys="Q" />
                      </DropdownItem>

                      <DropdownItem onClick={() => handleCopy(item.lookup_code)}>
                        <IoCopyOutline data-slot="icon" />
                        <DropdownLabel>
                          {copied === item.lookup_code ? 'Copied!' : 'Copy Link ID'}
                        </DropdownLabel>
                        <DropdownShortcut keys="I" />
                      </DropdownItem>

                      <DropdownDivider />

                      <DropdownItem
                        disabled={loading}
                        onClick={() => handleDelete(item.lookup_code)}
                        className="data-[focus]:bg-red-600 data-[focus]:text-white [&>[data-slot=icon]]:data-[focus]:text-white"
                      >
                        <MdDelete data-slot="icon" />
                        <DropdownLabel>Delete</DropdownLabel>
                        <DropdownShortcut keys="X" />
                      </DropdownItem>
                    </DropdownMenu>
                  </Dropdown>
                </div>
              </div>
            </RouterLink>
          </li>
        ))}
      </ul>
    </div>
  );
};
