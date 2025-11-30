import { createPage } from '@/apis/pages';

import Box from '@/components/Box';
import { Button } from '@/components/elements/button';
import { Divider } from '@/components/elements/divider';
import { Heading, Subheading } from '@/components/elements/heading';
import { Input } from '@/components/elements/input';
import { bluePinkTemplateBase64, pinkGradientTemplateBase64 } from '@/components/images/templateBase64Images';
import { useNotification } from '@/Notifications';
import { PAGES_ROUTE } from '@/routes';
import { useState } from 'react';
import { useCookies } from 'react-cookie';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../components/layouts/MainLayout';

const designTemplates = [
  {
    id: 1,
    name: 'Minimalist Design',
    description: 'A clean and modern design template to highlight your links.',
    image: bluePinkTemplateBase64,
    content: {
      fontFamily: 'rubik',
      button: 'rounded',
      buttonColor: '#596289',
      social: {
        fb: 'https://www.facebook.com/TaylorSwift/',
        linkedin: 'https://www.linkedin.com/in/sdemian'
      },
      backgroundType: 'gradient',
      gradientStart: '#5b90bc',
      gradientEnd: '#d8b0c8',
      gradientDirection: 'to bottom',
      textColor: '#fff',
      profileImage: 'https://www.sdemian.com/images/Sergii-Demianchuk.jpeg',
    },
  },
  {
    id: 2,
    name: 'Professional Design',
    description: 'Perfect for showcasing links in a formal and elegant style.',
    image: pinkGradientTemplateBase64,
    content: {
      button: 'rounded',
      buttonColor: '#fff',
      animation: 'Gradient 15s ease infinite',
      textColor: 'white',
      social: {
        fb: 'https://www.facebook.com/TaylorSwift/',
        ig: 'https://www.instagram.com/taylorswift/',
      },
      backgroundType: 'gradient',
      gradientDirection: 'to bottom right',
      gradientStart: '#8f7aac',
      gradientEnd: '#e94975',
      profileImage: 'https://www.sdemian.com/images/Sergii-Demianchuk.jpeg',
    },
  },

  {
    id: 3,
    name: 'Bold Design',
    description: 'Make a statement with this vibrant and colorful template.',
    image: '/templates/pink-gradient.png',
    content: {
      button: 'rounded',
      background: 'linear-gradient(-45deg, #EE7752, #E73C7E, #23A6D5, #23D5AB)',
      animation: 'Gradient 15s ease infinite',
      textColor: 'white',
      social: {
        fb: 'https://facebook.com/smariana',
      },
    },
  },
];
const CreatePage = () => {
  const [cookies] = useCookies(['token']);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [title, setTitle] = useState('');
  const [step, setStep] = useState(1);
  const [selectedTemplate, setSelectedTemplate] = useState<number | null>(null);
  const { addNotification } = useNotification();
  const navigate = useNavigate();

  const create = async () => {
    if (!title) {
      return;
    }
    try {
      setErrorMessage('');
      const page = await createPage(cookies.token, {
        brand_page: {
          title: designTemplates.filter((template) => template.id === selectedTemplate)[0].name,
          content: designTemplates.filter(
            (template) => template.id === selectedTemplate
          )[0].content,
        },
      });
      navigate(`${PAGES_ROUTE}/${page.lookup_code}`);
      addNotification('Page created', 'success');
    } catch (error: unknown) {
      console.error(error);
      setErrorMessage('An error occurred while creating new page.');
    }
  };

  return (
    <MainLayout>
      <div className="px-4 sm:px-6 lg:px-8 flex flex-wrap items-center justify-between gap-4">
        <Heading>Create Your Link Hub</Heading>
        <Subheading>
          Design a stunning, customizable page to showcase and manage all your
          important links. Thin.ly empowers creators and businesses worldwide to
          share content seamlessly. Discover More.
        </Subheading>
      </div>

      <div>
        <div aria-hidden="true" className="mt-6 w-full lg:w-2/3 px-4 lg:px-8">
          <div className="overflow-hidden rounded-full bg-gray-200">
            <div
              style={{ width: `${33.3 * step}%` }}
              className="h-2 rounded-full bg-violet-600 transition-all duration-500 ease-in-out"
            />
          </div>
          <div className="mt-4 hidden grid-cols-3 text-sm font-medium text-gray-600 sm:grid">
            <div className={step === 1 ? 'text-violet-600' : ''}>
              Creating Page
            </div>
            <div
              className={`text-center ${step === 2 ? 'text-violet-600' : ''}`}
            >
              Choosing Design
            </div>
            <div
              className={`text-right ${step === 3 ? 'text-violet-600' : ''}`}
            >
              Publishing Page
            </div>
          </div>
        </div>
      </div>

      <div className="pt-2">
        <div className="mt-2 flow-root">
          {step == 1 && (
            <Box>
              <section className="grid gap-x-8">
                <div className="space-y-1">
                  <Subheading>Choose Your Page Name</Subheading>
                  <div className="mt-4 flex max-w-xl gap-4">
                    <Input
                      className="flex-1"
                      aria-label="name"
                      name="name"
                      placeholder="Company or Name"
                      onChange={(e) => setTitle(e.target.value)}
                      required
                    />
                    <div>
                      <Button
                        className="float-right cursor-pointer"
                        onClick={() => setStep(2)}
                      >
                        Create Page
                      </Button>
                    </div>
                  </div>
                </div>
              </section>

              <Divider className="my-8" soft />
              <section className="mb-10">
                <Subheading className="mb-4">
                  Share Everything with One Simple Link
                </Subheading>
                Thin.ly Pages offer a sleek, organized way to display all your
                links in one place. With the reliability of Thin.ly short links,
                you can connect your audience to your content effortlessly.
                Check out these inspiring examples!
                <div></div>
              </section>
            </Box>
          )}

          {step == 2 && (
            <Box>
              <section className="grid gap-x-8">
                <div>
                  <Subheading>Choose your Design</Subheading>
                  <div className="my-4">
                    {/* <fieldset>
                    <legend className="text-sm/6 font-semibold text-gray-900">Select a mailing list</legend>
                    <RadioGroup
                      value={selectedTemplate}
                      onChange={setSelectedTemplate}
                      className="mt-6 grid grid-cols-1 gap-y-6 sm:grid-cols-3 sm:gap-x-4"
                    >
                      {designTemplates.map((mailingList) => (
                        <Radio
                          key={mailingList.id}
                          value={mailingList}
                          aria-label={mailingList.title}
                          aria-description={`${mailingList.description}`}
                          className="group relative flex cursor-pointer rounded-lg border border-gray-300 bg-white p-4 shadow-sm focus:outline-none data-[focus]:border-indigo-600 data-[focus]:ring-2 data-[focus]:ring-indigo-600"
                        >
                          <span className="flex flex-1">
                            <span className="flex flex-col">
                              <span className="block text-sm font-medium text-gray-900">{mailingList.title}</span>
                              <span className="mt-1 flex items-center text-sm text-gray-500">{mailingList.description}</span>
                            </span>
                          </span>
                          <CheckCircleIcon
                            aria-hidden="true"
                            className="size-5 text-indigo-600 group-[&:not([data-checked])]:invisible"
                          />
                          <span
                            aria-hidden="true"
                            className="pointer-events-none absolute -inset-px rounded-lg border-2 border-transparent group-data-[focus]:border group-data-[checked]:border-indigo-600"
                          />
                        </Radio>
                      ))}
                    </RadioGroup>
                  </fieldset> */}

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                      {designTemplates.map((template) => (
                        <div
                          key={template.id}
                          className={`w-full bg-white border rounded-[26px] shadow dark:bg-gray-800 dark:border-gray-700 hover:ring-2 hover:ring-violet-600 cursor-pointer ${selectedTemplate === template.id
                            ? 'ring-2 ring-violet-600 '
                            : ''
                            }`}
                          onClick={() => setSelectedTemplate(template.id)}
                        >
                          <img
                            className="rounded-t-[26px] w-full h-auto"
                            src={template.image}
                            alt={template.name}
                          />
                          <div className="p-5">
                            <h5 className="mb-2 text-xl font-bold tracking-tight text-gray-900 dark:text-white">
                              {template.name}
                            </h5>
                            <p className="mb-3 font-normal text-gray-700 dark:text-gray-400">
                              {template.description}
                            </p>
                            {selectedTemplate === template.id && (
                              <Button
                                className="mt-3 cursor-pointer"
                                onClick={create}
                              >
                                Use This Design
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  or
                  <Button
                    outline
                    className="cursor-pointer ml-2"
                    onClick={create}
                  >
                    Design Your Own
                  </Button>
                </div>
              </section>
            </Box>
          )}
        </div>
      </div>
      {errorMessage && <p className="text-red-500">{errorMessage}</p>}
    </MainLayout>
  );
};

export default CreatePage;
