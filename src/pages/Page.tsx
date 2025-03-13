import { SHORT_URL } from '@/apis/config';
import { getPage } from '@/apis/pages';
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

import { useEffect, useState } from 'react';
import { useCookies } from 'react-cookie';
import { Link as RouterLink, useParams } from 'react-router-dom';

const buttonStyles: { id: Page['configuration']['button']; title: string }[] = [
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
  const { id } = useParams();
  const [cookies] = useCookies(['token']);
  const [error, setError] = useState<string>('');
  const [page, setPage] = useState<Page | null>(null);
  const [activeTab, setActiveTab] = useState('Content');
  const { shortenedUrls, fetchLinks, errorMessage } = useLinks();

  useEffect(() => {
    if (cookies.token && !shortenedUrls.length) {
      fetchLinks();
    }
  }, []);

  const fetchPage = async () => {
    try {
      const res: Page = await getPage(cookies.token, id);
      setPage(res);
    } catch (error: unknown) {
      console.error(error);
      setError('An error occurred while fetching page.');
    }
  };

  useEffect(() => {
    if (cookies.token) {
      fetchPage();
    }
  }, [cookies.token]); // Runs when the token is available

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
              {error && <p className="text-red-500">{error}</p>}
              <Subheading className="">
                <span className="mr-4">{SHORT_URL + page?.url} </span>
                <CopyLink link={SHORT_URL + page?.url} />
              </Subheading>
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
                          defaultValue={page.url}
                          onChange={(e) =>
                            setPage({
                              ...page,
                              url: e.target.value,
                            })
                          }
                        />
                        <Text className="float-end">{page.url.length}/40</Text>
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
                      {page?.links.map((button) => (
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
                                page.configuration.social?.[platform.id] !=
                                undefined
                              }
                              onChange={(checked) =>
                                setPage({
                                  ...page,
                                  configuration: {
                                    ...page.configuration,
                                    social: {
                                      ...page.configuration.social,
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
                            page.configuration.social?.[platform.id] !==
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
                                    page.configuration.social?.[platform.id] ||
                                    ''
                                  }
                                  onChange={(e) =>
                                    setPage({
                                      ...page,
                                      configuration: {
                                        ...page.configuration,
                                        social: {
                                          ...page.configuration.social,
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
                        defaultValue={page.configuration.textColor}
                        onChange={(e) =>
                          setPage({
                            ...page,
                            configuration: {
                              ...page.configuration,
                              textColor: e.target.value,
                            },
                          })
                        }
                      />
                      <Subheading>Background</Subheading>
                      <RadioGroup
                        value={page.configuration.backgroundType || 'color'}
                        className="space-x-4"
                        onChange={(value) =>
                          setPage({
                            ...page,
                            configuration: {
                              ...page.configuration,
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

                      {page.configuration.backgroundType === 'color' && (
                        <>
                          <Label>Background Color</Label>
                          <ColorPicker
                            value={
                              page.configuration.backgroundColor || '#ffffff'
                            }
                            onChange={(e) =>
                              setPage({
                                ...page,
                                configuration: {
                                  ...page.configuration,
                                  backgroundColor: e.target.value,
                                },
                              })
                            }
                          />
                        </>
                      )}

                      {page.configuration.backgroundType === 'gradient' && (
                        <>
                          <Label>Gradient Colors</Label>
                          <div className="flex gap-2">
                            <ColorPicker
                              id="hs-color-input"
                              title="Choose your color"
                              value={
                                page.configuration.gradientStart || '#ffffff'
                              }
                              onChange={(e) =>
                                setPage({
                                  ...page,
                                  configuration: {
                                    ...page.configuration,
                                    gradientStart: e.target.value,
                                  },
                                })
                              }
                            />
                            <ColorPicker
                              value={
                                page.configuration.gradientEnd || '#000000'
                              }
                              onChange={(e) =>
                                setPage({
                                  ...page,
                                  configuration: {
                                    ...page.configuration,
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
                              page.configuration.gradientDirection ||
                              'to bottom'
                            }
                            onChange={(e) =>
                              setPage({
                                ...page,
                                configuration: {
                                  ...page.configuration,
                                  gradientDirection: e.target
                                    .value as Page['configuration']['gradientDirection'],
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
                        defaultValue={page.configuration.buttonColor}
                        onChange={(e) =>
                          setPage({
                            ...page,
                            configuration: {
                              ...page.configuration,
                              buttonColor: e.target.value,
                            },
                          })
                        }
                      />
                    </section>
                    <RadioGroup
                      value={page.configuration.button}
                      onChange={(value: Page['configuration']['button']) =>
                        setPage({
                          ...page,
                          configuration: {
                            ...page.configuration,
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
                      value={page.configuration.fontFamily}
                      onChange={(value: string) =>
                        setPage({
                          ...page,
                          configuration: {
                            ...page.configuration,
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
                  title={page.url}
                  description={page.description}
                  configuration={page.configuration}
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
