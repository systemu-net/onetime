import { getPage, updatePage } from '@/apis/pages';
import Box from '@/components/Box';
import { Button } from '@/components/elements/button';
import { Checkbox } from '@/components/elements/checkbox';
import ColorPicker from '@/components/elements/colorPicker';
import { CopyLink } from '@/components/elements/Copy';
import {
  FieldGroup,
  Fieldset,
  Label,
  Legend,
  Title,
} from '@/components/elements/fieldset';
import { Subheading } from '@/components/elements/heading';
import { Input } from '@/components/elements/input';
import { Radio, RadioGroup } from '@/components/elements/radio';
import { Select } from '@/components/elements/select';
import { Text } from '@/components/elements/text';
import MainLayout from '@/components/layouts/MainLayout';
import PublishComponent from '@/components/PublishComponent';
import Preview, { socialIcons } from '@/components/sections/Preview';
import { useLinks } from '@/context/LinksContext';
import { PAGES_ROUTE } from '@/routes';
import { Page } from '@/types';
import {
  ChevronLeftIcon,
  PaintBrushIcon,
  RectangleGroupIcon,
} from '@heroicons/react/16/solid';
import { DevicePhoneMobileIcon, XMarkIcon } from '@heroicons/react/24/outline';

import { useCallback, useEffect, useState } from 'react';
import { useCookies } from 'react-cookie';
import { Link as RouterLink, useParams } from 'react-router-dom';

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

const SinglePage = () => {
  const { lookup_code } = useParams();
  const [cookies] = useCookies(['token']);
  const [error, setError] = useState<string>('');
  const [page, setPage] = useState<Page | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState('Content');
  const [isPreviewSliderOpen, setIsPreviewSliderOpen] = useState<boolean>(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [lastSaveTime, setLastSaveTime] = useState<Date | null>(null);
  const [lastSavedPageState, setLastSavedPageState] = useState<Page | null>(null);
  const { shortenedUrls, fetchLinks, errorMessage } = useLinks();

  useEffect(() => {
    if (cookies.token && !shortenedUrls.length) {
      fetchLinks();
    }
  }, [cookies.token, shortenedUrls.length, fetchLinks]);



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

  // Mobile preview slider handlers
  const openPreviewSlider = () => {
    setIsPreviewSliderOpen(true);
  };

  const closePreviewSlider = () => {
    setIsPreviewSliderOpen(false);
  };

  // Handle touch gestures for swipe to close
  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    const element = e.currentTarget as HTMLElement;
    element.dataset.startX = touch.clientX.toString();
    element.dataset.startY = touch.clientY.toString();
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isPreviewSliderOpen) return;
    
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
            <Box>
              {error && <p className="text-red-500 mb-2">{error}</p>}
              {saveSuccess && <p className="text-green-500 mb-2">Page saved successfully!</p>}
              <div className="flex items-center justify-between">
                <Subheading className="">
                  {(page?.published_url && (
                    <>
                      <span className="mr-4">{page.published_url} </span>
                      <CopyLink link={page.published_url} />
                    </>
                  ))}
                </Subheading>
                <div className="flex items-center gap-3">
                  {/* Mobile Preview Button */}
                  <button
                    onClick={openPreviewSlider}
                    className="md:hidden flex items-center gap-2 px-4 py-2 text-sm bg-blue-500 hover:bg-blue-600 text-white rounded-md transition-colors shadow-sm"
                    title="Open mobile preview"
                  >
                    <DevicePhoneMobileIcon className="w-4 h-4" />
                    Preview
                  </button>
                  {/* Auto-save status indicator */}
                  <div className="flex items-center gap-2 text-sm">
                    {isLoading && (
                      <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
                        <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                        <span>Saving...</span>
                      </div>
                    )}
                    {!isLoading && hasUnsavedChanges && (
                      <span className="text-amber-600 dark:text-amber-400 font-medium">● Auto-saving in 3s</span>
                    )}
                    {!isLoading && !hasUnsavedChanges && lastSaveTime && (
                      <span className="text-green-600 dark:text-green-400">✓ All changes saved</span>
                    )}
                  </div>
                </div>
              </div>
            </Box>

            {/* Publishing Component */}
            <PublishComponent 
              page={page}
              onStatusChange={(updatedPage) => {
                // Update the page state with new publishing information from API
                setPage(prev => prev ? {
                  ...prev,
                  id: updatedPage.id,
                  lookup_code: updatedPage.lookup_code || prev.lookup_code,
                  published_lookup_code: updatedPage.published_lookup_code,
                  status: updatedPage.status,
                  published_url: updatedPage.published_url,
                  published_at: updatedPage.published_at,
                  has_published_version: updatedPage.has_published_version,
                  has_draft_version: updatedPage.has_draft_version,
                  published_version: updatedPage.published_version,
                  updated_at: updatedPage.published_at || prev.updated_at
                } : prev);
              }}
            />

            <div className="border-b border-gray-200">
              <nav aria-label="Tabs" className="-mb-px flex space-x-8">
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
              </nav>
            </div>

            <div className="mt-4 flex flex-wrap flex-col justify-between gap-4">
              {activeTab === 'Content' ? (
                <div>
                  <Section title="About">
                    <section className="grid gap-x-8 gap-y-6 sm:grid-cols-2">
                      <Subheading>
                        Title
                        <span className="text-sm opacity-60">
                          &nbsp;(optional)
                        </span>
                      </Subheading>
                      <div>
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
                        />
                        <Text className="float-end">{page.title.length}/40</Text>
                      </div>
                      <Subheading>
                        Description
                        <span className="text-sm opacity-60">
                          &nbsp;(optional)
                        </span>
                      </Subheading>
                      <div>
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
                        />
                        <Text className="float-end">
                          {page?.description?.length || 0}/40
                        </Text>
                      </div>
                    </section>
                  </Section>

                  <Section
                    title="Add your links here"
                  >
                    <Button>TODO: add page link</Button>
                    {errorMessage && <p className="text-red-500">{errorMessage}</p>}
                    <div>
                      {page?.links?.map((button) => (
                        <div
                          key={button.id}
                        >
                          {button.label}: {button.link}
                        </div>
                      ))}
                    </div>
                  </Section>

                  <Section
                    title="Social Links"
                    legend="Select social platforms and enter their links"
                  >
                    <>
                      <div className="flex gap-6">
                        {socialPlatforms.map((platform) => (
                          <div key={platform.id}>
                            <Checkbox
                              id={platform.id}
                              checked={
                                page.content.social?.[platform.id] !=
                                undefined
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
                            ></Checkbox>
                            <Label
                              className="ml-2 align-top cursor-pointer"
                              htmlFor={platform.id}
                            >
                              {platform.title}
                            </Label>
                          </div>
                        ))}
                      </div>
                      <div>
                        <Label className="mb-1">Edit your links</Label>
                        {socialPlatforms.map(
                          (platform) =>
                            page.content.social?.[platform.id] !==
                            undefined && (
                              <div
                                key={platform.id}
                                className="flex items-center mb-2"
                              >
                                {socialIcons[platform.id]}
                                <Input
                                  type="text"
                                  placeholder={`Enter ${platform.title} link`}
                                  value={
                                    page.content.social?.[platform.id] ||
                                    ''
                                  }
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
                                  className="ml-4 flex-1"
                                />
                              </div>
                            )
                        )}
                      </div>
                    </>
                  </Section>
                </div>
              ) : (
                <div>
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
                  links={page.links}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Preview Slider */}
      {page && (
        <>
          {/* Backdrop */}
          <div 
            className={`fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity duration-300 md:hidden ${
              isPreviewSliderOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
            }`}
            onClick={closePreviewSlider}
          />
          
          {/* Slider */}
          <div 
            className={`fixed top-0 right-0 h-full w-full max-w-sm bg-white dark:bg-gray-900 z-50 transform transition-transform duration-300 ease-in-out md:hidden ${
              isPreviewSliderOpen ? 'translate-x-0' : 'translate-x-full'
            }`}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Live Preview</h2>
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
                    title={page.title}
                    description={page.description}
                    content={page.content}
                    links={page.links}
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
