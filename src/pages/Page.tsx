import { API_URL } from '@/apis/config';
import { getPage, updatePage } from '@/apis/pages';
import Box from '@/components/Box';
import AddLinkModal from '@/components/elements/AddLinkModal';
import { Button } from '@/components/elements/button';
import { Checkbox } from '@/components/elements/checkbox';
import ColorPicker from '@/components/elements/colorPicker';
import EditLinkModal from '@/components/elements/EditLinkModal';
import {
  FieldGroup,
  Fieldset,
  Label,
  Legend,
  Title,
} from '@/components/elements/fieldset';
import { Subheading } from '@/components/elements/heading';
import ImageUploadModal from '@/components/elements/ImageUploadModal';
import { Input } from '@/components/elements/input';
import { Radio, RadioGroup } from '@/components/elements/radio';
import { Select } from '@/components/elements/select';
import { Text } from '@/components/elements/text';
import { ClicksIcon } from '@/components/icons/ClicksIcon';
import MainLayout from '@/components/layouts/MainLayout';
import PublishComponent from '@/components/PublishComponent';
import Preview, { socialIcons } from '@/components/sections/Preview';
import { useLinks } from '@/context/LinksContext';
import { PAGES_ROUTE } from '@/routes';
import { Page, Resource } from '@/types';
import {
  ChevronLeftIcon,
  PaintBrushIcon,
  RectangleGroupIcon,
} from '@heroicons/react/16/solid';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { Bars3Icon } from '@heroicons/react/24/solid';
import { HiArrowUturnRight } from 'react-icons/hi2';
import { TbWorld } from 'react-icons/tb';

import {
  closestCenter,
  DndContext,
  DragEndEvent,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useCallback, useEffect, useState } from 'react';
import { useCookies } from 'react-cookie';
import { Link as RouterLink, useParams } from 'react-router-dom';
import { useResources } from '../hooks/useResources';
import { extractDomain } from '../utils/transformers';

const buttonStyles: { id: Page['content']['button']; title: string }[] = [
  { id: 'squared', title: 'Squared' },
  { id: 'rounded-sm', title: 'Rounded small' },
  { id: 'rounded', title: 'Rounded' },
  { id: 'rounded-lg', title: 'Rounded large' },
  { id: 'rounded-full', title: 'Rounded Full' },
];
const fontStyles = [
  { id: 'rubik', title: 'Rubik' },
  { id: 'mono', title: 'Monospace' },
  { id: "'Courier New', monospace", title: 'Courier New, monospace' },
  { id: "'Brush Script MT', cursive", title: 'Brush Script MT, cursive' },
];
const backgroundTypes = [
  { id: 'color', title: 'Color' },
  { id: 'gradient', title: 'Gradient' },
];
const socialPlatforms = [
  { id: 'ig', title: 'Instagram' },
  { id: 'fb', title: 'Facebook' },
  { id: 'x', title: 'X' },
  { id: 'linkedin', title: 'LinkedIn' },
];

const tabs = [
  { name: 'Content', href: '#', icon: RectangleGroupIcon, current: true },
  { name: 'Design', href: '#', icon: PaintBrushIcon, current: false },
];

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}
const Section = ({ title, legend = '', children }) => (
  <Box>
    <Fieldset>
      <Title>{title}</Title>
      {legend && <Legend>{legend}</Legend>}
      <FieldGroup>{children}</FieldGroup>
    </Fieldset>
  </Box>
);

// Sortable Item Component for drag-and-drop
const SortableResourceItem = ({ resource, onRemove, onEdit, onError }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: resource.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const [faviconError, setFaviconError] = useState(false);

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={() => onEdit(resource)}
      className="flex items-center gap-3 sm:gap-5 p-2 sm:p-4 border border-neutral-200 dark:border-neutral-700 rounded-xl hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors overflow-hidden cursor-grab active:cursor-grabbing bg-white dark:bg-neutral-800 hover:cursor-pointer"
    >
      {/* Drag handle */}
      <div className="flex-shrink-0">
        <Bars3Icon className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 dark:text-gray-500" />
      </div>

      {/* Left section - Link info */}
      <div className="min-w-0 grow">
        <div className="flex items-center gap-3">
          {/* Favicon */}
          <div className="shrink-0">
            {faviconError ? (
              <div className="rounded-full size-5 border border-neutral-200 dark:border-neutral-600 bg-neutral-100 dark:bg-neutral-700 flex items-center justify-center">
                <TbWorld className="w-3 h-3 text-neutral-500 dark:text-neutral-400" />
              </div>
            ) : (
              <img
                alt={extractDomain(resource.linkable.original_url)}
                draggable="false"
                loading="lazy"
                width="20"
                height="20"
                className="rounded-full size-5 border border-neutral-200 dark:border-neutral-600"
                src={`https://www.google.com/s2/favicons?sz=64&domain_url=${extractDomain(resource.linkable.original_url)}`}
                onError={() => setFaviconError(true)}
              />
            )}
          </div>

          {/* Link details */}
          <div className="min-w-0 flex-1">
            <div className="mb-0.5">
              <span className="text-sm font-semibold text-neutral-800 dark:text-neutral-100 truncate block">
                {resource.linkable.title || extractDomain(resource.linkable.original_url)}
              </span>
            </div>

            {/* Destination URL */}
            <div className="flex items-center gap-1 text-xs sm:text-sm">
              <HiArrowUturnRight className="w-3 h-3 shrink-0 text-neutral-400 dark:text-neutral-500 scale-y-[-1]" />
              <span className="truncate text-neutral-500 dark:text-neutral-400">
                {resource.linkable.original_url}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Right section - Clicks badge and Delete button */}
      <div 
        className="flex items-center gap-2 sm:gap-3 flex-shrink-0"
        onClick={(e) => e.stopPropagation()}
        onTouchStart={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
      >
        {/* Clicks badge */}
        {resource.linkable.clicks_count !== undefined && (
          <div className="overflow-hidden rounded-md border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900 p-0.5 text-xs sm:text-sm text-neutral-600 dark:text-neutral-400">
            <div className="flex items-center gap-1 px-1.5 sm:px-2 py-0.5">
              <ClicksIcon className="h-3.5 w-3.5 shrink-0 text-blue-500" />
              <span className="whitespace-nowrap">
                {resource.linkable.clicks_count ?? 0} {(resource.linkable.clicks_count ?? 0) === 1 ? 'click' : 'clicks'}
              </span>
            </div>
          </div>
        )}

        <button
          onClick={async (e) => {
            e.stopPropagation();
            try {
              await onRemove(resource.id);
            } catch (error) {
              console.error('Error removing resource:', error);
              onError(error instanceof Error ? error.message : 'Failed to remove link');
            }
          }}
          className="p-1 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors flex-shrink-0 cursor-pointer"
          title="Remove link"
        >
          <XMarkIcon className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>
      </div>
    </div>
  );
};const SinglePage = () => {
  const { lookup_code } = useParams();
  const [cookies] = useCookies(['token']);
  const [, setError] = useState<string>('');
  const [page, setPage] = useState<Page | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [, setSaveSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState('Content');
  const [isPreviewSliderOpen, setIsPreviewSliderOpen] = useState<boolean>(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [lastSaveTime, setLastSaveTime] = useState<Date | null>(null);
  const [lastSavedPageState, setLastSavedPageState] = useState<Page | null>(null);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingResource, setEditingResource] = useState<Resource | null>(null);
  const { fetchLinks, errorMessage } = useLinks();
  
  // Preview slider drag state
  const [previewDragX, setPreviewDragX] = useState(0);
  const [previewDragStartX, setPreviewDragStartX] = useState(0);
  const [isPreviewDragging, setIsPreviewDragging] = useState(false);
  
  // Use Resources API for managing page links
  const { 
    resources, 
    loading: resourcesLoading, 
    error: resourcesError, 
    remove: removeResource,
    update: updateResource,
    reorder: reorderResources,
    refetch: refetchResources
  } = useResources(lookup_code);

  // Drag-and-drop sensors for mouse, touch, and keyboard
  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 8,      // Require 8px movement to start drag (prevents accidental drags)
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 150,       // Press and hold for 150ms before drag starts (shorter = more responsive)
        tolerance: 8,     // Allow 8px movement during the delay
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Prevent body scroll during drag
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    if (isDragging) {
      // Prevent scrolling on mobile during drag
      document.body.style.overflow = 'hidden';
      document.body.style.touchAction = 'none';
    } else {
      document.body.style.overflow = '';
      document.body.style.touchAction = '';
    }
    
    return () => {
      document.body.style.overflow = '';
      document.body.style.touchAction = '';
    };
  }, [isDragging]);

  // Handle drag start
  const handleDragStart = () => {
    setIsDragging(true);
  };

  // Handle drag end event to reorder resources
  const handleDragEnd = async (event: DragEndEvent) => {
    setIsDragging(false);
    
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    const oldIndex = resources.findIndex((r) => r.id === active.id);
    const newIndex = resources.findIndex((r) => r.id === over.id);

    if (oldIndex !== -1 && newIndex !== -1) {
      // Optimistically update UI
      const reorderedResources = arrayMove(resources, oldIndex, newIndex);
      
      try {
        // Call the API to persist the new order with id and sort_order
        await reorderResources(
          reorderedResources.map((r, index) => ({
            id: r.id,
            sort_order: index
          }))
        );
        
        // Update the page's updated_at timestamp to mark as having unpublished changes
        // Note: We don't set hasUnsavedChanges because reordering is already saved via the API
        if (page) {
          const updatedPage = {
            ...page,
            updated_at: new Date().toISOString()
          };
          setPage(updatedPage);
          setLastSavedPageState(updatedPage); // Update saved state to prevent auto-save loop
        }
      } catch (error) {
        console.error('Error reordering resources:', error);
        setError(error instanceof Error ? error.message : 'Failed to reorder links');
      }
    }
  };

  // Handle edit link
  const handleEditLink = (resource: Resource) => {
    setEditingResource(resource);
    setIsEditModalOpen(true);
  };

  // Convert resources to PageLink format for Preview component (backward compatibility)
  const pageLinks = (resources || []).map(resource => ({
    id: resource.linkable.lookup_code,
    label: resource.linkable.title || extractDomain(resource.linkable.original_url),
    link: `${API_URL}/${resource.linkable.lookup_code}`, // Use shortened URL instead of original
    color: resource.color || '#3b82f6', // Use resource color (stored on resource, not linkable)
    description: resource.linkable.description || undefined // Pass description for alt/title attribute
  }));

  useEffect(() => {
    if (cookies.token) {
      fetchLinks();
    }
  }, [cookies.token, fetchLinks]);



  useEffect(() => {
    const fetchPage = async () => {
      try {
        const res: Page = await getPage(cookies.token, lookup_code);
        setPage(res);
        setLastSavedPageState(res); // Store the initial state as "saved"
        setLastSaveTime(new Date()); // Set initial load time
        setHasUnsavedChanges(false); // Mark as saved
      } catch (error: unknown) {
        console.error(error);
        setError('An error occurred while fetching page.');
      }
    };

    if (cookies.token) {
      fetchPage();
    }
  }, [cookies.token, lookup_code]); // Runs when the token is available

  // Function to check if page has actually changed
  const hasPageChanged = useCallback((currentPage: Page, savedPage: Page | null): boolean => {
    if (!savedPage) return true;
    
    // Compare the relevant fields that we save
    return (
      currentPage.title !== savedPage.title ||
      currentPage.description !== savedPage.description ||
      JSON.stringify(currentPage.content) !== JSON.stringify(savedPage.content) ||
      JSON.stringify(currentPage.links) !== JSON.stringify(savedPage.links)
    );
  }, []);

  const handleSave = useCallback(async (showSuccessMessage = false) => {
    if (!page || !cookies.token) return;
    
    // Check if there are actual changes before proceeding
    const actuallyChanged = hasPageChanged(page, lastSavedPageState);
    if (!actuallyChanged && !showSuccessMessage) return; // Don't auto-save if nothing changed

    // Basic validation
    if (page.title && page.title.length > 40) {
      setError('Title must be 40 characters or less.');
      return;
    }

    if (page.description && page.description.length > 40) {
      setError('Description must be 40 characters or less.');
      return;
    }

    setIsLoading(true);
    setError('');
    if (showSuccessMessage) setSaveSuccess(false);

    try {
      const updatedPage = await updatePage(cookies.token, lookup_code, {
        title: page.title,
        description: page.description,
        content: page.content,
        links: page.links,
      });
      setPage(updatedPage);
      setLastSavedPageState(updatedPage); // Update the saved state reference
      setHasUnsavedChanges(false);
      setLastSaveTime(new Date());
      
      if (showSuccessMessage) {
        setSaveSuccess(true);
        // Clear success message after 3 seconds
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    } catch (error: unknown) {
      console.error('Error updating page:', error);
      setError(error instanceof Error ? error.message : 'An error occurred while saving the page.');
    } finally {
      setIsLoading(false);
    }
  }, [page, cookies.token, lookup_code, hasPageChanged, lastSavedPageState]);

  // Auto-save effect - saves every 3 seconds if there are unsaved changes
  useEffect(() => {
    // Only set up auto-save timer if there are actual unsaved changes
    if (!hasUnsavedChanges || !page) return;
    
    const autoSaveTimer = setTimeout(() => {
      handleSave(false); // Auto-save without showing success message
    }, 3000);

    return () => clearTimeout(autoSaveTimer);
  }, [hasUnsavedChanges, handleSave, page]);

  // Track changes to mark as unsaved
  const handlePageChange = useCallback((updatedPage: Page) => {
    setPage(updatedPage);
    
    // Only mark as unsaved if there are actual changes compared to last saved state
    const hasChanges = hasPageChanged(updatedPage, lastSavedPageState);
    setHasUnsavedChanges(hasChanges);
  }, [lastSavedPageState, hasPageChanged]);

  // Add keyboard shortcut for manual saving (Cmd+S / Ctrl+S)
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === 's') {
        event.preventDefault();
        handleSave(true); // Manual save with success message
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleSave]);

  // Mobile preview slider handlers with drag functionality
  const handlePreviewDragStart = (clientX: number) => {
    setIsPreviewDragging(true);
    setPreviewDragStartX(clientX);
    setPreviewDragX(0);
  };

  const handlePreviewDragMove = (clientX: number) => {
    if (!isPreviewDragging) return;
    
    const deltaX = clientX - previewDragStartX;
    
    if (isPreviewSliderOpen) {
      // When open, only allow dragging right (closing)
      if (deltaX > 0) {
        setPreviewDragX(Math.min(deltaX, 400)); // Max drag distance
      }
    } else {
      // When closed, only allow dragging left (opening)
      if (deltaX < 0) {
        setPreviewDragX(Math.max(deltaX, -400)); // Max drag distance
      }
    }
  };

  const handlePreviewDragEnd = () => {
    setIsPreviewDragging(false);
    
    const threshold = 150; // Distance needed to trigger open/close
    
    if (isPreviewSliderOpen) {
      // If dragged right more than threshold, close
      if (previewDragX > threshold) {
        setIsPreviewSliderOpen(false);
      }
    } else {
      // If dragged left more than threshold, open
      if (previewDragX < -threshold) {
        setIsPreviewSliderOpen(true);
      }
    }
    
    setPreviewDragX(0);
    setPreviewDragStartX(0);
  };

  const closePreviewSlider = () => {
    setIsPreviewSliderOpen(false);
  };

  // Prevent body scroll when slider is open
  useEffect(() => {
    if (isPreviewSliderOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isPreviewSliderOpen]);

  return (
    <MainLayout>
      <div className="max-lg:hidden mb-3">
        <RouterLink
          to={PAGES_ROUTE}
          className="inline-flex items-center gap-2 text-sm/6 text-zinc-500 dark:text-zinc-400"
        >
          <ChevronLeftIcon className="size-4 fill-zinc-400 dark:fill-zinc-500" />
          Pages
        </RouterLink>
      </div>
      {page && (
        <div className="mt-4 flex justify-between gap-4">
          <div className="w-full">
            {/* Publishing Component */}
            <PublishComponent 
              page={page}
              isSaving={isLoading}
              hasUnsavedChanges={hasUnsavedChanges}
              lastSaveTime={lastSaveTime}
              onStatusChange={(updatedPage) => {
                // Update the page state with new publishing information from API
                const newPageState = {
                  ...page,
                  id: updatedPage.id,
                  lookup_code: updatedPage.lookup_code || page?.lookup_code,
                  published_lookup_code: updatedPage.published_lookup_code,
                  status: updatedPage.status,
                  published_url: updatedPage.published_url,
                  published_at: updatedPage.published_at,
                  has_published_version: updatedPage.has_published_version,
                  has_draft_version: updatedPage.has_draft_version,
                  published_version: updatedPage.published_version,
                  updated_at: updatedPage.updated_at || page?.updated_at
                };
                setPage(newPageState);
                // Update the saved state to match the published state
                setLastSavedPageState(newPageState);
              }}
            />

            <div className="border-b border-gray-200">
              <nav aria-label="Tabs" className="-mb-px flex justify-between items-center">
                <div className="flex space-x-8">
                  {tabs.map((tab) => (
                    <button
                      key={tab.name}
                      onClick={() => setActiveTab(tab.name)}
                      className={classNames(
                        tab.name === activeTab
                          ? 'border-violet-500 text-violet-600'
                          : 'border-transparent text-gray-500 dark:text-gray-300 hover:border-gray-300 hover:text-gray-700 dark:hover:text-white',
                        'group inline-flex items-center border-b-2 px-4 py-4 text-sm font-medium focus:outline-violet-600'
                      )}
                    >
                      <tab.icon
                        className={classNames(
                          tab.name === activeTab
                            ? 'text-violet-500'
                            : 'text-gray-400 dark:text-gray-300 group-hover:text-gray-500 dark:group-hover:text-white',
                          '-ml-0.5 mr-2 size-5'
                        )}
                      />
                      {tab.name}
                    </button>
                  ))}
                </div>
              </nav>
            </div>

            <div className="mt-4 flex flex-wrap flex-col justify-between gap-4">
              {activeTab === 'Content' ? (
                <div>
                  <Section
                    title="Add your links here"
                  >
                    <button
                      onClick={() => setIsLinkModalOpen(true)}
                      className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-violet-600 hover:bg-violet-700 active:bg-violet-800 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 transform hover:scale-105"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      Add Link
                    </button>
                    {errorMessage && <p className="text-red-500">{errorMessage}</p>}
                    {resourcesError && (
                      <p className="text-red-500 mt-2">Error loading links: {resourcesError}</p>
                    )}
                    <div className="mt-4 space-y-2">
                      {resourcesLoading ? (
                        <div className="text-center py-8">
                          <div className="inline-block w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Loading links...</p>
                        </div>
                      ) : resources.length > 0 ? (
                        <DndContext
                          sensors={sensors}
                          collisionDetection={closestCenter}
                          onDragStart={handleDragStart}
                          onDragEnd={handleDragEnd}
                        >
                          <SortableContext
                            items={resources.map((r) => r.id)}
                            strategy={verticalListSortingStrategy}
                          >
                            {resources.map((resource) => (
                              <SortableResourceItem
                                key={resource.id}
                                resource={resource}
                                onRemove={removeResource}
                                onEdit={handleEditLink}
                                onError={setError}
                              />
                            ))}
                          </SortableContext>
                        </DndContext>
                      ) : (
                        <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-8">
                          No links added yet. Click "Add Link" to get started.
                        </p>
                      )}
                    </div>
                  </Section>

                  <Section
                    title="Social Links"
                    legend="Select social platforms and enter their links"
                  >
                    <div className="space-y-4">
                      {socialPlatforms.map((platform) => (
                        <div
                          key={platform.id}
                          className="flex items-center gap-3"
                        >
                          <Checkbox
                            id={platform.id}
                            checked={
                              page.content.social?.[platform.id] != undefined
                            }
                            onChange={(checked) =>
                              handlePageChange({
                                ...page,
                                content: {
                                  ...page.content,
                                  social: {
                                    ...page.content.social,
                                    [platform.id]: checked ? '' : undefined,
                                  },
                                },
                              })
                            }
                          />
                          <div className="flex-shrink-0">
                            {socialIcons[platform.id]}
                          </div>
                          <Input
                            type="text"
                            placeholder={`Enter ${platform.title} link`}
                            value={page.content.social?.[platform.id] || ''}
                            onChange={(e) =>
                              handlePageChange({
                                ...page,
                                content: {
                                  ...page.content,
                                  social: {
                                    ...page.content.social,
                                    [platform.id]: e.target.value,
                                  },
                                },
                              })
                            }
                            disabled={page.content.social?.[platform.id] === undefined}
                            className="flex-1"
                          />
                        </div>
                      ))}
                    </div>
                  </Section>
                </div>
              ) : (
                <div>
                  <Section title="Profile">
                    <div className="space-y-6">
                      {/* Image Section */}
                      <div>
                        <Subheading>Image</Subheading>
                        <div className="flex items-center gap-6 mt-2">
                          {page.content.profileImage && (
                            <div className="flex-shrink-0">
                              <img
                                src={page.content.profileImage}
                                alt="Profile"
                                className="w-24 h-24 rounded-full object-cover border-2 border-gray-200 dark:border-gray-700"
                              />
                            </div>
                          )}
                          <div className="flex flex-col gap-2">
                            <Button
                              onClick={() => setIsImageModalOpen(true)}
                              type="button"
                            >
                              {page.content.profileImage ? 'Edit image' : 'Add image'}
                            </Button>
                            {page.content.profileImage && (
                              <Button
                                onClick={() =>
                                  handlePageChange({
                                    ...page,
                                    content: {
                                      ...page.content,
                                      profileImage: undefined,
                                    },
                                  })
                                }
                                type="button"
                                plain
                              >
                                Remove
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* About Section */}
                      <div>
                        <Subheading>About</Subheading>
                        <section className="space-y-6 mt-2">
                          <div>
                            <Subheading>
                              Title
                              <span className="text-sm opacity-60">
                                &nbsp;(optional)
                              </span>
                            </Subheading>
                            <Input
                              type="text"
                              maxLength={40}
                              defaultValue={page.title}
                              onChange={(e) =>
                                handlePageChange({
                                  ...page,
                                  title: e.target.value,
                                })
                              }
                              className="w-full"
                            />
                            <Text className="float-end">{page.title.length}/40</Text>
                          </div>
                          <div>
                            <Subheading>
                              Description
                              <span className="text-sm opacity-60">
                                &nbsp;(optional)
                              </span>
                            </Subheading>
                            <Input
                              type="text"
                              defaultValue={page?.description}
                              maxLength={40}
                              onChange={(e) =>
                                handlePageChange({
                                  ...page,
                                  description: e.target.value,
                                })
                              }
                              className="w-full"
                            />
                            <Text className="float-end">
                              {page?.description?.length || 0}/40
                            </Text>
                          </div>
                        </section>
                      </div>
                    </div>
                  </Section>

                  <Section title="Page">
                    <section className="grid gap-x-8 gap-y-6 sm:grid-cols-2">
                      <Subheading>Text Color</Subheading>
                      <ColorPicker
                        defaultValue={page.content.textColor}
                        onChange={(e) =>
                          handlePageChange({
                            ...page,
                            content: {
                              ...page.content,
                              textColor: e.target.value,
                            },
                          })
                        }
                      />
                      <Subheading>Background</Subheading>
                      <RadioGroup
                        value={page.content.backgroundType || 'color'}
                        className="space-x-4"
                        onChange={(value) =>
                          handlePageChange({
                            ...page,
                            content: {
                              ...page.content,
                              backgroundType: value,
                            },
                          })
                        }
                      >
                        {backgroundTypes.map((type) => (
                          <Radio key={type.id} value={type.id}>
                            <Label>{type.title}</Label>
                          </Radio>
                        ))}
                      </RadioGroup>

                      {page.content.backgroundType === 'color' && (
                        <>
                          <Label>Background Color</Label>
                          <ColorPicker
                            value={
                              page.content.backgroundColor || '#ffffff'
                            }
                            onChange={(e) =>
                              handlePageChange({
                                ...page,
                                content: {
                                  ...page.content,
                                  backgroundColor: e.target.value,
                                },
                              })
                            }
                          />
                        </>
                      )}

                      {page.content.backgroundType === 'gradient' && (
                        <>
                          <Label>Gradient Colors</Label>
                          <div className="flex gap-2">
                            <ColorPicker
                              id="hs-color-input"
                              title="Choose your color"
                              value={
                                page.content.gradientStart || '#ffffff'
                              }
                              onChange={(e) =>
                                handlePageChange({
                                  ...page,
                                  content: {
                                    ...page.content,
                                    gradientStart: e.target.value,
                                  },
                                })
                              }
                            />
                            <ColorPicker
                              value={
                                page.content.gradientEnd || '#000000'
                              }
                              onChange={(e) =>
                                handlePageChange({
                                  ...page,
                                  content: {
                                    ...page.content,
                                    gradientEnd: e.target.value,
                                  },
                                })
                              }
                            />
                          </div>

                          <Label>Gradient Direction</Label>
                          <Select
                            name="gradientDirection"
                            defaultValue={
                              page.content.gradientDirection ||
                              'to bottom'
                            }
                            onChange={(e) =>
                              handlePageChange({
                                ...page,
                                content: {
                                  ...page.content,
                                  gradientDirection: e.target
                                    .value as Page['content']['gradientDirection'],
                                },
                              })
                            }
                          >
                            <option value="to right">Left to Right</option>
                            <option value="to bottom">Top to Bottom</option>
                            <option value="to top right">
                              Diagonal (Top-Right)
                            </option>
                            <option value="to bottom left">
                              Diagonal (Bottom-Left)
                            </option>
                          </Select>
                        </>
                      )}
                    </section>
                  </Section>
                  <Section
                    title="Button Styles"
                    legend="How do you want your buttons look alike?"
                  >
                    <section className="grid gap-x-8 gap-y-6 sm:grid-cols-2">
                      <Subheading>Button Text Color</Subheading>
                      <ColorPicker
                        defaultValue={page.content.buttonColor}
                        onChange={(e) =>
                          handlePageChange({
                            ...page,
                            content: {
                              ...page.content,
                              buttonColor: e.target.value,
                            },
                          })
                        }
                      />
                    </section>
                    <RadioGroup
                      value={page.content.button}
                      onChange={(value: Page['content']['button']) =>
                        handlePageChange({
                          ...page,
                          content: {
                            ...page.content,
                            button: value,
                          },
                        })
                      }
                      className="grid"
                    >
                      {buttonStyles.map((style) => (
                        <Radio key={style.id} value={style.id}>
                          <Label>{style.title}</Label>
                        </Radio>
                      ))}
                    </RadioGroup>

                  </Section>
                  <Section title="Font Style" legend="Select the font style for your page">
                    <RadioGroup
                      value={page.content.fontFamily}
                      onChange={(value: string) =>
                        handlePageChange({
                          ...page,
                          content: {
                            ...page.content,
                            fontFamily: value,
                          },
                        })
                      }
                      className="grid"
                    >
                      {fontStyles.map((style) => (
                        <Radio key={style.id} value={style.id}>
                          <Label>{style.title}</Label>
                        </Radio>
                      ))}
                    </RadioGroup>
                  </Section>
                </div>
              )}
            </div>
          </div>

          <div className="hidden md:block mb-4">
            <div className="sticky top-20">
              <div className="text-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Preview</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Live preview of your page</p>
              </div>
              <div className="shadow-lg rounded-3xl overflow-hidden">
                <Preview
                  title={page.title}
                  description={page.description}
                  content={page.content}
                  links={pageLinks}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Preview Slider with Draggable Button */}
      {page && (
        <>
          {/* Backdrop */}
          <div 
            className={`fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity duration-300 md:hidden ${
              isPreviewSliderOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
            }`}
            onClick={closePreviewSlider}
          />
          
          {/* Preview Panel */}
          <div 
            className={`fixed top-0 right-0 h-full w-full max-w-sm bg-white dark:bg-gray-900 z-50 transition-transform duration-300 ease-in-out md:hidden ${
              isPreviewSliderOpen ? 'translate-x-0' : 'translate-x-full'
            }`}
            style={{
              transform: isPreviewDragging && !isPreviewSliderOpen 
                ? `translateX(calc(100% + ${previewDragX}px))` 
                : isPreviewDragging && isPreviewSliderOpen
                ? `translateX(${previewDragX}px)`
                : undefined
            }}
          >
            {/* Preview Content */}
            <div className="h-full flex flex-col">
              <div className="flex-1 flex items-center justify-center p-4 bg-gray-50 dark:bg-gray-800 overflow-auto">
                <div className="w-full max-w-[280px]">
                  <div className="scale-90 origin-center">
                    <Preview
                      title={page.title}
                      description={page.description}
                      content={page.content}
                      links={pageLinks}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Draggable Preview Button */}
          <div
            className={`fixed top-1/2 -translate-y-1/2 z-50 md:hidden transition-all duration-300 ${
              isPreviewSliderOpen ? 'left-0' : 'right-0'
            }`}
            style={{
              transform: isPreviewDragging 
                ? isPreviewSliderOpen
                  ? `translate(${previewDragX}px, -50%)`
                  : `translate(${previewDragX}px, -50%)`
                : undefined
            }}
          >
            <button
              onTouchStart={(e) => handlePreviewDragStart(e.touches[0].clientX)}
              onTouchMove={(e) => handlePreviewDragMove(e.touches[0].clientX)}
              onTouchEnd={handlePreviewDragEnd}
              onMouseDown={(e) => handlePreviewDragStart(e.clientX)}
              onMouseMove={(e) => isPreviewDragging && handlePreviewDragMove(e.clientX)}
              onMouseUp={handlePreviewDragEnd}
              onMouseLeave={() => isPreviewDragging && handlePreviewDragEnd()}
              onClick={(e) => {
                e.stopPropagation();
                if (!isPreviewDragging) {
                  setIsPreviewSliderOpen(!isPreviewSliderOpen);
                }
              }}
              className={`flex items-center gap-2 px-3 py-6 text-sm font-semibold text-white shadow-lg transition-all touch-none ${
                isPreviewSliderOpen 
                  ? 'bg-blue-600 hover:bg-blue-700 rounded-r-lg' 
                  : 'bg-blue-500 hover:bg-blue-600 rounded-l-lg'
              }`}
              style={{ cursor: isPreviewDragging ? 'grabbing' : 'grab' }}
            >
              {isPreviewSliderOpen ? (
                <>
                  <span className="writing-mode-vertical-rl rotate-180">Preview</span>
                </>
              ) : (
                <>
                  <span className="writing-mode-vertical-rl rotate-180">Preview</span>
                </>
              )}
            </button>
          </div>
        </>
      )}

      {/* Image Upload Modal */}
      {page && (
        <ImageUploadModal
          isOpen={isImageModalOpen}
          onClose={() => setIsImageModalOpen(false)}
          onSave={(imageUrl) => {
            handlePageChange({
              ...page,
              content: {
                ...page.content,
                profileImage: imageUrl,
              },
            });
          }}
          currentImage={page.content.profileImage}
          title={page.content.profileImage ? 'Edit image' : 'Add image'}
        />
      )}

      {/* Add Link Modal */}
      {page && (
        <AddLinkModal
          isOpen={isLinkModalOpen}
          onClose={() => setIsLinkModalOpen(false)}
          lookupCode={lookup_code}
          onAddResource={async (resource) => {
            // Refetch resources to update the list with the newly added link
            await refetchResources();
            console.log('Resource added:', resource);
          }}
        />
      )}

      {/* Edit Link Modal */}
      {editingResource && (
        <EditLinkModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setEditingResource(null);
          }}
          resource={editingResource}
          onUpdate={updateResource}
        />
      )}

      {/* <br />
      <br />
      <br />
      <br />
      <br />
      <br />
      <br />
      <br />
      <br />
      <div className='max-w-2xl break-words'>
        {JSON.stringify(page)}
      </div> */}
    </MainLayout>
  );
};
export default SinglePage;
