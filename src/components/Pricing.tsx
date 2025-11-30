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
    features: ['5 QR Codes/month', '50 links/month', '1 custom landing pages'],
    mostPopular: false,
  },
  {
    name: 'Creator',
    id: 'creator',
    href: '#',
    price: { monthly: '$7', annually: '$70' },
    description: 'Everything in Free, plus:',
    features: [
      '30 QR Codes/month',
      '100 links/month',
      '5 custom landing pages',
      '1 months of click & scan data'
    ],
    mostPopular: true,
  },
  {
    name: 'Influencer',
    id: 'influencer',
    href: '#',
    price: { monthly: '$19', annually: '$190' },
    description: 'Everything in Creator, plus:',
    features: [
      '200 QR Codes/month',
      '1000 links/month',
      '10 custom landing pages',
      '1 year of click & scan data',
      // 'Bulk link shortening',
      'City-level & device type click & scan data',
    ],
    mostPopular: false,
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

  const [frequency, setFrequency] = useState<Frequency>(frequencies[0]);
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
    <div className={`bg-white ${inline ? 'py-4' : 'py-24 sm:py-32'}`}>
      <div className="mx-auto max-w-7xl px-6 lg:px-2">
        {!inline && (
          < div className="mx-auto max-w-4xl text-center">
            {/* <h2 className="text-base/7 font-semibold text-violet-600">Pricing</h2> */}
            <p className="mt-2 text-balance text-5xl font-semibold tracking-tight text-primary sm:text-6xl">
              Pricing that grows with you
            </p>
          </div>
        )}
        <p className="mx-auto mt-6 max-w-2xl text-pretty text-center text-lg font-medium text-gray-600 sm:text-xl/8">
          Upgrade to benefit so much more from your short links, QR Codes & Custom landing pages
        </p>
        <div className="mt-16 flex justify-center">
          <fieldset aria-label="Payment frequency">
            <RadioGroup
              value={frequency}
              onChange={setFrequency}
              className="grid grid-cols-2 gap-x-2 rounded-full p-1 text-center text-sm/6
                         font-semibold ring-1 ring-inset ring-gray-200"
            >
              {frequencies.map((option) => (
                <Radio
                  key={option.value}
                  value={option}
                  className="duration-500 cursor-pointer rounded-full px-3 py-2 text-primary data-[checked]:bg-accent data-[checked]:text-primary"
                >
                  {option.label}
                </Radio>
              ))}
            </RadioGroup>
          </fieldset>
        </div>
        <div className="isolate mx-auto mt-10 grid max-w-md grid-cols-1 gap-8 md:max-w-2xl md:grid-cols-3 lg:max-w-4xl xl:mx-0 xl:max-w-none">
          {tiers.map((tier) => (
            <div
              key={tier.id}
              onClick={handleClick}
              className={classNames(
                tier.mostPopular
                  ? 'ring-2 ring-accent shadow-2xl'
                  : 'ring-1 ring-gray-200 shadow-2xl',
                'rounded-3xl p-8 hover:ring-2 hover:ring-accent transition-all duration-200 group'
              )}
            >
              <h3
                id={tier.id}
                className={classNames(
                  tier.mostPopular ? 'text-primary' : 'text-gray-900',
                  'text-2xl/8 font-semibold'
                )}
              >
                {tier.name}
              </h3>
              <p className="mt-6 flex items-baseline gap-x-1">
                <span className="text-4xl font-semibold tracking-tight text-gray-900">
                  {tier.price[frequency.value]}
                </span>
                <span className="text-sm/6 font-semibold text-gray-600">
                  {frequency.priceSuffix}
                </span>
              </p>
              {tier.name !== 'Free' && (
                <button
                  value={`${tier.id}${frequency.value === 'monthly' ? '' : '_year'}`}
                  aria-describedby={tier.id}
                  className={classNames(
                    tier.mostPopular
                      ? 'bg-accent text-primary shadow-sm group-hover:bg-primary group-hover:text-white'
                      : 'text-primary ring-1 ring-inset ring-accent group-hover:bg-primary group-hover:text-white group-hover:ring-0',
                    'transition-all duration-200 w-full mt-6 block rounded-md px-3 py-2 text-center text-sm/6 font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-600'
                  )}
                >
                  Upgrade to {tier.name}
                </button>
              )}
              <p className="mt-8 font-bold text-sm/6 text-gray-600">{tier.description}</p>
              <ul
                role="list"
                className="mt-2 space-y-3 text-sm/6 text-gray-600"
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
      </div>
    </div >
  );
}
