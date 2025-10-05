import { SHORT_URL } from '@/apis/config';
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
import Preview, { socialIcons } from '@/components/sections/Preview';
import { useLinks } from '@/context/LinksContext';
import { PAGES_ROUTE } from '@/routes';
import { Page } from '@/types';
import {
  ChevronLeftIcon,
  PaintBrushIcon,
  RectangleGroupIcon,
} from '@heroicons/react/16/solid';

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
      } catch (error: unknown) {
        console.error(error);
        setError('An error occurred while fetching page.');
      }
    };

    if (cookies.token) {
      fetchPage();
    }
  }, [cookies.token, lookup_code]); // Runs when the token is available

  const handleSave = useCallback(async () => {
    if (!page || !cookies.token) return;

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
    setSaveSuccess(false);

    try {
      const updatedPage = await updatePage(cookies.token, lookup_code, {
        title: page.title,
        description: page.description,
        content: page.content,
        links: page.links,
      });
      setPage(updatedPage);
      setSaveSuccess(true);
      // Clear success message after 3 seconds
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error: unknown) {
      console.error('Error updating page:', error);
      setError(error instanceof Error ? error.message : 'An error occurred while saving the page.');
    } finally {
      setIsLoading(false);
    }
  }, [page, cookies.token, lookup_code]);

  // Add keyboard shortcut for saving (Cmd+S / Ctrl+S)
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === 's') {
        event.preventDefault();
        handleSave();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleSave]);

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
                  {(page?.published_lookup_code && (
                    <>
                      <span className="mr-4">{SHORT_URL + page?.published_lookup_code} </span>
                      <CopyLink link={SHORT_URL + page?.published_lookup_code} />
                    </>
                  ))}
                </Subheading>
                <Button
                  onClick={handleSave}
                  disabled={isLoading}
                  className="bg-violet-600 text-white hover:bg-violet-700 disabled:opacity-50"
                >
                  {isLoading ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </Box>

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
                            setPage({
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
                            setPage({
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
                                setPage({
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
                                    setPage({
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
                          setPage({
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
                          setPage({
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
                              setPage({
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
                                setPage({
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
                                setPage({
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
                              setPage({
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
                          setPage({
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
                        setPage({
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
                        setPage({
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
              <div className="text-center mb-4">Preview</div>
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
      <br />
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
      </div>
    </MainLayout>
  );
};
export default SinglePage;
