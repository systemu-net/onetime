import { API_URL } from '@/apis/config';
import { Radio, RadioGroup } from '@headlessui/react';
import { CheckIcon } from '@heroicons/react/20/solid';
import { useState } from 'react';
import { useCookies } from 'react-cookie';
import { useNavigate } from 'react-router-dom';
import { LOGIN_ROUTE } from '../routes';

type Frequency = {
  value: 'monthly' | 'annually';
  label: string;
  priceSuffix: string;
};

type Tier = {
  name: string;
  id: string;
  href: string;
  price: { monthly: string; annually: string };
  description: string;
  features: string[];
  mostPopular: boolean;
  disabled?: boolean;
};

const frequencies: Frequency[] = [
  { value: 'monthly', label: 'Monthly', priceSuffix: '/month' },
  { value: 'annually', label: 'Annually', priceSuffix: '/year' },
];

const tiers: Tier[] = [
  {
    name: 'Free',
    id: 'free',
    href: '#',
    price: { monthly: '$0', annually: '$0' },
    description: 'Free plan:',
    features: [
      '30 links/month',
      '30 QR Codes/month',
      '1 custom landing pages',
      '7 days of click & scan data',
      'Google Safe Browsing API protection'
    ],
    mostPopular: false,
    disabled: true,
  },
  {
    name: 'Creator',
    id: 'creator',
    href: '#',
    price: { monthly: '$9', annually: '$90' },
    description: 'Everything in Free, plus:',
    features: [
      '300 links/month',
      '300 QR Codes/month',
      '3 custom landing pages',
      '30 days of click & scan data',
      'City-level & device type click & scan data',
      'Post-click analytics: see what users do after clicking',
      'Google Safe Browsing API protection',
    ],
    mostPopular: true,
    disabled: true,
  },
  {
    name: 'Influencer',
    id: 'influencer',
    href: '#',
    price: { monthly: '$29', annually: '$290' },
    description: 'Everything in Creator, plus:',
    features: [
      '1000 links/month',
      '1000 QR Codes/month',
      '10 custom landing pages',
      '90 days of click & scan data',
      // 'Bulk link shortening',
      'City-level & device type click & scan data',
      'Post-click analytics: see what users do after clicking',
      'Google Safe Browsing API protection',
    ],
    mostPopular: false,
    disabled: true,
  },
  {
    name: 'Business',
    id: 'business',
    href: '#',
    price: { monthly: '$99', annually: '$990' },
    description: 'Everything in Influencer, plus:',
    features: [
      '3000 links/month',
      '3000 QR Codes/month',
      '25 custom landing pages',
      '6 months of click & scan data',
      'API access for integrations',
      'Custom branded domains',
      'Advanced reporting & data exports',
      'Priority support',
      'Post-click analytics: see what users do after clicking',
      'Google Safe Browsing API protection',
    ],
    mostPopular: false,
    disabled: true,
  },
  // {
  //   name: 'Enterprise',
  //   id: 'enterprise',
  //   href: '#',
  //   price: { monthly: '$999', annually: '$9990' },
  //   description: 'Everything in Premium, plus:',
  //   features: [
  //     'High-volume API & webhook access',
  //     '99.9% SLA uptime',
  //     '2000 QR Codes/month',
  //     '20000 links/month',
  //     '50 custom landing pages',
  //     'Advanced analytics',
  //     '1-hour, dedicated support response time',
  //     'Custom reporting tools',
  //   ],
  //   mostPopular: false,
  // },
];

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

export default function Pricing({ inline }: { inline?: boolean }) {

  const [frequency, setFrequency] = useState<'monthly' | 'annually'>('monthly');
  const [cookies] = useCookies(['token']);
  const navigate = useNavigate();

  const handleClick = async (event) => {
    if (!cookies.token) {
      return navigate(LOGIN_ROUTE);
    }

    const buttonValue = event.target.value;

    try {
      const response = await fetch(`${API_URL}/api/v1/checkouts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': cookies.token,
        },
        body: JSON.stringify({ lookup_key: buttonValue }),
      });

      if (response.ok) {
        const { url } = await response.json();

        window.location.href = url;
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message); // throw error message if not successful
      }
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : String(error));
    }
  };

  return (
    <div className={`bg-white dark:bg-zinc-900 ${inline ? 'py-4' : 'py-24 sm:py-32'}`}>
      <div className="mx-auto max-w-7xl px-6 lg:px-2 mb-12">
        {!inline && (
          < div className="mx-auto max-w-4xl text-center">
            {/* <h2 className="text-base/7 font-semibold text-violet-600">Pricing</h2> */}
            <p className="mt-2 text-balance text-5xl font-semibold tracking-tight text-primary dark:text-violet-400 sm:text-6xl">
              Pricing that grows with you
            </p>
          </div>
        )}
        <p className="mx-auto mt-6 max-w-2xl text-pretty text-center text-lg font-medium text-gray-600 dark:text-gray-400 sm:text-xl/8">
          Upgrade to benefit so much more from your short links, QR Codes & Custom landing pages
        </p>
        <div className="mt-16 flex justify-center">
          <fieldset aria-label="Payment frequency">
            <RadioGroup
              value={frequency}
              onChange={setFrequency}
              className="relative grid grid-cols-2 gap-x-2 rounded-full p-1 text-center text-sm/6
                         font-semibold ring-1 ring-inset ring-gray-200 bg-gray-50 dark:bg-zinc-900"
            >
              <div 
                className="absolute inset-1 rounded-full bg-violet-600 transition-transform duration-300 ease-in-out"
                style={{
                  width: 'calc(50% - 4px)',
                  transform: frequency === 'monthly' ? 'translateX(0)' : 'translateX(100%)'
                }}
              />
              {frequencies.map((option) => (
                <Radio
                  key={option.value}
                  value={option.value}
                  className="relative z-10 cursor-pointer rounded-full px-3 py-2
                             transition-colors duration-300
                             text-gray-600 dark:text-gray-400
                             data-[checked]:text-white"
                >
                  {option.label}
                </Radio>
              ))}
            </RadioGroup>
          </fieldset>
        </div>
        <div className="isolate mx-auto mt-10 grid max-w-md grid-cols-1 gap-8 md:max-w-4xl md:grid-cols-2 lg:max-w-7xl lg:grid-cols-4 xl:mx-0 xl:max-w-none">
          {tiers.map((tier) => (
            <div
              key={tier.id}
              onClick={tier.disabled ? undefined : handleClick}
              className={classNames(
                tier.mostPopular
                  ? 'ring-2 ring-accent shadow-2xl'
                  : 'ring-1 ring-gray-200 dark:ring-zinc-700 shadow-2xl',
                tier.disabled
                  ? tier.name === 'Free'
                    ? 'ring-2 ring-accent bg-accent/10 dark:bg-accent/20 cursor-default'
                    : tier.name === 'Creator'
                    ? 'opacity-50 cursor-not-allowed ring-2 ring-green-500 bg-green-50/50 dark:bg-green-950/10'
                    : tier.name === 'Influencer'
                    ? 'opacity-50 cursor-not-allowed ring-2 ring-yellow-500 dark:ring-yellow-600 shadow-[0_0_30px_rgba(236,72,153,0.5)] dark:shadow-[0_0_30px_rgba(236,72,153,0.6)]'
                    : tier.name === 'Business'
                    ? 'opacity-50 cursor-not-allowed ring-2 ring-blue-500 bg-blue-50/50 dark:bg-blue-950/10'
                    : 'opacity-50 cursor-not-allowed'
                  : 'hover:ring-2 hover:ring-accent group',
                'rounded-3xl p-8 transition-all duration-200 bg-white dark:bg-zinc-800'
              )}
            >
              <h3
                id={tier.id}
                className={classNames(
                  tier.mostPopular ? 'text-primary dark:text-violet-400' : 'text-gray-900 dark:text-zinc-100',
                  'text-2xl/8 font-semibold'
                )}
              >
                {tier.name}
              </h3>
              <p className="mt-6 flex items-baseline gap-x-1">
                <span className="text-4xl font-semibold tracking-tight text-gray-900 dark:text-zinc-100">
                  {tier.price[frequency]}
                </span>
                <span className="text-sm/6 font-semibold text-gray-600 dark:text-gray-400">
                  {frequencies.find(f => f.value === frequency)?.priceSuffix}
                </span>
              </p>
              <button
                value={`${tier.id}${frequency === 'monthly' ? '' : '_year'}`}
                aria-describedby={tier.id}
                disabled={tier.disabled}
                className={classNames(
                  tier.disabled
                    ? tier.name === 'Free'
                      ? 'bg-violet-600 text-white cursor-default font-bold'
                      : tier.name === 'Creator'
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : tier.mostPopular
                    ? 'bg-accent text-primary shadow-sm group-hover:bg-primary group-hover:text-white'
                    : 'text-primary ring-1 ring-inset ring-accent group-hover:bg-primary group-hover:text-white group-hover:ring-0',
                  'transition-all duration-200 w-full mt-6 block rounded-md px-3 py-2 text-center text-sm/6 font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-600'
                )}
              >
                {tier.disabled 
                  ? tier.name === 'Free' 
                    ? '✓ Current Plan' 
                    : 'Coming Soon' 
                  : `Upgrade to ${tier.name}`}
              </button>
              <p className="mt-8 font-bold text-sm/6 text-gray-600 dark:text-gray-400">{tier.description}</p>
              <ul
                role="list"
                className="mt-2 space-y-3 text-sm/6 text-gray-600 dark:text-gray-400"
              >
                {tier.features.map((feature) => (
                  <li key={feature} className="flex gap-x-3">
                    <CheckIcon
                      aria-hidden="true"
                      className="h-6 w-5 flex-none text-primary"
                    />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-16 flex justify-center">
          <fieldset aria-label="Payment frequency">
            <RadioGroup
              value={frequency}
              onChange={setFrequency}
              className="relative grid grid-cols-2 gap-x-2 rounded-full p-1 text-center text-sm/6
                         font-semibold ring-1 ring-inset ring-gray-200 bg-gray-50 dark:bg-zinc-900"
            >
              <div 
                className="absolute inset-1 rounded-full bg-violet-600 transition-transform duration-300 ease-in-out"
                style={{
                  width: 'calc(50% - 4px)',
                  transform: frequency === 'monthly' ? 'translateX(0)' : 'translateX(100%)'
                }}
              />
              {frequencies.map((option) => (
                <Radio
                  key={option.value}
                  value={option.value}
                  className="relative z-10 cursor-pointer rounded-full px-3 py-2
                             transition-colors duration-300
                             text-gray-600 dark:text-gray-400
                             data-[checked]:text-white"
                >
                  {option.label}
                </Radio>
              ))}
            </RadioGroup>
          </fieldset>
        </div>
      </div>
    </div >
  );
}
