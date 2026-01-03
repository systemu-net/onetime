import { CheckIcon } from '@heroicons/react/20/solid';
import { HiLightningBolt } from 'react-icons/hi';
import { LiaLinkSolid } from 'react-icons/lia';
import { MdPhoneIphone } from 'react-icons/md';
import { RiQrCodeLine, RiShieldCheckLine } from 'react-icons/ri';
import { SiPagespeedinsights } from 'react-icons/si';

type FeatureItem = {
  text: string;
  badge?: 'business' | 'coming-soon';
};

type Feature = {
  name: string;
  description: string;
  icon: JSX.Element;
  features: (string | FeatureItem)[];
};

const features: Feature[] = [
  {
    name: 'Smart Link Management',
    description: 'Create, customize, and track your shortened links with powerful analytics',
    icon: <LiaLinkSolid size={30} className="text-white" />,
    features: [
      { text: 'Custom short URLs with your brand', badge: 'business' },
      { text: 'Bulk link creation and management', badge: 'business' },
      'Real-time click tracking and analytics',
      'City-level geographic data',
      'Device type detection (mobile, desktop, tablet)',
      { text: 'Post-click behavior tracking', badge: 'coming-soon' },
      { text: 'Link expiration and scheduling', badge: 'business' },
      'Google Safe Browsing protection',
    ],
  },
  {
    name: 'QR Code Generator',
    description: 'Generate dynamic QR codes for multiple use cases with full customization',
    icon: <RiQrCodeLine size={30} className="text-white" />,
    features: [
      { text: 'Multiple QR code types (URLs, vCards, WiFi)', badge: 'coming-soon' },
      { text: 'Customizable design and colors', badge: 'coming-soon' },
      { text: 'High-resolution downloads', badge: 'coming-soon' },
      'Scan analytics and tracking',
      { text: 'Dynamic QR codes (update destination without reprinting)', badge: 'business' },
      { text: 'Bulk QR code generation', badge: 'business' },
      'Location-based scan data',
      { text: 'Print-ready formats', badge: 'coming-soon' },
    ],
  },
  {
    name: 'Brand Pages',
    description: 'Create beautiful landing pages to showcase your links and content',
    icon: <MdPhoneIphone size={30} className="text-white" />,
    features: [
      'Drag-and-drop resource management',
      'Custom page design and layouts',
      { text: 'Add links, QR codes, and images', badge: 'coming-soon' },
      { text: 'SEO-optimized pages', badge: 'coming-soon' },
      'Mobile-responsive design',
      { text: 'Custom domain support', badge: 'business' },
      { text: 'Page analytics and visitor tracking', badge: 'coming-soon' },
      { text: 'Social media integration', badge: 'coming-soon' },
    ],
  },
  {
    name: 'Advanced Analytics',
    description: 'Deep insights into your audience behavior and engagement',
    icon: <SiPagespeedinsights size={30} className="text-white" />,
    features: [
      'Real-time traffic monitoring',
      'Geographic heat maps',
      'Referrer source tracking',
      'Time-based analytics',
      { text: 'Conversion tracking', badge: 'coming-soon' },
      { text: 'Custom date range reports', badge: 'coming-soon' },
      { text: 'Data export capabilities', badge: 'business' },
      { text: 'API access for custom integrations', badge: 'business' },
    ],
  },
  {
    name: 'API & Integrations',
    description: 'Powerful REST API for seamless integration with your workflow',
    icon: <HiLightningBolt size={30} className="text-white" />,
    features: [
      { text: 'Full CRUD operations for all resources', badge: 'coming-soon' },
      { text: 'JWT authentication', badge: 'coming-soon' },
      { text: 'Webhook support', badge: 'coming-soon' },
      { text: 'Batch operations', badge: 'coming-soon' },
      { text: 'Rate limiting protection', badge: 'coming-soon' },
      { text: 'Comprehensive documentation', badge: 'coming-soon' },
      { text: 'SDK support (coming soon)', badge: 'coming-soon' },
      { text: 'Third-party integrations', badge: 'coming-soon' },
    ],
  },
  {
    name: 'Security & Privacy',
    description: 'Enterprise-grade security to protect your data and your users',
    icon: <RiShieldCheckLine size={30} className="text-white" />,
    features: [
      'Google Safe Browsing API integration',
      'Malicious URL detection',
      'GDPR compliant',
      { text: 'Data encryption at rest and in transit', badge: 'coming-soon' },
      { text: 'Regular security audits', badge: 'coming-soon' },
      { text: 'Two-factor authentication', badge: 'coming-soon' },
      { text: 'Role-based access control', badge: 'coming-soon' },
      'Privacy-first analytics',
    ],
  },
];

export default function Features() {
  return (
    <div className="bg-white dark:bg-zinc-900 py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        {/* Header */}
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-base font-semibold leading-7 text-indigo-600 dark:text-indigo-400">Everything you need</h2>
          <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 dark:text-zinc-100 sm:text-4xl">
            Powerful Features for Modern Link Management
          </p>
          <p className="mt-6 text-lg leading-8 text-gray-600 dark:text-gray-400">
            From simple link shortening to comprehensive brand pages, thin.ly provides all the tools you need to manage your online presence effectively.
          </p>
        </div>

        {/* Features Grid */}
        <div className="mx-auto mt-16 max-w-7xl">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
            {features.map((feature) => (
              <div
                key={feature.name}
                className="relative rounded-2xl border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 p-8 shadow-sm transition-shadow hover:shadow-md"
              >
                {/* Icon and Title */}
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-indigo-600 dark:bg-indigo-500 text-2xl">
                    {feature.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold leading-7 text-gray-900 dark:text-zinc-100">
                      {feature.name}
                    </h3>
                    <p className="mt-2 text-sm leading-6 text-gray-600 dark:text-gray-400">
                      {feature.description}
                    </p>
                  </div>
                </div>

                {/* Features List */}
                <ul className="mt-6 space-y-3">
                  {feature.features.map((item, index) => {
                    const isString = typeof item === 'string';
                    const text = isString ? item : item.text;
                    const badge = isString ? null : item.badge;
                    
                    return (
                      <li key={index} className="flex gap-x-3">
                        <CheckIcon className="h-6 w-5 flex-none text-indigo-600 dark:text-indigo-400" aria-hidden="true" />
                        <span className="flex items-center gap-2 text-sm leading-6 text-gray-600 dark:text-gray-400">
                          {text}
                          {badge === 'business' && (
                            <span className="inline-flex items-center rounded-full bg-purple-100 dark:bg-purple-900 px-2 py-0.5 text-xs font-medium text-purple-700 dark:text-purple-300">
                              Business
                            </span>
                          )}
                          {badge === 'coming-soon' && (
                            <span className="inline-flex items-center rounded-full bg-blue-100 dark:bg-blue-900 px-2 py-0.5 text-xs font-medium text-blue-700 dark:text-blue-300">
                              Coming Soon
                            </span>
                          )}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Call to Action */}
        <div className="mx-auto mt-20 max-w-2xl text-center">
          <h3 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-zinc-100">
            Ready to get started?
          </h3>
          <p className="mt-4 text-lg leading-8 text-gray-600 dark:text-gray-400">
            Start using thin.ly today and experience the power of modern link management.
          </p>
          <div className="mt-8 flex items-center justify-center gap-x-6">
            <a
              href="/register"
              className="rounded-md bg-indigo-600 dark:bg-indigo-500 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 dark:hover:bg-indigo-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            >
              Sign up for free
            </a>
            <a
              href="/plans"
              className="text-sm font-semibold leading-6 text-gray-900 dark:text-zinc-100"
            >
              View plans <span aria-hidden="true">→</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
