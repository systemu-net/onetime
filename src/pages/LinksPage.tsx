import { Heading } from '@/components/elements/heading';
import ShortenForm from '@/components/elements/ShortenForm';
import { useLinks } from '@/context/LinksContext';
import { useEffect, useRef, useState } from 'react';
import { useCookies } from 'react-cookie';
import { FaSortAmountDown, FaSortAmountDownAlt } from 'react-icons/fa';
import MainLayout from '../components/layouts/MainLayout';
import { LinksList } from '../components/sections/LinksList';

type SortOption = 'date_created_desc' | 'date_created_asc' | 'total_clicks_desc' | 'total_clicks_asc' | 'last_clicked_desc' | 'last_clicked_asc';

const LinksPage = () => {
  const [cookies] = useCookies(['token']);
  const { shortenedUrls, fetchLinks, errorMessage } = useLinks();
  const [sortBy, setSortBy] = useState<SortOption>('date_created_desc');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (cookies.token) {
      const [field, order] = parseSortOption(sortBy);
      fetchLinks(field, order);
    }
  }, [cookies.token, sortBy, fetchLinks]);

  const parseSortOption = (option: SortOption): [string, string] => {
    switch (option) {
      case 'date_created_desc':
        return ['created_at', 'desc'];
      case 'date_created_asc':
        return ['created_at', 'asc'];
      case 'total_clicks_desc':
        return ['clicks_count', 'desc'];
      case 'total_clicks_asc':
        return ['clicks_count', 'asc'];
      case 'last_clicked_desc':
        return ['last_clicked', 'desc'];
      case 'last_clicked_asc':
        return ['last_clicked', 'asc'];
      default:
        return ['created_at', 'desc'];
    }
  };

  const getSortLabel = (option: SortOption) => {
    switch (option) {
      case 'date_created_desc':
      case 'date_created_asc':
        return 'Date created';
      case 'total_clicks_desc':
      case 'total_clicks_asc':
        return 'Total clicks';
      case 'last_clicked_desc':
      case 'last_clicked_asc':
        return 'Last clicked';
      default:
        return 'Date created';
    }
  };

  const getSortCategory = (option: SortOption) => {
    if (option.includes('date_created')) return 'date_created';
    if (option.includes('total_clicks')) return 'total_clicks';
    if (option.includes('last_clicked')) return 'last_clicked';
    return 'date_created';
  };

  const isDescending = (option: SortOption) => option.includes('desc');

  const handleSortChange = (option: SortOption) => {
    setSortBy(option);
    setIsDropdownOpen(false);
  };

  return (
    <MainLayout>
      <ShortenForm fetchLinks={fetchLinks} />
      <div className="px-4 sm:px-6 lg:px-8 flex flex-wrap items-center justify-between gap-4 mb-4">
        <Heading className="text-2xl font-bold">Links</Heading>
        
        {/* Sort Dropdown */}
        <div className="relative inline-block ml-auto" ref={dropdownRef}>
          {/* Trigger Button */}
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="inline-flex items-center gap-2.5 px-4 py-2.5 text-base font-medium border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 hover:bg-zinc-50 dark:hover:bg-zinc-700 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer transition-colors"
          >
            {isDescending(sortBy) ? (
              <FaSortAmountDown className="w-5 h-5" />
            ) : (
              <FaSortAmountDownAlt className="w-5 h-5" />
            )}
            <span className="text-base">{getSortLabel(sortBy)}</span>
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              fill="none" 
              viewBox="0 0 24 24" 
              strokeWidth={2} 
              stroke="currentColor" 
              className={`w-4 h-4 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
            </svg>
          </button>

          {/* Dropdown Menu */}
          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-52 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg shadow-lg z-50 p-2 animate-in fade-in slide-in-from-top-2 duration-200">
              {/* Date Created */}
              <button
                onClick={() => handleSortChange(getSortCategory(sortBy) === 'date_created' && isDescending(sortBy) ? 'date_created_asc' : 'date_created_desc')}
                className="flex w-full items-center justify-between space-x-2 rounded-md px-3 py-2.5 hover:bg-neutral-100 dark:hover:bg-neutral-700 active:bg-neutral-200 dark:active:bg-neutral-600 transition-colors"
              >
                <div className="flex items-center justify-start space-x-3 truncate">
                  <div className="w-5 h-5 flex items-center justify-center">
                    {getSortCategory(sortBy) === 'date_created' && (
                      <div className="animate-in fade-in slide-in-from-left-1 duration-200">
                        {isDescending(sortBy) ? (
                          <FaSortAmountDown className="w-5 h-5" />
                        ) : (
                          <FaSortAmountDownAlt className="w-5 h-5" />
                        )}
                      </div>
                    )}
                  </div>
                  <p className="truncate text-base">Date created</p>
                </div>
                {getSortCategory(sortBy) === 'date_created' && (
                  <svg fill="none" shapeRendering="geometricPrecision" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" viewBox="0 0 24 24" width="16" height="16" className="h-5 w-5 animate-in fade-in zoom-in-50 duration-200">
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                )}
              </button>

              {/* Total Clicks */}
              <button
                onClick={() => handleSortChange(getSortCategory(sortBy) === 'total_clicks' && isDescending(sortBy) ? 'total_clicks_asc' : 'total_clicks_desc')}
                className="flex w-full items-center justify-between space-x-2 rounded-md px-3 py-2.5 hover:bg-neutral-100 dark:hover:bg-neutral-700 active:bg-neutral-200 dark:active:bg-neutral-600 transition-colors"
              >
                <div className="flex items-center justify-start space-x-3 truncate">
                  <div className="w-5 h-5 flex items-center justify-center">
                    {getSortCategory(sortBy) === 'total_clicks' && (
                      <div className="animate-in fade-in slide-in-from-left-1 duration-200">
                        {isDescending(sortBy) ? (
                          <FaSortAmountDown className="w-5 h-5" />
                        ) : (
                          <FaSortAmountDownAlt className="w-5 h-5" />
                        )}
                      </div>
                    )}
                  </div>
                  <p className="truncate text-base">Total clicks</p>
                </div>
                {getSortCategory(sortBy) === 'total_clicks' && (
                  <svg fill="none" shapeRendering="geometricPrecision" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" viewBox="0 0 24 24" width="16" height="16" className="h-5 w-5 animate-in fade-in zoom-in-50 duration-200">
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                )}
              </button>

              {/* Last Clicked */}
              <button
                onClick={() => handleSortChange(getSortCategory(sortBy) === 'last_clicked' && isDescending(sortBy) ? 'last_clicked_asc' : 'last_clicked_desc')}
                className="flex w-full items-center justify-between space-x-2 rounded-md px-3 py-2.5 hover:bg-neutral-100 dark:hover:bg-neutral-700 active:bg-neutral-200 dark:active:bg-neutral-600 transition-colors"
              >
                <div className="flex items-center justify-start space-x-3 truncate">
                  <div className="w-5 h-5 flex items-center justify-center">
                    {getSortCategory(sortBy) === 'last_clicked' && (
                      <div className="animate-in fade-in slide-in-from-left-1 duration-200">
                        {isDescending(sortBy) ? (
                          <FaSortAmountDown className="w-5 h-5" />
                        ) : (
                          <FaSortAmountDownAlt className="w-5 h-5" />
                        )}
                      </div>
                    )}
                  </div>
                  <p className="truncate text-base">Last clicked</p>
                </div>
                {getSortCategory(sortBy) === 'last_clicked' && (
                  <svg fill="none" shapeRendering="geometricPrecision" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" viewBox="0 0 24 24" width="16" height="16" className="h-5 w-5 animate-in fade-in zoom-in-50 duration-200">
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
      <LinksList fetchLinks={fetchLinks} shortenedUrls={shortenedUrls} />
      {errorMessage && <p className="text-red-500">{errorMessage}</p>}
    </MainLayout>
  );
};

export default LinksPage;
