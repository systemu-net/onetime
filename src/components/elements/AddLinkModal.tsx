import { MagnifyingGlassIcon, PlusIcon, XMarkIcon } from '@heroicons/react/24/outline';
import React, { useCallback, useEffect, useState } from 'react';
import { useCookies } from 'react-cookie';
import { searchLinks } from '../../apis/links';
import { Link, PageLink, Resource } from '../../types';
import { extractDomain } from '../../utils/transformers';

interface AddLinkModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd?: (link: PageLink) => void; // Legacy support
  onAddResource?: (resource: Resource) => Promise<void>; // New Resources API support
  lookupCode?: string; // Required for Resources API
}

const AddLinkModal: React.FC<AddLinkModalProps> = ({
  isOpen,
  onClose,
  onAdd,
  onAddResource,
  lookupCode,
}) => {
  const [cookies] = useCookies(['token']);
  const [activeTab, setActiveTab] = useState<'create' | 'select'>('create');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Link[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  
  // Create new link form
  const [destinationUrl, setDestinationUrl] = useState('');
  const [linkTitle, setLinkTitle] = useState('');
  const [linkDescription, setLinkDescription] = useState('');
  const [linkColor, setLinkColor] = useState('#3b82f6'); // Default blue
  
  const [error, setError] = useState('');

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setActiveTab('create');
      setSearchQuery('');
      setSearchResults([]);
      setDestinationUrl('');
      setLinkTitle('');
      setLinkDescription('');
      setLinkColor('#3b82f6');
      setError('');
    }
  }, [isOpen]);

  // Search for existing links
  const handleSearch = useCallback(async (query: string) => {
    if (!query.trim() || !cookies.token) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    setError('');

    try {
      const results = await searchLinks(cookies.token, query);
      setSearchResults(results || []);
    } catch (err) {
      console.error('Search error:', err);
      setError('Failed to search links');
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  }, [cookies.token]);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (activeTab === 'select') {
        handleSearch(searchQuery);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, activeTab, handleSearch]);

  // Create new link
  const handleCreateLink = async () => {
    if (!destinationUrl.trim()) {
      setError('Please enter a destination URL');
      return;
    }

    // Basic URL validation
    try {
      new URL(destinationUrl);
    } catch {
      setError('Please enter a valid URL (e.g., https://example.com)');
      return;
    }

    setIsCreating(true);
    setError('');

    try {
      // Use Resources API if available (preferred method)
      if (onAddResource && lookupCode) {
        // Import createResource dynamically to avoid circular dependencies
        const { createResource } = await import('../../apis/resources');
        
        const newResource = await createResource(cookies.token, lookupCode, {
          link: {
            original_url: destinationUrl,
            title: linkTitle || undefined,
            description: linkDescription || undefined
          },
          resource: {
            color: linkColor
            // sort_order will be auto-assigned by backend if not provided
          }
        });

        await onAddResource(newResource);
      } else if (onAdd) {
        // Legacy fallback: create standalone link and add as PageLink
        const { createLink } = await import('../../apis/links');
        
        const newLink = await createLink(cookies.token, {
          original_url: destinationUrl,
        });

        const pageLink: PageLink = {
          id: newLink.lookup_code,
          label: linkTitle || extractDomain(destinationUrl),
          link: destinationUrl,
          color: linkColor,
        };

        onAdd(pageLink);
      }

      onClose();
    } catch (err) {
      console.error('Create link error:', err);
      setError(err instanceof Error ? err.message : 'Failed to create link');
    } finally {
      setIsCreating(false);
    }
  };

  // Select existing link
  const handleSelectLink = async (link: Link) => {
    try {
      // Use Resources API if available (preferred method)
      if (onAddResource && lookupCode) {
        const { createResource } = await import('../../apis/resources');
        
        // For existing links from search, we need to create a new resource connection
        // The backend will handle connecting the existing link to this page
        const newResource = await createResource(cookies.token, lookupCode, {
          link: {
            original_url: link.original_url,
            title: linkTitle || extractDomain(link.original_url),
            description: linkDescription || undefined
          },
          resource: {
            color: linkColor
            // sort_order will be auto-assigned by backend if not provided
          }
        });

        await onAddResource(newResource);
      } else if (onAdd) {
        // Legacy fallback
        const pageLink: PageLink = {
          id: link.lookup_code,
          label: linkTitle || extractDomain(link.original_url),
          link: link.original_url,
          color: linkColor,
        };

        onAdd(pageLink);
      }

      onClose();
    } catch (err) {
      console.error('Select link error:', err);
      setError(err instanceof Error ? err.message : 'Failed to add link');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Add Link
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 dark:border-gray-700 px-6">
          <button
            onClick={() => setActiveTab('create')}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'create'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            <PlusIcon className="w-4 h-4" />
            Create new
          </button>
          <button
            onClick={() => setActiveTab('select')}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'select'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            <MagnifyingGlassIcon className="w-4 h-4" />
            Select existing link
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-800 dark:text-red-200">
              {error}
            </div>
          )}

          {activeTab === 'create' ? (
            <div className="space-y-6">
              {/* Destination URL */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Destination URL <span className="text-red-500">*</span>
                </label>
                <input
                  type="url"
                  placeholder="ex. https://longurl.com"
                  value={destinationUrl}
                  onChange={(e) => setDestinationUrl(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
                />
              </div>

              {/* Title & Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Title & Description
                </label>
                <input
                  type="text"
                  placeholder="Add a title"
                  value={linkTitle}
                  onChange={(e) => setLinkTitle(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-zinc-100 dark:placeholder:text-zinc-500 mb-2"
                />
                <input
                  type="text"
                  placeholder="Add a description (optional)"
                  value={linkDescription}
                  onChange={(e) => setLinkDescription(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-zinc-100 dark:placeholder:text-zinc-500"
                />
              </div>

              {/* Button Color */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Button Color
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={linkColor}
                    onChange={(e) => setLinkColor(e.target.value)}
                    className="h-10 w-20 rounded border border-gray-300 dark:border-gray-600 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={linkColor}
                    onChange={(e) => setLinkColor(e.target.value)}
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-zinc-100 dark:placeholder:text-zinc-500"
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Search Box */}
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by URL or title..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-zinc-100 dark:placeholder:text-zinc-500"
                />
              </div>

              {/* Search Results */}
              <div className="space-y-2 max-h-[400px] overflow-y-auto">
                {isSearching ? (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    <div className="inline-block w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    <p className="mt-2">Searching...</p>
                  </div>
                ) : searchResults.length > 0 ? (
                  searchResults.map((link) => (
                    <div
                      key={link.lookup_code}
                      className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors group"
                      onClick={() => handleSelectLink(link)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                            {extractDomain(link.original_url)}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-1">
                            {link.original_url}
                          </p>
                          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                            Created: {new Date(link.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <button className="ml-4 px-3 py-1.5 text-xs font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 rounded hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors opacity-0 group-hover:opacity-100">
                          Select
                        </button>
                      </div>
                    </div>
                  ))
                ) : searchQuery.trim() ? (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    <MagnifyingGlassIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>No links found</p>
                    <p className="text-sm mt-1">Try a different search term</p>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    <MagnifyingGlassIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>Search for existing links</p>
                    <p className="text-sm mt-1">Type URL or title to search</p>
                  </div>
                )}
              </div>

              {/* Link customization when search is active */}
              {searchQuery.trim() && !isSearching && (
                <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700 space-y-4">
                  <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Customize link appearance
                  </h3>
                  
                  <div>
                    <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">
                      Title (optional)
                    </label>
                    <input
                      type="text"
                      placeholder="Custom title for the button"
                      value={linkTitle}
                      onChange={(e) => setLinkTitle(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-zinc-100 dark:placeholder:text-zinc-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">
                      Button Color
                    </label>
                    <div className="flex items-center gap-3">
                      <input
                        type="color"
                        value={linkColor}
                        onChange={(e) => setLinkColor(e.target.value)}
                        className="h-10 w-20 rounded border border-gray-300 dark:border-gray-600 cursor-pointer"
                      />
                      <input
                        type="text"
                        value={linkColor}
                        onChange={(e) => setLinkColor(e.target.value)}
                        className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-zinc-100 dark:placeholder:text-zinc-500"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors font-medium"
          >
            Cancel
          </button>
          {activeTab === 'create' && (
            <button
              onClick={handleCreateLink}
              disabled={!destinationUrl || isCreating}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium flex items-center gap-2"
            >
              {isCreating ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Creating...
                </>
              ) : (
                'Add Link'
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddLinkModal;
