import { LiaLinkSolid } from 'react-icons/lia';
import { MdPhoneIphone } from 'react-icons/md';
import { RiQrCodeLine } from 'react-icons/ri';

export default function Resources() {
  return (
    <div className="bg-white py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        {/* Header */}
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-base font-semibold leading-7 text-indigo-600">Developer Resources</h2>
          <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Resources API
          </p>
          <div className="mt-3">
            <span className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-700">
              Coming Soon
            </span>
          </div>
          <p className="mt-6 text-lg leading-8 text-gray-600">
            Our powerful Resources API allows you to manage all your content programmatically with full CRUD operations and drag-and-drop reordering support.
          </p>
        </div>

        {/* Resource Types Grid */}
        <div className="mx-auto mt-16 grid max-w-5xl grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm transition-shadow hover:shadow-md">
            <div className="mb-4 text-indigo-600">
              <LiaLinkSolid size={40} />
            </div>
            <h3 className="text-xl font-semibold text-gray-900">Link Resources</h3>
            <p className="mt-3 text-sm leading-6 text-gray-600">
              Create and manage shortened links with full analytics tracking and custom titles. Perfect for marketing campaigns and social media sharing.
            </p>
            <ul className="mt-6 space-y-2">
              <li className="flex gap-x-2 text-sm text-gray-600">
                <span className="text-indigo-600">•</span>
                Custom short URLs
              </li>
              <li className="flex gap-x-2 text-sm text-gray-600">
                <span className="text-indigo-600">•</span>
                Click analytics
              </li>
              <li className="flex gap-x-2 text-sm text-gray-600">
                <span className="text-indigo-600">•</span>
                Geographic tracking
              </li>
              <li className="flex gap-x-2 text-sm text-gray-600">
                <span className="text-indigo-600">•</span>
                Device detection
              </li>
            </ul>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm transition-shadow hover:shadow-md">
            <div className="mb-4 text-indigo-600">
              <RiQrCodeLine size={40} />
            </div>
            <h3 className="text-xl font-semibold text-gray-900">QR Code Resources</h3>
            <p className="mt-3 text-sm leading-6 text-gray-600">
              Generate and track QR codes for vCards, WiFi credentials, URLs, and more. Ideal for contactless interactions and event management.
            </p>
            <ul className="mt-6 space-y-2">
              <li className="flex gap-x-2 text-sm text-gray-600">
                <span className="text-indigo-600">•</span>
                Multiple QR types
              </li>
              <li className="flex gap-x-2 text-sm text-gray-600">
                <span className="text-indigo-600">•</span>
                Scan analytics
              </li>
              <li className="flex gap-x-2 text-sm text-gray-600">
                <span className="text-indigo-600">•</span>
                Location tracking
              </li>
              <li className="flex gap-x-2 text-sm text-gray-600">
                <span className="text-indigo-600">•</span>
                Dynamic updates
              </li>
            </ul>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm transition-shadow hover:shadow-md">
            <div className="mb-4 text-indigo-600">
              <MdPhoneIphone size={40} />
            </div>
            <h3 className="text-xl font-semibold text-gray-900">Page Resources</h3>
            <p className="mt-3 text-sm leading-6 text-gray-600">
              Create and manage custom brand pages (bio link pages) with drag-and-drop functionality. Build beautiful landing pages that showcase your content.
            </p>
            <ul className="mt-6 space-y-2">
              <li className="flex gap-x-2 text-sm text-gray-600">
                <span className="text-indigo-600">•</span>
                Custom page templates
              </li>
              <li className="flex gap-x-2 text-sm text-gray-600">
                <span className="text-indigo-600">•</span>
                Drag-and-drop ordering
              </li>
              <li className="flex gap-x-2 text-sm text-gray-600">
                <span className="text-indigo-600">•</span>
                Link multiple resources
              </li>
              <li className="flex gap-x-2 text-sm text-gray-600">
                <span className="text-indigo-600">•</span>
                Page analytics
              </li>
            </ul>
          </div>
        </div>

        {/* API Features Section */}
        <div className="mx-auto mt-20 max-w-7xl">
          <div className="rounded-3xl bg-gradient-to-r from-indigo-50 to-purple-50 p-8 lg:p-12">
            <div className="mx-auto max-w-3xl text-center">
              <h3 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
                Powerful API Capabilities
              </h3>
              <p className="mt-4 text-lg leading-8 text-gray-600">
                Integrate thin.ly into your workflow with our comprehensive REST API
              </p>
            </div>

            <div className="mx-auto mt-12 grid max-w-5xl grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <div className="flex flex-col items-center text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-indigo-600 text-white">
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
                  </svg>
                </div>
                <h4 className="mt-4 text-sm font-semibold text-gray-900">Full CRUD Operations</h4>
                <p className="mt-2 text-sm text-gray-600">
                  Create, read, update, and delete all resource types
                </p>
                <span className="mt-2 inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">
                  Coming Soon
                </span>
              </div>

              <div className="flex flex-col items-center text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-indigo-600 text-white">
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 7.5L7.5 3m0 0L12 7.5M7.5 3v13.5m13.5 0L16.5 21m0 0L12 16.5m4.5 4.5V7.5" />
                  </svg>
                </div>
                <h4 className="mt-4 text-sm font-semibold text-gray-900">Drag & Drop Reordering</h4>
                <p className="mt-2 text-sm text-gray-600">
                  Batch update sort orders with a single API call
                </p>
                <span className="mt-2 inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">
                  Coming Soon
                </span>
              </div>

              <div className="flex flex-col items-center text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-indigo-600 text-white">
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                  </svg>
                </div>
                <h4 className="mt-4 text-sm font-semibold text-gray-900">JWT Authentication</h4>
                <p className="mt-2 text-sm text-gray-600">
                  Secure API access with token-based authentication
                </p>
                <span className="mt-2 inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">
                  Coming Soon
                </span>
              </div>

              <div className="flex flex-col items-center text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-indigo-600 text-white">
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                  </svg>
                </div>
                <h4 className="mt-4 text-sm font-semibold text-gray-900">Comprehensive Docs</h4>
                <p className="mt-2 text-sm text-gray-600">
                  Detailed API documentation with examples
                </p>
                <span className="mt-2 inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">
                  Coming Soon
                </span>
              </div>

              <div className="flex flex-col items-center text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-indigo-600 text-white">
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
                  </svg>
                </div>
                <h4 className="mt-4 text-sm font-semibold text-gray-900">Rate Limiting</h4>
                <p className="mt-2 text-sm text-gray-600">
                  Intelligent rate limiting to protect your resources
                </p>
                <span className="mt-2 inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">
                  Coming Soon
                </span>
              </div>

              <div className="flex flex-col items-center text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-indigo-600 text-white">
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14.25 9.75L16.5 12l-2.25 2.25m-4.5 0L7.5 12l2.25-2.25M6 20.25h12A2.25 2.25 0 0020.25 18V6A2.25 2.25 0 0018 3.75H6A2.25 2.25 0 003.75 6v12A2.25 2.25 0 006 20.25z" />
                  </svg>
                </div>
                <h4 className="mt-4 text-sm font-semibold text-gray-900">Webhooks</h4>
                <p className="mt-2 text-sm text-gray-600">
                  Real-time event notifications
                </p>
                <span className="mt-2 inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">
                  Coming Soon
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Code Example Section */}
        <div className="mx-auto mt-20 max-w-5xl relative">
          <div className="text-center mb-10">
            <h3 className="text-2xl font-bold tracking-tight text-gray-900">
              Quick Start Example
            </h3>
            <p className="mt-4 text-lg text-gray-600">
              Get started with the Resources API in minutes
            </p>
          </div>
          
          <div className="relative rounded-xl bg-gray-900 p-6 shadow-xl">
            {/* Overlay */}
            <div className="absolute inset-0 bg-gray-900/80 backdrop-blur-sm rounded-xl flex items-center justify-center z-10">
              <div className="text-center px-6">
                <span className="inline-flex items-center rounded-full bg-blue-100 px-4 py-2 text-sm font-medium text-blue-700 shadow-lg">
                  Coming Soon
                </span>
                <p className="mt-4 text-white text-sm">
                  API examples will be available soon
                </p>
              </div>
            </div>
            
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-gray-400">Example API Request</span>
              <span className="text-xs text-gray-500">JavaScript</span>
            </div>
            <pre className="text-sm text-gray-300 overflow-x-auto">
              <code>{`// List all resources for a brand page
const response = await fetch(
  'https://api.thin.ly/api/v1/brand_pages/abc123/resources',
  {
    headers: {
      'Authorization': 'Bearer YOUR_JWT_TOKEN',
      'Content-Type': 'application/json'
    }
  }
);

const data = await response.json();
console.log(data.resources);`}</code>
            </pre>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mx-auto mt-20 max-w-2xl text-center relative">
          {/* Overlay */}
          <div className="absolute inset-0 bg-white/70 backdrop-blur-sm rounded-2xl flex items-center justify-center z-10">
            <div className="text-center px-6">
              <span className="inline-flex items-center rounded-full bg-blue-100 px-4 py-2 text-sm font-medium text-blue-700 shadow-lg">
                Coming Soon
              </span>
              <p className="mt-4 text-gray-700 text-sm font-medium">
                API integration will be available soon
              </p>
            </div>
          </div>
          
          <h3 className="text-2xl font-bold tracking-tight text-gray-900">
            Ready to integrate?
          </h3>
          <p className="mt-4 text-lg leading-8 text-gray-600">
            Explore our comprehensive API documentation to get started
          </p>
          <div className="mt-8 flex items-center justify-center gap-x-6">
            <a
              href="https://github.com/systemu-net"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-md bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            >
              View API Documentation
            </a>
            <a
              href="/register"
              className="text-sm font-semibold leading-6 text-gray-900"
            >
              Get API Access <span aria-hidden="true">→</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
