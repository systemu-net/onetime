import { API_URL } from '@/apis/config';
import { deletePage } from '@/apis/pages';
import { Page } from '@/types';
import { EllipsisVerticalIcon } from '@heroicons/react/20/solid';
import { TrashIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { useEffect, useState } from 'react';
import { useCookies } from 'react-cookie';
import { Link } from 'react-router-dom';
import Box from '../Box';
import { Button } from '../elements/button';
import {
  Dropdown,
  DropdownButton,
  DropdownItem,
  DropdownMenu,
} from '../elements/dropdown';
import Preview from './Preview';

type PagesListProps = {
  fetchPages: () => Promise<void>;
  pages: Page[];
};
export const PagesList: React.FC<PagesListProps> = ({ fetchPages, pages }) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [cookies] = useCookies(['token']);
  const [selectedPage, setSelectedPage] = useState<Page | null>(null);
  const [isSliderOpen, setIsSliderOpen] = useState<boolean>(false);

  // Transform page links to use shortened URLs
  const transformPageLinks = (page: Page) => {
    if (!page.links || !Array.isArray(page.links)) {
      return [];
    }
    return page.links.map(link => ({
      ...link,
      link: `${API_URL}/${link.id}`, // Use shortened URL instead of original
    }));
  };

  const handleDelete = async (lookup_code: string) => {
    try {
      setLoading(true);
      const [response, error] = await deletePage(cookies.token, lookup_code);

      if (error) {
        setLoading(false);
      } else {
        if (response instanceof Response && response.ok) {
          fetchPages();
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

  const openPreviewSlider = (page: Page) => {
    setSelectedPage(page);
    setIsSliderOpen(true);
  };

  const closePreviewSlider = () => {
    setIsSliderOpen(false);
    setTimeout(() => setSelectedPage(null), 300); // Delay to allow animation
  };

  // Handle touch gestures for swipe to close
  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    const element = e.currentTarget as HTMLElement;
    element.dataset.startX = touch.clientX.toString();
    element.dataset.startY = touch.clientY.toString();
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isSliderOpen) return;
    
    const touch = e.touches[0];
    const element = e.currentTarget as HTMLElement;
    const startX = parseFloat(element.dataset.startX || '0');
    const deltaX = touch.clientX - startX;
    
    // Only allow rightward swipes and apply transform
    if (deltaX > 0) {
      element.style.transform = `translateX(${Math.min(deltaX, element.offsetWidth)}px)`;
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const touch = e.changedTouches[0];
    const element = e.currentTarget as HTMLElement;
    const startX = parseFloat(element.dataset.startX || '0');
    const startY = parseFloat(element.dataset.startY || '0');
    const deltaX = touch.clientX - startX;
    const deltaY = Math.abs(touch.clientY - startY);
    
    // Reset transform
    element.style.transform = '';
    
    // If swipe right more than 1/3 of the width or swipe velocity is high, close the slider
    // Also ensure it's more horizontal than vertical movement
    if (deltaX > element.offsetWidth / 3 && deltaY < 100) {
      closePreviewSlider();
    }
  };

  // Prevent body scroll when slider is open
  useEffect(() => {
    if (isSliderOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isSliderOpen]);

  return (
    <div className="pt-2">
      <div className="mt-2 flow-root">
        <ul>
          {pages.map((item) => (
            <li key={item.lookup_code}>
              <Box>
                <div className="flex items-center justify-between">
                  <Link
                    className="flex gap-2"
                    to={item.lookup_code.toString()}
                  >
                    <div className="w-[53px] h-[100px] rounded-md shadow-md hover:shadow-lg mr-4">
                      <div className="scale-preview origin-top-left">
                        <Preview
                          title={item.title}
                          description={item.description}
                          content={item.content}
                          links={transformPageLinks(item)}
                        />
                      </div>
                    </div>
                    <div className="hover:underline underline-offset-2">
                      {item.title}
                    </div>
                  </Link>

                  <div className="hidden lg:flex gap-4 items-center">
                    <Button outline to={item.lookup_code.toString()}>
                      Details
                    </Button>
                    <button
                      className="antialiased rounded-full font-bold w-7 h-7 hover:scale-105"
                      disabled={loading}
                      onClick={() => handleDelete(item.lookup_code)}
                    >
                      <TrashIcon />
                    </button>
                  </div>
                  <div className="flex lg:hidden items-center gap-4">
                    <Dropdown>
                      <DropdownButton plain aria-label="More options">
                        <EllipsisVerticalIcon />
                      </DropdownButton>
                      <DropdownMenu anchor="bottom end">
                        <DropdownItem
                          onClick={(e) => {
                            e.preventDefault();
                            openPreviewSlider(item);
                          }}
                        >
                          Preview
                        </DropdownItem>
                        <DropdownItem to={item.lookup_code.toString()}>
                          Edit
                        </DropdownItem>
                        <DropdownItem
                          disabled={loading}
                          onClick={() => handleDelete(item.lookup_code)}
                        >
                          Delete
                        </DropdownItem>
                      </DropdownMenu>
                    </Dropdown>
                  </div>
                </div>
              </Box>
            </li>
          ))}
        </ul>
      </div>

      {/* Mobile Preview Slider */}
      {selectedPage && (
        <>
          {/* Backdrop */}
          <div 
            className={`fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity duration-300 sm:hidden ${
              isSliderOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
            }`}
            onClick={closePreviewSlider}
          />
          
          {/* Slider */}
          <div 
            className={`fixed top-0 right-0 h-full w-full max-w-sm bg-white dark:bg-gray-900 z-50 transform transition-transform duration-300 ease-in-out sm:hidden ${
              isSliderOpen ? 'translate-x-0' : 'translate-x-full'
            }`}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Preview</h2>
              <button
                onClick={closePreviewSlider}
                className="p-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-800"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>
            
            {/* Preview Content */}
            <div className="flex-1 flex items-center justify-center p-4 bg-gray-50 dark:bg-gray-800 min-h-0">
              <div className="w-full max-w-[280px]">
                <div className="scale-90 origin-center">
                  <Preview
                    title={selectedPage.title}
                    description={selectedPage.description}
                    content={selectedPage.content}
                    links={transformPageLinks(selectedPage)}
                  />
                </div>
              </div>
            </div>
            
            {/* Swipe indicator */}
            <div className="absolute top-1/2 left-2 transform -translate-y-1/2 text-gray-400">
              <div className="flex flex-col items-center">
                <span className="text-xs mb-1">Swipe</span>
                <div className="w-6 h-0.5 bg-gray-400 rounded"></div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
