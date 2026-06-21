import { API_URL } from "@/apis/config";
import { Radio, RadioGroup } from "@headlessui/react";
import { CheckBadgeIcon, CheckIcon } from "@heroicons/react/20/solid";
import { Crown } from "lucide-react";
import { useState } from "react";
import { useCookies } from "react-cookie";
import { useNavigate } from "react-router-dom";
import { useNotification } from "../Notifications";
import { LOGIN_ROUTE } from "../routes";

type Frequency = {
  value: "monthly" | "annually";
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

type TierState = "free" | "current" | "upgrade" | "downgrade";

const PLAN_RANK: Record<string, number> = {
  free: 0,
  creator: 1,
  influencer: 2,
  business: 3,
};

const frequencies: Frequency[] = [
  { value: "monthly", label: "Monthly", priceSuffix: "/month" },
  { value: "annually", label: "Annually", priceSuffix: "/year" },
];

const tiers: Tier[] = [
  {
    name: "Free",
    id: "free",
    href: "#",
    price: { monthly: "$0", annually: "$0" },
    description: "Free plan:",
    features: [
      "30 links/month",
      "30 QR Codes/month",
      "1 custom landing pages",
      "3 link campaigns",
      "7 days of click & scan data",
      "Google Safe Browsing API protection",
    ],
    mostPopular: false,
  },
  {
    name: "Creator",
    id: "creator",
    href: "#",
    price: { monthly: "$9", annually: "$90" },
    description: "Everything in Free, plus:",
    features: [
      "Verified checkmark",
      "300 links/month",
      "300 QR Codes/month",
      "3 custom landing pages",
      "10 link campaigns",
      "30 days of click & scan data",
      "City-level & device type click & scan data",
      "Post-click analytics: see what users do after clicking",
      "Google Safe Browsing API protection",
    ],
    mostPopular: true,
  },
  {
    name: "Influencer",
    id: "influencer",
    href: "#",
    price: { monthly: "$29", annually: "$290" },
    description: "Everything in Creator, plus:",
    features: [
      "Verified checkmark",
      "1000 links/month",
      "1000 QR Codes/month",
      "10 custom landing pages",
      "30 link campaigns",
      "90 days of click & scan data",
      // 'Bulk link shortening',
      "City-level & device type click & scan data",
      "Post-click analytics: see what users do after clicking",
      "Google Safe Browsing API protection",
    ],
    mostPopular: false,
  },
  {
    name: "Business",
    id: "business",
    href: "#",
    price: { monthly: "$99", annually: "$990" },
    description: "Everything in Influencer, plus:",
    features: [
      "Verified checkmark",
      "3000 links/month",
      "3000 QR Codes/month",
      "30 custom landing pages",
      "100 link campaigns",
      "6 months of click & scan data",
      "API access for integrations",
      "Custom branded domains",
      "Advanced reporting & data exports",
      "Priority support",
      "Post-click analytics: see what users do after clicking",
      "Google Safe Browsing API protection",
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
  return classes.filter(Boolean).join(" ");
}

function isVerifiedFeature(feature: string) {
  return feature === "Verified checkmark";
}

function isCampaignFeature(feature: string) {
  return [
    "3 link campaigns",
    "10 link campaigns",
    "30 link campaigns",
    "100 link campaigns",
  ].includes(feature);
}

export default function Pricing({ inline }: { inline?: boolean }) {
  const [frequency, setFrequency] = useState<"monthly" | "annually">("monthly");
  const [cookies, setCookie] = useCookies(["token", "plan"]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { addNotification } = useNotification();

  const currentPlanName = (cookies.plan?.name || "free").toLowerCase();
  const currentPlanRank = PLAN_RANK[currentPlanName] ?? 0;

  const getTierState = (tier: Tier): TierState => {
    if (tier.id === currentPlanName) return "current";
    if (tier.id === "free") return "free";
    const tierRank = PLAN_RANK[tier.id] ?? 0;
    return tierRank > currentPlanRank ? "upgrade" : "downgrade";
  };

  const getButtonText = (state: TierState, tierName: string): string => {
    switch (state) {
      case "current":
        return "✓ Current Plan";
      case "free":
        return "Free Plan";
      case "upgrade":
        return `Upgrade to ${tierName}`;
      case "downgrade":
        return `Downgrade to ${tierName}`;
    }
  };

  const isTierDisabled = (state: TierState): boolean => {
    return state === "current" || state === "free" || loading;
  };

  const handleClick = async (event: React.MouseEvent<HTMLButtonElement>) => {
    if (!cookies.token) {
      return navigate(LOGIN_ROUTE);
    }

    const buttonValue = (event.target as HTMLButtonElement).value;
    if (!buttonValue) return;

    // Extract the tier id from the button value (e.g. "influencer_year" → "influencer")
    const selectedTierId = buttonValue.replace(/_year$/, "");
    const selectedTier = tiers.find((t) => t.id === selectedTierId);

    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/v1/checkouts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: cookies.token,
        },
        body: JSON.stringify({ lookup_key: buttonValue }),
      });

      const data = await response.json();

      if (response.ok) {
        if (data.url) {
          // New subscription — redirect to Stripe Checkout
          setLoading(false);
          window.location.href = data.url;
          return;
        }
        if (data.client_secret) {
          // 3D Secure required for upgrade payment
          addNotification(
            "Additional authentication required. Please complete the payment.",
            "info",
          );
          return;
        }
        // Upgrade/downgrade success — optimistically update the plan cookie
        // so the UI reflects the change immediately without waiting for the
        // Stripe webhook to update the database.
        if (selectedTier) {
          setCookie("plan", {
            ...cookies.plan,
            name: selectedTier.name.toLowerCase(),
          });
        }
        addNotification(
          data.message || "Plan updated successfully!",
          "success",
        );
      } else if (response.status === 422) {
        addNotification(
          data.message || "You are already subscribed to this plan.",
          "warning",
        );
      } else {
        addNotification(data.message || "Something went wrong.", "error");
      }
    } catch (error) {
      addNotification(
        error instanceof Error ? error.message : "Something went wrong.",
        "error",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={`bg-white dark:bg-zinc-950 ${inline ? "py-4" : "py-24 sm:py-32"}`}
    >
      <div className="mx-auto max-w-7xl px-6 lg:px-2 mb-12">
        {!inline && (
          <div className="mx-auto max-w-4xl text-center">
            {/* <h2 className="text-base/7 font-semibold text-violet-600">Pricing</h2> */}
            <p className="mt-2 text-balance text-5xl font-semibold tracking-tight text-primary dark:text-violet-400 sm:text-6xl">
              Pricing that grows with you
            </p>
          </div>
        )}
        <p className="mx-auto mt-6 max-w-2xl text-pretty text-center text-lg font-medium text-gray-600 dark:text-gray-400 sm:text-xl/8">
          Upgrade to benefit so much more from your short links, QR Codes &
          Custom landing pages
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
                  width: "calc(50% - 4px)",
                  transform:
                    frequency === "monthly"
                      ? "translateX(0)"
                      : "translateX(100%)",
                }}
              />
              {frequencies.map((option) => (
                <Radio
                  key={option.value}
                  value={option.value}
                  className="relative z-10 cursor-pointer rounded-full px-3 py-2
                             transition-colors duration-300
                             text-gray-600 dark:text-white
                             data-[checked]:text-white"
                >
                  {option.label}
                </Radio>
              ))}
            </RadioGroup>
          </fieldset>
        </div>
        <div className="isolate mx-auto mt-10 grid max-w-md grid-cols-1 gap-8 md:max-w-4xl md:grid-cols-2 lg:max-w-7xl lg:grid-cols-4 xl:mx-0 xl:max-w-none">
          {tiers.map((tier) => {
            const state = getTierState(tier);
            const disabled = isTierDisabled(state);
            return (
              <div
                key={tier.id}
                className={classNames(
                  state === "current"
                    ? "ring-2 ring-green-500 shadow-2xl"
                    : tier.mostPopular && !disabled
                      ? "ring-2 ring-accent shadow-2xl"
                      : "ring-1 ring-gray-200 dark:ring-zinc-700/80 shadow-2xl dark:shadow-black/40",
                  !disabled ? "hover:ring-2 hover:ring-accent group" : "",
                  "rounded-3xl p-8 transition-all duration-200 bg-white dark:bg-zinc-900",
                )}
              >
                {state === "current" && (
                  <span className="mb-4 inline-flex items-center rounded-full bg-green-100 dark:bg-green-900/40 px-3 py-1 text-xs font-semibold text-green-700 dark:text-green-400">
                    Current Plan
                  </span>
                )}
                <h3
                  id={tier.id}
                  className={classNames(
                    state === "current"
                      ? "text-green-700 dark:text-green-400"
                      : tier.mostPopular
                        ? "text-primary dark:text-zinc-100"
                        : "text-gray-900 dark:text-zinc-100",
                    "text-2xl/8 font-semibold",
                  )}
                >
                  {tier.name}
                </h3>
                <p className="mt-6 flex items-baseline gap-x-1">
                  <span className="text-4xl font-semibold tracking-tight text-gray-900 dark:text-zinc-100">
                    {tier.price[frequency]}
                  </span>
                  <span className="text-sm/6 font-semibold text-gray-600 dark:text-gray-400">
                    {
                      frequencies.find((f) => f.value === frequency)
                        ?.priceSuffix
                    }
                  </span>
                </p>
                <button
                  value={`${tier.id}${frequency === "monthly" ? "" : "_year"}`}
                  aria-describedby={tier.id}
                  disabled={disabled}
                  onClick={disabled ? undefined : handleClick}
                  className={classNames(
                    disabled
                      ? state === "current"
                        ? "bg-green-600 text-white cursor-default font-bold"
                        : "bg-gray-200 dark:bg-zinc-700 text-gray-400 dark:text-zinc-500 cursor-default"
                      : state === "downgrade"
                        ? "text-primary dark:text-white ring-1 ring-inset ring-gray-300 dark:ring-zinc-600 group-hover:bg-primary group-hover:text-white group-hover:ring-0"
                        : tier.mostPopular
                          ? "bg-accent text-primary shadow-sm group-hover:bg-primary group-hover:text-white"
                          : "text-primary dark:text-white ring-1 ring-inset ring-accent group-hover:bg-primary group-hover:text-white group-hover:ring-0",
                    "transition-all duration-200 w-full mt-6 block rounded-md px-3 py-2 text-center text-sm/6 font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-600",
                  )}
                >
                  {loading ? "Processing..." : getButtonText(state, tier.name)}
                </button>
                {state === "downgrade" && (
                  <p className="mt-2 text-xs text-center text-amber-600 dark:text-amber-400">
                    Takes effect at end of billing period
                  </p>
                )}
                <p className="mt-8 font-bold text-sm/6 text-gray-600 dark:text-zinc-200">
                  {tier.description}
                </p>
                <ul
                  role="list"
                  className="mt-2 space-y-3 text-sm/6 text-gray-600 dark:text-zinc-300"
                >
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex gap-x-3">
                      {isVerifiedFeature(feature) ? (
                        <CheckBadgeIcon
                          aria-hidden="true"
                          className="h-6 w-5 flex-none text-[#1d9bf0]"
                        />
                      ) : (
                        <CheckIcon
                          aria-hidden="true"
                          className="h-6 w-5 flex-none text-primary"
                        />
                      )}
                      <span className="inline-flex items-center flex-wrap gap-y-1">
                        {isVerifiedFeature(feature) ? (
                          <span className="font-semibold text-[#1d9bf0]">{feature}</span>
                        ) : (
                          feature
                        )}
                        {isCampaignFeature(feature) && (
                          <Crown
                            size={15}
                            fill="currentColor"
                            className="ml-2 inline-block shrink-0 text-[#e0a92e]"
                            aria-label="Featured"
                          />
                        )}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
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
                  width: "calc(50% - 4px)",
                  transform:
                    frequency === "monthly"
                      ? "translateX(0)"
                      : "translateX(100%)",
                }}
              />
              {frequencies.map((option) => (
                <Radio
                  key={option.value}
                  value={option.value}
                  className="relative z-10 cursor-pointer rounded-full px-3 py-2
                             transition-colors duration-300
                             text-gray-600 dark:text-white
                             data-[checked]:text-white"
                >
                  {option.label}
                </Radio>
              ))}
            </RadioGroup>
          </fieldset>
        </div>
      </div>
    </div>
  );
}
