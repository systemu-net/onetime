import { SHORT_URL } from '@/apis/config';
import { getPage } from '@/apis/pages';
import { Checkbox } from '@/components/elements/checkbox';
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
import MainLayout from '@/components/layouts/MainLayout';
import Preview, { socialIcons } from '@/components/sections/Preview';
import { PAGES_ROUTE } from '@/routes';
import { Page } from '@/types';
import {
  ChevronLeftIcon,
  PaintBrushIcon,
  RectangleGroupIcon,
} from '@heroicons/react/16/solid';
import { SliderPicker } from 'react-color';

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
  { id: 'mono', title: 'Monospace' },
  { id: "'Courier New', monospace", title: 'Courier New, monospace' },
  { id: "'Brush Script MT', cursive", title: 'Brush Script MT, cursive' },
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

const SinglePage = () => {
  const { id } = useParams();
  const [cookies] = useCookies(['token']);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [page, setPage] = useState<Page | null>(null);
  const [activeTab, setActiveTab] = useState('Content');

  const fetchPage = async () => {
    try {
      const res: Page = await getPage(cookies.token, id);
      setPage(res);
    } catch (error: unknown) {
      console.error(error);
      setErrorMessage('An error occurred while fetching page.');
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
            <div className="mb-4 p-4 sm:px-6 lg:px-8 shadow rounded-lg bg-white dark:bg-zinc-900">
              {errorMessage && <p className="text-red-500">{errorMessage}</p>}
              <Subheading className="mt-4">
                <span className='mr-4'>{SHORT_URL + page?.url} </span><CopyLink link={SHORT_URL + page?.url} />
              </Subheading>
            </div>
            <div>
              <div className="border-b border-gray-200">
                <nav aria-label="Tabs" className="-mb-px flex space-x-8">
                  {tabs.map((tab) => (
                    <button
                      key={tab.name}
                      onClick={() => setActiveTab(tab.name)}
                      className={classNames(
                        tab.name === activeTab
                          ? 'border-violet-500 text-violet-600'
                          : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700',
                        'group inline-flex items-center border-b-2 px-4 py-4 text-sm font-medium'
                      )}
                    >
                      <tab.icon
                        className={classNames(
                          tab.name === activeTab
                            ? 'text-violet-500'
                            : 'text-gray-400 group-hover:text-gray-500',
                          '-ml-0.5 mr-2 size-5'
                        )}
                      />
                      {tab.name}
                    </button>
                  ))}
                </nav>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap flex-col justify-between gap-4">
              {activeTab === 'Content' ? (
                <div>
                  <div className="mb-4 p-4 sm:px-6 lg:px-8 shadow rounded-lg bg-white dark:bg-zinc-900">
                    <Fieldset>
                      <Title>Title</Title>
                      <FieldGroup>
                        <Input
                          type="text"
                          defaultValue={page.url}
                          onChange={(e) =>
                            setPage({
                              ...page,
                              url: e.target.value,
                            })
                          }
                        />
                      </FieldGroup>
                    </Fieldset>
                  </div>
                  <div className="mb-4 p-4 sm:px-6 lg:px-8 shadow rounded-lg bg-white dark:bg-zinc-900">
                    <Fieldset>
                      <Title>Social Links</Title>
                      <Legend>
                        Select social platforms and enter their links
                      </Legend>
                      <div className="flex gap-6 pt-4 my-4">
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
                      <Label>Edit your links</Label>
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
                                  page.configuration.social?.[platform.id] || ''
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
                    </Fieldset>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="mb-4 p-4 sm:px-6 lg:px-8 shadow rounded-lg bg-white dark:bg-zinc-900">
                    <Fieldset>
                      <Title>Button Styles</Title>
                      <Legend>How do you want your buttons look alike?</Legend>
                      <FieldGroup>
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
                      </FieldGroup>
                    </Fieldset>
                  </div>
                  <div className="mb-4 p-4 sm:px-6 lg:px-8 shadow rounded-lg bg-white dark:bg-zinc-900">
                    <Fieldset>
                      <Title>Font Style</Title>
                      <Legend className="mb-8">
                        Select the font style for your page
                      </Legend>

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
                    </Fieldset>
                  </div>

                  <div className="mb-4 p-4 sm:px-6 lg:px-8 shadow rounded-lg bg-white dark:bg-zinc-900">
                    <Fieldset>
                      <Title>Text Color</Title>
                      <FieldGroup>
                        <Input
                          type="text"
                          value={page.configuration.textColor}
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
                        <SliderPicker
                          color={page.configuration.textColor}
                          onChangeComplete={(e) =>
                            setPage({
                              ...page,
                              configuration: {
                                ...page.configuration,
                                textColor: e.hex,
                              },
                            })
                          } />
                      </FieldGroup>
                    </Fieldset>
                  </div>
                  <div className="mb-4 p-4 sm:px-6 lg:px-8 shadow rounded-lg bg-white dark:bg-zinc-900">
                    <Fieldset>
                      <Title>Background</Title>
                      <FieldGroup>
                        <Input
                          type="text"
                          value={page.configuration.background}
                          onChange={(e) =>
                            setPage({
                              ...page,
                              configuration: {
                                ...page.configuration,
                                background: e.target.value,
                              },
                            })
                          }
                        />
                      </FieldGroup>
                    </Fieldset>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="hidden md:block">
            <div className="sticky top-20">
              <div className="text-center mb-4">Preview</div>
              <div className="shadow-lg rounded-3xl overflow-hidden">
                <Preview
                  title={page.url}
                  configuration={page.configuration}
                  links={page.links}
                />
              </div>
            </div>
          </div>
        </div>
      )}
      {JSON.stringify(page)}
    </MainLayout>
  );
};
export default SinglePage;
